"""Tests for specification generation and CSV/JSON export."""

from datetime import UTC, datetime

from app.exporters.csv_exporter import export_csv
from app.exporters.json_exporter import export_json
from app.schemas.domain import (
    Dimensions,
    Item,
    ItemType,
    Material,
    Metadata,
    Project,
    Room,
    Transform,
)
from app.services.specification import generate_spec_rows


def _mat(id: str = "mat-1", code: str = "M1", name: str = "Mat 1") -> Material:
    return Material(
        id=id, code=code, name=name, color="#fff",
        thicknessMmDefault=16, grainDirection="none", category="laminate",
    )


def _item(
    id: str = "item-1",
    type: str = "panel",
    material_id: str | None = "mat-1",
    w: float = 600,
    h: float = 720,
    d: float = 16,
    t: float = 16,
    grain: str | None = None,
) -> Item:
    return Item(
        id=id, type=ItemType(type), subtype="test", name=id,
        dimensions=Dimensions(widthMm=w, heightMm=h, depthMm=d, thicknessMm=t),
        transform=Transform(xMm=0, yMm=0, zMm=0, rotationYDeg=0),
        materialId=material_id, grainDirection=grain,
    )


def _project(items: list[Item] | None = None, materials: list[Material] | None = None) -> Project:
    now = datetime(2026, 3, 15, tzinfo=UTC)
    return Project(
        id="p", name="Test",
        room=Room(widthMm=3000, lengthMm=3000, heightMm=2700),
        items=items or [], materials=materials or [],
        metadata=Metadata(createdAt=now, updatedAt=now),
    )


def test_empty_project_returns_empty_rows() -> None:
    assert generate_spec_rows(_project()) == []


def test_assembly_excluded() -> None:
    items = [_item(id="asm", type="assembly")]
    assert generate_spec_rows(_project(items)) == []


def test_single_panel() -> None:
    rows = generate_spec_rows(_project([_item()], [_mat()]))
    assert len(rows) == 1
    assert rows[0].quantity == 1
    assert rows[0].materialCode == "M1"


def test_two_identical_panels_aggregate() -> None:
    items = [_item(id="a"), _item(id="b")]
    rows = generate_spec_rows(_project(items, [_mat()]))
    assert len(rows) == 1
    assert rows[0].quantity == 2


def test_different_dimensions_separate_rows() -> None:
    items = [_item(id="a", w=600), _item(id="b", w=800)]
    rows = generate_spec_rows(_project(items, [_mat()]))
    assert len(rows) == 2


def test_grain_direction_item_overrides_material() -> None:
    items = [_item(grain="lengthwise")]
    mats = [_mat()]
    rows = generate_spec_rows(_project(items, mats))
    assert rows[0].grainDirection == "lengthwise"


def test_grain_direction_falls_back_to_material() -> None:
    items = [_item(grain=None)]
    mats = [Material(id="mat-1", code="M1", name="M1", color="#fff",
                     thicknessMmDefault=16, grainDirection="crosswise", category="x")]
    rows = generate_spec_rows(_project(items, mats))
    assert rows[0].grainDirection == "crosswise"


def test_no_material_id_gets_empty_strings() -> None:
    items = [_item(material_id=None)]
    rows = generate_spec_rows(_project(items))
    assert rows[0].materialCode == ""
    assert rows[0].materialName == ""


def test_sort_by_material_name_then_type() -> None:
    mats = [_mat("m1", "A", "Zebra"), _mat("m2", "B", "Alpha")]
    items = [_item(id="a", material_id="m1"), _item(id="b", material_id="m2")]
    rows = generate_spec_rows(_project(items, mats))
    assert rows[0].materialName == "Alpha"
    assert rows[1].materialName == "Zebra"


# CSV tests

def test_csv_has_bom() -> None:
    csv = export_csv([])
    assert csv.startswith("\ufeff")


def test_csv_uses_semicolon() -> None:
    csv = export_csv([])
    assert ";" in csv


def test_csv_headers() -> None:
    csv = export_csv([])
    first_line = csv.split("\n")[0].replace("\ufeff", "")
    expected = (
        "type;subtype;materialCode;materialName;"
        "widthMm;heightMm;depthMm;thicknessMm;grainDirection;quantity"
    )
    assert first_line == expected


def test_csv_with_rows() -> None:
    rows = generate_spec_rows(_project([_item()], [_mat()]))
    csv = export_csv(rows)
    lines = csv.strip().split("\n")
    assert len(lines) == 2  # header + 1 data row


# JSON export tests

def test_json_roundtrip() -> None:
    project = _project([_item()], [_mat()])
    json_str = export_json(project)
    restored = Project.model_validate_json(json_str)
    assert restored.id == project.id
    assert len(restored.items) == 1
