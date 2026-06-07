import { _decorator, Component, EventKeyboard, EventTouch, Input, input, KeyCode, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    @property(Node)
    public player: Node | null = null;
    @property
    public moveSpeed: number = 300; // 像素/秒

    private _moveDirection: Vec2 = new Vec2();
    //用于复用计算，避免每次实例化生成
    private _tempVec2: Vec2 = new Vec2();

    private _keys = { w: false, a: false, s: false, d: false };

    //键盘操作优先与触摸操作
    private _isTouching: boolean = false;
    //避免拖动移动的时候，突然停止，没有把机制方向清零
    private _touchMovedThisFrame: boolean = false;


    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        const inputX = (this._keys.d ? 1 : 0) - (this._keys.a ? 1 : 0);
        const inputY = (this._keys.w ? 1 : 0) - (this._keys.s ? 1 : 0);
        //判断是否有键盘输入
        const hasKeyboardInput = (inputX !== 0 || inputY !== 0);

        if (hasKeyboardInput) {
            //键盘方向写入
            this._tempVec2.set(inputX, inputY).normalize();
            this._moveDirection.set(this._tempVec2);
        } else if (this._isTouching) {
            if (!this._touchMovedThisFrame) {
                // 手指按着但本帧没动 → 停止
                this._moveDirection.set(0, 0);
            }
        } else {
            // 无键盘且无触摸
            this._moveDirection.set(0, 0);
        }

        //统一移动
        const playerPos = this.player.getPosition();
        const offsetX = this._moveDirection.x * this.moveSpeed * deltaTime;
        const offsetY = this._moveDirection.y * this.moveSpeed * deltaTime;
        this.player.setPosition(playerPos.x + offsetX, playerPos.y + offsetY);

        // 4. 重置触摸移动标记（为下一帧准备）
        this._touchMovedThisFrame = false;

    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private onTouchMove(event: EventTouch) {
        this._isTouching = true;
        this._touchMovedThisFrame = true;
        event.getDelta(this._tempVec2);

        //将当前向量归一化
        this._tempVec2.normalize();
        //直接在触摸事件发生的时候处理位置更新
        this._moveDirection.set(this._tempVec2)
    }
    private onTouchEnd(event: EventTouch) {
        this._isTouching = false;
        this._touchMovedThisFrame = false;
        this._moveDirection.set(0, 0);
    }

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


