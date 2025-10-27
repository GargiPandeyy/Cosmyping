class Enemy {
    constructor(x, y, word) {
        this.x = x;
        this.y = y;
        this.word = word;
        this.typed = '';
        this.speed = 1;
        this.size = 50;
        this.color = '#ff4444';
        this.active = true;
        this.offscreen = false;
        this.jitter = 0;
        this.phase = 0;
    }

    update() {
        this.x -= this.speed;
        if (this.x + this.size < 0) {
            this.active = false;
            this.offscreen = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText(this.word, this.x, this.y - 10);
    }

    isDead() {
        return !this.active;
    }
}

class Drone extends Enemy {
    constructor(x, y, word) {
        super(x, y, word);
        this.speed = 2.5;
        this.size = 40;
        this.color = '#ff6666';
    }

    update() {
        super.update();
        this.y += Math.sin(this.x * 0.1) * 0.3;
    }
}

class Cruiser extends Enemy {
    constructor(x, y, word) {
        super(x, y, word);
        this.speed = 1.2;
        this.size = 80;
        this.color = '#8888ff';
        this.shield = true;
    }

    draw(ctx) {
        if (this.shield) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 5, this.y - 5, this.size + 10, this.size + 10);
        }
        super.draw(ctx);
    }
}

class CorruptedAsteroid extends Enemy {
    constructor(x, y, word) {
        super(x, y, word);
        this.speed = Utils.random(0.8, 2);
        this.size = 60;
        this.color = '#ffaa00';
        this.jitterAmount = 3;
        this.angle = 0;
    }

    update() {
        this.angle += 0.1;
        this.jitter = Math.sin(this.angle) * this.jitterAmount;
        this.y += this.jitter;
        super.update();
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const x = Math.cos(angle) * (this.size / 2);
            const y = Math.sin(angle) * (this.size / 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px monospace';
        ctx.fillText(this.word, this.x, this.y - 10);
    }
}

class Mine extends Enemy {
    constructor(x, y) {
        super(x, y, 'DEFUSE');
        this.size = 50;
        this.color = '#ff00ff';
        this.speed = 0;
        this.timer = 180;
        this.maxTimer = 180;
        this.blinking = false;
        this.blinkTimer = 0;
    }

    update() {
        this.timer--;
        this.blinkTimer++;
        if (this.blinkTimer > 10) {
            this.blinking = !this.blinking;
            this.blinkTimer = 0;
        }

        if (this.timer <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.blinking ? 0.5 : 1;
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText(this.word, this.x, this.y - 10);

        const timeLeft = Math.ceil(this.timer / 60);
        ctx.font = '16px monospace';
        ctx.fillText(timeLeft.toString(), this.x + this.size + 5, this.y + this.size / 2);
    }

    getTimeRemaining() {
        return Math.ceil(this.timer / 60);
    }
}

class Boss extends Enemy {
    constructor(x, y, words, phases) {
        super(x, y, 'BOSS');
        this.size = 150;
        this.speed = 0.3;
        this.color = '#ff0000';
        this.health = 100;
        this.maxHealth = 100;
        this.words = words;
        this.currentWordIndex = 0;
        this.phase = 0;
        this.totalPhases = phases || 3;
        this.shieldHealth = 50;
        this.maxShieldHealth = 50;
        this.shieldActive = true;
        this.targetingPhase = false;
    }

    update() {
        if (!this.shieldActive) {
            this.targetingPhase = true;
        }
    }

    takeDamage(amount) {
        if (this.shieldActive) {
            this.shieldHealth -= amount;
            if (this.shieldHealth <= 0) {
                this.shieldActive = false;
                this.shieldHealth = 0;
                return 'shieldbroken';
            }
        } else {
            this.health -= amount;
            if (this.health <= 0) {
                this.active = false;
                return 'destroyed';
            }
        }
        return 'damage';
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        if (this.shieldActive) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x - 10, this.y - 10, this.size + 20, this.size + 20);

            ctx.fillStyle = '#00ffff';
            ctx.font = '16px monospace';
            ctx.fillText('SHIELDS', this.x, this.y - 20);
            ctx.fillText(`${Math.ceil(this.shieldHealth)}/${this.maxShieldHealth}`, this.x, this.y - 5);
        } else {
            ctx.fillStyle = '#ff0000';
            ctx.font = '16px monospace';
            ctx.fillText(`HEALTH: ${Math.ceil(this.health)}/${this.maxHealth}`, this.x, this.y - 20);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        if (this.targetingPhase && this.words && this.words[this.currentWordIndex]) {
            ctx.fillText(this.words[this.currentWordIndex], this.x, this.y + this.size + 20);
        }
    }

    getCurrentTargetWord() {
        if (this.targetingPhase && this.words && this.words[this.currentWordIndex]) {
            return this.words[this.currentWordIndex];
        }
        return null;
    }
}

