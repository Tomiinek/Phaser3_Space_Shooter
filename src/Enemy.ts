import { StaticUFO } from "./StaticUFO"; 
import { Play } from "./Play";    
import { Gun } from "./Gun"; 
import { Bullet } from "./Bullet";    
    
export class Enemy extends StaticUFO {
  
  kind: Enemy.EnemyType;
  velocity: Phaser.Math.Vector2;
  acceleration: Phaser.Math.Vector2;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  weapon: Gun;
  firing: boolean;

  contactDist: number = 80 * 80 ;
  stopDist: number = 175 * 175;
  fireDist: number = 225 * 225;

  constructor( scene: Play ) {
    super(scene, "enemy");
    Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y, "");
    this.weapon = new Gun(1, scene.enemyLasers, Gun.GunType.Single, Bullet.BulletColor.Red);
    this.velocity = new Phaser.Math.Vector2();
    this.acceleration = new Phaser.Math.Vector2();
    this.emitter = null;
    this.offset *= 2;
    this.contactDist *= Number(this.scene.game.config.height) / 484 * Number(this.scene.game.config.height) / 484;
    this.stopDist *= Number(this.scene.game.config.height) / 484 * Number(this.scene.game.config.height) / 484;
    this.fireDist *= Number(this.scene.game.config.height) / 484 * Number(this.scene.game.config.height) / 484;
  }
  
  launch(kind : Enemy.EnemyType, x: number, y: number, player : Phaser.Physics.Arcade.Sprite) : Enemy {

    super.init(player);

    this.kind = kind;  
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.acceleration.x = 0;
    this.acceleration.y = 0;
    this.firing = false;

    this.setScale(Number(this.scene.game.config.height) / 880);

    switch (+this.kind) {
    case Enemy.EnemyType.Bomb:
        this.setTexture("enemy1");
        this.setCircle(45, -3, -4);
        break;
    case Enemy.EnemyType.Basic:
        this.weapon.setWeapon(Gun.GunType.Single);
        this.weapon.setCooldown(1500);
        this.setTexture("enemy2");
        this.setCircle(50, -3, -8);
        break;
    case Enemy.EnemyType.Advanced:
        this.weapon.setWeapon(Gun.GunType.Double);
        this.weapon.setCooldown(2000);
        this.setTexture("enemy3");
        this.setCircle(45, 9, 0);
        break;    
    }

    this.setPosition(x, y);
    super.show();

    return this;
  }

  launchRandom(x: number, y: number, player : Phaser.Physics.Arcade.Sprite) {      
    var rnd = Phaser.Math.Between(0, 9);
    var kind = Enemy.EnemyType.Basic;
    if (rnd <= 1) kind = Enemy.EnemyType.Advanced;
    else if (rnd <= 5) kind = Enemy.EnemyType.Bomb;
    this.launch(kind, x, y, player);
  }

  killEffect(game: Play) {
    if (this.emitter == null) {
      this.emitter = game.explosions.createEmitter({
          scale: { start: 1, end: 0 },
          speed: 200,
          lifespan: 250
      });
    }
    this.emitter.setPosition(this.x, this.y);
    this.emitter.killAll();
    this.emitter.start();
    this.scene.time.delayedCall(100, function(){ this.emitter.stop(); }, null, this);
  }

  update(time: number, delta: number) {   
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
    var dx = this.player.x - this.x;
    var dy = this.player.y - this.y;

    switch (+this.kind) {
    case Enemy.EnemyType.Bomb:
        this.rotation = this.angleToYAxis(dx, dy);
        this.adjustAcceleration(0.002);
        this.adjustVelocity(0.22, delta);
        break;
    case Enemy.EnemyType.Basic:
    case Enemy.EnemyType.Advanced:
        var distance = dx * dx + dy * dy;
        if (distance < this.contactDist) {
          this.rotation = this.angleToYAxis(dx, dy);
          this.adjustAcceleration(-0.001);
          this.adjustVelocity(0.15, delta);
        } 
        else if (distance > this.fireDist) { 
          this.firing = false; 
        } 
        else if (this.velocity.length() < 0.01) {
          this.rotation = this.angleToYAxis(dx, dy);
          if (!this.firing) this.weapon.reloading = 500;
          this.firing = true;
          this.weapon.fire(this);
          this.adjustVelocity(0.0, delta);
        }

        if (!this.firing) {
          if (distance > this.stopDist) {
            this.rotation = this.angleToYAxis(dx, dy);
            this.adjustAcceleration(0.001);
          }
          else {
            this.rotation = this.angleToYAxis(this.velocity.x, this.velocity.y);
            this.adjustAcceleration(-0.001);
          }
          this.adjustVelocity(0.19, delta);
        }
    }
    super.update(time, delta);
    this.weapon.update(time, delta);
  }

  adjustAcceleration(acc : number) {
      var angle = this.rotation;
      var y = -acc * Math.cos(angle);
      var x = acc * Math.sin(angle);
      this.acceleration.x = x;
      this.acceleration.y = y;
  }

  adjustVelocity(maxVelocity: number, delta : number)
  {
    this.velocity.x += this.acceleration.x * delta;
    this.velocity.y += this.acceleration.y * delta;

    var vx = this.velocity.x;
    var vy = this.velocity.y;
    var currVelocitySqr = vx * vx + vy * vy;

    if (currVelocitySqr > maxVelocity * maxVelocity)
    {
      var angle = Math.atan2(vy, vx);
      vx = Math.cos(angle) * maxVelocity;
      vy = Math.sin(angle) * maxVelocity;
      this.velocity.x = vx;
      this.velocity.y = vy;
    }
  }

  angleToYAxis(x : number, y : number) {
    var angle = Math.atan2(y, x) + Math.PI / 2
    if (angle > Math.PI) { angle -= 2 * Math.PI; }
    else if (angle <= -Math.PI) { angle += 2 * Math.PI; }
    return angle;
  }
}

export namespace Enemy
{
    export enum EnemyType
    {
      Bomb = 0,
      Basic = 1,
      Advanced = 2
    }
}