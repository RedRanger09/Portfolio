import { SectionBackdrop, SectionHeader } from '@/shared/components'
import { getAboutData } from '../data'
import { AboutStory } from './about-story'
import { AboutCurrentlyLearning } from './about-currently-learning'
import { AboutInterests } from './about-interests'

/**
 * About — server component: fetches its own data and renders the static
 * backdrop server-side. The columns beneath it are client components only
 * because they use Framer Motion for scroll-triggered/hover animations.
 */
export async function AboutSection() {
  const aboutData = await getAboutData()

  return (
    <section id="about" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="about" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader label={aboutData.label} title={aboutData.title} subtitle={aboutData.subtitle} theme="about" />
        <div className="grid gap-16 lg:grid-cols-2">
          <AboutStory lines={aboutData.story} />
          <div className="space-y-10">
            <AboutCurrentlyLearning data={aboutData.currentlyLearning} />
            <AboutInterests label={aboutData.interestsLabel} interests={aboutData.interests} />
          </div>
        </div>
      </div>
    </section>
  )
}
