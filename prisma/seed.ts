/**
 * Phase 5.3 seed script — populates the Core Portfolio schema
 * (`prisma/schema.prisma`) with today's actual portfolio content.
 *
 * Every value seeded here is read directly from each feature's
 * `FALLBACK_*` constant in that feature's `data.ts` (under
 * `src/features/portfolio/`) — the exact same object literals the app
 * already renders today (and will keep
 * serving as a fallback once that feature moves to a Prisma-backed query,
 * see `src/lib/db-fallback.ts`). Seeding *from* those constants, rather
 * than re-typing the content a second time here, is what guarantees "the
 * seeded content must exactly match the existing portfolio" — there is
 * only one place this content is written down.
 *
 * Idempotent: clears every table this schema owns (children before
 * parents) before inserting, so running `npx prisma db seed` more than
 * once always converges on the same state instead of hitting unique-
 * constraint errors on a second run.
 *
 * Run via `npx prisma db seed` (wired up in `package.json`'s
 * `prisma.seed` field) or directly with `npx tsx prisma/seed.ts`.
 */

import { PrismaClient, type EducationType, type JourneyIcon, type SkillIcon, type SocialLinkIcon } from '@prisma/client'

import { getTechLogoSlug } from '@/constants/tech-logos'
import { FALLBACK_ABOUT_DATA } from '@/features/portfolio/about/data'
import { FALLBACK_CERTIFICATIONS } from '@/features/portfolio/certifications/data'
import { FALLBACK_CONTACT_INFO } from '@/features/portfolio/contact/data'
import type { ContactMethodIcon } from '@/features/portfolio/contact/types'
import { FALLBACK_EDUCATION } from '@/features/portfolio/education/data'
import type { EducationType as AppEducationType } from '@/features/portfolio/education/types'
import { FALLBACK_HERO_DATA } from '@/features/portfolio/hero/data'
import { FALLBACK_LEARNING_JOURNEY } from '@/features/portfolio/journey/data'
import type { JourneyIcon as AppJourneyIcon } from '@/features/portfolio/journey/types'
import { FALLBACK_PROJECTS } from '@/features/portfolio/projects/data'
import { FALLBACK_RESUME_DATA } from '@/features/portfolio/resume/data'
import { FALLBACK_SKILL_GROUPS } from '@/features/portfolio/skills/data'
import type { SkillGroupIcon } from '@/features/portfolio/skills/types'
import { toJson } from '@/lib/prisma-json'
import { mapAccentColorToDb } from '@/lib/prisma-enum-mappers'
import { SITE } from '@/config/site.config'
import { CHAT_MODEL, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from '@/lib/ai'
import { DEFAULT_AI_CHATBOT_PROMPT, DEFAULT_AI_SYSTEM_PROMPT } from '@/features/ai/data'
import { slugifyTechnologyName } from '@/lib/technology-resolver'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────
// App (lowercase / PascalCase) enum literal → Prisma (SCREAMING_CASE) enum.
// `AccentColor` reuses `src/lib/prisma-enum-mappers.ts`'s `mapAccentColorToDb`
// (Phase 5.4 added the write direction there once mutation actions needed
// it too); every other enum here is only ever needed by this seed script,
// so it stays local.
// ─────────────────────────────────────────────────────────────────────────

const SKILL_ICON_TO_DB: Record<SkillGroupIcon, SkillIcon> = {
  Code2: 'CODE2',
  Brain: 'BRAIN',
  Layout: 'LAYOUT',
  Wrench: 'WRENCH',
  Cloud: 'CLOUD',
}

const EDUCATION_TYPE_TO_DB: Record<AppEducationType, EducationType> = {
  school: 'SCHOOL',
  college: 'COLLEGE',
}

const SOCIAL_LINK_ICON_TO_DB: Record<ContactMethodIcon, SocialLinkIcon> = {
  github: 'GITHUB',
  linkedin: 'LINKEDIN',
  email: 'EMAIL',
  location: 'LOCATION',
}

const JOURNEY_ICON_TO_DB: Record<AppJourneyIcon, JourneyIcon> = {
  GraduationCap: 'GRADUATION_CAP',
  Brain: 'BRAIN',
  Workflow: 'WORKFLOW',
  Building2: 'BUILDING2',
  Globe: 'GLOBE',
  Zap: 'ZAP',
  Image: 'IMAGE',
  Target: 'TARGET',
  Sparkles: 'SPARKLES',
  Award: 'AWARD',
  Code2: 'CODE2',
  TerminalSquare: 'TERMINAL_SQUARE',
}

/** Deletes every row this schema owns, children before parents. */
async function clearDatabase() {
  await prisma.mediaAttachment.deleteMany()
  await prisma.socialLink.deleteMany()
  await prisma.projectTechnology.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.contactInformation.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.contactMessage.deleteMany()
  await prisma.aiConfiguration.deleteMany()
  await prisma.siteSettings.deleteMany()
  await prisma.project.deleteMany()
  await prisma.media.deleteMany()
  await prisma.technology.deleteMany()
  await prisma.skillCategory.deleteMany()
  await prisma.journeyMilestone.deleteMany()
  await prisma.education.deleteMany()
  await prisma.certification.deleteMany()
  await prisma.hero.deleteMany()
  await prisma.about.deleteMany()
  await prisma.resume.deleteMany()
}

async function seedHero() {
  await prisma.hero.create({
    data: {
      eyebrow: FALLBACK_HERO_DATA.eyebrow,
      title: FALLBACK_HERO_DATA.title,
      subtitle: FALLBACK_HERO_DATA.subtitle,
      description: FALLBACK_HERO_DATA.description,
      profileImage: FALLBACK_HERO_DATA.profileImage,
      interestCards: toJson(FALLBACK_HERO_DATA.interestCards),
      ctas: toJson(FALLBACK_HERO_DATA.ctas),
      showInterestCards: FALLBACK_HERO_DATA.showInterestCards,
    },
  })
}

async function seedAbout() {
  await prisma.about.create({
    data: {
      label: FALLBACK_ABOUT_DATA.label,
      title: FALLBACK_ABOUT_DATA.title,
      subtitle: FALLBACK_ABOUT_DATA.subtitle,
      story: FALLBACK_ABOUT_DATA.story,
      currentlyLearningTitle: FALLBACK_ABOUT_DATA.currentlyLearning.title,
      currentlyLearningItems: FALLBACK_ABOUT_DATA.currentlyLearning.items,
      interestsLabel: FALLBACK_ABOUT_DATA.interestsLabel,
      interests: FALLBACK_ABOUT_DATA.interests,
    },
  })
}

async function seedResume() {
  await prisma.resume.create({
    data: {
      label: FALLBACK_RESUME_DATA.label,
      title: FALLBACK_RESUME_DATA.title,
      filePath: FALLBACK_RESUME_DATA.filePath,
      previewImage: FALLBACK_RESUME_DATA.previewImage,
      previewAlt: FALLBACK_RESUME_DATA.previewAlt,
      previewImageWidth: FALLBACK_RESUME_DATA.previewImageWidth,
      previewImageHeight: FALLBACK_RESUME_DATA.previewImageHeight,
    },
  })
}

async function seedContact() {
  const contactInformation = await prisma.contactInformation.create({
    data: {
      label: FALLBACK_CONTACT_INFO.label,
      title: FALLBACK_CONTACT_INFO.title,
      description: FALLBACK_CONTACT_INFO.description,
      sayHelloLabel: FALLBACK_CONTACT_INFO.sayHelloLabel,
      sayHelloHref: FALLBACK_CONTACT_INFO.sayHelloHref,
    },
  })

  await prisma.socialLink.createMany({
    data: FALLBACK_CONTACT_INFO.methods.map((method, index) => ({
      contactInformationId: contactInformation.id,
      label: method.label,
      value: method.value,
      href: method.href,
      icon: SOCIAL_LINK_ICON_TO_DB[method.icon],
      order: index,
    })),
  })
}

async function seedEducation() {
  await prisma.education.createMany({
    data: FALLBACK_EDUCATION.map((entry, index) => ({
      type: EDUCATION_TYPE_TO_DB[entry.type],
      institution: entry.institution,
      shortName: entry.shortName ?? null,
      degree: entry.degree,
      period: entry.period,
      location: entry.location,
      description: entry.description,
      highlights: entry.highlights,
      expectedGraduation: entry.expectedGraduation ?? null,
      currentSemester: entry.currentSemester ?? null,
      order: index,
    })),
  })
}

async function seedCertifications() {
  await prisma.certification.createMany({
    data: FALLBACK_CERTIFICATIONS.map((certification, index) => ({
      name: certification.name,
      provider: certification.provider,
      providerLogo: certification.providerLogo,
      completionDate: certification.completionDate,
      credentialUrl: certification.credentialUrl,
      verifyUrl: certification.verifyUrl,
      image: certification.image,
      order: index,
    })),
  })
}

async function seedJourney() {
  await prisma.journeyMilestone.createMany({
    data: FALLBACK_LEARNING_JOURNEY.map((step, index) => ({
      label: step.label,
      year: step.year,
      description: step.description,
      icon: JOURNEY_ICON_TO_DB[step.icon],
      accent: mapAccentColorToDb(step.accent),
      isCurrent: step.isCurrent ?? false,
      subItems: step.subItems ?? [],
      order: index,
    })),
  })
}

/**
 * Every technology name referenced by either Projects (`techStack`) or
 * Skills (`items`), deduplicated by name and upserted once — the concrete
 * payoff of `domain-model.md §4.1`'s shared-`Technology` design: "React"
 * used in both a project's tech stack and a skill group resolves to the
 * exact same row. Returns a `name → id` lookup for the Project/Skill
 * seeders below.
 */
async function seedTechnologies(): Promise<Map<string, string>> {
  const names = new Set<string>()
  for (const project of FALLBACK_PROJECTS) {
    for (const name of project.techStack) names.add(name)
  }
  for (const group of FALLBACK_SKILL_GROUPS) {
    for (const item of group.items) names.add(item.name)
  }

  const nameToId = new Map<string, string>()
  for (const name of names) {
    const technology = await prisma.technology.create({
      data: {
        name,
        slug: slugifyTechnologyName(name),
        logoSlug: getTechLogoSlug(name),
      },
    })
    nameToId.set(name, technology.id)
  }
  return nameToId
}

async function seedProjects(technologyIdByName: Map<string, string>) {
  for (const [projectIndex, project] of FALLBACK_PROJECTS.entries()) {
    const created = await prisma.project.create({
      data: {
        slug: project.slug,
        featured: project.featured,
        isPlaceholder: project.isPlaceholder ?? false,
        name: project.name,
        category: project.category,
        heroEyebrow: project.heroEyebrow || null,
        tagline: project.tagline,
        description: project.description,
        github: project.github || null,
        liveDemo: project.liveDemo || null,
        demoLabel: project.demo?.label ?? null,
        demoHref: project.demo?.href ?? null,
        screenshot: project.screenshot,
        architectureImage: project.architectureImage || null,
        ragPipelineImage: project.ragPipelineImage ?? null,
        metrics: toJson(project.metrics),
        overview: project.overview,
        problem: project.problem,
        architecture: project.architecture,
        implementation: project.implementation,
        challenges: project.challenges,
        lessonsLearned: project.lessonsLearned,
        futureImprovements: project.futureImprovements,
        gallery: toJson(project.gallery),
        overviewTitle: project.overviewTitle,
        problemTitle: project.problemTitle,
        techStackTitle: project.techStackTitle,
        architectureTitle: project.architectureTitle,
        implementationTitle: project.implementationTitle,
        challengesTitle: project.challengesTitle,
        lessonsLearnedTitle: project.lessonsLearnedTitle,
        futureImprovementsTitle: project.futureImprovementsTitle,
        galleryTitle: project.galleryTitle,
        videoTitle: project.videoTitle,
        liveDemoTitle: project.liveDemoTitle,
        showOverview: project.showOverview,
        showProblem: project.showProblem,
        showTechStack: project.showTechStack,
        showArchitecture: project.showArchitecture,
        showImplementation: project.showImplementation,
        showChallenges: project.showChallenges,
        showLessonsLearned: project.showLessonsLearned,
        showFutureImprovements: project.showFutureImprovements,
        showGallery: project.showGallery,
        showVideo: project.showVideo,
        showLiveDemo: project.showLiveDemo,
        showMetrics: project.showMetrics,
        showArchitectureImage: project.showArchitectureImage,
        showRagPipelineImage: project.showRagPipelineImage,
        order: projectIndex,
      },
    })

    await prisma.projectTechnology.createMany({
      data: project.techStack.map((name, techIndex) => {
        const technologyId = technologyIdByName.get(name)
        if (!technologyId) {
          throw new Error(`[seed] Technology "${name}" referenced by project "${project.slug}" was not pre-seeded.`)
        }
        return { projectId: created.id, technologyId, order: techIndex }
      }),
    })

    for (const [galleryIndex, item] of project.gallery.entries()) {
      const media = await prisma.media.create({
        data: {
          url: item.src,
          secureUrl: null,
          provider: 'LOCAL',
          type: 'IMAGE',
          folder: 'seed/projects',
          altText: item.altText || item.caption,
        },
      })

      await prisma.mediaAttachment.create({
        data: {
          mediaId: media.id,
          attachableType: 'Project',
          attachableId: created.id,
          role: 'gallery',
          caption: item.caption,
          order: galleryIndex,
        },
      })
    }
  }
}

async function seedSkills(technologyIdByName: Map<string, string>) {
  for (const [groupIndex, group] of FALLBACK_SKILL_GROUPS.entries()) {
    const created = await prisma.skillCategory.create({
      data: {
        title: group.title,
        icon: SKILL_ICON_TO_DB[group.icon],
        accent: mapAccentColorToDb(group.accent),
        note: group.note,
        order: groupIndex,
      },
    })

    await prisma.skill.createMany({
      data: group.items.map((item, itemIndex) => {
        const technologyId = technologyIdByName.get(item.name)
        if (!technologyId) {
          throw new Error(`[seed] Technology "${item.name}" referenced by skill category "${group.title}" was not pre-seeded.`)
        }
        return { skillCategoryId: created.id, technologyId, order: itemIndex }
      }),
    })
  }
}

async function main() {
  console.log('[seed] Clearing existing rows...')
  await clearDatabase()

  console.log('[seed] Seeding Hero...')
  await seedHero()

  console.log('[seed] Seeding About...')
  await seedAbout()

  console.log('[seed] Seeding Technologies...')
  const technologyIdByName = await seedTechnologies()
  console.log(`[seed]   ${technologyIdByName.size} distinct technologies.`)

  console.log('[seed] Seeding Projects...')
  await seedProjects(technologyIdByName)

  console.log('[seed] Seeding Skills...')
  await seedSkills(technologyIdByName)

  console.log('[seed] Seeding Journey...')
  await seedJourney()

  console.log('[seed] Seeding Education...')
  await seedEducation()

  console.log('[seed] Seeding Certifications...')
  await seedCertifications()

  console.log('[seed] Seeding Resume...')
  await seedResume()

  console.log('[seed] Seeding Contact Information + Social Links...')
  await seedContact()

  console.log('[seed] Seeding Site Settings, AI config, and sample messages...')
  await seedPlatformModules()

  console.log('[seed] Done.')
}

async function seedPlatformModules() {
  await prisma.siteSettings.create({
    data: {
      siteTitle: SITE.title,
      siteDescription: SITE.description,
      keywords: SITE.keywords,
      ogImage: '/images/profile.jpg',
      favicon: '/icons/favicon.svg',
      github: SITE.social.github,
      linkedin: SITE.social.linkedin,
      githubDisplay: SITE.social.githubDisplay,
      linkedinDisplay: SITE.social.linkedinDisplay,
      maintenanceMode: false,
    },
  })

  await prisma.aiConfiguration.create({
    data: {
      provider: 'openai',
      chatModel: CHAT_MODEL,
      embeddingModel: EMBEDDING_MODEL,
      temperature: 0.7,
      maxTokens: 1024,
      embeddingDimensions: EMBEDDING_DIMENSIONS,
      systemPrompt: DEFAULT_AI_SYSTEM_PROMPT,
      chatbotPrompt: DEFAULT_AI_CHATBOT_PROMPT,
    },
  })

  await prisma.contactMessage.createMany({
    data: [
      {
        name: 'Jordan Lee',
        email: 'jordan.lee@example.com',
        subject: 'Collaboration on an ML project',
        body: 'Hi Akshay, I saw Lumora on your portfolio and would love to discuss a potential collaboration.',
        status: 'UNREAD',
      },
      {
        name: 'Recruiter at Example Corp',
        email: 'talent@example.com',
        subject: 'Internship opportunity',
        body: 'We are hiring for a summer internship and your portfolio stood out.',
        status: 'READ',
      },
    ],
  })
}

main()
  .catch((error) => {
    console.error('[seed] Failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
