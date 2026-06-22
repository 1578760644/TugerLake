import { _decorator, Component, Node } from 'cc';
import { WeaponBase } from '../../base/weapon_base';
const { ccclass, property } = _decorator;

@ccclass('Weapon_Smg')
export class Weapon_Smg extends WeaponBase {
    public override loadConfig(): void {
        this.weaponType = 'smg';
        super.loadConfig();
    }
}


