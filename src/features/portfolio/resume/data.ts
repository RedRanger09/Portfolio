import { SITE } from '@/config/site.config'
import type { ResumeData } from './types'

const resumeData: ResumeData = {
  label: 'Resume',
  title: 'My Resume',
  filePath: SITE.resumePath,
  previewImage: SITE.resumePreview,
  previewAlt: `Resume preview — ${SITE.name}`,
  // Intrinsic dimensions of `public/resume/resume-preview.png` — next/image
  // requires explicit width/height (or `fill`) to avoid layout shift.
  previewImageWidth: 763,
  previewImageHeight: 986,
}

export async function getResumeData(): Promise<ResumeData> {
  return resumeData
}
