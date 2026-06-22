export interface WeaponConfig {
    name: string;           // 显示名称
    prefabIndex: number;    // 预制体数组索引
    category: string;       // 武器种类 'pistol', 'smg', 'sniper', 'rifle', 'shotgun', 'rocket', 'melee'
    fireInterval: number;   // 攻击间隔（秒）
    damage: number;         // 单发伤害
    attackRange: number     // 攻击范围（像素）
}


export const WEAPON_CONFIG: Record<string, WeaponConfig> = {
    pistol: {
        name: '手枪',
        prefabIndex: 0,
        category: 'pistoal',
        fireInterval: 0.6,
        damage: 1,
        attackRange: 300,
    },
    smg: {
        name: '冲锋枪',
        prefabIndex: 1,
        category: 'smg',
        fireInterval: 0.2,
        damage: 0.5,
        attackRange: 450,
    },
    sniper: {
        name: '狙击枪',
        prefabIndex: 2,
        category: 'sniper',
        fireInterval: 1,
        damage: 2,
        attackRange: 800,
    },
    refle: {
        name: '步枪',
        prefabIndex: 3,
        category: 'refle',
        fireInterval: 0.4,
        damage: 1,
        attackRange: 600,
    },
    shotgun: {
        name: '霰弹枪',
        prefabIndex: 4,
        category: 'shotgun',
        fireInterval: 0.5,
        damage: 1,
        attackRange: 450,
    },
    rocket: {
        name: '火箭筒',
        prefabIndex: 5,
        category: 'rocket',
        fireInterval: 3,
        damage: 10,
        attackRange: 700,
    }

};



