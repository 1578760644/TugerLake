import { _decorator, Component, Label, Node, tween, UITransform, Vec3 } from 'cc';
import { GameManager } from '../gameManager/game_manager';
const { ccclass, property } = _decorator;

@ccclass('ExpBar')
export class ExpBar extends Component {
    @property(Node)
    public barBg: Node = null;
    @property(Node)
    public barFill: Node = null;
    @property(Label)
    public level: Label = null;
    @property({ displayName: '跳动缩放比例' })
    public bumpScale: number = 1.3;

    private _maxWidth: number;
    private _lastLevel: number;

    protected onLoad(): void {
        const barBgTransfrom = this.barBg.getComponent(UITransform);
        this._maxWidth = barBgTransfrom.width;
    }

    update(deltaTime: number) {
        //经验值比例
        let currentExp = GameManager.inst.currentExp;
        let needExp = GameManager.inst.needExp;
        const ratio = currentExp / needExp;

        const fillTransfrom = this.barFill.getComponent(UITransform);
        fillTransfrom.width = this._maxWidth * ratio;

        //等级
        this.refreshLevel()
    }

    refreshLevel() {
        if (GameManager.inst.playerLevel !== this._lastLevel) {
            this._lastLevel = GameManager.inst.playerLevel;
            this.level.string = `${this._lastLevel}`;

            // 弹跳动画（可选）
            tween(this.level.node)
                .to(0.1, { scale: new Vec3(this.bumpScale, this.bumpScale, 1) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
        }

    }
}


