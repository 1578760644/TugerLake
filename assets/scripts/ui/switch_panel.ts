import { _decorator, Button, Component, Node } from 'cc';
import { GameManager } from '../gameManager/game_manager';
const { ccclass, property } = _decorator;

@ccclass('SwitchPanel')
export class SwitchPanel extends Component {
    @property([Node])
    public weaponPanels: Node[] = [];
    @property(Node)
    public switchUI: Node = null;

    onWeaponClicked() {
        this.switchUI.active = false;
        GameManager.inst.applyUpgrade();
    }
}


