import { _decorator, Component, Node } from 'cc';
import { WeaponBase } from '../../base/weapon_base';
const { ccclass, property } = _decorator;

@ccclass('Weapon_Rocket')
export class Weapon_Rocket extends WeaponBase {
    public override loadConfig(): void {
        this.weaponType = 'rocket';
        super.loadConfig();
    }
}


