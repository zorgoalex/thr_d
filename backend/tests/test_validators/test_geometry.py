from app.validators.geometry import (
    compute_aabb_overlap,
    compute_world_aabb,
    is_below_floor,
    is_inside_room,
    resolve_world_transform,
    rotate_xz,
)
from tests.test_validators.conftest import make_item, make_project


def test_rotate_xz_0() -> None:
    assert rotate_xz(10, 20, 0) == (10, 20)


def test_rotate_xz_90() -> None:
    assert rotate_xz(10, 20, 90) == (-20, 10)


def test_rotate_xz_180() -> None:
    assert rotate_xz(10, 20, 180) == (-10, -20)


def test_rotate_xz_270() -> None:
    assert rotate_xz(10, 20, 270) == (20, -10)


def test_resolve_world_transform_root() -> None:
    item = make_item(x=100, y=50, z=200, rotation=90)
    wt = resolve_world_transform("item-1", [item])
    assert wt.x_mm == 100
    assert wt.y_mm == 50
    assert wt.z_mm == 200
    assert wt.rotation_y_deg == 90


def test_resolve_world_transform_child() -> None:
    parent = make_item(id="parent", x=100, z=100)
    child = make_item(id="child", parent_id="parent", x=50, z=20)
    wt = resolve_world_transform("child", [parent, child])
    assert wt.x_mm == 150
    assert wt.z_mm == 120


def test_compute_world_aabb_rotation_90() -> None:
    from app.schemas.domain import Dimensions

    dims = Dimensions(widthMm=600, heightMm=720, depthMm=400, thicknessMm=16)
    from app.validators.geometry import WorldTransform

    wt = WorldTransform(0, 0, 0, 90)
    aabb = compute_world_aabb(dims, wt)
    assert aabb.max_x == 400  # depth became width
    assert aabb.max_z == 600  # width became depth


def test_compute_aabb_overlap_no_overlap() -> None:
    from app.validators.geometry import AABB

    a = AABB(0, 100, 0, 100, 0, 100)
    b = AABB(200, 300, 0, 100, 0, 100)
    assert compute_aabb_overlap(a, b) == 0


def test_compute_aabb_overlap_5mm() -> None:
    from app.validators.geometry import AABB

    a = AABB(0, 100, 0, 100, 0, 100)
    b = AABB(95, 200, 0, 100, 0, 100)
    assert compute_aabb_overlap(a, b) == 5


def test_is_inside_room() -> None:
    from app.validators.geometry import AABB

    project = make_project()
    aabb = AABB(0, 600, 0, 720, 0, 400)
    assert is_inside_room(aabb, project.room) is True

    aabb_out = AABB(2800, 3400, 0, 720, 0, 400)
    assert is_inside_room(aabb_out, project.room) is False


def test_is_below_floor() -> None:
    from app.validators.geometry import AABB

    assert is_below_floor(AABB(0, 100, -1, 100, 0, 100)) is True
    assert is_below_floor(AABB(0, 100, 0, 100, 0, 100)) is False
