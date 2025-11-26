import { File } from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      file?: File;
    }
  }
}