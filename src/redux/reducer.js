import * as types from './types';

const initialState = {
  cinemaList: undefined,
  loading: false,
  searchText: '',
  totalResults: 0,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_CINEMA_LIST:
      return { ...state, cinemaList: action.payload };
    case types.SET_LOADING:
      return { ...state, loading: action.payload }
    case types.SET_SEARCH_TEXT:
      return { ...state, searchText: action.payload };
    case types.SET_TOTAL_RESULT:
      return { ...state, totalResults: action.payload }
    default:
      return state;
  }
};

export default reducer;
