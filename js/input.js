class InputManager {
    constructor() {
        this.buffer = '';
        this.activeTarget = null;
        this.history = [];
        this.commandPrefix = '//';
        this.typingTimer = 0;
    }

    handleKey(key) {
        if (key === 'Enter' || key === ' ') {
            if (this.activeTarget && this.activeTarget.word === this.buffer) {
                return { type: 'destroy', target: this.activeTarget };
            }
            this.buffer = '';
            return { type: 'clear' };
        }

        if (key === 'Backspace') {
            this.buffer = this.buffer.slice(0, -1);
            return { type: 'backspace' };
        }

        if (key.length === 1) {
            this.buffer += key.toLowerCase();
            if (this.buffer.startsWith(this.commandPrefix)) {
                const command = this.buffer.slice(this.commandPrefix.length);
                if (['nova', 'time', 'focus'].includes(command)) {
                    this.buffer = '';
                    return { type: 'command', command: command };
                }
            }
            return { type: 'type' };
        }

        return { type: 'none' };
    }

    findTarget(enemies) {
        if (!enemies || enemies.length === 0) return null;

        const matches = enemies.filter(e => 
            e.word.toLowerCase().startsWith(this.buffer.toLowerCase())
        );

        if (matches.length === 0) {
            this.activeTarget = null;
            return null;
        }

        matches.sort((a, b) => a.x - b.x);
        this.activeTarget = matches[0];
        return matches[0];
    }

    clear() {
        this.buffer = '';
        this.activeTarget = null;
    }

    getTypedPortion(word) {
        if (!this.activeTarget || word !== this.activeTarget.word) return '';
        return this.buffer.toLowerCase();
    }

    hasTypo(word) {
        if (this.activeTarget && word === this.activeTarget.word) {
            return !word.toLowerCase().startsWith(this.buffer.toLowerCase()) && this.buffer.length > 0;
        }
        return false;
    }
}

