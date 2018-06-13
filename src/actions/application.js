import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  showLoading,
  hideLoading,
  resetLoading,
} from 'react-redux-loading-bar';
import api from '../utils/api/api';

export const SET_MESSAGE = 'SET_MESSAGE';
export const MESSAGE_ERROR = 'MESSAGE_ERROR';
export const MESSAGE_SUCCESS = 'MESSAGE_SUCCESS';

export const setMessage = (message, type = MESSAGE_ERROR) => ({
  type: SET_MESSAGE,
  payload: {
    message,
    type,
  },
});

export const CLEAR_MESSAGE = 'CLEAR_MESSAGE';
export const clearMessage = () => ({
  type: CLEAR_MESSAGE,
});

export const MENU_REQUESTED = 'MENU_REQUESTED';
export const requestMenu = () => ({
  type: MENU_REQUESTED,
  payload: {},
});

export const MENU_LOADED = 'MENU_LOADED';
function* loadMenu() {
  try {
    yield put(resetLoading());
    yield put(showLoading());
    const menuLinks = yield call(api, 'menu');
    if (menuLinks.message) {
      throw new Error(
        'Unable to access data from Drupal. Did you set REACT_APP_DRUPAL_BASE_URL to localhost instead of 127.0.0.1?',
      );
    }
    yield put({
      type: MENU_LOADED,
      payload: {
        menuLinks,
      },
    });
  } catch (error) {
    yield put(setMessage(error.toString()));
  } finally {
    yield put(hideLoading());
  }
}

/**
 * Gets all available content types.
 */
export const CONTENT_TYPES_REQUESTED = 'CONTENT_TYPES_REQUESTED';
export const requestContentTypes = () => ({
  type: CONTENT_TYPES_REQUESTED,
  payload: {},
});

export const getContentTypeCache = state => state.application.contentTypes;
export const CONTENT_TYPES_LOADED = 'CONTENT_TYPES_LOADED';
function* loadContentTypes() {
  try {
    let contentTypes = yield select(getContentTypeCache);
    if (!Object.keys(contentTypes).length) {
      contentTypes = yield call(api, 'contentTypes');
    }
    yield put({
      type: CONTENT_TYPES_LOADED,
      payload: {
        contentTypes,
      },
    });
  } catch (error) {
    yield put(setMessage(error.toString()));
  } finally {
    yield put(hideLoading());
  }
}

export default function* watchRequestedMenu() {
  yield takeLatest(MENU_REQUESTED, loadMenu);
  yield takeLatest(CONTENT_TYPES_REQUESTED, loadContentTypes);
}
