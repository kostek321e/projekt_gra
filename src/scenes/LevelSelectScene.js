/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';


class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }
    preload() {
        this.load.audio('menuMusic', 'assets/music/menu_music.wav');
    }
    create() {
        this.menuMusic = this.sound.add('menuMusic', { loop: true, volume: this.registry.get('volume') });
        this.menuMusic.play();
        let level1Text = this.add.text(100, 100, 'Level 1', { fontSize: '32px', fill: '#FFF' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('GameScene', { level: 'level-1' }));

        let level2Text = this.add.text(100, 150, 'Level 2', { fontSize: '32px', fill: '#FFF' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('GameScene', { level: 'level-2' }));

        let backButton = this.add.text(this.cameras.main.width - 100, this.cameras.main.height - 50, 'Back', { fontSize: '32px', fill: '#FFF' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('MenuScene'));
        this.events.on('shutdown', () => {
            this.menuMusic.stop();
        });
    }
}
export default LevelSelectScene;