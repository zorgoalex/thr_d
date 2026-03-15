"""Seed project templates (category = project_template).

rootItemTreeDto node schema:
    {
        "id": str,
        "type": ItemType value,
        "subtype": str,
        "name": str,
        "dimensions": {"widthMm", "heightMm", "depthMm", "thicknessMm"},
        "transform": {"xMm", "yMm", "zMm", "rotationYDeg"},
        "materialId": str | None,
        "children": list[node],
    }
"""

from typing import Any

from app.schemas.domain import Dimensions, Template, TemplateCategory

# ---------------------------------------------------------------------------
# Helpers to build tree nodes with less repetition
# ---------------------------------------------------------------------------

_T0 = {"xMm": 0, "yMm": 0, "zMm": 0, "rotationYDeg": 0}


def _dims(w: float, h: float, d: float, t: float) -> dict[str, float]:
    return {"widthMm": w, "heightMm": h, "depthMm": d, "thicknessMm": t}


def _tr(x: float = 0, y: float = 0, z: float = 0, r: int = 0) -> dict[str, float | int]:
    return {"xMm": x, "yMm": y, "zMm": z, "rotationYDeg": r}


def _node(
    id: str,
    type: str,
    subtype: str,
    name: str,
    dims: dict[str, float],
    transform: dict[str, Any] | None = None,
    material_id: str | None = "mat-ldsp-white-16",
    children: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    return {
        "id": id,
        "type": type,
        "subtype": subtype,
        "name": name,
        "dimensions": dims,
        "transform": transform or _T0,
        "materialId": material_id,
        "children": children or [],
    }


# ---------------------------------------------------------------------------
# 1. Шкаф (wardrobe) — 1200 x 2100 x 600
# ---------------------------------------------------------------------------
_wardrobe_tree: dict[str, Any] = _node(
    "tpl-wardrobe-root", "assembly", "wardrobe", "Шкаф", _dims(1200, 2100, 600, 16),
    material_id=None,
    children=[
        _node("wr-left", "panel", "side_panel", "Боковая лев.", _dims(16, 2100, 600, 16),
              _tr(0, 0, 0)),
        _node("wr-right", "panel", "side_panel", "Боковая прав.", _dims(16, 2100, 600, 16),
              _tr(1184, 0, 0)),
        _node("wr-top", "panel", "top_panel", "Верхняя панель", _dims(1168, 16, 600, 16),
              _tr(16, 2084, 0)),
        _node("wr-bottom", "panel", "bottom_panel", "Нижняя панель", _dims(1168, 16, 600, 16),
              _tr(16, 0, 0)),
        _node("wr-back", "panel", "back_panel", "Задняя стенка", _dims(1196, 2096, 3, 3),
              _tr(2, 2, 597), material_id="mat-dvp-white-3"),
        _node("wr-shelf-1", "shelf", "shelf", "Полка 1", _dims(1168, 16, 580, 16),
              _tr(16, 700, 0)),
        _node("wr-shelf-2", "shelf", "shelf", "Полка 2", _dims(1168, 16, 580, 16),
              _tr(16, 1400, 0)),
        _node("wr-door-l", "door", "hinged_door", "Дверца лев.", _dims(598, 2096, 16, 16),
              _tr(0, 2, 0), material_id="mat-mdf-white-16"),
        _node("wr-door-r", "door", "hinged_door", "Дверца прав.", _dims(598, 2096, 16, 16),
              _tr(600, 2, 0), material_id="mat-mdf-white-16"),
        _node("wr-plinth", "panel", "plinth", "Цоколь", _dims(1168, 80, 16, 16),
              _tr(16, 0, 0)),
    ],
)

# ---------------------------------------------------------------------------
# 2. Тумба (nightstand) — 500 x 550 x 400
# ---------------------------------------------------------------------------
_nightstand_tree: dict[str, Any] = _node(
    "tpl-nightstand-root", "assembly", "nightstand", "Тумба", _dims(500, 550, 400, 16),
    material_id=None,
    children=[
        _node("ns-left", "panel", "side_panel", "Боковая лев.", _dims(16, 550, 400, 16),
              _tr(0, 0, 0)),
        _node("ns-right", "panel", "side_panel", "Боковая прав.", _dims(16, 550, 400, 16),
              _tr(484, 0, 0)),
        _node("ns-top", "panel", "top_panel", "Верхняя панель", _dims(468, 16, 400, 16),
              _tr(16, 534, 0)),
        _node("ns-bottom", "panel", "bottom_panel", "Нижняя панель", _dims(468, 16, 400, 16),
              _tr(16, 0, 0)),
        _node("ns-back", "panel", "back_panel", "Задняя стенка", _dims(496, 546, 3, 3),
              _tr(2, 2, 397), material_id="mat-dvp-white-3"),
        _node("ns-shelf", "shelf", "shelf", "Полка", _dims(468, 16, 380, 16),
              _tr(16, 270, 0)),
        _node("ns-door", "door", "hinged_door", "Дверца", _dims(496, 546, 16, 16),
              _tr(0, 2, 0), material_id="mat-mdf-white-16"),
        _node("ns-plinth", "panel", "plinth", "Цоколь", _dims(468, 80, 16, 16),
              _tr(16, 0, 0)),
    ],
)

# ---------------------------------------------------------------------------
# 3. Стеллаж (bookcase) — 800 x 1800 x 350
# ---------------------------------------------------------------------------
_bookcase_tree: dict[str, Any] = _node(
    "tpl-bookcase-root", "assembly", "bookcase", "Стеллаж", _dims(800, 1800, 350, 16),
    material_id=None,
    children=[
        _node("bc-left", "panel", "side_panel", "Боковая лев.", _dims(16, 1800, 350, 16),
              _tr(0, 0, 0)),
        _node("bc-right", "panel", "side_panel", "Боковая прав.", _dims(16, 1800, 350, 16),
              _tr(784, 0, 0)),
        _node("bc-top", "panel", "top_panel", "Верхняя панель", _dims(768, 16, 350, 16),
              _tr(16, 1784, 0)),
        _node("bc-bottom", "panel", "bottom_panel", "Нижняя панель", _dims(768, 16, 350, 16),
              _tr(16, 0, 0)),
        _node("bc-back", "panel", "back_panel", "Задняя стенка", _dims(796, 1796, 3, 3),
              _tr(2, 2, 347), material_id="mat-dvp-white-3"),
        _node("bc-shelf-1", "shelf", "shelf", "Полка 1", _dims(768, 16, 330, 16),
              _tr(16, 440, 0)),
        _node("bc-shelf-2", "shelf", "shelf", "Полка 2", _dims(768, 16, 330, 16),
              _tr(16, 880, 0)),
        _node("bc-shelf-3", "shelf", "shelf", "Полка 3", _dims(768, 16, 330, 16),
              _tr(16, 1320, 0)),
        _node("bc-shelf-4", "shelf", "shelf", "Полка 4", _dims(768, 16, 330, 16),
              _tr(16, 1600, 0)),
    ],
)

# ---------------------------------------------------------------------------
# 4. Прямая кухня (straight kitchen) — 2400 x 850 x 600
# ---------------------------------------------------------------------------
_kitchen_lower_1: dict[str, Any] = _node(
    "kt-lower-1", "assembly", "lower_cabinet", "Нижний шкаф 1", _dims(600, 720, 560, 16),
    material_id=None,
    children=[
        _node("kt-l1-left", "panel", "side_panel", "Боковая лев.", _dims(16, 720, 560, 16),
              _tr(0, 0, 0)),
        _node("kt-l1-right", "panel", "side_panel", "Боковая прав.", _dims(16, 720, 560, 16),
              _tr(584, 0, 0)),
        _node("kt-l1-bottom", "panel", "bottom_panel", "Дно", _dims(568, 16, 560, 16),
              _tr(16, 0, 0)),
        _node("kt-l1-back", "panel", "back_panel", "Задняя стенка", _dims(596, 716, 3, 3),
              _tr(2, 2, 557), material_id="mat-dvp-white-3"),
        _node("kt-l1-shelf", "shelf", "shelf", "Полка", _dims(568, 16, 540, 16),
              _tr(16, 350, 0)),
        _node("kt-l1-door", "door", "hinged_door", "Дверца", _dims(596, 716, 16, 16),
              _tr(0, 2, 0), material_id="mat-mdf-white-16"),
    ],
)

_kitchen_lower_2: dict[str, Any] = _node(
    "kt-lower-2", "assembly", "lower_cabinet", "Нижний шкаф 2", _dims(600, 720, 560, 16),
    _tr(600, 0, 0), material_id=None,
    children=[
        _node("kt-l2-left", "panel", "side_panel", "Боковая лев.", _dims(16, 720, 560, 16)),
        _node("kt-l2-right", "panel", "side_panel", "Боковая прав.", _dims(16, 720, 560, 16),
              _tr(584, 0, 0)),
        _node("kt-l2-bottom", "panel", "bottom_panel", "Дно", _dims(568, 16, 560, 16),
              _tr(16, 0, 0)),
        _node("kt-l2-back", "panel", "back_panel", "Задняя стенка", _dims(596, 716, 3, 3),
              _tr(2, 2, 557), material_id="mat-dvp-white-3"),
        _node("kt-l2-shelf", "shelf", "shelf", "Полка", _dims(568, 16, 540, 16),
              _tr(16, 350, 0)),
        _node("kt-l2-door", "door", "hinged_door", "Дверца", _dims(596, 716, 16, 16),
              _tr(0, 2, 0), material_id="mat-mdf-white-16"),
    ],
)

_kitchen_lower_3: dict[str, Any] = _node(
    "kt-lower-3", "assembly", "lower_cabinet", "Нижний шкаф 3", _dims(600, 720, 560, 16),
    _tr(1200, 0, 0), material_id=None,
    children=[
        _node("kt-l3-left", "panel", "side_panel", "Боковая лев.", _dims(16, 720, 560, 16)),
        _node("kt-l3-right", "panel", "side_panel", "Боковая прав.", _dims(16, 720, 560, 16),
              _tr(584, 0, 0)),
        _node("kt-l3-bottom", "panel", "bottom_panel", "Дно", _dims(568, 16, 560, 16),
              _tr(16, 0, 0)),
        _node("kt-l3-back", "panel", "back_panel", "Задняя стенка", _dims(596, 716, 3, 3),
              _tr(2, 2, 557), material_id="mat-dvp-white-3"),
        _node("kt-l3-shelf", "shelf", "shelf", "Полка", _dims(568, 16, 540, 16),
              _tr(16, 350, 0)),
        _node("kt-l3-door", "door", "hinged_door", "Дверца", _dims(596, 716, 16, 16),
              _tr(0, 2, 0), material_id="mat-mdf-white-16"),
    ],
)

_kitchen_tree: dict[str, Any] = _node(
    "tpl-kitchen-root", "assembly", "kitchen", "Прямая кухня", _dims(2400, 850, 600, 16),
    material_id=None,
    children=[
        _kitchen_lower_1,
        _kitchen_lower_2,
        _kitchen_lower_3,
        _node("kt-countertop", "panel", "countertop", "Столешница",
              _dims(2400, 38, 600, 38), _tr(0, 720, 0),
              material_id="mat-countertop-oak-38"),
        _node(
            "kt-upper-1", "assembly", "upper_cabinet", "Верхний шкаф 1",
            _dims(600, 720, 350, 16), _tr(0, 850, 0), material_id=None,
            children=[
                _node("kt-u1-left", "panel", "side_panel", "Боковая лев.",
                      _dims(16, 720, 350, 16)),
                _node("kt-u1-right", "panel", "side_panel", "Боковая прав.",
                      _dims(16, 720, 350, 16), _tr(584, 0, 0)),
                _node("kt-u1-top", "panel", "top_panel", "Верхняя панель",
                      _dims(568, 16, 350, 16), _tr(16, 704, 0)),
                _node("kt-u1-bottom", "panel", "bottom_panel", "Дно",
                      _dims(568, 16, 350, 16), _tr(16, 0, 0)),
                _node("kt-u1-back", "panel", "back_panel", "Задняя стенка",
                      _dims(596, 716, 3, 3), _tr(2, 2, 347),
                      material_id="mat-dvp-white-3"),
                _node("kt-u1-shelf", "shelf", "shelf", "Полка",
                      _dims(568, 16, 330, 16), _tr(16, 350, 0)),
                _node("kt-u1-door", "door", "hinged_door", "Дверца",
                      _dims(596, 716, 16, 16), _tr(0, 2, 0),
                      material_id="mat-mdf-white-16"),
            ],
        ),
        _node(
            "kt-upper-2", "assembly", "upper_cabinet", "Верхний шкаф 2",
            _dims(600, 720, 350, 16), _tr(600, 850, 0), material_id=None,
            children=[
                _node("kt-u2-left", "panel", "side_panel", "Боковая лев.",
                      _dims(16, 720, 350, 16)),
                _node("kt-u2-right", "panel", "side_panel", "Боковая прав.",
                      _dims(16, 720, 350, 16), _tr(584, 0, 0)),
                _node("kt-u2-top", "panel", "top_panel", "Верхняя панель",
                      _dims(568, 16, 350, 16), _tr(16, 704, 0)),
                _node("kt-u2-bottom", "panel", "bottom_panel", "Дно",
                      _dims(568, 16, 350, 16), _tr(16, 0, 0)),
                _node("kt-u2-back", "panel", "back_panel", "Задняя стенка",
                      _dims(596, 716, 3, 3), _tr(2, 2, 347),
                      material_id="mat-dvp-white-3"),
                _node("kt-u2-shelf", "shelf", "shelf", "Полка",
                      _dims(568, 16, 330, 16), _tr(16, 350, 0)),
                _node("kt-u2-door", "door", "hinged_door", "Дверца",
                      _dims(596, 716, 16, 16), _tr(0, 2, 0),
                      material_id="mat-mdf-white-16"),
            ],
        ),
    ],
)

# ---------------------------------------------------------------------------
# Exports
# ---------------------------------------------------------------------------

SEED_TEMPLATES: list[Template] = [
    Template(
        id="tpl-wardrobe",
        code="wardrobe",
        name="Шкаф",
        category=TemplateCategory.PROJECT_TEMPLATE,
        previewImageUrl="/static/previews/wardrobe.png",
        rootItemTreeDto=_wardrobe_tree,
        defaultDimensions=Dimensions(widthMm=1200, heightMm=2100, depthMm=600, thicknessMm=16),
        tags=["furniture", "storage"],
    ),
    Template(
        id="tpl-nightstand",
        code="nightstand",
        name="Тумба",
        category=TemplateCategory.PROJECT_TEMPLATE,
        previewImageUrl="/static/previews/nightstand.png",
        rootItemTreeDto=_nightstand_tree,
        defaultDimensions=Dimensions(widthMm=500, heightMm=550, depthMm=400, thicknessMm=16),
        tags=["furniture", "storage"],
    ),
    Template(
        id="tpl-bookcase",
        code="bookcase",
        name="Стеллаж",
        category=TemplateCategory.PROJECT_TEMPLATE,
        previewImageUrl="/static/previews/bookcase.png",
        rootItemTreeDto=_bookcase_tree,
        defaultDimensions=Dimensions(widthMm=800, heightMm=1800, depthMm=350, thicknessMm=16),
        tags=["furniture", "storage", "open"],
    ),
    Template(
        id="tpl-kitchen-straight",
        code="kitchen-straight",
        name="Прямая кухня",
        category=TemplateCategory.PROJECT_TEMPLATE,
        previewImageUrl="/static/previews/kitchen_straight.png",
        rootItemTreeDto=_kitchen_tree,
        defaultDimensions=Dimensions(widthMm=2400, heightMm=850, depthMm=600, thicknessMm=16),
        tags=["kitchen"],
    ),
]
