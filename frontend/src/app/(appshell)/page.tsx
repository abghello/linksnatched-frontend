'use client';

import React, { useEffect } from 'react';
import { Hero } from '@/components/Hero';
import { useAuthContext } from '@/auth/hooks';
import { createClient } from '@/utils/supabase/client';
import { AUTH_CODE_RECEIVED } from '@/constants';
import { CONFIG } from '@/config-global';

export default function HomePage() {
  const { user } = useAuthContext();

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
        throw error;
      }

      if (session) {
        const accessToken = session?.access_token;
        try {
          await chrome.runtime.sendMessage(
            CONFIG.chromeExtensionId,
            { type: AUTH_CODE_RECEIVED, payload: accessToken },
            { includeTlsChannelId: true }
          );
        } catch (error) {
          console.log(error);
        }
      }
    };

    init();
  }, []);

  return (
    <div className='container mx-auto'>
      <Hero />
    </div>
  );
}
