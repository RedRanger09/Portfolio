import { SectionBackdrop, SectionHeader } from '@/shared/components'
import { getSkillGroups, getSkillsSectionContent } from '../data'
import { SkillsGrid } from './skills-grid'

/** Skills — server component: fetches every skill category and the section copy. */
export async function SkillsSection() {
  const [groups, content] = await Promise.all([getSkillGroups(), getSkillsSectionContent()])

  return (
    <section id="skills" className="relative scroll-mt-28 border-y border-white/[0.06] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="skills" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader label={content.label} title={content.title} subtitle={content.subtitle} theme="skills" />
        <SkillsGrid groups={groups} />
      </div>
    </section>
  )
}
