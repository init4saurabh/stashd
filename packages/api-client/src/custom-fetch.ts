export type ErrorType<T = unknown> = ApiError<T>;
export type BodyType<T> = T;

export class ApiError<T = unknown> extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly data: T | null;

  constructor(response: Response, data: T | null) {
    super(`HTTP ${response.status} ${response.statusText}`);
    this.status = response.status;
    this.data = data;
  }
}

export async function customFetch<T = unknown>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError<T>(response, data as T);
  }

  return data as T;
}