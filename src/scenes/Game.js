/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';
import Hero from '../entities/Hero';
import Enemy from '../entities/Enemy';

class Game extends Phaser.Scene {
    constructor() {
        super({key: 'GameScene'});
        this.collectedDiamonds = 0;
        this.totalDiamonds = 0;
        this.remainingEnemies = 0;
        this.totalEnemies = 0;
        this.enemiesText = null;
        this.lives = 3;
    }

    preload() {
        this.load.tilemapTiledJSON('level-1', 'assets/tilemaps/level-1.json');
        this.load.tilemapTiledJSON('level-2', 'assets/tilemaps/level-2.json');

        this.load.spritesheet('world-1-sheet', 'assets/tilesets/world-1.png', {
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2,
        });
        this.load.image('clouds-sheet', 'assets/tilesets/clouds.png');
        this.load.image('heart', 'assets/collectibles/Sprite_heart.png');
        this.load.spritesheet('hero-idle-sheet', 'assets/hero/idle.png', {
            frameWidth: 32,
            frameHeight: 64,
        });
        this.load.spritesheet('dude', 'assets/enemy/dude.png', {
            frameWidth: 32, frameHeight: 48
        })
        this.load.spritesheet('hero-run-sheet', 'assets/hero/run.png', {
            frameWidth: 32,
            frameHeight: 64,
        });

        this.load.spritesheet('hero-pivot-sheet', 'assets/hero/pivot.png', {
            frameWidth: 32,
            frameHeight: 64,
        });

        this.load.spritesheet('hero-jump-sheet', 'assets/hero/jump.png', {
            frameWidth: 32,
            frameHeight: 64,
        });

        this.load.spritesheet('hero-flip-sheet', 'assets/hero/spinjump.png', {
            frameWidth: 32,
            frameHeight: 64,
        });

        this.load.spritesheet('hero-fall-sheet', 'assets/hero/fall.png', {
            frameWidth: 32,
            frameHeight: 64,
        });

        this.load.spritesheet('hero-die-sheet', 'assets/hero/bonk.png', {
            frameWidth: 32,
            frameHeight: 64,
        });
        this.load.image('leftButton', 'assets/buttons/left_arrow.png');
        this.load.image('rightButton', 'assets/buttons/right_arrow.png');
        this.load.image('jumpButton', 'assets/buttons/jump_button.png');
        this.load.image('collectableKey', 'assets/collectibles/diamond.png');
        this.load.image('enemy_icon', 'assets/collectibles/enemy_icon.png');
        this.load.audio('gameMusic', 'assets/music/game_music.wav');
        this.load.audio('stepMud', 'assets/music/step_mud.wav');
        this.load.audio('jumpSound', 'assets/music/jump.wav');
        this.load.audio('killEnemy', 'assets/music/kill_enemy.wav');
        this.load.audio('coinPickup', 'assets/music/coin_pickup.wav');
        this.load.audio('heroDeath', 'assets/music/swipe.wav');
    }

    create(data) {
        this.registry.set('gameStarted', true);
        this.collectedDiamonds = 0;
        this.lives = 3;
        const volume = this.registry.get('volume');
        let volume2;
        if(volume >= 0.1)
        {
            volume2 = volume - 0.1;
        }else{
            volume2 = volume;
        }
        this.gameMusic = this.sound.add('gameMusic', { loop: true, volume: volume2 });
        this.gameMusic.play();
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.enemyGroup = this.physics.add.group({classType: Enemy});
        const levelKey = data.level || 'level-1';
        this.levelKey2 = data.level || 'level-1';
        this.registry.set('currentLevel', this.levelKey2);
        this.anims.create({
            key: 'hero-idle',
            frames: this.anims.generateFrameNumbers('hero-idle-sheet'),
        });

        this.anims.create({
            key: 'hero-running',
            frames: this.anims.generateFrameNumbers('hero-run-sheet'),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'hero-pivoting',
            frames: this.anims.generateFrameNumbers('hero-pivot-sheet'),
        });

        this.anims.create({
            key: 'hero-jumping',
            frames: this.anims.generateFrameNumbers('hero-jump-sheet'),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'hero-flipping',
            frames: this.anims.generateFrameNumbers('hero-flip-sheet'),
            frameRate: 30,
            repeat: 0,
        });

        this.anims.create({
            key: 'hero-falling',
            frames: this.anims.generateFrameNumbers('hero-fall-sheet'),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'hero-dead',
            frames: this.anims.generateFrameNumbers('hero-die-sheet'),
        });
        this.anims.create({
            key: 'enemy-left',
            frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy-idle',
            frames: this.anims.generateFrameNumbers('dude', {start: 4, end: 4}),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy-right',
            frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
            frameRate: 8,
            repeat: -1
        });
        this.addMap(levelKey);
        if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
        //if (1 ==1 ) {
            this.createMobileControls();
            this.scale.startFullscreen();

        }

        this.addHero();
        this.createEnemy();
        this.createCollectables();
        this.createUI();
        this.updateDiamondsText();
        this.createEnemiesUI();
        this.updateEnemiesText();
        this.createEndZone();
        this.createLivesDisplay();
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
let width;
        if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
          width = 250;
        }else{
            width = 50;
        }
        const menuButton = this.add.text(this.cameras.main.width - width, this.cameras.main.height - 30, 'Menu', {
            fontSize: '32px',
            fill: '#FFF'
        })
            .setInteractive()
            .setOrigin(0.8, 0.2)
            .setScrollFactor(0)
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            });
        this.children.bringToTop(menuButton);
        this.events.on('shutdown', this.shutdown, this);
        this.events.on('pause', this.shutdown, this);

    }
    createMobileControls() {
        const leftButton = this.add.image(50, this.cameras.main.height - 30, 'leftButton').setScale(0.3).setInteractive().setScrollFactor(0);
        const rightButton = this.add.image(130, this.cameras.main.height - 30, 'rightButton').setScale(0.3).setInteractive().setScrollFactor(0);
        const jumpButton = this.add.image(this.cameras.main.width - 100, this.cameras.main.height - 30, 'jumpButton').setScale(0.25).setInteractive().setScrollFactor(0);
        leftButton.on('pointerdown', () => this.hero.moveLeft = true);
        leftButton.on('pointerup', () => this.hero.moveLeft = false);

        rightButton.on('pointerdown', () => this.hero.moveRight = true);
        rightButton.on('pointerup', () => this.hero.moveRight = false);

        jumpButton.on('pointerdown', () => this.hero.doJump = true);
        jumpButton.on('pointerup', () => this.hero.doJump = false);
    }
    createEnemiesUI() {
        this.enemiesText = this.add.text(this.cameras.main.width - 20, 10, '0/0', {
            fontSize: '32px',
            fill: '#FF0000'
        }).setScrollFactor(0).setOrigin(1, 0);
        this.enemyImage = this.add.image(this.cameras.main.width - 10, 19, 'enemy_icon').setScale(0.8).setScrollFactor(0);

    }
    createLivesDisplay() {
        this.livesText = this.add.text(40, 10, `${this.lives}`, {
            fontSize: '32px',
            fill: '#FFFFFF'
        }).setScrollFactor(0).setOrigin(0, 0);

        this.heartImage = this.add.image(25, 23, 'heart').setScale(1.5).setScrollFactor(0);
    }
    createUI() {
        this.diamondsText = this.add.text(40, 35, '0/0', {
            fontSize: '32px',
            fill: '#FFFFFF'
        }).setScrollFactor(0).setOrigin(0, 0);
        this.diamondImage = this.add.image(25, 50, 'collectableKey').setScale(1.5).setScrollFactor(0);

    }
    updateLivesDisplay() {
        this.livesText.setText(`${this.lives}`);
    }
    shutdown() {
        if (this.gameMusic) {
            this.gameMusic.stop();
        }
    }
    createEndZone() {
        const endObject = this.map.findObject("Objects", obj => obj.name === "End");

        if (endObject) {
            const endZone = this.add.zone(endObject.x, endObject.y)
                .setSize(endObject.width, endObject.height)
                .setOrigin(0, 1);

            this.physics.world.enable(endZone);
            endZone.body.setAllowGravity(false);
            endZone.body.moves = false;

            this.physics.add.overlap(this.hero, endZone, this.handleLevelCompletion, null, this);
        }
    }

    handleLevelCompletion(hero, endZone) {
        if (this.collectedDiamonds === this.totalDiamonds && this.remainingEnemies === 0) {
            console.log('Level complete!');
            this.hero.kill();
            this.collectedDiamonds = 0;
            this.updateDiamondsText();
            this.updateEnemiesText();
            if (this.levelKey2 === 'level-1') {
                this.scene.start('GameScene', {level: 'level-2'});
            } else if (this.levelKey2 === 'level-2') {
                this.scene.start('GameScene', {level: 'level-1'});
            }
        }else{
            // Wyświetlenie komunikatu
            const message = `Zbierz wszystkie diamenty i pokonaj wszystkich wrogów!`;
            const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, {
                fontSize: '15px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 },
                align: 'center'
            })
                .setScrollFactor(0)
                .setOrigin(0.5);


            this.time.delayedCall(1500, () => {
                text.destroy();
            });
        }
    }


    updateDiamondsText() {
        this.diamondsText.setText(`${this.collectedDiamonds}/${this.totalDiamonds}`);
    }
    collectItem(player, item) {
        item.disableBody(true, true);
        this.sound.play('coinPickup', { volume: this.registry.get('volume') });
        this.collectedDiamonds += 1;
        this.updateDiamondsText();
    }
    createCollectables() {
        const collectablesLayer = this.map.getObjectLayer('collectables').objects;
        this.collectables = this.physics.add.staticGroup();
        this.totalDiamonds = collectablesLayer.length;
        //this.updateDiamondsText();
        collectablesLayer.forEach(collectable => {
            const collectableSprite = this.collectables.create(collectable.x, collectable.y - collectable.height, 'collectableKey').setOrigin(0);
        });
    }
    createEnemySpawns() {
        const enemySpawnLayer = this.map.getObjectLayer('enemy_spawns');
        enemySpawnLayer.objects.forEach(spawnPoint => {
            this.createEnemy(spawnPoint.x, spawnPoint.y);
        });
    }

    handleCollisions() {
        this.physics.add.overlap(this.hero, this.collectables, this.collectItem, null, this);
        this.physics.add.collider(this.hero, this.enemies, this.handleHeroEnemyCollision, null, this);
    }

    handleHeroEnemyCollision(hero, enemy) {

        if ((hero.body.velocity.y >= 0 && hero.y < enemy.y - enemy.body.height / 2)) {
            enemy.kill();
            this.remainingEnemies--;
            this.updateEnemiesText();
        } else {
            hero.kill();
        }
    }


    createEnemy() {
        const enemySpawns = this.map.getObjectLayer('enemy_spawns').objects;
        this.enemies = this.physics.add.group({classType: Enemy, runChildUpdate: true});

        enemySpawns.forEach(spawnPoint => {
            const enemy = this.enemies.create(spawnPoint.x, spawnPoint.y, 'dude');
            enemy.setScale(0.6667);
            enemy.body.setGravityY(500);
            enemy.setCollideWorldBounds(true);
            enemy.body.setImmovable(true);
        });
        this.totalEnemies = enemySpawns.length;
        this.remainingEnemies = this.totalEnemies;
        //this.updateEnemiesText();
        this.physics.add.collider(this.enemies, this.map.getLayer('Ground').tilemapLayer);
        this.physics.add.overlap(this.enemies, this.turnPoints, (enemy, turnPoint) => {
            enemy.turnAround(); // Zakładamy, że przeciwnicy mają metodę turnAround
        });
    }
    updateEnemiesText() {
        this.enemiesText.setText(`${this.remainingEnemies}/${this.totalEnemies}`);
    }
    addHero() {
        this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y);

        this.cameras.main.startFollow(this.hero);

        this.children.moveTo(this.hero, this.children.getIndex(this.map.getLayer('Foreground').tilemapLayer));

        const groundCollider = this.physics.add.collider(this.hero, this.map.getLayer('Ground').tilemapLayer);

        const spikesCollider = this.physics.add.overlap(this.hero, this.spikeGroup, () => {
            this.hero.kill();
        });

        this.hero.on('died', () => {
            groundCollider.destroy();
            spikesCollider.destroy();
            this.hero.body.setCollideWorldBounds(false);
            this.cameras.main.stopFollow();
        });
    }

    addMap(levelKey) {

        this.map = this.make.tilemap({key: levelKey});
        const groundTiles = this.map.addTilesetImage('world-1', 'world-1-sheet');
        const backgroundTiles = this.map.addTilesetImage('clouds', 'clouds-sheet');

        const backgroundLayer = this.map.createStaticLayer('Background', backgroundTiles);
        backgroundLayer.setScrollFactor(0.6);
        const turnPointsObjects = this.map.getObjectLayer('turnpoints').objects;
        this.turnPoints = this.physics.add.staticGroup();
        turnPointsObjects.forEach(pointObj => {
            if (pointObj.name === "TurnPoint") {
                let turnPoint = this.turnPoints.create(pointObj.x + pointObj.width * 0.5, pointObj.y + pointObj.height * 0.5);
                turnPoint.setVisible(false);
          }
        });
        const groundLayer = this.map.createStaticLayer('Ground', groundTiles);
        groundLayer.setCollision([1, 2, 4], true);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBoundsCollision(true, true, false, true);

        this.spikeGroup = this.physics.add.group({immovable: true, allowGravity: false});
        this.map.getObjectLayer('enemy_spawns');
        this.map.getObjectLayer('Objects').objects.forEach(object => {
            if (object.name === 'Start') {
                this.spawnPos = {x: object.x, y: object.y};
            }
            if (object.gid === 7) {
                const spike = this.spikeGroup.create(object.x, object.y, 'world-1-sheet', object.gid - 1);
                spike.setOrigin(0, 1);
                spike.setSize(object.width - 10, object.height - 10);
                spike.setOffset(5, 10);
            }
        });

        this.map.createStaticLayer('Foreground', groundTiles);


    }

    update(time, delta) {
        const cameraBottom = this.cameras.main.getWorldPoint(0, this.cameras.main.height).y;
        this.handleCollisions();

        if (this.hero.isDead() && this.hero.getBounds().top > cameraBottom + 100) {
            this.lives -= 1;
            this.updateLivesDisplay();
            if (this.lives > 0) {
                this.hero.destroy();
                this.addHero();
                this.createEndZone();
            }else{
                this.lives = 3;
                this.updateLivesDisplay();
                this.hero.destroy();
                this.addHero();
                this.createEndZone();
                this.enemies.clear(true);
                this.createEnemy();
                this.collectables.clear(true);
                this.createCollectables();
                this.collectedDiamonds = 0;
                this.updateDiamondsText();
                this.updateEnemiesText();
            }
        }
        this.enemies.getChildren().forEach(enemy => {
            enemy.update();
        });
    }
}

export default Game;