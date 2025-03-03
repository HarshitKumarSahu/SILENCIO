import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, model;

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const canvas = document.querySelector('.canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
}

function centerAndScaleModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    object.position.sub(center);  // Shift to origin

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1 / maxDim;
    object.scale.setScalar(scale);  // Fit within unit box

    camera.position.set(0, 0, 1);  // Place camera to fit the model
    camera.lookAt(0, 0, 0);  // Look at the centered model
}

function loadModel() {
    const loader = new GLTFLoader();
    // loader.load('/models/cat.gltf', (gltf) => {
    loader.load('/josta.glb', (gltf) => {
        model = gltf.scene;

        const textureLoader = new THREE.TextureLoader();

        // Apply PBR textures to all meshes
        // model.traverse((child) => {
        //     if (child.isMesh) {
        //         // child.material = new THREE.MeshStandardMaterial({
        //         //     map: textureLoader.load("/models/textures/Material_0002_baseColor.png"),
        //         //     roughnessMap: textureLoader.load("/models/textures/Material_0002_metallicRoughness.png"),
        //         //     normalMap: textureLoader.load("/models/textures/Material_0002_normal.png")
        //         // });
        //         child.castShadow = true;
        //         child.receiveShadow = true;
        //     }
        // });

        centerAndScaleModel(model);  // Center after materials applied
        scene.add(model);

        animate();
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (model) {
        // model.rotation.y += 0.01;  // Rotate around Y-axis
        // model.rotation.x += 0.005; // Slight X rotation for depth feel
    }

    renderer.render(scene, camera);
}

window.addEventListener('scroll', () => {
    if (model) {
        const scrollFactor = window.scrollY / document.body.scrollHeight;
        model.rotation.x = scrollFactor * Math.PI /15;  // Scroll-based rotation
        
        model.rotation.y = scrollFactor * Math.PI * 2;  // Scroll-based rotation
        
        model.rotation.z = scrollFactor * Math.PI /15;  // Scroll-based rotation

        // model.position.x = scrollFactor * Math.PI / 15;  // Scroll-based rotation
        // model.position.y = scrollFactor * Math.PI / 5;  // Scroll-based rotation
       
        model.position.z = scrollFactor * Math.PI / 20;  // Scroll-based rotation

    }

});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

initScene();
loadModel();
