    class Credits extends Phaser.Scene {
        constructor() {
            super("creditsScene");
        }

        init(){
            this.SCALE = 2.0;
        }
        preload() {
            this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        }
        
        create() {
            // Create a new tilemap game object which uses 18x18 pixel tiles, and is
            // 45 tiles wide and 25 tiles tall.
            this.map = this.add.tilemap("platformer-game-level-0", 18, 18, 45, 25);
            this.animatedTiles.init(this.map);
            // Add a tileset to the map
            // First parameter: name we gave the tileset in Tiled
            // Second parameter: key for the tilesheet (from this.load.image in Load.js)
            this.tileset = this.map.addTilesetImage("kenny_tilemap_packed_food", "tilemap_tiles_food");
            this.tileset2 = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
            this.background = this.map.createLayer("Background", this.tileset2, 0, 0);
            this.food = this.map.createLayer("Food", this.tileset, 0, 0);
            
                


            

            // set up Phaser-provided cursor key input
            cursors = this.input.keyboard.createCursorKeys();
            this.rKey = this.input.keyboard.addKey('R');
            
            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            this.cameras.main.setZoom(this.SCALE);
            console.log(this.cameras.main.width);
            this.creditsText = this.add.text(this.cameras.main.width/4, 20, "You Won!\n Press R to play again!\nCredits:\n Made by: Melanie Ramirez-Canchola\nArt Assets: Kenny Assets\n Audio VA: Alexandra Favela (Roommate and Friend)",{
                fontSize: '20px',
                fontFamily: 'Arial',
                fill: '#512DA8',
                align: 'center'
            }
            ).setOrigin(0.5,0);
            
            
            
            

        }

        update(time) {

            if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
                this.scene.start("platformerScene");
            }
        }


}
