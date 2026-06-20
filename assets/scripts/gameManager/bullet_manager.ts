import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { Bullet_01 } from '../prefabs/bullet_01';
import { EnemyManager } from './enemy_manager';
import { GameManager } from './game_manager';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends Component {
    @property(Prefab)
    public bulletPrefab: Prefab = null;

    @property(Node)
    public bulletParent: Node = null;

    @property(Node)
    public muzzle: Node = null;

    @property
    public fireInterval: number = 0.2;

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
        if (GameManager.inst.isPause) return;  //暂时这么写，后续要改写成对象池。感觉会存在问题导致整个update不调用
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
        let nearestNode: Node = null;
        let minDist: number = Infinity;

        for (const enemyNode of EnemyManager.inst.getActiveEnemies()) {
            if (!enemyNode || !enemyNode.isValid) continue;
            const enemyPos = enemyNode.getWorldPosition();
            const playerPos = GameManager.inst.player.getWorldPosition();
            const dist = Vec3.distance(enemyPos, playerPos);
            if (dist < minDist) {
                minDist = dist;
                nearestNode = enemyNode;
            }
        }
        return nearestNode;
    }

    clearAllBullet() {
        const children = this.bulletParent.children;
        for (let i = children.length - 1; i >= 0; i--) {
            children[i].destroy();
        }
    }
}





