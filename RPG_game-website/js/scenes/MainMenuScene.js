class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        // Play title music
        this.titleMusic = this.sound.add('title-music', { 
            loop: true, 
            volume: 0.5 
        });
        this.titleMusic.play();
        
        // Add background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.add.image(width / 2, height / 2, 'menu-background').setOrigin(0.5);
        
        // Add title
        const titleText = this.add.text(width / 2, height / 4, 'Fantasy Quest', {
            font: 'bold 64px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Add subtitle
        const subtitleText = this.add.text(width / 2, height / 4 + 60, 'An Epic RPG Adventure', {
            font: '28px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Create animated title effect
        this.tweens.add({
            targets: titleText,
            scale: { from: 0.9, to: 1.1 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Create start game button
        const startButton = this.add.image(width / 2, height / 2 + 50, 'button')
            .setScale(2)
            .setInteractive({ useHandCursor: true });
            
        const startText = this.add.text(width / 2, height / 2 + 50, 'Start Game', {
            font: 'bold 24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Button hover and click effects
        startButton.on('pointerover', () => {
            startButton.setTint(0xcccccc);
        });
        
        startButton.on('pointerout', () => {
            startButton.clearTint();
        });
        
        startButton.on('pointerdown', () => {
            startButton.setTint(0x999999);
        });
        
        startButton.on('pointerup', () => {
            // Stop menu music
            this.titleMusic.stop();
            
            // Transition to game scene with a fade effect
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });
        
        // Create fade-in effect
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }
}
