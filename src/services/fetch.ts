/**
 * Base fetch utility for API calls.
 * Handles JSON serialization, error handling, and response typing.
 */

async function apiFetch<T>(
  path: string,
  options?: {
    method?: string
    body?: Record<string, unknown> | FormData
    headers?: Record<string, string>
  }
): Promise<T> {
  const headers: Record<string, string> = options?.headers || {}

  // Only set Content-Type if body is JSON (not FormData)
  if (options?.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(path, {
    method: options?.method || 'GET',
    headers,
    body:
      options?.body instanceof FormData
        ? options.body
        : options?.body
          ? JSON.stringify(options.body)
          : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

export default apiFetch
