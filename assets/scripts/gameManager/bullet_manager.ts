import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { Bullet_01 } from '../prefabs/bullet_01';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends Component {
    @property(Prefab)
    public bulletPrefab: Prefab = null;

    @property(Node)
    public bulletParent: Node = null;

    @property(Node)
    public muzzle: Node = null;

    @property(Node)
    public testEnemy: Node = null;

    @property
    public fireInterval: number = 0.3;

    private _fireTimer: number = 0;
    private _tempVec3: Vec3 = new Vec3(); //复用向量

    private static _inst: BulletManager;
    public static get inst(): BulletManager {
        return this._inst;
    }

    protected onLoad(): void {
        BulletManager._inst = this;
    }

    update(dt: number): void {
        this._fireTimer += dt;

        if (this._fireTimer < this.fireInterval) return;
        this._fireTimer -= this.fireInterval; //做减法避免帧率波动


        const target = this.findNearestEnemy();
        if (!target) return;

        //用成员变量 _tempVec3 复用来计算方向
        const muzzlePos = this.muzzle.getWorldPosition();
        const targetPos = target.getWorldPosition();
        const direction = this._tempVec3
            .set(targetPos)                               // 设置为目标位置
            .subtract(muzzlePos)                          // 减去枪口位置，得到方向向量
            .normalize();                                 // 归一化

        const bulletNode = instantiate(this.bulletPrefab);
        bulletNode.setParent(this.bulletParent);
        bulletNode.setWorldPosition(muzzlePos);
        const bulletComp = bulletNode.getComponent(Bullet_01);
        if (bulletComp) {
            bulletComp.setDirection(direction);
        }
    }

    private findNearestEnemy(): Node | null {
        // 临时实现：仅返回测试敌人，实际应遍历活跃敌人列表
        if (this.testEnemy && this.testEnemy.isValid) {
            return this.testEnemy;
        }
        return null;
    }
}





