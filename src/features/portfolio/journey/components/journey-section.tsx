import { SectionBackdrop, SectionHeader } from '@/shared/components'
import { getLearningJourney, getJourneySectionContent } from '../data'
import { JourneyTimeline } from './journey-timeline'

/** Learning Journey — server component: fetches the milestone list and section copy. */
export async function JourneySection() {
  const [steps, content] = await Promise.all([getLearningJourney(), getJourneySectionContent()])

  return (
    <section id="journey" className="relative scroll-mt-28 border-y border-white/[0.06] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="experience" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader label={content.label} title={content.title} subtitle={content.subtitle} theme="experience" />
        <JourneyTimeline steps={steps} />
      </div>
    </section>
  )
}
