import { _decorator, clamp, Component, EventKeyboard, EventTouch, Input, input, KeyCode, Node, Vec2, Vec3 } from 'cc';
import { PLAYER_CONFIG } from '../../config/player_config';
import { GameManager } from './game_manager';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends Component {

    private _moveDirection: Vec2 = new Vec2();
    //用于复用计算，避免每次实例化生成
    private _tempVec2: Vec2 = new Vec2();

    private _keys = { w: false, a: false, s: false, d: false };

    private _activeTouches: Set<number> = new Set(); // 当前活跃的触摸点ID
    private _hasMovedThisFrame: boolean = false;    // 本帧是否有有效移动

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        if (GameManager.inst.isGameActive) return;
        this.applyMovement(deltaTime);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private applyMovement(deltaTime: number) {

        const inputX = (this._keys.d ? 1 : 0) - (this._keys.a ? 1 : 0);
        const inputY = (this._keys.w ? 1 : 0) - (this._keys.s ? 1 : 0);
        //判断是否有键盘输入
        const hasKeyboardInput = (inputX !== 0 || inputY !== 0);

        if (hasKeyboardInput) {
            //键盘方向写入
            this._tempVec2.set(inputX, inputY).normalize();
            this._moveDirection.set(this._tempVec2);
        } else if (this._activeTouches.size > 0) { // 至少有一个手指在屏幕上
            if (!this._hasMovedThisFrame) {
                // 手指按着但本帧没动 → 停止
                this._moveDirection.set(0, 0);
            }
        } else {
            // 无键盘且无触摸
            this._moveDirection.set(0, 0);
        }


        //限制移动范围
        const minX = -360;
        const maxX = 360;
        const minY = -640;
        const maxY = 640;


        //统一移动
        const speed = PLAYER_CONFIG.speed;
        const player = GameManager.inst.player;
        const playerPos = player.getPosition();
        const offsetX = this._moveDirection.x * speed * deltaTime;
        const offsetY = this._moveDirection.y * speed * deltaTime;
        const playerX = clamp((playerPos.x + offsetX), minX, maxX);
        const playerY = clamp((playerPos.y + offsetY), minY, maxY);
        player.setPosition(playerX, playerY);

        //重置移动标记，让下一帧重新检测
        this._hasMovedThisFrame = false;
    }

    private onTouchStart(event: EventTouch) {
        this._activeTouches.add(event.getID());
        this._hasMovedThisFrame = false;   // 新按下，重置移动标记
    }

    private onTouchMove(event: EventTouch) {
        // 忽略不在活跃集合中的触摸点（理论上不会发生，安全起见）
        if (!this._activeTouches.has(event.getID())) return;

        event.getDelta(this._tempVec2);

        // 过滤极短移动，防止静止时的传感器噪声
        if (this._tempVec2.length() < 2.0) return;

        this._hasMovedThisFrame = true;
        //将当前向量归一化
        this._tempVec2.normalize();
        //直接在触摸事件发生的时候处理位置更新
        this._moveDirection.set(this._tempVec2)
    }
    private onTouchEnd(event: EventTouch) {
        this._activeTouches.delete(event.getID());
        // 所有手指都离开屏幕
        if (this._activeTouches.size === 0) {
            console.log('touch end ');
            this._hasMovedThisFrame = false;
            this._moveDirection.set(0, 0);
        }
    }

    //用于检测按键是否生效，实际归一化和移动等操作在update里实现
    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W: this._keys.w = true; break;
            case KeyCode.KEY_A: this._keys.a = true; break;
            case KeyCode.KEY_S: this._keys.s = true; break;
            case KeyCode.KEY_D: this._keys.d = true; break;
        }
    }
    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W: this._keys.w = false; break;
            case KeyCode.KEY_A: this._keys.a = false; break;
            case KeyCode.KEY_S: this._keys.s = false; break;
            case KeyCode.KEY_D: this._keys.d = false; break;
        }
    }
}


