import type { AccentColor } from '@/shared/types'
import type { SkillGroupIcon } from '@/features/portfolio/skills/types'

export interface AdminSkillCategoryListItem {
  id: string
  title: string
  icon: SkillGroupIcon
  accent: AccentColor
  itemCount: number
  isVisible: boolean
  order: number
  updatedAt: string
}

export interface SkillCategoryEditorValues {
  title: string
  icon: SkillGroupIcon
  accent: AccentColor
  note: string
  items: string[]
  order: number
}

export const EMPTY_SKILL_CATEGORY_EDITOR_VALUES: SkillCategoryEditorValues = {
  title: '', icon: 'Code2', accent: 'cyan', note: '', items: [], order: 0,
}

export function mapSkillCategoryRowToEditorValues(row: SkillCategoryEditorValues): SkillCategoryEditorValues {
  return { ...row }
}

export function mapEditorValuesToCreateSkillCategoryInput(values: SkillCategoryEditorValues) {
  return { title: values.title, icon: values.icon, accent: values.accent, note: values.note, items: values.items, order: values.order }
}

export function mapEditorValuesToUpdateSkillCategoryInput(id: string, values: SkillCategoryEditorValues) {
  return { id, ...mapEditorValuesToCreateSkillCategoryInput(values) }
}
