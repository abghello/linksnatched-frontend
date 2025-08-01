import React from 'react';
import { useState, useEffect } from 'react';
import '@pages/options/Options.css';
import {
  openTabWithUrl,
  COLOR_MODE_CHANGE,
} from '@src/pages/background/utils/actions';
import {
  AUTH_URL,
  LOGOUT_URL,
  SET_SHORTCUTS,
} from '@src/pages/background/utils/constants';
import { getSetting } from '@src/pages/background/utils/actions';

export default function Options() {
  const [userName, setUserName] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [theme, setThemeState] = useState<
    'theme-light' | 'dark' | 'system' | ''
  >('');
  const [isLight, setIsLight] = useState(false);

  const setShortcuts = () => openTabWithUrl(SET_SHORTCUTS, true);
  const logoutAction = () => openTabWithUrl(LOGOUT_URL, true);
  const loginAction = () => openTabWithUrl(AUTH_URL, true);

  const updateTheme = (mode: 'theme-light' | 'dark' | 'system') => {
    setThemeState(mode);
    chrome.runtime.sendMessage({
      type: COLOR_MODE_CHANGE,
      payload: {
        theme: mode,
      },
    });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const theme = await getSetting('theme');
      const username = await getSetting('username');
      const accessToken = await getSetting('access_token');

      updateTheme(theme ? theme : 'system');
      setUserName(username);
      setAccessToken(accessToken);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
    setIsLight(!isDark);
  }, [theme]);

  return (
    <div className='max-w-[550px] mx-auto rounded-lg py-[100px] px-[20px]'>
      {/* Header */}
      <div className='text-left mb-8'>
        <div className='flex items-center justify-left gap-2 mb-4'>
          <img
            src='https://app.linksnatched.com/imgs/logo.png'
            className='h-6 w-6'
            alt='Linksnatched'
          />
          <span className='font-medium text-[20px]'>Linksnatched</span>
        </div>
        <h1 className='text-[33px] leading-[40px] font-bold mb-[15px] mt-[10px]'>
          {chrome.i18n.getMessage('options_header')}
        </h1>
        <div className='w-full h-[1px] bg-black'></div>
      </div>

      {/* Content */}
      <div className='space-y-8 text-[16px]'>
        {/* Logged in section */}
        <div className='flex items-center justify-start'>
          <span className='font-[500] w-[183px]'>
            {chrome.i18n.getMessage('options_login_title')}
          </span>
          <div className='flex gap-2 items-center'>
            <div>{accessToken && userName && <span>{userName}</span>}</div>
            {accessToken && userName && (
              <button
                className='px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-md transition-colors duration-200 cursor-pointer'
                onClick={logoutAction}
              >
                {chrome.i18n.getMessage('options_log_out')}
              </button>
            )}
            {!accessToken && (
              <button
                className='px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-md transition-colors duration-200 cursor-pointer'
                onClick={loginAction}
              >
                {chrome.i18n.getMessage('options_log_in')}
              </button>
            )}
          </div>
        </div>

        {/* Keyboard Shortcut */}
        <div className='flex items-center justify-start'>
          <span className='flex font-[500] w-[183px]'>
            {chrome.i18n.getMessage('options_shortcut_title')}
          </span>
          <button
            className='px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-200 cursor-pointer'
            onClick={setShortcuts}
          >
            {chrome.i18n.getMessage('options_shortcut_record')}
          </button>
        </div>

        {/* Mobile App */}
        {/* <div className='flex items-center justify-start'>
          <span className='flex font-[500] w-[183px]'>
            {chrome.i18n.getMessage('options_app_title')}
          </span>
          <div className='flex gap-2 items-center'>
            <a
              href='https://www.apple.com/app-store/'
              target='_blank'
              rel='noopener noreferrer'
            >
              <img
                src='https://app.linksnatched.com/imgs/apple-app-store-badge.svg'
                className='h-10 leading-[60px]'
                alt='App Store'
              />
            </a>
            <a
              href='https://play.google.com/store/apps'
              target='_blank'
              rel='noopener noreferrer'
            >
              <img
                src='https://app.linksnatched.com/imgs/google-play-badge.png'
                alt='Google Play'
                className='h-[60px]'
              />
            </a>
          </div>
        </div> */}

        {/* Theme */}
        <div className='flex items-center justify-start'>
          <span className='flex font-[500] w-[183px]'>
            {chrome.i18n.getMessage('options_theme_title')}
          </span>
          <div className='space-y-3'>
            <div className='flex items-center'>
              <input
                type='radio'
                id='theme-light'
                name='theme'
                value='theme-light'
                checked={theme === 'theme-light'}
                onChange={(e) =>
                  updateTheme(
                    e.target.value as 'theme-light' | 'dark' | 'system'
                  )
                }
                className='w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2'
              />
              <label htmlFor='theme-light' className='ml-2  cursor-pointer'>
                {chrome.i18n.getMessage('options_theme_light')}
              </label>
            </div>
            <div className='flex items-center'>
              <input
                type='radio'
                id='dark'
                name='theme'
                value='dark'
                checked={theme === 'dark'}
                onChange={(e) =>
                  updateTheme(
                    e.target.value as 'theme-light' | 'dark' | 'system'
                  )
                }
                className='w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2'
              />
              <label htmlFor='dark' className='ml-2  cursor-pointer'>
                {chrome.i18n.getMessage('options_theme_dark')}
              </label>
            </div>
            <div className='flex items-center'>
              <input
                type='radio'
                id='system'
                name='theme'
                value='system'
                checked={theme === 'system'}
                onChange={(e) =>
                  updateTheme(
                    e.target.value as 'theme-light' | 'dark' | 'system'
                  )
                }
                className='w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2'
              />
              <label htmlFor='system' className='ml-2  cursor-pointer'>
                {chrome.i18n.getMessage('options_theme_system')}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='mt-12 pt-8'>
        {/* <div className='flex justify-between items-start mb-6'>
          <a
            href='#'
            className='text-[16px] underline transition-colors duration-200'
          >
            {chrome.i18n.getMessage('options_need_help')}
          </a>
          <a
            href='#'
            className='text-[16px] underline transition-colors duration-200'
          >
            {chrome.i18n.getMessage('options_email_us')}
          </a>
          <div>
            <span className='text-[16px] block'>
              {chrome.i18n.getMessage('options_follow')}
            </span>
            <div className='flex gap-4 mt-[20px]'>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href='https://www.facebook.com/linksnatched/'
              >
                <span
                  className={`w-5 h-5 ${isLight ? 'text-black' : 'text-white'}`}
                >
                  <svg
                    enable-background='new 0 0 56.693 56.693'
                    height='25px'
                    id='Layer_1'
                    version='1.1'
                    viewBox='0 0 56.693 56.693'
                    width='25px'
                    fill={isLight ? '#000000' : '#ffffff'}
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M28.347,5.157c-13.6,0-24.625,11.027-24.625,24.625c0,13.6,11.025,24.623,24.625,24.623c13.6,0,24.625-11.023,24.625-24.623  C52.972,16.184,41.946,5.157,28.347,5.157z M34.864,29.679h-4.264c0,6.814,0,15.207,0,15.207h-6.32c0,0,0-8.307,0-15.207h-3.006  V24.31h3.006v-3.479c0-2.49,1.182-6.377,6.379-6.377l4.68,0.018v5.215c0,0-2.846,0-3.398,0c-0.555,0-1.34,0.277-1.34,1.461v3.163  h4.818L34.864,29.679z' />
                  </svg>
                </span>
              </a>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href='https://twitter.com/linksnatched/'
              >
                <span className={`w-5 h-5`}>
                  <svg
                    version='1.0'
                    xmlns='http://www.w3.org/2000/svg'
                    width='25px'
                    height='25px'
                    viewBox='0 0 204.000000 192.000000'
                    preserveAspectRatio='xMidYMid meet'
                  >
                    <g
                      transform='translate(0.000000,192.000000) scale(0.100000,-0.100000)'
                      fill={isLight ? '#000000' : '#ffffff'}
                      stroke='none'
                    >
                      <path
                        d='M1295 1833 c-78 -28 -136 -66 -193 -127 -88 -93 -129 -209 -119 -339
l4 -69 -70 7 c-261 25 -540 157 -735 345 -73 70 -88 78 -122 60 -40 -22 -59
-150 -37 -255 22 -104 50 -159 114 -227 l58 -61 -40 6 c-22 3 -56 9 -76 13
-30 5 -41 2 -59 -16 -28 -28 -22 -70 23 -154 56 -105 167 -198 272 -227 34
-10 37 -13 20 -20 -11 -4 -37 -8 -58 -8 -78 -2 -99 -33 -63 -95 57 -98 192
-188 302 -202 30 -3 54 -9 54 -13 0 -11 -112 -79 -181 -110 -87 -39 -203 -69
-301 -77 -43 -4 -81 -11 -84 -16 -12 -19 31 -48 120 -83 180 -69 311 -95 480
-95 263 0 489 67 696 205 329 219 546 610 567 1023 l6 113 54 46 c30 25 68 64
85 85 26 34 29 41 17 53 -12 11 -27 10 -92 -7 -84 -21 -106 -18 -66 10 35 24
96 92 116 129 14 26 15 35 5 45 -10 10 -22 8 -60 -6 -26 -10 -77 -27 -115 -38
l-67 -19 -43 36 c-23 20 -70 50 -105 67 -54 27 -76 32 -160 35 -75 3 -108 0
-147 -14z'
                      />
                    </g>
                  </svg>
                </span>
              </a>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href='https://instagram.com/linksnatched/'
              >
                <svg
                  version='1.1'
                  id='Layer_1'
                  xmlns='http://www.w3.org/2000/svg'
                  x='0px'
                  y='0px'
                  viewBox='0 0 56.7 56.7'
                  enable-background='new 0 0 56.7 56.7'
                  width='25px'
                  height='25px'
                  fill={isLight ? '#000000' : '#ffffff'}
                >
                  <g>
                    <path d='M28.2,16.7c-7,0-12.8,5.7-12.8,12.8s5.7,12.8,12.8,12.8S41,36.5,41,29.5S35.2,16.7,28.2,16.7z M28.2,37.7   c-4.5,0-8.2-3.7-8.2-8.2s3.7-8.2,8.2-8.2s8.2,3.7,8.2,8.2S32.7,37.7,28.2,37.7z' />
                    <circle cx='41.5' cy='16.4' r='2.9' />
                    <path d='M49,8.9c-2.6-2.7-6.3-4.1-10.5-4.1H17.9c-8.7,0-14.5,5.8-14.5,14.5v20.5c0,4.3,1.4,8,4.2,10.7c2.7,2.6,6.3,3.9,10.4,3.9   h20.4c4.3,0,7.9-1.4,10.5-3.9c2.7-2.6,4.1-6.3,4.1-10.6V19.3C53,15.1,51.6,11.5,49,8.9z M48.6,39.9c0,3.1-1.1,5.6-2.9,7.3   s-4.3,2.6-7.3,2.6H18c-3,0-5.5-0.9-7.3-2.6C8.9,45.4,8,42.9,8,39.8V19.3c0-3,0.9-5.5,2.7-7.3c1.7-1.7,4.3-2.6,7.3-2.6h20.6   c3,0,5.5,0.9,7.3,2.7c1.7,1.8,2.7,4.3,2.7,7.2V39.9L48.6,39.9z' />
                  </g>
                </svg>
              </a>
            </div>
          </div>
        </div> */}

        {/* Copyright */}
        <div className='flex flex-row gap-4 text-[16px] items-center'>
          <img
            src='https://app.linksnatched.com/imgs/logo.png'
            className='h-10 w-10'
            alt='Linksnatched'
          />
          <div>
            {/* <div className='flex items-center gap-2'>
              <span>
                <a
                  href='https://mozilla.org/about/'
                  className='underline hover:text-gray-800 transition-colors duration-200'
                >
                  {chrome.i18n.getMessage('options_family')}
                </a>
              </span>
            </div> */}
            <div className='flex gap-4'>
              <span>©{new Date().getFullYear()} Linksnatched.</span>
              <a
                href='https://app.linksnatched.com/privacy'
                className='underline hover:text-gray-800 transition-colors duration-200'
              >
                Privacy policy
              </a>
              <a
                href='https://app.linksnatched.com/terms'
                className='underline hover:text-gray-800 transition-colors duration-200'
              >
                Terms of service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
