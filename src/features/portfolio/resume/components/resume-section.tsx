import { SectionBackdrop, SectionHeader } from '@/shared/components'
import { getResumeData } from '../data'
import { ResumePreview } from './resume-preview'
import { ResumeActions } from './resume-actions'

/** Resume — server component: fetches resume metadata (file path, preview image, copy). */
export async function ResumeSection() {
  const resume = await getResumeData()

  return (
    <section id="resume" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="resume" />
      <div className="relative mx-auto max-w-5xl">
        <SectionHeader label={resume.label} title={resume.title} theme="resume" />
        <div className="mx-auto max-w-xl">
          <ResumePreview
            src={resume.previewImage}
            alt={resume.previewAlt}
            width={resume.previewImageWidth}
            height={resume.previewImageHeight}
          />
          <ResumeActions filePath={resume.filePath} />
        </div>
      </div>
    </section>
  )
}
