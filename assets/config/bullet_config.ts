export interface BulletConfig {
    //基本属性
    speed: number;               //飞行速度
    damage: number;              //基础伤害
    collisionRadius?: number;    //碰撞范围，实际根据对应类型子弹的UITransform动态获取

    //行为标记
    piercing: boolean;           //穿透
    explosive: boolean;          //爆炸
    explosionRadius?: number;    //爆炸范围
    lifetime: number;            //存活时间

    //分类标签
    bulletcategory: 'light' | 'medium' | 'heavy';
    description?: string;
}

export const BULLET_CONFIG: Record<string, BulletConfig> = {
    // ===== 轻型 =====
    bullet_pistol: {
        speed: 300,
        damage: 0.4,
        collisionRadius: 8,
        piercing: false,
        explosive: false,
        lifetime: 10,
        bulletcategory: 'light',
        description: '手枪子弹',
    },
    bullet_smg: {
        speed: 700,
        damage: 0.2,
        collisionRadius: 8,
        piercing: false,
        explosive: false,
        lifetime: 10,
        bulletcategory: 'light',
        description: '冲锋枪子弹',
    },

    // ===== 中型 =====
    bullet_rifle: {
        speed: 500,
        damage: 1,
        collisionRadius: 8,
        piercing: false,
        explosive: false,
        lifetime: 10,
        bulletcategory: 'medium',
        description: '突击步枪子弹',
    },
    bullet_shotgun: {
        speed: 400,
        damage: 0.5,
        collisionRadius: 8,
        piercing: false,
        explosive: false,
        lifetime: 10,
        bulletcategory: 'medium',
        description: '霰弹枪子弹',
    },

    // ===== 重型 =====
    bullet_sniper: {
        speed: 700,
        damage: 2,
        collisionRadius: 8,
        piercing: false,
        explosive: false,
        lifetime: 10,
        bulletcategory: 'heavy',
        description: '狙击枪子弹',
    },
    bullet_rocket: {
        speed: 600,
        damage: 10,
        collisionRadius: 8,
        piercing: false,
        explosive: false,
        lifetime: 10,
        bulletcategory: 'heavy',
        description: '火箭筒子弹',
    },
}

