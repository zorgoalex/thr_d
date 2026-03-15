"""Seed modules (category = module) and parts (category = module, tags = ["part"])."""

from typing import Any

from app.schemas.domain import Dimensions, Template, TemplateCategory

# ---------------------------------------------------------------------------
# Helpers
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
# Modules
# ---------------------------------------------------------------------------

_lower_cabinet_tree: dict[str, Any] = _node(
    "mod-lc-root", "assembly", "lower_cabinet", "Нижний шкаф", _dims(600, 720, 560, 16),
    material_id=None,
    children=[
        _node("lc-left", "panel", "side_panel", "Боковая лев.", _dims(16, 720, 560, 16)),
        _node("lc-right", "panel", "side_panel", "Боковая прав.", _dims(16, 720, 560, 16),
              _tr(584, 0, 0)),
        _node("lc-bottom", "panel", "bottom_panel", "Дно", _dims(568, 16, 560, 16),
              _tr(16, 0, 0)),
        _node("lc-back", "panel", "back_panel", "Задняя стенка", _dims(596, 716, 3, 3),
              _tr(2, 2, 557), material_id="mat-dvp-white-3"),
        _node("lc-shelf", "shelf", "shelf", "Полка", _dims(568, 16, 540, 16),
              _tr(16, 350, 0)),
        _node("lc-door", "door", "hinged_door", "Дверца", _dims(596, 716, 16, 16),
              _tr(0, 2, 0), material_id="mat-mdf-white-16"),
        _node("lc-plinth", "panel", "plinth", "Цоколь", _dims(568, 80, 16, 16),
              _tr(16, 0, 0)),
    ],
)

_upper_cabinet_tree: dict[str, Any] = _node(
    "mod-uc-root", "assembly", "upper_cabinet", "Верхний шкаф", _dims(600, 720, 350, 16),
    material_id=None,
    children=[
        _node("uc-left", "panel", "side_panel", "Боковая лев.", _dims(16, 720, 350, 16)),
        _node("uc-right", "panel", "side_panel", "Боковая прав.", _dims(16, 720, 350, 16),
              _tr(584, 0, 0)),
        _node("uc-top", "panel", "top_panel", "Верхняя панель", _dims(568, 16, 350, 16),
              _tr(16, 704, 0)),
        _node("uc-bottom", "panel", "bottom_panel", "Дно", _dims(568, 16, 350, 16),
              _tr(16, 0, 0)),
        _node("uc-back", "panel", "back_panel", "Задняя стенка", _dims(596, 716, 3, 3),
              _tr(2, 2, 347), material_id="mat-dvp-white-3"),
        _node("uc-shelf", "shelf", "shelf", "Полка", _dims(568, 16, 330, 16),
              _tr(16, 350, 0)),
        _node("uc-door", "door", "hinged_door", "Дверца", _dims(596, 716, 16, 16),
              _tr(0, 2, 0), material_id="mat-mdf-white-16"),
    ],
)

_open_module_tree: dict[str, Any] = _node(
    "mod-om-root", "assembly", "open_module", "Открытый модуль", _dims(400, 720, 350, 16),
    material_id=None,
    children=[
        _node("om-left", "panel", "side_panel", "Боковая лев.", _dims(16, 720, 350, 16)),
        _node("om-right", "panel", "side_panel", "Боковая прав.", _dims(16, 720, 350, 16),
              _tr(384, 0, 0)),
        _node("om-top", "panel", "top_panel", "Верхняя панель", _dims(368, 16, 350, 16),
              _tr(16, 704, 0)),
        _node("om-bottom", "panel", "bottom_panel", "Дно", _dims(368, 16, 350, 16),
              _tr(16, 0, 0)),
        _node("om-back", "panel", "back_panel", "Задняя стенка", _dims(396, 716, 3, 3),
              _tr(2, 2, 347), material_id="mat-dvp-white-3"),
        _node("om-shelf-1", "shelf", "shelf", "Полка 1", _dims(368, 16, 330, 16),
              _tr(16, 240, 0)),
        _node("om-shelf-2", "shelf", "shelf", "Полка 2", _dims(368, 16, 330, 16),
              _tr(16, 480, 0)),
    ],
)

_dresser_shelf_tree: dict[str, Any] = _node(
    "mod-ds-root", "assembly", "dresser_shelf", "Тумба с полкой", _dims(600, 550, 400, 16),
    material_id=None,
    children=[
        _node("ds-left", "panel", "side_panel", "Боковая лев.", _dims(16, 550, 400, 16)),
        _node("ds-right", "panel", "side_panel", "Боковая прав.", _dims(16, 550, 400, 16),
              _tr(584, 0, 0)),
        _node("ds-top", "panel", "top_panel", "Верхняя панель", _dims(568, 16, 400, 16),
              _tr(16, 534, 0)),
        _node("ds-bottom", "panel", "bottom_panel", "Дно", _dims(568, 16, 400, 16),
              _tr(16, 0, 0)),
        _node("ds-back", "panel", "back_panel", "Задняя стенка", _dims(596, 546, 3, 3),
              _tr(2, 2, 397), material_id="mat-dvp-white-3"),
        _node("ds-shelf", "shelf", "shelf", "Полка", _dims(568, 16, 380, 16),
              _tr(16, 270, 0)),
        _node("ds-door", "door", "hinged_door", "Дверца", _dims(596, 546, 16, 16),
              _tr(0, 2, 0), material_id="mat-mdf-white-16"),
        _node("ds-plinth", "panel", "plinth", "Цоколь", _dims(568, 80, 16, 16),
              _tr(16, 0, 0)),
    ],
)

# ---------------------------------------------------------------------------
# Parts (single-item templates with tags=["part"])
# ---------------------------------------------------------------------------

def _part_template(
    id: str, code: str, name: str, item_type: str, subtype: str,
    dims: dict[str, float], material_id: str = "mat-ldsp-white-16",
) -> Template:
    return Template(
        id=id,
        code=code,
        name=name,
        category=TemplateCategory.MODULE,
        previewImageUrl=f"/static/previews/{code}.png",
        rootItemTreeDto=_node(f"{id}-root", item_type, subtype, name, dims,
                              material_id=material_id),
        defaultDimensions=Dimensions(
            widthMm=dims["widthMm"],
            heightMm=dims["heightMm"],
            depthMm=dims["depthMm"],
            thicknessMm=dims["thicknessMm"],
        ),
        tags=["part"],
    )


# ---------------------------------------------------------------------------
# Exports
# ---------------------------------------------------------------------------

SEED_MODULES: list[Template] = [
    # --- 4 modules ---
    Template(
        id="mod-lower-cabinet",
        code="lower-cabinet",
        name="Нижний шкаф",
        category=TemplateCategory.MODULE,
        previewImageUrl="/static/previews/lower_cabinet.png",
        rootItemTreeDto=_lower_cabinet_tree,
        defaultDimensions=Dimensions(widthMm=600, heightMm=720, depthMm=560, thicknessMm=16),
        tags=["kitchen", "lower"],
    ),
    Template(
        id="mod-upper-cabinet",
        code="upper-cabinet",
        name="Верхний шкаф",
        category=TemplateCategory.MODULE,
        previewImageUrl="/static/previews/upper_cabinet.png",
        rootItemTreeDto=_upper_cabinet_tree,
        defaultDimensions=Dimensions(widthMm=600, heightMm=720, depthMm=350, thicknessMm=16),
        tags=["kitchen", "upper"],
    ),
    Template(
        id="mod-open-module",
        code="open-module",
        name="Открытый модуль",
        category=TemplateCategory.MODULE,
        previewImageUrl="/static/previews/open_module.png",
        rootItemTreeDto=_open_module_tree,
        defaultDimensions=Dimensions(widthMm=400, heightMm=720, depthMm=350, thicknessMm=16),
        tags=["kitchen", "open"],
    ),
    Template(
        id="mod-dresser-shelf",
        code="dresser-shelf",
        name="Тумба с полкой",
        category=TemplateCategory.MODULE,
        previewImageUrl="/static/previews/dresser_shelf.png",
        rootItemTreeDto=_dresser_shelf_tree,
        defaultDimensions=Dimensions(widthMm=600, heightMm=550, depthMm=400, thicknessMm=16),
        tags=["furniture", "storage"],
    ),
    # --- 6 parts ---
    _part_template("part-side-panel", "side-panel", "Боковая панель",
                   "panel", "side_panel", _dims(16, 720, 560, 16)),
    _part_template("part-shelf", "shelf", "Полка",
                   "shelf", "shelf", _dims(568, 16, 540, 16)),
    _part_template("part-door", "door", "Дверца",
                   "door", "hinged_door", _dims(596, 716, 16, 16),
                   material_id="mat-mdf-white-16"),
    _part_template("part-partition", "partition", "Перегородка",
                   "panel", "partition", _dims(16, 688, 540, 16)),
    _part_template("part-plinth", "plinth", "Цоколь",
                   "panel", "plinth", _dims(568, 80, 16, 16)),
    _part_template("part-countertop", "countertop", "Столешница",
                   "panel", "countertop", _dims(600, 38, 560, 38),
                   material_id="mat-countertop-oak-38"),
]
