class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemies');
        
        // Add enemy to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set enemy properties
        this.setSize(20, 20).setOffset(6, 12);
        this.setCollideWorldBounds(true);
        this.setDepth(4);
        
        // Enemy state
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 80;
        this.damage = 10;
        this.isHit = false;
        this.isDying = false;
        this.pointValue = 50;
        
        // Play default animation
        this.anims.play('slime-idle');
        
        // Set up AI behavior timer
        this.scene = scene;
        this.nextAIUpdate = 0;
        this.aiUpdateInterval = 2000; // milliseconds
        this.chaseDistance = 200;
        this.moveDirection = new Phaser.Math.Vector2(0, 0);
    }

    update(time) {
        if (this.isDying) return;
        
        // Update enemy AI at set intervals
        if (time > this.nextAIUpdate) {
            this.updateAI();
            this.nextAIUpdate = time + this.aiUpdateInterval;
        }
        
        // Move the enemy
        this.body.setVelocity(this.moveDirection.x * this.speed, this.moveDirection.y * this.speed);
        
        // Play animation based on movement
        if (this.body.velocity.length() > 10) {
            this.anims.play('slime-move', true);
        } else {
            this.anims.play('slime-idle', true);
        }
    }

    updateAI() {
        const player = this.scene.player;
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            player.x, player.y
        );
        
        // If player is within chase distance, move toward player
        if (distanceToPlayer < this.chaseDistance && !player.isDead) {
            // Calculate direction to player
            this.moveDirection = new Phaser.Math.Vector2(
                player.x - this.x,
                player.y - this.y
            ).normalize();
        } else {
            // Random wandering behavior
            const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            this.moveDirection = new Phaser.Math.Vector2(
                Math.cos(randomAngle),
                Math.sin(randomAngle)
            );
            
            // 25% chance to just stop for a moment
            if (Phaser.Math.FloatBetween(0, 1) < 0.25) {
                this.moveDirection.set(0, 0);
            }
        }
    }

    takeDamage() {
        if (this.isHit || this.isDying) return;
        
        // Reduce health
        this.health -= 20;
        
        // Check if enemy died
        if (this.health <= 0) {
            this.die();
            return;
        }
        
        // Flash effect to show damage
        this.isHit = true;
        this.setTint(0xff0000);
        
        // Apply hit cooldown
        this.scene.time.delayedCall(500, () => {
            this.clearTint();
            this.isHit = false;
        });
    }

    die() {
        this.isDying = true;
        this.body.setVelocity(0);
        
        // Stop movement and add visual effects
        this.body.setImmovable(true);
        
        // Flash and fade out
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0 },
            scale: { from: 1, to: 1.5 },
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                // Add score to player
                this.scene.player.addScore(this.pointValue);
                
                // Remove from scene
                this.destroy();
            }
        });
    }
}
