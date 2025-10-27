class Particle {
    constructor(x, y, color, velocity = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity || {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        };
        this.lifespan = 60;
        this.maxLifespan = 60;
        this.size = Utils.random(2, 5);
        this.alpha = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
        this.rotation += this.rotationSpeed;
        this.lifespan--;
        this.alpha = this.lifespan / this.maxLifespan;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.lifespan <= 0;
    }
}

class ExplosionParticle extends Particle {
    constructor(x, y, color) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Utils.random(2, 8);
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        super(x, y, color, velocity);
        this.size = Utils.random(3, 8);
        this.lifespan = Utils.random(30, 60);
        this.maxLifespan = this.lifespan;
    }
}

class DebrisParticle extends Particle {
    constructor(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Utils.random(1, 4);
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        super(x, y, '#888888', velocity);
        this.width = Utils.random(3, 8);
        this.height = Utils.random(3, 8);
        this.lifespan = Utils.random(40, 80);
        this.maxLifespan = this.lifespan;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

class Shockwave {
    constructor(x, y, color, maxRadius = 100) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.lifespan = 30;
        this.maxLifespan = 30;
        this.alpha = 1;
    }

    update() {
        this.radius += (this.maxRadius - this.radius) * 0.2;
        this.lifespan--;
        this.alpha = this.lifespan / this.maxLifespan;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.5;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    isDead() {
        return this.lifespan <= 0;
    }
}
