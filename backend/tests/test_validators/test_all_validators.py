"""Tests for all individual validators and composite."""

from app.validators.composite_validator import CompositeProjectValidator
from app.validators.dimensions_validator import DimensionsValidator
from app.validators.intersections_validator import IntersectionsValidator
from app.validators.project_limits_validator import ProjectLimitsValidator
from app.validators.room_bounds_validator import RoomBoundsValidator
from app.validators.rotation_validator import RotationValidator
from app.validators.world_range_validator import WorldRangeValidator
from tests.test_validators.conftest import make_item, make_project


def test_dimensions_valid() -> None:
    project = make_project([make_item()])
    assert DimensionsValidator().validate(project) == []


def test_dimensions_zero_width() -> None:
    project = make_project([make_item(w=0)])
    issues = DimensionsValidator().validate(project)
    assert any(i.code.value == "INVALID_DIMENSIONS" for i in issues)


def test_dimensions_zero_thickness() -> None:
    project = make_project([make_item(t=0)])
    issues = DimensionsValidator().validate(project)
    assert any(i.code.value == "INVALID_THICKNESS" for i in issues)


def test_room_bounds_inside() -> None:
    project = make_project([make_item(x=0, z=0)])
    assert RoomBoundsValidator().validate(project) == []


def test_room_bounds_outside() -> None:
    project = make_project([make_item(x=2800)])
    issues = RoomBoundsValidator().validate(project)
    assert any(i.code.value == "ROOM_BOUNDS_EXCEEDED" for i in issues)


def test_room_bounds_below_floor() -> None:
    project = make_project([make_item(y=-100)])
    issues = RoomBoundsValidator().validate(project)
    assert any(i.code.value == "ITEM_BELOW_FLOOR" for i in issues)


def test_world_range_ok() -> None:
    project = make_project([make_item()])
    assert WorldRangeValidator().validate(project) == []


def test_world_range_exceeded() -> None:
    project = make_project([make_item(x=200000)])
    issues = WorldRangeValidator().validate(project)
    assert any(i.code.value == "OUT_OF_ALLOWED_WORLD_RANGE" for i in issues)


def test_intersections_no_overlap() -> None:
    project = make_project([make_item(id="a", x=0), make_item(id="b", x=1000)])
    assert IntersectionsValidator().validate(project) == []


def test_intersections_overlap() -> None:
    project = make_project([make_item(id="a", x=0), make_item(id="b", x=100)])
    issues = IntersectionsValidator().validate(project)
    assert any(i.code.value == "ITEM_INTERSECTION" for i in issues)


def test_intersections_assembly_contact_ok() -> None:
    # Overlap <= 0.5mm is assembly contact (OK)
    project = make_project([make_item(id="a", x=0), make_item(id="b", x=599.8)])
    issues = IntersectionsValidator().validate(project)
    assert not any(i.code.value == "ITEM_INTERSECTION" for i in issues)


def test_project_limits_ok() -> None:
    items = [make_item(id=f"item-{i}") for i in range(500)]
    project = make_project(items)
    assert ProjectLimitsValidator().validate(project) == []


def test_project_limits_exceeded() -> None:
    items = [make_item(id=f"item-{i}") for i in range(501)]
    project = make_project(items)
    issues = ProjectLimitsValidator().validate(project)
    assert any(i.code.value == "PROJECT_LIMIT_EXCEEDED" for i in issues)


def test_composite_collects_all() -> None:
    project = make_project([make_item(w=0)])  # invalid dimensions
    validator = CompositeProjectValidator([DimensionsValidator(), RotationValidator()])
    issues = validator.validate(project)
    assert len(issues) >= 1
    assert any(i.code.value == "INVALID_DIMENSIONS" for i in issues)
