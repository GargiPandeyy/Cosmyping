class Player {
    constructor() {
        this.score = 0;
        this.combo = 1;
        this.maxCombo = 1;
        this.wpm = 0;
        this.wordsTyped = [];
        this.lives = 3;
        this.maxLives = 3;
        this.dataFragments = 0;
        this.startTime = Date.now();
        this.wordsCount = 0;
        this.upgrades = {
            engineCore: 0,
            shieldGenerator: 0,
            cognitiveMatrix: false,
            dataScrubber: 0
        };
        this.abilities = {
            nova: { cooldown: 0, maxCooldown: 300 },
            timeWarp: { cooldown: 0, maxCooldown: 450 },
            focus: { cooldown: 0, maxCooldown: 600 }
        };
    }

    addScore(basePoints) {
        this.score += Math.floor(basePoints * this.combo);
    }

    addCombo() {
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
    }

    resetCombo() {
        this.combo = 1;
    }

    loseLife() {
        this.lives--;
        this.resetCombo();
    }

    addLife() {
        if (this.lives < this.maxLives) {
            this.lives++;
        }
    }

    addDataFragment(amount) {
        const multiplier = 1 + (this.upgrades.dataScrubber * 0.25);
        this.dataFragments += Math.floor(amount * multiplier);
    }

    updateWPM() {
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60;
        this.wpm = this.wordsCount / timeElapsed || 0;
    }

    getScoreBonus() {
        return Math.floor(this.wpm * 0.1);
    }

    canBuyUpgrade(cost) {
        return this.dataFragments >= cost;
    }

    buyUpgrade(cost) {
        if (this.canBuyUpgrade(cost)) {
            this.dataFragments -= cost;
            return true;
        }
        return false;
    }

    upgradeEngineCore() {
        const cost = (this.upgrades.engineCore + 1) * 50;
        if (this.buyUpgrade(cost)) {
            this.upgrades.engineCore++;
            return true;
        }
        return false;
    }

    upgradeShieldGenerator() {
        const cost = (this.upgrades.shieldGenerator + 1) * 75;
        if (this.buyUpgrade(cost)) {
            this.upgrades.shieldGenerator++;
            this.addLife();
            this.maxLives++;
            return true;
        }
        return false;
    }

    upgradeCognitiveMatrix() {
        const cost = 200;
        if (!this.upgrades.cognitiveMatrix && this.buyUpgrade(cost)) {
            this.upgrades.cognitiveMatrix = true;
            return true;
        }
        return false;
    }

    upgradeDataScrubber() {
        const cost = (this.upgrades.dataScrubber + 1) * 100;
        if (this.buyUpgrade(cost)) {
            this.upgrades.dataScrubber++;
            return true;
        }
        return false;
    }

    updateAbilities() {
        for (let ability in this.abilities) {
            if (this.abilities[ability].cooldown > 0) {
                this.abilities[ability].cooldown--;
            }
        }
    }

    canUseAbility(name) {
        return this.abilities[name].cooldown <= 0;
    }

    useAbility(name) {
        if (this.canUseAbility(name)) {
            this.abilities[name].cooldown = this.abilities[name].maxCooldown;
            return true;
        }
        return false;
    }

    reset() {
        this.score = 0;
        this.combo = 1;
        this.maxCombo = 1;
        this.wordsCount = 0;
        this.startTime = Date.now();
        this.lives = this.maxLives;
    }

    save() {
        const saveData = {
            dataFragments: this.dataFragments,
            upgrades: this.upgrades,
            maxLives: this.maxLives,
            schemaVersion: 1
        };
        localStorage.setItem('cosmyping_save', JSON.stringify(saveData));
    }

    load() {
        const saveData = localStorage.getItem('cosmyping_save');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                if (data.schemaVersion === 1) {
                    this.dataFragments = data.dataFragments || 0;
                    this.upgrades = data.upgrades || this.upgrades;
                    this.maxLives = data.maxLives || 3;
                    this.lives = this.maxLives;
                }
            } catch (e) {
                console.error('Failed to load save data:', e);
            }
        }
    }
}

