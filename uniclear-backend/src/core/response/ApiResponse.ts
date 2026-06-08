import { Response } from 'express'

export class ApiResponse {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data })
  }

  static created<T>(res: Response, data: T) {
    return res.status(201).json({ success: true, data })
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number
  ) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  }

  static error(res: Response, message: string, statusCode: number, details?: unknown) {
    return res.status(statusCode).json({ success: false, error: message, details })
  }

  static noContent(res: Response) {
    return res.status(204).send()
  }
}
