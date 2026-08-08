/* main.js - Application Entry Point & UI Controller for Hogwarts Dash */
import { GameEngine } from './engine/GameEngine.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bg-canvas');
  const game = new GameEngine(canvas);
  canvas.__gameEngine = game;

  // UI Screen Elements
  const hud = document.getElementById('hud');
  const mainMenu = document.getElementById('main-menu');
  const shopScreen = document.getElementById('shop-screen');
  const controlsScreen = document.getElementById('controls-screen');
  const pauseScreen = document.getElementById('pause-screen');
  const gameOverScreen = document.getElementById('game-over-screen');

  // HUD Elements
  const scoreDisplay = document.getElementById('score-display');
  const galleonDisplay = document.getElementById('galleon-display');
  const menuHighScore = document.getElementById('menu-high-score');
  const filchWarning = document.getElementById('filch-warning');

  // Power-Up Bar Elements
  const barBroom = document.getElementById('bar-broom');
  const barPatronus = document.getElementById('bar-patronus');
  const barLumos = document.getElementById('bar-lumos');

  // Shop Elements
  const shopGalleonCount = document.getElementById('shop-galleon-count');
  const selectedCharName = document.getElementById('selected-char-name');
  const selectedCharHouse = document.getElementById('selected-char-house');

  const spellCastBtn = document.getElementById('spell-cast-btn');
  if (spellCastBtn) {
    spellCastBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      game.handleAction('spell');
    });
  }

  // Speed Selector Buttons Handler
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const selectedSpeed = e.target.getAttribute('data-speed');
      game.setSpeedMode(selectedSpeed);
    });
  });

  // Update Main Menu High Score & Snitch Balance
  const updateMenuStats = () => {
    menuHighScore.textContent = `${game.shop.data.highScore} m`;
    shopGalleonCount.textContent = game.shop.data.galleons;

    const charNames = {
      harry: 'Harry Potter',
      hermione: 'Hermione Granger',
      ron: 'Ron Weasley'
    };
    const charHouses = {
      harry: 'Gryffindor',
      hermione: 'Gryffindor',
      ron: 'Gryffindor'
    };

    selectedCharName.textContent = charNames[game.shop.data.equippedChar] || 'Harry Potter';
    selectedCharHouse.textContent = charHouses[game.shop.data.equippedChar] || 'Gryffindor';
  };

  updateMenuStats();

  // Navigation Button Listeners
  document.getElementById('start-game-btn').addEventListener('click', () => {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    hud.classList.remove('hidden');
    hud.classList.add('active');
    game.startGame();
  });

  document.getElementById('open-shop-btn').addEventListener('click', () => {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    shopScreen.classList.remove('hidden');
    shopScreen.classList.add('active');
    updateShopUI();
  });

  document.getElementById('close-shop-btn').addEventListener('click', () => {
    shopScreen.classList.remove('active');
    shopScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    updateMenuStats();
  });

  document.getElementById('open-controls-btn').addEventListener('click', () => {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    controlsScreen.classList.remove('hidden');
    controlsScreen.classList.add('active');
  });

  document.getElementById('close-controls-btn').addEventListener('click', () => {
    controlsScreen.classList.remove('active');
    controlsScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
  });

  document.getElementById('pause-btn').addEventListener('click', () => {
    game.pauseGame();
    pauseScreen.classList.remove('hidden');
    pauseScreen.classList.add('active');
  });

  document.getElementById('resume-btn').addEventListener('click', () => {
    pauseScreen.classList.remove('active');
    pauseScreen.classList.add('hidden');
    game.resumeGame();
  });

  document.getElementById('restart-from-pause-btn').addEventListener('click', () => {
    pauseScreen.classList.remove('active');
    pauseScreen.classList.add('hidden');
    game.startGame();
  });

  document.getElementById('quit-to-menu-btn').addEventListener('click', () => {
    pauseScreen.classList.remove('active');
    pauseScreen.classList.add('hidden');
    hud.classList.remove('active');
    hud.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    updateMenuStats();
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    hud.classList.add('active');
    game.startGame();
  });

  document.getElementById('game-over-shop-btn').addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    shopScreen.classList.remove('hidden');
    shopScreen.classList.add('active');
    updateShopUI();
  });

  document.getElementById('game-over-menu-btn').addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    gameOverScreen.classList.add('hidden');
    hud.classList.remove('active');
    hud.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    updateMenuStats();
  });

  // Audio Toggle Button
  document.getElementById('audio-toggle-btn').addEventListener('click', (e) => {
    const isMuted = game.sound.toggleMute();
    e.target.textContent = isMuted ? '🔇' : '🔊';
  });

  // Game Over Event Listener
  game.onGameOverCallback = (finalScore, finalGalleons, isNewRecord) => {
    hud.classList.remove('active');
    hud.classList.add('hidden');
    
    document.getElementById('final-score').textContent = `${finalScore} m`;
    document.getElementById('final-galleons').textContent = `${finalGalleons} ⚡`;

    const recordTag = document.getElementById('new-high-score-tag');
    if (isNewRecord) {
      recordTag.classList.remove('hidden');
    } else {
      recordTag.classList.add('hidden');
    }

    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('active');
  };

  // Shop UI Update & Click Handlers
  const updateShopUI = () => {
    shopGalleonCount.textContent = game.shop.data.galleons;

    // Upgrades Levels
    document.getElementById('lvl-broom').textContent = game.shop.data.upgrades.broom || 1;
    document.getElementById('lvl-patronus').textContent = game.shop.data.upgrades.patronus || 1;
    document.getElementById('lvl-lumos').textContent = game.shop.data.upgrades.lumos || 1;

    // Character Card States
    document.querySelectorAll('.shop-item-card').forEach(card => {
      const charId = card.getAttribute('data-char');
      const statusBox = card.querySelector('.item-status');

      if (game.shop.data.equippedChar === charId) {
        card.classList.add('selected');
        statusBox.innerHTML = `<span class="status-tag equipped">EQUIPPED</span>`;
      } else if (game.shop.data.unlockedChars.includes(charId)) {
        card.classList.remove('selected');
        statusBox.innerHTML = `<button class="btn shop-equip-btn" data-char="${charId}">EQUIP</button>`;
      } else {
        card.classList.remove('selected');
      }
    });

    // Re-bind Equip buttons
    document.querySelectorAll('.shop-equip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const charId = e.target.getAttribute('data-char');
        game.shop.equipCharacter(charId);
        game.initPlayerAndPursuer();
        updateShopUI();
      });
    });
  };

  // Shop Buy Buttons Listener
  document.querySelectorAll('.shop-buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      const id = e.target.getAttribute('data-id');
      const cost = parseInt(e.target.getAttribute('data-cost'));

      if (type === 'char') {
        if (game.shop.unlockCharacter(id, cost)) {
          game.initPlayerAndPursuer();
          updateShopUI();
        } else {
          alert('Not enough Golden Snitches! Catch more Snitches & Beans in your run.');
        }
      }
    });
  });

  document.querySelectorAll('.upgrade-buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      const cost = 50;
      if (game.shop.upgradeItem(type, cost)) {
        updateShopUI();
      } else {
        alert('Not enough Golden Snitches! Catch more Snitches & Beans in your run.');
      }
    });
  });

  // Shop Tab Navigation
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active', 'hidden'));

      e.target.classList.add('active');
      const tabTarget = e.target.getAttribute('data-tab');
      
      document.getElementById(`tab-${tabTarget}`).classList.add('active');
      document.querySelectorAll(`.tab-content:not(#tab-${tabTarget})`).forEach(c => c.classList.add('hidden'));
    });
  });

  // Main UI Loop tick for HUD Stats
  setInterval(() => {
    if (game.gameState === 'PLAYING') {
      scoreDisplay.textContent = `${game.distance} m`;
      galleonDisplay.textContent = `${game.galleonsCollected}`;

      // Filch Warning
      if (game.pursuerDistance < 3.0) {
        filchWarning.classList.remove('hidden');
      } else {
        filchWarning.classList.add('hidden');
      }

      // Active Power-up Progress Bars
      if (game.activePowers.broom > 0) {
        barBroom.classList.remove('hidden');
        barBroom.querySelector('.broom-fill').style.width = `${(game.activePowers.broom / 8) * 100}%`;
      } else {
        barBroom.classList.add('hidden');
      }

      if (game.activePowers.patronus > 0) {
        barPatronus.classList.remove('hidden');
        barPatronus.querySelector('.patronus-fill').style.width = `${(game.activePowers.patronus / 6) * 100}%`;
      } else {
        barPatronus.classList.add('hidden');
      }

      if (game.activePowers.lumos > 0) {
        barLumos.classList.remove('hidden');
        barLumos.querySelector('.lumos-fill').style.width = `${(game.activePowers.lumos / 10) * 100}%`;
      } else {
        barLumos.classList.add('hidden');
      }
    }
  }, 100);
});
