import { _decorator, clamp, Component, Node, UITransform, Vec3 } from 'cc';
import { BULLET_CONFIG, BulletConfig } from '../../config/bullet_config';
import { BulletManager } from '../gameManager/bullet_manager';
import { GameManager } from '../gameManager/game_manager';
import { EnemyManager } from '../gameManager/enemy_manager';
import { EnemyBase } from './enemy_base';
const { ccclass, property } = _decorator;

@ccclass('BulletBase')
export class BulletBase extends Component {

    private _bulletType: string;

    private _speed: number;
    private _damage: number;
    private _collisionRadius: number;           //碰撞范围，取当前子弹的uitransform

    private _piercing: boolean;
    private _explosive: boolean;
    private _explosionRadius?: number;
    private _lifeTime: number;

    private _elapsed: number = 0;                //以存活时间
    private _isDead: boolean = false;            //防止重复回收

    private _direction: Vec3 = new Vec3();       //由武器传入
    private _tempVec3: Vec3 = new Vec3();

    init(config: BulletConfig, direction: Vec3, bulletType: string) {
        this._bulletType = bulletType;

        this._speed = config.speed;
        this._damage = config.damage;

        if (config.collisionRadius !== undefined) {
            this._collisionRadius = config.collisionRadius;
        } else {
            this._collisionRadius = this.getCollisionRadius();
        }

        this._piercing = config.piercing;
        this._explosive = config.explosive;
        this._explosionRadius = config.explosionRadius;
        this._lifeTime = config.lifetime;

        this._direction.set(direction);
        this._elapsed = 0;
        this._isDead = false;
    }


    private getCollisionRadius(): number {
        const ui = this.node.getComponent(UITransform);
        if (!ui) {
            const config = BULLET_CONFIG[this._bulletType];
            return config?.collisionRadius ?? 10;
        }
        const collisionRadius = Math.min(ui.width, ui.height) * 0.5;

        return collisionRadius;
    }

    protected update(dt: number): void {
        if (GameManager.inst.isPause) return;
        if (this._isDead) return;

        this._elapsed += dt;

        this._tempVec3.set(this._direction).multiplyScalar(this._speed * dt);
        this.node.position = this.node.position.add(this._tempVec3);

        if (this.isOutOfBounds()) {
            console.log(`isOutOfBounds`)
            this.recycle();
            return;
        }

        if (this._elapsed >= this._lifeTime) {
            console.log(`recycle`)
            this.recycle();
            return;
        }

        this.checkCollision();

    }

    //越界回收，后续应该改为动态获取范围 可以提到类外部或作为静态成员，避免重复定义
    private isOutOfBounds(): boolean {
        const MIN_X = -360 - 100;
        const MAX_X = 360 + 100;
        const MIN_Y = -640 - 100;
        const MAX_Y = 640 + 100;
        const pos = this.node.position;
        return pos.x < MIN_X || pos.x > MAX_X || pos.y > MAX_Y || pos.y < MIN_Y
    }

    checkCollision() {
        const activeEnemy = EnemyManager.inst.getActiveEnemies();
        const bulletRadius = this._collisionRadius;

        for (const enemy of activeEnemy) {
            if (!enemy || !enemy.isValid) continue;

            const enemyTransform = enemy.getComponent(UITransform)
            if (!enemyTransform) continue;

            const enemyRadius = Math.min(enemyTransform.width, enemyTransform.height) * 0.5;
            const dist = Vec3.distance(this.node.worldPosition, enemy.worldPosition);

            if (dist <= enemyRadius + bulletRadius) {
                const enemyComp = enemy.getComponent(EnemyBase)
                if (enemyComp) {
                    enemyComp.takeDamage(this._damage)

                    if (this._piercing) {
                        //后续再添加穿透
                    }
                }

                this.recycle();
                break;
            }
        }
    }

    public recycle() {
        if (this._isDead) return;
        this._isDead = true;
        BulletManager.inst.recycleBullet(this.node, this._bulletType);
    }

    public setDirection(dir: Vec3) {
        this._direction.set(dir);  //直接复制数值，避免 clone 带来的额外分配
    }

    public getBulletType() {
        return this._bulletType;
    }

    protected onHit(enemy: Node): void {

    }

    protected shouldRecycleOnHit(): boolean {
        return true;
    }
}


