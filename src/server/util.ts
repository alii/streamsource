import { Request, Response } from 'express';

type APIResponse<Content> =
  | {
      error: true;
      content: { message: string };
    }
  | { error: false; content: Content };

/**
 * Catches errors and provides a fallback if something goes wrong
 * @param callback Express handler function
 */
export const fall = <Params extends Request['params'], ResponseBody = unknown>(
  callback: (req: Request<Params>, res: Response<APIResponse<ResponseBody>>) => unknown,
) => (req: Request<Params>, res: Response<APIResponse<ResponseBody>>) => {
  try {
    callback(req, res);
  } catch (e) {
    res.status(500).json({
      error: true,
      content: { message: e.message },
    });
  }
};
