/* World3D.js - Three.js WebGL Scene Architecture & Hogwarts Castle Environment */
import * as THREE from 'three';

export class World3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.laneWidth = 2.5;
    this.laneX = [-this.laneWidth, 0, this.laneWidth];

    this.segmentLength = 30;
    this.visibleSegments = 6;
    this.trackSegments = [];
    this.furthestZ = 0;

    this.initScene();
    this.initLighting();
    this.initInitialTrack();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0916); // Gothic Night Atmosphere
    this.scene.fog = new THREE.FogExp2(0x0c0916, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      180
    );
    this.camera.position.set(0, 3.8, -6.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Ultra-fast lag-free shadows

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLighting() {
    // Ambient Torch Glow
    const ambientLight = new THREE.AmbientLight(0xffd89b, 1.2);
    this.scene.add(ambientLight);

    // Directional Hogwarts Sunlight / Moonlight
    const dirLight = new THREE.DirectionalLight(0xffeaad, 1.5);
    dirLight.position.set(15, 30, -10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -12;
    dirLight.shadow.camera.right = 12;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -10;
    this.scene.add(dirLight);
  }

  initInitialTrack() {
    for (let i = 0; i < this.visibleSegments; i++) {
      this.spawnTrackSegment(i * this.segmentLength);
    }
  }

  resetTrack() {
    // Clear all past track segments from scene & GPU memory
    this.trackSegments.forEach(segment => {
      this.scene.remove(segment);
      segment.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.trackSegments = [];
    this.furthestZ = 0;

    // Re-generate track starting cleanly from z = 0!
    this.initInitialTrack();
  }

  spawnTrackSegment(zPos) {
    const segment = new THREE.Group();
    segment.position.z = zPos;

    // Cobblestone Track Floor
    const floorGeo = new THREE.PlaneGeometry(12, this.segmentLength);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x221d2b,
      roughness: 0.85,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.position.z = this.segmentLength / 2;
    floor.receiveShadow = true;
    segment.add(floor);

    // 3 Train Track Rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x5a5068, metalness: 0.8, roughness: 0.3 });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });

    this.laneX.forEach((x) => {
      // Wooden Sleepers
      for (let s = 1; s < this.segmentLength; s += 2.5) {
        const sleeperGeo = new THREE.BoxGeometry(1.6, 0.08, 0.4);
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.set(x, 0.04, s);
        segment.add(sleeper);
      }

      // Iron Rails
      [-0.55, 0.55].forEach((offset) => {
        const railGeo = new THREE.BoxGeometry(0.08, 0.12, this.segmentLength);
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(x + offset, 0.12, this.segmentLength / 2);
        segment.add(rail);
      });
    });

    // Hogwarts Castle Walls with Vaulted Arches & Stained Glass Windows
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x181324, roughness: 0.9 });
    const archMat = new THREE.MeshStandardMaterial({ color: 0x2d243a, roughness: 0.8 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x3498db, transparent: true, opacity: 0.65 });

    [-6.2, 6.2].forEach((wallX) => {
      const wallGeo = new THREE.BoxGeometry(0.5, 12, this.segmentLength);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(wallX, 6, this.segmentLength / 2);
      segment.add(wall);

      // Windows & Torches along segments
      for (let w = 5; w < this.segmentLength; w += 10) {
        const glassGeo = new THREE.PlaneGeometry(1.2, 2.5);
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(wallX > 0 ? wallX - 0.26 : wallX + 0.26, 6.5, w);
        glass.rotation.y = wallX > 0 ? -Math.PI / 2 : Math.PI / 2;
        segment.add(glass);

        // Torch Sconce
        const sconceGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const sconce = new THREE.Mesh(sconceGeo, new THREE.MeshBasicMaterial({ color: 0xe67e22 }));
        sconce.position.set(wallX > 0 ? wallX - 0.35 : wallX + 0.35, 4.2, w);
        segment.add(sconce);
      }
    });

    // Gothic Vaulted Overhead Arch
    const archGeo = new THREE.BoxGeometry(13, 0.8, 0.8);
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 10, this.segmentLength / 2);
    segment.add(arch);

    this.scene.add(segment);
    this.trackSegments.push(segment);
    this.furthestZ = zPos + this.segmentLength;
  }

  updateTrack(playerZ) {
    if (this.trackSegments.length > 0) {
      const firstSegment = this.trackSegments[0];
      if (playerZ - firstSegment.position.z > this.segmentLength + 15) {
        this.scene.remove(firstSegment);
        
        // 100% WebGL Memory Disposal to prevent memory leaks and lockups
        firstSegment.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });

        this.trackSegments.shift();
        this.spawnTrackSegment(this.furthestZ);
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
