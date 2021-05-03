import React from 'react';

import SearchBar from '../SearchBar';

import '../../index.css';

const Header = () => {
  return (
    <div className="header-container">
      <div className="flex-center-between">
        <a style={{ textDecoration: 'none' }} href="/">
          <div className="flex-col flex-center-start">
            <span className="header-text primary-text">hey</span>
            <span className="header-text secondary-text">cinema</span>
          </div>
        </a>


        <SearchBar />

      </div>
    </div>
  );
};

export default Header;
