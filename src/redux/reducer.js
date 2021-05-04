import * as types from './types';

const initialState = {
  data: undefined,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_DATA:
      return { ...state, data: action.payload };
    default:
      return state;
  }
};

export default reducer;
