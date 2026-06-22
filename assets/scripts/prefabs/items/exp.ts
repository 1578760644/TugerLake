import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameManager } from 'db://assets/scripts/gameManager/game_manager';
import { ExperienceManager } from 'db://assets/scripts/gameManager/experience_manager';
const { ccclass, property } = _decorator;

@ccclass('Exp')
export class Exp extends Component {
    @property
    public magnetSpeed: number = 600;
    @property
    public magnetRadius: number = 200;
    @property
    public pickupThreshold: number = 20;

    private _tempVec3: Vec3 = new Vec3;
    private _isAttracted: boolean = false;

    protected onEnable(): void {
        this._isAttracted = false;
        // 如果以后还有其他状态需要重置（比如速度、吸附半径动态改变），也在这里处理
    }


    update(deltaTime: number) {
        if (GameManager.inst.isPause) return;
        const player = GameManager.inst.player;
        if (!player || !player.active) return;
        const playerPos = player.getWorldPosition();
        const dist = Vec3.distance(playerPos, this.node.getWorldPosition());

        if (dist <= this.pickupThreshold) { //进入最小距离直接收集
            GameManager.inst.addExperience(1);
            ExperienceManager.inst.recycle(this.node);
            return
        }
        else if (this._isAttracted || dist <= this.magnetRadius) { //进入吸附范围，经验飞向玩家
            this._isAttracted = true;
            const direction = this._tempVec3.set(playerPos)
                .subtract(this.node.getWorldPosition())
                .normalize()
                .multiplyScalar(this.magnetSpeed * deltaTime);
            this.node.setPosition(this.node.position.add(direction));
        }
    }
}


