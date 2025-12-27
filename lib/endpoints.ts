export const AUTH = {
  REGISTER: "/api/register/",
  LOGIN: "/api/login/",
  USER_INFO: "/api/user/info/", // ✅ Correct - returns user object directly
};

export const OTP = {
  GETOTP: (id: number) => `/api/otp/${id}/`,
  VERIFYOTP: "/api/verify_otp/", // ✅ Fixed - added trailing slash
};

export const KYC = {
  SUBMIT: "/api/kyc/submit/",
};

export const SPLITS = {
  ALL: "/api/splits/",
  CREATE: "/api/splits/",
  UPDATE: (id: number) => `/api/splits/${id}/`,
  JOIN: (id: number) => `/api/splits/${id}/join_splits/`,
  MY_SPLITS: "/api/splits/my_splits/",
};

export const NOTIFICATIONS = {
  ALL: "/api/notifications/",
  SINGLE: (id: number) => `/api/notifications/${id}/`,
  MARK_ALL_READ: "/api/notifications/mark_all_read/",
  MARK_READ: (id: number) => `/api/notifications/${id}/mark_read/`,
};

export const ADMIN = {
  LOGIN: "/admin-api/login/", // ✅ Fixed - removed /api/ prefix
  FORGET_PASSWORD: "/admin-api/forget_password/",
  RESET_PASSWORD: "/admin-api/reset_password/",
};
