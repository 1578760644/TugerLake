export const ENEMY_CONFIG: Record<string, {
    prefabIndex: number;   // 对应 enemyPrefabs 数组的索引
    hp: number;
    speed: number;
}> = {
    enemy_01: { prefabIndex: 0, hp: 2, speed: 100 },
    enemy_02: { prefabIndex: 1, hp: 1, speed: 200 },
    // 以后加新敌人在这里加一项即可
};


