import { Response } from 'express';

export const ok = <T>(res: Response, data: T, status = 200) => {
  return res.status(status).json({ success: true, data });
};

export const fail = (
  res: Response,
  error: { code: string; message: string },
  status = 400
) => {
  return res.status(status).json({ success: false, error });
};

