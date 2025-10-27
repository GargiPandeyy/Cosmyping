const canvas = document.getElementById('gameCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');

let inputManager = new InputManager();
let player = new Player();
let ui = new UI(ctx, canvas);
let sceneManager = new SceneManager();
let wordList = [];
let enemies = [];
let particles = [];
let level = 1;
let enemySpawnTimer = 0;
let enemySpawnRate = 180;
let timeWarpActive = false;
let timeWarpDuration = 0;
let scribesFocusActive = false;
let scribesFocusCount = 0;
let bossActive = false;
let boss = null;
let showPauseMenu = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

player.load();

fetch('assets/wordlist.json')
    .then(response => response.json())
    .then(data => {
        wordList = data;
        sceneManager.setScene(SceneType.MENU);
        gameLoop();
    })
    .catch(error => {
        console.error('Error loading wordlist:', error);
        wordList = ['alpha', 'beta', 'gamma', 'delta', 'echo'];
        sceneManager.setScene(SceneType.MENU);
        gameLoop();
    });

function handleKeyDown(event) {
    const key = event.key;

    if (sceneManager.getCurrentScene() === SceneType.MENU) {
        const menuOptions = [
            { text: 'START GAME', action: 'start' },
            { text: 'HANGAR', action: 'hangar' },
            { text: 'QUIT', action: 'quit' }
        ];
        const action = sceneManager.handleMenuNavigation(key, menuOptions);
        if (action === 'start') {
            startGame();
        } else if (action === 'hangar') {
            sceneManager.setScene(SceneType.HANGAR);
        } else if (action === 'quit') {
            window.close();
        }
    } else if (sceneManager.getCurrentScene() === SceneType.HANGAR) {
        handleHangarInput(key);
    } else if (sceneManager.getCurrentScene() === SceneType.GAMEPLAY) {
        if (key === 'p' || key === 'P') {
            showPauseMenu = !showPauseMenu;
        }

        if (key === 'Escape') {
            sceneManager.setScene(SceneType.MENU);
            resetGame();
        }

        if (!showPauseMenu) {
            handleGameplayInput(key);
        }
    } else if (sceneManager.getCurrentScene() === SceneType.GAMEOVER) {
        if (key === 'Enter') {
            sceneManager.setScene(SceneType.MENU);
            resetGame();
        }
    }
}

function handleKeyUp(event) {
}

function handleGameplayInput(key) {
    if (key === 'q' || key === 'Q') {
        if (player.canUseAbility('nova')) {
            if (player.useAbility('nova')) {
                enemies = [];
                particles = [];
            }
        }
    }

    if (key === 'w' || key === 'W') {
        if (player.canUseAbility('timeWarp')) {
            if (player.useAbility('timeWarp')) {
                timeWarpActive = true;
                timeWarpDuration = 300;
            }
        }
    }

    if (key === 'e' || key === 'E') {
        if (player.canUseAbility('focus')) {
            if (player.useAbility('focus')) {
                scribesFocusActive = true;
                scribesFocusCount = 3;
            }
        }
    }

    const inputResult = inputManager.handleKey(key);
    if (inputResult.type === 'destroy') {
        destroyEnemy(inputResult.target);
    } else if (inputResult.type === 'command') {
        executeCommand(inputResult.command);
    }

    const target = inputManager.findTarget(enemies);
    if (target && target.word === inputManager.buffer) {
        if (key === 'Enter' || key === ' ') {
            destroyEnemy(target);
        }
    }
}

function executeCommand(command) {
    if (command === 'nova') {
        if (player.canUseAbility('nova')) {
            player.useAbility('nova');
            enemies = [];
            particles = [];
        }
    } else if (command === 'time') {
        if (player.canUseAbility('timeWarp')) {
            player.useAbility('timeWarp');
            timeWarpActive = true;
            timeWarpDuration = 300;
        }
    } else if (command === 'focus') {
        if (player.canUseAbility('focus')) {
            player.useAbility('focus');
            scribesFocusActive = true;
            scribesFocusCount = 3;
        }
    }
}

function handleHangarInput(key) {
    if (key === 'Escape') {
        sceneManager.setScene(SceneType.MENU);
    } else if (key === '1') {
        if (player.upgradeEngineCore()) {
            player.save();
        }
    } else if (key === '2') {
        if (player.upgradeShieldGenerator()) {
            player.save();
        }
    } else if (key === '3') {
        if (player.upgradeCognitiveMatrix()) {
            player.save();
        }
    } else if (key === '4') {
        if (player.upgradeDataScrubber()) {
            player.save();
        }
    }
}

function startGame() {
    sceneManager.setScene(SceneType.GAMEPLAY);
    player.reset();
    enemies = [];
    particles = [];
    level = 1;
    enemySpawnTimer = 0;
    enemySpawnRate = 180;
    bossActive = false;
    showPauseMenu = false;
    inputManager.clear();
}

function resetGame() {
    player.reset();
    enemies = [];
    particles = [];
    level = 1;
    enemySpawnTimer = 0;
    bossActive = false;
    showPauseMenu = false;
    inputManager.clear();
}

function spawnEnemy() {
    if (wordList.length === 0) return;

    let enemy = null;
    const enemyType = Math.random();

    if (enemyType < 0.4) {
        const word = Utils.choose(wordList);
        enemy = new Drone(canvas.width, Utils.random(100, canvas.height - 200), word);
    } else if (enemyType < 0.7) {
        const word = Utils.choose(wordList);
        enemy = new Cruiser(canvas.width, Utils.random(100, canvas.height - 200), word);
    } else if (enemyType < 0.9) {
        const word = Utils.choose(wordList);
        enemy = new CorruptedAsteroid(canvas.width, Utils.random(100, canvas.height - 200), word);
    } else if (enemyType < 0.98) {
        enemy = new Mine(Utils.random(canvas.width * 0.3, canvas.width * 0.7), Utils.random(100, canvas.height - 200));
    }

    if (enemy) {
        enemy.speed -= player.upgrades.engineCore * 0.2;
        if (enemy.speed < 0.3) enemy.speed = 0.3;
        enemies.push(enemy);
    }
}

function spawnBoss() {
    const bossWords = wordList.slice(0, 10);
    boss = new Boss(canvas.width * 0.7, canvas.height / 2 - 75, bossWords, 3);
    bossActive = true;
    enemies.push(boss);
}

function update() {
    if (sceneManager.getCurrentScene() === SceneType.GAMEPLAY && !showPauseMenu) {
        if (bossActive && boss) {
            if (boss.shieldActive) {
                if (inputManager.buffer.length > 0 && boss.words && boss.words[0]) {
                    if (inputManager.buffer.toLowerCase() === boss.words[0].toLowerCase()) {
                        boss.takeDamage(10);
                        inputManager.buffer = '';
                        particles.push(new Particle(boss.x + boss.size / 2, boss.y + boss.size / 2, '#ff0000'));
                    }
                }
            } else {
                const targetWord = boss.getCurrentTargetWord();
                if (targetWord && inputManager.buffer.toLowerCase() === targetWord.toLowerCase()) {
                    boss.takeDamage(5);
                    boss.currentWordIndex++;
                    if (boss.currentWordIndex >= boss.words.length) {
                        boss.currentWordIndex = 0;
                    }
                    inputManager.buffer = '';
                    for (let i = 0; i < 5; i++) {
                        particles.push(new Particle(boss.x + boss.size / 2, boss.y + boss.size / 2, '#ff0000'));
                    }
                }
            }
        } else {
            if (level % 5 === 0 && enemySpawnTimer === 0 && enemies.length === 0) {
                spawnBoss();
            }

            if (!bossActive) {
                enemySpawnTimer++;
                if (enemySpawnTimer >= enemySpawnRate) {
                    enemySpawnTimer = 0;
                    if (Math.random() < 0.3) {
                        spawnEnemy();
                    }
                }
            }
        }

        let speedMultiplier = 1;
        if (timeWarpActive) {
            speedMultiplier = 0.5;
            timeWarpDuration--;
            if (timeWarpDuration <= 0) {
                timeWarpActive = false;
            }
        }

        enemies.forEach(enemy => {
            const originalSpeed = enemy.speed;
            enemy.speed *= speedMultiplier;
            enemy.update();
            enemy.speed = originalSpeed;
            if (enemy instanceof Mine && enemy.timer <= 0) {
                player.loseLife();
                enemy.active = false;
            }
        });

        enemies = enemies.filter(e => {
            if (e.offscreen && !e.isDead()) {
                player.loseLife();
                return false;
            }
            return e.isDead() ? false : true;
        });

        particles.forEach(p => p.update());
        particles = particles.filter(p => !p.isDead());

        player.updateAbilities();
        player.updateWPM();

        if (boss && !boss.active && bossActive) {
            bossActive = false;
            player.addDataFragment(500);
            player.addScore(10000);
            player.save();
            level++;
            enemies = [];
            particles = [];
        }

        if (player.lives <= 0) {
            sceneManager.setScene(SceneType.GAMEOVER);
        }

        if (bossActive && !boss) {
            bossActive = false;
        }
    }
}

function destroyEnemy(enemy) {
    if (!enemy) return;

    enemy.active = false;
    enemies = enemies.filter(e => e !== enemy);

    if (scribesFocusActive) {
        scribesFocusCount--;
        if (scribesFocusCount <= 0) {
            scribesFocusActive = false;
        }
    }

    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, '#ffff00'));
    }

    player.addCombo();
    player.addScore(enemy.word.length * 10);
    player.addDataFragment(10 + enemy.word.length);
    player.wordsCount++;
    player.save();

    inputManager.clear();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (sceneManager.getCurrentScene() === SceneType.MENU) {
        const menuOptions = [
            { text: 'START GAME', action: 'start' },
            { text: 'HANGAR', action: 'hangar' },
            { text: 'QUIT', action: 'quit' }
        ];
        ui.drawMenu('COSMYPING', menuOptions, sceneManager.menuSelection);
    } else if (sceneManager.getCurrentScene() === SceneType.HANGAR) {
        ui.drawHangar(player);
    } else if (sceneManager.getCurrentScene() === SceneType.GAMEPLAY) {
        enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.draw(ctx);
            }
        });

        particles.forEach(p => p.draw(ctx));

        ui.drawHUD(player);
        ui.drawInputBuffer(inputManager, ctx, canvas);

        if (bossActive && boss) {
            ui.drawBossInfo(boss);
        }

        if (showPauseMenu) {
            ui.drawPause();
        }
    } else if (sceneManager.getCurrentScene() === SceneType.GAMEOVER) {
        ui.drawGameOver(player, false);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

