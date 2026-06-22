import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { Bullet_01 } from '../prefabs/bullets/bullet_01';
import { EnemyManager } from './enemy_manager';
import { GameManager } from './game_manager';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends Component {
    @property(Prefab)
    public bulletPrefab: Prefab = null;

    @property(Node)
    public bulletParent: Node = null;

    private static _inst: BulletManager;
    public static get inst(): BulletManager {
        return this._inst;
    }

    protected onLoad(): void {
        BulletManager._inst = this;
    }

    spawnBullet(muzzle: Node, direction: Vec3, damage: number) {
        const muzzlePos = muzzle.getWorldPosition();
        const bulletNode = instantiate(this.bulletPrefab);
        bulletNode.setParent(this.bulletParent);
        bulletNode.setWorldPosition(muzzlePos);
        const bulletComp = bulletNode.getComponent(Bullet_01);
        if (bulletComp) {
            bulletComp.setDirection(direction);
        }
    }

    clearAllBullet() {
        const children = this.bulletParent.children;
        for (let i = children.length - 1; i >= 0; i--) {
            children[i].destroy();
        }
    }
}





