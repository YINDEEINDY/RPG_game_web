// Initialize the Phaser game
window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
    
    // Add game to window object for debugging
    window.game = game;
});
