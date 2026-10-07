// Small fetch wrapper: adds the JWT and turns errors into exceptions.
export async function api(path, { method = 'GET', body } = {}) {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  const res = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const firstValidation = data?.errors && Object.values(data.errors)[0]?.[0];
    throw new Error(data?.message || firstValidation || data?.title || `Request failed (${res.status})`);
  }
  return data;
}
