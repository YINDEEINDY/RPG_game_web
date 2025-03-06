class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
        this.assetsLoaded = false;
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px monospace',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);
        
        // Loading progress events
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 10);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.assetsLoaded = true;
        });

        // Handle file load errors gracefully
        this.load.on('loaderror', (file) => {
            console.warn(`Error loading asset: ${file.src}`);
            // Continue loading other assets
        });

        // Load game assets
        
        // Tilesets and maps
        this.load.image('tiles', 'assets/tilesets/fantasy-tileset.png');
        this.load.tilemapTiledJSON('map', 'assets/maps/fantasy-world.json');
        
        // Character spritesheets
        this.load.spritesheet('player', 'assets/characters/player.png', { 
            frameWidth: 48, 
            frameHeight: 48 
        });
        
        this.load.spritesheet('enemies', 'assets/characters/enemies.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        
        // UI elements
        this.load.image('menu-background', 'assets/ui/menu-background.jpg');
        this.load.image('button', 'assets/ui/button.png');
        this.load.image('loading-bar', 'assets/images/loading-bar.png');
        
        // Effect assets
        this.load.spritesheet('hit-effect', 'assets/effects/hit-effect.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('particle', 'assets/effects/particle.png');
        
        // Audio
        this.load.audio('title-music', ['assets/audio/title-theme.mp3']);
        this.load.audio('game-music', ['assets/audio/game-theme.mp3']);
        this.load.audio('sword-slash', ['assets/audio/sword-slash.mp3']);
        this.load.audio('enemy-hit', ['assets/audio/enemy-hit.mp3']);
        
        // Generate fallback assets for any missing textures
        this.load.on('filecomplete', (key, type) => {
            if (type === 'image' || type === 'spritesheet') {
                this.textures.once('addtexture', () => {
                    if (!this.textures.exists(key)) {
                        this.createPlaceholderTexture(key);
                    }
                });
            }
        });
    }

    createPlaceholderTexture(key) {
        // Create a placeholder texture with some debug info
        const graphics = this.add.graphics();
        graphics.fillStyle(0x9966ff, 1);
        graphics.fillRect(0, 0, 64, 64);
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeRect(0, 0, 64, 64);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillRect(32, 32, 32, 32);
        
        const rt = this.add.renderTexture(0, 0, 64, 64);
        rt.draw(graphics, 0, 0);
        
        // Generate a placeholder texture
        const img = rt.snapshot();
        this.textures.addImage(key, img.src);
        
        rt.destroy();
        graphics.destroy();
    }

    create() {
        // Generate a placeholder tilemap if loading failed
        if (!this.cache.tilemap.exists('map')) {
            this.createPlaceholderMap();
        }
        
        // Create animations
        this.createAnimations();
        
        // Start the main menu
        this.scene.start('MainMenuScene');
    }
    
    createPlaceholderMap() {
        // Create a simple tilemap data structure programmatically
        const mapData = {
            width: 20,
            height: 20,
            tileWidth: 32,
            tileHeight: 32,
            layers: [
                {
                    name: 'Ground',
                    data: Array(20 * 20).fill(1)
                },
                {
                    name: 'Decoration',
                    data: Array(20 * 20).fill(0)
                },
                {
                    name: 'World',
                    data: Array(20 * 20).fill(0).map((_, i) => {
                        // Add some walls around the edges and some obstacles
                        const x = i % 20;
                        const y = Math.floor(i / 20);
                        if (x === 0 || y === 0 || x === 19 || y === 19 || 
                            (x === 10 && y < 10) || (y === 10 && x > 10)) {
                            return 2;
                        }
                        return 0;
                    })
                }
            ]
        };
        
        // Add the tilemap to the cache
        this.cache.tilemap.add('map', { data: mapData, format: Phaser.Tilemaps.Formats.ARRAY_2D });
    }
    
    createAnimations() {
        // Player animations
        this.anims.create({
            key: 'player-idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-walk-down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-walk-up',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-walk-left',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-walk-right',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-attack',
            frames: this.anims.generateFrameNumbers('player', { start: 16, end: 19 }),
            frameRate: 12,
            repeat: 0
        });
        
        // Enemy animations
        this.anims.create({
            key: 'slime-idle',
            frames: this.anims.generateFrameNumbers('enemies', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });
        
        this.anims.create({
            key: 'slime-move',
            frames: this.anims.generateFrameNumbers('enemies', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Effect animations
        this.anims.create({
            key: 'hit-effect',
            frames: this.anims.generateFrameNumbers('hit-effect', { start: 0, end: 5 }),
            frameRate: 15,
            repeat: 0
        });
    }
}
