import { _decorator, Component, Node, Vec3 } from 'cc';
import { EnemyBase } from 'db://assets/scripts/base/enemy_base';
const { ccclass, property } = _decorator;

@ccclass('Enemy_01')
export class Enemy_01 extends EnemyBase {
    init(hp: number, speed: number, type: string): void {
        super.init(hp, speed, type);

        // 设置敌人专用帧（通过基类方法从图集取）
        this._idleFrame = this.getSpriteFrameByName(`tile_0000`);
        this._moveFrames = [
            this.getSpriteFrameByName(`tile_0001`),
            this.getSpriteFrameByName(`tile_0000`)
        ];
        this._deadFrame = this.getSpriteFrameByName(`tile_0003`)

        // 重置动画状态
        this._currentFrameIndex = 0;
        this._animTimer = 0;
        // 初始显示默认帧
        if (this._sprite && this._idleFrame) {
            this._sprite.spriteFrame = this._idleFrame;
        }
    }
}


