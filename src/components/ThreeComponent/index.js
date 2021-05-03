import React, { useEffect, useState } from 'react';

// Three js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// 3D Environment
import px from '../../assets/images/environment/industrialroom/px.png';
import nx from '../../assets/images/environment/industrialroom/nx.png';
import py from '../../assets/images/environment/industrialroom/py.png';
import ny from '../../assets/images/environment/industrialroom/ny.png';
import pz from '../../assets/images/environment/industrialroom/pz.png';
import nz from '../../assets/images/environment/industrialroom/nz.png';

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
  knownProps,
  product3D,
} from '../../constants/preview-3d-ar';

// styling
import './index.css';

let camera;
let content;
let controls;
let el;
let envMap;
let threeD;
let renderer;
let requestID;
let scene;

const ThreeComponent = ({
  assetId,
  backgroundColor = 0xffffff,
  onError,
}) => {

  const [finishedLoading, setFinishedLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Preparing model..');
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [zipFile, setZipfile] = useState(null);

  // function that sets 3d model in position
  const frameArea = (sizeToFitOnScreen, boxSize, boxCenter) => {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.Math.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
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
      envMap,
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



      /*
      polygonOffset: false,
      polygonOffsetFactor: 0,
      polygonOffsetUnits: 0,
      precision: null,
      premultipliedAlpha: false,
      reflectivity: 0.5,
      refractionRatio: 0.98,

      shininess: 6.311790938168236,
      */

      side: material.side,
      skinning: material.skinning,

      /*
      specular: Color {r: 0, g: 0, b: 0},
      specularMap: null,
      */
      toneMapped: material.toneMapped,
      transparent: material.transparent,


      stencilMask: material.stencilMask,
      wrapAround: material.wrapAround,
      wrapRGB: material.wrapRGB,
    });



// STANDARD MATERIAL
/*
alphaMap: null
alphaTest: 0
alphaToCoverage: false
aoMap: null
aoMapIntensity: 1
blendDst: 205
blendDstAlpha: null
blendEquation: 100
blendEquationAlpha: null
blendSrc: 204
blendSrcAlpha: null
blending: 1
bumpMap: null
bumpScale: 1
clipIntersection: false
clipShadows: false
clippingPlanes: null
color: Color {r: 1, g: 1, b: 1}
colorWrite: true
defines: {STANDARD: ""}
depthFunc: 3
depthTest: true
depthWrite: true
displacementBias: 0
displacementMap: null
displacementScale: 1
dithering: false
emissive: Color {r: 0, g: 0, b: 0}
emissiveIntensity: 1
emissiveMap: null
envMap: null
envMapIntensity: 1
flatShading: false
fog: true
lightMap: null
lightMapIntensity: 1

map: null
metalness: 0
metalnessMap: null
morphNormals: false
morphTargets: false
name: "Mane"
normalMap: null
normalMapType: 0
normalScale: Vector2 {x: 1, y: 1}
opacity: 1
polygonOffset: false
polygonOffsetFactor: 0
polygonOffsetUnits: 0
precision: null
premultipliedAlpha: false
refractionRatio: 0.98
roughness: 1
roughnessMap: null
shadowSide: null

side: 0
skinning: false
stencilFail: 7680
stencilFunc: 519
stencilFuncMask: 255
stencilRef: 0
stencilWrite: false
stencilWriteMask: 255
stencilZFail: 7680
stencilZPass: 7680
toneMapped: true
transparent: false
type: "MeshStandardMaterial"
userData: {}
uuid: "3834E4C8-3081-4E10-8B29-045E2B14385B"
version: 0
vertexColors: false
vertexTangents: false
visible: true
wireframe: false
wireframeLinecap: "round"
wireframeLinejoin: "round"
wireframeLinewidth: 1
id: 9
overdraw: (...)
shading: (...)
stencilMask: (...)
wrapAround: (...)
wrapRGB: (...)
*/
// END STANDARD SHT


  };

  // main traverse loop for texture encoding extracted from zip file
  const traverseMaterials = (object, callback) => {
    object.traverse((node) => {
      let mutatedMaterials;
      let mutatedMaterial;

      // console.log('[TRARA] ', node);
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
      if (!node.isMesh) {
        return;
      }
      if (Array.isArray(node.material)) {
        mutatedMaterials = node.material.map(mat => mutateNodeMaterial(mat));
        console.log('[TRAVERTMAT 1] ', node.material);
      } else {
        mutatedMaterial = mutateNodeMaterial(node.material);
        console.log('[TRAVERTMAT 2] ', node.material);
      }

      const materials = Array.isArray(node.material) ? mutatedMaterials : [mutatedMaterial];
      materials.forEach(callback);

      setTimeout(() => {
        setFinishedLoading(true);
        window.dispatchEvent(new Event('resize'));
      }, 5000);
    });
  };

  // initialize environment map that will be used by the 3d model
  const loadBackground = (bg) => {
    const urls = bg.list;
    const loader = new THREE.CubeTextureLoader();
    loader.load(urls, (texture) => {
      envMap = texture;
      envMap.format = THREE.RGBFormat;
    });
  };

  // using industrial room set as background
  const updateEnvironmentx = () => {
    const background = {
      path: '/static/media/',
      list: [px, nx, py, ny, pz, nz],
    };
    loadBackground(background);
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

    const hemiLight = new THREE.HemisphereLight();
    hemiLight.name = 'hemi_light';
    scene.add(hemiLight);

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

    traverseMaterials(v, (material) => {
      if (material.map) {
        material.map.encoding = encoding;
      }
      if (material.emissiveMap) {
        material.emissiveMap.encoding = encoding;
      }
      if (material.lightMap) {
        material.lightMap.encoding = encoding;
      }
      if (material.metalnessMap) {
        material.metalnessMap.encoding = encoding;
      }
      if (material.normalMap) {
        material.normalMap.encoding = encoding;
      }
      if (material.roughnessMap) {
        material.roughnessMap.encoding = encoding;
      }
      if (material.alphaMap) {
        material.alphaMap.encoding = encoding;
      }

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
  let grid;
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
    scene.background = new THREE.Color(initialBackground.WHITE);

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
		// ground
    const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
		mesh.rotation.x = - Math.PI / 2;
		mesh.receiveShadow = true;
		scene.add( mesh );
    */

/*
    const gloader = new THREE.TextureLoader();
		const groundTexture = gloader.load(grass1);
		groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		groundTexture.repeat.set( 25, 25 );
		groundTexture.anisotropy = 16;
		groundTexture.encoding = THREE.sRGBEncoding;

		const groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

		mesh = new THREE.Mesh( new THREE.PlaneGeometry( 20000, 20000 ), groundMaterial );
		mesh.position.y = 0;
		mesh.rotation.x = - Math.PI / 2;
		mesh.receiveShadow = true;
		scene.add(mesh);
    */

    /*
		grid = new THREE.GridHelper( 1000, 10, 0x000000, 0x000000 );
		grid.material.opacity = 0.1;
		grid.material.depthWrite = false;
		grid.material.transparent = true;
		scene.add(grid);
    */


  const gloader = new THREE.TextureLoader();
	const groundTexture = gloader.load(grass1);
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

    // FBX
		const loader = new FBXLoader();
		loader.load(threeD.dae, obj => {
      console.log('[FBX] ', obj);
      updateEnvironmentx();

			mixer = new THREE.AnimationMixer(obj);
			const actions = {};
      const emotes = ['Gallop', 'Giddy Up', 'Jokey', 'Jump', 'Trot', 'Walk', 'iddle 01', 'iddle 02' ];

      obj.animations.map(anim => {
				const clip = anim;
				const action = mixer.clipAction(clip);
				actions[clip.name] = action;

        console.log('[ACTIONNNN action, emotes, clip, clip.name] ', action, emotes, clip, clip.name);
        /*
        if ( emotes.indexOf( clip.name ) >= 0) {
    			action.clampWhenFinished = true;
    			action.loop = THREE.LoopRepeat;
				}
        */
        // action.play();
        return anim;
      });


      console.log('[ACTIONS] ', actions);

      const activeAction = actions.Walk;
      activeAction.clampWhenFinished = true;
      activeAction.loop = THREE.LoopRepeat;
      // activeAction.play();
      activeAction
  			.reset()
  			.setEffectiveTimeScale(3)
  			.setEffectiveWeight(1)
  			.fadeIn(0.5)
  			.play();


      // const action = mixer.clipAction(obj.animations[0]);
			// action.play();

      traverseAlpha(obj);
      setContent(obj);

      obj.position.set(2, 0, 0);
      camera.position.copy(product3D.cameraPosition);
			scene.add(obj);

      /*


      */
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
      () => {}, (e) => {
        console.log('[ERR] ', e);
        onError();
      },
		);
  };

  // setting existing materials into main texture object
  const getMaterials = (fname, mat) => {
    let materialName;
    knownProps
    .filter(kprops => fname.indexOf(kprops) > -1)
    .map(kprops => {
      const length = fname.indexOf(kprops);
      materialName = fname.substr(0, length);
      if (!mat.includes(materialName)) {
        threeD.textures[materialName] = [];
        mat.push(materialName);
      }
      return kprops;
    });
    return { materialName };
  };

  // checking if zip file content is a directory or file
  const isValidFile = ({ newZip, file }) => {
    return (!newZip.file(file).dir &&
    newZip.file(file).name.indexOf('__MACOSX') === -1 &&
    newZip.file(file).name.indexOf('DS_Store') === -1)
  };

  // checking if zip file content is a dae file
  const isValidDaeFile = ({ newZip, file }) => {
    return (newZip.file(file).name.toLowerCase().indexOf('.dae') > -1 &&
    newZip.file(file).name.indexOf('model/textures/') === -1);
  };

  // checking if zip file content is a valid texture file
  const isValidTextureFile = ({ newZip, file }) => {
    return !newZip.file(file).dir && newZip.file(file).name.indexOf('model/textures/') > -1
  };

  // function that loops into the textures and set it on main texture/dae object
  const processTextureFiles = async ({ newZip, file }, materials) => {
    const fileName = newZip.file(file).name.substr('model/textures/'.length);
    const { materialName } = getMaterials(fileName, materials);
    const textureFile = await newZip.file(file).async('blob');
    if (threeD.textures[materialName]) {
      threeD.textures[materialName].push({
        name: fileName,
        url: window.URL.createObjectURL(textureFile),
      });
    }
  };

  // function that counts number of textures included in the zip file
  const getTextureCount = (newZip, zip) => {
    let count = 0;
    Object.keys(zip.files)
    .filter(file => newZip.file(file) !== null)
    .map(file => {
      if (isValidFile({ newZip, file })) {
        count += 1;
      }
      return file;
    });
    return count;
  };

  useEffect(() => {
    threeD = {};
    threeD.dae = fbx1;
    threeD.textures = {};
    setHeight(getHeight());
    setWidth(getWidth());

    // timeoutId for debounce mechanism
    let timeoutId = null;

    const resizeListener = () => {
      // prevent execution of previous setTimeout
      clearTimeout(timeoutId);
      // change width from the state object after 150 milliseconds
      timeoutId = setTimeout(() => {
        if (renderer) renderer.setSize(getWidth(), getHeight());
        if (camera) {
          camera.aspect = getWidth() / getHeight();
          camera.updateProjectionMatrix();
        }
        setHeight(getHeight());
        setWidth(getWidth());
      }, 150);
    };

    window.addEventListener('resize', resizeListener);
    // fetchFromServer();

    sceneSetup();
    startAnimationLoop();


    return () => {
      threeD = {};
      threeD.textures = {};
      // setVariantId('');
      setZipfile(null);
      window.removeEventListener('resize', resizeListener);
      window.cancelAnimationFrame(requestID);
      if (controls) controls.dispose();
      if (renderer) renderer.dispose();
      scene = null;
    };
  }, []);

  /*
  useEffect(() => {
    if (assetId !== '')
      fetchZipfile(assetId);
    return () => {};
  }, [assetId]);

  // effect to update background color
  useEffect(() => {
    if (scene) {
      scene.background = new THREE.Color(backgroundColor);
    }
  }, [backgroundColor]);

  // effect to trigger extraction of zipfile after being successfully fetched from API
  useEffect(() => {
    if (zipFile !== null) {
      extractZipFile(zipFile);
    }
  }, [zipFile]);
  */


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
