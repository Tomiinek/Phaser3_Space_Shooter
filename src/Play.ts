import { Shield } from "./Shield";
import { Gun } from "./Gun";
import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";
import { Stone } from "./Stone";
import { Pickup } from "./Pickup";
    
export class Play extends Phaser.Scene {

    moveKeys: {[key:string] : Phaser.Input.Keyboard.Key };

    player: Phaser.Physics.Arcade.Sprite;
    shield: Shield;
    gun: Gun;

    lasers: Phaser.Physics.Arcade.Group;
    enemyLasers: Phaser.Physics.Arcade.Group;
    enemies: Phaser.Physics.Arcade.Group;
    stones: Phaser.Physics.Arcade.Group;
    pickups: Phaser.Physics.Arcade.Group;

    lastEnemySpawn: number = 0;
    lastPickupSpawn: number = 0;
    lastStoneSpawn: number = 0;
    left: Phaser.Math.Vector2;
    center: Phaser.Math.Vector2;
    right: Phaser.Math.Vector2;

    numbersPrefix: string;
    scoreUINumber: Phaser.Physics.Arcade.Sprite[];
    healthUINumber: Phaser.Physics.Arcade.Sprite[]; 

    world: Phaser.Physics.Arcade.World;
    explosions: Phaser.GameObjects.Particles.ParticleEmitterManager;

    score: number;
    static readonly healthInitial: number = 5;
    health: number;

    static readonly stonesSpawnCooldown: number = 100;
    stonesCount: number;
    static readonly stonesCountInitial: number = 10;
    pickupsSpawnCooldown: number;
    static readonly pickupsSpawnCooldownInitial: number = 3000;
    static readonly pickupsSpawnCooldownMaximal: number = 30000;
    pickupsCount: number;
    static readonly pickupsCountInitial: number = 5;
    enemiesSpawnCooldown: number;
    static readonly enemiesSpawnCooldownInitial: number = 10000;
    static readonly enemiesSpawnCooldownMinimal: number = 2000;
    enemiesCount: number;
    static readonly enemiesCountInitial: number = 3;

    weaponLevel: number;
    static readonly weaponNextLevelScore: number = 50;
    static readonly minPickupScore: number = 3000;
    static readonly maxEnemyScore: number = 2000;
    static readonly maxPickupCooldownScore: number = 3000;
    static readonly minEnemyCooldownScore: number = 1000;
    static readonly maxStoneScore: number = 1000;
    static readonly enemyScore: number = 5;
    static readonly stoneScore: number = 1;

    static readonly gunCooldown: number = 1000;
    static readonly shieldCooldown: number = 7500;
    static readonly playerYaxisVelocityInitial: number = -0.01;
    static readonly playerAngularVelocity: number = 0.0035;
    static readonly playerForwardAcceleration: number = 0.00035;
    static readonly playerBackwardAcceleration: number = -0.00025;
    static readonly playerMaxSpeed: number = 0.1;

    velocity: Phaser.Math.Vector2;
    acceleration: Phaser.Math.Vector2;
    angularVelocity: number;

    constructor() {
        super("Play");
    }

    create() {

        // PLAYER INPUT SETUP:

        this.moveKeys = <{[key:string] : Phaser.Input.Keyboard.Key }> this.input.keyboard.addKeys({
          'up': Phaser.Input.Keyboard.KeyCodes.W,
          'down': Phaser.Input.Keyboard.KeyCodes.S,
          'left': Phaser.Input.Keyboard.KeyCodes.A,
          'right': Phaser.Input.Keyboard.KeyCodes.D,
          'fire': Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        this.input.keyboard.on('keydown_D', function (event: object) {
          this.scene.angularVelocity = Play.playerAngularVelocity;
        });
        this.input.keyboard.on('keydown_A', function (event: object) {
          this.scene.angularVelocity = -Play.playerAngularVelocity;
        });        

        this.input.keyboard.on('keyup_W', function (event: object) {
          if (this.scene.moveKeys['down'].isUp) {
            this.scene.acceleration.x = 0;
            this.scene.acceleration.y = 0;
          }
        });
        this.input.keyboard.on('keyup_S', function (event: object) {
          if (this.scene.moveKeys['up'].isUp) {
            this.scene.acceleration.x = 0;
            this.scene.acceleration.y = 0;
          }
        });
        this.input.keyboard.on('keyup_D', function (event: object) {
          if (this.scene.moveKeys['left'].isUp)
            this.scene.angularVelocity = 0;
        });
        this.input.keyboard.on('keyup_A', function (event: object) {
          if (this.scene.moveKeys['right'].isUp)
            this.scene.angularVelocity = 0;
        }); 
        this.input.keyboard.once('keyup_ESC', function () {
            this.scene.start('Boot');
        }, this);

        // 
        // OBJECT POOLERS SETUP:

        // PLAYER BULLET GROUP
        this.lasers = this.physics.add.group({
            classType: Bullet,
            maxSize: 64,
            runChildUpdate: true
        });      

        // ENEMY BULLET GROUP
        this.enemyLasers = this.physics.add.group({
            classType: Bullet,
            maxSize: 256,
            runChildUpdate: true
        });      

        // ENEMY GROUP
        this.enemies = this.physics.add.group({
            classType: Enemy,
            maxSize: 32,
            runChildUpdate: true
        });
        
        // STONE GROUP
        this.stones = this.physics.add.group({
            classType: Stone,
            maxSize: 64,
            runChildUpdate: true
        });

        // PICKUP GROUP
        this.pickups = this.physics.add.group({
           classType: Pickup,
           maxSize: 10,
           runChildUpdate: true
       }); 

        //
        // PLAYER & WORLD INIT: 

        this.world = this.physics.world;
        this.explosions = this.add.particles('explosion');

        // PLAYER BODY INIT
        var playerScale = Number(this.game.config.height) / 968;
        var playerRadius = 50;
        this.player = this.physics.add.sprite(Number(this.game.config.width), Number(this.game.config.height), "playership1").setScale(playerScale);
        this.player.body.collideWorldBounds = false;
        this.player.body.width *= playerScale;
        this.player.body.height *= playerScale;    
        this.player.depth = 10;  
        this.player.body.setCircle(playerRadius, (-playerRadius + 0.5 * this.player.body.width  / playerScale), (-playerRadius + 0.5 * this.player.body.height / playerScale));

        this.angularVelocity = 0;
        this.velocity = new Phaser.Math.Vector2(0, Play.playerYaxisVelocityInitial);
        this.acceleration = new Phaser.Math.Vector2();        

        // PLAYER'S GADGETS INIT
        this.gun = new Gun(Play.gunCooldown, this.lasers, Gun.GunType.Single, Bullet.BulletColor.Blue); 
        this.shield = new Shield(Play.shieldCooldown, this.player, this);
        this.shield.depth = 10;
        this.shield.setScale(playerScale);
        this.shield.activate();             // shield is active at the game beginning
        this.weaponLevel = 0;

        // CAMERA follows PLAYER
        this.cameras.main.startFollow(this.player);

        // LEFT, RIGHT and MIDDLE corner in view of the player's ship (used for spawning static items)
        this.left = new Phaser.Math.Vector2(Number(this.game.config.width) / 2 + 100, Number(this.game.config.height) / 2 + 100);
        this.right = this.left.clone();
        this.center = this.right.clone();

        // SPAWNING INIT
        this.stonesCount = Play.stonesCountInitial;
        this.enemiesCount = Play.enemiesCountInitial;
        this.pickupsCount = Play.pickupsCountInitial;
        this.pickupsSpawnCooldown = Play.pickupsSpawnCooldownInitial;
        this.enemiesSpawnCooldown = Play.enemiesSpawnCooldownInitial;
   
        // INITIAL STONE SPAWN   
        var spawnMargin = 200;
        while (this.stones.countActive() < this.stonesCount){
            let s : Stone = this.stones.get() as Stone;
            if (s) { 
              s.launchRandom(Phaser.Math.Between(-spawnMargin, Number(this.game.config.width)  + spawnMargin), 
                             Phaser.Math.Between(-spawnMargin, Number(this.game.config.height) + spawnMargin), this.player);     
            }
        }

        // 
        // OBJECT COLLISIONS:

        // LASERS kill ENEMIES
        this.physics.add.overlap(this.lasers, this.enemies, this.collideLaserEnemy, null, this);

        // PLAYER is killed by ENEMIES
        this.physics.add.overlap(this.player, this.enemies, this.collidePlayerEnemy, null, this);

        // ENEMIES kill PLAYER 
        this.physics.add.overlap(this.player, this.enemyLasers, this.collideLaserPlayer, null, this);

        // PLAYER takes PICKUPS
        this.physics.add.overlap(this.player, this.pickups, this.collidePlayerPickup, null, this);

        // STONE kills PLAYER
        this.physics.add.overlap(this.stones, this.player, this.collideStonePlayer, null, this);

        // LASERS break STONES
        this.physics.add.overlap(this.lasers, this.stones, this.collideLaserStone, null, this);

        //
        // UI, SCORE, HEALTH INIT:

        this.scoreUINumber = [];
        this.healthUINumber = [];
        this.numbersPrefix = "numeral";
        this.score = 0;
        this.health = Play.healthInitial;    
        this.updateScore();
        this.updateHealth();
    }

    update(time: number, delta: number) {

        //
        // PLAYER MOVEMENT

        this.player.x += delta * this.velocity.x
        this.player.y += delta * this.velocity.y;
        this.player.rotation += delta * this.angularVelocity;
        this.adjustVelocity(Play.playerMaxSpeed, delta);
        if (this.moveKeys["down"].isDown) this.setAcceleration(Play.playerBackwardAcceleration);
        if (this.moveKeys["up"].isDown) this.setAcceleration(Play.playerForwardAcceleration);

        //
        // PLAYER GADGETS

        this.shield.update(time, delta);
        this.gun.update(time, delta);
        if (this.input.keyboard.checkDown(this.moveKeys['fire'], 0)) this.gun.fire(this.player);

        var newWeaponLevel = Math.floor(this.score / Play.weaponNextLevelScore);
        if (this.weaponLevel != newWeaponLevel && newWeaponLevel < 9) {
          this.weaponLevel = newWeaponLevel;
          if (this.weaponLevel % 3 == 0) {
            this.gun.upgrade(); 
            this.gun.setCooldown(Play.gunCooldown);
          } else {
            this.gun.cooldown *= 0.6;
          }
        }  
        
        //
        // SPAWNING PICKUPS, STONES and ENEMIES
        this.stonesCount = Play.stonesCountInitial + (this.stones.maxSize - Play.stonesCountInitial) * Math.min(1, this.score / Play.maxStoneScore);
        this.enemiesCount = Play.enemiesCountInitial + (this.stones.maxSize - Play.enemiesCountInitial) * Math.min(1, this.score / Play.maxEnemyScore);
        this.pickupsCount = Play.pickupsCountInitial + (1 - Play.pickupsCountInitial) * Math.min(1, this.score / Play.minPickupScore);
        this.pickupsSpawnCooldown = Play.pickupsSpawnCooldownInitial + (Play.pickupsSpawnCooldownMaximal - Play.pickupsSpawnCooldownInitial) * Math.min(1, this.score / Play.maxPickupCooldownScore);
        this.enemiesSpawnCooldown = Play.enemiesSpawnCooldownInitial + (Play.enemiesSpawnCooldownMinimal - Play.enemiesSpawnCooldownInitial) * Math.min(1, this.score / Play.minEnemyCooldownScore);

        this.lastEnemySpawn -= delta;
        this.lastStoneSpawn -= delta;
        this.lastPickupSpawn -= delta;

        var velocityRatio = this.velocity.lengthSq() / (Play.playerMaxSpeed * Play.playerMaxSpeed);
        var spawnEnemy  = this.lastEnemySpawn < 0  && Phaser.Math.FloatBetween(0.0, 1.0) >= 0.99 * velocityRatio;
        var spawnStone  = this.lastStoneSpawn < 0  && this.stones.countActive() < this.stonesCount   && Phaser.Math.FloatBetween(0.0, 1.0) < velocityRatio;
        var spawnPickup = this.lastPickupSpawn < 0 && this.pickups.countActive() < this.pickupsCount && Phaser.Math.FloatBetween(0.0, 1.0) < velocityRatio;
        var centerProjection = (spawnStone || spawnPickup ? this.getProjectedCenterCorner() : null);

        // SPAWN ENEMY
        if (spawnEnemy) {   
            let e : Enemy = this.enemies.get() as Enemy;
            if (e) {
              var spawnPoint = this.getRandomEnemySpawnPoint();
              e.launchRandom(spawnPoint.x + this.cameras.main.midPoint.x, spawnPoint.y + this.cameras.main.midPoint.y, this.player);     
            }
            this.lastEnemySpawn = this.enemiesSpawnCooldown;
        }

        // SPAWN STONE           
        if (spawnStone) {
            let s : Stone = this.stones.get() as Stone;
            if (s) { 
              var spawnPoint = this.getRandomSpawnPoint(centerProjection);
              s.launchRandom(spawnPoint.x + this.cameras.main.midPoint.x, spawnPoint.y + this.cameras.main.midPoint.y, this.player);   
            }
            this.lastStoneSpawn = Play.stonesSpawnCooldown;
        }

        // SPAWN PICKUP
        if (spawnPickup) {
          console.log("prdel");
            let p : Pickup = this.pickups.get() as Pickup;
            if (p) { 
              console.log("hovno");
              var spawnPoint = this.getRandomSpawnPoint(centerProjection);
              p.launchRandom(spawnPoint.x + this.cameras.main.midPoint.x, spawnPoint.y + this.cameras.main.midPoint.y, this.player);   
            }
            this.lastPickupSpawn = this.pickupsSpawnCooldown;
        }

    }

    sampleFromNormalDist(min : number, max : number){
      var u = 0, v = 0;
      while(u === 0) u = Math.random();
      while(v === 0) v = Math.random();
      let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
      num = num / 10.0 + 0.5;
      if (num > max || num < min) num = this.sampleFromNormalDist(min, max);
      return num;
    }

    getRandomEnemySpawnPoint(){
      
      var halfWidth  = Number(this.game.config.width) / 2 + 100;
      var halfHeight = Number(this.game.config.height) / 2 + 100;
      var cornerAngle = Math.atan(halfWidth / halfHeight);
      var playerAngle = Math.atan2(this.velocity.x, -this.velocity.y);
      
      var velocityRatio = Math.sqrt(this.velocity.length() / Play.playerMaxSpeed);
      var rnd = this.sampleFromNormalDist(0.1, 0.9) * velocityRatio + Phaser.Math.FloatBetween(0.1, 0.9) * (1 - velocityRatio);
      
      var randomSpawnAngle = playerAngle - (playerAngle > Math.PI ? Math.PI * 2 : 0) + Math.PI * (2*rnd - 1);
      randomSpawnAngle += (randomSpawnAngle > Math.PI ? -2*Math.PI : (randomSpawnAngle < -Math.PI ? 2*Math.PI : 0));

      var spawnPoint = new Phaser.Math.Vector2();
      if (-cornerAngle < randomSpawnAngle && randomSpawnAngle < cornerAngle) {
        spawnPoint.y = -halfHeight;
        spawnPoint.x = Math.sign(randomSpawnAngle) * Math.tan(Math.abs(randomSpawnAngle)) * halfHeight;
      } else 
      if (cornerAngle - Math.PI <= randomSpawnAngle && randomSpawnAngle <= -cornerAngle) {
        spawnPoint.x = -halfWidth;
        spawnPoint.y = Math.sign(randomSpawnAngle + Math.PI / 2) * Math.tan(Math.abs(randomSpawnAngle + Math.PI / 2)) * halfWidth;
      } else 
      if (cornerAngle <= randomSpawnAngle && randomSpawnAngle <= Math.PI- cornerAngle) {
        spawnPoint.x = halfWidth;
        spawnPoint.y = Math.sign(randomSpawnAngle - Math.PI / 2) * Math.tan(Math.abs(randomSpawnAngle - Math.PI / 2)) * halfWidth;
      } else {
        spawnPoint.y = halfHeight;
        var a = randomSpawnAngle + (randomSpawnAngle < 0 ? Math.PI: -Math.PI);
        spawnPoint.x = -Math.sign(a) * Math.tan(Math.abs(a)) * halfHeight;
      }

      return spawnPoint;
    }

    getRandomSpawnPoint(projectedCenter: number){
      var rnd = Phaser.Math.FloatBetween(-1.0, 1.0);
      var spawnPoint = this.center.clone();
      if (rnd > projectedCenter) spawnPoint.add(this.left.clone().subtract(this.center).scale(rnd - projectedCenter));
      else spawnPoint.add(this.right.clone().subtract(this.center).scale(projectedCenter - rnd));
      return spawnPoint;
    }

    getProjectedCenterCorner() {
      this.updateSpawnDirections();
      var velocityNormal = this.velocity.clone();
      velocityNormal.y *= -1;
      velocityNormal.normalize();
      var leftDistance = velocityNormal.dot(this.left);
      var rightDistance = velocityNormal.dot(this.right);
      var centerDistance = velocityNormal.dot(this.center);
      var centerNormalized = (leftDistance - centerDistance) / (leftDistance - rightDistance);
      return centerNormalized;  
    }

    updateSpawnDirections() {
      this.left.x = Math.abs(this.left.x);
      this.left.y = Math.abs(this.left.y);
      this.right.x = Math.abs(this.right.x);
      this.right.y = Math.abs(this.right.y);
      this.center.x = Math.abs(this.center.x);
      this.center.y = Math.abs(this.center.y);
      if (this.velocity.x >= 0){
        if (this.velocity.y >= 0){
          this.left.y *= -1;               
          this.right.x *= -1;
        } else {
          this.left.scale(-1);
          this.center.y *= -1;
        } 
      } else {
        if (this.velocity.y >= 0){
          this.center.x *= -1;
          this.right.scale(-1);
        } else {
          this.left.x *= -1;
          this.center.scale(-1);
          this.right.y *= -1;
        } 
      }
    }

    setAcceleration(acc : number) {
      var angle = this.player.rotation;
      var y = -acc * Math.cos(angle);
      var x = acc * Math.sin(angle);
      this.acceleration.x = x;
      this.acceleration.y = y;
    }

    adjustVelocity(maxVelocity: number, delta : number) {
        this.velocity.x += this.acceleration.x * delta;
        this.velocity.y += this.acceleration.y * delta;
        var vx = this.velocity.x;
        var vy = this.velocity.y;
        var currVelocitySqr = vx * vx + vy * vy;
        if (currVelocitySqr > maxVelocity * maxVelocity) {
            var angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;
            this.velocity.x = vx;
            this.velocity.y = vy;
        }
    }

    collideLaserEnemy(laser: Bullet, enemy: Enemy) { 
        if (!laser.active) return;
        if (!enemy.active) return;
        enemy.killEffect(this);
        this.lasers.killAndHide(laser);
        this.enemies.killAndHide(enemy);
        this.score += Play.enemyScore;
        this.updateScore();
    }

    collideLaserPlayer(player: Phaser.Physics.Arcade.Sprite, laser: Bullet) { 
        if (!laser.active) return;
        if (!player.active) return;
        this.enemyLasers.killAndHide(laser);
        this.hurtPlayer();
    }

    collidePlayerEnemy(player: Phaser.Physics.Arcade.Sprite, enemy: Enemy) {
      if (!player.active) return;
      if (!enemy.active) return;  
      enemy.killEffect(this);
      this.enemies.killAndHide(enemy);
      this.hurtPlayer();
    }

    collidePlayerPickup(player: Phaser.Physics.Arcade.Sprite, pickup: Pickup) {    
      if (!player.active) return;
      if (!pickup.active) return;  
      pickup.killEffect(this);
      this.pickups.killAndHide(pickup);
    }

    collideStonePlayer(player: Phaser.Physics.Arcade.Sprite, stone: Stone) {    
      if (!player.active) return;
      if (!stone.active) return;
      this.stones.killAndHide(stone);  
      this.hurtPlayer();
    }

    collideLaserStone(laser: Bullet, stone: Stone) {    
      if (!laser.active) return;
      if (!stone.active) return;
      stone.killEffect(this);    
      this.lasers.killAndHide(laser);  
      this.stones.killAndHide(stone);  
      this.score += Play.stoneScore;
      this.updateScore();
    }

    hurtPlayer() {
      if (this.shield.isActive()) return;
      this.health--;
      this.updateHealth();     
      if (this.health <= 0) {
          this.playerExplode();
          this.gameOver();
      }
    }

    gameOver() {
        // this.scene.restart();
        this.player.destroy();
        this.time.delayedCall(3000, function(){ this.scene.start('Boot'); }, null, this);
    }

    playerExplode(){
      var emitter = this.explosions.createEmitter({
        scale: { start: 1, end: 0 },
        speed: 200,
        lifespan: 250
      });
      emitter.setPosition(this.player.x, this.player.y);
      this.time.delayedCall(200, function(){ emitter.stop(); }, null, this);
    }

    updateUINumber(n : number, x : number, y : number, padZeros : boolean, digits : number, handlers : Phaser.Physics.Arcade.Sprite[]) {
      handlers.forEach(function(handler) {
        handler.destroy();
      });
      handlers.length = 0;
      var stringN = String(n);
      if (!padZeros) digits = stringN.length;      
      for (let i: number = digits - 1; i >= 0; i--) {
          var digit = (i >= stringN.length ? '0' : stringN.charAt(stringN.length - 1 - i));
          var sprite = this.physics.add.sprite(x + (digits - i) * 20, y, this.numbersPrefix + digit);
          sprite.setScrollFactor(0);
          var end = handlers.push(sprite);
          handlers[end - 1].depth = 0;
      }  
    }

    updateScore() {
      this.updateUINumber(this.score, this.world.bounds.width - 140, 20, true, 6, this.scoreUINumber);
    }

    updateHealth() {
      this.updateUINumber(this.health, 20, 20, false, 0, this.healthUINumber);
    }

}