"""CSV specification exporter: semicolon separator, UTF-8 BOM."""

import csv
import io

from app.schemas.api import SpecificationRow

CSV_COLUMNS = [
    "type", "subtype", "materialCode", "materialName",
    "widthMm", "heightMm", "depthMm", "thicknessMm",
    "grainDirection", "quantity",
]


def export_csv(rows: list[SpecificationRow]) -> str:
    """Export specification rows to CSV string with BOM and semicolon separator."""
    buf = io.StringIO()
    buf.write("\ufeff")  # UTF-8 BOM

    writer = csv.writer(buf, delimiter=";", lineterminator="\n")
    writer.writerow(CSV_COLUMNS)

    for row in rows:
        writer.writerow([
            row.type,
            row.subtype,
            row.materialCode,
            row.materialName,
            row.widthMm,
            row.heightMm,
            row.depthMm,
            row.thicknessMm,
            row.grainDirection or "",
            row.quantity,
        ])

    return buf.getvalue()
