import { NextResponse } from 'next/server';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}


export function handleApiError(error: any) {
  // 1. Log the full error for developers
  const timestamp = new Date().toISOString();
  console.error(`[API ERROR][${timestamp}]`, {
    message: error.message,
    stack: error.stack,
    details: error,
  });

  // 2. Determine safe message and status code
  let message = 'An unexpected error occurred. Please try again later.';
  let status = 500;
  let code = ErrorCode.INTERNAL_ERROR;

  // Handle specific status codes
  if (error.status === 401) {
    message = 'Your session has expired. Please log in again.';
    status = 401;
    code = ErrorCode.UNAUTHORIZED;
  } else if (error.status === 403) {
    message = 'You do not have permission to perform this action.';
    status = 403;
    code = ErrorCode.FORBIDDEN;
  } else if (error.name === 'ValidationError') {
    message = 'Data validation failed. Please check your inputs.';
    status = 400;
    code = ErrorCode.VALIDATION_ERROR;
  } else if (error.code === 11000) {
    message = 'A record with this unique identifier already exists.';
    status = 400;
    code = ErrorCode.VALIDATION_ERROR;
  } else if (error.name === 'CastError') {
    message = 'Invalid ID or data format provided.';
    status = 400;
    code = ErrorCode.VALIDATION_ERROR;
  }

  // If the error has a status attached (from our own logic)
  if (error.status && !status) status = error.status;
  if (error.safeMessage) message = error.safeMessage;


  // 3. Return sanitized response to client
  return NextResponse.json({ 
    success: false,
    message, 
    code,
    requestId: timestamp // Useful for users to report the error
  }, { status });
}

export class AppError extends Error {
  constructor(public safeMessage: string, public status: number = 400) {
    super(safeMessage);
    this.name = 'AppError';
  }
}
