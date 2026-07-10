/**
 * Cloudinary server client — all uploads and destroys run here so API secrets
 * never reach the browser. See `docs/infrastructure/database-and-storage.md §2`.
 */

import 'server-only'

import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { env } from '@/config/env'

export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
}

let configured = false

export function isCloudinaryConfigured(): boolean {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret)
}

export function getCloudinaryConfig(): CloudinaryConfig {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and ' +
        'CLOUDINARY_API_SECRET in .env.local (see .env.example).',
    )
  }

  return {
    cloudName: env.cloudinaryCloudName!,
    apiKey: env.cloudinaryApiKey!,
    apiSecret: env.cloudinaryApiSecret!,
  }
}

function ensureCloudinaryConfigured(): typeof cloudinary {
  if (!configured) {
    const config = getCloudinaryConfig()
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    })
    configured = true
  }

  return cloudinary
}

export interface UploadImageOptions {
  folder: string
  filename?: string
}

/** Uploads raw image bytes to Cloudinary from the server. */
export async function uploadImageBuffer(buffer: Buffer, options: UploadImageOptions): Promise<UploadApiResponse> {
  const client = ensureCloudinaryConfigured()

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: 'image',
        use_filename: Boolean(options.filename),
        filename_override: options.filename,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result) {
          reject(new Error('Cloudinary upload returned no result.'))
          return
        }

        resolve(result)
      },
    )

    uploadStream.end(buffer)
  })
}

/** Hard-deletes a Cloudinary asset — used only after reference checks in cleanup jobs. */
export async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  const client = ensureCloudinaryConfigured()
  await client.uploader.destroy(publicId, { resource_type: 'image' })
}
