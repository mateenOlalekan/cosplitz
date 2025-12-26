export const AUTH = {
  REGISTER: "/register/",
  LOGIN: "/login/",
  USER_INFO: "/user/info",
};

export const OTP = {
  GETOTP: (id: number) => `/otp/${id}/`,
  VERIFYOTP: "/verify_otp/", // trailing slash added
};

export const KYC = {
  SUBMIT: "/kyc/submit/",
};

export const SPLITS = {
  ALL: "/splits/",
  CREATE: "/splits/",
  UPDATE: (id: number) => `/splits/${id}/`,
  JOIN: (id: number) => `/splits/${id}/join_splits/`,
  MY_SPLITS: "/splits/my_splits/",
};

export const NOTIFICATIONS = {
  ALL: "/notifications/",
  SINGLE: (id: number) => `/notifications/${id}/`,
  MARK_READ: (id: number) => `/notifications/${id}/mark_read/`,
  MARK_ALL_READ: "/notifications/mark_all_read/",
};

export const ADMIN = {
  LOGIN: "/admin-api/login/",
  FORGET_PASSWORD: "/admin-api/forget_password/",
  RESET_PASSWORD: "/admin-api/reset_password/",
};

