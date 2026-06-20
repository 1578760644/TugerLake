import { _decorator, Button, Component, Node, Sprite } from 'cc';
import { GameManager } from '../gameManager/game_manager';
const { ccclass, property } = _decorator;

@ccclass('SwitchPanel')
export class SwitchPanel extends Component {
    @property([Node])
    public weaponPanels: Node[] = [];
    @property(Node)
    public switchUI: Node = null;

    //玩家身上的武器槽
    // @property(Node)
    // public weaponSlot1: Node = null;
    @property(Node)
    public weaponSlot2: Node = null;
    @property(Node)
    public weaponSlot3: Node = null;
    @property(Node)
    public weaponSlot4: Node = null;

    private _nextSlotIndex: number = 0; // 0->slot2, 1->slot3, 2->slot4     

    //按钮回调，接受自定义数据（索引字符串 "0","1","2"）
    onWeaponClicked(event: Event, customData: string) {
        const index = parseInt(customData);
        if (isNaN(index) || index < 0 || index > 2) return;

        // 如果所有槽都已激活，不再处理
        // if (this._nextSlotIndex >= 3) {
        //     console.warn('所有武器槽已满');
        //     this.switchUI.active = false;
        //     GameManager.inst.applyUpgrade();
        //     return;
        // }

        //点击获取面板下的武器图标
        const selectedPanel = this.weaponPanels[index];
        const weaponSpriteNode = selectedPanel?.getChildByName('weapon_sprite');
        if (!weaponSpriteNode) return;

        const spriteFrame = weaponSpriteNode.getComponent(Sprite)?.spriteFrame;
        if (!spriteFrame) return;

        //根据索引激活对应的武器槽，并设置图片
        const slots = [this.weaponSlot2, this.weaponSlot3, this.weaponSlot4];
        const targetSlot = slots[this._nextSlotIndex];

        if (targetSlot) {
            targetSlot.active = true;
            const sprite = targetSlot.getComponent(Sprite);
            if (sprite) sprite.spriteFrame = spriteFrame;
        }

        //槽位指针后移
        this._nextSlotIndex++;

        this.switchUI.active = false;
        GameManager.inst.applyUpgrade();
    }
}


