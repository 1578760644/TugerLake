import { _decorator, Component, Node } from 'cc';
import { GameManager } from '../gameManager/game_manager';
const { ccclass, property } = _decorator;

@ccclass('R_Button')
export class R_Button extends Component {

    restartGame() {
        GameManager.inst.restart();
    }
}


