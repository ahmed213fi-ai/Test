import { getWeapon } from '../config/weapons.js';
import { Save } from './SaveManager.js';

export default class WeaponSystem {
  constructor(bulletGroup) {
    this.group = bulletGroup;
    this.cooldown = 0;
    this.weapon = getWeapon(Save.data.equipped);
  }

  setWeapon(id) {
    this.weapon = getWeapon(id);
    this.cooldown = 0;
  }

  update(dtMs, shooter, wantsFire) {
    this.cooldown -= dtMs;
    if (!wantsFire || this.cooldown > 0) return false;
    this.fire(shooter);
    const baseCooldown = this.weapon.cooldown;
    const rapidMult = shooter.hasPowerup('rapid') ? 0.5 : 1;
    const spreadMult = shooter.hasPowerup('spread') ? 1.2 : 1;
    this.cooldown = baseCooldown * rapidMult * spreadMult;
    return true;
  }

  fire(shooter) {
    const w = this.weapon;
    const x = shooter.x;
    const y = shooter.y - 20;
    const count = shooter.hasPowerup('spread') && w.count === 1 ? 3 : w.count;
    const spreadDeg = shooter.hasPowerup('spread') && w.count === 1 ? 15 : w.spreadDeg;

    for (let i = 0; i < count; i++) {
      const bullet = this.group.get(x, y);
      if (!bullet) break;
      const angle = Phaser.Math.DegToRad((i - (count - 1) / 2) * spreadDeg);
      bullet.fire(x, y, Math.sin(angle) * w.speed, -Math.cos(angle) * w.speed, {
        texture: w.texture,
        tint: w.tint,
        damage: w.damage,
        pierce: w.pierce,
        homing: w.homing,
        lifetime: w.lifetime,
        isPlayerBullet: true,
      });
    }
  }
}