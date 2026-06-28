export async function uploadFile(base64Data, contentType) {
  const safeId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const body = new URLSearchParams()
  body.append('file', `data:${contentType};base64,${base64Data}`)
  body.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET)
  body.append('public_id', safeId)
  body.append('filename_override', safeId)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body }
  )
  const json = await res.json()
  if (!res.ok) {
    console.error('[Cloudinary]', res.status, json.error?.message, JSON.stringify(json))
    throw new Error(json.error?.message || 'Upload failed')
  }
  return json.secure_url
}
