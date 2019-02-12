import { Bullet } from "./Bullet";

export class Gun {

  reloading: number;
  cooldown: number;

  furious: boolean;
  furiosityCooldown: number;
  furiosityActiveTime: number;

  laserGroup: Phaser.Physics.Arcade.Group;
  kind: Gun.GunType;
  color: Bullet.BulletColor;

  constructor(cooldown: number, laserGroup: Phaser.Physics.Arcade.Group, kind: Gun.GunType, color: Bullet.BulletColor) {
    this.laserGroup = laserGroup;
    this.cooldown = cooldown;
    this.reloading = 0;
    this.kind = kind;
    this.color = color;
  }

  upgrade() {
    if (this.kind == Gun.GunType.Triple) return;
    ++this.kind;
  }

  setWeapon(weapon: Gun.GunType){
    this.kind = weapon;
  }

  setCooldown(cooldown: number) {
    this.cooldown = cooldown;
  }

  setFurious(duration: number, cooldown: number){
      this.furiosityActiveTime = duration;
      this.furiosityCooldown = cooldown;
      this.furious = true; 
  }

  fire(shooter : Phaser.Physics.Arcade.Sprite){
    if (this.reloading > 0) return;
    this.reloading = (this.furious ? this.furiosityCooldown : this.cooldown);
    if (this.kind == Gun.GunType.Single || this.kind == Gun.GunType.Triple){
      let b: Bullet = this.laserGroup.get() as Bullet;
      if (b) b.fire(0, 30, shooter, this.color); 
    }
    if (this.kind == Gun.GunType.Double || this.kind == Gun.GunType.Triple){
      let b1: Bullet = this.laserGroup.get() as Bullet;
      if (b1) b1.fire(20, 20, shooter, this.color); 
      let b2: Bullet = this.laserGroup.get() as Bullet;
      if (b2) b2.fire(-20, 20, shooter, this.color); 
    }
  }

  update(time: number, delta: number) {
    if (this.furious) {
      if (this.furiosityActiveTime > 0) this.furiosityActiveTime -= delta;
      else this.furious = false;
    }
    if (this.reloading > 0) this.reloading -= delta;
  }

}

export namespace Gun
{
    export enum GunType
    {
      Single = 0,
      Double = 1,
      Triple = 2
    }
}
