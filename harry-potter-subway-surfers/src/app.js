/* app.js - Standalone Unified Bundle for Hogwarts Dash (Works both on Local Server & Direct File Opening!) */
import * as THREE from 'three';

/* ==========================================================================
   1. Shop Class (LocalStorage Manager)
   ========================================================================== */
export class Shop {
  constructor() {
    this.storageKey = 'hogwarts_dash_save_data';
    this.data = this.loadData();
  }

  loadData() {
    const defaultData = {
      galleons: 0,
      highScore: 0,
      equippedChar: 'harry',
      unlockedChars: ['harry'],
      upgrades: {
        broom: 1,
        patronus: 1,
        lumos: 1
      }
    };

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return { ...defaultData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using defaults');
    }

    return defaultData;
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save failed');
    }
  }

  addGalleons(count) {
    this.data.galleons += count;
    this.saveData();
  }

  updateHighScore(score) {
    if (score > this.data.highScore) {
      this.data.highScore = score;
      this.saveData();
      return true;
    }
    return false;
  }

  unlockCharacter(charId, cost) {
    if (this.data.galleons >= cost && !this.data.unlockedChars.includes(charId)) {
      this.data.galleons -= cost;
      this.data.unlockedChars.push(charId);
      this.data.equippedChar = charId;
      this.saveData();
      return true;
    }
    return false;
  }

  equipCharacter(charId) {
    if (this.data.unlockedChars.includes(charId)) {
      this.data.equippedChar = charId;
      this.saveData();
      return true;
    }
    return false;
  }

  upgradeItem(type, cost) {
    if (this.data.galleons >= cost) {
      this.data.galleons -= cost;
      this.data.upgrades[type] = (this.data.upgrades[type] || 1) + 1;
      this.saveData();
      return true;
    }
    return false;
  }
}

/* ==========================================================================
   2. SoundManager Class (Web Audio Synthesizer)
   ========================================================================== */
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.musicTimeout = null;
    this.isPlayingMusic = false;
    this.currentNoteIndex = 0;

    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  playCoinSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.50, now);
    osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playJumpSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.16);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playSlideSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playSpellSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.04);
      
      gain.gain.setValueAtTime(0.3, now + index * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.04 + 0.14);
      
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      
      osc.start(now + index * 0.04);
      osc.stop(now + index * 0.04 + 0.14);
    });
  }

  playSnitchSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const notes = [659.25, 783.99, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.35, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.2);
    });
  }

  playCrashSound() {
    if (this.isMuted) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    
    osc.start(now);
    osc.stop(now + 0.35);
  }

  startMusic() {
    if (this.isMuted) return;
    this.init();
    
    if (this.isPlayingMusic) {
      this.stopMusic();
    }
    this.isPlayingMusic = true;
    this.currentNoteIndex = 0;

    const hedwigMelody = [
      { note: 493.88, bass: 164.81, duration: 0.45, pause: 0.10 },
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 783.99, bass: 196.00, duration: 0.32, pause: 0.05 },
      { note: 739.99, bass: 185.00, duration: 0.35, pause: 0.05 },
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 987.77, bass: 246.94, duration: 0.85, pause: 0.10 },
      { note: 880.00, bass: 220.00, duration: 0.85, pause: 0.12 },
      { note: 739.99, bass: 185.00, duration: 0.85, pause: 0.15 },
      
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 783.99, bass: 196.00, duration: 0.32, pause: 0.05 },
      { note: 739.99, bass: 185.00, duration: 0.35, pause: 0.05 },
      { note: 587.33, bass: 146.83, duration: 0.65, pause: 0.08 },
      { note: 698.46, bass: 174.61, duration: 0.65, pause: 0.08 },
      { note: 493.88, bass: 123.47, duration: 0.95, pause: 0.25 },

      { note: 493.88, bass: 164.81, duration: 0.45, pause: 0.10 },
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 783.99, bass: 196.00, duration: 0.32, pause: 0.05 },
      { note: 739.99, bass: 185.00, duration: 0.35, pause: 0.05 },
      { note: 659.25, bass: 164.81, duration: 0.65, pause: 0.08 },
      { note: 987.77, bass: 246.94, duration: 0.85, pause: 0.10 },
      { note: 1174.66, bass: 293.66, duration: 0.85, pause: 0.10 },
      { note: 1108.73, bass: 277.18, duration: 0.85, pause: 0.10 },
      
      { note: 1046.50, bass: 261.63, duration: 0.70, pause: 0.08 },
      { note: 830.61, bass: 207.65, duration: 0.65, pause: 0.08 },
      { note: 1046.50, bass: 261.63, duration: 0.65, pause: 0.08 },
      { note: 987.77, bass: 246.94, duration: 0.35, pause: 0.05 },
      { note: 932.33, bass: 233.08, duration: 0.35, pause: 0.05 },
      { note: 739.99, bass: 185.00, duration: 0.65, pause: 0.08 },
      { note: 783.99, bass: 196.00, duration: 0.65, pause: 0.08 },
      { note: 659.25, bass: 164.81, duration: 1.10, pause: 0.30 },
    ];

    const playStep = () => {
      if (!this.isPlayingMusic || this.isMuted || !this.ctx) return;

      const item = hedwigMelody[this.currentNoteIndex];
      const now = this.ctx.currentTime;

      const celestaOsc = this.ctx.createOscillator();
      const celestaGain = this.ctx.createGain();
      celestaOsc.type = 'sine';
      celestaOsc.frequency.setValueAtTime(item.note, now);
      celestaGain.gain.setValueAtTime(0.28, now);
      celestaGain.gain.exponentialRampToValueAtTime(0.001, now + item.duration);
      celestaOsc.connect(celestaGain);
      celestaGain.connect(this.masterGain);

      celestaOsc.onended = () => {
        celestaOsc.disconnect();
        celestaGain.disconnect();
      };

      celestaOsc.start(now);
      celestaOsc.stop(now + item.duration);

      if (item.bass) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(item.bass, now);
        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + item.duration + 0.05);
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);

        bassOsc.onended = () => {
          bassOsc.disconnect();
          bassGain.disconnect();
        };

        bassOsc.start(now);
        bassOsc.stop(now + item.duration + 0.05);
      }

      this.currentNoteIndex = (this.currentNoteIndex + 1) % hedwigMelody.length;
      const totalTimeMs = (item.duration + item.pause) * 1000;
      this.musicTimeout = setTimeout(playStep, totalTimeMs);
    };

    playStep();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }
}

/* ==========================================================================
   3. ParticleSystem Class
   ========================================================================== */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  createGoldenSparkle(position) {
    const geo = new THREE.SphereGeometry(0.08, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.copy(position);
    mesh.position.x += (Math.random() - 0.5) * 0.6;
    mesh.position.y += (Math.random() - 0.5) * 0.6;

    this.scene.add(mesh);
    this.particles.push({
      mesh,
      life: 0.4,
      maxLife: 0.4,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 2 + 1, (Math.random() - 0.5) * 2)
    });
  }

  createSpellBurst(position, color = 0x89cff0, count = 30) {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.1, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true });
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8 + 2,
        (Math.random() - 0.5) * 8
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        life: 0.6,
        maxLife: 0.6,
        velocity: vel
      });
    }
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        if (p.mesh.material) p.mesh.material.dispose();
        this.particles.splice(i, 1);
      } else {
        p.mesh.position.addScaledVector(p.velocity, delta);
        p.mesh.material.opacity = p.life / p.maxLife;
      }
    }
  }

  clearAll() {
    this.particles.forEach(p => {
      this.scene.remove(p.mesh);
      if (p.mesh.geometry) p.mesh.geometry.dispose();
      if (p.mesh.material) p.mesh.material.dispose();
    });
    this.particles = [];
  }
}

/* ==========================================================================
   4. ModelFactory Class
   ========================================================================== */
export class ModelFactory {
  static createPlayer(charType = 'harry') {
    const group = new THREE.Group();
    const robeColor = 0x1a1528;
    const scarfPrimary = 0xae0001;

    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.45, 1.4, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    const scarfGeo = new THREE.TorusGeometry(0.38, 0.08, 12, 24);
    const scarfMat = new THREE.MeshStandardMaterial({ color: scarfPrimary, roughness: 0.6 });
    const scarf = new THREE.Mesh(scarfGeo, scarfMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 1.5;
    group.add(scarf);

    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffd5b3, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);

    const hairGeo = new THREE.SphereGeometry(0.37, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const hairMat = new THREE.MeshStandardMaterial({ color: charType === 'ron' ? 0xd35400 : (charType === 'hermione' ? 0x8e44ad : 0x2c3e50) });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.85;
    group.add(hair);

    if (charType === 'harry') {
      const glassesGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 16);
      const glassesMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      [-0.12, 0.12].forEach(x => {
        const eyeGlass = new THREE.Mesh(glassesGeo, glassesMat);
        eyeGlass.position.set(x, 1.82, 0.32);
        group.add(eyeGlass);
      });
    }

    const wandGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.6, 8);
    const wandMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.5 });
    const wand = new THREE.Mesh(wandGeo, wandMat);
    wand.rotation.x = Math.PI / 3;
    wand.position.set(0.4, 1.2, 0.25);
    group.add(wand);

    const legGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.18, 0.3, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.18, 0.3, 0);
    group.add(rightLeg);

    group.userData = { leftLeg, rightLeg };
    return group;
  }

  static createPursuer() {
    const group = new THREE.Group();

    const filchBodyGeo = new THREE.CylinderGeometry(0.45, 0.5, 1.6, 16);
    const filchBodyMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.9 });
    const filchBody = new THREE.Mesh(filchBodyGeo, filchBodyMat);
    filchBody.position.set(-0.3, 1.0, 0);
    group.add(filchBody);

    const filchHeadGeo = new THREE.SphereGeometry(0.36, 16, 16);
    const filchHeadMat = new THREE.MeshStandardMaterial({ color: 0xe0b090 });
    const filchHead = new THREE.Mesh(filchHeadGeo, filchHeadMat);
    filchHead.position.set(-0.3, 1.9, 0);
    group.add(filchHead);

    const catBodyGeo = new THREE.BoxGeometry(0.3, 0.25, 0.5);
    const catMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    const cat = new THREE.Mesh(catBodyGeo, catMat);
    cat.position.set(0.4, 0.2, 0.2);
    group.add(cat);

    return group;
  }

  static createBroomstick() {
    const group = new THREE.Group();
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.03, 2.2, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.4, metalness: 0.2 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.x = Math.PI / 2;
    group.add(handle);

    const bristleGeo = new THREE.ConeGeometry(0.25, 0.8, 12);
    const bristleMat = new THREE.MeshStandardMaterial({ color: 0xd4ac0d, roughness: 0.9 });
    const bristles = new THREE.Mesh(bristleGeo, bristleMat);
    bristles.rotation.x = -Math.PI / 2;
    bristles.position.z = -1.1;
    group.add(bristles);

    const auraGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.25 });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    group.add(aura);

    return group;
  }

  static createGoldenSnitch() {
    const group = new THREE.Group();
    const orbGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    group.add(orb);

    const wingGeo = new THREE.BoxGeometry(0.5, 0.04, 0.12);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.32, 0.05, 0);
    group.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.32, 0.05, 0);
    group.add(rightWing);

    group.userData = { leftWing, rightWing };
    return group;
  }

  static createMagicBean() {
    const beanGeo = new THREE.CapsuleGeometry(0.12, 0.22, 8, 16);
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const beanMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.2 });
    const bean = new THREE.Mesh(beanGeo, beanMat);
    bean.rotation.z = Math.PI / 4;
    return bean;
  }

  static createCauldron() {
    const group = new THREE.Group();
    const potGeo = new THREE.CylinderGeometry(0.7, 0.5, 0.8, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, metalness: 0.8, roughness: 0.4 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.4;
    pot.castShadow = true;
    group.add(pot);

    const potionGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 16);
    const potionMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71 });
    const potion = new THREE.Mesh(potionGeo, potionMat);
    potion.position.y = 0.75;
    group.add(potion);

    return group;
  }

  static createMandrakePot() {
    const group = new THREE.Group();
    const potGeo = new THREE.CylinderGeometry(0.6, 0.4, 0.7, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.35;
    group.add(pot);

    const plantGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x27ae60 });
    const plant = new THREE.Mesh(plantGeo, plantMat);
    plant.position.y = 0.75;
    group.add(plant);

    return group;
  }

  static createFlyingBookShelf() {
    const group = new THREE.Group();
    const shelfGeo = new THREE.BoxGeometry(2.4, 0.15, 0.8);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.8 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.y = 2.0;
    group.add(shelf);

    const bookColors = [0xae0001, 0x1a472a, 0x0e1a40, 0xecb939];
    for (let x = -0.9; x <= 0.9; x += 0.3) {
      const bookGeo = new THREE.BoxGeometry(0.12, 0.45, 0.4);
      const bookMat = new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)] });
      const book = new THREE.Mesh(bookGeo, bookMat);
      book.position.set(x, 2.3, 0);
      group.add(book);
    }

    return group;
  }

  static createArmorStatue() {
    const group = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.45, 0.4, 1.4, 12);
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.85, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, armorMat);
    body.position.y = 1.0;
    group.add(body);

    const helmetGeo = new THREE.SphereGeometry(0.32, 12, 12);
    const helmet = new THREE.Mesh(helmetGeo, armorMat);
    helmet.position.y = 1.8;
    group.add(helmet);

    return group;
  }

  static createTrain() {
    const group = new THREE.Group();
    const trainGeo = new THREE.BoxGeometry(2.2, 2.6, 7.0);
    const trainMat = new THREE.MeshStandardMaterial({ color: 0xae0001, metalness: 0.5, roughness: 0.4 });
    const train = new THREE.Mesh(trainGeo, trainMat);
    train.position.y = 1.3;
    train.position.z = 3.5;
    train.castShadow = true;
    group.add(train);

    return group;
  }
}

/* ==========================================================================
   5. World3D Class
   ========================================================================== */
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
    this.scene.background = new THREE.Color(0x0c0916);
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
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(0xffd89b, 1.2);
    this.scene.add(ambientLight);

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
    this.initInitialTrack();
  }

  spawnTrackSegment(zPos) {
    const segment = new THREE.Group();
    segment.position.z = zPos;

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

    const railMat = new THREE.MeshStandardMaterial({ color: 0x5a5068, metalness: 0.8, roughness: 0.3 });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });

    this.laneX.forEach((x) => {
      for (let s = 1; s < this.segmentLength; s += 2.5) {
        const sleeperGeo = new THREE.BoxGeometry(1.6, 0.08, 0.4);
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.set(x, 0.04, s);
        segment.add(sleeper);
      }

      [-0.55, 0.55].forEach((offset) => {
        const railGeo = new THREE.BoxGeometry(0.08, 0.12, this.segmentLength);
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(x + offset, 0.12, this.segmentLength / 2);
        segment.add(rail);
      });
    });

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x181324, roughness: 0.9 });
    const archMat = new THREE.MeshStandardMaterial({ color: 0x2d243a, roughness: 0.8 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x3498db, transparent: true, opacity: 0.65 });

    [-6.2, 6.2].forEach((wallX) => {
      const wallGeo = new THREE.BoxGeometry(0.5, 12, this.segmentLength);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(wallX, 6, this.segmentLength / 2);
      segment.add(wall);

      for (let w = 5; w < this.segmentLength; w += 10) {
        const glassGeo = new THREE.PlaneGeometry(1.2, 2.5);
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(wallX > 0 ? wallX - 0.26 : wallX + 0.26, 6.5, w);
        glass.rotation.y = wallX > 0 ? -Math.PI / 2 : Math.PI / 2;
        segment.add(glass);

        const sconceGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const sconce = new THREE.Mesh(sconceGeo, new THREE.MeshBasicMaterial({ color: 0xe67e22 }));
        sconce.position.set(wallX > 0 ? wallX - 0.35 : wallX + 0.35, 4.2, w);
        segment.add(sconce);
      }
    });

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

/* ==========================================================================
   6. Controls Class (Standard Intuitive Input: Left = Left, Right = Right)
   ========================================================================== */
export class Controls {
  constructor(onAction) {
    this.onAction = onAction;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.minSwipeDistance = 25;
    
    this.bindKeyboard();
    this.bindTouch();
    this.bindScreenTap();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.onAction('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.onAction('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          this.onAction('jump');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'Shift':
          this.onAction('slide');
          break;
        case 'e':
        case 'E':
        case 'f':
        case 'F':
          this.onAction('spell');
          break;
        case 'Escape':
        case 'p':
        case 'P':
          this.onAction('pause');
          break;
      }
    });
  }

  bindTouch() {
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - this.touchStartX;
        const deltaY = e.changedTouches[0].clientY - this.touchStartY;
        
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) > this.minSwipeDistance) {
          if (absX > absY) {
            if (deltaX > 0) {
              this.onAction('right');
            } else {
              this.onAction('left');
            }
          } else {
            if (deltaY < 0) {
              this.onAction('jump');
            } else {
              this.onAction('slide');
            }
          }
        }
      }
    }, { passive: true });
  }

  bindScreenTap() {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
      canvas.addEventListener('click', (e) => {
        const clickX = e.clientX;
        const screenWidth = window.innerWidth;

        if (clickX < screenWidth * 0.45) {
          this.onAction('left');
        } else if (clickX > screenWidth * 0.55) {
          this.onAction('right');
        } else {
          this.onAction('jump');
        }
      });
    }
  }
}

/* ==========================================================================
   7. GameEngine Class
   ========================================================================== */
export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.shop = new Shop();
    this.sound = new SoundManager();
    this.world = new World3D(canvas);
    this.particles = new ParticleSystem(this.world.scene);
    this.clock = new THREE.Clock();

    this.gameState = 'MENU';
    this.speedMode = 'normal';
    
    this.player = null;
    this.currentLane = 1;
    this.targetX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.bankAngle = 0;

    this.verticalVelocity = 0;
    this.gravity = -34;
    this.jumpForce = 13.5;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;

    this.baseSpeed = 22.0;
    this.speed = 22.0;
    this.maxSpeed = 48.0;
    this.speedIncrement = 0.45;

    this.pursuer = null;
    this.pursuerDistance = 8.0;
    this.stumbleTimer = 0;

    this.obstacles = [];
    this.collectibles = [];
    this.nextSpawnZ = 25;

    this.activePowers = { broom: 0, patronus: 0, lumos: 0, felix: 0 };
    this.distance = 0;
    this.bonusPoints = 0;
    this.galleonsCollected = 0;

    this.controls = new Controls((action) => this.handleAction(action));
    
    this.initPlayerAndPursuer();
    this.animate();
  }

  setSpeedMode(mode = 'normal') {
    this.speedMode = mode;
    if (mode === 'relaxed') {
      this.baseSpeed = 16.0;
      this.speedIncrement = 0.25;
      this.maxSpeed = 32.0;
    } else if (mode === 'fast') {
      this.baseSpeed = 28.0;
      this.speedIncrement = 0.65;
      this.maxSpeed = 60.0;
    } else {
      this.baseSpeed = 22.0;
      this.speedIncrement = 0.45;
      this.maxSpeed = 48.0;
    }
  }

  initPlayerAndPursuer() {
    if (this.player) this.world.scene.remove(this.player);
    if (this.pursuer) this.world.scene.remove(this.pursuer);

    const charType = this.shop.data.equippedChar;
    this.player = ModelFactory.createPlayer(charType);
    this.player.position.set(0, 0, 0);
    this.world.scene.add(this.player);

    this.pursuer = ModelFactory.createPursuer();
    this.pursuer.position.set(0, 0, -this.pursuerDistance);
    this.world.scene.add(this.pursuer);
  }

  disposeMesh(mesh) {
    if (!mesh) return;
    this.world.scene.remove(mesh);
    mesh.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  startGame() {
    this.sound.startMusic();
    this.gameState = 'PLAYING';
    this.clock.start();
    
    this.world.resetTrack();
    this.setSpeedMode(this.speedMode);

    this.distance = 0;
    this.bonusPoints = 0;
    this.galleonsCollected = 0;
    this.speed = this.baseSpeed;
    this.currentLane = 1;
    this.targetX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.pursuerDistance = 8.0;
    this.stumbleTimer = 0;
    this.bankAngle = 0;

    this.obstacles.forEach(o => this.disposeMesh(o.mesh));
    this.collectibles.forEach(c => this.disposeMesh(c.mesh));
    this.obstacles = [];
    this.collectibles = [];
    this.nextSpawnZ = 28;
    this.particles.clearAll();

    this.activePowers = { broom: 0, patronus: 0, lumos: 0, felix: 0 };
    this.initPlayerAndPursuer();
  }

  pauseGame() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
    }
  }

  resumeGame() {
    if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
      this.clock.getDelta();
    }
  }

  handleAction(action) {
    if (this.gameState !== 'PLAYING') return;

    switch (action) {
      case 'left':
        if (this.currentLane > 0) {
          this.currentLane--;
          this.bankAngle = -0.32;
          this.sound.playSlideSound();
        }
        break;

      case 'right':
        if (this.currentLane < 2) {
          this.currentLane++;
          this.bankAngle = 0.32;
          this.sound.playSlideSound();
        }
        break;

      case 'jump':
        if (!this.isJumping && this.activePowers.broom <= 0) {
          this.isJumping = true;
          this.verticalVelocity = this.jumpForce;
          this.sound.playJumpSound();
        }
        break;

      case 'slide':
        if (!this.isSliding && this.activePowers.broom <= 0) {
          this.isSliding = true;
          this.slideTimer = 0.75;
          if (this.isJumping) {
            this.verticalVelocity = -18;
          }
          this.sound.playSlideSound();
        }
        break;

      case 'spell':
        this.castSpell();
        break;

      case 'pause':
        this.pauseGame();
        break;
    }

    this.targetX = this.world.laneX[this.currentLane];
  }

  castSpell() {
    this.sound.playSpellSound();
    this.particles.createSpellBurst(this.player.position, 0x89cff0, 35);
    
    const patronusLvl = this.shop.data.upgrades.patronus || 1;
    this.activePowers.patronus = 5 + patronusLvl * 2.0;
  }

  spawnProceduralContent() {
    if (this.nextSpawnZ - this.playerZ < 100) {
      const lane = Math.floor(Math.random() * 3);
      const spawnX = this.world.laneX[lane];
      const spawnZ = this.nextSpawnZ;

      const rand = Math.random();

      if (rand < 0.22) {
        const cauldronMesh = ModelFactory.createCauldron();
        cauldronMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(cauldronMesh);
        this.obstacles.push({ mesh: cauldronMesh, type: 'trunk', x: spawnX, z: spawnZ, radius: 0.75, height: 0.9, zDepth: 0.8 });

        for (let c = 2; c <= 6; c += 2) {
          const beanMesh = ModelFactory.createMagicBean();
          beanMesh.position.set(spawnX, 0.8, spawnZ + c);
          this.world.scene.add(beanMesh);
          this.collectibles.push({ mesh: beanMesh, type: 'bean', x: spawnX, y: 0.8, z: spawnZ + c });
        }
      } else if (rand < 0.44) {
        const mandrakeMesh = ModelFactory.createMandrakePot();
        mandrakeMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(mandrakeMesh);
        this.obstacles.push({ mesh: mandrakeMesh, type: 'trunk', x: spawnX, z: spawnZ, radius: 0.7, height: 0.8, zDepth: 0.7 });

        const broomMesh = ModelFactory.createBroomstick();
        broomMesh.position.set(spawnX, 1.2, spawnZ + 2.5);
        this.world.scene.add(broomMesh);
        this.collectibles.push({ mesh: broomMesh, type: 'broom', x: spawnX, y: 1.2, z: spawnZ + 2.5 });
      } else if (rand < 0.64) {
        const shelfMesh = ModelFactory.createFlyingBookShelf();
        shelfMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(shelfMesh);
        this.obstacles.push({ mesh: shelfMesh, type: 'arch', x: spawnX, z: spawnZ, radius: 0.9, height: 3.2, slideClearance: 1.7, zDepth: 0.5 });
      } else if (rand < 0.82) {
        const armorMesh = ModelFactory.createArmorStatue();
        armorMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(armorMesh);
        this.obstacles.push({ mesh: armorMesh, type: 'armor', x: spawnX, z: spawnZ, radius: 0.8, height: 2.2, zDepth: 0.9 });
      } else if (rand < 0.92) {
        const trainMesh = ModelFactory.createTrain();
        trainMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(trainMesh);
        this.obstacles.push({ mesh: trainMesh, type: 'train', x: spawnX, z: spawnZ, radius: 1.1, height: 2.7, zDepth: 6.5 });
      } else {
        const snitchMesh = ModelFactory.createGoldenSnitch();
        snitchMesh.position.set(spawnX, 2.0, spawnZ);
        this.world.scene.add(snitchMesh);
        this.collectibles.push({ mesh: snitchMesh, type: 'snitch_rare', x: spawnX, y: 2.0, z: spawnZ });
      }

      this.nextSpawnZ += 24 + Math.random() * 8;
    }
  }

  update(delta) {
    if (this.gameState !== 'PLAYING') return;

    this.speed = Math.min(this.maxSpeed, this.speed + this.speedIncrement * delta);
    this.playerZ += this.speed * delta;
    this.distance = Math.floor(this.playerZ + this.bonusPoints);

    Object.keys(this.activePowers).forEach(key => {
      if (this.activePowers[key] > 0) {
        this.activePowers[key] -= delta;
      }
    });

    this.player.position.x += (this.targetX - this.player.position.x) * Math.min(1.0, 28 * delta);
    this.bankAngle += (0 - this.bankAngle) * Math.min(1.0, 9 * delta);
    this.player.rotation.z = this.bankAngle;

    if (this.activePowers.broom > 0) {
      this.playerY += (5.5 - this.playerY) * Math.min(1.0, 7 * delta);
      this.isJumping = false;
      this.particles.createGoldenSparkle(this.player.position);
    } else {
      if (this.isJumping) {
        this.playerY += this.verticalVelocity * delta;
        this.verticalVelocity += this.gravity * delta;
        if (this.playerY <= 0) {
          this.playerY = 0;
          this.isJumping = false;
        }
      } else if (this.isSliding) {
        this.slideTimer -= delta;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      } else {
        if (this.playerY > 0) {
          this.playerY += (0 - this.playerY) * Math.min(1.0, 6 * delta);
          if (this.playerY < 0.05) {
            this.playerY = 0;
          }
        }
      }
    }

    this.player.position.y = this.playerY;
    this.player.position.z = this.playerZ;

    if (this.player.userData.leftLeg && !this.isJumping) {
      const legAngle = Math.sin(this.playerZ * 1.5) * 0.7;
      this.player.userData.leftLeg.rotation.x = legAngle;
      this.player.userData.rightLeg.rotation.x = -legAngle;
    }

    if (this.isSliding) {
      this.player.rotation.x = -Math.PI / 3.5;
    } else {
      this.player.rotation.x = 0;
    }

    if (this.stumbleTimer > 0) {
      this.stumbleTimer -= delta;
    } else {
      if (this.pursuerDistance < 8.0) {
        this.pursuerDistance += 1.5 * delta;
      }
    }

    this.pursuer.position.set(this.player.position.x, 0, this.playerZ - this.pursuerDistance);

    if (this.pursuerDistance <= 1.35) {
      this.gameOver();
      return;
    }

    const cameraTargetY = (this.activePowers.broom > 0 || this.playerY > 2.0) ? 9.0 : 3.8;
    this.world.camera.position.x = this.player.position.x * 0.4;
    this.world.camera.position.y += (cameraTargetY - this.world.camera.position.y) * Math.min(1.0, 5 * delta);
    this.world.camera.position.z = this.playerZ - 6.5;
    this.world.camera.lookAt(this.player.position.x * 0.4, this.playerY + 1.8, this.playerZ + 10);

    this.world.updateTrack(this.playerZ);
    this.spawnProceduralContent();
    this.checkCollisions(delta);
    this.cleanupPastSpawns();
    this.particles.update(delta);
  }

  cleanupPastSpawns() {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (this.playerZ - obs.z > 25) {
        this.disposeMesh(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      if (this.playerZ - c.z > 25) {
        this.disposeMesh(c.mesh);
        this.collectibles.splice(i, 1);
      }
    }
  }

  checkCollisions(delta) {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];

      if (c.mesh && c.mesh.userData && c.mesh.userData.leftWing) {
        const wingAngle = Math.sin(Date.now() * 0.03) * 0.5;
        c.mesh.userData.leftWing.rotation.z = wingAngle;
        c.mesh.userData.rightWing.rotation.z = -wingAngle;
      }
      
      if (this.activePowers.lumos > 0 || (this.shop.data.equippedChar === 'hermione')) {
        const distToPlayer = Math.hypot(c.x - this.player.position.x, c.z - this.playerZ);
        if (distToPlayer < 14) {
          c.mesh.position.x += (this.player.position.x - c.mesh.position.x) * Math.min(1.0, 14 * delta);
          c.mesh.position.y += (this.playerY + 1.0 - c.mesh.position.y) * Math.min(1.0, 14 * delta);
          c.mesh.position.z += (this.playerZ - c.mesh.position.z) * Math.min(1.0, 14 * delta);
        }
      }

      const dx = Math.abs(c.mesh.position.x - this.player.position.x);
      const dy = Math.abs(c.mesh.position.y - (this.playerY + 1.0));
      const dz = Math.abs(c.mesh.position.z - this.playerZ);

      if (dx < 1.1 && dy < 1.6 && dz < 1.3) {
        if (c.type === 'bean') {
          const multiplier = (this.shop.data.equippedChar === 'ron') ? 2 : 1;
          this.galleonsCollected += 1 * multiplier;
          this.sound.playCoinSound();
          this.particles.createGoldenSparkle(c.mesh.position);
        } else if (c.type === 'broom') {
          this.sound.playSnitchSound();
          const broomLvl = this.shop.data.upgrades.broom || 1;
          this.activePowers.broom = 5.5 + broomLvl * 0.8;
          this.particles.createSpellBurst(c.mesh.position, 0xf39c12, 35);
        } else if (c.type === 'snitch_rare') {
          this.sound.playSnitchSound();
          this.bonusPoints += 500;
          this.galleonsCollected += 10;
          this.particles.createSpellBurst(c.mesh.position, 0xffd700, 50);
        }

        this.disposeMesh(c.mesh);
        this.collectibles.splice(i, 1);
      }
    }

    if (this.activePowers.broom > 0 || this.playerY > 2.2) return;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const dz = Math.abs(obs.z - this.playerZ);
      const dx = Math.abs(obs.x - this.player.position.x);

      if (dz < (obs.zDepth / 2 + 0.3) && dx < (obs.radius)) {
        let isHit = false;

        if (obs.type === 'trunk') {
          if (this.playerY < 0.75) isHit = true;
        } else if (obs.type === 'armor') {
          if (this.playerY < 2.0) isHit = true;
        } else if (obs.type === 'arch') {
          if (!this.isSliding && this.playerY < 1.6) isHit = true;
        } else if (obs.type === 'train') {
          if (this.playerY < 2.5) isHit = true;
        }

        if (isHit) {
          if (this.activePowers.patronus > 0) {
            this.sound.playSpellSound();
            this.particles.createSpellBurst(obs.mesh.position, 0x89cff0, 40);
            this.disposeMesh(obs.mesh);
            this.obstacles.splice(i, 1);
          } else {
            this.sound.playCrashSound();
            this.particles.createSpellBurst(this.player.position, 0xe74c3c, 25);

            if (this.pursuerDistance < 3.5) {
              this.pursuerDistance = 1.0;
              this.gameOver();
              return;
            } else {
              this.pursuerDistance = 2.2;
              this.stumbleTimer = 4.0;
            }

            this.disposeMesh(obs.mesh);
            this.obstacles.splice(i, 1);
          }
        }
      }
    }
  }

  gameOver() {
    this.sound.playCrashSound();
    this.sound.stopMusic();
    this.gameState = 'GAMEOVER';

    this.shop.addGalleons(this.galleonsCollected);
    const isNewRecord = this.shop.updateHighScore(this.distance);

    if (this.onGameOverCallback) {
      this.onGameOverCallback(this.distance, this.galleonsCollected, isNewRecord);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = Math.min(0.05, this.clock.getDelta());
    this.update(delta);
    this.world.render();
  }
}

/* ==========================================================================
   8. Application Initialization & UI Event Controller
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  
  const game = new GameEngine(canvas);
  canvas.__gameEngine = game;

  const hud = document.getElementById('hud');
  const mainMenu = document.getElementById('main-menu');
  const shopScreen = document.getElementById('shop-screen');
  const controlsScreen = document.getElementById('controls-screen');
  const pauseScreen = document.getElementById('pause-screen');
  const gameOverScreen = document.getElementById('game-over-screen');

  const scoreDisplay = document.getElementById('score-display');
  const galleonDisplay = document.getElementById('galleon-display');
  const menuHighScore = document.getElementById('menu-high-score');
  const filchWarning = document.getElementById('filch-warning');

  const barBroom = document.getElementById('bar-broom');
  const barPatronus = document.getElementById('bar-patronus');
  const barLumos = document.getElementById('bar-lumos');

  const shopGalleonCount = document.getElementById('shop-galleon-count');
  const selectedCharName = document.getElementById('selected-char-name');
  const selectedCharHouse = document.getElementById('selected-char-house');

  const spellCastBtn = document.getElementById('spell-cast-btn');
  if (spellCastBtn) {
    spellCastBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      game.handleAction('spell');
    });
  }

  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const selectedSpeed = e.target.getAttribute('data-speed');
      game.setSpeedMode(selectedSpeed);
    });
  });

  const updateMenuStats = () => {
    menuHighScore.textContent = `${game.shop.data.highScore} m`;
    shopGalleonCount.textContent = game.shop.data.galleons;

    const charNames = { harry: 'Harry Potter', hermione: 'Hermione Granger', ron: 'Ron Weasley' };
    const charHouses = { harry: 'Gryffindor', hermione: 'Gryffindor', ron: 'Gryffindor' };

    selectedCharName.textContent = charNames[game.shop.data.equippedChar] || 'Harry Potter';
    selectedCharHouse.textContent = charHouses[game.shop.data.equippedChar] || 'Gryffindor';
  };

  updateMenuStats();

  document.getElementById('start-game-btn')?.addEventListener('click', () => {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    hud.classList.remove('hidden');
    hud.classList.add('active');
    game.startGame();
  });

  document.getElementById('open-shop-btn')?.addEventListener('click', () => {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    shopScreen.classList.remove('hidden');
    shopScreen.classList.add('active');
    updateShopUI();
  });

  document.getElementById('close-shop-btn')?.addEventListener('click', () => {
    shopScreen.classList.remove('active');
    shopScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    updateMenuStats();
  });

  document.getElementById('open-controls-btn')?.addEventListener('click', () => {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    controlsScreen.classList.remove('hidden');
    controlsScreen.classList.add('active');
  });

  document.getElementById('close-controls-btn')?.addEventListener('click', () => {
    controlsScreen.classList.remove('active');
    controlsScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
  });

  document.getElementById('pause-btn')?.addEventListener('click', () => {
    game.pauseGame();
    pauseScreen.classList.remove('hidden');
    pauseScreen.classList.add('active');
  });

  document.getElementById('resume-btn')?.addEventListener('click', () => {
    pauseScreen.classList.remove('active');
    pauseScreen.classList.add('hidden');
    game.resumeGame();
  });

  document.getElementById('restart-from-pause-btn')?.addEventListener('click', () => {
    pauseScreen.classList.remove('active');
    pauseScreen.classList.add('hidden');
    game.startGame();
  });

  document.getElementById('quit-to-menu-btn')?.addEventListener('click', () => {
    pauseScreen.classList.remove('active');
    pauseScreen.classList.add('hidden');
    hud.classList.remove('active');
    hud.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    updateMenuStats();
  });

  document.getElementById('restart-btn')?.addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    hud.classList.add('active');
    game.startGame();
  });

  document.getElementById('game-over-shop-btn')?.addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    shopScreen.classList.remove('hidden');
    shopScreen.classList.add('active');
    updateShopUI();
  });

  document.getElementById('game-over-menu-btn')?.addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('active');
    hud.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    updateMenuStats();
  });

  document.getElementById('audio-toggle-btn')?.addEventListener('click', (e) => {
    const isMuted = game.sound.toggleMute();
    e.target.textContent = isMuted ? '🔇' : '🔊';
  });

  game.onGameOverCallback = (finalScore, finalGalleons, isNewRecord) => {
    hud.classList.remove('active');
    hud.classList.add('hidden');
    
    document.getElementById('final-score').textContent = `${finalScore} m`;
    document.getElementById('final-galleons').textContent = `${finalGalleons} ⚡`;

    const recordTag = document.getElementById('new-high-score-tag');
    if (isNewRecord) {
      recordTag.classList.remove('hidden');
    } else {
      recordTag.classList.add('hidden');
    }

    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('active');
  };

  const updateShopUI = () => {
    shopGalleonCount.textContent = game.shop.data.galleons;

    document.getElementById('lvl-broom').textContent = game.shop.data.upgrades.broom || 1;
    document.getElementById('lvl-patronus').textContent = game.shop.data.upgrades.patronus || 1;
    document.getElementById('lvl-lumos').textContent = game.shop.data.upgrades.lumos || 1;

    document.querySelectorAll('.shop-item-card').forEach(card => {
      const charId = card.getAttribute('data-char');
      const statusBox = card.querySelector('.item-status');

      if (game.shop.data.equippedChar === charId) {
        card.classList.add('selected');
        statusBox.innerHTML = `<span class="status-tag equipped">EQUIPPED</span>`;
      } else if (game.shop.data.unlockedChars.includes(charId)) {
        card.classList.remove('selected');
        statusBox.innerHTML = `<button class="btn shop-equip-btn" data-char="${charId}">EQUIP</button>`;
      } else {
        card.classList.remove('selected');
      }
    });

    document.querySelectorAll('.shop-equip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const charId = e.target.getAttribute('data-char');
        game.shop.equipCharacter(charId);
        game.initPlayerAndPursuer();
        updateShopUI();
      });
    });
  };

  document.querySelectorAll('.shop-buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      const id = e.target.getAttribute('data-id');
      const cost = parseInt(e.target.getAttribute('data-cost'));

      if (type === 'char') {
        if (game.shop.unlockCharacter(id, cost)) {
          game.initPlayerAndPursuer();
          updateShopUI();
        } else {
          alert('Not enough Golden Snitches! Catch more Snitches & Beans in your run.');
        }
      }
    });
  });

  document.querySelectorAll('.upgrade-buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      const cost = 50;
      if (game.shop.upgradeItem(type, cost)) {
        updateShopUI();
      } else {
        alert('Not enough Golden Snitches! Catch more Snitches & Beans in your run.');
      }
    });
  });

  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active', 'hidden'));

      e.target.classList.add('active');
      const tabTarget = e.target.getAttribute('data-tab');
      
      document.getElementById(`tab-${tabTarget}`).classList.add('active');
      document.querySelectorAll(`.tab-content:not(#tab-${tabTarget})`).forEach(c => c.classList.add('hidden'));
    });
  });

  setInterval(() => {
    if (game.gameState === 'PLAYING') {
      scoreDisplay.textContent = `${game.distance} m`;
      galleonDisplay.textContent = `${game.galleonsCollected}`;

      if (game.pursuerDistance < 3.0) {
        filchWarning.classList.remove('hidden');
      } else {
        filchWarning.classList.add('hidden');
      }

      if (game.activePowers.broom > 0) {
        barBroom.classList.remove('hidden');
        barBroom.querySelector('.broom-fill').style.width = `${(game.activePowers.broom / 8) * 100}%`;
      } else {
        barBroom.classList.add('hidden');
      }

      if (game.activePowers.patronus > 0) {
        barPatronus.classList.remove('hidden');
        barPatronus.querySelector('.patronus-fill').style.width = `${(game.activePowers.patronus / 6) * 100}%`;
      } else {
        barPatronus.classList.add('hidden');
      }

      if (game.activePowers.lumos > 0) {
        barLumos.classList.remove('hidden');
        barLumos.querySelector('.lumos-fill').style.width = `${(game.activePowers.lumos / 10) * 100}%`;
      } else {
        barLumos.classList.add('hidden');
      }
    }
  }, 100);
});

