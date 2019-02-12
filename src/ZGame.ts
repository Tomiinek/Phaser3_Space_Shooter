import { Boot } from "./Boot";
import { Play } from "./Play";

export var gameConfig = {
         type: Phaser.AUTO,
        width: 800,
        height: 484,
        backgroundColor: 0x021631,
        physics: {
            default: 'arcade',
            arcade: {
                // debug: true,
                gravity: { y: 0 }
            }
        },
        scene: [Boot, Play],       
    };