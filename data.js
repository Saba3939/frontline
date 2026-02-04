// 国家データ
const NATIONS = {
    'Germany': { name: 'ドイツ', flag: '🇩🇪', flaw: '機械的故障 (20%で停止)', supply: 5 },
    'Japan': { name: '日本', flag: '🇯🇵', flaw: '紙装甲 (被ダメ1.3倍)', supply: 5 },
    'USSR': { name: 'ソ連', flag: '🇷🇺', flaw: '通信不全 (30%で攻撃失敗)', supply: 5 },
    'USA': { name: 'アメリカ', flag: '🇺🇸', flaw: '世論の圧力 (損失ダメ)', supply: 7 },
    'Britain': { name: 'イギリス', flag: '🇬🇧', flaw: '補給線脆弱 (予算-1)', supply: 7 },
    'Italy': { name: 'イタリア', flag: '🇮🇹', flaw: '低士気 (撤退しやすい)', supply: 5 },
    'Poland': { name: 'ポーランド', flag: '🇵🇱', flaw: '旧式装備 (攻撃-1)', supply: 5 },
    'China': { name: '中国', flag: '🇨🇳', flaw: '訓練不足 (命中率低下)', supply: 6 }
};

// カードデータ（hp: HP、def: 防御力、spd: 速度）
const CARDS = {
    'Germany': [
        { name: 'ティーガーI', cost: 7, atk: 12, def: 9, hp: 25, spd: 2, ability: '重装甲', desc: '受けるダメージ-2' },
        { name: 'パンター', cost: 5, atk: 10, def: 7, hp: 18, spd: 5, ability: '重装甲', desc: '受けるダメージ-2' },
        { name: 'Ju87 スツーカ', cost: 4, atk: 12, def: 2, hp: 10, spd: 8, ability: '急降下', desc: '30%で2倍ダメージ' },
        { name: 'IV号戦車', cost: 3, atk: 7, def: 5, hp: 17, spd: 4, ability: '電撃戦', desc: '先制攻撃' },
        { name: '88mm高射砲', cost: 3, atk: 14, def: 1, hp: 8, spd: 1, ability: '要塞化', desc: '防御+1' },
        { name: '国防軍歩兵', cost: 1, atk: 2, def: 1, hp: 6, spd: 1, ability: '要塞化', desc: '防御+1' }
    ],
    'Japan': [
        { name: '戦艦大和', cost: 8, atk: 18, def: 10, hp: 40, spd: 1, ability: '巨砲貫通', desc: '防衛を貫通しHQにダメージ' },
        { name: '一式陸攻', cost: 5, atk: 15, def: 1, hp: 12, spd: 6, ability: '急降下', desc: '30%で2倍ダメージ' },
        { name: '伊号潜水艦', cost: 4, atk: 10, def: 2, hp: 10, spd: 3, ability: '回避', desc: '30%で無ダメージ' },
        { name: '零戦', cost: 2, atk: 6, def: 1, hp: 8, spd: 10, ability: '回避', desc: '30%で無ダメージ' },
        { name: '九七式中戦車', cost: 2, atk: 3, def: 2, hp: 10, spd: 4, ability: '決死', desc: '攻撃+2' },
        { name: '近衛師団', cost: 2, atk: 3, def: 1, hp: 8, spd: 2, ability: '決死', desc: '攻撃+2' }
    ],
    'USSR': [
        { name: 'IS-2重戦車', cost: 5, atk: 10, def: 8, hp: 24, spd: 3, ability: '鋼鉄の波', desc: 'HPが高い' },
        { name: 'Il-2', cost: 5, atk: 8, def: 6, hp: 18, spd: 6, ability: '重装甲', desc: '受けるダメージ-2' },
        { name: 'カチューシャ', cost: 4, atk: 9, def: 1, hp: 12, spd: 2, ability: '巨砲貫通', desc: '防衛を貫通しHQにダメージ' },
        { name: 'KV-1', cost: 4, atk: 7, def: 9, hp: 22, spd: 2, ability: '鋼鉄の盾', desc: '受けるダメージ-2' },
        { name: 'T-34/76', cost: 2, atk: 4, def: 3, hp: 12, spd: 5, ability: '量産', desc: '低コスト' },
        { name: '新兵連隊', cost: 1, atk: 2, def: 1, hp: 5, spd: 1, ability: '援軍', desc: 'プレイ時もう1枚引く' }
    ],
    'USA': [
        { name: 'B-17', cost: 7, atk: 12, def: 8, hp: 30, spd: 3, ability: '巨砲貫通', desc: '防衛を貫通しHQにダメージ' },
        { name: 'パーシング', cost: 6, atk: 11, def: 7, hp: 22, spd: 3, ability: '戦意高揚', desc: 'HQを2回復する' },
        { name: 'P-51 マスタング', cost: 4, atk: 10, def: 3, hp: 12, spd: 9, ability: '急降下', desc: '30%で2倍ダメージ' },
        { name: 'M10 ウルヴァリン', cost: 3, atk: 8, def: 2, hp: 12, spd: 5, ability: '戦意高揚', desc: 'HQを2回復する' },
        { name: 'シャーマン', cost: 3, atk: 6, def: 6, hp: 18, spd: 4, ability: '野戦修理', desc: '終了時HP+2' },
        { name: 'GI小隊', cost: 2, atk: 4, def: 2, hp: 9, spd: 2, ability: '補給線', desc: '毎ターン予算+1' }
    ],
    'Britain': [
        { name: 'ランカスター', cost: 7, atk: 14, def: 4, hp: 20, spd: 3, ability: '巨砲貫通', desc: '防衛を貫通しHQにダメージ' },
        { name: 'チャーチル', cost: 6, atk: 9, def: 10, hp: 26, spd: 2, ability: '鋼鉄の盾', desc: '受けるダメージ-2' },
        { name: 'マチルダII', cost: 4, atk: 6, def: 7, hp: 18, spd: 1, ability: '鋼鉄の盾', desc: '受けるダメージ-2' },
        { name: 'クロムウェル', cost: 3, atk: 7, def: 4, hp: 14, spd: 6, ability: '野戦修理', desc: '終了時HP+2' },
        { name: 'スピットファイア', cost: 3, atk: 7, def: 1, hp: 11, spd: 10, ability: '迎撃', desc: '敵攻撃時に反撃' },
        { name: '英国兵', cost: 1, atk: 2, def: 1, hp: 6, spd: 1, ability: '不屈', desc: '防御+2' }
    ],
    'Italy': [
        { name: '戦艦ローマ', cost: 7, atk: 16, def: 8, hp: 35, spd: 2, ability: '巨砲貫通', desc: '防衛を貫通しHQにダメージ' },
        { name: 'セモヴェンテ', cost: 4, atk: 9, def: 4, hp: 12, spd: 5, ability: '機動砲撃', desc: '攻撃後に後退' },
        { name: 'M13/40', cost: 3, atk: 7, def: 4, hp: 14, spd: 3, ability: '要塞化', desc: '防御+1' },
        { name: 'マッキ戦闘機', cost: 2, atk: 6, def: 1, hp: 8, spd: 9, ability: '急降下', desc: '30%で2倍ダメージ' },
        { name: 'ベルサリエリ', cost: 2, atk: 4, def: 1, hp: 6, spd: 3, ability: '強行軍', desc: '低コスト配置' },
        { name: 'L3 タンケッテ', cost: 1, atk: 1, def: 0, hp: 4, spd: 4, ability: '補給線', desc: '毎ターン予算+1' }
    ],
    'Poland': [
        { name: 'PZL.37 ウァシ', cost: 4, atk: 10, def: 2, hp: 10, spd: 7, ability: '急降下', desc: '30%で2倍ダメージ' },
        { name: '7TP戦車', cost: 3, atk: 6, def: 4, hp: 16, spd: 5, ability: '祖国防衛', desc: '防御時ATK+3' },
        { name: '対戦車ライフル兵', cost: 2, atk: 4, def: 1, hp: 5, spd: 2, ability: 'レジスタンス', desc: '破壊時敵に3ダメージ' },
        { name: 'ウーラン騎兵', cost: 1, atk: 3, def: 1, hp: 6, spd: 7, ability: '突撃', desc: '先制攻撃' },
        { name: '国民軍', cost: 1, atk: 3, def: 1, hp: 6, spd: 1, ability: 'レジスタンス', desc: '破壊時敵に3ダメージ' },
        { name: 'TK-3', cost: 1, atk: 1, def: 0, hp: 4, spd: 5, ability: '補給線', desc: '毎ターン予算+1' }
    ],
    'China': [
        { name: 'P-40', cost: 5, atk: 10, def: 2, hp: 12, spd: 8, ability: '急降下', desc: '30%で2倍ダメージ' },
        { name: '供与戦車', cost: 4, atk: 7, def: 6, hp: 17, spd: 4, ability: '外国製', desc: '修理不可だが頑丈' },
        { name: 'I-16', cost: 3, atk: 7, def: 1, hp: 11, spd: 7, ability: '回避', desc: '30%で無ダメージ' },
        { name: '国民革命軍', cost: 1, atk: 3, def: 1, hp: 7, spd: 2, ability: '人海戦術', desc: 'プレイ時もう1枚引く' },
        { name: '大刀隊', cost: 1, atk: 4, def: 0, hp: 5, spd: 3, ability: 'レジスタンス', desc: '破壊時敵に3ダメージ' },
        { name: '八路軍', cost: 0, atk: 2, def: 0, hp: 4, spd: 4, ability: 'ゲリラ', desc: '20%で攻撃回避' }
    ]
};
