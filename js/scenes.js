const SceneType = {
    BOOT: 'boot',
    MENU: 'menu',
    GAMEPLAY: 'gameplay',
    HANGAR: 'hangar',
    GAMEOVER: 'gameover',
    PAUSE: 'pause'
};

class SceneManager {
    constructor() {
        this.currentScene = SceneType.BOOT;
        this.menuSelection = 0;
        this.lastMenuAction = null;
    }

    getCurrentScene() {
        return this.currentScene;
    }

    setScene(scene) {
        this.currentScene = scene;
    }

    handleMenuNavigation(key, options) {
        if (key === 'ArrowDown') {
            this.menuSelection = (this.menuSelection + 1) % options.length;
        } else if (key === 'ArrowUp') {
            this.menuSelection = (this.menuSelection - 1 + options.length) % options.length;
        } else if (key === 'Enter') {
            return options[this.menuSelection].action;
        }
        return null;
    }

    resetMenuSelection() {
        this.menuSelection = 0;
    }
}

