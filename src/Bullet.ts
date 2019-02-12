import { StaticUFO } from "./StaticUFO";
    
export class Bullet extends StaticUFO {
  
  player: Phaser.Physics.Arcade.Sprite;
  lastPlayerX: number;
  lastPlayerY: number;

  constructor(scene: Phaser.Scene){
    super(scene, "bullet");
    Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y, "");
  }
  
  fire(offsetX: number, offsetY: number, player: Phaser.Physics.Arcade.Sprite, color: Bullet.BulletColor) {
         
    super.init(player);

    switch (+color) {
    case Bullet.BulletColor.Red:
        this.setTexture("bulletRed");
        break;
    case Bullet.BulletColor.Blue:
        this.setTexture("bulletBlue");
        break;
    }

    this.setScale(Number(this.scene.game.config.height) / 645);
    this.setCircle(7, -2, 20);

    var ca = Math.cos(this.player.rotation - Math.PI / 2);
    var sa = Math.sin(this.player.rotation - Math.PI / 2);
    this.setPosition(this.player.x + ca * offsetY - sa * offsetX, this.player.y + sa * offsetY + ca * offsetX);
    this.setRotation(this.player.rotation);

    var speed = Phaser.Math.GetSpeed(500, 1);
    this.setVelocity(speed * ca, speed * sa);

    super.show();
  }

  update(time: number, delta: number)
  {
    this.x += this.body.velocity.x * delta;
    this.y += this.body.velocity.y * delta;
    super.update(time, delta);
  }
  
}

export namespace Bullet
{
    export enum BulletColor
    {
      Red = 0,
      Blue = 1
    }
}
