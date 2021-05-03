import { fetchCinemaList } from '../service';

// types
import * as types from './types';
const type = {
  MOVIE: 'movie',
  SERIES: 'series',
  EPISODE: 'episode'
};

export const getCinemaList = (payload) => async (dispatch) => {
  const res = await fetchCinemaList({ ...payload, type: type.MOVIE });

  dispatch({
    type: types.SET_CINEMA_LIST,
    payload: res.data.Search ?? [],
  });

  dispatch({
    type: types.SET_TOTAL_RESULT,
    payload: res.data.totalResults ?? 0,
  });

  return res;
};

export const setSearchText = (payload) => async (dispatch) => {

  dispatch({
    type: types.SET_SEARCH_TEXT,
    payload: payload,
  });
  return payload;
};
