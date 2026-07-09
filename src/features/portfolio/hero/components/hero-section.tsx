import { SectionBackdrop } from '@/shared/components'
import { getHeroData } from '../data'
import { HeroContent } from './hero-content'
import { HeroVisual } from './hero-visual'

/**
 * Hero — the landing section. Server Component: fetches its own data and
 * renders the static backdrop server-side; the two columns beneath it are
 * client components only because they use Framer Motion / cursor tracking.
 */
export async function HeroSection() {
  const heroData = await getHeroData()

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative min-h-[90vh] overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16"
    >
      <SectionBackdrop theme="hero" />
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <HeroContent data={heroData} />
        <HeroVisual profileImage={heroData.profileImage} />
      </div>
    </section>
  )
}
