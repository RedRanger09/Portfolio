import { prisma } from '@/lib/prisma'

export interface DashboardProjectStats {
  total: number
  published: number
  drafts: number
}

export interface DashboardSkillsStats {
  categories: number
  technologies: number
}

export interface DashboardJourneyStats {
  total: number
  currentLabel: string | null
  currentYear: string | null
}

export interface DashboardCertificationStats {
  total: number
  mostRecentName: string | null
  mostRecentProvider: string | null
  mostRecentDate: string | null
}

export interface AdminDashboardStats {
  projects: DashboardProjectStats
  skills: DashboardSkillsStats
  journey: DashboardJourneyStats
  certifications: DashboardCertificationStats
}

/**
 * Parallel, lean aggregates for the admin home dashboard.
 * Counts only — no N+1, no full-row fetches except one milestone and one certification.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    projectTotal,
    projectPublished,
    projectDrafts,
    skillCategories,
    technologies,
    journeyTotal,
    currentMilestone,
    latestMilestone,
    certificationTotal,
    mostRecentCertification,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { isPlaceholder: false } }),
    prisma.project.count({ where: { isPlaceholder: true } }),
    prisma.skillCategory.count(),
    prisma.technology.count(),
    prisma.journeyMilestone.count(),
    prisma.journeyMilestone.findFirst({
      where: { isCurrent: true },
      select: { label: true, year: true },
      orderBy: { order: 'asc' },
    }),
    prisma.journeyMilestone.findFirst({
      select: { label: true, year: true },
      orderBy: { order: 'desc' },
    }),
    prisma.certification.count(),
    prisma.certification.findFirst({
      select: { name: true, provider: true, completionDate: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const milestone = currentMilestone ?? latestMilestone

  return {
    projects: {
      total: projectTotal,
      published: projectPublished,
      drafts: projectDrafts,
    },
    skills: {
      categories: skillCategories,
      technologies,
    },
    journey: {
      total: journeyTotal,
      currentLabel: milestone?.label ?? null,
      currentYear: milestone?.year ?? null,
    },
    certifications: {
      total: certificationTotal,
      mostRecentName: mostRecentCertification?.name ?? null,
      mostRecentProvider: mostRecentCertification?.provider ?? null,
      mostRecentDate: mostRecentCertification?.completionDate ?? null,
    },
  }
}
