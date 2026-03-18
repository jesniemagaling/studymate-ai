import { NextResponse } from "next/server";

type SuccessPayload<T extends Record<string, unknown>> = {
  success: true;
  message: string;
  data: T;
} & T;

type ErrorPayload = {
  success: false;
  message: string;
  errorCode: string;
  error: string;
  details?: unknown;
};

export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  message = "OK",
  status = 200,
) {
  const payload: SuccessPayload<T> = {
    success: true,
    message,
    data,
    ...data,
  };

  return NextResponse.json(payload, { status });
}

export function apiError(options: {
  message: string;
  status: number;
  errorCode?: string;
  details?: unknown;
}) {
  const payload: ErrorPayload = {
    success: false,
    message: options.message,
    errorCode: options.errorCode || "UNKNOWN_ERROR",
    error: options.message,
    ...(options.details !== undefined ? { details: options.details } : {}),
  };

  return NextResponse.json(payload, { status: options.status });
}
