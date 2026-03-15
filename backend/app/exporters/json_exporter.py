"""JSON project exporter: canonical model without field loss."""

from app.schemas.domain import Project


def export_json(project: Project) -> str:
    """Export project to JSON string."""
    return project.model_dump_json(indent=2)
