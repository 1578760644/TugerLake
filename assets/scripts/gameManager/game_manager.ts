import { _decorator, Component, Node } from 'cc';
import { Player } from '../prefabs/player';
import { EnemySpawner } from './enemy_spawner';
import { EnemyManager } from './enemy_manager';
import { BulletManager } from './bullet_manager';
import { ExperienceManager } from './experience_manager';
import { PLAYER_CONFIG } from '../../config/player_config';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    public player: Node = null;

    @property(Node)
    public swtichUI: Node = null;

    private _isGameOver: boolean = false;
    private _isPause: boolean = false;

    private _currentExp: number = 0;
    private _needExp: number = PLAYER_CONFIG.baseExp;
    private _playerLevel: number = 1;
    private _isLevelUp: boolean = false;

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

    public get isPause(): boolean {
        return this._isPause || this._isGameOver;
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
        if (this._isLevelUp || this._isGameOver) return;
        this._currentExp += exp;
        if (this._currentExp >= this._needExp) {
            this._isLevelUp = true;
            this._isPause = true;
            this.swtichUI.active = true;   //弹出升级面板
        }
    }

    applyUpgrade(weaponType?: string) {
        this.swtichUI.active = false;

        //TODO：根据 weaponType 应用实际升级效果（后续补充）

        //计算下一级所需经验
        this._playerLevel++;
        if (this._playerLevel === 2) {
            this._needExp += PLAYER_CONFIG.baseExp;
        } else {
            // 3级后递增量 = baseInc + (level - 2) * incGrowth
            const inc = PLAYER_CONFIG.baseInc + (this._playerLevel - 2) * PLAYER_CONFIG.incGrowth;
            this._needExp += inc;
        }

        // 4. 清空当前经验（可保留溢出，这里简单归零）
        this._currentExp = 0;

        this._isLevelUp = false;
        this._isPause = false;
    }
}


