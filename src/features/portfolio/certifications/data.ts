import { withDbFallback } from '@/lib/db-fallback'
import { prisma } from '@/lib/prisma'
import type { Certification, CertificationsSectionContent } from './types'

const certificationsSectionContent: CertificationsSectionContent = {
  label: 'Certifications',
  title: 'Certificates',
  subtitle: 'Click to verify or view credentials. Add more by editing one object in the data file.',
}

/**
 * Static fallback — also the source `prisma/seed.ts` seeds the
 * `Certification` table from. Served directly today; once migrated, served
 * only if the database is unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export const FALLBACK_CERTIFICATIONS: Certification[] = [
  {
    name: 'Supervised Machine Learning: Regression and Classification',
    provider: 'DeepLearning.AI (Andrew Ng)',
    providerLogo: 'coursera',
    completionDate: 'March 2026',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/991VDTZVP45W',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/991VDTZVP45W',
    image: '/certificates/Supervised Machine Learning.png',
  },
  {
    name: 'Advanced Learning Algorithms',
    provider: 'DeepLearning.AI (Andrew Ng)',
    providerLogo: 'coursera',
    completionDate: 'May 2026',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/E36HXI6O8QTC',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/E36HXI6O8QTC',
    image: '/certificates/advanced-learning-algorithms.png',
  },
  {
    name: 'Digital Application Fundamentals (STEM)',
    provider: 'NASSCOM',
    providerLogo: null,
    completionDate: 'September 2025',
    credentialUrl: 'https://www.futureskillsprime.in/iDH/user/credential/view/32914-4e9fcbbe-9bc2-11f0-bdec-005056b48b54',
    verifyUrl: 'https://www.futureskillsprime.in/iDH/user/credential/view/32914-4e9fcbbe-9bc2-11f0-bdec-005056b48b54',
    image: '/certificates/Digital Application Fundamentals.png',
  },
  {
    name: 'IBM Artificial Intelligence Virtual Internship',
    provider: 'IBM',
    providerLogo: 'ibm',
    completionDate: 'September 2025',
    credentialUrl: 'https://courses.ibmmooc.skillsnetwork.site/certificates/43968dac2eb04b6bb3cbcb58cb5a5939',
    verifyUrl: 'https://courses.ibmmooc.skillsnetwork.site/certificates/43968dac2eb04b6bb3cbcb58cb5a5939',
    image: '/certificates/IBMai.png',
  },
  {
    name: 'NVIDIA Getting Started with Deep Learning',
    provider: 'NVIDIA',
    providerLogo: 'nvidia',
    completionDate: 'October 2025',
    credentialUrl: 'https://learn.nvidia.com/certificates?id=NhbdQgelTzehKu7u37egNA',
    verifyUrl: 'https://learn.nvidia.com/certificates?id=NhbdQgelTzehKu7u37egNA',
    image: '/certificates/NVIDIA Deep Learning.png',
  },
]

/**
 * Returns every certification, in display order. Reads from the database,
 * falling back to `FALLBACK_CERTIFICATIONS` if the database is
 * unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export async function getCertifications(): Promise<Certification[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.certification.findMany({ where: { isVisible: true }, orderBy: { order: 'asc' } })
      return rows.map((row) => ({
        name: row.name,
        provider: row.provider,
        providerLogo: row.providerLogo,
        completionDate: row.completionDate ?? '',
        credentialUrl: row.credentialUrl,
        verifyUrl: row.verifyUrl,
        image: row.image,
      }))
    },
    FALLBACK_CERTIFICATIONS,
    'certifications',
  )
}

export async function getCertificationsSectionContent(): Promise<CertificationsSectionContent> {
  return certificationsSectionContent
}
