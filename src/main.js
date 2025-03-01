import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { texture } from 'three/tsl';

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

    object.position.sub(center);  // Move to origin

    const maxDim = Math.max(size.x, size.y, size.z);
    object.scale.setScalar(1 / maxDim);  // Normalize to fit in unit box

    camera.position.set(0, 0, 2);  // Place camera in front
}

function loadModel() {
    const loader = new GLTFLoader();
    loader.load('/models/cat.gltf', (gltf) => {
        model = gltf.scene;
        // const texture = new THREE.TextureLoader()

        // model.traverse((child) => {
        //     if (child.isMesh) {
        //         child.material = new THREE.MeshMatcapMaterial({ 
        //             matcap : texture.load("/models/textures/Material_0002_baseColor.png"),
        //             roughness: texture.load("/models/textures/Material_0002_metallicRoughness.png"),
        //             normalMap: texture.load("/models/textures/Material_0002_normal.png"),
        //         });
        //     }
        // });

        const textureLoader = new THREE.TextureLoader();

        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    map: textureLoader.load("/models/textures/Material_0002_baseColor.png"),
                    roughnessMap: textureLoader.load("/models/textures/Material_0002_metallicRoughness.png"),
                    normalMap: textureLoader.load("/models/textures/Material_0002_normal.png")
                });
            }
        });


        centerAndScaleModel(model);
        scene.add(model);
        animate();
    });
}

function animate() {
    requestAnimationFrame(animate);
    model.rotation.xyz += 0.01;  // Spins around Y-axis correctly now
    renderer.render(scene, camera);
}

window.addEventListener('scroll', () => {
    if (model) {
        const scrollFactor = window.scrollY / document.body.scrollHeight;
        model.rotation.y = scrollFactor * Math.PI * 2;
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

initScene();
loadModel();
