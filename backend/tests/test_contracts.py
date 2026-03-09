from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from app.constants import PROJECT_SCHEMA_VERSION, PROJECT_UNIT
from app.schemas.api import ApiErrorResponse, ExportProjectRequest, ValidateProjectResponse
from app.schemas.domain import (
    Dimensions,
    ExportFormat,
    ExportJob,
    ExportJobStatus,
    Item,
    ItemType,
    Material,
    Metadata,
    Project,
    Room,
    Template,
    TemplateCategory,
    Transform,
    ValidationCode,
    ValidationIssue,
    ValidationSeverity,
)


def build_project() -> Project:
    now = datetime(2026, 3, 9, tzinfo=UTC)
    material = Material(
        id="mat-1",
        code="LDP-WHITE-16",
        name="White laminate",
        color="#ffffff",
        textureUrl="/textures/white.jpg",
        thicknessMmDefault=16,
        grainDirection="x",
        category="laminate",
    )
    item = Item(
        id="item-1",
        type=ItemType.PANEL,
        subtype="custom_panel",
        name="Panel",
        dimensions=Dimensions(widthMm=600, heightMm=720, depthMm=16, thicknessMm=16),
        transform=Transform(xMm=0, yMm=0, zMm=0, rotationYDeg=0),
        materialId=material.id,
    )
    return Project(
        id="project-1",
        name="Demo project",
        room=Room(widthMm=3000, lengthMm=3000, heightMm=2700),
        items=[item],
        materials=[material],
        metadata=Metadata(createdAt=now, updatedAt=now),
    )


def test_project_serialization_roundtrip() -> None:
    project = build_project()

    dumped = project.model_dump(mode="json")
    restored = Project.model_validate(dumped)

    assert restored == project
    assert dumped["version"] == PROJECT_SCHEMA_VERSION
    assert dumped["unit"] == PROJECT_UNIT


def test_required_project_fields_are_enforced() -> None:
    with pytest.raises(ValidationError):
        Project.model_validate(
            {
                "id": "project-1",
                "name": "Broken project",
                "items": [],
                "materials": [],
                "metadata": {
                    "createdAt": "2026-03-09T00:00:00Z",
                    "updatedAt": "2026-03-09T00:00:00Z",
                },
            }
        )


def test_item_type_and_rotation_values_are_strict() -> None:
    with pytest.raises(ValidationError):
        Item.model_validate(
            {
                "id": "bad-item",
                "type": "chair",
                "subtype": "invalid",
                "name": "Invalid",
                "dimensions": {
                    "widthMm": 1,
                    "heightMm": 1,
                    "depthMm": 1,
                    "thicknessMm": 1,
                },
                "transform": {"xMm": 0, "yMm": 0, "zMm": 0, "rotationYDeg": 45},
            }
        )


def test_project_version_is_fixed_to_1_0() -> None:
    project = build_project()
    payload = project.model_dump(mode="json")
    payload["version"] = "2.0"

    with pytest.raises(ValidationError):
        Project.model_validate(payload)


def test_api_error_contract_shape() -> None:
    response = ApiErrorResponse(code="TEST", message="Oops", traceId="trace-1")

    assert response.model_dump() == {
        "code": "TEST",
        "message": "Oops",
        "traceId": "trace-1",
        "details": None,
    }


def test_validate_and_export_dtos_accept_domain_models() -> None:
    project = build_project()
    issue = ValidationIssue(
        id="issue-1",
        severity=ValidationSeverity.ERROR,
        code=ValidationCode.INVALID_DIMENSIONS,
        message="Invalid dimensions.",
        itemIds=["item-1"],
    )
    export_job = ExportJob(
        id="job-1",
        format=ExportFormat.PROJECT_JSON,
        status=ExportJobStatus.PENDING,
        createdAt=datetime(2026, 3, 9, tzinfo=UTC),
        expiresAt=datetime(2026, 3, 9, 0, 15, tzinfo=UTC),
        traceId="trace-1",
    )
    template = Template(
        id="template-1",
        code="wardrobe",
        name="Wardrobe",
        category=TemplateCategory.PROJECT_TEMPLATE,
        rootItemTreeDto={"id": "root"},
        defaultDimensions=Dimensions(widthMm=1200, heightMm=2200, depthMm=600, thicknessMm=16),
    )

    validate_response = ValidateProjectResponse(ok=False, issues=[issue], traceId="trace-1")
    export_request = ExportProjectRequest(
        project=project,
        formats=[ExportFormat.PROJECT_JSON, ExportFormat.SCENE_GLB],
    )

    assert validate_response.issues[0].code == ValidationCode.INVALID_DIMENSIONS
    assert export_request.formats == [ExportFormat.PROJECT_JSON, ExportFormat.SCENE_GLB]
    assert template.category == TemplateCategory.PROJECT_TEMPLATE
    assert export_job.status == ExportJobStatus.PENDING
