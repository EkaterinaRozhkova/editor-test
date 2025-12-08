
export enum UploadType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT',
}

export interface Upload {
  id: string,
  createdAt: string,
  name: string,
  path: string,
  mimetype: string | null,
  type: UploadType,
  hash: string,
  thumbnailUrl: string,
  size: number | string
  kinescopeId?: string
}
