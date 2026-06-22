import { _decorator, Component, Node } from 'cc';
import { WeaponBase } from '../../base/weapon_base';
const { ccclass, property } = _decorator;

@ccclass('Weapon_Sniper')
export class Weapon_Sniper extends WeaponBase {
    public override loadConfig(): void {
        this.weaponType = 'sniper';
        super.loadConfig();
    }
}


