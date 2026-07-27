/**
 * Route constants — import from here instead of hardcoding strings.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  projects: '/projects',
  project: (id: string) => `/projects/${id}`,
  conversation: (id: string) => `/conversations/${id}`,
  settings: '/settings',
  profile: '/profile',
} as const;
