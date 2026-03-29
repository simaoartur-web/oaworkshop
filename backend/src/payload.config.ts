import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/system/Users'
import { Media } from './collections/system/Media'
import { Disciplines } from './collections/content/Disciplines'
import { Projects } from './collections/content/Projects'
import { ResearchItems } from './collections/content/ResearchItems'
import { Workshops } from './collections/content/Workshops'
import { TeamMembers } from './collections/content/TeamMembers'

import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { FooterSettings } from './globals/FooterSettings'
import { Homepage } from './globals/Homepage'
import { Stats } from './globals/Stats'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Disciplines, Projects, ResearchItems, Workshops, TeamMembers],
  globals: [SiteSettings, Navigation, FooterSettings, Homepage, Stats],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./backend.db',
    },
  }),
  sharp,
  cors: [
    'http://localhost:5173',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  csrf: [
    'http://localhost:5173',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  plugins: [],
})
