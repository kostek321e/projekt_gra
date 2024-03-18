/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';
import collidable from '../mixins/collidable';

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'dude');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Mixins
        Object.assign(this, collidable);
        this.init();
        this.direction = -1;
        this.distanceMoved = 0;
        this.moving = true;
        this.turnAroundTimer = null
    }

    init() {
        this.gravity = 500;
        this.speed = 50;

        this.body.setGravityY(this.gravity);
        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1);
        this.body.setImmovable(true);

        this.direction = -1; // -1 dla lewo, 1 dla prawo
        this.body.setVelocityX(this.speed * this.direction);
    }

    // turnAround() {
    //     this.moving = false;
    //     this.body.setVelocityX(0);
    //     if (this.turnAroundTimer) {
    //         this.turnAroundTimer.remove();
    //     }
    //
    //     this.turnAroundTimer = this.scene.time.delayedCall(2000, () => {
    //         this.distanceMoved = 0;
    //         this.direction *= -1;
    //         this.body.setVelocityX(this.speed * this.direction);
    //         this.moving = true;
    //     });
    // }

    update() {
        if (!this.active) {
            return;
        }

        if (this.moving) {
            this.body.setVelocityX(this.speed * this.direction);

            // this.distanceMoved += Math.abs(this.body.deltaX());
            // if (this.distanceMoved >= 300) {
            //     this.distanceMoved = 0;
            //     this.moving = false;
            //     this.body.setVelocityX(0);
            //
            //     if (this.turnAroundTimer) {
            //         this.turnAroundTimer.remove();
            //     }
            //     this.turnAroundTimer = this.scene.time.delayedCall(2000, () => {
            //         this.direction *= -1;
            //         this.moving = true;
            //     });
            // }
        }

        if (this.moving) {
            if (this.direction > 0) {
                this.anims.play('enemy-right', true);
            } else {
                this.anims.play('enemy-left', true);
            }
        } else {
            this.anims.play('enemy-idle', true);
        }
    }
    turnAround() {
        this.direction *= -1; // Zmiana kierunku na przeciwny
        this.body.setVelocityX(this.speed * this.direction); // Zaktualizuj prędkość, aby przeciwnik poruszał się w nowym kierunku
    }
    kill() {
        this.setTint(0xff0000);
        this.setVelocity(0, -200);
        this.body.checkCollision.none = true;
        this.scene.sound.play('killEnemy', { volume: this.scene.registry.get('volume') });

        this.setCollideWorldBounds(false);
        if (this.turnAroundTimer) {
            this.turnAroundTimer.remove();
            this.turnAroundTimer = null;
        }

    }
}


export default Enemy;