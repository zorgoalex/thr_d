from datetime import UTC, datetime

from app.schemas.domain import (
    Dimensions,
    Item,
    ItemType,
    Metadata,
    Project,
    Room,
    Transform,
)


def make_item(
    id: str = "item-1",
    type: str = "panel",
    parent_id: str | None = None,
    x: float = 0,
    y: float = 0,
    z: float = 0,
    w: float = 600,
    h: float = 720,
    d: float = 400,
    t: float = 16,
    rotation: int = 0,
) -> Item:
    return Item(
        id=id,
        type=ItemType(type),
        subtype="test",
        name=id,
        parentId=parent_id,
        sortIndex=0,
        dimensions=Dimensions(widthMm=w, heightMm=h, depthMm=d, thicknessMm=t),
        transform=Transform(xMm=x, yMm=y, zMm=z, rotationYDeg=rotation),
    )


def make_project(
    items: list[Item] | None = None,
    room_w: float = 3000,
    room_l: float = 3000,
    room_h: float = 2700,
) -> Project:
    now = datetime(2026, 3, 15, tzinfo=UTC)
    return Project(
        id="project-test",
        name="Test",
        room=Room(widthMm=room_w, lengthMm=room_l, heightMm=room_h),
        items=items or [],
        materials=[],
        metadata=Metadata(createdAt=now, updatedAt=now),
    )
