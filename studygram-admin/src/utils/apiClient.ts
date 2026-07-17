const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

interface RequestOptions extends RequestInit {
  body?: any;
}

/** Clears stored credentials and redirects to the login page. */
function handleSessionExpired() {
  localStorage.removeItem('studygram_admin_token');
  localStorage.removeItem('studygram_admin_user');
  // Only redirect if not already on the login page to avoid redirect loops
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

async function request(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('studygram_admin_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { message: text };
  }

  if (!response.ok) {
    const message: string = data.message || 'Something went wrong.';

    // Auto-logout on 401 Unauthorized or when the backend says the token expired
    const isTokenExpired =
      response.status === 401 ||
      message.toLowerCase().includes('token is invalid or expired') ||
      message.toLowerCase().includes('invalid or expired') ||
      message.toLowerCase().includes('jwt expired') ||
      message.toLowerCase().includes('unauthorized');

    if (isTokenExpired) {
      handleSessionExpired();
      throw new Error('Session expired. Please log in again.');
    }

    throw new Error(message);
  }

  return data;
}

export const apiClient = {
  get: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestOptions) => request(path, { ...options, method: 'POST', body }),
  put: (path: string, body?: any, options?: RequestOptions) => request(path, { ...options, method: 'PUT', body }),
  delete: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'DELETE' }),
};

