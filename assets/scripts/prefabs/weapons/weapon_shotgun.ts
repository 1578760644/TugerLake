import { _decorator, Component, Node } from 'cc';
import { WeaponBase } from '../../base/weapon_base';
const { ccclass, property } = _decorator;

@ccclass('Weapon_Shotgun')
export class Weapon_Shotgun extends WeaponBase {
    public override loadConfig(): void {
        this.weaponType = 'shotgun';
        super.loadConfig();
    }
}


