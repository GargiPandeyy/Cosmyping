class PlayerShip {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetY = y;
        this.size = 60;
        this.bobPhase = 0;
        this.bobSpeed = 0.05;
        this.bobAmount = 3;
        this.engineParticles = [];
        this.shieldOpacity = 0;
        this.shieldPulse = 0;
    }

    update(mouseY, hasShield) {

        if (mouseY !== undefined) {
            this.targetY = mouseY;
        }
        this.y += (this.targetY - this.y) * 0.1;

        this.bobPhase += this.bobSpeed;
        const bobOffset = Math.sin(this.bobPhase) * this.bobAmount;

        if (Math.random() < 0.3) {
            this.engineParticles.push({
                x: this.x - this.size * 0.3,
                y: this.y + bobOffset + (Math.random() - 0.5) * 10,
                vx: -Utils.random(1, 3),
                vy: (Math.random() - 0.5) * 1,
                size: Utils.random(2, 5),
                life: 30,
                maxLife: 30,
                color: Utils.choose(['#00d9ff', '#0080ff', '#ffffff'])
            });
        }

        this.engineParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.size *= 0.96;
        });
        this.engineParticles = this.engineParticles.filter(p => p.life > 0);

        if (hasShield) {
            this.shieldOpacity = Math.min(this.shieldOpacity + 0.05, 0.6);
            this.shieldPulse += 0.1;
        } else {
            this.shieldOpacity = Math.max(this.shieldOpacity - 0.05, 0);
        }
    }

    draw(ctx) {
        const bobOffset = Math.sin(this.bobPhase) * this.bobAmount;
        const shipY = this.y + bobOffset;

        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00d9ff';

        this.engineParticles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.fillStyle = `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();

        ctx.save();
        ctx.translate(this.x, shipY);

        ctx.fillStyle = '#4a90e2';
        ctx.strokeStyle = '#2c5f9e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.size * 0.4, 0);
        ctx.lineTo(-this.size * 0.4, -this.size * 0.3);
        ctx.lineTo(-this.size * 0.4, this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00d9ff';
        ctx.beginPath();
        ctx.arc(this.size * 0.15, 0, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a4d7a';
        ctx.fillRect(-this.size * 0.3, -this.size * 0.25, this.size * 0.2, this.size * 0.1);
        ctx.fillRect(-this.size * 0.3, this.size * 0.15, this.size * 0.2, this.size * 0.1);

        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(-this.size * 0.35, -this.size * 0.2, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-this.size * 0.35, this.size * 0.2, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00d9ff';
        ctx.fillStyle = '#00d9ff';
        ctx.beginPath();
        ctx.arc(-this.size * 0.35, -this.size * 0.2, this.size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-this.size * 0.35, this.size * 0.2, this.size * 0.05, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (this.shieldOpacity > 0) {
            ctx.save();
            const pulse = Math.sin(this.shieldPulse) * 0.2 + 0.8;
            ctx.strokeStyle = `rgba(0, 255, 255, ${this.shieldOpacity * pulse})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, shipY, this.size * 0.8 * pulse, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(0, 217, 255, ${this.shieldOpacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, shipY, this.size * 0.7 * pulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.targetY = y;
    }
}
