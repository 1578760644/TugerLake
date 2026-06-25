import { _decorator, Component, Node, Quat, Vec3 } from 'cc';
import { WeaponBase } from '../../base/weapon_base';
import { BulletManager } from '../../gameManager/bullet_manager';
import { AudioMgr } from '../../gameManager/sound_manager';
const { ccclass, property } = _decorator;

@ccclass('Weapon_Shotgun')
export class Weapon_Shotgun extends WeaponBase {
    //后续改为配置表驱动
    private _bulletCount: number = 3;
    private _spreadAngle: number = 30; // 总散射角

    protected tryAttack(): void {
        const target = this.findNearestEnemyInRange();
        if (!target || !target.isValid) return;

        const baseDir = this.getDirectionToTarget(target);
        const halfSpread = this._spreadAngle * 0.5;
        const angleStep = this._spreadAngle / (this._bulletCount - 1);

        for (let i = 0; i < this._bulletCount; i++) {
            const angleOffset = -halfSpread + i * angleStep;
            const dir = this.rotateDirection(baseDir, angleOffset);

            this.rotateTowards(baseDir);
            this.playFireAnim();
            AudioMgr.inst.playOneShot('sounds/shoot/shoot-c',0.2);
            BulletManager.inst.spawnBullet(this._bulletType, this._muzzle, dir);
        }
    }

    private rotateDirection(dir: Vec3, angleDeg: number): Vec3 {
        const quat = new Quat();
        Quat.fromAxisAngle(quat, Vec3.FORWARD, angleDeg * Math.PI / 180);
        const rotated = new Vec3();
        Vec3.transformQuat(rotated, dir, quat);
        return rotated;
    }
}


