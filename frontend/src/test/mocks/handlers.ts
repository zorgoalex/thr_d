import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:8000/api/v1/templates', () => {
    return HttpResponse.json({
      items: [
        {
          id: 'tpl-wardrobe',
          code: 'wardrobe',
          name: 'Шкаф',
          category: 'project_template',
          previewImageUrl: null,
          rootItemTreeDto: {
            id: 'root', type: 'assembly', subtype: 'wardrobe', name: 'Шкаф',
            dimensions: { widthMm: 1200, heightMm: 2100, depthMm: 600, thicknessMm: 16 },
            transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
            materialId: null,
            children: [
              {
                id: 'left', type: 'panel', subtype: 'side_panel', name: 'Left',
                dimensions: { widthMm: 16, heightMm: 2100, depthMm: 600, thicknessMm: 16 },
                transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
                materialId: 'mat-ldsp-white-16', children: [],
              },
            ],
          },
          defaultDimensions: { widthMm: 1200, heightMm: 2100, depthMm: 600, thicknessMm: 16 },
          tags: ['furniture'],
        },
        {
          id: 'tpl-nightstand',
          code: 'nightstand',
          name: 'Тумба',
          category: 'project_template',
          previewImageUrl: null,
          rootItemTreeDto: {
            id: 'root', type: 'assembly', subtype: 'nightstand', name: 'Тумба',
            dimensions: { widthMm: 500, heightMm: 550, depthMm: 400, thicknessMm: 16 },
            transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
            materialId: null, children: [],
          },
          defaultDimensions: { widthMm: 500, heightMm: 550, depthMm: 400, thicknessMm: 16 },
          tags: ['furniture'],
        },
      ],
      traceId: 'test-trace',
    })
  }),

  http.get('http://localhost:8000/api/v1/modules', () => {
    return HttpResponse.json({
      items: [
        {
          id: 'mod-lower-cabinet',
          code: 'lower-cabinet',
          name: 'Нижний шкаф',
          category: 'module',
          previewImageUrl: null,
          rootItemTreeDto: {
            id: 'root', type: 'assembly', subtype: 'lower_cabinet', name: 'Нижний шкаф',
            dimensions: { widthMm: 600, heightMm: 720, depthMm: 560, thicknessMm: 16 },
            transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
            materialId: null, children: [],
          },
          defaultDimensions: { widthMm: 600, heightMm: 720, depthMm: 560, thicknessMm: 16 },
          tags: ['kitchen'],
        },
        {
          id: 'part-shelf',
          code: 'shelf',
          name: 'Полка',
          category: 'module',
          previewImageUrl: null,
          rootItemTreeDto: {
            id: 'root', type: 'shelf', subtype: 'shelf', name: 'Полка',
            dimensions: { widthMm: 568, heightMm: 16, depthMm: 540, thicknessMm: 16 },
            transform: { xMm: 0, yMm: 0, zMm: 0, rotationYDeg: 0 },
            materialId: 'mat-ldsp-white-16', children: [],
          },
          defaultDimensions: { widthMm: 568, heightMm: 16, depthMm: 540, thicknessMm: 16 },
          tags: ['part'],
        },
      ],
      traceId: 'test-trace',
    })
  }),

  http.get('http://localhost:8000/api/v1/materials', () => {
    return HttpResponse.json({
      items: [
        {
          id: 'mat-ldsp-white-16',
          code: 'LDSP-WHITE-16',
          name: 'ЛДСП Белый 16мм',
          color: '#ffffff',
          textureUrl: null,
          thicknessMmDefault: 16,
          grainDirection: 'none',
          category: 'laminate',
        },
        {
          id: 'mat-mdf-white-16',
          code: 'MDF-WHITE-16',
          name: 'МДФ Белый 16мм',
          color: '#f5f5f5',
          textureUrl: null,
          thicknessMmDefault: 16,
          grainDirection: 'none',
          category: 'mdf',
        },
      ],
      traceId: 'test-trace',
    })
  }),
]
