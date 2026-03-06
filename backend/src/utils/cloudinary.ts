// src/utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

// Configure using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

// ── Upload image to Cloudinary ─────────────────────────
export const uploadImage = async (filePath: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'umuragetrust/properties', // organizes images in folders
    transformation: [
      { width: 1200, height: 800, crop: 'fill' }, // resize to standard size
      { quality: 'auto' },                         // auto compress
      { fetch_format: 'auto' },                    // auto best format (webp etc)
    ],
  })

  return result.secure_url // returns the public URL of the uploaded image
}

// ── Delete image from Cloudinary ───────────────────────
export const deleteImage = async (imageUrl: string): Promise<void> => {
  // Extract public_id from URL to delete it
  // URL format: https://res.cloudinary.com/cloudname/image/upload/v123/umuragetrust/properties/abc.jpg
  const parts = imageUrl.split('/')
  const filename = parts[parts.length - 1].split('.')[0]
  const folder = parts[parts.length - 2]
  const publicId = `${folder}/${filename}`

  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary