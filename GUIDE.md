# thr_d — Руководство пользователя и администратора

## 1. Установка и запуск

### 1.1. Требования

| Компонент | Версия |
|-----------|--------|
| Docker | 24+ |
| Docker Compose | v2+ |
| Node.js | 22+ (для локальной разработки frontend) |
| Python | 3.12+ (для локальной разработки backend) |
| uv | последняя (менеджер пакетов Python) |

### 1.2. Быстрый запуск через Docker Compose

```bash
git clone https://github.com/zorgoalex/thr_d.git
cd thr_d

# Скопировать шаблон переменных окружения
cp .env.example .env

# Собрать и запустить все сервисы
docker compose up --build -d --wait
```

После запуска:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1
- **Health check**: http://localhost:8000/api/v1/health
- **PostgreSQL**: localhost:5432

Остановка:
```bash
docker compose down        # остановить, сохранить данные
docker compose down -v     # остановить и удалить volumes (БД)
```

### 1.3. Локальная разработка без Docker

#### Backend

```bash
cd backend

# Установить uv (если не установлен)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Установить зависимости
uv sync --dev

# Запустить сервер (SQLite по умолчанию для разработки)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Запустить тесты
uv run pytest

# Запустить линтер
uv run ruff check app/ tests/
```

#### Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev

# Запустить тесты
npm test

# Проверить TypeScript
npx tsc -b

# Собрать для production
npm run build
```

### 1.4. Переменные окружения

| Переменная | По умолчанию | Описание |
|-----------|--------------|----------|
| `POSTGRES_DB` | `thr_d` | Имя базы данных |
| `POSTGRES_USER` | `postgres` | Пользователь БД |
| `POSTGRES_PASSWORD` | `postgres` | Пароль БД |
| `POSTGRES_PORT` | `5432` | Порт PostgreSQL |
| `BACKEND_PORT` | `8000` | Порт backend API |
| `BACKEND_DATABASE_URL` | `postgresql+psycopg://...` | Строка подключения к БД |
| `BACKEND_CORS_ALLOWED_ORIGINS` | `["http://localhost:5173"]` | Разрешённые CORS-источники |
| `BACKEND_LOG_LEVEL` | `INFO` | Уровень логирования |
| `FRONTEND_PORT` | `5173` | Порт frontend |

### 1.5. Smoke-тест стенда

```bash
bash infra/scripts/smoke_compose.sh
```

Скрипт проверяет: health backend, доступность frontend, БД, каталоги, validate, export.

---

## 2. Описание функций и интерфейса

### 2.1. Стартовый экран

При открытии приложения пользователь видит стартовый экран с:

- **Новый пустой проект** — создаёт проект с пустой комнатой
- **Размеры помещения** — ввод ширины, длины, высоты комнаты (мм). По умолчанию: 3000 x 3000 x 2700 мм
- **Стартовые шаблоны** — выбор из готовых проектов (шкаф, тумба, стеллаж, прямая кухня). При выборе шаблон разворачивается в полноценные редактируемые элементы (не "чёрный ящик")
- **Восстановить из автосохранения** — восстановление последнего сеанса из IndexedDB

### 2.2. Редактор

Редактор состоит из 4 зон:

```
+----------------------------------------------------------+
|                      Top Bar                              |
|  thr_d | Room: 3000x3000x2700 | Undo Redo | Export | ... |
+----------+---------------------------+-------------------+
|          |                           |                   |
| Left     |       3D Viewport         |   Right Panel     |
| Panel    |                           |   (Properties)    |
| (Library)|                           |                   |
|          |                           |                   |
+----------+---------------------------+-------------------+
|                    Status Bar                             |
+----------------------------------------------------------+
```

#### Top Bar
- **Undo / Redo** — отмена/повтор действий (до 50 шагов)
- **JSON** — экспорт проекта в project.json
- **CSV** — экспорт спецификации в CSV (через backend API)
- **GLB** — экспорт 3D-сцены в GLB (генерируется на клиенте)
- **Import** — импорт project.json с проверкой версии

#### Left Panel (Библиотека) — 7 вкладок

| Вкладка | Содержимое |
|---------|-----------|
| Templates | Стартовые шаблоны проектов (шкаф, тумба, стеллаж, кухня) |
| Modules | Модули (нижний/верхний шкаф, открытый модуль, тумба с полкой) |
| Parts | Детали (боковая панель, полка, дверца, перегородка, цоколь, столешница) |
| Materials | Каталог материалов с цветовыми превью |
| Custom | Форма создания кастомной прямоугольной панели |
| Tree | Дерево проекта (иерархия элементов) |
| Issues | Панель валидации (ошибки и предупреждения) |

Вставка объектов: **двойной клик** или кнопка **Add**. Объект размещается в центре комнаты на полу.

#### 3D Viewport
- **5 режимов камеры**: Perspective, Front, Left, Right, Top
- **Управление**: orbit (перспектива), pan, zoom
- **Выделение**: клик по объекту — синяя рамка
- **Ошибки**: красная рамка на объектах с проблемами валидации
- **Комната**: полупрозрачный пол + wireframe-каркас

#### Right Panel (Свойства)
При выделении объекта отображаются:
- **Name** — имя элемента
- **Position X/Y/Z** — позиция в мм
- **Rotation Y** — поворот (0°, 90°, 180°, 270°)
- **Dimensions** — размеры (если разрешено constraints)
- **Material** — выпадающий список материалов
- **Delete** — удаление (с каскадным удалением детей для assembly)

Смена материала на assembly каскадно обновляет все незаблокированные дочерние элементы.

#### Status Bar
- Статус автосохранения (время последнего сохранения)
- Количество ошибок / предупреждений валидации

### 2.3. Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `1` | Perspective камера |
| `2` | Front камера |
| `3` | Left камера |
| `4` | Right камера |
| `5` | Top камера |
| `Escape` | Снять выделение |
| `Delete` / `Backspace` | Удалить выделенный объект |
| `Ctrl+Z` | Отмена (undo) |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Повтор (redo) |
| `Ctrl+D` | Клонировать выделенный объект |

### 2.4. Автосохранение

- Проект автоматически сохраняется в **IndexedDB** браузера
- Debounce: 1500 мс после последнего изменения
- Сохраняется: канонический JSON проекта + UI state (панели, вкладка, камера)
- **Не** сохраняется: история undo/redo, текстуры
- При перезагрузке: предлагает восстановить из автосохранения на стартовом экране

### 2.5. Валидация

Валидация запускается автоматически при каждом изменении проекта (debounce 150 мс).

**Клиентская валидация** (мгновенная, в браузере):
- Проверка границ комнаты
- Проверка пересечений объектов (AABB)
- Проверка размеров и толщины
- Проверка поворота
- Проверка координатного диапазона

**Серверная валидация** (через POST /api/v1/projects/validate):
- Те же проверки + обнаружение циклов parentId
- Лимит 500 объектов в проекте
- Лимит 5 МБ на тело запроса

Пороги:
- Epsilon (сравнение чисел): 0.01 мм
- Порог пересечения: > 0.5 мм = ошибка, ≤ 0.5 мм = допустимый контакт сборки
- Snap-расстояние: 10 мм

---

## 3. Форматы данных

### 3.1. Входные / импортируемые форматы

#### project.json (импорт проекта)

Каноническая модель проекта. Импортируется через кнопку **Import** в редакторе.

```json
{
  "id": "project-demo",
  "name": "My Kitchen",
  "version": "1.0",
  "unit": "mm",
  "room": {
    "widthMm": 3000,
    "lengthMm": 3000,
    "heightMm": 2700,
    "origin": { "xMm": 0, "yMm": 0, "zMm": 0 }
  },
  "items": [
    {
      "id": "item-1",
      "type": "panel",
      "subtype": "side_panel",
      "name": "Side Panel",
      "parentId": null,
      "sortIndex": 0,
      "dimensions": {
        "widthMm": 16,
        "heightMm": 720,
        "depthMm": 560,
        "thicknessMm": 16
      },
      "transform": {
        "xMm": 0,
        "yMm": 0,
        "zMm": 0,
        "rotationYDeg": 0
      },
      "materialId": "mat-ldsp-white-16",
      "grainDirection": null,
      "visibility": true,
      "locked": false,
      "constraints": null,
      "sourceTemplateId": null
    }
  ],
  "materials": [
    {
      "id": "mat-ldsp-white-16",
      "code": "LDSP-WHITE-16",
      "name": "ЛДСП Белый 16мм",
      "color": "#ffffff",
      "textureUrl": "/static/textures/ldsp_white_16.jpg",
      "thicknessMmDefault": 16,
      "grainDirection": "none",
      "category": "laminate"
    }
  ],
  "metadata": {
    "createdAt": "2026-03-16T00:00:00Z",
    "updatedAt": "2026-03-16T00:00:00Z",
    "sourceTemplateId": null,
    "authorNote": null
  }
}
```

**Правила импорта:**
- `version` должна быть `"1.0"` (если другая — предупреждение)
- Обязательные поля: `id`, `name`, `version`, `room`, `items`, `materials`, `metadata`
- `unit` всегда `"mm"`
- `rotationYDeg` допускает только 0, 90, 180, 270
- `items[]` — плоский массив с иерархией через `parentId`

**Типы элементов (`type`):**
- `assembly` — сборка (логическая группа, не физическая деталь)
- `part` — деталь
- `panel` — панель
- `shelf` — полка
- `door` — дверца
- `drawerBlock` — блок ящиков

### 3.2. Выходные / экспортируемые форматы

#### project.json (экспорт проекта)

Идентичен формату импорта. Полная каноническая модель без потери полей. Генерируется на клиенте. Кодировка: UTF-8.

#### specification.csv (спецификация деталей)

Генерируется на сервере через `POST /api/v1/projects/export` с форматом `specification.csv`.

**Формат:**
- Разделитель: `;` (точка с запятой)
- Кодировка: UTF-8 с BOM (`\xEF\xBB\xBF`)
- Перенос строки: `\n`

**Колонки:**

| # | Колонка | Описание |
|---|---------|----------|
| 1 | `type` | Тип элемента (panel, shelf, door...) |
| 2 | `subtype` | Подтип (side_panel, hinged_door...) |
| 3 | `materialCode` | Код материала (LDSP-WHITE-16) |
| 4 | `materialName` | Название материала |
| 5 | `widthMm` | Ширина (мм) |
| 6 | `heightMm` | Высота (мм) |
| 7 | `depthMm` | Глубина (мм) |
| 8 | `thicknessMm` | Толщина (мм) |
| 9 | `grainDirection` | Направление волокон (none/lengthwise/crosswise) |
| 10 | `quantity` | Количество одинаковых деталей |

**Правила агрегации:**
- Элементы типа `assembly` **исключаются** (они не физические детали)
- Группировка (ключ агрегации): type + subtype + materialId + widthMm + heightMm + depthMm + thicknessMm + grainDirection
- Эффективное направление волокон: `item.grainDirection ?? material.grainDirection`
- Сортировка: materialName ASC → type ASC → widthMm → heightMm → depthMm

**Пример:**
```csv
type;subtype;materialCode;materialName;widthMm;heightMm;depthMm;thicknessMm;grainDirection;quantity
panel;side_panel;LDSP-WHITE-16;ЛДСП Белый 16мм;16.0;720.0;560.0;16.0;none;2
panel;bottom_panel;LDSP-WHITE-16;ЛДСП Белый 16мм;568.0;16.0;560.0;16.0;none;1
shelf;shelf;LDSP-WHITE-16;ЛДСП Белый 16мм;568.0;16.0;540.0;16.0;none;1
door;hinged_door;MDF-WHITE-16;МДФ Белый 16мм;596.0;716.0;16.0;16.0;none;1
panel;back_panel;DVP-WHITE-3;ДВП Белый 3мм;596.0;716.0;3.0;3.0;none;1
```

#### scene.glb (3D-модель сцены)

Генерируется на клиенте из R3F-сцены через `GLTFExporter`.

- Формат: glTF 2.0 Binary (`.glb`)
- Содержит: все видимые объекты сцены как BoxGeometry с материалами (цвет)
- Координаты: миллиметры
- **Не содержит**: текстуры (только цвета), metadata проекта

### 3.3. API форматы

#### Запрос валидации

`POST /api/v1/projects/validate`

```json
{
  "project": { /* project.json */ }
}
```

Ответ:
```json
{
  "ok": true,
  "issues": [],
  "traceId": "uuid"
}
```

#### Запрос спецификации

`POST /api/v1/projects/specification`

```json
{
  "project": { /* project.json */ }
}
```

Ответ:
```json
{
  "rows": [ /* SpecificationRow[] */ ],
  "issues": [],
  "traceId": "uuid"
}
```

#### Запрос экспорта

`POST /api/v1/projects/export`

```json
{
  "project": { /* project.json */ },
  "formats": ["project.json", "specification.csv"]
}
```

Ответ:
```json
{
  "jobs": [
    {
      "id": "uuid",
      "format": "project.json",
      "status": "ready",
      "createdAt": "2026-03-16T00:00:00Z",
      "expiresAt": "2026-03-16T00:15:00Z",
      "inlineContent": "{ ... }",
      "downloadUrl": null,
      "error": null,
      "traceId": "uuid"
    }
  ],
  "traceId": "uuid"
}
```

**Допустимые форматы**: `project.json`, `specification.csv`, `scene.glb`, `step`, `fcstd`, `obj`

**Статусы ExportJob**: `ready` (содержимое доступно), `pending` (в обработке), `failed` (ошибка), `expired` (TTL истёк)

#### Формат ошибок API

Все ошибки API возвращаются в едином формате:

```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "traceId": "uuid",
  "details": null
}
```

**Коды ошибок валидации**: `ROOM_BOUNDS_EXCEEDED`, `ITEM_INTERSECTION`, `INVALID_DIMENSIONS`, `INVALID_THICKNESS`, `OUT_OF_ALLOWED_WORLD_RANGE`, `ITEM_BELOW_FLOOR`, `INVALID_ROTATION`, `PROJECT_LIMIT_EXCEEDED`, `PARENT_CYCLE_DETECTED`

**HTTP-коды ошибок**: 413 (body too large), 422 (validation error), 429 (rate limit), 410 (export expired), 501 (not implemented)

### 3.4. Демо-каталог

Приложение поставляется с предустановленными данными:

**8 материалов:**
- ЛДСП Белый/Серый/Дуб светлый/Дуб тёмный (16 мм)
- МДФ Белый (16 мм и 18 мм)
- Столешница Дуб (38 мм)
- ДВП Белый (3 мм)

**4 шаблона проектов:** шкаф, тумба, стеллаж, прямая кухня

**4 модуля:** нижний шкаф, верхний шкаф, открытый модуль, тумба с полкой

**6 деталей:** боковая панель, полка, дверца, перегородка, цоколь, столешница
