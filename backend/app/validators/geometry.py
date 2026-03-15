from dataclasses import dataclass

from app.schemas.domain import Dimensions, Item, Room
from app.validators.constants import EPSILON


@dataclass(frozen=True, slots=True)
class AABB:
    min_x: float
    max_x: float
    min_y: float
    max_y: float
    min_z: float
    max_z: float


@dataclass(frozen=True, slots=True)
class WorldTransform:
    x_mm: float
    y_mm: float
    z_mm: float
    rotation_y_deg: int


def rotate_xz(x: float, z: float, rotation_y_deg: int) -> tuple[float, float]:
    if rotation_y_deg == 0:
        return x, z
    if rotation_y_deg == 90:
        return -z, x
    if rotation_y_deg == 180:
        return -x, -z
    if rotation_y_deg == 270:
        return z, -x
    return x, z


def resolve_world_transform(item_id: str, items: list[Item]) -> WorldTransform:
    item_map = {item.id: item for item in items}
    chain: list[Item] = []
    visited: set[str] = set()
    current_id: str | None = item_id

    while current_id is not None:
        if current_id in visited:
            raise ValueError(f"Circular parentId chain at '{current_id}'.")
        item = item_map.get(current_id)
        if item is None:
            raise ValueError(f"Item '{current_id}' not found.")
        visited.add(current_id)
        chain.append(item)
        current_id = item.parentId

    chain.reverse()

    world_x = 0.0
    world_y = 0.0
    world_z = 0.0
    cumulative_rotation = 0

    for item in chain:
        rx, rz = rotate_xz(item.transform.xMm, item.transform.zMm, cumulative_rotation)
        world_x += rx
        world_y += item.transform.yMm
        world_z += rz
        cumulative_rotation = (cumulative_rotation + item.transform.rotationYDeg) % 360

    return WorldTransform(world_x, world_y, world_z, cumulative_rotation)


def compute_world_aabb(dims: Dimensions, wt: WorldTransform) -> AABB:
    swapped = wt.rotation_y_deg in (90, 270)
    ew = dims.depthMm if swapped else dims.widthMm
    ed = dims.widthMm if swapped else dims.depthMm
    return AABB(
        min_x=wt.x_mm, max_x=wt.x_mm + ew,
        min_y=wt.y_mm, max_y=wt.y_mm + dims.heightMm,
        min_z=wt.z_mm, max_z=wt.z_mm + ed,
    )


def compute_aabb_overlap(a: AABB, b: AABB) -> float:
    ox = min(a.max_x, b.max_x) - max(a.min_x, b.min_x)
    oy = min(a.max_y, b.max_y) - max(a.min_y, b.min_y)
    oz = min(a.max_z, b.max_z) - max(a.min_z, b.min_z)
    if ox <= 0 or oy <= 0 or oz <= 0:
        return 0.0
    return min(ox, oy, oz)


def is_inside_room(aabb: AABB, room: Room) -> bool:
    ox = room.origin.xMm
    oy = room.origin.yMm
    oz = room.origin.zMm
    return (
        aabb.min_x >= ox - EPSILON
        and aabb.max_x <= ox + room.widthMm + EPSILON
        and aabb.min_y >= oy - EPSILON
        and aabb.max_y <= oy + room.heightMm + EPSILON
        and aabb.min_z >= oz - EPSILON
        and aabb.max_z <= oz + room.lengthMm + EPSILON
    )


def is_below_floor(aabb: AABB) -> bool:
    return aabb.min_y < -EPSILON
