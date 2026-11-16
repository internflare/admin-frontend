/**
 * Serialize the managed and raw admin clients' identical body contract. Null and
 * undefined mean no body; strings, Blob and FormData pass through untouched.
 * Other values become JSON, setting content type only when absent. The supplied
 * Headers is updated in place; circular JSON still throws before fetch, preserving
 * the clients' existing error boundary and multipart browser-generated boundary.
 */
export function serializeRequestBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (typeof body === "string" || body instanceof FormData || body instanceof Blob) return body;
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
}
