import * as THREE from 'three';
import { CharacterDef, CharacterId, WeaponId } from '../types/game.ts';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  rex: {
    id: 'rex',
    name: 'Rex - Soldado Cyber',
    role: 'Asalto Táctico',
    color: 0x06b6d4, // Cyan
    armorColor: 0x1e293b,
    speed: 0.11,
    maxHp: 100,
    bonus: 'Equilibrado · +15% Daño',
    portrait: '🛡️'
  },
  viper: {
    id: 'viper',
    name: 'Viper - Operativo Sombra',
    role: 'Infiltrador Ágil',
    color: 0xef4444, // Red
    armorColor: 0x0f172a,
    speed: 0.14,
    maxHp: 80,
    bonus: '+28% Velocidad de Desplazamiento',
    portrait: '⚡'
  },
  titan: {
    id: 'titan',
    name: 'Titan - Exotraje Pesado',
    role: 'Tanque Blindado',
    color: 0xf59e0b, // Amber Gold
    armorColor: 0x451a03,
    speed: 0.085,
    maxHp: 160,
    bonus: '+60% Puntos de Salud y Blindaje',
    portrait: '🦾'
  },
  aria: {
    id: 'aria',
    name: 'Aria - Androide Cuántica',
    role: 'Especialista en Energía',
    color: 0xc084fc, // Neon Violet
    armorColor: 0x3b0764,
    speed: 0.115,
    maxHp: 90,
    bonus: '+50% Capacidad y Recarga Instantánea',
    portrait: '🔮'
  }
};

export interface CharacterMeshGroup extends THREE.Group {
  leftLeg?: THREE.Mesh;
  rightLeg?: THREE.Mesh;
  leftArm?: THREE.Mesh;
  rightArm?: THREE.Mesh;
  weaponMesh?: THREE.Group;
  visor?: THREE.Mesh;
}

export function createPlayerMesh(charDef: CharacterDef, weaponId: WeaponId): CharacterMeshGroup {
  const group = new THREE.Group() as CharacterMeshGroup;

  // Materials
  const armorMat = new THREE.MeshStandardMaterial({
    color: charDef.armorColor,
    roughness: 0.35,
    metalness: 0.7
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: charDef.color,
    emissive: charDef.color,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.8
  });

  const visorMat = new THREE.MeshBasicMaterial({
    color: charDef.color
  });

  // 1. Torso
  const torsoGeo = new THREE.BoxGeometry(0.55, 0.7, 0.35);
  const torso = new THREE.Mesh(torsoGeo, armorMat);
  torso.position.y = 1.05;
  group.add(torso);

  // Chest plate accent
  const chestGeo = new THREE.BoxGeometry(0.42, 0.35, 0.1);
  const chest = new THREE.Mesh(chestGeo, accentMat);
  chest.position.set(0, 1.15, 0.16);
  group.add(chest);

  // 2. Head & Helmet
  const headGeo = new THREE.BoxGeometry(0.32, 0.35, 0.34);
  const head = new THREE.Mesh(headGeo, armorMat);
  head.position.y = 1.62;
  group.add(head);

  // Glowing Visor
  const visorGeo = new THREE.BoxGeometry(0.26, 0.1, 0.08);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 1.62, 0.16);
  group.add(visor);
  group.visor = visor;

  // 3. Shoulders
  const shoulderGeo = new THREE.BoxGeometry(0.2, 0.18, 0.28);
  const leftShoulder = new THREE.Mesh(shoulderGeo, accentMat);
  leftShoulder.position.set(-0.38, 1.3, 0);
  group.add(leftShoulder);

  const rightShoulder = new THREE.Mesh(shoulderGeo, accentMat);
  rightShoulder.position.set(0.38, 1.3, 0);
  group.add(rightShoulder);

  // 4. Arms
  const armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);
  const leftArm = new THREE.Mesh(armGeo, armorMat);
  leftArm.position.set(-0.36, 1.0, 0.1);
  leftArm.rotation.x = -0.3;
  group.add(leftArm);
  group.leftArm = leftArm;

  const rightArm = new THREE.Mesh(armGeo, armorMat);
  rightArm.position.set(0.36, 1.0, 0.2);
  rightArm.rotation.x = -0.7; // Aiming forward
  group.add(rightArm);
  group.rightArm = rightArm;

  // 5. Legs
  const legGeo = new THREE.BoxGeometry(0.18, 0.7, 0.2);
  const leftLeg = new THREE.Mesh(legGeo, armorMat);
  leftLeg.position.set(-0.16, 0.35, 0);
  group.add(leftLeg);
  group.leftLeg = leftLeg;

  const rightLeg = new THREE.Mesh(legGeo, armorMat);
  rightLeg.position.set(0.16, 0.35, 0);
  group.add(rightLeg);
  group.rightLeg = rightLeg;

  // 6. In-Hand Weapon Mesh
  const weaponMesh = createWeaponMesh(weaponId);
  weaponMesh.position.set(0.28, 1.05, 0.45);
  weaponMesh.rotation.y = 0;
  group.add(weaponMesh);
  group.weaponMesh = weaponMesh;

  return group;
}

export function createWeaponMesh(weaponId: WeaponId): THREE.Group {
  const g = new THREE.Group();

  const gunMetal = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.9
  });

  let glowColor = 0x06b6d4;
  if (weaponId === 'shotgun') glowColor = 0xf97316;
  if (weaponId === 'rocket') glowColor = 0xef4444;
  if (weaponId === 'railgun') glowColor = 0xa855f7;

  const glowMat = new THREE.MeshBasicMaterial({ color: glowColor });

  if (weaponId === 'blaster') {
    // Sleek plasma pistol
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.4), gunMetal);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25), glowMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, 0.22);
    g.add(body, barrel);
  } else if (weaponId === 'shotgun') {
    // Heavy dual-barrel scattergun
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.55), gunMetal);
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35), gunMetal);
    b1.rotation.x = Math.PI / 2;
    b1.position.set(-0.04, 0.04, 0.3);
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35), gunMetal);
    b2.rotation.x = Math.PI / 2;
    b2.position.set(0.04, 0.04, 0.3);
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.3), glowMat);
    light.position.set(0, 0.08, 0);
    g.add(body, b1, b2, light);
  } else if (weaponId === 'rocket') {
    // Bulky cylindrical rocket launcher
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 12), gunMetal);
    tube.rotation.x = Math.PI / 2;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12), glowMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = 0.25;
    g.add(tube, ring);
  } else {
    // Futuristic angular Railgun
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.65), gunMetal);
    const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.6), glowMat);
    railTop.position.set(0, 0.1, 0.1);
    const railBottom = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.6), glowMat);
    railBottom.position.set(0, -0.06, 0.1);
    g.add(body, railTop, railBottom);
  }

  return g;
}
