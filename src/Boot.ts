 export class Boot extends Phaser.Scene {

  constructor(){
    super("Boot");
  }

  preload() {
    this.load.setBaseURL("https://cdn.jsdelivr.net/gh/Tomiinek/Phaser3_Space_Shooter/img");
    
    this.load.image("numeral0", "numeral0.png");
    this.load.image("numeral1", "numeral1.png");
    this.load.image("numeral2", "numeral2.png");
    this.load.image("numeral3", "numeral3.png");
    this.load.image("numeral4", "numeral4.png");
    this.load.image("numeral5", "numeral5.png");
    this.load.image("numeral6", "numeral6.png");
    this.load.image("numeral7", "numeral7.png");
    this.load.image("numeral8", "numeral8.png");
    this.load.image("numeral9", "numeral9.png");

    this.load.image("playership1", "playerShip1_orange.png");
    this.load.image("bulletRed", "laserRed01.png");
    this.load.image("bulletBlue", "laserBlue01.png");

    this.load.image("enemy1", "enemyBlack4.png");
    this.load.image("enemy2", "enemyBlack1.png");
    this.load.image("enemy3", "enemyBlack2.png");

    this.load.image("shield1", "shield1.png");
    
    this.load.image("pickupWeapon", "bolt_gold.png");
    this.load.image("pickupHealth", "pill_red.png");
    this.load.image("pickupShield", "shield_gold.png");

    this.load.image("stoneBig", "meteorGrey_big1.png");
    this.load.image("stoneMed", "meteorGrey_med1.png");
    this.load.image("stoneSmall", "meteorGrey_small1.png");

    this.load.image("explosion", "star1.png");
  }

  create() {
    this.add.text(Number(this.game.config.width) / 2 - 130, Number(this.game.config.height) / 2 - 25, 'Press any KEY to play', { font: '25px Arial', fill: '#ffffff' });
    this.input.keyboard.on('keyup', function () { this.scene.start('Play'); }, this);
  }

 }
