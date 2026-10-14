import { W, H } from './config/constants.js';
import { Save } from './systems/SaveManager.js';
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import ArmoryScene from './scenes/ArmoryScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import PauseScene from './scenes/PauseScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#000010',
  pixelArt: true,
  input: { activePointers: 2 },
  physics: {
    default: 'arcade',
    // open the game with ?debug to see hitboxes
    arcade: { debug: new URLSearchParams(window.location.search).has('debug') },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, MainMenuScene, ArmoryScene, SettingsScene, GameScene, GameOverScene, PauseScene],
});

// Mobile browsers may kill the tab without warning: flush progress when the page is hidden.
const flush = () => Save.save();
window.addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
