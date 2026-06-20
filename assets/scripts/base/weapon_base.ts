import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
import { GameManager } from '../gameManager/game_manager';
const { ccclass, property } = _decorator;

@ccclass('WeaponBase')
export class WeaponBase extends Component {
    @property(Node)
    public muzzle: Node = null; //后续通过动态加载，查找自己下的子节点

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
                scaleX = -0.8;  //水平翻转
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
        if (this.muzzle) {
            this.muzzle.setPosition(weaponHalfW, 0, 0);
        }
    }

    /** 获取枪口世界坐标，供子弹管理器使用 */
    getMuzzleWorldPosition(): Vec3 {
        return this.muzzle ? this.muzzle.getWorldPosition() : this.node.getWorldPosition();
    }
}


