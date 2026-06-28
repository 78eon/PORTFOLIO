export async function uploadFile(base64Data, contentType) {
  const body = new URLSearchParams()
  body.append('file', `data:${contentType};base64,${base64Data}`)
  body.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body }
  )
  const json = await res.json()
  if (!res.ok) {
    const msg = json.error?.message || JSON.stringify(json)
    console.error('[Cloudinary error]', res.status, msg)
    throw new Error(msg)
  }
  return json.secure_url
}
