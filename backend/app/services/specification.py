"""Specification generation: aggregate items into cut-list rows."""

from collections import Counter

from app.schemas.api import SpecificationRow
from app.schemas.domain import ItemType, Material, Project


def generate_spec_rows(project: Project) -> list[SpecificationRow]:
    material_map: dict[str, Material] = {m.id: m for m in project.materials}

    # Aggregation key -> count
    counter: Counter[tuple[str, ...]] = Counter()
    # Aggregation key -> row data (without quantity)
    row_data: dict[tuple[str, ...], dict[str, object]] = {}

    for item in project.items:
        # Exclude assemblies from physical spec
        if item.type == ItemType.ASSEMBLY:
            continue

        mat = material_map.get(item.materialId) if item.materialId else None
        effective_grain = item.grainDirection or (mat.grainDirection if mat else None)

        key = (
            item.type.value,
            item.subtype,
            item.materialId or "",
            str(item.dimensions.widthMm),
            str(item.dimensions.heightMm),
            str(item.dimensions.depthMm),
            str(item.dimensions.thicknessMm),
            effective_grain or "",
        )

        counter[key] += 1

        if key not in row_data:
            row_data[key] = {
                "type": item.type.value,
                "subtype": item.subtype,
                "materialCode": mat.code if mat else "",
                "materialName": mat.name if mat else "",
                "widthMm": item.dimensions.widthMm,
                "heightMm": item.dimensions.heightMm,
                "depthMm": item.dimensions.depthMm,
                "thicknessMm": item.dimensions.thicknessMm,
                "grainDirection": effective_grain,
            }

    rows: list[SpecificationRow] = []
    for key, count in counter.items():
        data = row_data[key]
        rows.append(SpecificationRow(
            type=str(data["type"]),
            subtype=str(data["subtype"]),
            materialCode=str(data["materialCode"]),
            materialName=str(data["materialName"]),
            widthMm=float(data["widthMm"]),
            heightMm=float(data["heightMm"]),
            depthMm=float(data["depthMm"]),
            thicknessMm=float(data["thicknessMm"]),
            grainDirection=data["grainDirection"] if data["grainDirection"] else None,
            quantity=count,
        ))

    # Sort: materialName, type, widthMm, heightMm, depthMm
    rows.sort(key=lambda r: (r.materialName, r.type, r.widthMm, r.heightMm, r.depthMm))
    return rows
