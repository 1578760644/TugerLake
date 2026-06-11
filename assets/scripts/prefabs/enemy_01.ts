import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameManager } from '../gameManager/game_manager';
import { EnemyManager } from '../gameManager/enemy_manager';
const { ccclass, property } = _decorator;

@ccclass('Enemy_01')
export class Enemy_01 extends Component {
    @property({ displayName: '血量' })
    public _hp: number = 3;

    private _speed: number = 200;

    private _direction: Vec3 = new Vec3(1, 0, 0);

    private _tempVec3: Vec3 = new Vec3();

    private _isDead: boolean = false;

    update(deltaTime: number) {
        //通过玩家位置-敌人位置。取得到敌人的移动方向（朝向玩家移动）
        const player = GameManager.inst.player;
        const playerPos = player.getWorldPosition();
        const direction = this._tempVec3    //计算方向，通过玩家位置
            .set(playerPos)
            .subtract(this.node.getWorldPosition())
            .normalize()

        const offset = this._tempVec3.set(direction).multiplyScalar(this._speed * deltaTime);
        this.node.setPosition(this.node.position.add(offset));
    }

    public takeDamage(hp: number) {
        if (this._isDead) return;
        this._hp -= hp;
        if (this._hp <= 0) {
            this._isDead = true;
            EnemyManager.inst.recycleEnemy(this.node);
        }
    }

    public setDirection(dir: Vec3) {
        this._direction.set(dir);
    }

    public init(hp: number = 2) {
        this._hp = hp;
        this._isDead = false; 
    }
}


