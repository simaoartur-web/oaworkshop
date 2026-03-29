import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  admin: {
    preview: () => {
      return `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'}/`
    },
  },
  fields: [
    {
      name: 'hero',
      label: 'Main Hero Section',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { width: '50%' },
            },
            {
              name: 'subtitle',
              type: 'text',
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'High-resolution wide image for the homepage splash.',
          },
        },
      ],
    },
    {
      name: 'intro',
      label: 'Introduction Segment',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
        },
        {
          name: 'content',
          type: 'richText',
        },
      ],
    },
    {
      name: 'sectionVisibility',
      label: 'Homepage Section Display',
      type: 'group',
      admin: {
        description: 'Toggle which architectural storytelling blocks are visible on the homepage.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'showExpertise', type: 'checkbox', defaultValue: true },
            { name: 'showProjects', type: 'checkbox', defaultValue: true },
            { name: 'showMap', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'showNews', type: 'checkbox', defaultValue: true },
            { name: 'showWorkshop', type: 'checkbox', defaultValue: true },
            { name: 'showTeam', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          name: 'showStats',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: {
        description: 'Select up to 6 projects to feature prominently on the homepage.',
      },
      validate: (val: any) => {
          if (Array.isArray(val) && val.length > 6) {
              return 'You can only feature a maximum of 6 projects to maintain a curated layout.';
          }
          return true;
      },
    },
    {
      name: 'cta',
      label: 'Call to Action (Footer Area)',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: { placeholder: 'e.g., Get in Touch' },
            },
            {
              name: 'link',
              type: 'text',
              admin: { 
                  placeholder: 'e.g., /contact or https://...',
                  description: 'Internal path or external URL.',
              },
            },
          ],
        },
      ],
    },
  ],
}
