/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';
import collidable from '../mixins/collidable';
import initAnims from '../mixins/enemyAnims';

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'dude');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Mixins
        Object.assign(this, collidable);
        this.init();
        this.direction = -1;
        this.distanceMoved = 0; // Dodanie nowej właściwości śledzącej przebytą odległość
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

        // Ustaw kierunek i prędkość początkową tylko raz
        this.direction = -1; // -1 dla lewo, 1 dla prawo
        this.body.setVelocityX(this.speed * this.direction);
    }

    turnAround() {
        this.moving = false; // Przeciwnik przestaje się ruszać
        this.body.setVelocityX(0); // Zatrzymujemy przeciwnika
        if (this.turnAroundTimer) {
            this.turnAroundTimer.remove(); // Usuń poprzednie opóźnienie, jeśli istnieje
        }
        // Ustawiamy opóźnienie, po którym przeciwnik zmieni kierunek i ruszy
        this.turnAroundTimer = this.scene.time.delayedCall(2000, () => {
            this.distanceMoved = 0; // Resetujemy dystans przy zmianie kierunku
            this.direction *= -1; // Zmieniamy kierunek ruchu
            this.body.setVelocityX(this.speed * this.direction); // Ruszamy w nowym kierunku
            this.moving = true; // Przeciwnik znów się rusza
        });
    }

    update() {
        if (!this.active) {
            return;
        }

        if (this.moving) {
            this.body.setVelocityX(this.speed * this.direction);

            // Jeśli przeciwnik przemieści się o określony dystans
            this.distanceMoved += Math.abs(this.body.deltaX());
            if (this.distanceMoved >= 300) { // Przykładowy dystans
                this.distanceMoved = 0; // Reset dystansu
                this.moving = false; // Zatrzymaj ruch przeciwnika
                this.body.setVelocityX(0);

                // Zastosuj opóźnienie przed zmianą kierunku
                if (this.turnAroundTimer) {
                    this.turnAroundTimer.remove();
                }
                this.turnAroundTimer = this.scene.time.delayedCall(2000, () => {
                    this.direction *= -1; // Zmień kierunek ruchu
                    this.moving = true; // Wznowienie ruchu
                });
            }
        }

        // Odtwarzanie animacji na podstawie kierunku ruchu
        if (this.moving) {
            if (this.direction > 0) {
                console.log('Odtwarzanie animacji enemy-right');
                this.anims.play('enemy-right', true);
            } else {
                console.log('Odtwarzanie animacji enemy-left');
                this.anims.play('enemy-left', true);
            }
        } else {
            console.log('Odtwarzanie animacji enemy-idle');
            this.anims.play('enemy-idle', true);
        }
    }

    kill() {
        this.setTint(0xff0000);
        this.setVelocity(0, -200);
        this.body.checkCollision.none = true;
        this.setCollideWorldBounds(false);

        if (this.turnAroundTimer) {
            this.turnAroundTimer.remove(); // Usuń zdarzenie, aby nie próbowało aktualizować stanu tego wroga
            this.turnAroundTimer = null; // Zresetuj timer do stanu początkowego
        }
        //
        // this.setActive(false);
        // this.setVisible(false);
        // this.body.stop(); // Zatrzymaj wszelki ruch ciała
        // this.destroy(); // Ostatecznie zniszcz obiekt, aby uniknąć dalszych aktualizacji
    }
}


export default Enemy;