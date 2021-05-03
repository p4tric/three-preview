import React from 'react';

import '../../index.css';

const SearchItem = ({ item }) => {
  return (
    <>
      <div className="card-container">
        <div style={{ position: 'relative' }} className="flex-center-start">

          <div className="card-img-container">
            <div className="parallelogram">
              <div
                style={{ background: item.Poster === 'N/A'
                  ? 'black'
                  : `url(${item.Poster})` }}
                className="imago"></div>
            </div>
          </div>

          <div className="card-details flex-col flex-center-start">
            <span className="card1-text primary-text">{item.Title}</span>
            <span className="card2-text gray-text">Year Released: {item.Year}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchItem;
