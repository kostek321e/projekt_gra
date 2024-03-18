/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';


class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    preload() {
        this.load.audio('menuMusic', 'assets/music/menu_music.wav');
    }
    create() {
        this.menuMusic = this.sound.add('menuMusic', { loop: true, volume: this.registry.get('volume') });
        this.menuMusic.play();

        let sliderX = this.cameras.main.width / 2;
        let sliderY = 100;

        this.add.text(sliderX, sliderY - 30, 'Głośność', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5, 0.5);

        let sliderBar = this.add.rectangle(sliderX, sliderY, 200, 20, 0x888888);

        let handlePosition = sliderX - 100 + (this.registry.get('volume') * 200);

        let sliderHandle = this.add.rectangle(handlePosition, sliderY, 25, 35, 0xffffff).setInteractive({ cursor: 'pointer' });
        this.input.setDraggable(sliderHandle);

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            sliderHandle.x = Phaser.Math.Clamp(dragX, sliderBar.x - sliderBar.width / 2, sliderBar.x + sliderBar.width / 2);

            let volume = (sliderHandle.x - (sliderBar.x - sliderBar.width / 2)) / sliderBar.width;
            this.registry.set('volume', volume);
            this.menuMusic.setVolume(volume);
        });
        let gameStarted = this.registry.get('gameStarted');
        let buttonText = gameStarted ? 'Restart' : 'Play';
        const currentLevel = this.registry.get('currentLevel') || 'level-1'; // Używa obecnego poziomu lub domyślnie 'level-1'
        let playText = this.add.text(this.cameras.main.width - 150, this.cameras.main.height - 100, buttonText, { fontSize: '32px', fill: '#FFF' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('GameScene', { level: currentLevel }));

        let levelSelectText = this.add.text(this.cameras.main.width - 150, this.cameras.main.height - 50, 'Select Level', { fontSize: '32px', fill: '#FFF' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('LevelSelectScene'));

        let quitText = this.add.text(this.cameras.main.width - 150, this.cameras.main.height, 'Quit', { fontSize: '32px', fill: '#FFF' })
            .setInteractive()
            .on('pointerdown', () => this.game.destroy(true));

        playText.setOrigin(1, 1);
        levelSelectText.setOrigin(1, 1);
        quitText.setOrigin(1, 1);
        this.events.on('shutdown', () => {
            this.menuMusic.stop();
        });
    }
}
export default MenuScene;