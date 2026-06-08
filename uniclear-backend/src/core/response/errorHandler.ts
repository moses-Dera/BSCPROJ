import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '@/core/errors/AppError'
import { ApiResponse } from '@/core/response/ApiResponse'
import { logger } from '@/core/logger/logger'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err)

  if (err instanceof ZodError) {
    return ApiResponse.error(res, 'Validation failed', 400, err.flatten().fieldErrors)
  }

  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode, { code: err.code })
  }

  return ApiResponse.error(res, 'Internal server error', 500)
}
