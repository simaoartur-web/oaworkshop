import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const FooterSettings: GlobalConfig = {
  slug: 'footer-settings',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'copyright',
      type: 'text',
      required: true,
      defaultValue: '© 2026 O+A Architecture and Planners',
    },
    {
      name: 'secondaryLinks',
      label: 'Secondary Footer Links',
      type: 'array',
      labels: {
        singular: 'Link',
        plural: 'Links',
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
              admin: { width: '50%' },
            },
            {
              name: 'link',
              type: 'text',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'newsletterSignup',
      label: 'Newsletter Engagement',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: { placeholder: 'e.g., Subscribe to our Newsletter' },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'Encouragement text for newsletter signups.' },
        },
      ],
    },
  ],
}
