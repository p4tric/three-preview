import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { getCinemaList } from '../../redux/actions';

import { useDebounce } from '../../utils';

import SearchItem from '../SearchItem';

const SearchList = () => {
  const dispatch = useDispatch();
  const { searchText, cinemaList, totalResults } = useSelector(state => state);
  const [pageIndex, setPageIndex] = useState(1);
  const [localList, setLocalList] = useState([]);

  const handleClick = useDebounce((evt) => handleCinemaList(pageIndex + 1), 500);

  const handleCinemaList = useCallback((page = 1) => {
    const payload = searchText ? { page, s: searchText } : {};
    setPageIndex(page);
    dispatch(getCinemaList(payload));
  }, [dispatch, searchText]);

  useEffect(() => handleCinemaList(), [handleCinemaList]);

  useEffect(() => {
    if (cinemaList) setLocalList([ ...localList, ...cinemaList]);
    return () => setLocalList([]);
  }, [cinemaList]);

  useEffect(() => setLocalList([]), [searchText]);

  if (!cinemaList || cinemaList.length === 0 || localList.length === 0) return (
    <div className="searchlist-container">
      <p style={{ marginLeft: 20 }} className="primary-text">No cinema records. Try searching.</p>
    </div>
  );

  return (
    <>
      <p style={{ marginLeft: 20 }} className="primary-text">Search Results:</p>
      <div className="searchlist-container">

        <div className="searchitems-container">
          {localList.map((a,idx) => (
            <SearchItem item={a} key={idx} />
          ))}
        </div>

        {localList.length < totalResults &&
          <div className="searchlist-button">
            <button onClick={handleClick}>Load More Results</button>
          </div>
        }
      </div>
    </>
  );
};

export default SearchList;
