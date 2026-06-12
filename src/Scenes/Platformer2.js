class Platformer2 extends Phaser.Scene {
        constructor() {
            super("platformer2Scene");
        }
        init() {
            // variables and settings
            this.ACCELERATION = 400;
            this.DRAG = 1500;    // DRAG < ACCELERATION = icy slide
            this.physics.world.gravity.y = 2000;
            this.JUMP_VELOCITY = -650;
            this.PARTICLE_VELOCITY = 50;
            this.SCALE = 2.0;
            this.MAX_JUMPS      = 2;     // jumps available before requiring ground contact
            this.JUMP_BUFFER_MS = 150;   // ms
            this.MAX_HEALTH = 3;
            this.CUR_HEALTH = this.MAX_HEALTH;
            this.GAME_OVER = false;
            
        }
        preload() {
            this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        }
        create(){
            this.map = this.add.tilemap("platformer-game-level-2", 18, 18, 45, 25);
            this.animatedTiles.init(this.map);

            this.tileset = this.map.addTilesetImage("kenny_tilemap_packed_food", "tilemap_tiles_food");
            this.tileset2 = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

            this.background = this.map.createLayer("Background", this.tileset2, 0, 0);
            this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
            //this.waterLayer = this.map.createLayer("Water", this.tileset2, 0, 0);
            this.spikesLayer = this.map.createLayer("Spikes", this.tileset2, 0, 0);
            this.platformLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);

            this.jumpSound = this.sound.add('sfx_jump', { loop: false, volume: 0.9 });
            this.coinSound = this.sound.add('coin_collect', { loop: false, volume: 0.7 });
            this.donutSound = this.sound.add('donut_collect', { loop: false, volume: 0.7});
            this.headhitSound = this.sound.add('head_hit', { loop: false, volume: 0.7});
            

            this.groundLayer.setCollisionByProperty({
                collides: true
            });
            this.spikesLayer.setCollisionByProperty({
                collides: true
            });
            this.platformLayer.setCollisionByProperty({
                collides: true
            });
            this.platformLayer.forEachTile(tile => {
                if (tile.collides){
                    tile.setCollision(false, false, true, false);
                }
            });

            this.coins = this.map.createFromObjects("Objects", {
                name: "coin",
                key: "tilemap_sheet",
                frame: 151
            });
            this.donut = this.map.createFromObjects("Objects", {
                name: "donut",
                key: "tilemap_sheet2",
                frame: 14
            })
            this.spawn = this.map.createFromObjects("Objects", {
                name: "spawn",
                key: "tilemap_sheet",
                frame: 91
            });

            this.anims.create({
                key: 'coinAnim', // Animation key
                frames: this.anims.generateFrameNumbers('tilemap_sheet', 
                    {start: 151, end: 152}
                ),
                frameRate: 2,  // Higher is faster
                repeat: -1      // Loop the animation indefinitely
            });
            this.anims.play('coinAnim', this.coins);

            this.end = this.map.createFromObjects("Objects", {
                name: "end",
                key: "tilemap_sheet",
                frame: 57,
            })

            if (this.end && this.end.length > 0) {
                    this.end[0].setVisible(false); 
                    this.physics.world.enable(this.end[0], Phaser.Physics.Arcade.STATIC_BODY);
                }
                
            this.spawnX = 100;
            this.spawnY = 100;
            if (this.spawn && this.spawn.length > 0) {
                this.spawnX = this.spawn[0].x;
                this.spawnY = this.spawn[0].y;
                this.spawn[0].setVisible(false);
            }

            this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
            this.physics.world.enable(this.donut, Phaser.Physics.Arcade.STATIC_BODY);

            this.coinGroup = this.add.group(this.coins);
            this.donutGroup = this.add.group(this.donut);

            my.sprite.player = this.physics.add.sprite(this.spawnX, this.spawnY, "platformer_characters", "tile_0000.png")
            my.sprite.player.setCollideWorldBounds(true);
            this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

            this.physics.add.collider(my.sprite.player, this.groundLayer);
            this.physics.add.collider(my.sprite.player, this.platformLayer);

            this.physics.add.collider(my.sprite.player, this.spikesLayer, () => {
                this.headhitSound.play();
                this.handlePlayerDeath();
            }, null, this);
            
            if(this.end && this.end.length > 0){
                this.physics.add.overlap(my.sprite.player, this.end[0], () => {
                    this.triggerEndState("YOU WIN!", "#00ff66");
                });
            }

            this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
                obj2.destroy(); // remove coin on overlap
                this.coinSound.play();
            });
            this.physics.add.overlap(my.sprite.player, this.donutGroup, (obj1, obj2) => {
                obj2.destroy(); // remove donut on overlap
                this.donutSound.play();
                this.CUR_HEALTH = this.MAX_HEALTH;
                this.healthText.setText(`HP: ${this.CUR_HEALTH}`);
            });

            // set up Phaser-provided cursor key input
            cursors = this.input.keyboard.createCursorKeys();
            this.rKey = this.input.keyboard.addKey('R');
            // debug key listener (assigned to D key)
            this.input.keyboard.on('keydown-D', () => {
                this.physics.world.drawDebug = !this.physics.world.drawDebug;
                if(this.physics.world.drawDebug){
                    if( !this.physics.world.debugGraphic){
                        this.physics.world.createDebugGraphic();
                    }
                }else{
                    if(this.physics.world.debugGraphic){
                        this.physics.world.debugGraphic.clear();
                    }
                }
            }, this);
            my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
                frame: ['smoke_03.png', 'smoke_09.png'],
                // TODO: Try: add random: true
                scale: {start: 0.03, end: 0},
                //  maxAliveParticles: 10,
                lifespan: 200,
                //gravityY: -400,
                alpha: {start: 1, end: 0.1}, 
            });
            my.vfx.walking.stop();

            this.jumpsRemaining  = this.MAX_JUMPS;
            this.jumpBufferTimer = -Infinity;   // timestamp of last jump keypress; -Infinity = no pending buffer
            this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
            this.cameras.main.setDeadzone(50, 50);
            this.cameras.main.setZoom(this.SCALE);

            this.healthText = this.add.text(20, 10, `HP: ${this.CUR_HEALTH}` , {
                fontSize: '12px',
                fontFamily: 'Arial',
                fill: '#ff0062',
            });
            this.healthText.setDepth(1000);
            this.healthText.setOrigin(0.5);
            this.levelText = this.add.text(5, 17, "Level 2", {
                fontSize: '12px',
                fontFamily: 'Arial',
                fill: '#000000',
            });
            this.jumpText = this.add.text(5, 32, "Press Up Arrow 2x to Double Jump!",{
                fontSize: '12px',
                fontFamily: 'Arial',
                fill: '#000000',
            });
        }
        update(time){
            if (this.isGameOver) {
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(this.DRAG);
                
                if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
                    my.sprite.player.body.setAllowGravity(true);
                    this.isGameOver = false;
                    this.scene.restart();
                    
                }
                return;
            }
            if(cursors.left.isDown) {
                // TODO: have the player accelerate to the left
                my.sprite.player.body.setAccelerationX(-this.ACCELERATION);

                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                if (my.sprite.player.body.blocked.down) {

                    my.vfx.walking.start();

                }

            } else if(cursors.right.isDown) {
                // TODO: have the player accelerate to the right
                my.sprite.player.body.setAccelerationX(this.ACCELERATION);

                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('walk', true);
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

                // Only play smoke effect if touching the ground

                if (my.sprite.player.body.blocked.down) {

                    my.vfx.walking.start();

                }  

            } else {
                // TODO: set acceleration to 0 and have DRAG take over
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setDragX(this.DRAG);

                my.sprite.player.anims.play('idle');
                my.vfx.walking.stop();
            }
            // ── Step 1: Record jump input ─────────────────────────────────────────
            // Store the timestamp every time jump is pressed, whether grounded or not.
            // This timestamp is what enables both double jump and the jump buffer.
            if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
                this.jumpBufferTimer = time;
            }

            // ── Step 2: Reset jump count on landing ───────────────────────────────
            // body.blocked.down is true every frame the player rests on a surface,
            // so jumpsRemaining is replenished for as long as the player is grounded.
            if (my.sprite.player.body.blocked.down) {
                this.jumpsRemaining = this.MAX_JUMPS;
            }

            // ── Step 3: Execute jump ──────────────────────────────────────────────
            // One condition covers all three cases:
            //
            //   Normal jump:   player pressed jump while grounded
            //                  → buffer just set, jumpsRemaining = MAX_JUMPS from step 2
            //
            //   Double jump:   player pressed jump while airborne, has jumps left
            //                  → buffer just set, step 2 skipped (not grounded)
            //
            //   Buffered jump: player pressed jump slightly before landing
            //                  → buffer still within window, step 2 just reset jumpsRemaining
            if (this.jumpsRemaining > 0 && (time - this.jumpBufferTimer) < this.JUMP_BUFFER_MS) {
                my.sprite.player.setVelocityY(this.JUMP_VELOCITY);
                this.jumpsRemaining--;
                this.jumpBufferTimer = -Infinity;   // consume the press so it only fires once
                this.jumpSound.play();

                
            }
            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!my.sprite.player.body.blocked.down) {
                
                my.sprite.player.anims.play('jump');
                
            }
            if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
                // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.jumpSound.play();


            }
            if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
                this.scene.restart();
            }
        }
        handlePlayerDeath() {
        if (this.CUR_HEALTH <= 0) return;

        this.CUR_HEALTH--;
        this.healthText.setText(`HP: ${this.CUR_HEALTH}`); // Updates UI display text

        if (this.CUR_HEALTH <= 0) {
            this.triggerEndState("GAME OVER", "#ff0055");
        } else {        
            my.sprite.player.setPosition(this.spawnX, this.spawnY);
            my.sprite.player.body.setVelocity(0, 0);
            my.sprite.player.body.setAcceleration(0, 0);
        }
    }
    triggerEndState(messageText, textHexColor) {
        if (this.isGameOver) return;
        this.isGameOver = true;

        my.sprite.player.body.setVelocity(0, 0);
        my.sprite.player.body.setAcceleration(0);
        my.sprite.player.body.setAllowGravity(false);

        const centerX = this.cameras.main.midPoint.x;
        const centerY = this.cameras.main.midPoint.y;

        let endTitle = this.add.text(centerX, centerY - 20, messageText, {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: textHexColor,

        }).setOrigin(0.5).setDepth(2000);

        let subTitle = this.add.text(centerX, centerY + 20, "Press R to Restart", {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#000000',

        }).setOrigin(0.5).setDepth(2000);
        
        endTitle.setScale(1 / this.SCALE);
        subTitle.setScale(1 / this.SCALE);
    }
}