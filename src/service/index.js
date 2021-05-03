import axios from 'axios';

const API_KEY = '8c820eb6';

const fetch = (baseurl) => {
  return axios.get(baseurl)
  .catch(err => console.log('[ERR] ', err));
};

const convertQueryString = (params) => {
  return Object.keys(params)
  .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  .join('&');
};

export async function fetchCinemaList(payload) {
  const params = convertQueryString({
    ...payload,
    apikey: API_KEY,
  });
  return fetch(`https://www.omdbapi.com/?${params}`);
};
