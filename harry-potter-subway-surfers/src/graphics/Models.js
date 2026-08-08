/* Models.js - Procedural 3D Mesh Factory for Harry Potter Characters, Brooms & Obstacles */
import * as THREE from 'three';

export class ModelFactory {
  static createPlayer(charType = 'harry') {
    const group = new THREE.Group();

    // Body Colors
    const isGryffindor = true;
    const robeColor = 0x1a1528;
    const scarfPrimary = isGryffindor ? 0xae0001 : 0x1a472a;
    const scarfSecondary = isGryffindor ? 0xeeba30 : 0xaaaaaa;

    // Body Robe Capsule
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.45, 1.4, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    // House Scarf
    const scarfGeo = new THREE.TorusGeometry(0.38, 0.08, 12, 24);
    const scarfMat = new THREE.MeshStandardMaterial({ color: scarfPrimary, roughness: 0.6 });
    const scarf = new THREE.Mesh(scarfGeo, scarfMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 1.5;
    group.add(scarf);

    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffd5b3, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.37, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const hairMat = new THREE.MeshStandardMaterial({ color: charType === 'ron' ? 0xd35400 : (charType === 'hermione' ? 0x8e44ad : 0x2c3e50) });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.85;
    group.add(hair);

    // Glasses for Harry
    if (charType === 'harry') {
      const glassesGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 16);
      const glassesMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      [-0.12, 0.12].forEach(x => {
        const eyeGlass = new THREE.Mesh(glassesGeo, glassesMat);
        eyeGlass.position.set(x, 1.82, 0.32);
        group.add(eyeGlass);
      });
    }

    // Magic Wand
    const wandGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.6, 8);
    const wandMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.5 });
    const wand = new THREE.Mesh(wandGeo, wandMat);
    wand.rotation.x = Math.PI / 3;
    wand.position.set(0.4, 1.2, 0.25);
    group.add(wand);

    // Animated Legs
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

    // Argus Filch Figure
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

    // Mrs. Norris Cat
    const catBodyGeo = new THREE.BoxGeometry(0.3, 0.25, 0.5);
    const catMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    const cat = new THREE.Mesh(catBodyGeo, catMat);
    cat.position.set(0.4, 0.2, 0.2);
    group.add(cat);

    return group;
  }

  static createBroomstick() {
    const group = new THREE.Group();

    // Firebolt Handle
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.03, 2.2, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.4, metalness: 0.2 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.x = Math.PI / 2;
    group.add(handle);

    // Broom Bristles
    const bristleGeo = new THREE.ConeGeometry(0.25, 0.8, 12);
    const bristleMat = new THREE.MeshStandardMaterial({ color: 0xd4ac0d, roughness: 0.9 });
    const bristles = new THREE.Mesh(bristleGeo, bristleMat);
    bristles.rotation.x = -Math.PI / 2;
    bristles.position.z = -1.1;
    group.add(bristles);

    // Glowing Aura
    const auraGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.25 });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    group.add(aura);

    return group;
  }

  static createGoldenSnitch() {
    const group = new THREE.Group();

    // Golden Orb Core
    const orbGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    group.add(orb);

    // Silver Feather Wings
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

    // Books on shelf
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
