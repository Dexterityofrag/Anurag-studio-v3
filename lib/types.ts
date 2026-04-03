import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type {
  projects,
  blogPosts,
  siteContent,
  socialLinks,
  aboutInfo,
  testimonials,
  media,
} from './db/schema'

// ─── SELECT TYPES (read from DB) ─────────────────────────────
export type Project = InferSelectModel<typeof projects>
export type BlogPost = InferSelectModel<typeof blogPosts>
export type SiteContent = InferSelectModel<typeof siteContent>
export type SocialLink = InferSelectModel<typeof socialLinks>
export type AboutInfo = InferSelectModel<typeof aboutInfo>
export type Testimonial = InferSelectModel<typeof testimonials>
export type Media = InferSelectModel<typeof media>

// ─── INSERT TYPES (write to DB) ──────────────────────────────
export type NewProject = InferInsertModel<typeof projects>
export type NewBlogPost = InferInsertModel<typeof blogPosts>
export type NewSiteContent = InferInsertModel<typeof siteContent>
export type NewSocialLink = InferInsertModel<typeof socialLinks>
export type NewAboutInfo = InferInsertModel<typeof aboutInfo>
export type NewTestimonial = InferInsertModel<typeof testimonials>
export type NewMedia = InferInsertModel<typeof media>

// ─── CONVENIENCE TYPES ───────────────────────────────────────
export type ProjectWithTestimonials = Project & {
  testimonials: Testimonial[]
}

export type AboutSection = 'bio' | 'skill' | 'experience' | 'education'

export type SiteContentGroup = 'hero' | 'footer' | 'meta' | 'about' | 'nav'

// Site content as a key→value map for easy access
export type SiteContentMap = Record<string, string>
