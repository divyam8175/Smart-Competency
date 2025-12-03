import { UserRole } from '../../models/User';

declare global {
  namespace Express {
    interface AuthUserPayload {
      id: string;
      role: UserRole;
    }

    interface UploadedFilePayload {
      originalname: string;
      mimetype: string;
      buffer: Buffer;
      size?: number;
    }

    interface Request {
      user?: AuthUserPayload;
      file?: UploadedFilePayload;
      files?: UploadedFilePayload[];
    }
  }
}

export {};
