import { _decorator, Component, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
import { GameManager } from './game_manager';
import { EnemyBase } from '../base/enemy_base';
import { ENEMY_CONFIG } from '../../config/enemy_config';
const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends Component {
    @property(Node)
    public enemyParent: Node = null;
    @property([Prefab])
    public enemyPrefab: Prefab[] = [];

    @property({ displayName: '预加载数量' })
    public poolSize: number = 10;

    private _poolMap: Map<string, NodePool> = new Map();

    private _activeEnemies: Node[] = [];    //活跃敌人列表

    private _tempVec3: Vec3 = new Vec3(); //复用向量，主要用于计算随机生成敌人的位置

    private static _inst: EnemyManager;
    public static get inst(): EnemyManager {
        return this._inst;
    }

    protected onLoad(): void {
        EnemyManager._inst = this;

        EnemyBase.loadAtlas();   // 只此一次
        this.initPools();
        this.preloadAllEnemy(this.poolSize);
    }

    //初始化池
    private initPools() {
        for (const prefab of this.enemyPrefab) {
            const type = prefab.name;
            this._poolMap.set(type, new NodePool())
        }
    }

    //预加载一种敌人
    preloadEnemy(type: string, count: number) {
        const config = ENEMY_CONFIG[type];
        if (!config) {
            console.warn(`[EnemyManager]没有找到敌人配置：${type}`);
            return;
        }
        const prefab = this.enemyPrefab[config.prefabIndex];
        const pool = this._poolMap.get(type);
        if (!pool) return;
        for (let i = 0; i < count; i++) {
            const node = instantiate(prefab)
            node.active = false;
            pool.put(node);
        }
    }

    //预加载全部敌人
    preloadAllEnemy(count: number) {
        for (const type of Object.keys(ENEMY_CONFIG)) {
            this.preloadEnemy(type, count);
        }
    }

    spawnEnemy(type: string, hp?: number, speed?: number) {
        const config = ENEMY_CONFIG[type];
        if (!config) return;
        const pool = this._poolMap.get(type);
        if (!pool) return;

        let node = pool.get();
        if (!node) {
            const prefab = this.enemyPrefab[config.prefabIndex];
            node = instantiate(prefab);
        }

        node.active = true;
        const enemyComp = node.getComponent(EnemyBase);
        if (enemyComp) {
            //有传入用传入，没传入用配置
            const finalHp = hp !== undefined ? hp : config.hp;
            const finalSpeed = speed !== undefined ? speed : config.speed;

            enemyComp.init(finalHp, finalSpeed, type);
        }

        node.setParent(this.enemyParent);
        const spawnPos = this.getRandomSpawnPosition(); //暂时在这里获取生成位置，后面通过spawnManager调用生成方法来控制生成
        node.setWorldPosition(spawnPos)

        this._activeEnemies.push(node);
    }

    recycleEnemy(enemyNode: Node, type: string) {
        // 1. 从活跃列表移除
        const index = this._activeEnemies.indexOf(enemyNode);
        if (index !== -1) this._activeEnemies.splice(index, 1);

        // 2. 重置状态（血量由下次 spawn 时初始化）
        enemyNode.active = false;
        enemyNode.removeFromParent(); //必须要从父节点上移除，如果只是put放回对象池里。实际上节点还是存在在父节点下，只是没渲染

        this._poolMap.get(type)?.put(enemyNode);
    }

    public getActiveEnemies(): Node[] {
        return this._activeEnemies;
    }

    /* 
    在玩家周围屏幕外区域随机生成一个世界坐标
    @return 随机出生点 Vec3
    */
    private getRandomSpawnPosition(): Vec3 {
        const player = GameManager.inst.player;
        if (!player) return this._tempVec3.set(0, 0, 0); //安全处理

        const playerPos = player.getWorldPosition();

        // 1. 随机角度：0 到 2π
        const angle = Math.random() * Math.PI * 2

        //2.随机距离，740 ~ 800（确保在屏幕外）
        const minDist = 540;
        const maxDist = 600;
        const distance = minDist + Math.random() * (maxDist - minDist);

        // 3. 计算出生偏移
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        // 4. 写入复用向量，返回玩家位置 + 偏移
        return this._tempVec3.set(playerPos.x + offsetX, playerPos.y + offsetY, 0)
    }

    public recycleAllEnemies() {
        //倒叙遍历
        for (let i = this._activeEnemies.length - 1; i >= 0; i--) {
            const node = this._activeEnemies[i];
            const enemyComp = node.getComponent(EnemyBase);
            const type = enemyComp ? enemyComp.getEnemyType() : '';
            this.recycleEnemy(node, type);
        }
        this._activeEnemies = [];
    }
}


