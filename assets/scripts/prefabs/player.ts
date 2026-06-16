import { _decorator, Component, Node, UITransform } from 'cc';
import { PLAYER_CONFIG } from '../../config/player_config';
import { GameManager } from '../gameManager/game_manager';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    private _hp: number;
    private _maxHp: number;

    protected onLoad(): void {
        this._maxHp = PLAYER_CONFIG.maxHp;
        this._hp = this._maxHp;
    }

    public takeDamage(damage: number) {
        if (this._hp <= 0) return;
        this._hp -= damage;
        console.log(`玩家当前血量${this._hp}`);
        if (this._hp <= 0) {
            console.log(`dead`);
            this._hp = 0;
            GameManager.inst.onPlayerDead();
        }
    }

    public getHitRadius() {
        const ui = this.getComponent(UITransform);
        const radius = Math.min(ui.width, ui.height) * 0.5;
        return radius;
    }
}


