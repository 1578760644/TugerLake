import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameManager } from '../gameManager/game_manager';
import { EnemyManager } from '../gameManager/enemy_manager';
const { ccclass, property } = _decorator;

@ccclass('EnemyBase')
export class EnemyBase extends Component {
    protected _hp: number;
    protected _speed: number;
    protected _direction: Vec3 = new Vec3;
    protected _tempVec3: Vec3 = new Vec3;
    protected _isDead: boolean;
    protected _enemyType: string;

    protected update(dt: number): void {
        if (this._isDead) return;
        this.updateMovement(dt);
    }

    updateMovement(dt: number) {
        const playerPos = GameManager.inst.player.getWorldPosition();
        const direction = this._tempVec3.set(playerPos)
            .subtract(this.node.getWorldPosition())
            .normalize();
        const offset = this._tempVec3.set(direction).multiplyScalar(dt * this._speed);
        this.node.setPosition(this.node.position.add(offset));
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
}


