import type { SiteConfig } from '@/shared/types'

/**
 * Site-wide configuration: identity, SEO defaults, and personal social links.
 *
 * This is the single place to edit your name, email, resume path, and
 * GitHub/LinkedIn URLs — every section that displays them reads from here.
 */
export const SITE: SiteConfig = {
  name: 'Akshay Tiwari',
  role: 'Computer Science Student | AI/ML',
  email: 'akkitiw@gmail.com',
  location: 'India',
  resumePath: '/resume/Akshay-Tiwari-Resume.pdf',
  resumePreview: '/resume/resume-preview.png',
  siteUrl: 'https://akshaytiwari.dev',
  title: 'Akshay Tiwari | Computer Science Student',
  description:
    'Portfolio of Akshay Tiwari — Computer Science student at SRMCEM building AI/ML projects including Lumora, a RAG-based academic assistant.',
  keywords: [
    'Akshay Tiwari',
    'Computer Science student',
    'AI ML portfolio',
    'RAG project',
    'Lumora',
    'SRMCEM',
  ],
  social: {
    github: 'https://github.com/Akshay6601',
    linkedin: 'https://www.linkedin.com/in/akshay-tiwari-964a32262/',
    githubDisplay: 'github.com/Akshay6601',
    linkedinDisplay: 'linkedin.com/in/akshay-tiwari-964a32262',
  },
}
