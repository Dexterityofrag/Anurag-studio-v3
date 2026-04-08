import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'

// ─── PROJECTS ────────────────────────────────────────────────
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  tagline: text('tagline'),
  description: jsonb('description'),           // Tiptap JSON
  descriptionHtml: text('description_html'),
  thumbnailUrl: text('thumbnail_url'),
  coverUrl: text('cover_url'),
  images: jsonb('images').$type<ImageItem[]>().default([]),
  tags: text('tags').array().default([]),
  client: text('client'),
  role: text('role'),
  year: integer('year'),
  externalUrl: text('external_url'),
  isFeatured: boolean('is_featured').default(false),
  isPublished: boolean('is_published').default(false),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ─── BLOG POSTS ───────────────────────────────────────────────
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  excerpt: text('excerpt'),
  content: jsonb('content'),                   // Tiptap JSON
  contentHtml: text('content_html'),
  coverUrl: text('cover_url'),
  tags: text('tags').array().default([]),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  readingTimeMinutes: integer('reading_time_minutes').default(5),
  externalUrl: text('external_url'),           // Medium / external link (if set, clicking redirects there)
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ─── SITE CONTENT (key-value CMS) ─────────────────────────────
export const siteContent = pgTable('site_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').unique().notNull(),         // e.g. "hero.title"
  value: text('value'),
  contentType: text('content_type').default('text'), // text | html | url | json
  groupName: text('group_name'),               // hero | footer | meta | about | nav
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ─── SOCIAL LINKS ─────────────────────────────────────────────
export const socialLinks = pgTable('social_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  iconName: text('icon_name'),
  displayOrder: integer('display_order').default(0),
  isVisible: boolean('is_visible').default(true),
})

// ─── ABOUT INFO ───────────────────────────────────────────────
export const aboutInfo = pgTable('about_info', {
  id: uuid('id').defaultRandom().primaryKey(),
  section: text('section').notNull(),          // bio | skill | experience | education
  title: text('title'),
  content: text('content'),
  metadata: jsonb('metadata').$type<AboutMetadata>(),
  displayOrder: integer('display_order').default(0),
})

// ─── TESTIMONIALS ─────────────────────────────────────────────
export const testimonials = pgTable('testimonials', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role'),
  authorAvatarUrl: text('author_avatar_url'),
  quote: text('quote').notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  isVisible: boolean('is_visible').default(true),
  displayOrder: integer('display_order').default(0),
})

// ─── MEDIA ────────────────────────────────────────────────────
export const media = pgTable('media', {
  id: uuid('id').defaultRandom().primaryKey(),
  filename: text('filename').notNull(),
  storagePath: text('storage_path').notNull(),  // DO Spaces object key
  url: text('url').notNull(),                   // CDN public URL
  altText: text('alt_text'),
  mimeType: text('mime_type'),
  width: integer('width'),
  height: integer('height'),
  folder: text('folder').default('general'),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── PARTNERS (Worked With section) ──────────────────────────
export const partners = pgTable('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  sector: text('sector').notNull(),
  link: text('link').notNull(),
  external: boolean('external').default(false),
  comingSoon: boolean('coming_soon').default(false),
  previewImageUrl: text('preview_image_url'),      // null = show coming soon card
  displayOrder: integer('display_order').default(0),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ─── ADMIN CREDENTIALS ───────────────────────────────────────
export const adminCredentials = pgTable('admin_credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ─── JSONB HELPER TYPES ───────────────────────────────────────
export type ImageItem = {
  url: string
  alt?: string
  caption?: string
}

export type AboutMetadata = {
  company?: string
  start_date?: string
  end_date?: string
  location?: string
  tags?: string[]
  proficiency?: number  // 0-100 for skill bars
}
