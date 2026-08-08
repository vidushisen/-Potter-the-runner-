/* GameEngine.js - Core 3D Endless Runner Engine with Dynamic Speed Selection & Track Reset */
import * as THREE from 'three';
import { World3D } from '../graphics/World3D.js';
import { ModelFactory } from '../graphics/Models.js';
import { ParticleSystem } from '../graphics/Particles.js';
import { Controls } from './Controls.js';
import { SoundManager } from '../audio/SoundManager.js';
import { Shop } from '../gameplay/Shop.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.shop = new Shop();
    this.sound = new SoundManager();
    this.world = new World3D(canvas);
    this.particles = new ParticleSystem(this.world.scene);
    this.clock = new THREE.Clock();

    this.gameState = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.speedMode = 'normal'; // 'relaxed', 'normal', 'fast'
    
    // Player Properties
    this.player = null;
    this.currentLane = 1; // 0 = Left (-2.5), 1 = Center (0), 2 = Right (2.5)
    this.targetX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.bankAngle = 0; // Character banking tilt on lane switch

    // Responsive Movement Physics
    this.verticalVelocity = 0;
    this.gravity = -34;
    this.jumpForce = 13.5;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;

    // Default Running Speed (Will be set by setSpeedMode)
    this.baseSpeed = 22.0;
    this.speed = 22.0;
    this.maxSpeed = 48.0;
    this.speedIncrement = 0.45;

    // Argus Filch & Mrs. Norris Pursuer Physics
    this.pursuer = null;
    this.pursuerDistance = 8.0;
    this.stumbleTimer = 0;

    // Active Spawns & Pools
    this.obstacles = [];
    this.collectibles = [];
    this.nextSpawnZ = 25;

    // Active Power-Up Timers (in seconds)
    this.activePowers = {
      broom: 0,
      patronus: 0,
      lumos: 0,
      felix: 0
    };

    // Stats
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
    } else { // 'normal'
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
    
    // Reset World Track Segments to z = 0 (Fixes black void bug on restart!)
    this.world.resetTrack();

    // Apply selected speed mode
    this.setSpeedMode(this.speedMode);

    // Reset Stats & Position
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

    // Clear active obstacles & collectibles cleanly
    this.obstacles.forEach(o => this.disposeMesh(o.mesh));
    this.collectibles.forEach(c => this.disposeMesh(c.mesh));
    this.obstacles = [];
    this.collectibles = [];
    this.nextSpawnZ = 28;
    this.particles.clearAll();

    // Reset Powerups
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
        // Spawn Potions Cauldron (Low jumpable obstacle)
        const cauldronMesh = ModelFactory.createCauldron();
        cauldronMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(cauldronMesh);
        this.obstacles.push({
          mesh: cauldronMesh,
          type: 'trunk',
          x: spawnX,
          z: spawnZ,
          radius: 0.75,
          height: 0.9,
          zDepth: 0.8
        });

        // Spawn Bertie Bott's Beans behind cauldron
        for (let c = 2; c <= 6; c += 2) {
          const beanMesh = ModelFactory.createMagicBean();
          beanMesh.position.set(spawnX, 0.8, spawnZ + c);
          this.world.scene.add(beanMesh);
          this.collectibles.push({ mesh: beanMesh, type: 'bean', x: spawnX, y: 0.8, z: spawnZ + c });
        }
      } else if (rand < 0.44) {
        // Spawn Mandrake & Devil's Snare Pot (Low jumpable obstacle)
        const mandrakeMesh = ModelFactory.createMandrakePot();
        mandrakeMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(mandrakeMesh);
        this.obstacles.push({
          mesh: mandrakeMesh,
          type: 'trunk',
          x: spawnX,
          z: spawnZ,
          radius: 0.7,
          height: 0.8,
          zDepth: 0.7
        });

        // Spawn Firebolt Broomstick behind Mandrake!
        const broomMesh = ModelFactory.createBroomstick();
        broomMesh.position.set(spawnX, 1.2, spawnZ + 2.5);
        this.world.scene.add(broomMesh);
        this.collectibles.push({ mesh: broomMesh, type: 'broom', x: spawnX, y: 1.2, z: spawnZ + 2.5 });
      } else if (rand < 0.64) {
        // Spawn Floating Enchanted Bookshelf (Slidable overhead arch)
        const shelfMesh = ModelFactory.createFlyingBookShelf();
        shelfMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(shelfMesh);
        this.obstacles.push({
          mesh: shelfMesh,
          type: 'arch',
          x: spawnX,
          z: spawnZ,
          radius: 0.9,
          height: 3.2,
          slideClearance: 1.7,
          zDepth: 0.5
        });
      } else if (rand < 0.82) {
        // Spawn Knight Armor Statue (Tall obstacle)
        const armorMesh = ModelFactory.createArmorStatue();
        armorMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(armorMesh);
        this.obstacles.push({
          mesh: armorMesh,
          type: 'armor',
          x: spawnX,
          z: spawnZ,
          radius: 0.8,
          height: 2.2,
          zDepth: 0.9
        });
      } else if (rand < 0.92) {
        // Spawn Hogwarts Express Train
        const trainMesh = ModelFactory.createTrain();
        trainMesh.position.set(spawnX, 0, spawnZ);
        this.world.scene.add(trainMesh);
        this.obstacles.push({
          mesh: trainMesh,
          type: 'train',
          x: spawnX,
          z: spawnZ,
          radius: 1.1,
          height: 2.7,
          zDepth: 6.5
        });
      } else {
        // Spawn RARE Golden Snitch (+500 Bonus Points!)
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

    // Fast Speed Acceleration
    this.speed = Math.min(this.maxSpeed, this.speed + this.speedIncrement * delta);
    this.playerZ += this.speed * delta;
    this.distance = Math.floor(this.playerZ + this.bonusPoints);

    // Update Powerup Timers
    Object.keys(this.activePowers).forEach(key => {
      if (this.activePowers[key] > 0) {
        this.activePowers[key] -= delta;
      }
    });

    // 1. Instant, Responsive Lane Movement + Character Banking Tilt
    this.player.position.x += (this.targetX - this.player.position.x) * Math.min(1.0, 28 * delta);
    this.bankAngle += (0 - this.bankAngle) * Math.min(1.0, 9 * delta);
    this.player.rotation.z = this.bankAngle;

    // 2. Player Sky Flight Physics on Firebolt Broomstick & Automatic Descent!
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
        // Automatically smoothly descend back to ground track (0m) when broom expires!
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

    // Player Animation Leg Swings
    if (this.player.userData.leftLeg && !this.isJumping) {
      const legAngle = Math.sin(this.playerZ * 1.5) * 0.7;
      this.player.userData.leftLeg.rotation.x = legAngle;
      this.player.userData.rightLeg.rotation.x = -legAngle;
    }

    // Slide Crouch Rotation
    if (this.isSliding) {
      this.player.rotation.x = -Math.PI / 3.5;
    } else {
      this.player.rotation.x = 0;
    }

    // 3. Argus Filch Pursuer Physics
    if (this.stumbleTimer > 0) {
      this.stumbleTimer -= delta;
    } else {
      if (this.pursuerDistance < 8.0) {
        this.pursuerDistance += 1.5 * delta;
      }
    }

    this.pursuer.position.set(
      this.player.position.x,
      0,
      this.playerZ - this.pursuerDistance
    );

    // Filch Caught Check!
    if (this.pursuerDistance <= 1.35) {
      this.gameOver();
      return;
    }

    // 4. Camera Follow (Smooth transition for Broom Flight & Automatic Descent)
    const cameraTargetY = (this.activePowers.broom > 0 || this.playerY > 2.0) ? 9.0 : 3.8;
    this.world.camera.position.x = this.player.position.x * 0.4;
    this.world.camera.position.y += (cameraTargetY - this.world.camera.position.y) * Math.min(1.0, 5 * delta);
    this.world.camera.position.z = this.playerZ - 6.5;
    this.world.camera.lookAt(this.player.position.x * 0.4, this.playerY + 1.8, this.playerZ + 10);

    // 5. Update World Tracks & Spawns
    this.world.updateTrack(this.playerZ);
    this.spawnProceduralContent();

    // 6. Handle Collisions (Collectibles & Obstacles)
    this.checkCollisions(delta);

    // 7. Cleanup Old Past Spawns
    this.cleanupPastSpawns();

    // 8. Update Particles
    this.particles.update(delta);
  }

  cleanupPastSpawns() {
    // Remove obstacles far behind player
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (this.playerZ - obs.z > 25) {
        this.disposeMesh(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // Remove collectibles far behind player
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      if (this.playerZ - c.z > 25) {
        this.disposeMesh(c.mesh);
        this.collectibles.splice(i, 1);
      }
    }
  }

  checkCollisions(delta) {
    // Collectibles Collision
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];

      // Wing flapping animation for Snitches
      if (c.mesh && c.mesh.userData && c.mesh.userData.leftWing) {
        const wingAngle = Math.sin(Date.now() * 0.03) * 0.5;
        c.mesh.userData.leftWing.rotation.z = wingAngle;
        c.mesh.userData.rightWing.rotation.z = -wingAngle;
      }
      
      // Lumos Magnet Effect
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

    // Obstacles Collision (Invulnerable while on Broom or descending above obstacles)
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
