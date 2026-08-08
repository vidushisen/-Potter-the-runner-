/* Shop.js - Persistent LocalStorage Manager for Characters & Upgrades */

export class Shop {
  constructor() {
    this.storageKey = 'hogwarts_dash_save_data';
    this.data = this.loadData();
  }

  loadData() {
    const defaultData = {
      galleons: 0,
      highScore: 0,
      equippedChar: 'harry',
      unlockedChars: ['harry'],
      upgrades: {
        broom: 1,
        patronus: 1,
        lumos: 1
      }
    };

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return { ...defaultData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using defaults');
    }

    return defaultData;
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save failed');
    }
  }

  addGalleons(count) {
    this.data.galleons += count;
    this.saveData();
  }

  updateHighScore(score) {
    if (score > this.data.highScore) {
      this.data.highScore = score;
      this.saveData();
      return true;
    }
    return false;
  }

  unlockCharacter(charId, cost) {
    if (this.data.galleons >= cost && !this.data.unlockedChars.includes(charId)) {
      this.data.galleons -= cost;
      this.data.unlockedChars.push(charId);
      this.data.equippedChar = charId;
      this.saveData();
      return true;
    }
    return false;
  }

  equipCharacter(charId) {
    if (this.data.unlockedChars.includes(charId)) {
      this.data.equippedChar = charId;
      this.saveData();
      return true;
    }
    return false;
  }

  upgradeItem(type, cost) {
    if (this.data.galleons >= cost) {
      this.data.galleons -= cost;
      this.data.upgrades[type] = (this.data.upgrades[type] || 1) + 1;
      this.saveData();
      return true;
    }
    return false;
  }
}
