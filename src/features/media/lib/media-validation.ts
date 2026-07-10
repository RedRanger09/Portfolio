import imageSize from 'image-size'
import { MutationValidationError } from '@/lib/mutation-result'
import type { MediaType } from '@prisma/client'

export const IMAGE_UPLOAD_LIMITS = {
  maxBytes: 5 * 1024 * 1024,
  maxWidth: 4096,
  maxHeight: 4096,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'] as const,
} as const

export const PDF_UPLOAD_LIMITS = {
  maxBytes: 10 * 1024 * 1024,
  allowedMimeTypes: ['application/pdf'] as const,
} as const

type AllowedImageMime = (typeof IMAGE_UPLOAD_LIMITS.allowedMimeTypes)[number]

const IMAGE_SIGNATURES: Array<{ mime: AllowedImageMime; bytes: number[] }> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
]

function detectImageMime(buffer: Buffer): AllowedImageMime | null {
  for (const signature of IMAGE_SIGNATURES) {
    if (signature.bytes.every((byte, index) => buffer[index] === byte)) {
      return signature.mime
    }
  }

  const asText = buffer.subarray(0, 256).toString('utf8').trim().toLowerCase()
  if (asText.startsWith('<svg') || asText.includes('<svg')) {
    return 'image/svg+xml'
  }

  return null
}

export interface ValidatedUploadFile {
  buffer: Buffer
  mimeType: string
  filename: string
  mediaType: MediaType
  width: number | null
  height: number | null
}

/** Server-side validation before any Cloudinary upload occurs. */
export function validateImageUpload(file: File, buffer: Buffer): ValidatedUploadFile {
  if (!(file instanceof File) || file.size === 0) {
    throw new MutationValidationError({ file: ['A file is required.'] })
  }

  if (file.size > IMAGE_UPLOAD_LIMITS.maxBytes) {
    throw new MutationValidationError({ file: ['Image must be 5 MB or smaller.'] })
  }

  const detectedMime = detectImageMime(buffer)
  const declaredMime = file.type as AllowedImageMime

  if (!detectedMime) {
    throw new MutationValidationError({ file: ['Unsupported image format. Use JPEG, PNG, WebP, GIF, or SVG.'] })
  }

  if (declaredMime && declaredMime !== detectedMime) {
    throw new MutationValidationError({ file: ['File content does not match the declared type.'] })
  }

  if (!IMAGE_UPLOAD_LIMITS.allowedMimeTypes.includes(detectedMime)) {
    throw new MutationValidationError({ file: ['Unsupported image format.'] })
  }

  let width: number | null = null
  let height: number | null = null

  if (detectedMime !== 'image/svg+xml') {
    const dimensions = imageSize(buffer)

    if (!dimensions.width || !dimensions.height) {
      throw new MutationValidationError({ file: ['Could not read image dimensions.'] })
    }

    if (dimensions.width > IMAGE_UPLOAD_LIMITS.maxWidth || dimensions.height > IMAGE_UPLOAD_LIMITS.maxHeight) {
      throw new MutationValidationError({ file: ['Image dimensions must be 4096×4096 or smaller.'] })
    }

    width = dimensions.width
    height = dimensions.height
  }

  return {
    buffer,
    mimeType: detectedMime,
    filename: file.name,
    mediaType: 'IMAGE',
    width,
    height,
  }
}

export function readUploadFile(formData: FormData): File {
  const value = formData.get('file')

  if (!(value instanceof File)) {
    throw new MutationValidationError({ file: ['A file is required.'] })
  }

  return value
}
