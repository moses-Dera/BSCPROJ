import { IStorageProvider } from './storage.interface'
import { LocalStorage } from './local.storage'
import { CloudinaryStorage } from './cloudinary.storage'
import { env } from '@/core/config/env'

export const storage: IStorageProvider =
  env.STORAGE_PROVIDER === 'cloudinary' ? new CloudinaryStorage() : new LocalStorage()
