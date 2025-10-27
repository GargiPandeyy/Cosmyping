
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
    constructor(x, y, word, size = 60) {
        super(x, y, word);
        this.speed = Utils.random(0.8, 2);
        this.size = size;
        this.color = '#ffaa00';
        this.jitterAmount = 3;
        this.angle = 0;
        this.rotationSpeed = Utils.random(0.02, 0.08);
        this.trail = [];
        this.vertices = this.generateAsteroidShape();
        this.craters = this.generateCraters();
        this.canFragment = size >= 60;
    }

    generateAsteroidShape() {
        const vertices = [];
        const points = Utils.randomInt(6, 10);
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points;
            const variance = Utils.random(0.7, 1.3);
            vertices.push({
                angle: angle,
                distance: (this.size / 2) * variance
            });
        }
        return vertices;
    }

    generateCraters() {
        const craters = [];
        const numCraters = Utils.randomInt(2, 5);
        for (let i = 0; i < numCraters; i++) {
            craters.push({
                angle: Math.random() * Math.PI * 2,
                distance: Utils.random(0, this.size * 0.3),
                size: Utils.random(this.size * 0.1, this.size * 0.2)
            });
        }
        return craters;
    }

    update() {

        this.trail.push({ x: this.x + this.size / 2, y: this.y + this.size / 2, alpha: 1 });
        if (this.trail.length > 10) {
            this.trail.shift();
        }

        this.trail.forEach((point, i) => {
            point.alpha = i / this.trail.length;
        });

        this.angle += this.rotationSpeed;
        this.jitter = Math.sin(this.angle * 2) * this.jitterAmount;
        this.y += this.jitter;
        super.update();
    }

    draw(ctx) {

        ctx.save();
        this.trail.forEach(point => {
            ctx.globalAlpha = point.alpha * 0.3;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size * 0.2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.angle);

        const gradient = ctx.createRadialGradient(
            -this.size * 0.2, -this.size * 0.2, 0,
            0, 0, this.size / 2
        );
        gradient.addColorStop(0, '#ffcc66');
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, '#995500');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#995500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.vertices.forEach((v, i) => {
            const x = Math.cos(v.angle) * v.distance;
            const y = Math.sin(v.angle) * v.distance;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#663300';
        this.craters.forEach(crater => {
            const x = Math.cos(crater.angle) * crater.distance;
            const y = Math.sin(crater.angle) * crater.distance;
            ctx.beginPath();
            ctx.arc(x, y, crater.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.strokeStyle = '#ffdd88';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        this.vertices.slice(0, 3).forEach((v, i) => {
            const x = Math.cos(v.angle) * v.distance * 0.9;
            const y = Math.sin(v.angle) * v.distance * 0.9;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px monospace';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000000';
        ctx.fillText(this.word, this.x, this.y - 15);
        ctx.shadowBlur = 0;
    }

    createFragments() {
        if (!this.canFragment) return [];

        const fragments = [];
        const numFragments = 3;
        for (let i = 0; i < numFragments; i++) {
            const angle = (Math.PI * 2 * i) / numFragments;
            const fragment = new AsteroidFragment(
                this.x + this.size / 2,
                this.y + this.size / 2,
                angle
            );
            fragments.push(fragment);
        }
        return fragments;
    }
}

class AsteroidFragment {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.size = Utils.random(15, 25);
        this.speed = Utils.random(1, 3);
        this.angle = angle;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Utils.random(0.05, 0.15);
        this.color = Utils.choose(['#ffaa00', '#ff8800', '#cc6600']);
        this.lifespan = 60;
        this.maxLifespan = 60;
        this.vertices = this.generateShape();
    }

    generateShape() {
        const vertices = [];
        const points = Utils.randomInt(4, 6);
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points;
            const variance = Utils.random(0.6, 1.2);
            vertices.push({
                angle: angle,
                distance: (this.size / 2) * variance
            });
        }
        return vertices;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.lifespan--;
    }

    draw(ctx) {
        const alpha = this.lifespan / this.maxLifespan;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#995500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        this.vertices.forEach((v, i) => {
            const x = Math.cos(v.angle) * v.distance;
            const y = Math.sin(v.angle) * v.distance;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    isDead() {
        return this.lifespan <= 0;
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
        this.pulsePhase = 0;
        this.damageFlash = 0;
        this.weakPointGlow = 0;
        this.engineParticles = [];
    }

    update() {
        if (!this.shieldActive) {
            this.targetingPhase = true;
        }

        this.pulsePhase += 0.05;
        this.weakPointGlow += 0.1;

        if (this.damageFlash > 0) {
            this.damageFlash--;
        }

        if (Math.random() < 0.2) {
            this.engineParticles.push({
                x: this.x - 10,
                y: this.y + this.size / 2 + (Math.random() - 0.5) * 40,
                vx: -Utils.random(0.5, 2),
                vy: (Math.random() - 0.5) * 0.5,
                size: Utils.random(3, 6),
                life: 40,
                maxLife: 40
            });
        }

        this.engineParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
        });
        this.engineParticles = this.engineParticles.filter(p => p.life > 0);
    }

    takeDamage(amount) {
        this.damageFlash = 10;

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
        const pulse = Math.sin(this.pulsePhase) * 0.1 + 0.9;
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;

        this.engineParticles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.save();

        const gradient = ctx.createRadialGradient(
            centerX - 20, centerY - 20, 0,
            centerX, centerY, this.size
        );
        gradient.addColorStop(0, '#ff4444');
        gradient.addColorStop(0.5, '#cc0000');
        gradient.addColorStop(1, '#660000');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';

        if (this.damageFlash > 0) {
            ctx.fillStyle = '#ffffff';
        }

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + Math.cos(angle) * (this.size / 2) * pulse;
            const y = centerY + Math.sin(angle) * (this.size / 2) * pulse;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#990000';
        ctx.strokeStyle = '#440000';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + Math.cos(angle) * (this.size / 3);
            const y = centerY + Math.sin(angle) * (this.size / 3);
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        const coreGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 30
        );
        coreGradient.addColorStop(0, '#ffff00');
        coreGradient.addColorStop(0.5, '#ff8800');
        coreGradient.addColorStop(1, '#ff0000');

        ctx.fillStyle = coreGradient;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (this.shieldActive) {
            const shieldPulse = Math.sin(this.pulsePhase * 2) * 0.2 + 0.8;

            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 5;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.globalAlpha = shieldPulse;

            ctx.beginPath();
            ctx.arc(centerX, centerY, this.size * 0.7, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(0, 255, 255, ${shieldPulse * 0.5})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i + this.pulsePhase * 0.5;
                const x = centerX + Math.cos(angle) * (this.size * 0.7);
                const y = centerY + Math.sin(angle) * (this.size * 0.7);

                ctx.beginPath();
                for (let j = 0; j < 6; j++) {
                    const hexAngle = (Math.PI / 3) * j;
                    const hx = x + Math.cos(hexAngle) * 15;
                    const hy = y + Math.sin(hexAngle) * 15;
                    if (j === 0) ctx.moveTo(hx, hy);
                    else ctx.lineTo(hx, hy);
                }
                ctx.closePath();
                ctx.stroke();
            }
            ctx.restore();

            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 16px monospace';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#000000';
            ctx.fillText('SHIELDS ACTIVE', this.x, this.y - 30);
            ctx.fillText(`${Math.ceil(this.shieldHealth)}/${this.maxShieldHealth}`, this.x + 20, this.y - 10);
            ctx.shadowBlur = 0;
        } else {

            const weakGlow = Math.sin(this.weakPointGlow) * 0.3 + 0.7;
            ctx.save();
            ctx.fillStyle = `rgba(255, 50, 50, ${weakGlow})`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0000';

            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI * 2 / 3) * i;
                const x = centerX + Math.cos(angle) * (this.size / 3);
                const y = centerY + Math.sin(angle) * (this.size / 3);
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 16px monospace';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#000000';
            ctx.fillText(`HULL INTEGRITY: ${Math.ceil(this.health)}/${this.maxHealth}`, this.x, this.y - 20);
            ctx.shadowBlur = 0;
        }

        if (this.targetingPhase && this.words && this.words[this.currentWordIndex]) {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 20px monospace';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#000000';
            ctx.fillText(this.words[this.currentWordIndex], centerX - 50, this.y + this.size + 30);
            ctx.shadowBlur = 0;
        }
    }

    getCurrentTargetWord() {
        if (this.targetingPhase && this.words && this.words[this.currentWordIndex]) {
            return this.words[this.currentWordIndex];
        }
        return null;
    }
}
