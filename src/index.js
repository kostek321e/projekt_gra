/// <reference path="../typings/phaser.d.ts" />
import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';
import MenuScene from './scenes/MenuScene';
import LevelSelectScene from './scenes/LevelSelectScene';

window.gameSettings = {
  volume: 0.5,
};

const gameConfig = Object.assign(config, {
  scene: [MenuScene, GameScene, LevelSelectScene],
  callbacks: {
    preBoot: (game) => {
      game.registry.set('volume', 0.5);
    }
  }
});

const game = new Phaser.Game(gameConfig);

window.updateVolume = (newVolume) => {
  window.gameSettings.volume = newVolume;

  if (game.scene.keys.Game && game.scene.keys.Game.gameMusic) {
    game.scene.keys.Game.gameMusic.setVolume(newVolume);
  }

  if (game.scene.keys.MenuScene && game.scene.keys.MenuScene.menuMusic) {
    game.scene.keys.MenuScene.menuMusic.setVolume(newVolume);
  }

};