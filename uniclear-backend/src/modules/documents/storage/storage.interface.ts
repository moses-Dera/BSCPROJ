export interface IStorageProvider {
  upload(buffer: Buffer, path: string, mimeType: string): Promise<{ url: string; key: string }>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}
