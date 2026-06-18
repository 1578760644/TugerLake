import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
import { GameManager } from '../gameManager/game_manager';
import { EnemyManager } from '../gameManager/enemy_manager';
import { Player } from '../prefabs/player';
const { ccclass, property } = _decorator;

@ccclass('EnemyBase')
export class EnemyBase extends Component {
    protected _hp: number;
    protected _speed: number;
    protected _direction: Vec3 = new Vec3;
    protected _tempVec3: Vec3 = new Vec3;
    protected _isDead: boolean;
    protected _enemyType: string;

    private _myTransfrom: UITransform = null;
    private _attackCooldown: number = 0;

    protected onLoad(): void {
        this._myTransfrom = this.node.getComponent(UITransform);
    }

    protected update(dt: number): void {
        if (this._isDead) return;
        if (this._attackCooldown > 0) this._attackCooldown -= dt;
        this.updateMovement(dt);
    }

    updateMovement(dt: number) {
        const player = GameManager.inst.player;
        if (!player.active) return;
        const playerPos = player.getWorldPosition();
        const direction = this._tempVec3.set(playerPos)
            .subtract(this.node.getWorldPosition())
            .normalize();
        const offset = this._tempVec3.set(direction).multiplyScalar(dt * this._speed);
        this.node.setPosition(this.node.position.add(offset));

        this.checkCollision();
    }

    init(hp: number = 1, speed: number = 400, type: string = '') {
        this._hp = hp;
        this._speed = speed;
        this._enemyType = type;
        this._isDead = false;
    }

    setDireciton(dir: Vec3) {
        this._direction.set(dir);
    }

    takeDamage(damage: number = 1) {
        if (this._isDead) return;
        this._hp -= damage;
        if (this._hp <= 0) {
            this._isDead = true;
            EnemyManager.inst.recycleEnemy(this.node, this._enemyType);
        }
    }

    getEnemyType(){
        return this._enemyType;
    }

    private checkCollision() {
        if (this._attackCooldown > 0) return;
        const player = GameManager.inst.player;
        if (!player) return;

        const playerComp = player.getComponent(Player);
        if (!playerComp) return;

        const enemyRadius = Math.min(this._myTransfrom.width, this._myTransfrom.height) * 0.5;
        const playerRadius = playerComp.getHitRadius();

        //当敌人与玩家的距离<敌人碰撞半径+玩家碰撞半径 触发碰撞
        const totalDist = Vec3.distance(player.getWorldPosition(), this.node.getWorldPosition());
        if (totalDist < enemyRadius + playerRadius) {
            playerComp.takeDamage(1);
            this._attackCooldown = 1;
        }
    }
}


