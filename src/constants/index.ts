// API endpoints and routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    CONFIRM: '/auth/confirm',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    ARTICLES: '/admin/articles',
    CATEGORIES: '/admin/categories',
  },
} as const;

// Validation constants
export const VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  SERVER_ERROR: 'An error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to access this resource',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;