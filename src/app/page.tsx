import { HOME_SECTION_ORDER, SECTION_LABELS } from '@/constants/sections'
import { SectionPlaceholder } from '@/components/placeholders/section-placeholder'

/**
 * Home page composition — Phase 2 scaffold.
 * Each `SectionPlaceholder` will be swapped for its real feature component
 * in Phase 3 (e.g. `<HeroSection />`, `<AboutSection />`, ...) without
 * changing this file's structure.
 */
export default function HomePage() {
  return (
    <>
      {HOME_SECTION_ORDER.map((id) => (
        <SectionPlaceholder key={id} id={id} label={SECTION_LABELS[id]} />
      ))}
    </>
  )
}
