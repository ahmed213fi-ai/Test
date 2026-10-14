import { W, H } from '../config/constants.js';

function make(scene, key, w, h, draw) {
  const g = scene.make.graphics({ add: false });
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function stars(scene, key, count, size, alpha) {
  make(scene, key, W, H, (g) => {
    g.fillStyle(0xffffff, alpha);
    for (let i = 0; i < count; i++) {
      g.fillRect(Phaser.Math.Between(0, W - 1), Phaser.Math.Between(0, H - 1), size, size);
    }
  });
}

export function createTextures(scene) {
  make(scene, 'player', 48, 48, (g) => {
    const cx = 24, cy = 24;
    g.fillStyle(0x1a5c8a);
    g.fillRoundedRect(cx - 12, cy + 4, 24, 14, 6);
    g.fillStyle(0x2a8fd8);
    g.fillRoundedRect(cx - 10, cy + 2, 20, 10, 5);
    g.fillStyle(0x00ffff);
    g.fillEllipse(cx, cy - 4, 8, 10);
    g.fillStyle(0x0088ff);
    g.fillEllipse(cx, cy - 2, 6, 6);
    g.fillStyle(0x00ddff);
    g.fillRect(cx - 18, cy + 8, 12, 6);
    g.fillRect(cx + 6, cy + 8, 12, 6);
    g.fillStyle(0xff4400);
    g.fillRect(cx - 6, cy + 14, 12, 4);
    g.fillStyle(0xff8800);
    g.fillRect(cx - 4, cy + 16, 8, 4);
    for (let i = 0; i < 3; i++) {
      g.fillStyle(Phaser.Math.Between(0xff4400, 0xffaa00));
      g.fillRect(cx - 16 + i * 4, cy + 18, 2, Phaser.Math.Between(2, 6));
    }
  });

  make(scene, 'alienA', 40, 40, (g) => {
    g.fillStyle(0x00ffcc);
    g.fillEllipse(20, 16, 28, 16);
    g.fillStyle(0x00ccaa);
    g.fillEllipse(20, 18, 24, 12);
    g.fillStyle(0xff3366);
    g.fillEllipse(12, 14, 6, 6);
    g.fillEllipse(28, 14, 6, 6);
    g.fillStyle(0xff0033);
    g.fillEllipse(12, 14, 3, 3);
    g.fillEllipse(28, 14, 3, 3);
    g.fillStyle(0x00ffcc);
    g.fillRect(8, 22, 6, 10);
    g.fillRect(26, 22, 6, 10);
    g.fillRect(14, 26, 12, 4);
  });

  make(scene, 'alienB', 40, 40, (g) => {
    g.fillStyle(0xffcc00);
    g.fillEllipse(20, 18, 30, 18);
    g.fillStyle(0xffaa00);
    g.fillEllipse(20, 20, 26, 14);
    g.fillStyle(0xff4400);
    g.fillEllipse(13, 16, 8, 8);
    g.fillEllipse(27, 16, 8, 8);
    g.fillStyle(0xff0000);
    g.fillEllipse(13, 16, 4, 4);
    g.fillEllipse(27, 16, 4, 4);
    g.fillStyle(0xffcc00);
    g.fillRect(6, 26, 8, 10);
    g.fillRect(26, 26, 8, 10);
    g.fillRect(14, 30, 12, 6);
    g.fillStyle(0xff8800);
    g.fillRect(16, 32, 8, 4);
  });

  make(scene, 'alienC', 48, 48, (g) => {
    g.fillStyle(0xff33aa);
    g.fillRoundedRect(8, 12, 32, 20, 8);
    g.fillStyle(0xcc0088);
    g.fillRoundedRect(10, 14, 28, 16, 6);
    g.fillStyle(0xff66cc);
    g.fillEllipse(18, 18, 10, 10);
    g.fillEllipse(30, 18, 10, 10);
    g.fillStyle(0xff0066);
    g.fillEllipse(18, 18, 5, 5);
    g.fillEllipse(30, 18, 5, 5);
    g.fillStyle(0xff33aa);
    g.fillRect(4, 28, 10, 14);
    g.fillRect(34, 28, 10, 14);
    g.fillRect(14, 34, 20, 8);
    g.fillStyle(0x00ffff);
    g.fillRect(18, 36, 4, 6);
    g.fillRect(26, 36, 4, 6);
  });

  make(scene, 'boss', 64, 64, (g) => {
    g.fillStyle(0x8800ff);
    g.fillEllipse(32, 28, 50, 30);
    g.fillStyle(0x6600cc);
    g.fillEllipse(32, 30, 44, 24);
    g.fillStyle(0xaa00ff);
    g.fillEllipse(20, 22, 14, 14);
    g.fillEllipse(44, 22, 14, 14);
    g.fillStyle(0xff0088);
    g.fillEllipse(20, 22, 7, 7);
    g.fillEllipse(44, 22, 7, 7);
    g.fillStyle(0x8800ff);
    g.fillRect(6, 38, 14, 20);
    g.fillRect(44, 38, 14, 20);
    g.fillRect(16, 46, 32, 12);
    g.fillStyle(0x00ffff);
    for (let i = 0; i < 4; i++) {
      g.fillRect(12 + i * 10, 42, 6, 4);
    }
  });

  make(scene, 'bullet', 8, 20, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 20);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#00ffff');
    grad.addColorStop(1, '#0088ff');
    g.fillStyle(0x00ffff);
    g.fillRoundedRect(2, 0, 4, 18, 2);
    g.fillStyle(0xffffff);
    g.fillRoundedRect(3, 2, 2, 14, 1);
  });

  make(scene, 'laser', 6, 36, (g) => {
    g.fillStyle(0xff00ff);
    g.fillRoundedRect(1, 0, 4, 34, 2);
    g.fillStyle(0xff88ff);
    g.fillRoundedRect(2, 2, 2, 30, 1);
  });

  make(scene, 'missile', 14, 24, (g) => {
    g.fillStyle(0xffaa00);
    g.fillTriangle(7, 0, 4, 8, 10, 8);
    g.fillRect(3, 8, 8, 14);
    g.fillStyle(0xff6600);
    g.fillRect(1, 10, 4, 10);
    g.fillRect(9, 10, 4, 10);
    g.fillStyle(0xff4400);
    g.fillRect(5, 20, 4, 4);
  });

  make(scene, 'coin', 16, 16, (g) => {
    g.fillStyle(0xffd700);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffaa00);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0xffdd44);
    g.fillCircle(8, 8, 4);
    g.fillStyle(0xffff88);
    g.fillCircle(6, 6, 2);
  });

  make(scene, 'powerup_shield', 20, 20, (g) => {
    g.fillStyle(0x0088ff, 0.3);
    g.fillCircle(10, 10, 10);
    g.fillStyle(0x00aaff);
    g.strokeCircle(10, 10, 9);
    g.fillStyle(0x00ffff);
    g.fillCircle(10, 10, 5);
  });

  make(scene, 'powerup_rapid', 20, 20, (g) => {
    g.fillStyle(0xff8800, 0.3);
    g.fillCircle(10, 10, 10);
    g.fillStyle(0xffaa00);
    g.strokeCircle(10, 10, 9);
    g.fillStyle(0xffff00);
    g.fillRect(6, 4, 8, 3);
    g.fillRect(6, 8, 8, 3);
    g.fillRect(6, 12, 8, 3);
  });

  make(scene, 'powerup_spread', 20, 20, (g) => {
    g.fillStyle(0x00ff88, 0.3);
    g.fillCircle(10, 10, 10);
    g.fillStyle(0x00ffaa);
    g.strokeCircle(10, 10, 9);
    g.fillStyle(0x44ff88);
    // Diamond shape using fillTriangle calls
    g.fillTriangle(10, 4, 16, 10, 10, 10);
    g.fillTriangle(10, 4, 10, 10, 4, 10);
    g.fillTriangle(10, 16, 16, 10, 10, 10);
    g.fillTriangle(10, 16, 10, 10, 4, 10);
  });

  make(scene, 'powerup_life', 20, 20, (g) => {
    g.fillStyle(0xff0044, 0.3);
    g.fillCircle(10, 10, 10);
    g.fillStyle(0xff3366);
    g.strokeCircle(10, 10, 9);
    g.fillStyle(0xff4488);
    // Simple heart using circles and triangle
    g.fillCircle(7, 7, 5);
    g.fillCircle(13, 7, 5);
    g.fillTriangle(4, 10, 10, 18, 16, 10);
  });

  make(scene, 'spark', 6, 6, (g) => {
    g.fillStyle(0xffaa00);
    g.fillRect(0, 0, 6, 6);
  });

  make(scene, 'explosion', 32, 32, (g) => {
    g.fillStyle(0xff8800);
    g.fillCircle(16, 16, 16);
    g.fillStyle(0xffaa00);
    g.fillCircle(16, 16, 12);
    g.fillStyle(0xffcc00);
    g.fillCircle(16, 16, 8);
    g.fillStyle(0xffff00);
    g.fillCircle(16, 16, 4);
  });

  make(scene, 'alienBullet', 8, 16, (g) => {
    g.fillStyle(0xff3333);
    g.fillRoundedRect(2, 0, 4, 14, 2);
    g.fillStyle(0xff8888);
    g.fillRoundedRect(3, 2, 2, 10, 1);
  });

  stars(scene, 'stars_far', 80, 1, 0.4);
  stars(scene, 'stars_mid', 40, 2, 0.6);
  stars(scene, 'stars_near', 20, 3, 0.9);

  make(scene, 'nebula', W, H, (g) => {
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const r = Phaser.Math.Between(80, 150);
      const color = Phaser.Math.RND.pick([0x440088, 0x004488, 0x880044, 0x008844]);
      g.fillStyle(color, 0.08);
      g.fillCircle(x, y, r);
    }
  });
}