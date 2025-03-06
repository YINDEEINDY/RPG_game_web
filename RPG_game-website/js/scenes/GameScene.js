class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Start game music
        this.gameMusic = this.sound.add('game-music', { 
            loop: true, 
            volume: 0.3 
        });
        this.gameMusic.play();
        
        // Create world map
        this.createMap();
        
        // Create player
        this.player = new Player(this, 400, 300);
        
        // Create camera that follows the player
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setZoom(1.5);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Create enemies
        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });
        
        // Spawn enemies at predefined locations
        this.spawnEnemies();
        
        // Set up collisions
        this.physics.add.collider(this.player, this.worldLayer);
        this.physics.add.collider(this.enemies, this.worldLayer);
        this.physics.add.collider(this.enemies, this.enemies);
        
        // Set up player-enemy overlap
        this.physics.add.overlap(
            this.player, 
            this.enemies, 
            this.handlePlayerEnemyCollision, 
            null, 
            this
        );
        
        // Create UI
        this.createUI();
        
        // Set up keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Add on-screen controls for mobile
        if (this.sys.game.device.input.touch) {
            this.createMobileControls();
        }
        
        // Display game instructions
        this.showGameInstructions();
        
        // Fade in effect
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    update(time, delta) {
        // Update player
        if (this.player) {
            if (this.mobileControlsActive && this.joyStick) {
                // Handle mobile controls
                const joyStickCursors = {
                    up: { isDown: this.joyStick.up },
                    down: { isDown: this.joyStick.down },
                    left: { isDown: this.joyStick.left },
                    right: { isDown: this.joyStick.right }
                };
                this.player.update(joyStickCursors, this.attackKey);
            } else {
                // Handle keyboard controls
                this.player.update(this.cursors, this.attackKey);
            }
        }
        
        // Update enemies
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.update) {
                enemy.update(time);
            }
        });
        
        // Update UI
        this.updateUI();
        
        // Check win condition
        if (this.enemies.getLength() === 0 && !this.gameCompleted) {
            this.completeLevel();
        }
    }

    createMap() {
        try {
            // Create the tilemap
            this.map = this.make.tilemap({ key: 'map' });
            
            // Add the tileset to the map
            const tileset = this.map.addTilesetImage('fantasy-tileset', 'tiles');
            
            // Create layers
            this.groundLayer = this.map.createLayer('Ground', tileset).setDepth(0);
            this.decorationLayer = this.map.createLayer('Decoration', tileset).setDepth(1);
            this.worldLayer = this.map.createLayer('World', tileset).setDepth(2);
            
            // Set collisions for the world layer
            this.worldLayer.setCollisionByProperty({ collides: true });
            
            // Fallback: If no collisions were set (possibly due to missing properties), 
            // set collisions on specific tile indices
            const worldLayerData = this.worldLayer.layer.data;
            let collisionsFound = false;
            
            for (let y = 0; y < worldLayerData.length; y++) {
                for (let x = 0; x < worldLayerData[y].length; x++) {
                    if (worldLayerData[y][x].collides) {
                        collisionsFound = true;
                        break;
                    }
                }
                if (collisionsFound) break;
            }
            
            if (!collisionsFound) {
                // If no collisions were found, set some default collisions
                this.worldLayer.setCollisionBetween(1, 2000);
            }
        } catch (e) {
            console.error("Error creating map:", e);
            this.createFallbackMap();
        }
    }
    
    createFallbackMap() {
        console.log("Creating fallback map");
        // Create a simple map with graphics objects
        
        // Main container for the map
        this.map = {
            widthInPixels: 32 * 20,
            heightInPixels: 32 * 20
        };
        
        // Create a background
        const background = this.add.graphics();
        background.fillStyle(0x207746, 1);  // Green color for grass
        background.fillRect(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Create walls
        const walls = this.add.graphics();
        walls.fillStyle(0x665544, 1);  // Brown color for walls
        
        // Draw walls around the edges
        walls.fillRect(0, 0, this.map.widthInPixels, 32); // Top
        walls.fillRect(0, this.map.heightInPixels - 32, this.map.widthInPixels, 32); // Bottom
        walls.fillRect(0, 0, 32, this.map.heightInPixels); // Left
        walls.fillRect(this.map.widthInPixels - 32, 0, 32, this.map.heightInPixels); // Right
        
        // Add some obstacles
        walls.fillRect(320, 0, 32, 320); // Vertical obstacle
        walls.fillRect(320, 320, 320, 32); // Horizontal obstacle
        
        // Create physics objects for walls
        this.worldLayer = this.physics.add.staticGroup();
        
        // Add collision boxes for walls (edges)
        this.worldLayer.add(this.physics.add.existing(
            this.add.zone(this.map.widthInPixels / 2, 16, this.map.widthInPixels, 32), true
        )); // Top
        this.worldLayer.add(this.physics.add.existing(
            this.add.zone(this.map.widthInPixels / 2, this.map.heightInPixels - 16, this.map.widthInPixels, 32), true
        )); // Bottom
        this.worldLayer.add(this.physics.add.existing(
            this.add.zone(16, this.map.heightInPixels / 2, 32, this.map.heightInPixels), true
        )); // Left
        this.worldLayer.add(this.physics.add.existing(
            this.add.zone(this.map.widthInPixels - 16, this.map.heightInPixels / 2, 32, this.map.heightInPixels), true
        )); // Right
        
        // Add obstacles
        this.worldLayer.add(this.physics.add.existing(
            this.add.zone(336, 160, 32, 320), true
        )); // Vertical obstacle
        this.worldLayer.add(this.physics.add.existing(
            this.add.zone(480, 336, 320, 32), true
        )); // Horizontal obstacle
    }

    spawnEnemies() {
        // Create slime enemies at specific locations
        const enemyPositions = [
            { x: 200, y: 200 },
            { x: 600, y: 400 },
            { x: 300, y: 150 },
            { x: 450, y: 320 },
            { x: 250, y: 400 }
        ];
        
        enemyPositions.forEach(pos => {
            try {
                const enemy = new Enemy(this, pos.x, pos.y);
                this.enemies.add(enemy);
            } catch (e) {
                console.error("Failed to create enemy:", e);
            }
        });
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (!player || !enemy) return;
        
        // Don't allow collision while enemy is dying
        if (enemy.isDying) return;
        
        // Player takes damage when colliding with an enemy
        player.takeDamage();
        
        // Apply knockback to player from the enemy
        const knockbackForce = 150;
        const knockbackDirection = new Phaser.Math.Vector2(
            player.x - enemy.x,
            player.y - enemy.y
        ).normalize().scale(knockbackForce);
        
        player.body.velocity.add(knockbackDirection);
        
        // Play hit sound
        this.sound.play('enemy-hit', { volume: 0.3 });
    }
    
    createUI() {
        // Create UI container that stays fixed to the camera
        this.uiContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
        
        // Create health bar background
        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 20;
        
        this.healthBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x000000, 0.7);
        this.healthBarBg.setOrigin(0, 0);
        
        // Create health bar fill
        this.healthBar = this.add.rectangle(barX, barY, barWidth, barHeight, 0xff0000, 1);
        this.healthBar.setOrigin(0, 0);
        
        // Create score text
        this.scoreText = this.add.text(barX, barY + barHeight + 10, 'Score: 0', {
            fontSize: '16px',
            fill: '#ffffff'
        });
        
        // Add elements to UI container
        this.uiContainer.add([this.healthBarBg, this.healthBar, this.scoreText]);
        
        // Create mobile controls if needed
        if (this.sys.game.device.input.touch) {
            this.createMobileControls();
        }
    }
    
    updateUI() {
        if (!this.player) return;
        
        // Update health bar
        const healthPercent = this.player.health / this.player.maxHealth;
        this.healthBar.width = 200 * healthPercent;
        
        // Update score text
        this.scoreText.setText(`Score: ${this.player.score}`);
    }
    
    createMobileControls() {
        // Create virtual joystick for movement
        this.joyStick = this.plugins.get('rexVirtualJoystick').add(this, {
            x: 100,
            y: 500,
            radius: 60,
            base: this.add.circle(0, 0, 60, 0x888888, 0.5),
            thumb: this.add.circle(0, 0, 30, 0xcccccc, 0.8),
        });
        
        // Add attack button
        this.attackButton = this.add.circle(700, 500, 50, 0xff0000, 0.8);
        this.attackButton.setScrollFactor(0).setDepth(100).setInteractive();
        this.attackButton.on('pointerdown', () => {
            this.player.attack();
        });
        
        // Add text to attack button
        this.add.text(700, 500, 'ATTACK', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        
        // Update player input handling for joystick
        this.mobileControlsActive = true;
    }
    
    showGameInstructions() {
        // Show initial gameplay instructions
        const instructionsText = this.add.text(400, 100, 
            'Use arrow keys to move\nPress SPACE to attack\nDefeat enemies to score points!', {
            fontSize: '18px',
            fill: '#ffffff',
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 10, y: 10 }
        });
        instructionsText.setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(200);
        
        // Fade out after a few seconds
        this.tweens.add({
            targets: instructionsText,
            alpha: 0,
            delay: 3000,
            duration: 1000,
            onComplete: () => {
                instructionsText.destroy();
            }
        });
    }
    
    completeLevel() {
        this.gameCompleted = true;
        
        // Display victory message
        const victoryText = this.add.text(400, 300, 
            'LEVEL COMPLETE!\nScore: ' + this.player.score, {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6,
            padding: { x: 20, y: 20 }
        });
        victoryText.setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(200);
        
        // Add sparkle effects around the text
        this.createVictoryEffects(victoryText);
        
        // Return to menu after delay
        this.time.delayedCall(5000, () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.gameMusic.stop();
                this.scene.start('MainMenuScene', { lastScore: this.player.score });
            });
        });
    }
    
    createVictoryEffects(victoryText) {
        // Create particle emitter for sparkle effect
        const particles = this.add.particles('particle');
        
        particles.createEmitter({
            x: 400,
            y: 300,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            gravityY: 50,
            frequency: 50,
            quantity: 2
        });
        
        // Make the text pulse
        this.tweens.add({
            targets: victoryText,
            scale: { from: 1, to: 1.1 },
            duration: 700,
            yoyo: true,
            repeat: -1
        });
    }
}
