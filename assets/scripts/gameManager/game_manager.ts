import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    public player: Node = null;

    private static _inst: GameManager;
    public static get inst(): GameManager {
        return this._inst;
    }

    protected onLoad(): void {
        GameManager._inst = this;
    }

    public onPlayerDead() {
        this.player.active = false;
    }
}


