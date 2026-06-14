import { uploadFile } from '@/lib/storage'
import { checkAuth } from '@/lib/authGuard'

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_UPLOAD_PRESET) {
    return res.status(500).json({ error: 'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to your environment variables.' })
  }

  const { data, contentType } = req.body
  if (!data || !contentType) {
    return res.status(400).json({ error: 'Missing data or contentType' })
  }

  try {
    const url = await uploadFile(data, contentType)
    res.json({ url })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Upload failed' })
  }
}
