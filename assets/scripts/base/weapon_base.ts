import { _decorator, AudioClip, Component, Node, resources, tween, UITransform, Vec3 } from 'cc';
import { GameManager } from '../gameManager/game_manager';
import { EnemyManager } from '../gameManager/enemy_manager';
import { BulletManager } from '../gameManager/bullet_manager';
import { WEAPON_CONFIG } from '../config/weapon_config';
import { AudioMgr } from '../gameManager/sound_manager';
const { ccclass, property } = _decorator;

@ccclass('WeaponBase')
export class WeaponBase extends Component {
    protected _muzzle: Node = null;

    public weaponType: string = ''; //由 WeaponManager 自动注入

    //从配置表加载的属性
    private _category: string;
    protected _bulletType: string;
    private _attackRange: number;
    private _fireInterval: number;

    private _fireTimer: number = 0;
    private _tempVec3: Vec3 = new Vec3();

    //利用tween动画
    private _originalScaleX: number = 1.0; // 初始 x 缩放
    private _originalScaleY: number = 1.0; // 初始 y 缩放

    /**
     * 根据 weaponType 从配置表读取伤害、攻击范围、攻击间隔等
     */
    public loadConfig() {
        const config = WEAPON_CONFIG[this.weaponType];
        if (!config) {
            console.warn(`[WeaponBase] 未找到武器配置: ${this.weaponType}`);
            this._attackRange = 300;
            this._fireInterval = 1;
            return;
        }
        this._category = config.category;
        this._bulletType = config.bulletType;
        this._attackRange = config.attackRange;
        this._fireInterval = config.fireInterval;
    }

    protected onLoad(): void {
        this._muzzle = this.node.getChildByName('muzzle');
    }

    protected update(dt: number): void {
        if (GameManager.inst.isPause) return;
        this._fireTimer += dt;
        while (this._fireTimer >= this._fireInterval) {
            this._fireTimer -= this._fireInterval;
            this.tryAttack();
        }
    }

    /**
     * 尝试攻击：在范围内找到最近敌人并发射子弹（让武器指向敌人）
     * 子类可重写此方法实现不同攻击模式（散射、激光等）
     */
    protected tryAttack(): void {
        const target = this.findNearestEnemyInRange();
        if (!target || !target.isValid) return;

        const direction = this.getDirectionToTarget(target);

        this.rotateTowards(direction);
        this.playFireAnim();

        AudioMgr.inst.playOneShot('sounds/shoot/shoot-d',0.5);
        BulletManager.inst.spawnBullet(this._bulletType, this._muzzle, direction);
    }

    /**
     * 在武器攻击范围内寻找最近的敌人
     * @returns 最近的敌人
     */
    protected findNearestEnemyInRange(): Node | null {
        let nearest: Node | null = null;
        let minDist = Infinity; //最小距离

        const enemyNodes = EnemyManager.inst.getActiveEnemies();
        const player = GameManager.inst.player;
        const playerPos = player.getWorldPosition();

        for (const enemy of enemyNodes) {
            if (!enemy || !enemy.isValid) continue;
            const enemyPos = enemy.getWorldPosition();
            const dist = Vec3.distance(enemyPos, playerPos);
            if (dist <= this._attackRange && dist < minDist) { //先要小于武器攻击范围,然后要距离玩家最近
                minDist = dist;
                nearest = enemy;
            }
        }
        return nearest;
    }

    // 后续根据武器类型不同，除了这种锁定敌人的武器还需要新增朝向方向发射的，或者旋转发射的。各种类型的，不一定是自动索敌的

    /**
     * 计算从枪口指向目标的方向向量（已归一化）
     */
    protected getDirectionToTarget(target: Node): Vec3 {
        const targetPos = target.getWorldPosition();
        const muzzlePos = this._muzzle.getWorldPosition();
        return this._tempVec3
            .set(targetPos)
            .subtract(muzzlePos)
            .normalize();
    }

    /**
     * 让武器转向敌人出现方向（武器枪口位置默认朝右，便于计算后续再做改造）
     * @param direction 目标方向
     */
    protected rotateTowards(direction: Vec3) {
        const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
        this.node.setRotationFromEuler(0, 0, angle)
    }

    /**
     * 发射动画
     */
    protected playFireAnim() {
        // 停止该节点上所有未完成的 tween，避免冲突
        tween(this.node).stop();

        this.node.setScale(this._originalScaleX * 0.7, this._originalScaleY * 0.7, 1);

        // 用 tween 恢复到原始大小
        tween(this.node)
            .to(0.1, { scale: new Vec3(this._originalScaleX, this._originalScaleY, 1) })
            .start();
    }


    /**
     * 初始化武器位置、旋转、缩放
     * @param playerNode  玩家节点
     * @param isPrimary   是否为初始武器（决定缩放和额外偏移）
     * @param index       0=右, 1=左, 2=上, 3=下
     */
    initPositionAndRotation(playerNode: Node, isPrimary: boolean, index: number) {
        const playerTrans = playerNode.getComponent(UITransform);
        const weaponTrans = this.node.getComponent(UITransform);

        const playerHalfW = playerTrans.width * 0.5;
        const playerHalfH = playerTrans.height * 0.5;
        const weaponHalfW = weaponTrans.width * 0.5;
        const weaponHalfH = weaponTrans.height * 0.5;

        let posX = 0, posY = 0;
        let scaleX = 0.8, scaleY = 0.8;
        // let angle = 0;

        switch (index) {
            case 0: //右
                scaleX = isPrimary ? 1 : 0.8;
                scaleY = isPrimary ? 1 : 0.8;
                posX = playerHalfW + weaponHalfW + (isPrimary ? 10 : 0);
                break;
            case 1: //左
                scaleX = 0.8;
                scaleY = 0.8;
                posX = -(playerHalfW + weaponHalfW);
                break;
            case 2: //上
                scaleX = 0.8;
                scaleY = 0.8;
                posY = playerHalfH + weaponHalfH;
                break;
            case 3: //下
                scaleX = 0.8;
                scaleY = 0.8;
                posY = -(playerHalfH + weaponHalfH);
                break;
        }

        this.node.setScale(scaleX, scaleY, 1);
        this.node.setPosition(posX, posY);
        // this.node.setRotationFromEuler(0, 0, angle);

        //设置枪口位置
        if (this._muzzle) {
            this._muzzle.setPosition(weaponHalfW, 0, 0);
        }

        this._originalScaleX = scaleX;
        this._originalScaleY = scaleY;
    }

    /** 获取枪口世界坐标，供子弹管理器使用 */
    getMuzzleWorldPosition(): Vec3 {
        return this._muzzle ? this._muzzle.getWorldPosition() : this.node.getWorldPosition();
    }
}


