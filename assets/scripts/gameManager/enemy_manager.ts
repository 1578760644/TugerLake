import { _decorator, Component, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
import { Enemy_01 } from '../prefabs/enemy_01';
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

    @property(Node)
    public spawnPos: Node = null; //暂时在这里获取生成位置，后面通过spawnManager调用生成方法来控制生成
    private _activeEnemies: Node[] = [];    //活跃敌人列表

    private _enemyPool: NodePool = null;
    private _spawnTimer: number = 0;

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
        const spawnPos = this.spawnPos.getWorldPosition();
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
}


