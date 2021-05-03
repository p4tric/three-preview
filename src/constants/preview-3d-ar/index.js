import * as THREE from 'three';


export const environment = {
  BASE_URL: `${document.location.protocol}//${window.location.host}`,
};

export const initialBackground = {
  BLACK: 0x000000,
  GREY: 0x909090,
  WHITE: 0xffffff,
};

export const MAP_NAMES = [
  'map',
  'aoMap',
  'lightMap',
  'emissiveMap',
  'glossinessMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'specularMap',
];

export const product3D = {
  gammaFactor: 2.2,
  d1: 0.11075539324003,
  d2a: 0.1005539324003,
  d2b: 0.0805539324003,
  d3: 0.0705539324003,
  d4: 0.0805539324003,
  d5: 0.0805539324003,
  // cameraPosition: new THREE.Vector3(10, 0, 10),
  cameraPosition: new THREE.Vector3(-360, 0, -420),

  // objectRotation: new THREE.Euler(0, 10.9, 0.0001),
  objectRotation: new THREE.Euler(0, 50.9, 0.0001),
};

export const getModelWidth = (width, height) => {
  let modelWidth = 0;
  if (width <= 599) {
    modelWidth = product3D.d1;
  }
  if (width <= 959 && width >= 600) {
    modelWidth = product3D.d2a;
    if (height < 568) {
      modelWidth = product3D.d2b;
    }
  }

  if (width <= 1279 && width >= 960) {
    modelWidth = product3D.d3;
  }

  if (width <= 1919 && width >= 1280) {
    modelWidth = product3D.d4;
  }

  if (width <= 5000 && width >= 1920) {
    modelWidth = product3D.d5;
  }

  return modelWidth;
};

export const getHeight = () =>
  window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

export const getWidth = () =>
  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

export const knownProps = [
  '_AO.jpg',
  '_AO.png',
  '_AO.tiff',
  '_AO.tga',
  '_AO.jpeg',
  '_emissive.jpg',
  '_emissive.png',
  '_emissive.tiff',
  '_emissive.tga',
  '_emissive.jpeg',
  '_albedo.jpg',
  '_albedo.png',
  '_albedo.tiff',
  '_albedo.tga',
  '_albedo.jpeg',
  '_metallic.jpg',
  '_metallic.png',
  '_metallic.tiff',
  '_metallic.tga',
  '_metallic.jpeg',
  '_normal.jpg',
  '_normal.png',
  '_normal.tiff',
  '_normal.tga',
  '_normal.jpeg',
  '_roughness.jpg',
  '_roughness.png',
  '_roughness.tiff',
  '_roughness.tga',
  '_roughness.jpeg',
  '_opacity.jpg',
  '_opacity.png',
  '_opacity.tiff',
  '_opacity.tga',
  '_opacity.jpeg',
];
