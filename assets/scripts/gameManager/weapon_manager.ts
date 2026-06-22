import { _decorator, Component, Node } from 'cc';
import { GameManager } from './game_manager';
import { WeaponBase } from '../base/weapon_base';
const { ccclass, property } = _decorator;

@ccclass('WeaponManager')
export class WeaponManager extends Component {
    @property(Node)
    public defaultWeapon: Node = null;

    onLoad() {
        const playerNode = GameManager.inst.player;

        const pistolNode = this.defaultWeapon;
        if (pistolNode) {
            const weapon = pistolNode.getComponent(WeaponBase);
            if (weapon) {
                weapon.initPositionAndRotation(playerNode, true, 0); // 初始武器，右边
                weapon.loadConfig();  // 读取配置属性
                console.log('默认武器初始化完成');
            }
        }
    }



}


