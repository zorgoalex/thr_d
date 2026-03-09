from datetime import datetime
from enum import StrEnum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import ALLOWED_ROTATION_Y_DEGREES, PROJECT_SCHEMA_VERSION, PROJECT_UNIT


class ProjectUnit(StrEnum):
    MM = PROJECT_UNIT


class ItemType(StrEnum):
    ASSEMBLY = "assembly"
    PART = "part"
    PANEL = "panel"
    SHELF = "shelf"
    DOOR = "door"
    DRAWER_BLOCK = "drawerBlock"


class ValidationSeverity(StrEnum):
    WARNING = "warning"
    ERROR = "error"


class ValidationCode(StrEnum):
    ROOM_BOUNDS_EXCEEDED = "ROOM_BOUNDS_EXCEEDED"
    ITEM_INTERSECTION = "ITEM_INTERSECTION"
    INVALID_DIMENSIONS = "INVALID_DIMENSIONS"
    INVALID_THICKNESS = "INVALID_THICKNESS"
    OUT_OF_ALLOWED_WORLD_RANGE = "OUT_OF_ALLOWED_WORLD_RANGE"
    ITEM_BELOW_FLOOR = "ITEM_BELOW_FLOOR"
    INVALID_ROTATION = "INVALID_ROTATION"
    PROJECT_LIMIT_EXCEEDED = "PROJECT_LIMIT_EXCEEDED"


class ExportFormat(StrEnum):
    PROJECT_JSON = "project.json"
    SPECIFICATION_CSV = "specification.csv"
    SCENE_GLB = "scene.glb"
    STEP = "step"
    FCSTD = "fcstd"
    OBJ = "obj"


class ExportJobStatus(StrEnum):
    PENDING = "pending"
    READY = "ready"
    FAILED = "failed"
    EXPIRED = "expired"


class TemplateCategory(StrEnum):
    PROJECT_TEMPLATE = "project_template"
    MODULE = "module"


class Metadata(BaseModel):
    createdAt: datetime
    updatedAt: datetime
    sourceTemplateId: str | None = None
    authorNote: str | None = None


class Origin(BaseModel):
    xMm: float = 0
    yMm: float = 0
    zMm: float = 0


class Room(BaseModel):
    widthMm: float = Field(gt=0)
    lengthMm: float = Field(gt=0)
    heightMm: float = Field(gt=0)
    origin: Origin = Field(default_factory=Origin)


class Dimensions(BaseModel):
    widthMm: float
    heightMm: float
    depthMm: float
    thicknessMm: float


class Transform(BaseModel):
    xMm: float
    yMm: float
    zMm: float
    rotationYDeg: Literal[0, 90, 180, 270]

    @field_validator("rotationYDeg")
    @classmethod
    def validate_rotation(cls, value: int) -> int:
        if value not in ALLOWED_ROTATION_Y_DEGREES:
            raise ValueError("rotationYDeg must be one of 0, 90, 180, 270.")
        return value


class Constraints(BaseModel):
    resizable: bool = False
    editableFields: list[str] = Field(default_factory=list)
    minWidthMm: float = 0
    maxWidthMm: float | None = None
    minHeightMm: float = 0
    maxHeightMm: float | None = None
    minDepthMm: float = 0
    maxDepthMm: float | None = None


class Material(BaseModel):
    id: str
    code: str
    name: str
    color: str
    textureUrl: str | None = None
    thicknessMmDefault: float = Field(gt=0)
    grainDirection: str | None = None
    category: str


class Item(BaseModel):
    id: str
    type: ItemType
    subtype: str
    name: str
    parentId: str | None = None
    sortIndex: int = 0
    dimensions: Dimensions
    transform: Transform
    materialId: str | None = None
    grainDirection: str | None = None
    visibility: bool = True
    locked: bool = False
    constraints: Constraints | None = None
    sourceTemplateId: str | None = None


class Template(BaseModel):
    id: str
    code: str
    name: str
    category: TemplateCategory
    previewImageUrl: str | None = None
    rootItemTreeDto: dict[str, Any]
    defaultDimensions: Dimensions
    tags: list[str] = Field(default_factory=list)


class ValidationIssue(BaseModel):
    id: str
    severity: ValidationSeverity
    code: ValidationCode
    message: str
    itemIds: list[str] = Field(default_factory=list)
    details: dict[str, Any] | None = None


class ExportJob(BaseModel):
    id: str
    format: ExportFormat
    status: ExportJobStatus
    createdAt: datetime
    expiresAt: datetime
    downloadUrl: str | None = None
    error: str | None = None
    traceId: str


class Project(BaseModel):
    id: str
    name: str
    version: Literal["1.0"] = PROJECT_SCHEMA_VERSION
    unit: Literal["mm"] = PROJECT_UNIT
    room: Room
    items: list[Item] = Field(default_factory=list)
    materials: list[Material] = Field(default_factory=list)
    metadata: Metadata

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "id": "project-demo",
                    "name": "Demo project",
                    "version": "1.0",
                    "unit": "mm",
                    "room": {
                        "widthMm": 3000,
                        "lengthMm": 3000,
                        "heightMm": 2700,
                        "origin": {"xMm": 0, "yMm": 0, "zMm": 0},
                    },
                    "items": [],
                    "materials": [],
                    "metadata": {
                        "createdAt": "2026-03-09T00:00:00Z",
                        "updatedAt": "2026-03-09T00:00:00Z",
                    },
                }
            ]
        }
    )
