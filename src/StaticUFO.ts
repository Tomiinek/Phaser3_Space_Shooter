import { Play } from "./Play";

export class StaticUFO extends Phaser.Physics.Arcade.Sprite {

  player: Phaser.Physics.Arcade.Sprite;
  lastPlayerX: number;
  lastPlayerY: number;
  offset: number;

  constructor(scene: Phaser.Scene, name: string) {
    super(scene, 0, 0, name);
    this.offset = 200;
  }

  init(player : Phaser.Physics.Arcade.Sprite) {
    this.player = player;
    this.lastPlayerX = player.x;
    this.lastPlayerY = player.y;
  }

  show() {
    this.scene.physics.add.existing(this);
    this.setActive(true);
    this.setVisible(true);
  }

  killEffect(game : Play) {}

  update(time: number, delta: number) {

    var xDiff = this.player.x - this.lastPlayerX;
    var yDiff = this.player.y - this.lastPlayerY;
    this.y -= yDiff;
    this.x -= xDiff;
    this.lastPlayerX = this.player.x;
    this.lastPlayerY = this.player.y;

    var viewCenter = this.scene.cameras.main.midPoint;
    var halfHeight = (Number(this.scene.game.config.height) + this.offset) / 2;
    var halfWidth = (Number(this.scene.game.config.width) + this.offset) / 2;

    if (this.y > viewCenter.y + halfHeight ||
        this.y < viewCenter.y - halfHeight || 
        this.x > viewCenter.x + halfWidth ||
        this.x < viewCenter.x - halfWidth )
    {
      this.setActive(false);
      this.setVisible(false);
    }
  }
  
  get Y():number { return this.y; }
  get X():number { return this.x; }
}