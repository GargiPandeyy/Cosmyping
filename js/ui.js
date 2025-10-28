
class UI {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.fontSize = 20;
        this.scanlineOffset = 0;
    }

    drawScanlines() {

        this.ctx.save();
        this.ctx.globalAlpha = 0.05;
        this.ctx.fillStyle = '#00ffff';
        for (let i = 0; i < this.canvas.height; i += 4) {
            this.ctx.fillRect(0, (i + this.scanlineOffset) % this.canvas.height, this.canvas.width, 2);
        }
        this.scanlineOffset = (this.scanlineOffset + 1) % 4;
        this.ctx.restore();
    }

    drawPanel(x, y, width, height, color = '#00ffff') {

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x, y, width, height);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.strokeRect(x, y, width, height);

        this.ctx.lineWidth = 3;
        const cornerSize = 10;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + cornerSize);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x + cornerSize, y);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x + width - cornerSize, y);
        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x + width, y + cornerSize);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height - cornerSize);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x + cornerSize, y + height);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x + width - cornerSize, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x + width, y + height - cornerSize);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
    }

    drawHUD(player) {
        this.drawPanel(10, 10, 300, 160, '#00d9ff');

        this.ctx.fillStyle = '#00d9ff';
        this.ctx.font = 'bold 24px monospace';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#00d9ff';
        this.ctx.fillText('SCORE: ' + player.score.toString(), 20, 40);
        this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px monospace';
        this.ctx.fillText('COMBO: ' + player.combo + 'x', 20, 70);

        this.ctx.fillText('WPM: ' + Math.floor(player.wpm).toString(), 20, 95);

        for (let i = 0; i < player.maxLives; i++) {
            const color = i < player.lives ? '#ff0000' : '#444444';
            this.ctx.fillStyle = color;
            if (i < player.lives) {
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#ff0000';
            }
            this.ctx.beginPath();
            this.ctx.arc(20 + i * 25, 120, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }

        this.ctx.fillStyle = '#00ff00';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#00ff00';
        this.ctx.fillText('FRAGMENTS: ' + player.dataFragments, 20, 150);
        this.ctx.shadowBlur = 0;

        this.drawAbilities(player);
        this.drawScanlines();
    }

    drawAbilities(player) {
        this.drawPanel(this.canvas.width - 350, 10, 340, 110, '#00ff00');

        const abilities = [
            { name: 'NOVA', key: 'Q', cooldown: player.abilities.nova },
            { name: 'TIME WARP', key: 'W', cooldown: player.abilities.timeWarp },
            { name: 'FOCUS', key: 'E', cooldown: player.abilities.focus }
        ];

        abilities.forEach((ability, i) => {
            const x = this.canvas.width - 335;
            const y = 40 + i * 30;

            const ready = ability.cooldown.cooldown <= 0;

            this.ctx.fillStyle = ready ? '#00ff00' : '#555555';
            this.ctx.strokeStyle = ready ? '#00ff00' : '#555555';
            this.ctx.lineWidth = 2;
            if (ready) {
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#00ff00';
            }
            this.ctx.strokeRect(x, y - 15, 25, 20);
            this.ctx.shadowBlur = 0;

            this.ctx.font = 'bold 14px monospace';
            this.ctx.fillText(ability.key, x + 7, y);

            this.ctx.fillStyle = ready ? '#ffffff' : '#666666';
            this.ctx.font = '16px monospace';
            this.ctx.fillText(ability.name, x + 35, y);

            if (!ready) {
                const cd = Math.ceil(ability.cooldown.cooldown / 60);
                this.ctx.fillStyle = '#ff6666';
                this.ctx.font = 'bold 16px monospace';
                this.ctx.fillText(`${cd}s`, x + 200, y);

                const progress = ability.cooldown.cooldown / ability.cooldown.maxCooldown;
                this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                this.ctx.fillRect(x + 35, y + 5, 150, 4);
                this.ctx.fillStyle = '#ff6666';
                this.ctx.fillRect(x + 35, y + 5, 150 * (1 - progress), 4);
            } else {
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = 'bold 14px monospace';
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = '#00ff00';
                this.ctx.fillText('READY', x + 200, y);
                this.ctx.shadowBlur = 0;
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
            this.ctx.fillStyle = '#00ff00';
            this.ctx.textAlign = 'left';
            this.ctx.font = 'bold 24px monospace';
            this.ctx.fillText(`[${i + 1}]`, 50, y);

            this.ctx.fillStyle = '#ffffff';
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

    drawTutorial() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.textAlign = 'center';

        this.ctx.fillStyle = '#00d9ff';
        this.ctx.font = 'bold 56px monospace';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00d9ff';
        this.ctx.fillText('COSMYPING: THE LAST SCRIBE', this.canvas.width / 2, 80);
        this.ctx.shadowBlur = 0;

        const storyY = 140;
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 28px monospace';
        this.ctx.fillText('THE STORY', this.canvas.width / 2, storyY);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px monospace';
        const storyLines = [
            'In the year 2847, the Data Corruption has consumed entire sectors.',
            'You are the last Scribe, humanity\'s final hope.',
            'Your ship\'s quantum typewriter can destroy corrupted entities',
            'by typing their designation codes correctly.',
            'Fight through waves of corrupted data and defeat the Titan Bosses',
            'to restore order to the digital cosmos.'
        ];
        storyLines.forEach((line, i) => {
            this.ctx.fillText(line, this.canvas.width / 2, storyY + 40 + i * 30);
        });

        const controlsY = storyY + 230;
        this.drawPanel(this.canvas.width / 2 - 400, controlsY, 800, 280, '#00ff00');

        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 32px monospace';
        this.ctx.fillText('CONTROLS', this.canvas.width / 2, controlsY + 40);

        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'left';
        const leftX = this.canvas.width / 2 - 380;

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('TYPE WORDS: Destroy enemies by typing their words', leftX, controlsY + 85);
        this.ctx.fillText('ENTER/SPACE: Confirm typed word', leftX, controlsY + 115);
        this.ctx.fillText('BACKSPACE: Delete last character', leftX, controlsY + 145);

        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 22px monospace';
        this.ctx.fillText('SPECIAL ABILITIES:', leftX, controlsY + 185);

        this.ctx.font = '18px monospace';
        const abilities = [
            { key: 'Q', name: 'NOVA', desc: 'Destroy all enemies on screen' },
            { key: 'W', name: 'TIME WARP', desc: 'Slow down all enemies' },
            { key: 'E', name: 'FOCUS', desc: 'Instantly destroy next 3 enemies' }
        ];

        abilities.forEach((ability, i) => {
            const y = controlsY + 215 + i * 25;
            this.ctx.fillStyle = '#00ff00';
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(leftX, y - 15, 25, 20);
            this.ctx.fillText(ability.key, leftX + 7, y);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(`${ability.name}: ${ability.desc}`, leftX + 35, y);
        });

        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#00d9ff';
        this.ctx.font = 'bold 24px monospace';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00d9ff';
        this.ctx.fillText('Press ENTER to return to menu', this.canvas.width / 2, this.canvas.height - 40);
        this.ctx.shadowBlur = 0;

        this.drawScanlines();
    }
}
