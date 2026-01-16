import { paths } from '@/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  auth: {
    redirectPath: string;
  };
  supabase: { url: string; key: string };
  prodUrl: string;
  chromeExtensionId: string;
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  appName: 'Links Management App',
  appVersion: packageJson.version,
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
  /**
   * Auth
   */
  auth: {
    redirectPath: paths.home,
  },
  /**
   * Supabase
   */
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  prodUrl: process.env.NEXT_PUBLIC_PRODUCTION_URL || '',
  chromeExtensionId: process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID || '',
};
