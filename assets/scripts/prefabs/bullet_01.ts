import { _decorator, Component, Node, UITransform, Vec2, Vec3 } from 'cc';
import { BulletManager } from '../gameManager/bullet_manager';
const { ccclass, property } = _decorator;

@ccclass('Bullet_01 ')
export class Bullet_01 extends Component {
    @property
    private speed: number = 300;

    private _direction: Vec3 = new Vec3(1, 0, 0);

    protected update(dt: number): void {
        //直接用成员变量 _direction 计算，避免重复取位置
        const offset = this._direction.clone().multiplyScalar(this.speed * dt);
        this.node.position = this.node.position.add(offset);

        this.checkCollision();
    }

    checkCollision() {
        //取出敌人引用做空值保护
        const activeEnemy = BulletManager.inst?.activeEnemies;
        for(const enemy of activeEnemy ){
            if (!enemy || !enemy.isValid) return;
            const bulletTransform = this.node.getComponent(UITransform);
            const enemyTransform = enemy.getComponent(UITransform);
            if (!bulletTransform || !enemyTransform) return;
            const bulletPos = this.node.getWorldPosition();
            const enemyPos = enemy.getWorldPosition();
            const bulletRadius = Math.max(bulletTransform.width, bulletTransform.height) * 0.5;
            const enemyRadius = Math.max(enemyTransform.width, enemyTransform.height) * 0.5;
            const distance = Vec3.distance(bulletPos, enemyPos);
            if (distance < bulletRadius + enemyRadius) {
                this.node.destroy();
            }
        }
    }

    public setDirection(dir: Vec3) {
        this._direction.set(dir);  //直接复制数值，避免 clone 带来的额外分配
    }
}


