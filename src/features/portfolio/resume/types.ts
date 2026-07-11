export interface ResumeData {
  label: string
  title: string
  /** Path to the resume PDF, used for Preview/Download/Fullscreen. */
  filePath: string
  previewImage: string
  previewAlt: string
  previewImageWidth: number
  previewImageHeight: number
  /** Soft-hide from the public Resume section without deleting CMS data. */
  isVisible: boolean
}
