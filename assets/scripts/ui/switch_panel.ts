import { _decorator, Button, Component, Node, Sprite } from 'cc';
import { GameManager } from '../gameManager/game_manager';
import { WeaponManager } from '../gameManager/weapon_manager';
import { WEAPON_CONFIG } from '../../config/weapon_config';
const { ccclass, property } = _decorator;

@ccclass('SwitchPanel')
export class SwitchPanel extends Component {
    @property([Node])
    public weaponPanels: Node[] = [];   //三个面板节点

    @property(Node)
    public switchUI: Node = null;

    private _currentOptions: string[] = []; //本次升级的三个武器类型

    /**
     * 展示升级选项
     * @param types 随机抽出的 3 个武器类型 key
     */
    public showUpgradeOptions(types: string[]) {
        this._currentOptions = types;

        //遍历三个面板，设置对应武器图标
        for (let i = 0; i < this.weaponPanels.length; i++) {
            const panel = this.weaponPanels[i];
            const type = types[i];
            if (!type) continue;

            // 从 WeaponManager 获取图标
            const spriteFrame = WeaponManager.inst.getWeaponIcon(type);
            if (!spriteFrame) continue;

            //设置面板下的武器
            const spriteNode = panel.getChildByName('weapon_sprite');
            if (spriteNode) {
                const sprite = spriteNode.getComponent(Sprite);
                if (sprite) {
                    sprite.spriteFrame = spriteFrame;
                }
            }
        }

        this.switchUI.active = true;
    }


    //按钮回调，接受自定义数据（索引字符串 "0","1","2"）
    onWeaponClicked(button: Button, customData: string) {
        const index = parseInt(customData);
        if (isNaN(index) || index < 0 || index > 2) return;

        const selectedType = this._currentOptions[index];
        if (!selectedType) return;

        // 通知 WeaponManager 装备该武器
        WeaponManager.inst.equipWeapon(selectedType);

        // 关闭面板，恢复游戏
        this.switchUI.active = false;
        GameManager.inst.applyUpgrade();
    }
}


