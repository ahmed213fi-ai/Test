import { createTextures } from '../systems/TextureFactory.js';
import { Save } from '../systems/SaveManager.js';

// Runs once: builds textures and loads the save. Restarting a game never re-runs this.
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    Save.load();
    createTextures(this);
    this.scene.start('MainMenuScene');
  }
}
