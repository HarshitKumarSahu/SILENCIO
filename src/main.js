import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    15, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    100
);
camera.position.z = 5;

const canvas = document.querySelector('.canvas')
const renderer = new THREE.WebGLRenderer({
    canvas : canvas,
    antialias: true 
});


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const loader = new GLTFLoader();
let catModel;

loader.load('/models/cat.gltf', (gltf) => {
    catModel = gltf.scene;
    scene.add(catModel);
    catModel.rotation.set(0, Math.PI/4, 0);
    catModel.position.set(0, 0, 0);
}, undefined, (error) => {
    console.error('Error loading model:', error);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    controls.update(delta);
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.updateProjectionMatrix();
});
