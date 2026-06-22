import { _decorator, Component, Node } from 'cc';
import { WeaponBase } from '../../base/weapon_base';
const { ccclass, property } = _decorator;

@ccclass('Weapon_Rifle')
export class Weapon_Rifle extends WeaponBase {
    public override loadConfig(): void {
        this.weaponType = 'rifle';    // 代码赋值，不依赖编辑器
        super.loadConfig();           // 调用基类方法，用 this.weaponType 去查表
    }
}


