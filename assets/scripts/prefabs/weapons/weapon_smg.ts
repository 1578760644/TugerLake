import { _decorator, Component, Node, Vec3 } from 'cc';
import { WeaponBase } from '../../base/weapon_base';
import { BulletManager } from '../../gameManager/bullet_manager';
import { AudioMgr } from '../../gameManager/sound_manager';
const { ccclass, property } = _decorator;

@ccclass('Weapon_Smg')
export class Weapon_Smg extends WeaponBase {

    protected tryAttack() {
        
        this.playFireAnim();
        AudioMgr.inst.playOneShot('sounds/shoot/shoot-b',0.05);
        // 始终朝世界 X 轴正方向发射,暂时先这么写
        BulletManager.inst.spawnBullet(this._bulletType, this._muzzle, Vec3.RIGHT);
        BulletManager.inst.spawnBullet(this._bulletType, this._muzzle, Vec3.RIGHT.clone().negative());
        BulletManager.inst.spawnBullet(this._bulletType, this._muzzle, Vec3.UP.clone());
        BulletManager.inst.spawnBullet(this._bulletType, this._muzzle, Vec3.UP.clone().negative());
    }
}


