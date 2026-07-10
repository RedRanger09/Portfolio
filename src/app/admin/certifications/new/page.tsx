import { CertificationEditor } from '@/features/admin/certifications'
import { isCloudinaryConfigured } from '@/lib/cloudinary'

export default async function AdminNewCertificationPage() {
  return <CertificationEditor mode="create" cloudinaryConfigured={isCloudinaryConfigured()} />
}
