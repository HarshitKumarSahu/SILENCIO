import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { mod } from 'three/tsl';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";


gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis()

lenis.on("scroll", ScrollTrigger.update)

gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    // canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enable = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.querySelector(".model").appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(5, 10, 7.5);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 3);
fillLight.position.set(-5, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
hemiLight.position.set(0, 25, 0);
scene.add(hemiLight);

function basicAnimate() {
    renderer.render(scene, camera);
    requestAnimationFrame(basicAnimate);
}
basicAnimate()


let model;

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/"); // Use Google's Draco decoder CDN
loader.setDRACOLoader(dracoLoader);
loader.load("/canalpha.glb", function (gltf) {
    model = gltf.scene;  // Fixed: it should be gltf.scene, not glft.screen

    model.traverse((node) => {
        if (node.isMesh) {
            if (node.material) {
                // node.material.metalness = 0.3;
                // node.material.roughness = 0.4;
                node.material.envMapIntensity = 0.3;
            }
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);  // Center the model

    scene.add(model);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 1.5;

    // Initial scale (hidden) before animation starts
    model.scale.set(0, 0, 0);

    // Start initial animation (make sure this function exists in your code)
    playInitialAnimation();

    // Cancel any old animation frame (optional, depends on your logic)
    cancelAnimationFrame(basicAnimate);

    // Start main animation loop (make sure 'animate' exists)
    animate();
},
(xhr) => {
  console.log(`Model ${((xhr.loaded / xhr.total) * 100).toFixed(2)}% loaded`);
},
(error) => {
  console.error("Error loading model:", error);
});

const floatAmplitude = 0.2;
const floatSpeed = 1.5;
const rotationSpeed = 0.3;
let isFloating = true;
let currentScroll = 0;

const stickyHeight = window.innerHeight;
const scannerSection = document.querySelector(".scanner");
const scannerPosition = scannerSection.offsetTop;
const scanContainer = document.querySelector(".scan-container");
const scanSound = new Audio("beep.mp3");

gsap.set(scanContainer, { scale: 0 });

function playInitialAnimation() {
    if(model) {
        gsap.to(model.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: "power2.out"
        });
    }
    gsap.to(scanContainer, {
        scale : 1,
        duration: 1,
        ease: "power2.out"
    });
}
ScrollTrigger.create({
    trigger : "body",
    start : "top top",
    end : "top -10%",
    onEnterBack : () => {
        if(model) {
            gsap.to(model.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 1,
                ease: "power2.out"
            });
            isFloating = true;
        }
        gsap.to(scanContainer, {
            scale : 1,
            duration: 1,
            ease: "power2.out"
        });
    }

})

ScrollTrigger.create({
    trigger : ".scanner",
    start : "top top",
    end : `${stickyHeight}px`,
    pin : true,
    onEnter : () => {
        if(model) {
            isFloating = true;
            model.position.y = 0

            setTimeout(() => {
                scanSound.currentTime = 0;
                scanSound.play();
            }, 500);

            gsap.to(model.rotation, {
                y : model.rotation.y + Math.PI * 2,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    gsap.to(model.scale, {
                        x: 0,
                        y: 0,
                        z: 0,
                        duration: 0.7,
                        ease: "power2.in",
                        onComplete: () => {
                            gsap.to(scanContainer, {
                                scale : 0,
                                duration: 0.7,
                                ease: "power2.in"
                            });
                        }
                    });
                }
            });
        }
    },
    onLeaveBack: () => {
        gsap.set(scanContainer, { scale: 0 });
    
        gsap.to(scanContainer, {
            scale: 1,
            duration: 1,
            ease: "power2.out",
        });
    }    
})

lenis.on("scroll", (e)=> {
    currentScroll = e.scroll
})

function animate() {
    if(model) {
        if(isFloating) {
            const floatOffset = Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
            model.position.y = floatOffset;
        }
        const scrollProgress = Math.min(currentScroll / scannerPosition, 1);
        
        if(scrollProgress < 1) {
            model.rotation.x = scrollProgress * Math.PI * 2;
        }

        if(scrollProgress < 1) {
            model.rotation.y += 0.001 * rotationSpeed;
        }
    }

    // renderer.render(camera , scene);
    // requestAnimationFrame(animate);
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


document.body.addEventListener('click', () => {
    audioElement.play().catch(e => console.warn("Audio play failed:", e));
});
