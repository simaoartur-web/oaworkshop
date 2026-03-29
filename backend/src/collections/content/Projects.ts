import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'
import { formatSlug } from '../../hooks/formatSlug'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'discipline', 'project_year', '_status'],
    preview: (doc: any) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'}/projects/${doc.slug}`
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
          label: 'Project Content',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '60%',
                  },
                },
                {
                  name: 'client',
                  type: 'text',
                  admin: {
                    width: '40%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'project_year',
                  type: 'number',
                  admin: {
                    width: '33%',
                  },
                },
                {
                  name: 'discipline',
                  type: 'relationship',
                  relationTo: 'disciplines',
                  required: true,
                  admin: {
                    width: '33%',
                  },
                },
                {
                  name: 'project_type',
                  type: 'text',
                  admin: {
                    width: '34%',
                  },
                },
              ],
            },
            {
              name: 'short_description',
              type: 'textarea',
              admin: {
                description: 'A brief summary for project cards and map popups.',
              },
            },
            {
              name: 'full_description',
              type: 'richText',
              admin: {
                description: 'Detailed project narrative and specifications.',
              },
            },
          ],
        },
        {
          label: 'Images & Media',
          fields: [
            {
              name: 'featured_image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'The primary cover image used across the site.',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              labels: {
                singular: 'Gallery Image',
                plural: 'Gallery Images',
              },
              admin: {
                initCollapsed: true,
                description: 'Supporting imagery for the project details page.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Map & Location',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'city',
                  type: 'text',
                },
                {
                  name: 'country',
                  type: 'text',
                },
                {
                  name: 'region',
                  type: 'text',
                },
              ],
            },
            {
              name: 'geolocation',
              type: 'group',
              admin: {
                description: 'Geospatial coordinates for the interactive project globe.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'latitude',
                      type: 'number',
                      admin: {
                        placeholder: 'e.g., 45.4642',
                        description: 'Decimal degrees',
                      },
                    },
                    {
                      name: 'longitude',
                      type: 'number',
                      admin: {
                        placeholder: 'e.g., 9.1900',
                        description: 'Decimal degrees',
                      },
                    },
                  ],
                },
                {
                  name: 'show_on_map',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Make this project visible as a marker on the global map.',
                  },
                  validate: (val, { data }: any) => {
                    if (val && (!data?.geolocation?.latitude || !data?.geolocation?.longitude)) {
                      return 'Latitude and Longitude are required to enable map visibility.'
                    }
                    return true
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  admin: {
                    description: 'Search engine title (defaults to project title).',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  admin: {
                    description: 'Search engine meta description.',
                  },
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
            // Allow update if admin OR if not published yet
            return isAdmin || !isPublished;
        },
      },
      admin: {
        position: 'sidebar',
        description: 'Persistent URL handle. Changing after publish will break links.',
      },
    },
    {
      name: 'is_featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Pin this project to the top of the homepage feed.',
      },
    },
    {
      name: 'related_projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      validate: (val: any, { id }: any) => {
          if (Array.isArray(val)) {
              const ids: (string | number)[] = val.map((item: any) =>
                  typeof item === 'object' ? (item as any).id : item,
              )
              if (ids.includes(id)) return 'A project cannot relate to itself.'
              if (new Set(ids).size !== ids.length) return 'Duplicate related projects are not allowed.'
          }
          return true
      },
      admin: {
        position: 'sidebar',
        description: 'Selected projects will appear as "Related" on the details page.',
      },
    },
  ],
}
