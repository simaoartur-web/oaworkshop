import type { Access } from 'payload'

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  return Boolean(user?.roles?.some(role => ['admin', 'editor'].includes(role)))
}
