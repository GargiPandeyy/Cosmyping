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
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.1;
        this.lifespan--;
        this.alpha = this.lifespan / this.maxLifespan;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.lifespan <= 0;
    }
}

