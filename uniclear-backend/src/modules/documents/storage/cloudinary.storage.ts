import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/core/config/env'
import { IStorageProvider } from './storage.interface'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

export class CloudinaryStorage implements IStorageProvider {
  async upload(buffer: Buffer, filePath: string, mimeType: string): Promise<{ url: string; key: string }> {
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: filePath.split('/').slice(0, -1).join('/'), resource_type: 'auto' },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload failed'))
          resolve(result)
        }
      )
      stream.end(buffer)
    })

    return { url: result.secure_url, key: result.public_id }
  }

  async delete(key: string): Promise<void> {
    await cloudinary.uploader.destroy(key, { resource_type: 'raw' }).catch(() =>
      cloudinary.uploader.destroy(key, { resource_type: 'image' })
    )
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return cloudinary.url(key, {
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    })
  }
}
