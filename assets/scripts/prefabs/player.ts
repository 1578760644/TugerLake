import { _decorator, Animation, Component, Node, UITransform } from 'cc';
import { PLAYER_CONFIG } from '../config/player_config';
import { GameManager } from '../gameManager/game_manager';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property([Node])
    public hpNodes: Node[] = [];

    private _hp: number;
    private _maxHp: number;

    private _playerAnimation: Animation | null = null;

    protected onLoad(): void {
        this._maxHp = PLAYER_CONFIG.maxHp;
        this._hp = this._maxHp;

        this._playerAnimation = this.node.getComponent(Animation);
    }

    public takeDamage(damage: number) {
        if (this._hp <= 0) return;
        this._hp -= damage;
        this.onShowHP(this._hp);
        if (this._hp <= 0) {
            console.log(`dead`);
            this._hp = 0;
            // 播放死亡动画
            if (this._playerAnimation) {
                this._playerAnimation.play('player_dead');
            }
        }
    }

    public getHitRadius() {
        const ui = this.getComponent(UITransform);
        const radius = Math.min(ui.width, ui.height) * 0.5;
        return radius;
    }

    public onShowHP(hp: number) {
        for (let i = 0; i < this.hpNodes.length; i++) {
            this.hpNodes[i].active = i < hp;
        }
    }

    public resetHp() {
        this._hp = this._maxHp;
        for (let i = 0; i < this.hpNodes.length; i++) {
            this.hpNodes[i].active = true;
        }
    }

    public get isDead(): boolean {
        return this._hp <= 0;
    }
}


