// ゲーム状態管理
let state = {
    p: { hp: 50, res: 0, nation: '', hand: [], field: [] },
    e: { hp: 50, res: 0, nation: '', handCount: 0, field: [] },
    handLimit: 5, // 手札上限を5枚に修正
    isGameOver: false,
    busy: false,
    gameMode: '', // 'cpu' or 'pvp'
    currentPlayer: 'p', // 対人戦での現在のプレイヤー ('p' or 'e')
    gamePhase: 'deploy' // 'deploy' (配置), 'combat' (戦闘)
};

// 戦闘ログ
let combatLog = [];

// ユニットタイプに応じたアイコンを返す関数
function getUnitIcon(unit) {
    const name = unit.name;
    const ability = unit.ability;

    // 名前ベースのアイコン
    if (name.includes('戦車') || name.includes('T-34') || name.includes('パンター') || name.includes('チャーチル') || name.includes('M4シャーマン') || name.includes('KV-1') || name.includes('M13') || name.includes('7TP') || name.includes('M10')) return '🛡️';
    if (name.includes('航空機') || name.includes('スツーカ') || name.includes('ゼロ戦') || name.includes('スピットファイア') || name.includes('P-51') || name.includes('急降下') || name.includes('B-17') || name.includes('P-40') || name.includes('I-16') || name.includes('一式') || name.includes('ランカスター') || name.includes('PZL') || name.includes('Il-2')) return '✈️';
    if (name.includes('戦艦') || name.includes('ビスマルク') || name.includes('大和') || name.includes('アイオワ') || name.includes('ローマ')) return '⚓';
    if (name.includes('潜水艦') || name.includes('Uボート') || name.includes('伊号')) return '🌊';
    if (name.includes('砲兵') || name.includes('カチューシャ') || name.includes('88mm砲')) return '💥';
    if (name.includes('歩兵') || name.includes('狙撃兵') || name.includes('パラシュート') || name.includes('隊') || name.includes('ライフル')) return '🎖️';
    if (name.includes('工兵') || name.includes('工作')) return '🔧';
    if (name.includes('補給') || name.includes('輸送') || name.includes('タンケッテ') || name.includes('TK-3')) return '📦';
    if (name.includes('偵察') || name.includes('スパイ')) return '🔍';
    if (name.includes('レジスタンス') || name.includes('パルチザン') || name.includes('ゲリラ')) return '⚡';

    // 特殊能力ベースのアイコン
    if (ability === '急降下' || ability === '制空権') return '✈️';
    if (ability === '巨砲貫通' || ability === '要塞化') return '🏰';
    if (ability === '回避' || ability === 'ゲリラ') return '💨';
    if (ability === '援軍' || ability === '人海戦術') return '👥';
    if (ability === '補給線') return '📦';
    if (ability === '野戦修理') return '🔧';
    if (ability === '重装甲' || ability === '不屈') return '🛡️';
    if (ability === 'レジスタンス') return '⚡';
    if (ability === '戦意高揚') return '🔥';

    // デフォルト（ユニットのコストによって変える）
    if (unit.cost >= 8) return '⭐';
    if (unit.cost >= 5) return '🎯';
    if (unit.cost >= 3) return '⚔️';
    return '🪖';
}

// チュートリアル状態
let tutorialState = {
    currentPage: 0,
    totalPages: 5
};

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // モード選択ボタンのイベントリスナー
    document.getElementById('cpu-mode-btn').onclick = () => selectMode('cpu');
    document.getElementById('pvp-mode-btn').onclick = () => selectMode('pvp');
    document.getElementById('tutorial-btn').onclick = openTutorial;

    // チュートリアルナビゲーション
    document.getElementById('tutorial-prev').onclick = () => changeTutorialPage(-1);
    document.getElementById('tutorial-next').onclick = () => changeTutorialPage(1);
    document.getElementById('tutorial-close').onclick = closeTutorial;
});

// モード選択
function selectMode(mode) {
    state.gameMode = mode;
    document.getElementById('mode-select').classList.add('hidden');

    if (mode === 'cpu') {
        document.getElementById('cpu-nation-select').classList.remove('hidden');
        createNationButtons('nation-container', (nation) => startGameCPU(nation));
    } else if (mode === 'pvp') {
        document.getElementById('p1-nation-select').classList.remove('hidden');
        createNationButtons('p1-nation-container', (nation) => selectP1Nation(nation));
    }
}

// 国家選択ボタンを生成
function createNationButtons(containerId, onClick) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    Object.entries(NATIONS).forEach(([key, n]) => {
        const btn = document.createElement('button');
        btn.className = "nation-btn p-3 rounded-lg text-center hover:border-white transition-all active:scale-95";
        btn.style.cssText = `
            min-height: 85px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 4px;
            background: linear-gradient(145deg, #2a2520, #1a1510);
            border: 2px solid #4a6fa5;
        `;
        btn.innerHTML = `
            <div style="font-size: 32px; line-height: 1; margin-bottom: 2px;">${n.flag}</div>
            <div class="font-bold text-sm" style="color: #d4c5b0;">${n.name}</div>
            <div class="text-[9px]" style="color: #ff6b6b; line-height: 1.3;">${n.flaw}</div>
            <div class="text-[7px] px-2 py-0.5 rounded mt-1" style="background: rgba(212,175,55,0.2); color: #d4af37; border: 1px solid #d4af37;">予算${n.supply}</div>
        `;
        btn.onclick = () => onClick(key);
        container.appendChild(btn);
    });
}

// プレイヤー1の国家選択
function selectP1Nation(nation) {
    state.p.nation = nation;
    document.getElementById('p1-nation-select').classList.add('hidden');
    document.getElementById('p2-nation-select').classList.remove('hidden');
    createNationButtons('p2-nation-container', (nation) => selectP2Nation(nation));
}

// プレイヤー2の国家選択
function selectP2Nation(nation) {
    state.e.nation = nation;
    startGamePvP();
}

// CPU戦開始
function startGameCPU(nation) {
    state.p.nation = nation;
    state.p.res = NATIONS[nation].supply;
    if (nation === 'Britain') state.p.res = Math.max(0, state.p.res - 1);

    const availableNations = Object.keys(NATIONS).filter(k => k !== nation);
    state.e.nation = availableNations[Math.floor(Math.random() * availableNations.length)];
    state.e.res = NATIONS[state.e.nation].supply;
    if (state.e.nation === 'Britain') state.e.res = Math.max(0, state.e.res - 1);
    state.e.handCount = 4;

    document.getElementById('start-modal').classList.add('hidden');
    document.getElementById('player-name').innerText = NATIONS[nation].name;
    document.getElementById('enemy-name').innerText = NATIONS[state.e.nation].name;

    addLog('━━━ 戦闘開始 ━━━', 'normal');
    addLog(`${NATIONS[nation].name} vs ${NATIONS[state.e.nation].name}`, 'normal');
    addLog(`弱点：${NATIONS[nation].flaw}`, 'miss');

    draw(true);
    updateUI();
    updateExecuteButton();
}

// 対人戦開始
function startGamePvP() {
    state.p.res = NATIONS[state.p.nation].supply;
    if (state.p.nation === 'Britain') state.p.res = Math.max(0, state.p.res - 1);

    state.e.res = NATIONS[state.e.nation].supply;
    if (state.e.nation === 'Britain') state.e.res = Math.max(0, state.e.res - 1);

    // 対人戦では両者とも手札を持つ
    state.e.hand = [];
    state.e.handCount = 0;

    document.getElementById('start-modal').classList.add('hidden');
    document.getElementById('player-name').innerText = `P1: ${NATIONS[state.p.nation].name}`;
    document.getElementById('enemy-name').innerText = `P2: ${NATIONS[state.e.nation].name}`;

    addLog('━━━ 対人戦開始 ━━━', 'normal');
    addLog(`${NATIONS[state.p.nation].name} vs ${NATIONS[state.e.nation].name}`, 'normal');

    // 両プレイヤーが初回ドロー
    draw(true);
    drawEnemy(true);

    state.currentPlayer = 'p';
    state.gamePhase = 'deploy';
    updateUI();
    updateExecuteButton();
}

// コストによる重み付けドロー
function getWeightedCard(pool) {
    const weightedPool = [];
    pool.forEach(card => {
        let weight = 1;
        if (card.cost <= 2) weight = 6; // 低コストは出やすい
        else if (card.cost <= 5) weight = 3; // 中コスト
        else weight = 1; // 高コストは希少

        for (let i = 0; i < weight; i++) weightedPool.push(card);
    });
    return weightedPool[Math.floor(Math.random() * weightedPool.length)];
}

function draw(isInitial = false) {
    const pool = CARDS[state.p.nation];
    const count = isInitial ? 4 : 2;

    for(let i=0; i<count; i++) {
        if(state.p.hand.length < state.handLimit) {
            const card = getWeightedCard(pool);
            state.p.hand.push({
                ...card,
                id: Math.random(),
                isNew: !isInitial
            });
        }
    }
}

// 敵（プレイヤー2）のドロー
function drawEnemy(isInitial = false) {
    if (state.gameMode === 'cpu') return; // CPU戦では使用しない

    const pool = CARDS[state.e.nation];
    const count = isInitial ? 4 : 2;

    for(let i=0; i<count; i++) {
        if(state.e.hand.length < state.handLimit) {
            const card = getWeightedCard(pool);
            state.e.hand.push({
                ...card,
                id: Math.random(),
                isNew: !isInitial
            });
        }
    }
}

function updateUI() {
    const maxHp = 50;
    const isPvP = state.gameMode === 'pvp';
    const isPlayer2Turn = isPvP && state.currentPlayer === 'e';

    // 対人戦でプレイヤー2のターンの場合、表示を入れ替え
    const currentPlayerData = isPlayer2Turn ? state.e : state.p;
    const opponentData = isPlayer2Turn ? state.p : state.e;

    document.getElementById('player-hp-text').innerText = Math.max(0, currentPlayerData.hp);
    document.getElementById('player-hp-bar').style.width = `${Math.max(0, (currentPlayerData.hp / maxHp) * 100)}%`;
    document.getElementById('player-res').innerText = currentPlayerData.res;

    const currentHand = isPvP ? currentPlayerData.hand : state.p.hand;
    document.getElementById('hand-count').innerText = `${currentHand.length} / ${state.handLimit}`;

    document.getElementById('enemy-hp-text').innerText = Math.max(0, opponentData.hp);
    document.getElementById('enemy-hp-bar').style.width = `${Math.max(0, (opponentData.hp / maxHp) * 100)}%`;
    document.getElementById('enemy-res').innerText = opponentData.res;

    if (isPvP) {
        const opponentHand = opponentData.hand;
        document.getElementById('enemy-cards').innerText = `${opponentHand.length} / ${state.handLimit}`;
    } else {
        document.getElementById('enemy-cards').innerText = `${state.e.handCount} / ${state.handLimit}`;
    }

    const handEl = document.getElementById('player-hand');
    handEl.innerHTML = '';
    currentHand.forEach((c, i) => {
        const d = document.createElement('div');
        d.className = `w-30 h-40 shrink-0 flex flex-col justify-between active:scale-90 transition-transform cursor-pointer ${c.isNew ? 'draw-anim' : ''}`;

        // 予算不足の場合はグレーアウト
        const isAffordable = currentPlayerData.res >= c.cost;
        const opacity = isAffordable ? '1' : '0.5';

        // ユニットタイプに応じたアイコン取得
        const icon = getUnitIcon(c);

        d.style.cssText = `
            background: linear-gradient(145deg, #2a2520, #1a1510);
            border: 2px solid ${isAffordable ? '#4a6fa5' : '#4a3f30'};
            border-radius: 6px;
            padding: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
            position: relative;
            box-sizing: border-box;
            width: 120px;
            height: 160px;
        `;

        d.innerHTML = `
            <div style="opacity: ${opacity};">
                <div class="flex justify-between items-center font-bold text-[10px] mb-2">
                    <span class="truncate pr-1" style="color: #d4c5b0; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${c.name}</span>
                    <span style="color: #fbbf24; background: rgba(251,191,36,0.25); padding: 2px 5px; border-radius: 3px; border: 1px solid #fbbf24; font-size: 9px; box-shadow: 0 0 4px rgba(251,191,36,0.3);">${c.cost}</span>
                </div>
                <div style="text-align: center; background: radial-gradient(circle, rgba(74,63,48,0.3) 0%, transparent 70%); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin: 4px auto;">
                    <div style="font-size: 28px; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.7);">${icon}</div>
                </div>
                <div class="flex flex-col gap-1 mt-2 mb-2">
                    <span class="ability-tag" style="font-size: 7px; padding: 2px 4px; text-align: center;">${c.ability}</span>
                </div>
                <div class="flex justify-between text-[8px] font-mono mt-auto pt-2" style="border-top: 1px solid #4a3f30;">
                    <div class="flex flex-col gap-0.5">
                        <span style="color: #fb923c; font-weight: bold;">⚔️${c.atk}</span>
                        <span style="color: #60a5fa; font-weight: bold;">🛡️${c.def}</span>
                    </div>
                    <div class="flex flex-col gap-0.5 text-right">
                        <span style="color: #4ade80; font-weight: bold;">❤️${c.hp}</span>
                        <span style="color: #c084fc; font-weight: bold;">⚡${c.spd}</span>
                    </div>
                </div>
            </div>
        `;

        // 長押し検出の実装
        let pressTimer;
        const longPressDuration = 500; // 500ms

        const startPress = (e) => {
            pressTimer = setTimeout(() => {
                showCardDetail(c, isAffordable);
                e.preventDefault();
            }, longPressDuration);
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
        };

        const handleClick = () => {
            clearTimeout(pressTimer);
            playCard(i);
        };

        d.addEventListener('mousedown', startPress);
        d.addEventListener('touchstart', startPress, { passive: false });
        d.addEventListener('mouseup', cancelPress);
        d.addEventListener('mouseleave', cancelPress);
        d.addEventListener('touchend', cancelPress);
        d.addEventListener('touchcancel', cancelPress);
        d.addEventListener('click', handleClick);

        handEl.appendChild(d);
        c.isNew = false;
    });

    // フィールドの表示（既に宣言済みのisPvPとisPlayer2Turnを使用）
    if (isPlayer2Turn) {
        renderField('player-field', state.e.field, false);
        renderField('enemy-field', state.p.field, true);
    } else {
        renderField('player-field', state.p.field, false);
        renderField('enemy-field', state.e.field, true);
    }
}

function renderField(id, units, isEnemy) {
    const el = document.getElementById(id);
    el.innerHTML = '';
    units.forEach(u => {
        const d = document.createElement('div');
        const borderColor = isEnemy ? '#8b3a3a' : '#4a6fa5';
        d.className = `unit-card w-30 h-40 shrink-0 flex flex-col justify-between ${u.broken ? 'opacity-40 grayscale' : ''} ${u.animClass || ''}`;

        const icon = getUnitIcon(u);

        d.style.cssText = `
            background: linear-gradient(145deg, #2a2520, #1a1510);
            border: 2px solid ${borderColor};
            border-radius: 6px;
            padding: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
            position: relative;
            box-sizing: border-box;
            width: 120px;
            height: 160px;
        `;

        const hpPercent = (u.hp / u.maxHp) * 100;
        const hpColor = hpPercent > 66 ? '#4ade80' : hpPercent > 33 ? '#fbbf24' : '#ff6b6b';

        d.innerHTML = `
            <div>
                <div class="text-[10px] font-bold mb-2" style="color: ${isEnemy ? '#ff8787' : '#93c5fd'}; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${u.name}</div>
                <div style="text-align: center; background: radial-gradient(circle, rgba(74,63,48,0.3) 0%, transparent 70%); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin: 4px auto;">
                    <div style="font-size: 28px; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.7);">${icon}</div>
                </div>
                <div class="text-[7px] text-center font-bold" style="color: #fbbf24; background: rgba(251,191,36,0.25); padding: 2px 4px; border-radius: 3px; border: 1px solid #fbbf24; margin-top: 2px; margin-bottom: 2px; box-shadow: 0 0 4px rgba(251,191,36,0.3);">${u.ability}</div>
                ${u.broken ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: bold; color: #ff4444; text-shadow: 0 0 8px rgba(255,68,68,0.9); font-family: 'DotGothic16', sans-serif; z-index: 10;">故障</div>` : ''}
            </div>
            <div class="flex flex-col text-[8px] font-mono gap-0.5 mt-1">
                <div style="width: 100%; height: 4px; background: #1a1510; border-radius: 2px; overflow: hidden; border: 1px solid #4a3f30; margin-bottom: 2px;">
                    <div style="width: ${hpPercent}%; height: 100%; background: ${hpColor}; transition: width 0.3s; box-shadow: 0 0 4px ${hpColor};"></div>
                </div>
                <div class="flex justify-between">
                    <span style="color: #fb923c; font-weight: bold;">⚔️${u.atk}</span>
                    <span style="color: #60a5fa; font-weight: bold;">🛡️${u.def}</span>
                </div>
                <div class="flex justify-between">
                    <span style="color: ${hpColor}; font-weight: bold;">❤️${u.hp}/${u.maxHp}</span>
                    <span style="color: #c084fc; font-weight: bold;">⚡${u.spd}</span>
                </div>
            </div>
        `;

        // フィールドカードの長押し検出
        let pressTimer;
        const longPressDuration = 500;

        const startPress = (e) => {
            pressTimer = setTimeout(() => {
                showUnitDetail(u, isEnemy);
                e.preventDefault();
            }, longPressDuration);
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
        };

        d.addEventListener('mousedown', startPress);
        d.addEventListener('touchstart', startPress, { passive: false });
        d.addEventListener('mouseup', cancelPress);
        d.addEventListener('mouseleave', cancelPress);
        d.addEventListener('touchend', cancelPress);
        d.addEventListener('touchcancel', cancelPress);

        el.appendChild(d);
    });
}

function playCard(idx) {
    if (state.busy || state.isGameOver) return;

    const isPvP = state.gameMode === 'pvp';
    const isPlayer2Turn = isPvP && state.currentPlayer === 'e';
    const currentPlayerData = isPlayer2Turn ? state.e : state.p;
    const currentHand = isPvP ? currentPlayerData.hand : state.p.hand;
    const currentField = isPlayer2Turn ? state.e.field : state.p.field;

    const c = currentHand[idx];
    if (currentPlayerData.res >= c.cost) {
        currentPlayerData.res -= c.cost;
        const unit = {
            ...c,
            maxHp: c.hp,
            broken: (currentPlayerData.nation === 'Germany' && Math.random() < 0.2)
        };

        const prefix = isPlayer2Turn ? 'P2: ' : (isPvP ? 'P1: ' : '');
        addLog(`${prefix}${c.name}を配備（予算-${c.cost}）`, 'normal');

        if (unit.broken) {
            addLog(`${c.name}が故障状態で配備された！`, 'damage');
        }

        if (c.ability === '援軍' || c.ability === '人海戦術') {
            if (isPvP) {
                if (isPlayer2Turn) drawEnemyOne();
                else drawOne();
            } else {
                drawOne();
            }
            addLog(`${c.ability}発動！カードを引いた`, 'heal');
        }

        currentField.push(unit);
        currentHand.splice(idx, 1);
        updateUI();
    } else {
        const handEl = document.getElementById('player-hand');
        if (handEl.children[idx]) {
            handEl.children[idx].style.animation = 'shake 0.3s';
            setTimeout(() => {
                if (handEl.children[idx]) handEl.children[idx].style.animation = '';
            }, 300);
        }
        addLog(`予算不足！ ${c.name}は${c.cost}必要`, 'miss');
    }
}

function drawEnemyOne() {
    if (state.e.hand.length < state.handLimit) {
        const pool = CARDS[state.e.nation];
        state.e.hand.push({ ...getWeightedCard(pool), id: Math.random(), isNew: true });
    }
}

function drawOne() {
    if (state.p.hand.length < state.handLimit) {
        const pool = CARDS[state.p.nation];
        state.p.hand.push({ ...getWeightedCard(pool), id: Math.random(), isNew: true });
    }
}

document.getElementById('execute-btn').onclick = executeCombat;

async function executeCombat() {
    if (state.busy || state.isGameOver) return;

    // 対人戦で配置フェーズの場合
    if (state.gameMode === 'pvp' && state.gamePhase === 'deploy') {
        if (state.currentPlayer === 'p') {
            // P1配置完了 → P2配置フェーズへ
            addLog('プレイヤー1の配置が完了', 'normal');
            state.currentPlayer = 'e';
            showTurnSwitchModal();
            return;
        } else {
            // P2配置完了 → 戦闘フェーズへ即座に移行
            addLog('プレイヤー2の配置が完了', 'normal');
            addLog('両プレイヤーの配置完了 - 戦闘開始！', 'heal');
            state.gamePhase = 'combat';
            // 戦闘を即座に開始（returnせずに下の戦闘処理に進む）
        }
    }

    // 戦闘フェーズ開始
    state.busy = true;
    document.getElementById('execute-btn').disabled = true;
    document.getElementById('status-tag').innerText = "戦闘中...";

    addLog('━━━ 戦闘フェイズ ━━━', 'normal');

    // CPU戦の場合のみ敵AIの手札補充とプレイ
    if (state.gameMode === 'cpu') {
        const ePool = CARDS[state.e.nation];
        while (state.e.res >= 1 && state.e.handCount > 0) {
            const c = getWeightedCard(ePool);
            if (state.e.res >= c.cost) {
                state.e.res -= c.cost;
                state.e.handCount--;
                const unit = {
                    ...c,
                    maxHp: c.hp,
                    broken: (state.e.nation === 'Germany' && Math.random() < 0.2)
                };
                state.e.field.push(unit);
                addLog(`敵が${c.name}を配備`, 'normal');
            } else break;
        }
        updateUI();
        await sleep(600);
    }

    // 戦闘フェイズ：速度順に攻撃
    const allUnits = [];
    state.p.field.forEach((u, i) => allUnits.push({ unit: u, side: 'player', index: i }));
    state.e.field.forEach((u, i) => allUnits.push({ unit: u, side: 'enemy', index: i }));

    // 速度でソート（高い順、同速度ならランダム）
    allUnits.sort((a, b) => {
        if (b.unit.spd !== a.unit.spd) return b.unit.spd - a.unit.spd;
        return Math.random() - 0.5;
    });

    for (const attacker of allUnits) {
        if (state.isGameOver) break;
        const u = attacker.unit;
        if (!u || u.hp <= 0 || u.broken) continue;

        // 攻撃対象を探す（同じインデックスの敵、いなければランダム）
        const isPlayer = attacker.side === 'player';
        const targetField = isPlayer ? state.e.field : state.p.field;
        let target = targetField[attacker.index];
        if (!target || target.hp <= 0) {
            const validTargets = targetField.filter(t => t.hp > 0 && !t.broken);
            target = validTargets[Math.floor(Math.random() * validTargets.length)];
        }

        // カットイン演出（30%の確率で発動）
        if (Math.random() < 0.3) {
            showCutin(u, !isPlayer);
        }

        // アニメーション
        u.animClass = isPlayer ? 'attacking' : 'enemy-attacking';
        updateUI();
        await sleep(250);

        // 迎撃能力（攻撃を受ける前に反撃）
        if (target && target.ability === '迎撃' && target.hp > 0 && !target.broken) {
            addLog(`${target.name}の迎撃射撃！`, 'miss');
            // 迎撃ダメージ計算（攻撃力の50%）
            const interceptDmg = Math.max(Math.floor(target.atk * 0.5), 1);
            u.hp -= interceptDmg;
            
            showDamageNumber(interceptDmg, isPlayer ? 
                document.getElementById('player-field').children[attacker.index] : 
                document.getElementById('enemy-field').children[attacker.index]
            );

            if (u.hp <= 0) {
                addLog(`${u.name}は迎撃され撃墜された！`, 'damage');
                u.animClass = '';
                updateUI();
                await sleep(150);
                continue; // 攻撃キャンセル
            }
        }

        applyDamage(u, target, !isPlayer, attacker.index);

        u.animClass = '';
        updateUI();
        await sleep(150);
    }

    resolveEndOfTurn();
    checkWin();

    if (!state.isGameOver) {
        // 予算補充
        let pSupply = NATIONS[state.p.nation].supply;
        let eSupply = NATIONS[state.e.nation].supply;

        // イギリスの欠陥：補給線脆弱
        if (state.p.nation === 'Britain') pSupply -= 1;
        if (state.e.nation === 'Britain') eSupply -= 1;

        state.p.res += pSupply;
        state.e.res += eSupply;

        // ターン終了時に2枚ドロー
        if (state.gameMode === 'cpu') {
            draw();
            state.e.handCount = Math.min(state.handLimit, state.e.handCount + 2);
        } else {
            draw();
            drawEnemy();
        }

        // 特殊能力：補給線
        state.p.field.forEach(u => { if(u.ability === '補給線') state.p.res += 1; });
        state.e.field.forEach(u => { if(u.ability === '補給線') state.e.res += 1; });

        // 修理判定
        [...state.p.field, ...state.e.field].forEach(u => {
            if(u.broken && Math.random() > 0.5) {
                u.broken = false;
                const unitName = state.p.field.includes(u) ? u.name : `敵${u.name}`;
                addLog(`${unitName}の修理が完了した`, 'heal');
            }
        });

        state.busy = false;
        document.getElementById('execute-btn').disabled = false;
        document.getElementById('status-tag').innerText = "作戦立案中";

        // 対人戦の場合はP1配置フェーズに戻る
        if (state.gameMode === 'pvp') {
            state.currentPlayer = 'p';
            state.gamePhase = 'deploy';
            updateExecuteButton();
            showTurnSwitchModal('新しいターン - プレイヤー1');
        } else {
            updateUI();
        }
    }
}

function applyDamage(attacker, defender, targetIsPlayer, attackerIndex) {
    if (!attacker || attacker.hp <= 0 || attacker.broken) return;

    let atk = attacker.atk;

    // ポーランドの旧式装備ペナルティ
    const attackerNation = targetIsPlayer ? state.e.nation : state.p.nation;
    if (attackerNation === 'Poland') atk = Math.max(1, atk - 1);

    // 日本の決死攻撃（攻撃力+2）
    if (attacker.ability === '決死') {
        atk += 2;
    }

    // 中国とソ連の訓練不足/通信不全（命中率低下）
    if ((attackerNation === 'China' || attackerNation === 'USSR') && Math.random() < 0.3) {
        addLog(`${attacker.name}の攻撃は失敗した...`, 'miss');
        return; // 30%でミス
    }

    if (defender && defender.hp > 0) {
        // 回避判定
        if (defender.ability === '回避' && Math.random() < 0.3) {
            addLog(`${defender.name}が回避した！`, 'miss');
            return;
        }
        if (defender.ability === 'ゲリラ' && Math.random() < 0.2) {
            addLog(`${defender.name}がゲリラ戦術で回避！`, 'miss');
            return;
        }

        let def = defender.def;
        // 防御力ボーナス
        if (defender.ability === '要塞化') def += 1;
        if (defender.ability === '不屈') def += 2;
        if (defender.ability === '重装甲') def += 2;
        if (defender.ability === '鋼鉄の盾') def += 2;

        // ダメージ計算: max(攻撃 - 防御, 1)
        let damage = Math.max(atk - def, 1);

        // 日本の紙装甲（被ダメージ1.3倍）
        const targetNation = targetIsPlayer ? state.p.nation : state.e.nation;
        if (targetNation === 'Japan') {
            damage = Math.ceil(damage * 1.3);
        }
        const isCritical = attacker.ability === '急降下' && Math.random() < 0.3;

        // 特殊能力：急降下
        if (isCritical) {
            damage *= 2;
            addLog(`${attacker.name}の急降下爆撃！ ${damage}ダメージ！`, 'damage');
        } else {
            addLog(`${attacker.name} → ${defender.name}：${damage}ダメージ`, 'damage');
        }

        // ダメージ数値とエフェクトを表示
        const fieldId = targetIsPlayer ? 'player-field' : 'enemy-field';
        const fieldEl = document.getElementById(fieldId);
        if (fieldEl && fieldEl.children[state[targetIsPlayer ? 'p' : 'e'].field.indexOf(defender)]) {
            const targetEl = fieldEl.children[state[targetIsPlayer ? 'p' : 'e'].field.indexOf(defender)];
            showDamageNumber(damage, targetEl);
            if (damage >= 5 || isCritical) {
                showExplosion(targetEl);
            }
        }

        // 巨砲貫通：HQにも直接ダメージ
        if (attacker.ability === '巨砲貫通') {
            const pierce = Math.floor(damage / 2);
            if (targetIsPlayer) state.p.hp -= pierce; else state.e.hp -= pierce;
            addLog(`${attacker.name}の巨砲が司令部を直撃！ ${pierce}ダメージ`, 'damage');
        }

        defender.hp -= damage;

        // オーバーキルダメージ：余剰ダメージを司令部へ
        if (defender.hp < 0) {
            const overkill = Math.abs(defender.hp);
            if (targetIsPlayer) {
                state.p.hp -= overkill;
            } else {
                state.e.hp -= overkill;
            }
            addLog(`オーバーキル！司令部に${overkill}ダメージ`, 'damage');
        }

        // 戦意高揚：攻撃時にHQ回復
        if (attacker.ability === '戦意高揚') {
            const heal = 2;
            if (targetIsPlayer) state.e.hp = Math.min(50, state.e.hp + heal);
            else state.p.hp = Math.min(50, state.p.hp + heal);
            addLog(`${attacker.name}の戦意高揚で司令部回復！`, 'heal');
        }
    } else {
        // 防衛ユニットがいない場合、HQに直接攻撃
        if (targetIsPlayer) state.p.hp -= atk;
        else state.e.hp -= atk;
        addLog(`${attacker.name}が司令部を攻撃！ ${atk}ダメージ`, 'damage');
    }
}

function resolveEndOfTurn() {
    state.p.field = state.p.field.filter(u => {
        // イタリアの低士気：HP半分以下で20%撤退
        if (state.p.nation === 'Italy' && u.hp <= u.maxHp / 2 && Math.random() < 0.2) {
            addLog(`${u.name}が撤退した...`, 'miss');
            return false;
        }

        // HP0以下で破壊
        if (u.hp <= 0) {
            addLog(`${u.name}が破壊された！`, 'damage');
            // レジスタンス：破壊時に敵HQにダメージ
            if (u.ability === 'レジスタンス') {
                state.e.hp -= 3;
                addLog(`レジスタンス発動！敵HQに3ダメージ`, 'damage');
            }
            // アメリカの世論の圧力
            if (state.p.nation === 'USA') {
                state.p.hp -= 3;
                addLog(`世論の圧力で自軍HQに3ダメージ`, 'damage');
            }
            return false;
        }

        // 野戦修理：ターン終了時にHP回復
        if (u.ability === '野戦修理') {
            u.hp = Math.min(u.maxHp, u.hp + 2);
            addLog(`${u.name}が野戦修理でHP回復`, 'heal');
        }

        return true;
    });

    state.e.field = state.e.field.filter(u => {
        // イタリアの低士気：HP半分以下で20%撤退
        if (state.e.nation === 'Italy' && u.hp <= u.maxHp / 2 && Math.random() < 0.2) {
            addLog(`敵${u.name}が撤退した`, 'miss');
            return false;
        }

        // HP0以下で破壊
        if (u.hp <= 0) {
            addLog(`敵${u.name}が破壊された！`, 'damage');
            // レジスタンス：破壊時に敵HQにダメージ
            if (u.ability === 'レジスタンス') {
                state.p.hp -= 3;
                addLog(`レジスタンス発動！自軍HQに3ダメージ`, 'damage');
            }
            // アメリカの世論の圧力
            if (state.e.nation === 'USA') {
                state.e.hp -= 3;
                addLog(`世論の圧力で敵HQに3ダメージ`, 'damage');
            }
            return false;
        }

        // 野戦修理：ターン終了時にHP回復
        if (u.ability === '野戦修理') {
            u.hp = Math.min(u.maxHp, u.hp + 2);
            addLog(`敵${u.name}が野戦修理でHP回復`, 'heal');
        }

        return true;
    });
}

function checkWin() {
    if (state.isGameOver) return;
    if (state.e.hp <= 0) endGame(true);
    else if (state.p.hp <= 0) endGame(false);
}

function endGame(win) {
    state.isGameOver = true;
    updateUI();
    const modal = document.getElementById('gameover-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.getElementById('gameover-title').innerText = win ? "勝利" : "敗北";
    document.getElementById('gameover-title').classList.add(win ? 'text-blue-500' : 'text-red-600');
    document.getElementById('gameover-reason').innerText = win ? "敵戦線を完全突破。この戦いは我が軍の勝利で終わった。" : "防衛線が崩壊し、司令部が陥落した。歴史が塗り替えられた。";
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// カットイン演出
function showCutin(unit, isEnemy) {
    const cutin = document.createElement('div');
    cutin.className = 'cutin-overlay';
    cutin.innerHTML = `
        <div class="cutin-flash"></div>
        <div class="cutin-card">
            <div class="cutin-name">${unit.name}</div>
            <div class="cutin-ability">${unit.ability}</div>
        </div>
    `;
    document.body.appendChild(cutin);
    setTimeout(() => cutin.remove(), 600);
}

// ダメージ数値表示
function showDamageNumber(damage, element, isHeal = false) {
    const rect = element.getBoundingClientRect();
    const dmgNum = document.createElement('div');
    dmgNum.className = 'damage-number';
    dmgNum.textContent = isHeal ? `+${damage}` : `-${damage}`;
    dmgNum.style.left = `${rect.left + rect.width / 2}px`;
    dmgNum.style.top = `${rect.top + rect.height / 2}px`;
    if (isHeal) dmgNum.style.color = '#51cf66';
    document.body.appendChild(dmgNum);
    setTimeout(() => dmgNum.remove(), 800);
}

// 爆発エフェクト
function showExplosion(element) {
    const rect = element.getBoundingClientRect();
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${rect.left + rect.width / 2 - 40}px`;
    explosion.style.top = `${rect.top + rect.height / 2 - 40}px`;
    document.body.appendChild(explosion);
    setTimeout(() => explosion.remove(), 500);
}

// 戦闘ログに追加
function addLog(message, type = 'normal') {
    combatLog.push({ message, type, time: Date.now() });
    if (combatLog.length > 20) combatLog.shift();
    updateLog();
}

function updateLog() {
    let logEl = document.getElementById('combat-log');
    if (!logEl) {
        logEl = document.createElement('div');
        logEl.id = 'combat-log';
        logEl.className = 'combat-log';
        document.body.appendChild(logEl);
    }
    logEl.innerHTML = combatLog.slice(-10).map(log =>
        `<div class="log-entry log-${log.type}">${log.message}</div>`
    ).join('');
    logEl.scrollTop = logEl.scrollHeight;
}

// ターン交代モーダル表示
function showTurnSwitchModal(message) {
    const nextPlayerNation = state.currentPlayer === 'p' ? state.p.nation : state.e.nation;
    const nextPlayerName = `${state.currentPlayer === 'p' ? 'プレイヤー1' : 'プレイヤー2'} (${NATIONS[nextPlayerNation].name})`;

    const displayMessage = message || `${nextPlayerName}の配置フェーズ`;
    document.getElementById('next-player-name').innerText = displayMessage;

    const modal = document.getElementById('turn-switch-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // 手札を隠す
    document.getElementById('player-hand').style.filter = 'blur(10px)';
}

// 実行ボタンのテキストを更新
function updateExecuteButton() {
    const btn = document.getElementById('execute-btn');

    if (state.gameMode === 'cpu') {
        btn.innerHTML = '作戦実行 ▶';
    } else if (state.gameMode === 'pvp') {
        if (state.gamePhase === 'deploy') {
            const playerNum = state.currentPlayer === 'p' ? '1' : '2';
            btn.innerHTML = `P${playerNum}配置完了 ✓`;
        } else {
            btn.innerHTML = '戦闘開始 ⚔️';
        }
    }
}

// 準備完了ボタン
document.getElementById('ready-btn').onclick = function() {
    const modal = document.getElementById('turn-switch-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    // 手札のぼかしを解除
    document.getElementById('player-hand').style.filter = 'none';

    updateUI();
    updateExecuteButton();
};

// カード詳細表示（手札用）
function showCardDetail(card, isAffordable) {
    const modal = document.createElement('div');
    modal.className = 'card-detail-modal';
    modal.innerHTML = `
        <div class="card-detail">
            <div class="card-detail-name">${card.name}</div>
            <div class="card-detail-cost">コスト: ${card.cost}</div>
            <div class="card-detail-ability">${card.ability}</div>
            <div class="card-detail-desc">${card.desc}</div>
            <div class="card-detail-stats">
                <div class="card-detail-stat" style="border-color: #fb923c; color: #fb923c;">
                    攻撃力<br><strong style="font-size: 24px;">${card.atk}</strong>
                </div>
                <div class="card-detail-stat" style="border-color: #60a5fa; color: #60a5fa;">
                    防御力<br><strong style="font-size: 24px;">${card.def}</strong>
                </div>
                <div class="card-detail-stat" style="border-color: #4ade80; color: #4ade80;">
                    HP<br><strong style="font-size: 24px;">${card.hp}</strong>
                </div>
                <div class="card-detail-stat" style="border-color: #c084fc; color: #c084fc;">
                    速度<br><strong style="font-size: 24px;">${card.spd}</strong>
                </div>
            </div>
            ${!isAffordable ? '<div style="margin-top: 16px; color: #ff6b6b; font-size: 14px; text-align: center;">⚠ 予算不足</div>' : ''}
        </div>
    `;

    // クリックで閉じる
    modal.onclick = () => modal.remove();

    document.body.appendChild(modal);
}

// ユニット詳細表示（フィールド用）
function showUnitDetail(unit, isEnemy) {
    const hpPercent = (unit.hp / unit.maxHp) * 100;
    const hpColor = hpPercent > 66 ? '#4ade80' : hpPercent > 33 ? '#fbbf24' : '#ff6b6b';

    const modal = document.createElement('div');
    modal.className = 'card-detail-modal';
    modal.innerHTML = `
        <div class="card-detail" style="border-color: ${isEnemy ? '#8b3a3a' : '#4a6fa5'};">
            <div class="card-detail-name" style="color: ${isEnemy ? '#ff8787' : '#93c5fd'};">${unit.name}</div>
            <div class="card-detail-ability">${unit.ability}</div>
            ${unit.desc ? `<div class="card-detail-desc">${unit.desc}</div>` : ''}
            <div class="card-detail-stats">
                <div class="card-detail-stat" style="border-color: #fb923c; color: #fb923c;">
                    攻撃力<br><strong style="font-size: 24px;">${unit.atk}</strong>
                </div>
                <div class="card-detail-stat" style="border-color: #60a5fa; color: #60a5fa;">
                    防御力<br><strong style="font-size: 24px;">${unit.def}</strong>
                </div>
                <div class="card-detail-stat" style="border-color: ${hpColor}; color: ${hpColor};">
                    HP<br><strong style="font-size: 24px;">${unit.hp}/${unit.maxHp}</strong>
                </div>
                <div class="card-detail-stat" style="border-color: #c084fc; color: #c084fc;">
                    速度<br><strong style="font-size: 24px;">${unit.spd}</strong>
                </div>
            </div>
            ${unit.broken ? '<div style="margin-top: 16px; color: #ff6b6b; font-size: 18px; text-align: center; font-family: \'DotGothic16\', sans-serif;">⚠ 故障中</div>' : ''}
        </div>
    `;

    // クリックで閉じる
    modal.onclick = () => modal.remove();

    document.body.appendChild(modal);
}

// チュートリアル機能
function openTutorial() {
    tutorialState.currentPage = 0;
    document.getElementById('tutorial-modal').classList.remove('hidden');
    document.getElementById('tutorial-modal').classList.add('flex');
    updateTutorialPage();
}

function closeTutorial() {
    document.getElementById('tutorial-modal').classList.add('hidden');
    document.getElementById('tutorial-modal').classList.remove('flex');
}

function changeTutorialPage(delta) {
    tutorialState.currentPage = Math.max(0, Math.min(tutorialState.totalPages - 1, tutorialState.currentPage + delta));
    updateTutorialPage();
}

function updateTutorialPage() {
    const page = tutorialState.currentPage;
    const content = document.getElementById('tutorial-content');

    // ページインジケーター更新
    for (let i = 0; i < tutorialState.totalPages; i++) {
        const indicator = document.getElementById(`page-indicator-${i}`);
        if (indicator) {
            indicator.style.background = i === page ? '#d4af37' : '#4a3f30';
        }
    }

    // ナビゲーションボタン表示制御
    document.getElementById('tutorial-prev').style.display = page === 0 ? 'none' : 'block';
    document.getElementById('tutorial-next').style.display = page === tutorialState.totalPages - 1 ? 'none' : 'block';
    document.getElementById('tutorial-close').style.display = page === tutorialState.totalPages - 1 ? 'block' : 'none';

    // 各ページのコンテンツ
    const pages = [
        // ページ0: ゲーム概要
        `
            <h2 class="text-2xl font-bold mb-4 text-center" style="color: #d4af37;">ゲーム概要</h2>
            <div style="color: #d4c5b0; line-height: 1.8; font-size: 13px;">
                <p class="mb-3">「戦線：国家の欠陥」は第二次世界大戦をテーマにしたターン制カードバトルゲームです。</p>
                <div class="mb-3 p-3 rounded" style="background: rgba(74,63,48,0.3); border: 1px solid #4a3f30;">
                    <div class="font-bold mb-2" style="color: #fbbf24;">勝利条件</div>
                    <p style="color: #8a7f70; font-size: 12px;">敵軍の司令部HPを0にする</p>
                </div>
                <div class="mb-3 p-3 rounded" style="background: rgba(74,63,48,0.3); border: 1px solid #4a3f30;">
                    <div class="font-bold mb-2" style="color: #ff6b6b;">敗北条件</div>
                    <p style="color: #8a7f70; font-size: 12px;">自軍の司令部HPが0になる</p>
                </div>
                <p style="color: #8a7f70; font-size: 11px; text-align: center;">各国家は固有の欠陥を持っています</p>
            </div>
        `,
        // ページ1: ゲームの流れ
        `
            <h2 class="text-2xl font-bold mb-4 text-center" style="color: #d4af37;">ゲームの流れ</h2>
            <div style="color: #d4c5b0; line-height: 1.6; font-size: 13px;">
                <div class="mb-3 p-3 rounded" style="background: rgba(59,130,246,0.2); border-left: 3px solid #60a5fa;">
                    <div class="font-bold mb-1" style="color: #60a5fa;">1. 配置フェーズ</div>
                    <p style="color: #8a7f70; font-size: 11px;">予算を使って手札からカードを戦場に配備</p>
                </div>
                <div class="mb-3 p-3 rounded" style="background: rgba(239,68,68,0.2); border-left: 3px solid #ff6b6b;">
                    <div class="font-bold mb-1" style="color: #ff6b6b;">2. 戦闘フェーズ</div>
                    <p style="color: #8a7f70; font-size: 11px;">「作戦実行」で戦闘開始。速度順に攻撃</p>
                </div>
                <div class="mb-3 p-3 rounded" style="background: rgba(74,222,128,0.2); border-left: 3px solid #4ade80;">
                    <div class="font-bold mb-1" style="color: #4ade80;">3. ターン終了</div>
                    <p style="color: #8a7f70; font-size: 11px;">予算補充（各国により異なる）</p>
                    <p style="color: #8a7f70; font-size: 11px;">カード2枚ドロー</p>
                </div>
                <p style="color: #8a7f70; font-size: 10px; text-align: center; margin-top: 8px;">初回は手札4枚からスタート</p>
            </div>
        `,
        // ページ2: カードの見方
        `
            <h2 class="text-2xl font-bold mb-4 text-center" style="color: #d4af37;">カードの見方</h2>
            <div style="color: #d4c5b0; line-height: 1.6; font-size: 12px;">
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div class="p-2 rounded text-center" style="background: rgba(251,191,36,0.2); border: 1px solid #fbbf24;">
                        <div class="font-bold" style="color: #fbbf24;">コスト</div>
                        <p style="color: #8a7f70; font-size: 10px;">配備に必要な予算</p>
                    </div>
                    <div class="p-2 rounded text-center" style="background: rgba(251,146,60,0.2); border: 1px solid #fb923c;">
                        <div class="font-bold" style="color: #fb923c;">攻撃力</div>
                        <p style="color: #8a7f70; font-size: 10px;">与えるダメージ</p>
                    </div>
                    <div class="p-2 rounded text-center" style="background: rgba(96,165,250,0.2); border: 1px solid #60a5fa;">
                        <div class="font-bold" style="color: #60a5fa;">防御力</div>
                        <p style="color: #8a7f70; font-size: 10px;">受けるダメージ減</p>
                    </div>
                    <div class="p-2 rounded text-center" style="background: rgba(74,222,128,0.2); border: 1px solid #4ade80;">
                        <div class="font-bold" style="color: #4ade80;">HP</div>
                        <p style="color: #8a7f70; font-size: 10px;">耐久力</p>
                    </div>
                    <div class="p-2 rounded text-center" style="background: rgba(192,132,252,0.2); border: 1px solid #c084fc;">
                        <div class="font-bold" style="color: #c084fc;">速度</div>
                        <p style="color: #8a7f70; font-size: 10px;">攻撃順（高い順）</p>
                    </div>
                    <div class="p-2 rounded text-center" style="background: rgba(212,175,55,0.2); border: 1px solid #d4af37;">
                        <div class="font-bold" style="color: #d4af37;">特殊能力</div>
                        <p style="color: #8a7f70; font-size: 10px;">固有の効果</p>
                    </div>
                </div>
                <p style="color: #8a7f70; font-size: 10px; text-align: center;">カードを長押しで詳細表示</p>
            </div>
        `,
        // ページ3: 国家の特性
        `
            <h2 class="text-2xl font-bold mb-4 text-center" style="color: #d4af37;">国家の特性と欠陥</h2>
            <div style="color: #d4c5b0; line-height: 1.5; font-size: 11px; max-height: 320px; overflow-y: auto;">
                <div class="mb-2 p-2 rounded" style="background: rgba(139,58,58,0.2); border: 1px solid #8b3a3a;">
                    <div class="font-bold" style="color: #ff8787;">🇩🇪 ドイツ（予算5）</div>
                    <p style="color: #ff6b6b; font-size: 10px;">欠陥：機械的故障（20%で配備時故障）</p>
                </div>
                <div class="mb-2 p-2 rounded" style="background: rgba(139,58,58,0.2); border: 1px solid #8b3a3a;">
                    <div class="font-bold" style="color: #ff8787;">🇯🇵 日本（予算5）</div>
                    <p style="color: #ff6b6b; font-size: 10px;">欠陥：紙装甲（被ダメージ1.3倍）</p>
                </div>
                <div class="mb-2 p-2 rounded" style="background: rgba(139,58,58,0.2); border: 1px solid #8b3a3a;">
                    <div class="font-bold" style="color: #ff8787;">🇷🇺 ソ連（予算5）</div>
                    <p style="color: #ff6b6b; font-size: 10px;">欠陥：訓練不足（30%で攻撃ミス）</p>
                </div>
                <div class="mb-2 p-2 rounded" style="background: rgba(139,58,58,0.2); border: 1px solid #8b3a3a;">
                    <div class="font-bold" style="color: #ff8787;">🇺🇸 アメリカ（予算7）</div>
                    <p style="color: #ff6b6b; font-size: 10px;">欠陥：世論の圧力（ユニット損失時HQ-5）</p>
                </div>
                <div class="mb-2 p-2 rounded" style="background: rgba(139,58,58,0.2); border: 1px solid #8b3a3a;">
                    <div class="font-bold" style="color: #ff8787;">🇵🇱 ポーランド（予算4）</div>
                    <p style="color: #ff6b6b; font-size: 10px;">欠陥：旧式装備（全ユニット攻撃力-1）</p>
                </div>
                <div class="mb-2 p-2 rounded" style="background: rgba(139,58,58,0.2); border: 1px solid #8b3a3a;">
                    <div class="font-bold" style="color: #ff8787;">🇬🇧 イギリス（予算5）</div>
                    <p style="color: #ff6b6b; font-size: 10px;">欠陥：供給遅延（ターン開始時予算-1）</p>
                </div>
                <div class="mb-2 p-2 rounded" style="background: rgba(139,58,58,0.2); border: 1px solid #8b3a3a;">
                    <div class="font-bold" style="color: #ff8787;">🇫🇷 フランス（予算5）</div>
                    <p style="color: #ff6b6b; font-size: 10px;">欠陥：内部分裂（25%でカード配備失敗）</p>
                </div>
                <div class="mb-2 p-2 rounded" style="background: rgba(139,58,58,0.2); border: 1px solid #8b3a3a;">
                    <div class="font-bold" style="color: #ff8787;">🇮🇹 イタリア（予算4）</div>
                    <p style="color: #ff6b6b; font-size: 10px;">欠陥：低士気（HP半分以下で20%撤退）</p>
                </div>
                <div class="mb-2 p-2 rounded" style="background: rgba(139,58,58,0.2); border: 1px solid #8b3a3a;">
                    <div class="font-bold" style="color: #ff8787;">🇨🇳 中国（予算3）</div>
                    <p style="color: #ff6b6b; font-size: 10px;">欠陥：訓練不足（30%で攻撃ミス）</p>
                </div>
            </div>
        `,
        // ページ4: 戦闘のコツ
        `
            <h2 class="text-2xl font-bold mb-4 text-center" style="color: #d4af37;">戦闘のコツ</h2>
            <div style="color: #d4c5b0; line-height: 1.7; font-size: 12px;">
                <div class="mb-3 p-3 rounded" style="background: rgba(74,63,48,0.3); border: 1px solid #4a3f30;">
                    <div class="font-bold mb-1" style="color: #fbbf24;">⚡ 速度が重要</div>
                    <p style="color: #8a7f70; font-size: 11px;">速度の高いユニットが先に攻撃。敵を倒せば反撃されない</p>
                </div>
                <div class="mb-3 p-3 rounded" style="background: rgba(74,63,48,0.3); border: 1px solid #4a3f30;">
                    <div class="font-bold mb-1" style="color: #60a5fa;">🛡️ オーバーキルに注意</div>
                    <p style="color: #8a7f70; font-size: 11px;">ユニット破壊時の余剰ダメージは司令部に直撃</p>
                </div>
                <div class="mb-3 p-3 rounded" style="background: rgba(74,63,48,0.3); border: 1px solid #4a3f30;">
                    <div class="font-bold mb-1" style="color: #4ade80;">💰 予算管理</div>
                    <p style="color: #8a7f70; font-size: 11px;">低コストユニットと高コストユニットをバランスよく配備</p>
                </div>
                <div class="mb-3 p-3 rounded" style="background: rgba(74,63,48,0.3); border: 1px solid #4a3f30;">
                    <div class="font-bold mb-1" style="color: #c084fc;">✨ 特殊能力活用</div>
                    <p style="color: #8a7f70; font-size: 11px;">国家ごとの特殊能力を活かした戦術を組み立てよう</p>
                </div>
            </div>
        `
    ];

    content.innerHTML = pages[page];
}
