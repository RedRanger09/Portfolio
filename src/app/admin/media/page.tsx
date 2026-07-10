import type { Metadata } from 'next'
import { Image } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Media' }

export default function AdminMediaPage() {
  return (
    <ModulePlaceholder
      title="Media"
      description="Upload and manage images used across the portfolio — arrives with Cloudinary integration."
      icon={Image}
      previewColumns={['File', 'Type', 'Size', 'Uploaded']}
    />
  )
}
