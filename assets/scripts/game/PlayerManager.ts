import { _decorator, Component, EventTouch, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    @property(Node)
    public player: Node | null = null;

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }

    update(deltaTime: number) {

    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
    }

    onTouchMove(event:EventTouch) {
        //获取player的位置
        let playerPos = this.player.getPosition();
        playerPos.x += event.getDeltaX();
        playerPos.y += event.getDeltaY();
        
        this.player.setPosition(playerPos);
    }
}


