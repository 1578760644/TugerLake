import { _decorator, Component, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
import { BULLET_CONFIG } from '../config/bullet_config';
import { BulletBase } from '../base/bullet_base';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends Component {
    @property([Prefab])
    public bulletPrefabs: Prefab[] = [];

    @property(Node)
    public bulletParent: Node = null;

    @property({ displayName: '预加载数量' })
    public poolSize: number = 50;

    private _categoryPrefabMap: Record<string, Prefab> = {};

    private _poolMap: Map<string, NodePool> = new Map();

    private _activeBullets: Node[] = [];

    private static _inst: BulletManager;
    public static get inst(): BulletManager {
        return this._inst;
    }

    protected onLoad(): void {
        BulletManager._inst = this;
        this._categoryPrefabMap['light'] = this.bulletPrefabs[0];
        this._categoryPrefabMap['medium'] = this.bulletPrefabs[1];
        this._categoryPrefabMap['heavy'] = this.bulletPrefabs[2];

        this.initPools();
        this.preloadAllBullet(this.poolSize);
    }

    private initPools() {
        for (const type of Object.keys(BULLET_CONFIG)) {
            this._poolMap.set(type, new NodePool());
        }
    }

    preloadBullet(type: string, count: number) {
        const config = BULLET_CONFIG[type];
        if (!config) {
            console.warn(`[BulletManager]没有找到子弹配置：${type}`);
            return;
        }
        const category = config.bulletcategory;
        if (!category) {
            console.warn(`[BulletManager]没有找到对应子弹类型：${type}`);
            return;
        }
        const prefab = this._categoryPrefabMap[category];
        const pool = this._poolMap.get(type);
        for (let i = 0; i < count; i++) {
            const node = instantiate(prefab);
            node.active = false;
            node.removeFromParent();
            pool.put(node);
        }
    }

    preloadAllBullet(count: number) {
        for (const type of Object.keys(BULLET_CONFIG)) {
            this.preloadBullet(type, count);
        }
    }

    /**
     * 生成子弹
     * @param type      类型 
     * @param muzzle    枪口
     * @param direction 发射方向
     * @param damage    伤害
     * @returns 
     */
    spawnBullet(type: string, muzzle: Node, direction: Vec3) {
        const config = BULLET_CONFIG[type];
        if (!config) return;
        const pool = this._poolMap.get(type);
        if (!pool) return;

        let bulletNode = pool.get();
        if (!bulletNode) {
            const category = config.bulletcategory;
            const prefab = this._categoryPrefabMap[category];
            bulletNode = instantiate(prefab);
        }

        bulletNode.active = true;

        const muzzlePos = muzzle.getWorldPosition();
        bulletNode.setParent(this.bulletParent);
        bulletNode.setWorldPosition(muzzlePos);
        const bulletComp = bulletNode.getComponent(BulletBase);
        if (bulletComp) {
            bulletComp.init(config, direction, type);
        }

        this._activeBullets.push(bulletNode);
    }

    recycleBullet(bulletNode: Node, type: string) {
        const index = this._activeBullets.indexOf(bulletNode);
        if (index !== -1) this._activeBullets.splice(index, 1);

        bulletNode.active = false;
        bulletNode.removeFromParent();

        this._poolMap.get(type)?.put(bulletNode);
    }

    clearAllBullet() {
        for (let i = this._activeBullets.length - 1; i >= 0; i--) {
            const node = this._activeBullets[i];
            const bulletComp = node.getComponent(BulletBase);
            const type = bulletComp ? bulletComp.getBulletType() : '';
            this.recycleBullet(node, type);
        }
    }

    public getActiveBullets(): Node[] {
        return this._activeBullets;
    }
}





