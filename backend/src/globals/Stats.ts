import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const Stats: GlobalConfig = {
  slug: 'stats',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'items',
      label: 'Performance Statistics',
      type: 'array',
      labels: {
        singular: 'Statistic',
        plural: 'Statistics',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { width: '40%' },
            },
            {
              name: 'value',
              type: 'number',
              required: true,
              admin: { width: '20%' },
            },
            {
              name: 'prefix',
              type: 'text',
              admin: { width: '20%' },
            },
            {
              name: 'suffix',
              type: 'text',
              admin: { width: '20%' },
            },
          ],
        },
      ],
    },
  ],
}
