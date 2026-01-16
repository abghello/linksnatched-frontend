'use client';

import type {
  AuthError,
  AuthResponse,
  UserResponse,
  AuthTokenResponsePassword,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

import { paths } from '@/routes/paths';
import { createClient } from '@/utils/supabase/client';
import { LOGGED_OUT_OF_LINKSNATCHED } from '@/constants';
import { CONFIG } from '@/config-global';

// ----------------------------------------------------------------------

export type SignInWithMagicLinkParams = {
  email: string;
  shouldCreateUser?: boolean;
};

export type SignInParams = {
  email: string;
  password: string;
  options?: SignInWithPasswordCredentials['options'];
};

export type SignUpParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  options?: SignUpWithPasswordCredentials['options'];
};

export type ResetPasswordParams = {
  email: string;
  options?: {
    redirectTo?: string;
    captchaToken?: string;
  };
};

export type UpdatePasswordParams = {
  password: string;
  options?: {
    emailRedirectTo?: string | undefined;
  };
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({
  email,
  password,
}: SignInParams): Promise<AuthTokenResponsePassword> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return { data, error };
};

/** **************************************
 * Sign in with Email
 *************************************** */
export const signInWithMagicLink = async ({
  email,
  shouldCreateUser = false,
}: SignInWithMagicLinkParams): Promise<AuthResponse> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: shouldCreateUser,
      emailRedirectTo: `${window.location.origin}${paths.root}`,
    },
  });

  if (error) {
    throw error;
  }

  return { data, error };
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  firstName,
  lastName,
  email,
  password,
}: SignUpParams): Promise<AuthResponse> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}${paths.root}`,
      data: { name: `${firstName} ${lastName}` },
    },
  });

  if (error) {
    console.error(error);
    throw error;
  }

  if (!data?.user?.identities?.length) {
    throw new Error('This user already exists');
  }

  return { data, error };
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<{
  error: AuthError | null;
}> => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error);
    throw error;
  }

  try {
    await chrome.runtime.sendMessage(
      CONFIG.chromeExtensionId,
      { type: LOGGED_OUT_OF_LINKSNATCHED },
      { includeTlsChannelId: true }
    );
  } catch (error) {
    console.error(error);
  }

  return { error };
};

/** **************************************
 * Reset password
 *************************************** */
export const resetPassword = async ({
  email,
}: ResetPasswordParams): Promise<
  { data: {}; error: null } | { data: null; error: AuthError }
> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${paths.auth.updatePassword}`,
  });

  if (error) {
    console.error(error);
    throw error;
  }

  return { data, error };
};

/** **************************************
 * Update password
 *************************************** */
export const updatePassword = async ({
  password,
}: UpdatePasswordParams): Promise<UserResponse> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error(error);
    throw error;
  }

  return { data, error };
};
