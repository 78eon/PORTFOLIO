import { uploadFile } from '@/lib/storage'
import { checkAuth } from '@/lib/authGuard'

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { data, contentType } = req.body
  if (!data || !contentType) {
    return res.status(400).json({ error: 'Missing data or contentType' })
  }

  const url = await uploadFile(data, contentType)
  res.json({ url })
}
