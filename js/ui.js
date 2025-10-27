class UI {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.fontSize = 20;
    }

    drawHUD(player) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 300, 150);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px monospace';
        this.ctx.fillText('SCORE: ' + player.score.toString(), 20, 35);

        this.ctx.font = '20px monospace';
        this.ctx.fillText('COMBO: ' + player.combo + 'x', 20, 60);

        this.ctx.fillText('WPM: ' + Math.floor(player.wpm).toString(), 20, 85);

        for (let i = 0; i < player.maxLives; i++) {
            const color = i < player.lives ? '#ff0000' : '#666666';
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(20 + i * 25, 110, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillText('FRAGMENTS: ' + player.dataFragments, 20, 140);

        this.drawAbilities(player);
    }

    drawAbilities(player) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.canvas.width - 350, 10, 340, 100);

        const abilities = [
            { name: 'NOVA', key: 'Q', cooldown: player.abilities.nova },
            { name: 'TIME', key: 'W', cooldown: player.abilities.timeWarp },
            { name: 'FOCUS', key: 'E', cooldown: player.abilities.focus }
        ];

        abilities.forEach((ability, i) => {
            const x = this.canvas.width - 340;
            const y = 35 + i * 30;

            const ready = ability.cooldown.cooldown <= 0;
            this.ctx.fillStyle = ready ? '#00ff00' : '#888888';
            this.ctx.font = '18px monospace';
            this.ctx.fillText(`${ability.key} - ${ability.name}`, x, y);

            if (!ready) {
                const cd = Math.ceil(ability.cooldown.cooldown / 60);
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillText(`${cd}s`, x + 150, y);
            }
        });
    }

    drawInputBuffer(input, ctx, canvas) {
        const buffer = input.buffer;
        if (buffer.length === 0) return;

        const x = canvas.width / 2 - 100;
        const y = canvas.height - 100;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x - 10, y - 35, 220, 50);

        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 32px monospace';
        this.ctx.fillText(buffer, x, y);

        if (input.activeTarget) {
            this.drawTarget(input.activeTarget, ctx, canvas);
        }
    }

    drawTarget(target, ctx, canvas) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(target.x - 5, target.y - 5, target.size + 10, target.size + 10);

        const typedPortion = inputManager.getTypedPortion(target.word);
        if (typedPortion.length > 0) {
            ctx.fillStyle = '#00ff00';
            ctx.font = '20px monospace';
            ctx.fillText(typedPortion, target.x, target.y - 30);
        }

        if (inputManager.hasTypo(target.word)) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 5;
            ctx.strokeRect(target.x - 5, target.y - 5, target.size + 10, target.size + 10);
        }
    }

    drawMenu(title, options, selected) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 64px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.canvas.width / 2, 150);

        options.forEach((option, i) => {
            const y = 250 + i * 60;
            const color = i === selected ? '#00ff00' : '#888888';
            this.ctx.fillStyle = color;
            this.ctx.font = '32px monospace';
            this.ctx.fillText(option.text, this.canvas.width / 2, y);
        });

        this.ctx.textAlign = 'left';
    }

    drawHangar(player) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('HANGAR', this.canvas.width / 2, 80);

        this.ctx.font = '24px monospace';
        this.ctx.fillText('FRAGMENTS: ' + player.dataFragments, this.canvas.width / 2, 130);

        const upgrades = [
            {
                name: 'Engine Core',
                desc: 'Slows enemies',
                level: player.upgrades.engineCore,
                cost: (player.upgrades.engineCore + 1) * 50,
                action: 'engine'
            },
            {
                name: 'Shield Generator',
                desc: '+1 Max Life',
                level: player.upgrades.shieldGenerator,
                cost: (player.upgrades.shieldGenerator + 1) * 75,
                action: 'shield'
            },
            {
                name: 'Cognitive Matrix',
                desc: 'Typo Highlight',
                level: player.upgrades.cognitiveMatrix ? 1 : 0,
                cost: 200,
                action: 'matrix'
            },
            {
                name: 'Data Scrubber',
                desc: '+25% Fragment Gain',
                level: player.upgrades.dataScrubber,
                cost: (player.upgrades.dataScrubber + 1) * 100,
                action: 'scrubber'
            }
        ];

        upgrades.forEach((upgrade, i) => {
            const y = 200 + i * 80;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'left';
            this.ctx.font = 'bold 20px monospace';
            this.ctx.fillText(upgrade.name, 100, y);

            this.ctx.font = '16px monospace';
            this.ctx.fillText(upgrade.desc, 100, y + 25);

            this.ctx.font = '18px monospace';
            const canBuy = player.canBuyUpgrade(upgrade.cost);
            this.ctx.fillStyle = canBuy ? '#00ff00' : '#ff0000';
            this.ctx.fillText('Cost: ' + upgrade.cost, 100, y + 50);

            this.ctx.fillStyle = '#888888';
            this.ctx.fillText('Level: ' + upgrade.level, 300, y + 50);
        });

        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '24px monospace';
        this.ctx.fillText('Press ESC to return', this.canvas.width / 2, this.canvas.height - 50);
    }

    drawGameOver(player, isWin) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = isWin ? '#00ff00' : '#ff0000';
        this.ctx.font = 'bold 64px monospace';
        this.ctx.fillText(isWin ? 'VICTORY' : 'GAME OVER', this.canvas.width / 2, 150);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '32px monospace';
        this.ctx.fillText('Final Score: ' + player.score, this.canvas.width / 2, 250);
        this.ctx.fillText('Max Combo: ' + player.maxCombo, this.canvas.width / 2, 300);
        this.ctx.fillText('WPM: ' + Math.floor(player.wpm), this.canvas.width / 2, 350);

        this.ctx.font = '24px monospace';
        this.ctx.fillText('Press ENTER to continue', this.canvas.width / 2, 450);
    }

    drawPause() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px monospace';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '24px monospace';
        this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    drawBossInfo(boss) {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(10, this.canvas.height - 100, this.canvas.width - 20, 90);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px monospace';
        this.ctx.fillText('TITAN BOSS', 20, this.canvas.height - 70);

        this.ctx.font = '20px monospace';
        if (boss.shieldActive) {
            this.ctx.fillText('SHIELDS: ' + Math.ceil(boss.shieldHealth), 20, this.canvas.height - 40);
        } else {
            this.ctx.fillText('HEALTH: ' + Math.ceil(boss.health), 20, this.canvas.height - 40);
        }
    }
}

