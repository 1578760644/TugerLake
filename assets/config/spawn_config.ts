export const SPAWN_CONFIG: Record<string, {
    startTime: number;      // 第x秒出现
    interval: number;       // 初始x秒一只
    minInterval: number;    // 最快x秒一只
    decay: number;          // 每过 1 秒，生成间隔减x秒
    count: number;          // 每次生成x只
}> = {
    enemy_01: {
        startTime:0,
        interval:1,
        minInterval:0.5,
        decay:0.005,
        count:2
    },
    enemy_02: {
        startTime:30,
        interval:0.5,
        minInterval:0.2,
        decay:0.005,
        count:1
    },
    
};


