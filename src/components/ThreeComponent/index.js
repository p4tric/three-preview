import React, { useEffect, useState } from 'react';

// Three js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import fbx1 from '../../assets/fbx/dFiles/fbx1.fbx';
import grass1 from '../../assets/textures/grasslight-big.jpg';

// Images
import LongLoad from '../../assets/images/tp.jpg';

import {
  MAP_NAMES,
  getHeight,
  getWidth,
  getModelWidth,
  initialBackground,
  product3D,
} from '../../constants/preview-3d-ar';

// styling
import './index.css';

let camera;
let content;
let controls;
let el;
let threeD;
let renderer;
let requestID;
let scene;

const ThreeComponent = ({
  fbxFile = fbx1,
  groundTextureFile = grass1,
  containerHeight = getHeight(),
  containerWidth = getWidth(),
  onError,
}) => {

  const [finishedLoading, setFinishedLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Preparing model..');
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  // function that sets 3d model in position
  const frameArea = (sizeToFitOnScreen, boxSize, boxCenter) => {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.Math.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, -7, 1))
      .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  };

  // setting up node material that will be used on texture encoding
  const mutateNodeMaterial = (material) => {
    return new THREE.MeshStandardMaterial({
      name: material.name,
      alphaMap: material.alphaMap,
      alphaTest: material.alphaTest,
      alphaToCoverage: material.alphaToCoverage,
      aoMap: material.aoMap,
      aoMapIntensity: material.aoMapIntensity,

      color: material.color,
      colorWrite: true,

      emissive: material.emissive,
      emissiveIntensity: material.emissiveIntensity,
      emissiveMap: material.emissiveMap,

      flatShading: material.flatShading,
      fog: material.fog,

      lightMap: material.lightMap,
      lightMapIntensity: material.lightMapIntensity,

      map: material.map,
      morphNormals: material.morphNormals,
      morphTargets: material.morphTargets,
      normalMap: material.normalMap,
      normalMapType: material.normalMapType,
      normalScale: material.normalScale,
      opacity: material.opacity,

      side: material.side,
      skinning: material.skinning,

      toneMapped: material.toneMapped,
      transparent: material.transparent,


      stencilMask: material.stencilMask,
      wrapAround: material.wrapAround,
      wrapRGB: material.wrapRGB,
    });
  };

  // main traverse loop for texture encoding extracted from zip file
  const traverseMaterials = (object, callback) => {
    object.traverse((node) => {
      let mutatedMaterials;
      let mutatedMaterial;

      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
      if (!node.isMesh) {
        return;
      }
      if (Array.isArray(node.material)) {
        mutatedMaterials = node.material.map(mat => mutateNodeMaterial(mat));
      } else {
        mutatedMaterial = mutateNodeMaterial(node.material);
      }

      const materials = Array.isArray(node.material) ? mutatedMaterials : [mutatedMaterial];
      materials.forEach(callback);

      setTimeout(() => {
        setFinishedLoading(true);
        window.dispatchEvent(new Event('resize'));
      }, 5000);
    });
  };

  // clean up of existing scene and node object, traversing into MAP_NAMES
  const clear = () => {
    if (!content) return;
    scene.remove(content);
    // dispose geometry
    content.traverse((node) => {
      if (!node.isMesh) return;
      node.geometry.dispose();
    });

    traverseMaterials(content, (material) => {
      MAP_NAMES.forEach((map) => {
        if (material[map]) material[map].dispose();
      });
    });
  };

  // setting up default lights, that is used to light up the 3d model
  const setContent = (object) => {
    clear();
    object.updateMatrixWorld();

    const ambientIntensity = 0.3;
    const ambientColor = 0xffffff;
    const directIntensity = 0.8 * Math.PI; // TODO(#116)
    const directColor = 0xffffff;

    /*
    const hemiLight = new THREE.HemisphereLight(0xff0000, 0x080820, 10);
    hemiLight.name = 'hemi_light';
    scene.add(hemiLight);
    */

    const light1 = new THREE.AmbientLight(ambientColor, ambientIntensity);
    light1.name = 'ambient_light';
    camera.add(light1);

    const light2 = new THREE.DirectionalLight(directColor, directIntensity);
    light2.position.set(0.5, 0, 0.866); // ~60º
    light2.name = 'main_light';
    camera.add(light2);

    content = object;
  };

  const traverseAlpha = (v) => {
    const encoding = THREE.sRGBEncoding;
    setLoadingText('Mapping textures');

    traverseMaterials(v, (material) => {
      if (material.map) material.map.encoding = encoding;
      if (material.emissiveMap) material.emissiveMap.encoding = encoding;
      if (material.lightMap) material.lightMap.encoding = encoding;
      if (material.metalnessMap) material.metalnessMap.encoding = encoding;
      if (material.normalMap) material.normalMap.encoding = encoding;
      if (material.roughnessMap) material.roughnessMap.encoding = encoding;
      if (material.alphaMap) material.alphaMap.encoding = encoding;

      if (
        material.map ||
        material.aoMap ||
        material.lightMap ||
        material.emissiveMap ||
        material.metalnessMap ||
        material.normalMap ||
        material.roughnessMap ||
        material.alphaMap
      ) {
        material.needsUpdate = true;
      }
    });
  };

  let mixer;
  const clock = new THREE.Clock();
  let mesh = null;

  // trigger to execute TLougLLMOhLD_fQQc26v0wuM3QP9C54MdO4vsl3x31g
  const startAnimationLoop = () => {
    if (scene) {
      const dt = clock.getDelta();
      if (mixer) mixer.update(dt);

      const time = - performance.now() / 11; // 20
      // grid.position.z = (time) % 100;

      mesh.position.z = (time) % 100;

      renderer.render(scene, camera);
      requestID = window.requestAnimationFrame(startAnimationLoop);
    }
  };

  // initialization of scene object; loading of DAE file using DAELoader
  const sceneSetup = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(initialBackground.SKYBLUE);

    camera = new THREE.PerspectiveCamera(
      45, // fov = field of view
      width / height, // aspect ratio
      0.01, // near plane
      1000, // far plane
    );

    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    if (!el || el === null) return;

    controls = new OrbitControls(camera, el);
    controls.autoRotate = false;
    controls.autoRotateSpeed = -10;
    controls.screenSpacePanning = true;
    controls.noPan = true;
    controls.update();

    el.appendChild(renderer.domElement);

    /*
		grid = new THREE.GridHelper( 1000, 10, 0x000000, 0x000000 );
		grid.material.opacity = 0.1;
		grid.material.depthWrite = false;
		grid.material.transparent = true;
		scene.add(grid);
    */

    // grass background
    const gloader = new THREE.TextureLoader();
  	const groundTexture = gloader.load(groundTextureFile);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(95, 95);
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;
    var groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );
    mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10000, 10000 ), groundMaterial );
    mesh.position.y = 0.0;
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // fbx loader
		const loader = new FBXLoader();
		loader.load(threeD.dae, obj => {
			mixer = new THREE.AnimationMixer(obj);
			const actions = {};
      const emotes = ['Gallop', 'Giddy Up', 'Jokey', 'Jump', 'Trot', 'Walk', 'iddle 01', 'iddle 02' ];

      obj.animations.map(anim => {
				const clip = anim;
				const action = mixer.clipAction(clip);
				actions[clip.name] = action;
        /*
        if ( emotes.indexOf( clip.name ) >= 0) {
    			action.clampWhenFinished = true;
    			action.loop = THREE.LoopRepeat;
				}
        */
        // action.play();
        return anim;
      });

      // set default animation here
      const activeAction = actions.Walk;
      activeAction.clampWhenFinished = true;
      activeAction.loop = THREE.LoopRepeat;
      activeAction
  			.reset()
  			.setEffectiveTimeScale(3)
  			.setEffectiveWeight(1)
  			.fadeIn(0.5)
  			.play();

      traverseAlpha(obj);
      setContent(obj);

      obj.position.set(2, 0, 0);
      camera.position.copy(product3D.cameraPosition);
			scene.add(obj);

      const box = new THREE.Box3().setFromObject(obj.parent);
      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());
      const modelWidth = getModelWidth(width, height);
      frameArea(modelWidth * 0.5, boxSize, boxCenter);

      controls.target.copy(boxCenter);
      controls.minDistance = 500;
      controls.maxDistance = Infinity;
      controls.update();
    },
    () => {}, (e) => onError(),
	);
};

  useEffect(() => {
    threeD = {};
    threeD.dae = fbxFile;
    threeD.textures = {};
    setHeight(containerHeight);
    setWidth(containerWidth);

    // timeoutId for debounce mechanism
    let timeoutId = null;

    const resizeListener = () => {
      // prevent execution of previous setTimeout
      clearTimeout(timeoutId);
      // change width from the state object after 150 milliseconds
      timeoutId = setTimeout(() => {
        if (renderer) renderer.setSize(containerWidth, containerHeight);
        if (camera) {
          camera.aspect = containerWidth / containerHeight;
          camera.updateProjectionMatrix();
        }
        setHeight(containerHeight);
        setWidth(containerWidth);
      }, 150);
    };

    window.addEventListener('resize', resizeListener);

    sceneSetup();
    startAnimationLoop();

    return () => {
      threeD = {};
      threeD.textures = {};
      window.removeEventListener('resize', resizeListener);
      window.cancelAnimationFrame(requestID);
      if (controls) controls.dispose();
      if (renderer) renderer.dispose();
      scene = null;
    };
  }, []);

  return (
    <>
      {!finishedLoading && (
        <div className="loading">
          <img src={LongLoad} className="longLoad" alt="" />
          <p>{loadingText}</p>
        </div>
      )}

      <div
        className="modelContainer"
        style={{ opacity: finishedLoading ? 1 : 0 }}
        ref={(ref) => { el = ref }}
      />
    </>

  );
};

export default ThreeComponent;
