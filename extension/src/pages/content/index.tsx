import { createRoot } from 'react-dom/client';
import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { IItemPreview } from './types';
import { ThemeProvider } from '../components/theme-provider';
import {
  SAVE_TO_LINKSNATCHED_FAILURE,
  SAVE_TO_LINKSNATCHED_SUCCESS,
  SAVE_TO_LINKSNATCHED_REQUEST,
  REMOVE_ITEM_REQUEST,
  REMOVE_ITEM_SUCCESS,
  REMOVE_ITEM_FAILURE,
  TAG_SYNC_REQUEST,
  TAG_SYNC_SUCCESS,
  TAG_SYNC_FAILURE,
  UPDATE_ITEM_PREVIEW,
  REMOVE_ITEM,
  TAGS_SYNC,
  UPDATE_TAG_ERROR,
  RESAVE_ITEM,
  OPEN_OPTIONS,
  OPEN_LINKSNATCHED,
  getSetting,
  // TOOLBAR_ICON_UPDATE,
} from '../background/utils/actions';
import tailwindcss from './index.css?inline';

// Tags Input Component
const TagsInput = ({
  tags,
  inputValue,
  setInputValue,
  onKeyDown,
  removeTag,
}: {
  tags: string[];
  inputValue: string;
  setInputValue: (inputValue: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  removeTag: (tagToRemove: string) => void;
}) => {
  return (
    <div className='flex flex-wrap gap-2 min-h-[40px] px-[5px] py-[5px] border border-gray-300 dark:bg-[#1A1A1A] rounded-[4px] focus-within:ring-1 focus-within:ring-grey-500 focus-within:border-grey-400'>
      {tags.map((tag, index) => (
        <span
          key={index}
          className='inline-flex items-center gap-1 p-2 text-[14px] leading-[16px] bg-blue-50 border border-blue-50 hover:border-black dark:hover:border-white text-green-700 dark:bg-[#004D48] dark:text-[#F2F2F2] rounded-full'
        >
          {tag}
          <button
            type='button'
            onClick={() => removeTag(tag)}
            className='ml-1 text-green-700 hover:text-green-800 dark:text-gray-200 dark:hover:text-gray-400 focus:outline-none cursor-pointer'
          >
            ×
          </button>
        </span>
      ))}
      <input
        type='text'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={
          tags.length === 0 ? chrome.i18n.getMessage('tagging_add_tags') : ''
        }
        className='flex-1 min-w-[120px] outline-none text-[16px] leading-[34px] text-[#1A1A1A] dark:text-[#F2F2F2]'
      />
    </div>
  );
};

// Main Component with Tags
const ContentApp = ({
  shadowContainer,
  shadowRoot,
}: {
  shadowContainer: HTMLElement;
  shadowRoot: ShadowRoot;
}) => {
  // const appTarget = useRef(null);
  const appTarget = useRef(shadowRoot);
  const [tags, setTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saving');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const [itemPreview, setItemPreview] = useState<IItemPreview>({
    id: '',
    title: '',
    publisher: '',
    thumbnail: '',
    tags: [],
  });
  const [theme, setThemeState] = useState<'theme-light' | 'dark' | 'system'>(
    'system'
  );

  useEffect(() => {
    const fetchSettings = async () => {
      const theme = await getSetting('theme');

      setThemeState(theme);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    shadowContainer.classList[isDark ? 'add' : 'remove']('dark');
  }, [theme]);

  /* Handle incoming messages
  –––––––––––––––––––––––––––––––––––––––––––––––––– */

  const handleMessages = (event: any) => {
    const { payload, action = 'Unknown Action' } = event || {};

    // if (!IS_RELEASE) {
    //   console.groupCollapsed(`RECEIVE: ${action}`);
    //   console.log(payload);
    //   console.groupEnd(`RECEIVE: ${action}`);
    // }

    switch (action) {
      case SAVE_TO_LINKSNATCHED_REQUEST: {
        setIsOpen(true);
        return setSaveStatus('saving');
      }

      case SAVE_TO_LINKSNATCHED_SUCCESS: {
        return setSaveStatus('saved');
      }

      case SAVE_TO_LINKSNATCHED_FAILURE: {
        const { message } = payload;
        setErrorMessage(message);
        return setSaveStatus('save_failed');
      }

      case REMOVE_ITEM_REQUEST: {
        return setSaveStatus('removing');
      }

      case REMOVE_ITEM_SUCCESS: {
        return setSaveStatus('removed');
      }

      case REMOVE_ITEM_FAILURE: {
        return setSaveStatus('remove_failed');
      }

      case TAG_SYNC_REQUEST: {
        return setSaveStatus('tags_saving');
      }

      case TAG_SYNC_SUCCESS: {
        return setSaveStatus('tags_saved');
      }

      case TAG_SYNC_FAILURE: {
        return setSaveStatus('tags_failed');
      }

      case UPDATE_TAG_ERROR: {
        const { errorStatus } = payload;
        const errorState = errorStatus ? 'tags_error' : 'saved';
        return setSaveStatus(errorState);
      }

      // Heading
      case UPDATE_ITEM_PREVIEW: {
        const { item } = payload;
        setItemId(item === null || item === void 0 ? void 0 : item.itemId);
        setItemPreview(item);
        return;
      }

      default: {
        return;
      }
    }
  };

  useEffect(() => {
    const loadingStatus = ['saving', 'removing', 'tags_saving'];
    setIsLoading(loadingStatus.includes(saveStatus));
    const errorStatus = [
      'save_failed',
      'remove_failed',
      'tags_failed',
      'tags_error',
      'error',
    ];
    setHasError(errorStatus.includes(saveStatus));

    if (saveStatus === 'removed') {
      setIsRemoved(true);
    }
  }, [saveStatus]);

  const handleDocumentClick = async (e: any) => {
    if (
      appTarget !== null &&
      appTarget !== void 0 &&
      e.target.id === appTarget.current.host.id
    )
      return;

    // chrome.runtime.sendMessage({
    //   type: TOOLBAR_ICON_UPDATE,
    //   payload: {
    //     isActive: false,
    //   },
    // });
    setIsOpen(false);
  };

  const keyPress = (e: any) => {
    // keyCode 27 === ESCAPE
    if (e.keyCode === 27) setIsOpen(false);
    // chrome.runtime.sendMessage({
    //   type: TOOLBAR_ICON_UPDATE,
    //   payload: {
    //     isActive: false,
    //   },
    // });
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessages);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keyup', keyPress);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keyup', keyPress);
    };
  }, []);

  const removeAction = () => {
    chrome.runtime.sendMessage({
      type: REMOVE_ITEM,
      payload: {
        itemId,
      },
    });
    setTags([]);
  };

  const saveAction = () => {
    chrome.runtime.sendMessage({
      type: RESAVE_ITEM,
    });
  };

  const [tagInputValue, setTagInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInputValue.trim())) {
        setTags([...tags, tagInputValue.trim()]);
      }
      setTagInputValue('');
      const payload = {
        item_id: itemId,
        tags: [...tags, tagInputValue.trim()].join(', '),
      };

      chrome.runtime.sendMessage({
        type: TAGS_SYNC,
        payload,
      });
    } else if (e.key === 'Backspace' && !tagInputValue && tags.length > 0) {
      setTags(tags.slice(0, -1));

      const payload = {
        item_id: itemId,
        tags: [...tags, tagInputValue.trim()].join(', '),
      };

      chrome.runtime.sendMessage({
        type: TAGS_SYNC,
        payload,
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    const payload = {
      item_id: itemId,
      tags: tags.filter((tag) => tag !== tagToRemove).join(', '),
    };

    chrome.runtime.sendMessage({
      type: TAGS_SYNC,
      payload,
    });
  };

  const [isTagsHidden, setIsTagsHidden] = useState(false);
  const [isItemPreviewHidden, setIsItemPreviewHidden] = useState(false);

  useEffect(() => {
    if (saveStatus === 'removed' || hasError) {
      setIsTagsHidden(true);
      setIsItemPreviewHidden(true);
    } else {
      setIsTagsHidden(false);
      setIsItemPreviewHidden(false);
    }
  }, [saveStatus, hasError, itemPreview]);

  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <div className={'fixed top-[0px] right-[0px] z-[2147483647]'}>
        <div
          className={`absolute border-1 border-solid border-[#D9D9D9] dark:border-gray-700 bg-[#ffffff] dark:bg-[#1A1A1A] w-[393px] top-[10px] right-[10px] p-[10px] rounded-[30px] box-border shadow-[35px_35px_35px_rgba(0,0,0,0.25)] transition duration-250 ease-in-out ${
            isOpen ? 'block' : 'hidden'
          }`}
        >
          <header className='flex justify-between items-center bg-blue-50 dark:bg-[#404040] py-[15px] pr-[20px] pl-[10px] rounded-[30px]'>
            <div className='flex items-center align-middle'>
              {isLoading ? (
                <div className='w-[30px] h-[30px] ml-[10px] mr-[15px]'>
                  <svg className='loader' viewBox='25 25 50 50'>
                    <circle r='20' cy='50' cx='50'></circle>
                  </svg>
                </div>
              ) : (
                <div className='w-6 h-6 ml-[10px] mr-[15px]'>
                  <img
                    src='https://app.linksnatched.com/imgs/logo.png'
                    className='h-6 w-6'
                    alt='Linksnatched'
                  />
                </div>
              )}

              {hasError ? (
                <div className='text-[16px] text-red-500 font-bold'>
                  {chrome.i18n.getMessage('heading_error')}
                </div>
              ) : (
                <span className='text-[16px] text-[#1A1A1A] dark:text-[#F2F2F2] font-bold'>
                  {chrome.i18n.getMessage(`heading_${saveStatus}`)}
                </span>
              )}
            </div>

            <div className='flex items-center gap-[10px]'>
              {saveStatus === 'removed' && (
                <button
                  className='bg-transparent border-none hover:underline text-green-700 dark:text-[#F2F2F2] font-[500] cursor-pointer no-underline'
                  onClick={() => saveAction()}
                >
                  {chrome.i18n.getMessage('buttons_save')}
                </button>
              )}

              {saveStatus === 'saved' && (
                <button
                  className='bg-transparent border-none hover:underline text-green-700 dark:text-[#F2F2F2] font-[500] cursor-pointer no-underline'
                  onClick={() => removeAction()}
                >
                  {chrome.i18n.getMessage(`buttons_remove`)}
                </button>
              )}

              {saveStatus === 'tags_saved' && (
                <button
                  className='bg-transparent border-none hover:underline text-green-700 dark:text-[#F2F2F2] font-[500] cursor-pointer no-underline'
                  onClick={() => removeAction()}
                >
                  {chrome.i18n.getMessage(`buttons_remove`)}
                </button>
              )}
            </div>
          </header>

          {!isItemPreviewHidden && itemPreview.title ? (
            <div className='flex mt-[10px] bg-[#F2F2F2] dark:bg-[#404040] p-[10px] rounded-[4px]'>
              {itemPreview.thumbnail ? (
                <img
                  className='w-[40px] h-[40px] mr-[15px] rounded-1'
                  src={itemPreview.thumbnail}
                ></img>
              ) : (
                <></>
              )}

              <div>
                <h3 className='font-bold mb-[10px] text-[16px] leading-[20px] text-[#1A1A1A] dark:text-[#F2F2F2]'>
                  {itemPreview.title}
                </h3>
                <p className='text-[#1A1A1A] dark:text-[#F2F2F2] text-[14px] leading-[21px] font-mono'>
                  {itemPreview.publisher}
                </p>
              </div>
            </div>
          ) : (
            <></>
          )}

          {/* Tags Input Section */}
          {!isTagsHidden && tags && (
            <div className='mt-[10px] rounded-[4px]'>
              <div>
                <TagsInput
                  tags={tags}
                  inputValue={tagInputValue}
                  setInputValue={setTagInputValue}
                  onKeyDown={handleKeyDown}
                  removeTag={handleRemoveTag}
                />
                <div className='leading-[20px] box-border'>
                  <ul className='pt-[10px]'></ul>
                </div>
              </div>
            </div>
          )}

          <footer className='flex border-t-[1px] border-[#D9D9D9] mt-[10px] pt-[18px] pb-[8px] justify-between items-center'>
            <button
              className='cursor-pointer transition-all duration-150 ease-in-out flex items-center text-[#1A1A1A] dark:text-[#F2F2F2] hover:text-green-700 dark:hover:text-green-700 transition duration-250 ease-in-out'
              onClick={() => {
                chrome.runtime.sendMessage({
                  type: OPEN_LINKSNATCHED,
                });
              }}
            >
              <span className='w-[25px] h-[25px] mr-[8px] leading-[25px]'>
                <svg
                  aria-labelledby=' '
                  fill='currentColor'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path d='M5 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM5 19a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z'></path>
                  <path
                    fill-rule='evenodd'
                    d='M7 5a1 1 0 011-1h13a1 1 0 110 2H8a1 1 0 01-1-1zM7 12a1 1 0 011-1h13a1 1 0 110 2H8a1 1 0 01-1-1zM7 19a1 1 0 011-1h13a1 1 0 110 2H8a1 1 0 01-1-1z'
                    clip-rule='evenodd'
                  ></path>
                </svg>
              </span>
              <span> {chrome.i18n.getMessage(`buttons_mylist`)}</span>
            </button>
            <button
              className='cursor-pointer transition-all duration-150 ease-in-out flex text-[#1A1A1A] dark:text-[#F2F2F2] hover:text-green-700 dark:hover:text-green-700 transition duration-250 ease-in-out'
              onClick={() => {
                chrome.runtime.sendMessage({
                  type: OPEN_OPTIONS,
                });
              }}
            >
              <span className='w-[25px] h-[25px] mr-[8px] inline-block leading-[25px]'>
                <svg
                  aria-labelledby=' '
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path
                    fill='none'
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M21.736 10.317l-2.942-.5a7.08 7.08 0 00-.448-1.077l1.729-2.434a.316.316 0 00-.034-.407l-1.94-1.94a.316.316 0 00-.407-.034l-2.434 1.73a7.088 7.088 0 00-1.078-.449l-.499-2.942A.317.317 0 0013.371 2H10.63a.317.317 0 00-.312.264l-.5 2.942c-.37.12-.73.27-1.077.448L6.306 3.925a.317.317 0 00-.407.034L3.959 5.9a.317.317 0 00-.034.407l1.73 2.434a7.085 7.085 0 00-.449 1.078l-2.942.499a.317.317 0 00-.264.312v2.742a.317.317 0 00.264.312l2.942.5c.12.37.27.73.448 1.077l-1.729 2.434a.316.316 0 00.034.408L5.9 20.04a.317.317 0 00.407.034l2.434-1.73c.347.18.707.33 1.078.449l.499 2.942a.317.317 0 00.312.264h2.742a.317.317 0 00.312-.264l.5-2.942c.37-.12.73-.27 1.077-.448l2.434 1.729a.317.317 0 00.407-.034l1.94-1.94a.317.317 0 00.034-.407l-1.73-2.434c.18-.347.33-.707.449-1.078l2.942-.499a.317.317 0 00.264-.312V10.63a.317.317 0 00-.264-.312z'
                  ></path>
                  <circle
                    cx='12'
                    cy='12'
                    r='3'
                    stroke='currentColor'
                    fill='none'
                    stroke-width='2'
                  ></circle>
                </svg>
              </span>
            </button>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
};

// Create a host element and attach a shadow root
const host = document.createElement('div');
host.id = 'linksnatched-shadow-host';
document.body.appendChild(host);

const shadowRoot = host.attachShadow({ mode: 'open' });

// Create a container for React inside the shadow root
const shadowContainer = document.createElement('div');
shadowContainer.id = 'linksnatched-shadow-root';
shadowRoot.appendChild(shadowContainer);
const style = document.createElement('style');
style.textContent = tailwindcss;
shadowRoot.appendChild(style);
// Render React app into the shadow root container
createRoot(shadowContainer).render(
  <ContentApp shadowContainer={shadowContainer} shadowRoot={shadowRoot} />
);

try {
  console.log('content script loaded');
} catch (e) {
  console.error(e);
}
