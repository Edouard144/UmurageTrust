// src/types/express.d.ts
import * as multer from 'multer'

declare global {
  namespace Express {
    namespace Multer {
      interface File extends multer.File {}
    }
  }
}

export {}