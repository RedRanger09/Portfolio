import { SectionBackdrop, SectionHeader } from '@/shared/components'
import { getEducation, getEducationSectionContent } from '../data'
import { EducationTimelineLine } from './education-timeline-line'
import { EducationEntryCard } from './education-entry-card'

/** Education — server component: fetches the academic timeline and section copy. */
export async function EducationSection() {
  const [entries, content] = await Promise.all([getEducation(), getEducationSectionContent()])

  return (
    <section id="education" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="education" />
      <div className="relative mx-auto max-w-3xl">
        <SectionHeader label={content.label} title={content.title} theme="education" />
        <div className="relative">
          <EducationTimelineLine />
          <div className="space-y-8">
            {entries.map((entry, index) => (
              <EducationEntryCard key={entry.id} entry={entry} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
