// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '',
};

// ----------------------------------------------------------------------

export const paths = {
  root: '/',
  home: '/',
  // AUTH
  auth: {
    login: `${ROOTS.AUTH}/login`,
    verify: `${ROOTS.AUTH}/verify`,
    signUp: `${ROOTS.AUTH}/sign-up`,
    updatePassword: `${ROOTS.AUTH}/update-password`,
    resetPassword: `${ROOTS.AUTH}/reset-password`,
  },
  pricing: '/pricing',
  checkout: `/checkout`,
  users: '/users',
};
