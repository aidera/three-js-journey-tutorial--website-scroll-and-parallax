import * as THREE from 'three';
import GUI from 'lil-gui';
import gsap from 'gsap';

/**
 * ------------
 * PRESETS
 * ------------ */
// Canvas
const canvas = document.getElementById('canvas');

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
let aspectRatio = sizes.width / sizes.height;

// Cursor
const cursor = {
  x: 0,
  y: 0,
};

// Scroll
let scrollY = window.scrollY;
let currentSection = 0;

// Animation
const clock = new THREE.Clock();
let previousTime = 0;

// Loaders
const textureLoader = new THREE.TextureLoader();

// GUI
const gui = new GUI();
let parameters = {
  materialColor: '#ffeded',
};

gui.addColor(parameters, 'materialColor').onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/**
 * ------------
 * SCENE
 * ------------ */
const scene = new THREE.Scene();

/**
 * ------------
 * OBJECTS
 * ------------ */
/** Textures */
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg');
gradientTexture.colorSpace = THREE.SRGBColorSpace;
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

/** Material */
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

/** Mesh */
const objectsDistance = 4;

const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const scrollableMeshes = [mesh1, mesh2, mesh3];

/**
 * ------------
 * PARTICLES
 * ------------ */
// Geometry
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
const sceneSize = objectsDistance * scrollableMeshes.length;

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * sceneSize;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

// Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * ------------
 * LIGHTS
 * ------------ */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * ------------
 * CAMERA
 * ------------ */
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.z = 3;
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
cameraGroup.add(camera);

/**
 * ------------
 * RENDER
 * ------------ */
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);

/**
 * ------------
 * UTILS
 * ------------ */
// Resize
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  aspectRatio = sizes.width / sizes.height;

  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Scroll
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / sizes.height);

  if (newSection != currentSection) {
    currentSection = newSection;
    console.log('section is changed');
    appearMesh();
  }
});

// Mouse
window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * ------------
 * ANIMATION
 * ------------ */
const rotateMeshes = (deltaTime) => {
  for (const mesh of scrollableMeshes) {
    mesh.rotation.x += deltaTime * 0.1
    mesh.rotation.y += deltaTime * 0.12
  }
};

const animateCamera = (deltaTime) => {
  cameraGroup.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxCoef = 0.2;
  const parallaxX = cursor.x * parallaxCoef;
  const parallaxY = -cursor.y * parallaxCoef;

  // Linear
  camera.position.x = parallaxX;
  camera.position.y = parallaxY;

  // Smooth
  const smoothCoef = 0.05;
  camera.position.x += (parallaxX - camera.position.x) * smoothCoef * deltaTime;
  camera.position.y += (parallaxY - camera.position.y) * smoothCoef * deltaTime;
};

function appearMesh() {
  gsap.to(
    scrollableMeshes[currentSection].rotation,
    {
        duration: 1.5,
        ease: 'power2.inOut',
        x: '+=6',
        y: '+=3',
        z: '+=1.5'
    }
)
}

/**
 * ------------
 * START
 * ------------ */

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  rotateMeshes(deltaTime);
  animateCamera(deltaTime);

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
