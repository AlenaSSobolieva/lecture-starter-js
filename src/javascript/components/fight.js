import controls from '../../constants/controls';

const fightKeyCodes = new Set([
    controls.PlayerOneAttack,
    controls.PlayerOneBlock,
    controls.PlayerTwoAttack,
    controls.PlayerTwoBlock,
    ...controls.PlayerOneCriticalHitCombination,
    ...controls.PlayerTwoCriticalHitCombination
]);

export function getHitPower(fighter) {
    return fighter.attack * (1 + Math.random());
}

export function getBlockPower(fighter) {
    return fighter.defense * (1 + Math.random());
}

export function getDamage(attacker, defender) {
    const damage = getHitPower(attacker) - getBlockPower(defender);
    return damage > 0 ? damage : 0;
}

function isComboPressed(combo, keys) {
    return combo.every(key => keys.has(key));
}

export function fight(firstFighter, secondFighter) {
    return new Promise(resolve => {
        const state = {
            health: { left: firstFighter.health, right: secondFighter.health },
            pressedKeys: new Set(),
            isBlocking: { left: false, right: false },
            critical: {
                left: { cooldownEndsAt: 0, isComboActive: false },
                right: { cooldownEndsAt: 0, isComboActive: false }
            },
            finished: false
        };

        const updateBar = (side, current, initial) => {
            const bar = document.getElementById(`${side}-fighter-indicator`);
            if (bar) {
                bar.style.width = `${Math.max(0, (current / initial) * 100)}%`;
            }
        };

        const handleKeyUp = event => {
            if (!fightKeyCodes.has(event.code)) return;
            state.pressedKeys.delete(event.code);
            state.isBlocking.left = state.pressedKeys.has(controls.PlayerOneBlock);
            state.isBlocking.right = state.pressedKeys.has(controls.PlayerTwoBlock);
            if (!isComboPressed(controls.PlayerOneCriticalHitCombination, state.pressedKeys)) {
                state.critical.left.isComboActive = false;
            }
            if (!isComboPressed(controls.PlayerTwoCriticalHitCombination, state.pressedKeys)) {
                state.critical.right.isComboActive = false;
            }
        };

        const handleKeyDown = event => {
            if (state.finished || !fightKeyCodes.has(event.code)) return;
            event.preventDefault();
            state.pressedKeys.add(event.code);
            state.isBlocking.left = state.pressedKeys.has(controls.PlayerOneBlock);
            state.isBlocking.right = state.pressedKeys.has(controls.PlayerTwoBlock);

            const now = Date.now();
            if (
                isComboPressed(controls.PlayerOneCriticalHitCombination, state.pressedKeys) &&
                !state.critical.left.isComboActive &&
                now >= state.critical.left.cooldownEndsAt
            ) {
                state.critical.left.cooldownEndsAt = now + 10000;
                state.critical.left.isComboActive = true;
                state.health.right -= firstFighter.attack * 2;
                updateBar('right', state.health.right, secondFighter.health);
            }

            if (event.code === controls.PlayerOneAttack && !state.isBlocking.left) {
                state.health.right -= getDamage(firstFighter, secondFighter);
                updateBar('right', state.health.right, secondFighter.health);
            }

            if (state.health.right <= 0) {
                state.finished = true;
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
                resolve(firstFighter);
            }
            if (
                isComboPressed(controls.PlayerTwoCriticalHitCombination, state.pressedKeys) &&
                !state.critical.right.isComboActive &&
                now >= state.critical.right.cooldownEndsAt
            ) {
                state.critical.right.cooldownEndsAt = now + 10000;
                state.critical.right.isComboActive = true;
                state.health.left -= secondFighter.attack * 2;
                updateBar('left', state.health.left, firstFighter.health);
                if (state.health.left <= 0) {
                    state.finished = true;
                    window.removeEventListener('keydown', handleKeyDown);
                    window.removeEventListener('keyup', handleKeyUp);
                    resolve(secondFighter);
                }
            }

            if (event.code === controls.PlayerTwoAttack && !state.isBlocking.right) {
                state.health.left -= getDamage(secondFighter, firstFighter);
                updateBar('left', state.health.left, firstFighter.health);
                if (state.health.left <= 0) {
                    state.finished = true;
                    window.removeEventListener('keydown', handleKeyDown);
                    window.removeEventListener('keyup', handleKeyUp);
                    resolve(secondFighter);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    });
}
