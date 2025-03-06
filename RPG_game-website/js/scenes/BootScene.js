class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load loading screen assets
        this.load.image('loading-background', 'assets/images/loading-background.png');
        this.load.image('loading-bar', 'assets/images/loading-bar.png');
    }

    create() {
        // Set up any initial game settings
        this.cameras.main.setBackgroundColor('#000000');
        
        // Transition to the preload scene
        this.scene.start('PreloadScene');
    }
}
