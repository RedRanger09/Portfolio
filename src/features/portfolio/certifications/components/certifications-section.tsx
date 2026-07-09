import { SectionBackdrop, SectionHeader } from '@/shared/components'
import { getCertifications, getCertificationsSectionContent } from '../data'
import { CertificationsGrid } from './certifications-grid'

/** Certifications — server component: fetches every certificate and the section copy. */
export async function CertificationsSection() {
  const [certifications, content] = await Promise.all([getCertifications(), getCertificationsSectionContent()])

  return (
    <section
      id="certifications"
      className="relative scroll-mt-28 border-t border-white/[0.06] px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <SectionBackdrop theme="certifications" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader label={content.label} title={content.title} subtitle={content.subtitle} align="center" theme="certifications" />
        <CertificationsGrid certifications={certifications} />
      </div>
    </section>
  )
}
