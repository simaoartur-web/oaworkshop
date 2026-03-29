import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'
import { formatSlug } from '../../hooks/formatSlug'

export const Workshops: CollectionConfig = {
  slug: 'workshops',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventDate', 'status', '_status'],
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
          label: 'Workshop Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'richText',
              required: true,
              admin: {
                description: 'Detailed description of the workshop objectives and agenda.',
              },
            },
          ],
        },
        {
          label: 'Media & Gallery',
          fields: [
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Main promotional image for the workshop.',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              labels: {
                singular: 'Event Photo',
                plural: 'Event Photos',
              },
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Event Info & Logistics',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'eventDate',
                  type: 'date',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'location',
                  type: 'text',
                  admin: { 
                      width: '50%',
                      placeholder: 'e.g., Maputo Studio or Online',
                  },
                },
              ],
            },
            {
              name: 'registrationLink',
              type: 'text',
              admin: {
                placeholder: 'e.g., https://eventbrite.com/...',
                description: 'External link for participant sign-up.',
              },
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
        description: 'URL identifier for this workshop.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'upcoming',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Past', value: 'past' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
