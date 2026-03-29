import type { Access } from 'payload'

export const isEditor: Access = ({ req: { user } }) => {
  return Boolean(user?.roles?.includes('editor'))
}
