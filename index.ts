// STYLES
import './style.css';

// DEPENDENCIES
import 'phaser';

// RUN MAIN
import { gameConfig } from './src/ZGame';

var game = new Phaser.Game(gameConfig);
window.focus();