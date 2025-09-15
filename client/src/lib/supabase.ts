// This file is kept for backward compatibility but all authentication
// now goes through our backend API instead of Supabase directly.
// The AuthContext in /context/auth-context.tsx handles all authentication.

// Placeholder functions to prevent import errors
export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  console.warn('signUp: Use AuthContext login/register methods instead');
  return { data: null, error: { message: 'Use AuthContext instead' } };
};

export const signIn = async (email: string, password: string) => {
  console.warn('signIn: Use AuthContext login method instead');
  return { data: null, error: { message: 'Use AuthContext instead' } };
};

export const signOut = async () => {
  console.warn('signOut: Use AuthContext logout method instead');
  return { error: null };
};

export const getCurrentUser = async () => {
  console.warn('getCurrentUser: Use AuthContext user state instead');
  return null;
};

export const resetPassword = async (email: string) => {
  console.warn('resetPassword: Use AuthContext resetPassword method instead');
  return { data: null, error: { message: 'Use AuthContext instead' } };
};

export const updatePassword = async (password: string) => {
  console.warn('updatePassword: Use backend API instead');
  return { data: null, error: { message: 'Use backend API instead' } };
};
