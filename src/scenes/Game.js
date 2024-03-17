/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';
import Hero from '../entities/Hero';
import Enemy from '../entities/Enemy';
import initAnims from '../mixins/enemyAnims';

class Game extends Phaser.Scene {
    constructor() {
        super({key: 'GameScene'});
    }

    preload() {
        this.load.tilemapTiledJSON('level-1', 'assets/tilemaps/level-1.json');

        this.load.spritesheet('world-1-sheet', 'assets/tilesets/world-1.png', {
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2,
        });
        this.load.image('clouds-sheet', 'assets/tilesets/clouds.png');

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
    }

    create(data) {

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.enemyGroup = this.physics.add.group({classType: Enemy}); // Utwórz grupę wrogów

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
        this.addMap();

        this.addHero();
        this.createEnemy();
        //initAnims(this.anims);
        //this.createEnemySpawns();
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    }

    createEnemySpawns() {
        // Znajdź warstwę "enemy_spawns"
        const enemySpawnLayer = this.map.getObjectLayer('enemy_spawns');
        // Przeiteruj po każdym obiekcie w warstwie
        enemySpawnLayer.objects.forEach(spawnPoint => {
            this.createEnemy(spawnPoint.x, spawnPoint.y);
        });
    }

    handleCollisions() {
        this.physics.add.collider(this.hero, this.enemies, this.handleHeroEnemyCollision, null, this);
    }

    handleHeroEnemyCollision(hero, enemy) {

        if ((hero.body.velocity.y >= 0 && hero.y < enemy.y - enemy.body.height / 2)) {
            enemy.kill(); // Zabij przeciwnika
        } else {
            hero.kill(); // Zabij bohatera
        }
    }

    // createEnemy() {
    //   //return new Enemy(this, 200, 200);
    //   this.enemy = new Enemy(this, 200, 200);
    //   this.enemy.setScale(0.6667);
    //
    // }
    // createEnemy(x, y) {
    //   const enemy = new Enemy(this, x, y); // Przekazanie pozycji x, y
    //   enemy.setScale(0.6667); // Skalowanie, jeśli jest potrzebne
    //   enemy.setImmovable(true); // Zapobieganie przesuwaniu się przez gracza
    //   this.enemyGroup.add(enemy); // Dodajemy wroga do grupy, jeśli używamy grupy
    // }
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

        this.physics.add.collider(this.enemies, this.map.getLayer('Ground').tilemapLayer);
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

    addMap() {

        this.map = this.make.tilemap({key: 'level-1'});
        const groundTiles = this.map.addTilesetImage('world-1', 'world-1-sheet');
        const backgroundTiles = this.map.addTilesetImage('clouds', 'clouds-sheet');

        const backgroundLayer = this.map.createStaticLayer('Background', backgroundTiles);
        backgroundLayer.setScrollFactor(0.6);

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

        // const debugGraphics = this.add.graphics();
        // groundLayer.renderDebug(debugGraphics);

    }

    update(time, delta) {
        const cameraBottom = this.cameras.main.getWorldPoint(0, this.cameras.main.height).y;
        this.handleCollisions();

        if (this.hero.isDead() && this.hero.getBounds().top > cameraBottom + 100) {
            this.hero.destroy();
            this.addHero();
            this.enemies.clear(true);
            this.createEnemy();
        }
        this.enemies.getChildren().forEach(enemy => {
            enemy.update();
        });
    }
}

export default Game;