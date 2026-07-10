import { notFound } from 'next/navigation'
import { CertificationEditor, getCertificationForAdminById, mapCertificationRowToEditorValues } from '@/features/admin/certifications'
import { isCloudinaryConfigured } from '@/lib/cloudinary'

interface Props { params: Promise<{ id: string }> }

export default async function AdminEditCertificationPage({ params }: Props) {
  const { id } = await params
  const row = await getCertificationForAdminById(id)
  if (!row) notFound()
  return <CertificationEditor mode="edit" certId={id} initialValues={mapCertificationRowToEditorValues(row)} cloudinaryConfigured={isCloudinaryConfigured()} />
}
