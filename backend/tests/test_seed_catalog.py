"""Etap 3: Seed catalog data tests."""

from app.providers.seeds import SEED_MATERIALS, SEED_MODULES, SEED_TEMPLATES

# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

def test_seed_materials_count() -> None:
    assert len(SEED_MATERIALS) == 8


def test_each_material_has_required_fields() -> None:
    for m in SEED_MATERIALS:
        assert m.id
        assert m.code
        assert m.name
        assert m.color
        assert m.thicknessMmDefault > 0
        assert m.category


def test_material_ids_are_unique() -> None:
    ids = [m.id for m in SEED_MATERIALS]
    assert len(ids) == len(set(ids))


def test_material_by_id_via_api(client) -> None:
    response = client.get("/api/v1/materials/mat-ldsp-white-16")

    assert response.status_code == 200
    body = response.json()
    assert body["item"]["id"] == "mat-ldsp-white-16"
    assert body["item"]["name"] == "ЛДСП Белый 16мм"
    assert body["item"]["thicknessMmDefault"] == 16
    assert body["traceId"]


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------

def test_seed_templates_count() -> None:
    assert len(SEED_TEMPLATES) == 4


def test_all_templates_are_project_template_category() -> None:
    for t in SEED_TEMPLATES:
        assert t.category == "project_template"


def test_each_template_has_valid_tree_structure() -> None:
    for t in SEED_TEMPLATES:
        tree = t.rootItemTreeDto
        assert "id" in tree
        assert "type" in tree
        assert "children" in tree
        assert tree["type"] == "assembly"
        assert len(tree["children"]) > 0


def test_template_by_id_via_api(client) -> None:
    response = client.get("/api/v1/templates/tpl-wardrobe")

    assert response.status_code == 200
    body = response.json()
    assert body["item"]["id"] == "tpl-wardrobe"
    assert body["item"]["name"] == "Шкаф"
    assert body["traceId"]


def test_template_ids_are_unique() -> None:
    ids = [t.id for t in SEED_TEMPLATES]
    assert len(ids) == len(set(ids))


# ---------------------------------------------------------------------------
# Modules and parts
# ---------------------------------------------------------------------------

def test_seed_modules_count() -> None:
    assert len(SEED_MODULES) == 10  # 4 modules + 6 parts


def test_all_modules_have_module_category() -> None:
    for m in SEED_MODULES:
        assert m.category == "module"


def test_modules_vs_parts_split() -> None:
    modules = [m for m in SEED_MODULES if "part" not in m.tags]
    parts = [m for m in SEED_MODULES if "part" in m.tags]
    assert len(modules) == 4
    assert len(parts) == 6


def test_each_module_has_valid_tree_structure() -> None:
    for m in SEED_MODULES:
        tree = m.rootItemTreeDto
        assert "id" in tree
        assert "type" in tree
        assert "dimensions" in tree


def test_module_ids_are_unique() -> None:
    ids = [m.id for m in SEED_MODULES]
    assert len(ids) == len(set(ids))


# ---------------------------------------------------------------------------
# Cross-catalog consistency
# ---------------------------------------------------------------------------

def _collect_material_ids_from_tree(node: dict) -> set[str]:
    """Recursively collect all materialId values from a rootItemTreeDto."""
    ids: set[str] = set()
    mid = node.get("materialId")
    if mid:
        ids.add(mid)
    for child in node.get("children", []):
        ids.update(_collect_material_ids_from_tree(child))
    return ids


def test_material_ids_in_templates_exist_in_catalog() -> None:
    catalog_ids = {m.id for m in SEED_MATERIALS}
    for t in SEED_TEMPLATES:
        referenced = _collect_material_ids_from_tree(t.rootItemTreeDto)
        missing = referenced - catalog_ids
        assert not missing, f"Template '{t.id}' references unknown materials: {missing}"


def test_material_ids_in_modules_exist_in_catalog() -> None:
    catalog_ids = {m.id for m in SEED_MATERIALS}
    for m in SEED_MODULES:
        referenced = _collect_material_ids_from_tree(m.rootItemTreeDto)
        missing = referenced - catalog_ids
        assert not missing, f"Module '{m.id}' references unknown materials: {missing}"
