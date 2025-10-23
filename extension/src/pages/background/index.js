console.log('background script loaded');
import { AUTH_CODE_RECEIVED } from './utils/actions';
import {
  setSettings,
  getSetting,
  withScope,
  captureMessage,
  SAVE_TO_LINKSNATCHED_REQUEST,
  SAVE_TO_LINKSNATCHED_SUCCESS,
  SAVE_TO_LINKSNATCHED_FAILURE,
  setToolbarIcon,
  UPDATE_ITEM_PREVIEW,
  REMOVE_ITEM,
  REMOVE_ITEM_REQUEST,
  REMOVE_ITEM_SUCCESS,
  REMOVE_ITEM_FAILURE,
  RESAVE_ITEM,
  TAGS_SYNC,
  TAG_SYNC_REQUEST,
  TAG_SYNC_SUCCESS,
  TAG_SYNC_FAILURE,
  COLOR_MODE_CHANGE,
  LOGGED_OUT_OF_LINKSNATCHED,
  OPEN_OPTIONS,
  OPEN_LINKSNATCHED,
  USER_LOG_IN,
  TOOLBAR_ICON_UPDATE,
} from './utils/actions';
import {
  API_URL,
  LOGOUT_URL,
  AUTH_URL,
  LINKSNATCHED_LIST,
  LINKSNATCHED_HOME,
} from './utils/constants';
import { closeLoginPage, isSystemPage, deriveItemData } from './utils/helpers';

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */

function saveToLinksnatched(saveObject) {
  return request({
    path: '/api/v1/link/',
    method: 'POST',
    data: {
      url: saveObject.url,
      title: saveObject.title,
    },
  }).then((response) => {
    return response
      ? {
          status: response.code,
          message: response.message,
          data: response.data,
        }
      : undefined;
  });
}

async function getLinksByUrl(url) {
  const encodedUrl = btoa(url)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return request({
    path: `/api/v1/link/url/${encodedUrl}`,
    method: 'GET',
  }).then((response) => {
    return response
      ? {
          status: response.code,
          message: response.message,
          data: response.data,
        }
      : undefined;
  });
}

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */

function removeItem(itemId) {
  return request({
    path: `/api/v1/link/${itemId}`,
    method: 'DELETE',
  }).then((response) => {
    return response
      ? {
          status: response.code,
          message: response.message,
          data: response.data,
        }
      : undefined;
  });
}

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */

// function getOnSaveTags(url) {
//   return request({
//     path: 'suggested_tags/',
//     data: {
//       url,
//       version: 2,
//     },
//   }).then((response) => response);
// }
function syncItemTags(id, tags, actionInfo) {
  return request({
    path: `/api/v1/link/${id}/tags`,
    method: 'PUT',
    data: {
      tags,
    },
  }).then((response) => {
    return response
      ? {
          status: response.code,
          message: response.message,
          data: response.data,
        }
      : undefined;
  });
}

/* On successful save
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function saveSuccess(tabId, payload) {
  // Update toolbar icon

  const { resolved_url, given_url, isLink } = payload; // fetch image and title from above

  const url = resolved_url || given_url; //eslint-disable-line

  if (!isLink) setToolbarIcon(tabId, true); // Get item preview

  getItemPreview(tabId, payload); // Get list of users tags for typeahead

  // getStoredTags(tabId); // Premium: Request suggested tags

  // getTagSuggestions(url, tabId);
}
/* Derive item preview from save response
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function getItemPreview(tabId, payload) {
  const item = await deriveItemData(payload);
  chrome.tabs.sendMessage(tabId, {
    action: UPDATE_ITEM_PREVIEW,
    payload: {
      item,
    },
  });
}
/* Get stored tags
–––––––––––––––––––––––––––––––––––––––––––––––––– */

// async function getStoredTags(tabId) {
//   // Check for server tags
//   const fetchedSince = (await getSetting('tags_fetched_timestamp')) || 0;
//   const fetchTags = await fetchStoredTags(fetchedSince);
//   const fetchedTags = fetchTags ? fetchTags.tags || [] : [];
//   const tagsFromSettings = await getSetting('tags_stored');
//   const parsedTags = tagsFromSettings ? JSON.parse(tagsFromSettings) : [];
//   const tags_stored = [...new Set([].concat(...parsedTags, ...fetchedTags))];
//   const tags = JSON.stringify(tags_stored);
//   setSettings({
//     tags_stored: tags,
//     tags_fetched_timestamp: Date.now(),
//   });
//   chrome.tabs.sendMessage(tabId, {
//     action: UPDATE_STORED_TAGS,
//     payload: {
//       tags: tags_stored,
//     },
//   });
// }
/* Get suggested tags for premium users
–––––––––––––––––––––––––––––––––––––––––––––––––– */

// async function getTagSuggestions(url, tabId) {
//   const premiumStatus = await getSetting('premium_status');
//   if (premiumStatus !== '1') return;

//   try {
//     const response = await getOnSaveTags(url);
//     const suggestedTags = response
//       ? response.suggested_tags.map((tag) => tag.tag)
//       : [];

//     if (response) {
//       chrome.tabs.sendMessage(tabId, {
//         action: SUGGESTED_TAGS_SUCCESS,
//         payload: {
//           suggestedTags,
//         },
//       });
//     }
//   } catch (err) {
//     console.info(err === null || err === void 0 ? void 0 : err.xError);
//   }
// }

/* Saving
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function save({ linkUrl, pageUrl, title, tabId }) {
  // send message that we are requesting a save
  chrome.tabs.sendMessage(tabId, {
    action: SAVE_TO_LINKSNATCHED_REQUEST,
  });

  try {
    // Are we authed?
    const access_token = await getSetting('access_token');
    if (!access_token)
      return logIn({
        linkUrl,
        pageUrl,
        title,
        tabId,
      });

    const url = linkUrl || pageUrl;

    const getLinksResponse = await getLinksByUrl(url);
    if (getLinksResponse.data.length > 0) {
      const message = {
        action: SAVE_TO_LINKSNATCHED_SUCCESS,
        payload: {},
      };
      chrome.tabs.sendMessage(tabId, message);
      saveSuccess(tabId, {
        ...getLinksResponse.data[0],
        isLink: Boolean(linkUrl),
      });
      return;
    }

    const response = await saveToLinksnatched({
      url,
      title,
      tabId,
    }); // send a message with the response

    const message =
      response.status === 200
        ? {
            action: SAVE_TO_LINKSNATCHED_SUCCESS,
            payload: response,
          }
        : {
            action: SAVE_TO_LINKSNATCHED_FAILURE,
            payload: response,
          };
    chrome.tabs.sendMessage(tabId, message);
    if (response.data)
      saveSuccess(tabId, { ...response.data, isLink: Boolean(linkUrl) });
  } catch (error) {
    // If it is an auth error let's redirect the user
    if (error.status === 401) {
      return logIn({
        linkUrl,
        pageUrl,
        title,
        tabId,
      });
    }

    const payload = {
      message: error,
    };
    const errorMessage = {
      action: SAVE_TO_LINKSNATCHED_FAILURE,
      payload,
    };
    chrome.tabs.sendMessage(tabId, errorMessage);
  }
}

/* Remove item
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function removeItemAction(tab, payload) {
  const { id: tabId } = tab;
  const { itemId } = payload; // send message that we are attempting to sync tags

  chrome.tabs.sendMessage(tabId, {
    action: REMOVE_ITEM_REQUEST,
  });
  const response = await removeItem(itemId);
  const message =
    response.status === 200
      ? {
          action: REMOVE_ITEM_SUCCESS,
          payload: response,
        }
      : {
          action: REMOVE_ITEM_FAILURE,
          payload: response,
        };
  chrome.tabs.sendMessage(tabId, message);
  if (response) setToolbarIcon(tabId, false);
}

/* Add tags to item
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function tagsSyncAction(tab, payload) {
  const { id: tabId } = tab;
  const { item_id, tags, ...actionInfo } = payload; // send message that we are attempting to sync tags

  chrome.tabs.sendMessage(tabId, {
    action: TAG_SYNC_REQUEST,
  });
  const response = await syncItemTags(item_id, tags, actionInfo);
  const message =
    response.status === 200
      ? {
          action: TAG_SYNC_SUCCESS,
          payload: response,
        }
      : {
          action: TAG_SYNC_FAILURE,
          payload: response,
        };
  chrome.tabs.sendMessage(tabId, message);
}

var postAuthSave = null;
/* Helper Functions
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function request(options, authToken) {
  const headers = new Headers({
    'X-Accept': 'application/json',
    'Content-Type': 'application/json',
  }); //?? Is there any way to access this anymore since we no longer use cookie/local storage
  //?? We never set this parameter anywhere; propose we delete this block

  const accessToken = authToken ? authToken : await getSetting('access_token');

  if (accessToken) {
    headers.append('Authorization', 'Bearer ' + accessToken);
  }

  const fetchSettings = {
    method: options.method || 'POST',
    headers: headers,
    body: JSON.stringify(options.data),
  };
  return fetch(API_URL + options.path, fetchSettings)
    .then(handleErrors)
    .then(handleSuccess);
}

function handleErrors(response) {
  if (response.status !== 200 && response.status !== 304)
    return Promise.reject({
      status: response.status,
      message: 'Request failed',
      response: response,
    });
  return response;
}

function handleSuccess(response) {
  return response ? response.json() : false;
}

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */

function authorize(accessToken) {
  return request(
    {
      path: '/api/v1/user/',
      method: 'Get',
    },
    accessToken
  ).then((response) => {
    return response
      ? {
          status: response.code,
          message: response.message,
          data: response.data,
        }
      : undefined;
  });
}

/* Context Menus
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function setContextMenus() {
  // chrome.contextMenus.removeAll(); // Page Context - Right click menu on page
  // chrome.contextMenus.create({
  //   title: localize('context_menu_save'),
  //   id: 'pageContextClick',
  //   contexts: ['page', 'frame', 'editable', 'image', 'video', 'audio', 'link', 'selection'], // prettier-ignore
  // }); // Browser Icon - Right click menu
  // chrome.contextMenus.create({
  //   title: localize('context_menu_open_list'),
  //   id: 'toolbarContextClickList',
  //   contexts: ['action'],
  // });
  // chrome.contextMenus.create({
  //   title: localize('context_menu_discover_more'),
  //   id: 'toolbarContextClickHome',
  //   contexts: ['action'],
  // }); // Log In or Out menu item depending on existence of access token
  // const access_token = await getSetting('access_token');
  // if (access_token) {
  //   chrome.contextMenus.create({
  //     title: localize('context_menu_log_out'),
  //     id: 'toolbarContextClickLogOut',
  //     contexts: ['action'],
  //   });
  // } else {
  //   chrome.contextMenus.create({
  //     title: localize('context_menu_log_in'),
  //     id: 'toolbarContextClickLogIn',
  //     contexts: ['action'],
  //   });
  // }
}

/* Authentication user
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function authCodeRecieved(tab, payload) {
  try {
    const accessToken = payload;
    const response = await authorize(accessToken);

    setSettings({
      access_token: accessToken,
      username: response.data.email || '',
    });
  } catch (err) {
    withScope((scope) => {
      scope.setFingerprint('Auth Error');
      captureMessage(err);
    });
  }

  // closeLoginPage();
  setContextMenus();
  if (postAuthSave) save(postAuthSave);
  postAuthSave = null;
}

function logOut() {
  chrome.tabs.create({
    url: LOGOUT_URL,
  });
}

function loggedOutOfLinksnatched() {
  chrome.storage.local.clear();
  setContextMenus();
}
function logIn(saveObject) {
  postAuthSave = saveObject;
  chrome.tabs.create({
    url: AUTH_URL,
  });
}
function openLinksnatched() {
  chrome.tabs.create({
    url: LINKSNATCHED_LIST,
  });
}
function openLinksnatchedList() {
  chrome.tabs.create({
    url: LINKSNATCHED_LIST,
  });
}
function openLinksnatchedHome() {
  chrome.tabs.create({
    url: LINKSNATCHED_HOME,
  });
}
function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

/* Browser Action - Toolbar Icon Clicked
–––––––––––––––––––––––––––––––––––––––––––––––––– */

function browserAction(tab) {
  if (isSystemPage(tab)) return openLinksnatchedHome(); // open list on non-standard pages

  const { id: tabId, title, url: pageUrl } = tab;
  save({
    pageUrl,
    title,
    tabId,
  });
}

/* Tab Changes
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function tabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.status === 'loading') {
    // if actively loading a new page, unset save state on icon
    setToolbarIcon(tabId, false);
  }

  if (changeInfo.status === 'complete') {
    // Get the URL - try multiple sources
    let url = changeInfo.url;

    if (!url) {
      // Fallback: get URL from tab
      chrome.tabs.get(tabId, (tab) => {
        if (tab && tab.url) {
          handlePageLoaded(tabId, tab.url);
        }
      });
    } else {
      handlePageLoaded(tabId, url);
    }
  }
}

function handlePageLoaded(tabId, url) {
  // Skip invalid URLs
  if (
    !url ||
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:')
  ) {
    console.log('Skipping invalid URL:', url);
    return;
  }

  // Example: Check if the page is already saved
  getLinksByUrl(url)
    .then((response) => {
      if (response && response.data && response.data.length > 0) {
        setToolbarIcon(tabId, true);
      } else {
        setToolbarIcon(tabId, false);
      }
    })
    .catch((error) => {
      console.error('Error checking if page is saved:', error);
      setToolbarIcon(tabId, false);
    });
}

/* Theme Changes
–––––––––––––––––––––––––––––––––––––––––––––––––– */

async function setColorMode(tab, { theme }) {
  await setSettings({
    theme,
  });
}

chrome.runtime.onMessageExternal.addListener(
  async (message, sender, sendResponse) => {
    const { type, payload } = message;
    const { tab } = sender;

    switch (type) {
      case AUTH_CODE_RECEIVED:
        authCodeRecieved(tab, payload);
        sendResponse({ message: 'OK' });
        return true;
      case LOGGED_OUT_OF_LINKSNATCHED:
        loggedOutOfLinksnatched();
        sendResponse({ message: 'OK' });
        return true;
      default:
        return false;
    }
  }
);

/* Browser Action - Toolbar
–––––––––––––––––––––––––––––––––––––––––––––––––– */

chrome.action.onClicked.addListener(browserAction);
// chrome.commands.onCommand.addListener((command, tab) => {
//   if (command === 'save-to-linksnatched-action') browserAction(tab);
// });

/* Tab Handling
–––––––––––––––––––––––––––––––––––––––––––––––––– */
// Update the icon to unsaved if we are change pages
chrome.tabs.onUpdated.addListener(tabUpdated);
chrome.runtime.onMessage.addListener(function (message, sender) {
  const { type, payload } = message;
  const { tab } = sender;
  console.groupCollapsed(`RECEIVE: ${type}`);
  console.log(payload);
  console.groupEnd(`RECEIVE: ${type}`);

  switch (type) {
    case AUTH_CODE_RECEIVED:
      authCodeRecieved(tab, payload);
      return;

    case USER_LOG_IN:
      logIn(tab);
      return;

    case LOGGED_OUT_OF_LINKSNATCHED:
      loggedOutOfLinksnatched();
      return;

    case TOOLBAR_ICON_UPDATE:
      setToolbarIcon(tab.id, payload.isActive);
      return;

    case REMOVE_ITEM:
      removeItemAction(tab, payload);
      return;

    case RESAVE_ITEM:
      browserAction(tab);
      return;

    case TAGS_SYNC:
      tagsSyncAction(tab, payload);
      return;

    // case SEND_TAG_ERROR:
    //   tagsErrorAction(tab, payload);
    //   return;

    case COLOR_MODE_CHANGE:
      setColorMode(tab, payload);
      return;

    case OPEN_LINKSNATCHED:
      openLinksnatched();
      return;

    case OPEN_OPTIONS:
      openOptionsPage();
      return;

    default:
      return Promise.resolve(`Message received: ${type}`);
  }
});
