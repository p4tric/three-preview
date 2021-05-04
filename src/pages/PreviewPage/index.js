import React from 'react';

// components
import ThreeComponent from '../../components/ThreeComponent';

// import cottageFbx from '../../assets/fbx/dFiles/cottage.fbx';
import catFbx from '../../assets/fbx/dFiles/cat.fbx';

// styling
import './index.css';

const PreviewPage = () => {
  return (
    <div className={['tertiary-bg', 'layout']}>
      <ThreeComponent
        fbxFile={catFbx}
        onError={(e) => console.log(`Error: Wrong response type: ${e}`)}
        />
    </div>
  );
};

export default PreviewPage;
