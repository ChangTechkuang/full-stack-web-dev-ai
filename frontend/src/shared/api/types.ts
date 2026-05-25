export interface ApiMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiFieldViolation {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiFieldViolation[];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
  error?: never;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
  data?: never;
  meta?: never;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export class ApiException extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiFieldViolation[];

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = "ApiException";
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }
}
