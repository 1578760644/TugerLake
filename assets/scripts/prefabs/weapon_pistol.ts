import { WeaponBase } from "../base/weapon_base";
import { _decorator } from 'cc';
const { ccclass } = _decorator;

@ccclass('Weapon_Pistol')
export class Weapon_Pistol extends WeaponBase {

    public override loadConfig(): void {
        this.weaponType = 'pistol';    // 代码赋值，不依赖编辑器
        super.loadConfig();           // 调用基类方法，用 this.weaponType 去查表
    }
}


