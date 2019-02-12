export class Shield extends Phaser.Physics.Arcade.Sprite {

  cooldown: number;
  activeTime: number;
  player: Phaser.Physics.Arcade.Sprite; 

  constructor(cooldown: number, player: Phaser.Physics.Arcade.Sprite, scene: Phaser.Scene) {
    super(scene, 0, 0, "shield");
    this.cooldown = cooldown;
    this.player = player;
    Phaser.Physics.Arcade.Sprite.call(this, this.scene, Number(this.scene.game.config.width), Number(this.scene.game.config.height), "shield1");
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }

  isActive() : boolean {  
    return this.activeTime > 0;
  }

  activate() {
    this.setActive(true);
    this.setVisible(true);
    this.activeTime = this.cooldown;
    this.alpha = 0;
  }
   
  update(time: number, delta: number) {
    if (this.activeTime > 0) {
      this.alpha = Math.sin(this.activeTime / this.cooldown * Math.PI / 2);
      this.activeTime -= delta;
    }
    else this.setVisible(false);
    this.setPosition(this.player.x, this.player.y);
    this.setRotation(this.player.rotation);
  }
}
