import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'

// In-memory rate limiter: max 3 submissions per IP per 10 minutes
const submissionMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const RATE_LIMIT_MAX = 3

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (submissionMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  )
  if (timestamps.length >= RATE_LIMIT_MAX) return true
  submissionMap.set(ip, [...timestamps, now])
  return false
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    group: 'System',
  },
  access: {
    // Anyone can create (public contact form)
    create: () => true,
    // Only admins and editors can read lead data
    read: isAdminOrEditor,
    // No public update or delete
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeOperation: [
      async ({ operation, req }) => {
        if (operation !== 'create') return
        const ip =
          req.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ??
          (req as any).ip ??
          'unknown'

        if (isRateLimited(ip)) {
          throw new Error(
            'Too many messages submitted in a short time. Please try again later.',
          )
        }
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          minLength: 2,
          maxLength: 100,
          admin: { width: '50%' },
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      maxLength: 200,
      admin: {
        description: 'Optional subject line for context.',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      minLength: 10,
      maxLength: 2000,
      admin: {
        description: 'The contact message.',
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'contact_form',
      options: [
        { label: 'Contact Form', value: 'contact_form' },
        { label: 'Direct Email', value: 'direct_email' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        description: 'How this lead was received.',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
