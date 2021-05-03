import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

// components
// import BackgroundSwitch from '@components/assets-lib/BackgroundSwitch';
import ThreeComponent from '../../components/ThreeComponent';
// import UnityComponent from '@components/assets-lib/UnityComponent';

// styling
import './index.less';

const PreviewPage = () => {
  const location = useLocation();
  const id = location.search.split('=')[1];
  const previewArMode = location.pathname.indexOf('preview-ar') > -1;
  const [sceneBackground, setSceneBackground] = useState(0xffffff);
  const handleChangeBg = (evt, c) => setSceneBackground(c);

  return (
    <div className="layout">
      <ThreeComponent
        assetId={id}
        backgroundColor={sceneBackground}
        onError={(e) => console.log(`Error: Wrong response type: ${e}`)}
        />

      {/*previewArMode ? (
        <UnityComponent
          assetId={id}
          onError={(e) => message.error(`Error: Wrong response type: ${e}`)}
          />
      ) : (
        <>
          <ThreeComponent
            assetId={id}
            backgroundColor={sceneBackground}
            onError={(e) => message.error(`Error: Wrong response type: ${e}`)}
            />

          <BackgroundSwitch
            background3D={sceneBackground}
            changeBackGround={handleChangeBg}
          />
        </>
      )*/}
    </div>
  );
};

export default PreviewPage;
