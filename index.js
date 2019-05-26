import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer
} from 'three';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

class CustomShader extends HTMLElement {
  connectedCallback() {
    this._getVRDevice().then(device => {
      this._initialize(device);
    });
  }

  _initialize(device) {
    const hasDevice = device !== null;

    const shadow = this.attachShadow({mode: 'open'});

    const container = document.createElement('div');
    shadow.appendChild(container);

    const src = this.getAttribute('src') || '';
    const width = parseInt(this.getAttribute('width')) || 0;
    const height = parseInt(this.getAttribute('height')) || 0;

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, width / height, 0.01, 10000);
    camera.position.y = 150;

    scene.add(new AmbientLight(0xaaaaaa));

    const light = new DirectionalLight(0xffffff);
    light.position.set(100, 100, -100);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load(src, gltfScene => {
      scene.add(gltfScene.scene);
    });

    const renderer = new WebGLRenderer({
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setAnimationLoop(render);

    container.appendChild(renderer.domElement);

    function render() {
      updateCamera();
      renderer.render(scene, camera);
    }

    let movingForward = false;
    let rotatingLeft = false;
    let rotatingRight = false;

    function updateCamera() {
      if (movingForward) {
        const vector = camera.getWorldDirection(new Vector3());
        camera.position.add(vector.multiplyScalar(3));
      }
      if (rotatingLeft) {
        camera.rotation.y += 0.01;
      }
      if (rotatingRight) {
        camera.rotation.y -= 0.01;
      }
    }

    renderer.domElement.addEventListener('mousedown', event => {
      const clientX = event.clientX;
      if (clientX / width < 0.2) {
        rotatingLeft = true;
      } else if (clientX / width > 0.8) {
        rotatingRight = true;
      } else {
        movingForward = true;
      }
    }, false);

    renderer.domElement.addEventListener('mouseup', event => {
      rotatingLeft = false;
      rotatingRight = false;
      movingForward = false;
    }, false);

    const button = document.createElement('button');
    button.textContent = hasDevice ? 'ENTER VR' : 'FULLSCREEN';
    button.style.display = '';
    button.style.cursor = 'pointer';
    button.style.left = '30px';
    button.style.width = '150px';
    button.style.position = 'absolute';
    button.style.top = '30px';
    button.style.padding = '12px 6px';
    button.style.border = '1px solid #fff';
    button.style.borderRadius = '4px';
    button.style.background = 'rgba(0,0,0,0.1)';
    button.style.color = '#fff';
    button.style.font = 'normal 13px sans-serif';
    button.style.textAlign = 'center';
    button.style.opacity = '0.5';
    button.style.outline = 'none';
    button.style.zIndex = '999';
    container.appendChild(button);

    button.addEventListener('mouseenter', event => {
      button.style.opacity = '1.0';
    }, false);

    button.addEventListener('mouseleave', event => {
      button.style.opacity = '0.5';
    }, false);

    if (hasDevice) {
      button.addEventListener('click', event => {
        if (device.isPresenting) {
          device.exitPresent();
        } else {
          device.requestPresent([{source: renderer.domElement}]);
        };
      }, false);

      window.addEventListener('vrdisplaypresentchange', event => {
        if (device.isPresenting) {
          button.textContent = 'EXIT VR';
          renderer.vr.enabled = true;
        } else {
          button.textContent = 'ENTER VR';
          renderer.vr.enabled = false;
        }
      }, false);

      renderer.vr.setDevice(device);
    } else {
      let isFullscreen = false;
      button.addEventListener('click', event => {
        if (isFullscreen) {
          document.exitFullscreen()
        } else {
          renderer.domElement.requestFullscreen();
        }
      }, false);

      window.addEventListener('fullscreenchange', event => {
        if (document.fullscreenElement) {
          camera.aspect = screen.width / screen.height;
          camera.updateProjectionMatrix();
          renderer.setSize(screen.width, screen.height);
          render();
        } else {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          render();
        }
      }, false);
    }
  }

  _getVRDevice() {
    if (!('getVRDisplays' in navigator)) {
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      navigator.getVRDisplays().then(devices => {
        if (devices && devices.length > 0) {
          resolve(devices[0]);
        } else {
          resolve(null);
        }
      });
    });
  }
}

customElements.define('custom-shader', CustomShader);
