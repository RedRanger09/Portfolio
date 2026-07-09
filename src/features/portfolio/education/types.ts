export type EducationType = 'school' | 'college'

export interface EducationEntry {
  id: string
  type: EducationType
  institution: string
  shortName?: string
  degree: string
  period: string
  location: string
  description: string
  highlights: string[]
  expectedGraduation?: string
  currentSemester?: string
}
