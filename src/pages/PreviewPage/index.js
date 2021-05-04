import React from 'react';

// components
import ThreeComponent from '../../components/ThreeComponent';

// styling
import './index.css';

const PreviewPage = () => {
  return (
    <div className={['tertiary-bg', 'layout']}>
      <ThreeComponent
        onError={(e) => console.log(`Error: Wrong response type: ${e}`)}
        />
    </div>
  );
};

export default PreviewPage;
