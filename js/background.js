class Star {
    constructor(x, y, size, speed, layer) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.layer = layer;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.x -= this.speed;
        this.twinklePhase += this.twinkleSpeed;
    }

    draw(ctx, canvas) {
        if (this.x < 0) {
            this.x = canvas.width;
        }

        const twinkle = Math.sin(this.twinklePhase) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity + twinkle})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.size > 1.5) {
            ctx.fillStyle = `rgba(200, 220, 255, ${(this.opacity + twinkle) * 0.3})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Planet {
    constructor(x, y, size, color, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.001 - 0.0005;
    }

    update() {
        this.x -= this.speed;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx, canvas) {
        if (this.x + this.size < 0) {
            this.x = canvas.width + this.size;
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const gradient = ctx.createRadialGradient(-this.size * 0.3, -this.size * 0.3, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, '#000000');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `${this.color}33`;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class NebulaCloud {
    constructor(x, y, size, color, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.0005 - 0.00025;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.01 + 0.005;
    }

    update() {
        this.x -= this.speed;
        this.rotation += this.rotationSpeed;
        this.pulsePhase += this.pulseSpeed;
    }

    draw(ctx, canvas) {
        if (this.x + this.size < 0) {
            this.x = canvas.width + this.size;
        }

        const pulse = Math.sin(this.pulsePhase) * 0.1 + 0.9;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        for (let i = 0; i < 3; i++) {
            const offset = i * 20;
            const gradient = ctx.createRadialGradient(
                offset, offset, 0,
                offset, offset, this.size * pulse
            );
            gradient.addColorStop(0, `${this.color}40`);
            gradient.addColorStop(0.5, `${this.color}15`);
            gradient.addColorStop(1, `${this.color}00`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * pulse, this.size * pulse * 0.6, i * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class SpaceDust {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.3 + 0.1;
    }

    update() {
        this.x -= this.speed * 2;
    }

    draw(ctx, canvas) {
        if (this.x < 0) {
            this.x = canvas.width;
            this.y = Math.random() * canvas.height;
        }

        ctx.fillStyle = `rgba(150, 150, 200, ${this.opacity})`;
        ctx.fillRect(this.x, this.y, this.size * 3, this.size);
    }
}

class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.stars = [];
        this.planets = [];
        this.nebulaClouds = [];
        this.spaceDust = [];

        this.init();
    }

    init() {
        for (let i = 0; i < 100; i++) {
            this.stars.push(new Star(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                Math.random() * 0.8 + 0.2,
                0.1,
                1
            ));
        }

        for (let i = 0; i < 75; i++) {
            this.stars.push(new Star(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                Math.random() * 1.2 + 0.5,
                0.3,
                2
            ));
        }

        for (let i = 0; i < 50; i++) {
            this.stars.push(new Star(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                Math.random() * 1.5 + 1,
                0.6,
                3
            ));
        }

        const nebulaColors = ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'];
        for (let i = 0; i < 5; i++) {
            this.nebulaClouds.push(new NebulaCloud(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                Utils.random(100, 250),
                Utils.choose(nebulaColors),
                0.05
            ));
        }

        const planetColors = ['#ff6b35', '#f7931e', '#c1292e', '#235789', '#a23b72'];
        for (let i = 0; i < 3; i++) {
            this.planets.push(new Planet(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                Utils.random(30, 80),
                Utils.choose(planetColors),
                0.08
            ));
        }

        for (let i = 0; i < 100; i++) {
            this.spaceDust.push(new SpaceDust(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                0.5
            ));
        }
    }

    update() {
        this.stars.forEach(star => star.update());
        this.planets.forEach(planet => planet.update());
        this.nebulaClouds.forEach(cloud => cloud.update());
        this.spaceDust.forEach(dust => dust.update());
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.nebulaClouds.forEach(cloud => cloud.draw(ctx, this.canvas));

        this.planets.forEach(planet => planet.draw(ctx, this.canvas));

        this.stars.filter(s => s.layer === 1).forEach(star => star.draw(ctx, this.canvas));
        this.stars.filter(s => s.layer === 2).forEach(star => star.draw(ctx, this.canvas));

        this.spaceDust.forEach(dust => dust.draw(ctx, this.canvas));

        this.stars.filter(s => s.layer === 3).forEach(star => star.draw(ctx, this.canvas));
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.stars = [];
        this.planets = [];
        this.nebulaClouds = [];
        this.spaceDust = [];
        this.init();
    }
}
