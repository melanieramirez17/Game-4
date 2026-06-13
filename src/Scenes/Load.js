class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles_food", "tilemap_packed_food.png");                         // Packed tilemap
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.image("tilemap_backgrounds","tilemap-backgrounds.png")
        this.load.tilemapTiledJSON("platformer-game-level-1", "platformer-game-level-1.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("platformer-game-level-2", "platformer-game-level-2.tmj");
        this.load.tilemapTiledJSON("platformer-game-level-3", "platformer-game-level-3.tmj");
        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("tilemap_sheet2", "tilemap_packed_food.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        
        this.load.audio('sfx_jump', 'jump.wav');
        this.load.audio('coin_collect', 'coin.wav');
        this.load.audio('donut_collect', 'donut.wav');
        this.load.audio('head_hit', 'headhit.wav');
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
        
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
        this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}