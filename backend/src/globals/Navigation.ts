import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'menuItems',
      type: 'array',
      required: true,
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
              admin: { width: '50%' },
            },
            {
              name: 'link',
              type: 'text',
              required: true,
              admin: { 
                  width: '50%',
                  placeholder: 'e.g., /projects or https://...',
              },
            },
          ],
        },
      ],
    },
  ],
}
