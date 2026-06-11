import { _decorator, Component, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
import { Enemy_01 } from '../prefabs/enemy_01';
import { GameManager } from './game_manager';
const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends Component {
    @property(Node)
    public enemyParent: Node = null;
    @property([Prefab])
    public enemyPrefab: Prefab[] = [];
    @property({ displayName: '预加载数量' })
    public poolSize: number = 10;
    @property({ displayName: '生成间隔，单位：秒' })
    public spawnInterval: number = 0.5;

    private _activeEnemies: Node[] = [];    //活跃敌人列表

    private _enemyPool: NodePool = null;
    private _spawnTimer: number = 0;

    private _tempVec3: Vec3 = new Vec3(); //复用向量，主要用于计算随机生成敌人的位置

    private static _inst: EnemyManager;
    public static get inst(): EnemyManager {
        return this._inst;
    }

    protected onLoad(): void {
        EnemyManager._inst = this;
        this._enemyPool = new NodePool();
        const prefab = this.enemyPrefab[0];
        for (let i = 0; i < this.poolSize; i++) {
            const node = instantiate(prefab);
            node.active = false;
            this._enemyPool.put(node);
        }
    }

    update(deltaTime: number) {
        this._spawnTimer += deltaTime;
        if (this._spawnTimer > this.spawnInterval) {
            this._spawnTimer -= this.spawnInterval;
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        let enemy = this._enemyPool.get()
        if (!enemy) {
            enemy = instantiate(this.enemyPrefab[0]) //当池空了需要生成新的
        }
        enemy.active = true;
        enemy.getComponent(Enemy_01).init();
        enemy.setParent(this.enemyParent);

        const spawnPos = this.getRandomSpawnPosition(); //暂时在这里获取生成位置，后面通过spawnManager调用生成方法来控制生成
        enemy.setWorldPosition(spawnPos);


        this._activeEnemies.push(enemy);
    }

    recycleEnemy(enemyNode: Node) {
        // 1. 从活跃列表移除
        const index = this._activeEnemies.indexOf(enemyNode);
        if (index !== -1) this._activeEnemies.splice(index, 1);

        // 2. 重置状态（血量由下次 spawn 时初始化）
        enemyNode.active = false;
        enemyNode.removeFromParent(); //必须要从父节点上移除，如果只是put放回对象池里。实际上节点还是存在在父节点下，只是没渲染

        this._enemyPool.put(enemyNode);
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
        const minDist = 740;
        const maxDist = 800;
        const distance = minDist + Math.random() * (maxDist - minDist);

        // 3. 计算出生偏移
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        // 4. 写入复用向量，返回玩家位置 + 偏移
        return this._tempVec3.set(playerPos.x + offsetX, playerPos.y + offsetY, 0)
    }
}


