import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'
import { formatSlug } from '../../hooks/formatSlug'

export const Disciplines: CollectionConfig = {
  slug: 'disciplines',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'activeStatus'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'e.g., Architecture or Urban Planning',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      required: true,
      admin: {
        description: 'A professional overview of this practice area.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'coverImage',
          type: 'upload',
          relationTo: 'media',
          admin: { width: '50%' },
        },
        {
          name: 'themeColor',
          type: 'text',
          defaultValue: '#C45532',
          admin: { 
            width: '50%',
            description: 'Hex code for the discipline accent color.',
          },
        },
      ],
    },
    {
      name: 'mapMarkerIcon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional custom marker icon for map visualization.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [formatSlug('name')],
      },
      admin: {
        position: 'sidebar',
        description: 'URL identifier for this discipline.',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'activeStatus',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
