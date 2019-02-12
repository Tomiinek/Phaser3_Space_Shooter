import { StaticUFO } from "./StaticUFO";
import { Play } from "./Play";

export class Stone extends StaticUFO {

  kind: Stone.StoneType;
  velocity: Phaser.Math.Vector2;  
  acceleration: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene) {
    super(scene, "stone");
    Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y, "");
    this.velocity = new Phaser.Math.Vector2();
    this.acceleration = new Phaser.Math.Vector2();
  }

  launch(kind: Stone.StoneType, x: number, y: number, player: Phaser.Physics.Arcade.Sprite) {

    super.init(player);
    
    this.kind = kind;     
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.acceleration.x = 0;
    this.acceleration.y = 0;

    this.setScale(Number(this.scene.game.config.height) / 484);
    
    switch (+this.kind) {
    case Stone.StoneType.Large:
        this.setTexture("stoneBig");
        this.setCircle(45, 5, -3);
        break;
    case Stone.StoneType.Medium:
        this.setTexture("stoneMed");
        this.setCircle(21, 1, 0);
        break;
    case Stone.StoneType.Small:
        this.setTexture("stoneSmall");
        this.setCircle(13, 1, 0);
        break;    
    }

    this.setRotation(Phaser.Math.FloatBetween(0, 2 * Math.PI));
    this.setPosition(x, y);
    super.show();
  }

  launchInDirection(kind : Stone.StoneType, x: number, y: number, dx : number, dy: number, acc : number, player : Phaser.Physics.Arcade.Sprite) {
    this.launch(kind, x, y, player);
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx;
    this.acceleration.y = dy; 
    this.acceleration.normalize();
    this.acceleration.scale(-acc);
  }

  launchRandom(x: number, y: number, player : Phaser.Physics.Arcade.Sprite) {      
    var rnd = Phaser.Math.Between(0, 9);
    var kind = Stone.StoneType.Small;
    if (rnd <= 1) kind = Stone.StoneType.Large;
    else if (rnd <= 5) kind = Stone.StoneType.Medium;
    this.launch(kind, x, y, player);
  }

  killEffect(game: Play){
    if (this.kind == Stone.StoneType.Small) return;
    for (var _i = 0; _i < (this.kind == Stone.StoneType.Medium ? 2 : 3); _i++) {
      let s : Stone = game.stones.get() as Stone;
      if (s) {
        var velocity = Phaser.Math.FloatBetween(0.1, 0.225);
        var angle = Phaser.Math.Between(0, 360);
        var acc = Phaser.Math.FloatBetween(0.0005, 0.00075);
        s.launchInDirection(Stone.StoneType.Small, this.x, this.y, velocity * Math.cos(angle), velocity * Math.sin(angle), acc, this.player);     
      }
    }
  }

  update(time: number, delta: number) {  

    if (this.velocity.x != 0) {
      this.x += this.velocity.x * delta;
      var newVelocity =  this.velocity.x + this.acceleration.x * delta;
      if (this.velocity.x * newVelocity < 0) {
        this.velocity.x = 0;
        this.acceleration.x = 0;
      }
      else this.velocity.x = newVelocity;
    }

    if (this.velocity.y != 0) {
      this.y += this.velocity.y * delta;
      var newVelocity =  this.velocity.y + this.acceleration.y * delta;
      if (this.velocity.y * newVelocity < 0) {
        this.velocity.y = 0;
        this.acceleration.y = 0;
      }
      else this.velocity.y = newVelocity;
    }
    
    super.update(time, delta);
  }
}

export namespace Stone
{
    export enum StoneType
    {
      Large = 0,
      Medium = 1,
      Small = 2
    }
}