/* Particles.js - Magical Sparkles & Spell FX */
import * as THREE from 'three';

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
