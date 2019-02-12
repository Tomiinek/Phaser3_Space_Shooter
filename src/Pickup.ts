import { Play } from "./Play";
import { StaticUFO } from "./StaticUFO";

export class Pickup extends StaticUFO {

  kind: Pickup.PickupType;

  constructor(scene: Phaser.Scene) {  
    super(scene, "pickup");
    Phaser.Physics.Arcade.Sprite.call(this, this.scene, this.x, this.y, "");
  }

  killEffect(game: Play){
    switch (+this.kind) {
      case Pickup.PickupType.Health:
          game.health++;
          game.updateHealth(); 
          break;
      case Pickup.PickupType.Shield:
          game.shield.activate();
          break;
      case Pickup.PickupType.Weapon:
          game.gun.setFurious(7500, 200);
          break;    
      }
  }
  
  launchRandom(x: number, y: number, player : Phaser.Physics.Arcade.Sprite) {   

    super.init(player);

    this.setScale(Number(this.scene.game.config.height) / 484);

    this.kind = Phaser.Math.Between(0, 2);  
    var spriteName;
    switch (+this.kind) {
    case Pickup.PickupType.Health:
        this.setTexture("pickupHealth");
        this.setSize(20, 20);
        break;
    case Pickup.PickupType.Shield:
        this.setTexture("pickupShield");
        this.setSize(30, 30);
        break;
    case Pickup.PickupType.Weapon:
        this.setTexture("pickupWeapon");
        this.setSize(15, 25);
        break;    
    }

    this.setPosition(x, y);
    super.show()
  }
}

export namespace Pickup
{
    export enum PickupType
    {
      Shield = 0,
      Health = 1,
      Weapon = 2
    }
}