class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // Add player to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set player properties
        this.setSize(32, 32).setOffset(8, 16);
        this.setCollideWorldBounds(true);
        this.setDepth(5);
        
        // Player state
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 160;
        this.isAttacking = false;
        this.isInvulnerable = false;
        this.direction = 'down'; // down, up, left, right
        this.score = 0;
        
        // Sound effects
        this.slashSound = scene.sound.add('sword-slash', { volume: 0.4 });
    }

    update(cursors, attackKey) {
        if (this.isDead) return;
        
        // Handle movement
        this.handleMovement(cursors);
        
        // Handle attack
        if (attackKey.isDown && !this.isAttacking) {
            this.attack();
        }
    }

    handleMovement(cursors) {
        // Reset velocity
        this.body.setVelocity(0);
        
        // Don't allow movement while attacking
        if (this.isAttacking) return;
        
        // Horizontal movement
        if (cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
            this.direction = 'left';
            this.anims.play('player-walk-left', true);
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
            this.direction = 'right';
            this.anims.play('player-walk-right', true);
        }
        
        // Vertical movement
        if (cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
            // Only change direction and animation if not moving horizontally
            if (!cursors.left.isDown && !cursors.right.isDown) {
                this.direction = 'up';
                this.anims.play('player-walk-up', true);
            }
        } else if (cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
            // Only change direction and animation if not moving horizontally
            if (!cursors.left.isDown && !cursors.right.isDown) {
                this.direction = 'down';
                this.anims.play('player-walk-down', true);
            }
        }
        
        // Normalize velocity for diagonal movement
        this.body.velocity.normalize().scale(this.speed);
        
        // If no keys are pressed, show idle animation
        if (!cursors.left.isDown && !cursors.right.isDown && 
            !cursors.up.isDown && !cursors.down.isDown) {
            // Use the idle animation that matches the last direction
            switch (this.direction) {
                case 'up': 
                    this.anims.play('player-walk-up', true).pause();
                    break;
                case 'down': 
                    this.anims.play('player-walk-down', true).pause();
                    break;
                case 'left': 
                    this.anims.play('player-walk-left', true).pause();
                    break;
                case 'right': 
                    this.anims.play('player-walk-right', true).pause();
                    break;
            }
        }
    }

    attack() {
        this.isAttacking = true;
        this.slashSound.play();
        
        // Play attack animation
        this.anims.play('player-attack');
        
        // Set attacking flag during animation
        this.on('animationstart', () => {
            this.isAttacking = true;
            
            // Create the attack hitbox based on player's direction
            this.createAttackHitbox();
        });
        
        // Clear attacking flag when animation completes
        this.on('animationcomplete', () => {
            this.isAttacking = false;
            
            // Remove the attack hitbox
            if (this.attackHitbox) {
                this.attackHitbox.destroy();
                this.attackHitbox = null;
            }
        });
    }
    
    createAttackHitbox() {
        // Create a hitbox in front of the player based on facing direction
        const hitboxSize = 40;
        let offsetX = 0;
        let offsetY = 0;
        
        // Position the hitbox based on player direction
        switch (this.direction) {
            case 'up':
                offsetY = -hitboxSize;
                break;
            case 'down':
                offsetY = hitboxSize;
                break;
            case 'left':
                offsetX = -hitboxSize;
                break;
            case 'right':
                offsetX = hitboxSize;
                break;
        }
        
        // Create the hitbox as a physics body
        this.attackHitbox = this.scene.physics.add.sprite(
            this.x + offsetX, 
            this.y + offsetY, 
            null
        );
        
        // Set up the hitbox
        this.attackHitbox.setSize(hitboxSize, hitboxSize);
        this.attackHitbox.visible = false;
        
        // Set up overlap with enemies
        this.scene.physics.add.overlap(
            this.attackHitbox,
            this.scene.enemies,
            this.handleAttackCollision,
            null,
            this
        );
    }
    
    handleAttackCollision(attackHitbox, enemy) {
        // Make sure we don't hit the same enemy multiple times with one attack
        if (!this.hitEnemies) {
            this.hitEnemies = new Set();
        }
        
        if (!this.hitEnemies.has(enemy)) {
            enemy.takeDamage();
            this.hitEnemies.add(enemy);
            
            // Play hit effect
            const hitEffect = this.scene.add.sprite(enemy.x, enemy.y, 'hit-effect');
            hitEffect.setDepth(10).setScale(0.5);
            hitEffect.play('hit-effect');
            hitEffect.once('animationcomplete', () => {
                hitEffect.destroy();
            });
            
            // Clear the hit enemies set after the attack animation completes
            this.once('animationcomplete', () => {
                this.hitEnemies.clear();
            });
        }
    }

    takeDamage() {
        if (this.isInvulnerable) return;
        
        // Reduce health
        this.health -= 10;
        
        // Check if player died
        if (this.health <= 0) {
            this.die();
            return;
        }
        
        // Flash effect to show damage
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.5, to: 1 },
            duration: 100,
            repeat: 5
        });
        
        // Make player invulnerable for a short time
        this.isInvulnerable = true;
        this.scene.time.delayedCall(1000, () => {
            this.isInvulnerable = false;
        });
    }

    die() {
        this.isDead = true;
        this.body.setVelocity(0);
        
        // Play death animation
        this.anims.play('player-idle');
        this.setTint(0xff0000);
        
        // Shake camera effect
        this.scene.cameras.main.shake(500, 0.01);
        
        // Show game over screen after a delay
        this.scene.time.delayedCall(2000, () => {
            this.scene.gameMusic.stop();
            this.scene.cameras.main.fade(1000, 0, 0, 0);
            this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.scene.start('MainMenuScene');
            });
        });
    }

    addScore(points) {
        this.score += points;
    }
}
