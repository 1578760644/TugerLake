import { _decorator, Component, Node, UITransform, Vec2, Vec3 } from 'cc';
import { BulletManager } from '../gameManager/bullet_manager';
import { EnemyManager } from '../gameManager/enemy_manager';
import { EnemyBase } from '../base/enemy_base';
import { GameManager } from '../gameManager/game_manager';
const { ccclass, property } = _decorator;

@ccclass('Bullet_01 ')
export class Bullet_01 extends Component {
    @property
    private _speed: number = 400;

    private _direction: Vec3 = new Vec3(1, 0, 0);

    protected update(dt: number): void {
        if (GameManager.inst.isPause) return;
        //直接用成员变量 _direction 计算，避免重复取位置
        const offset = this._direction.clone().multiplyScalar(this._speed * dt);
        this.node.setPosition(this.node.position.add(offset));

        this.checkCollision();
    }

    checkCollision() {
        const activeEnemy = EnemyManager.inst.getActiveEnemies();
        for (const enemy of activeEnemy) {
            if (!enemy || !enemy.isValid) continue;

            const bulletTransform = this.node.getComponent(UITransform);  //不应该每帧调用后续应该在onload里面缓存
            const enemyTransform = enemy.getComponent(UITransform);
            if (!bulletTransform || !enemyTransform) continue;

            const bulletPos = this.node.getWorldPosition();
            const enemyPos = enemy.getWorldPosition();
            const bulletRadius = Math.max(bulletTransform.width, bulletTransform.height) * 0.5;
            const enemyRadius = Math.max(enemyTransform.width, enemyTransform.height) * 0.5;
            const distance = Vec3.distance(bulletPos, enemyPos);

            if (distance < bulletRadius + enemyRadius) {
                enemy.getComponent(EnemyBase).takeDamage(1);
                this.node.destroy();

                break; //先扣血再销毁，最后跳出当前循环，因为子弹已经不存在了
            }
        }
    }

    public setDirection(dir: Vec3) {
        this._direction.set(dir);  //直接复制数值，避免 clone 带来的额外分配
    }
}


