/** Generic Spring Data page response */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/** RFC 7807 Problem Detail (error response) */
export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail: string;
  timestamp?: string;
  errors?: Record<string, string>;
}
