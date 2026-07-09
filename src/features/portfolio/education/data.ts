import type { EducationEntry } from './types'

const education: EducationEntry[] = [
  {
    id: 'school',
    type: 'school',
    institution: 'La Martiniere College',
    degree: 'High School',
    period: '2010 – 2024',
    location: 'Lucknow, India',
    description: 'Completed schooling with a focus on science and mathematics. Built early interest in computers and problem-solving.',
    highlights: ['Science stream', 'Mathematics', 'Computer fundamentals'],
  },
  {
    id: 'college',
    type: 'college',
    institution: 'Shri Ramswaroop Memorial College of Engineering and Management',
    shortName: 'SRMCEM',
    degree: 'B.Tech Computer Science',
    period: '2024 – Present',
    location: 'Lucknow, India',
    description: 'Currently pursuing B.Tech in Computer Science. Applying coursework through AI/ML projects alongside studies.',
    highlights: ['Data Structures & Algorithms', 'ML coursework', 'Project portfolio', 'Open source contributions'],
    expectedGraduation: '2028',
    currentSemester: '2nd Year',
  },
]

export async function getEducation(): Promise<EducationEntry[]> {
  return education
}
