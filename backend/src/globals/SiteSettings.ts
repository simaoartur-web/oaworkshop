import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAdmin } from '../access/isAdmin'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'studioName',
          type: 'text',
          required: true,
          defaultValue: 'O+A Architecture and Planners',
          admin: { width: '50%' },
        },
        {
          name: 'contactEmail',
          type: 'email',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'contactPhone',
          type: 'text',
          admin: { width: '40%' },
        },
        {
          name: 'address',
          type: 'textarea',
          required: true,
          admin: { width: '60%' },
        },
      ],
    },
    {
      name: 'socialMedia',
      type: 'array',
      labels: {
        singular: 'Social Link',
        plural: 'Social Links',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'Twitter/X', value: 'twitter' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'defaultSEO',
      label: 'Global SEO Defaults',
      type: 'group',
      admin: {
        description: 'Fallback titles and descriptions used when specific page SEO is missing.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
  ],
}
