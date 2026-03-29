import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'role', 'displayOrder', 'activeStatus'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'fullName',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'role',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'portraitImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Professional headshot for the team section.',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Brief professional biography.',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      labels: {
        singular: 'Link',
        plural: 'Links',
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
                { label: 'Twitter/X', value: 'twitter' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Website', value: 'website' },
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
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first in the list.',
      },
    },
    {
      name: 'activeStatus',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck to hide this team member from the public website.',
      },
    },
  ],
}
