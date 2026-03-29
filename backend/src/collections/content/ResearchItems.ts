import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'
import { formatSlug } from '../../hooks/formatSlug'

export const ResearchItems: CollectionConfig = {
  slug: 'research-items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'published_date', '_status'],
    preview: (doc: any) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'}/research/${doc.slug}`
      }
      return null
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        _status: {
          equals: 'published',
        },
      }
    },
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Editorial Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'abstract',
              type: 'textarea',
              required: true,
              admin: {
                description: 'Short summary for research cards and previews.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              admin: {
                description: 'The full body of the research paper or article.',
              },
            },
          ],
        },
        {
          label: 'Media & Attachments',
          fields: [
            {
              name: 'featured_image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Primary visual for the research item.',
              },
            },
            {
              name: 'file_attachment',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Downloadable PDF or technical document.',
              },
            },
          ],
        },
        {
          label: 'Metadata',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'author',
                  type: 'relationship',
                  relationTo: 'team-members',
                  admin: { width: '50%' },
                },
                {
                  name: 'discipline',
                  type: 'relationship',
                  relationTo: 'disciplines',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
      access: {
        update: ({ req: { user }, data }: any) => {
            const isAdmin = user?.roles?.includes('admin');
            const isPublished = data?._status === 'published';
            return isAdmin || !isPublished;
        },
      },
      admin: {
        position: 'sidebar',
        description: 'URL identifier for this item.',
      },
    },
    {
      name: 'published_date',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
