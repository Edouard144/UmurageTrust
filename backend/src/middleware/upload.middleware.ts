// src/middleware/upload.middleware.ts
import multer from 'multer'
import path from 'path'

// Store files in memory (as buffer) instead of disk
// This is better for cloud uploads — no temp files left on server
const storage = multer.memoryStorage()

// Only allow image files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(ext)) {
    cb(null, true)   // accept file
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp)'))
  }
}

// Max 5 images, each max 5MB
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5,                   // max 5 files at once
  },
})