import controls from '../../constants/controls';

export async function fight(firstFighter, secondFighter) {
    return new Promise(resolve => {
        const leftHealthBar = document.getElementById('left-fighter-indicator');
        const rightHealthBar = document.getElementById('right-fighter-indicator');

        const initialHealth = {
            left: firstFighter.health,
            right: secondFighter.health
        };

        const health = {
            left: firstFighter.health,
            right: secondFighter.health
        };

        const pressedKeys = new Set();

        const clampHealth = value => (value < 0 ? 0 : value);

        const updateBar = (barEl, current, initial) => {
            if (!barEl) {
                return;
            }
            const safeInitial = initial > 0 ? initial : 1;
            const widthPercent = (current / safeInitial) * 100;
            barEl.style.width = `${widthPercent}%`;
        };

        const updateUI = () => {
            updateBar(leftHealthBar, health.left, initialHealth.left);
            updateBar(rightHealthBar, health.right, initialHealth.right);
        };

        const isBlocked = (player, keys) => {
            if (player === 'left') {
                return keys.has(controls.PlayerOneBlock);
            }
            return keys.has(controls.PlayerTwoBlock);
        };

        const stopFight = winner => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            resolve(winner);
        };

        const applyDamage = (attacker, defender, defenderSide) => {
            const damage = getDamage(attacker, defender);
            health[defenderSide] = clampHealth(health[defenderSide] - damage);
            updateUI();

            if (health[defenderSide] <= 0) {
                stopFight(attacker);
            }
        };

        const onKeyDown = event => {
            const { code } = event;
            if (pressedKeys.has(code)) {
                return;
            }
            pressedKeys.add(code);

            if (code === controls.PlayerOneAttack && !isBlocked('right', pressedKeys)) {
                applyDamage(firstFighter, secondFighter, 'right');
            }

            if (code === controls.PlayerTwoAttack && !isBlocked('left', pressedKeys)) {
                applyDamage(secondFighter, firstFighter, 'left');
            }
        };

        const onKeyUp = event => {
            pressedKeys.delete(event.code);
        };

        updateUI();
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    });
}

export function getDamage(attacker, defender) {
    const hitPower = getHitPower(attacker);
    const blockPower = getBlockPower(defender);
    const damage = hitPower - blockPower;

    return damage > 0 ? damage : 0;
}

export function getHitPower(fighter) {
    const criticalHitChance = 1 + Math.random();
    return fighter.attack * criticalHitChance;
}

export function getBlockPower(fighter) {
    const dodgeChance = 1 + Math.random();
    return fighter.defense * dodgeChance;
}
