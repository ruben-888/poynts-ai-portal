/**
 * Error handling utilities for the API proxy layer
 */

import { NextResponse } from "next/server";

/**
 * Base error class for proxy-related errors
 */
export class ProxyError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ProxyError";
  }
}

/**
 * Error for unauthenticated requests
 */
export class UnauthorizedError extends ProxyError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * Error for authenticated but not permitted requests
 */
export class ForbiddenError extends ProxyError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

/**
 * Error for invalid request data
 */
export class BadRequestError extends ProxyError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

/**
 * Error for resources not found
 */
export class NotFoundError extends ProxyError {
  constructor(message: string = "Not Found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Error for backend/upstream failures
 */
export class BadGatewayError extends ProxyError {
  constructor(message: string = "Bad Gateway") {
    super(message, 502);
    this.name = "BadGatewayError";
  }
}

/**
 * Handle errors and return appropriate NextResponse
 *
 * @param error - The error to handle
 * @returns NextResponse with appropriate status and error message
 */
export function handleError(error: unknown): NextResponse {
  // Handle known proxy errors
  if (error instanceof ProxyError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for specific error messages that map to status codes
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "No organization context") {
      return NextResponse.json(
        { error: "No organization context found" },
        { status: 400 }
      );
    }

    // Log unexpected errors
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // Handle unknown error types
  console.error("Unknown error type:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/**
 * Create a standardized unauthorized response
 */
export function unauthorized(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Create a standardized forbidden response
 */
export function forbidden(message: string = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Create a standardized bad request response
 */
export function badRequest(message: string = "Bad Request"): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Create a standardized not found response
 */
export function notFound(message: string = "Not Found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}
