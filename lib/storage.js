export async function uploadFile(base64Data, contentType) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET

  console.log('[storage] cloud:', cloudName, '| preset:', preset)

  const body = new URLSearchParams()
  body.append('file', `data:${contentType};base64,${base64Data.slice(0, 20)}…`)
  body.append('upload_preset', preset)

  // Build actual body with real file data
  const realBody = new URLSearchParams()
  realBody.append('file', `data:${contentType};base64,${base64Data}`)
  realBody.append('upload_preset', preset)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: realBody }
  )
  const json = await res.json()
  console.log('[storage] cloudinary response:', JSON.stringify(json).slice(0, 300))

  if (!res.ok) {
    throw new Error(json.error?.message || JSON.stringify(json))
  }
  return json.secure_url
}
