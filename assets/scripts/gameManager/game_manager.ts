import { _decorator, Component, Node } from 'cc';
import { Player } from '../prefabs/player';
import { EnemySpawner } from './enemy_spawner';
import { EnemyManager } from './enemy_manager';
import { BulletManager } from './bullet_manager';
import { ExperienceManager } from './experience_manager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    public player: Node = null;

    private _isGameOver: boolean = false;
    private _isPause: boolean = false;


    private static _inst: GameManager;
    public static get inst(): GameManager {
        return this._inst;
    }

    protected onLoad(): void {
        GameManager._inst = this;
    }

    public onPlayerDead() {
        this.player.active = false;
        this._isGameOver = true;
    }

    public get isGameActive(): boolean {
        return this._isGameOver;
    }

    public restart() {
        this.player.active = true;
        this.player.setPosition(0, 0, 0);
        const playerComp = this.player.getComponent(Player);
        if (playerComp) {
            playerComp.resetHp();  //重置血量
        }

        EnemyManager.inst.recycleAllEnemies();  //回收所有敌人
        EnemySpawner.inst.resetSpawner();       //重置计时器
        BulletManager.inst.clearAllBullet();    //清理全部子弹
        ExperienceManager.inst.recycleAll();    //回收所有经验

        this._isGameOver = false; //恢复游戏
    }

    addExperience(exp: number) {
        console.log(exp);
    }
}


