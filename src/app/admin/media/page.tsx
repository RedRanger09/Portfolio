import type { Metadata } from 'next'
import { MediaLibraryList } from '@/features/admin/media'
import { getMediaForAdmin } from '@/features/media/data'
import { isCloudinaryConfigured } from '@/lib/cloudinary'

export const metadata: Metadata = { title: 'Media' }

export default async function AdminMediaPage() {
  const [items, cloudinaryConfigured] = await Promise.all([getMediaForAdmin(), Promise.resolve(isCloudinaryConfigured())])

  return <MediaLibraryList items={items} cloudinaryConfigured={cloudinaryConfigured} />
}
