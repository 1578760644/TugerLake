import { _decorator, Component, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseItemManager')
export class BaseItemManager extends Component {
    @property(Prefab)
    public itemPrefab: Prefab = null;

    @property(Node)
    public itemParent: Node = null;

    @property({ displayName: '预加载数量' })
    public poolSize: number = 10;

    private _pool: NodePool = new NodePool();
    private _activeList: Node[] = []

    protected onLoad(): void {
        for (let i = 0; i < this.poolSize; i++) {
            const node = instantiate(this.itemPrefab);
            node.removeFromParent(); 
            node.active = false;
            this._pool.put(node);
        }

    }

    //在敌人死亡位置或特定位置生成物品，后续应该通过对象池来生成经验（所有大量的掉落物品）
    dropAt(position: Vec3) {
        let node = this._pool.get(); //取到当前子类
        if (!node) {
            node = instantiate(this.itemPrefab);
        }
        node.active = true;
        node.setParent(this.itemParent);
        node.setWorldPosition(position)
        this._activeList.push(node);
        return node;
    }

    recycle(node: Node) {
        const index = this._activeList.indexOf(node);
        if (index !== -1) this._activeList.splice(index, 1);
        node.active = false;
        node.removeFromParent();
        this._pool.put(node);
    }

    recycleAll() {
        for (let i = this._activeList.length - 1; i >= 0; i--) {
            const node = this._activeList[i]
            this.recycle(node);
        }
        this._activeList = [];
    }

    getActiveList(): Node[] {
        return this._activeList;
    }
}


