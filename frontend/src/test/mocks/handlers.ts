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
          rootItemTreeDto: { id: 'root', type: 'assembly', children: [] },
          defaultDimensions: {
            widthMm: 1200,
            heightMm: 2100,
            depthMm: 600,
            thicknessMm: 16,
          },
          tags: ['furniture'],
        },
        {
          id: 'tpl-nightstand',
          code: 'nightstand',
          name: 'Тумба',
          category: 'project_template',
          previewImageUrl: null,
          rootItemTreeDto: { id: 'root', type: 'assembly', children: [] },
          defaultDimensions: {
            widthMm: 500,
            heightMm: 550,
            depthMm: 400,
            thicknessMm: 16,
          },
          tags: ['furniture'],
        },
      ],
      traceId: 'test-trace',
    })
  }),
]
