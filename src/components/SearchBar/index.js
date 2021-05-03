import React from 'react';

import { useDispatch } from 'react-redux';
import { setSearchText } from '../../redux/actions';
import { useDebounce } from '../../utils';
import searchIcon from '../../search-solid.svg';

import '../../index.css';

const SearchBar = () => {
  const dispatch = useDispatch();

  const handleChange = useDebounce((evt) => {
    const { value } = evt.target;
    dispatch(setSearchText(value));
  }, 500);

  return (
    <div className="search-container">
      <input className="search-box" onChange={handleChange} placeholder="Enter movie name.."/>
      <img alt="search" className="primary-text search-icon" src={searchIcon} />
  </div>
  );
};

export default SearchBar;
