import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Smooth scroll
// Make it global so inline onclick works
window.scrollToSection = function(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// Newsletter subscription
const form = document.getElementById('newsletterForm');
const formMessage = document.getElementById('formMessage');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;

    if (validateEmail(email)) {
      formMessage.style.color = '#00ff99';
      formMessage.textContent = '✅ Subscribed successfully!';
      form.reset();
    } else {
      formMessage.style.color = '#ff0077';
      formMessage.textContent = '❌ Invalid email address.';
    }
  });
}

function validateEmail(email) {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Reveal animations on scroll
const features = document.querySelectorAll('.feature');

window.addEventListener('scroll', () => {
  const triggerBottom = window.innerHeight * 0.8;

  features.forEach(feature => {
    const boxTop = feature.getBoundingClientRect().top;

    if (boxTop < triggerBottom) {
      feature.classList.add('show');
    }
  });
});


















 
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 1000); 

camera.position.set(0, 0.7, 1.7);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('picoCanvas'),
  antialias: true
});
renderer.setSize(400, 300);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// aim closer to the middle of the device
controls.target.set(0, 0.2, 0);
camera.position.set(0, 0.6, 1.5);  // slightly lower too


// Loader
const loader = new GLTFLoader();
let mixer, model, baseY, baseRotationY = 0;
const clock = new THREE.Clock();

loader.load('./pico.glb', (gltf) => {
  model = gltf.scene;
  model.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  baseRotationY = Math.PI / 2;
  model.rotation.y = baseRotationY;
  baseY = model.position.y;
  scene.add(model);
  document.getElementById('info').innerText = '';
  if (gltf.animations && gltf.animations.length) {
    mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();
  }
}, undefined, (err) => {
  console.error('Error loading pico.glb', err);
  document.getElementById('info').innerText = 'Error loading model!';
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (model) {
    model.rotation.y = baseRotationY + Date.now() * 0.0004;
    model.position.y = baseY + Math.sin(Date.now() * 0.001) * 0.05;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();















// script.js
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".navbar");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = Array.from(document.querySelectorAll("section[id]"));

  // Update CSS variable for navbar height so CSS offsets use correct value
  function updateNavHeight() {
    const navHeight = nav ? nav.offsetHeight : 0;
    document.documentElement.style.setProperty("--nav-height", `${navHeight}px`);
    return navHeight;
  }

  let navHeight = updateNavHeight();

  // Recreate observer when nav size changes (on resize)
  let observer = null;
  function createObserver() {
    if (observer) observer.disconnect();

    // rootMargin ensures intersection accounts for the fixed navbar height.
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => {
            a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
          });
        }
      });
    }, {
      root: null,
      rootMargin: `-${navHeight}px 0px -40% 0px`, // top offset to account for nav & mid-screen trigger
      threshold: 0.18
    });

    sections.forEach(s => observer.observe(s));
  }

  createObserver();

  // Smooth scroll with navbar offset when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return; // ignore external
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // immediate visual feedback
      navLinks.forEach(a => a.classList.remove("active"));
      link.classList.add("active");

      // compute target Y with offset
      const targetY = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth"
      });
    });
  });

  // Update navHeight & observer on resize (navbar size may change)
  window.addEventListener("resize", () => {
    navHeight = updateNavHeight();
    // re-create observer to use updated navHeight in rootMargin
    createObserver();
  });

  // On load: set correct active link depending on current scroll position
  setTimeout(() => {
    // find first section that's visible
    const inView = sections.find(s => {
      const rect = s.getBoundingClientRect();
      return rect.top <= navHeight + 2 && rect.bottom > navHeight + 2;
    });
    const defaultId = inView ? inView.id : (sections[0] && sections[0].id);
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${defaultId}`));
  }, 120);

});
