from typing import Any

from pydantic import BaseModel, Field

from app.schemas.domain import ExportFormat, ExportJob, Material, Project, Template, ValidationIssue


class ApiErrorResponse(BaseModel):
    code: str
    message: str
    traceId: str
    details: Any | None = None


class ValidateProjectRequest(BaseModel):
    project: Project


class ValidateProjectResponse(BaseModel):
    ok: bool
    issues: list[ValidationIssue] = Field(default_factory=list)
    traceId: str


class SpecificationRow(BaseModel):
    type: str
    subtype: str
    materialCode: str
    materialName: str
    widthMm: float
    heightMm: float
    depthMm: float
    thicknessMm: float
    grainDirection: str | None = None
    quantity: int


class GenerateSpecificationRequest(BaseModel):
    project: Project


class GenerateSpecificationResponse(BaseModel):
    rows: list[SpecificationRow] = Field(default_factory=list)
    issues: list[ValidationIssue] = Field(default_factory=list)
    traceId: str


class ExportProjectRequest(BaseModel):
    project: Project
    formats: list[ExportFormat] = Field(min_length=1)


class ExportProjectResponse(BaseModel):
    jobs: list[ExportJob] = Field(default_factory=list)
    traceId: str


class MaterialsResponse(BaseModel):
    items: list[Material] = Field(default_factory=list)
    traceId: str


class ModulesResponse(BaseModel):
    items: list[Template] = Field(default_factory=list)
    traceId: str


class TemplatesResponse(BaseModel):
    items: list[Template] = Field(default_factory=list)
    traceId: str


class TemplateDetailResponse(BaseModel):
    item: Template
    traceId: str


class ExportJobResponse(BaseModel):
    item: ExportJob
    traceId: str


class DeleteExportJobResponse(BaseModel):
    id: str
    deleted: bool
    traceId: str
