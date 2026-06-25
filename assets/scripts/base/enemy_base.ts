import { _decorator, Component, Node, resources, Sprite, SpriteAtlas, SpriteFrame, UITransform, Vec3 } from 'cc';
import { GameManager } from '../gameManager/game_manager';
import { EnemyManager } from '../gameManager/enemy_manager';
import { Player } from '../prefabs/player';
import { ExperienceManager } from '../gameManager/experience_manager';
import { GameData } from '../data/game_data';
import { AudioMgr } from '../gameManager/sound_manager';
const { ccclass, property } = _decorator;

@ccclass('EnemyBase')
export class EnemyBase extends Component {
    protected _hp: number;
    protected _speed: number;
    protected _direction: Vec3 = new Vec3;
    protected _tempVec3: Vec3 = new Vec3;
    protected _isDead: boolean;
    protected _enemyType: string;

    private _myTransfrom: UITransform = null;
    private _attackCooldown: number = 0;

    // 静态变量，整个游戏生命周期只加载一次 归属于类本身，而非类的实例
    private static _atlas: SpriteAtlas = null;
    private static _atlasLoaded: boolean = false;

    // 帧动画相关
    protected _idleFrame: SpriteFrame | null = null;   // 默认站立帧
    protected _deadFrame: SpriteFrame | null = null;   // 死亡帧 
    protected _moveFrames: SpriteFrame[] = [];         // 移动帧数组（几种敌人就是几张）
    protected _currentFrameIndex: number = 0;          // 当前移动帧索引
    protected _animTimer: number = 0;                  // 帧切换计时器
    protected _animInterval: number = 0.2;             // 帧间隔（秒）
    protected _sprite: Sprite | null = null;           // 缓存 Sprite 组件

    /**
    * 预加载敌人图集（在EnemyManager.onLoad中调用一次即可）
     */
    public static loadAtlas() {
        if (EnemyBase._atlasLoaded) return;
        resources.load('textures/enemy/enemy_atlas', SpriteAtlas, (err, atlas) => {
            if (err) {
                console.warn('敌人图集加载失败:', err);
                return;
            }
            EnemyBase._atlas = atlas;
            EnemyBase._atlasLoaded = true;
        })
    }

    /**
    * 根据帧名获取SpriteFrame
    */
    protected getSpriteFrameByName(name: string): SpriteFrame | null {
        if (!EnemyBase._atlas) {
            console.warn('敌人图集尚未加载');
            return null;
        }
        return EnemyBase._atlas.getSpriteFrame(name);
    }

    protected onLoad(): void {
        this._myTransfrom = this.node.getComponent(UITransform);
        this._sprite = this.node.getComponent(Sprite);
    }

    protected update(dt: number): void {
        if (this._isDead) return;
        if (GameManager.inst.isPause) return;
        if (this._attackCooldown > 0) this._attackCooldown -= dt;
        this.updateMovement(dt);
    }

    updateMovement(dt: number) {
        const player = GameManager.inst.player;
        if (!player.active) return;
        const playerPos = player.getWorldPosition();
        const direction = this._tempVec3.set(playerPos)
            .subtract(this.node.getWorldPosition())
            .normalize();
        const offset = this._tempVec3.set(direction).multiplyScalar(dt * this._speed);
        this.node.setPosition(this.node.position.add(offset)); //当前位置+偏移量才是最终移动到的位置

        //帧动画
        const isMoving = this._speed > 0;
        if (isMoving && this._moveFrames.length >= 2 && !this._isDead) {
            this._animTimer += dt;
            if (this._animTimer > this._animInterval) {
                this._animTimer -= this._animInterval;
                // 在 0 和 1 之间来回切换
                this._currentFrameIndex = 1 - this._currentFrameIndex;
                if (this._sprite) {
                    this._sprite.spriteFrame = this._moveFrames[this._currentFrameIndex];
                }
            }
        } else {
            // 静止时恢复默认帧
            if (this._sprite && this._idleFrame) {
                this._sprite.spriteFrame = this._idleFrame;
            }
            this._animTimer = 0;
            this._currentFrameIndex = 0;
        }

        this.checkCollision();
    }

    init(hp: number, speed: number, type: string) {
        this.unscheduleAllCallbacks();  // 清除所有之前设下的 schedule

        this._hp = hp;
        this._speed = speed;
        this._enemyType = type;
        this._isDead = false;

        // 重置动画状态
        this._currentFrameIndex = 0;
        this._animTimer = 0;
        if (this._sprite && this._idleFrame) {
            this._sprite.spriteFrame = this._idleFrame;
        }
    }

    setDireciton(dir: Vec3) {
        this._direction.set(dir);
    }

    takeDamage(damage: number = 1) {
        if (this._isDead) return;
        this._hp -= damage;
        if (this._hp <= 0) {
            this._isDead = true;
            GameData.addScore();
            ExperienceManager.inst.dropAt(this.node.getWorldPosition())

            // 显示死亡帧
            if (this._sprite && this._deadFrame) {
                this._sprite.spriteFrame = this._deadFrame;
            }

            this.scheduleOnce(() => {
                EnemyManager.inst.recycleEnemy(this.node, this._enemyType);
                return;
            }, 0.2)

        }
    }

    getEnemyType() {
        return this._enemyType;
    }

    private checkCollision() {
        if (this._attackCooldown > 0) return;
        const player = GameManager.inst.player;
        if (!player) return;

        const playerComp = player.getComponent(Player);
        if (!playerComp) return;

        const enemyRadius = Math.min(this._myTransfrom.width, this._myTransfrom.height) * 0.5;
        const playerRadius = playerComp.getHitRadius();

        //当敌人与玩家的距离<敌人碰撞半径+玩家碰撞半径 触发碰撞
        const totalDist = Vec3.distance(player.getWorldPosition(), this.node.getWorldPosition());
        if (totalDist < enemyRadius + playerRadius) {
            playerComp.takeDamage(1);
            this._attackCooldown = 1;
        }
    }
}


