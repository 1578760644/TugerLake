import { _decorator, Component, Label, Node } from 'cc';
import { Player } from '../prefabs/player';
import { EnemySpawner } from './enemy_spawner';
import { EnemyManager } from './enemy_manager';
import { BulletManager } from './bullet_manager';
import { ExperienceManager } from './experience_manager';
import { PLAYER_CONFIG } from '../config/player_config';
import { WeaponManager } from './weapon_manager';
import { SwitchPanel } from '../ui/switch_panel';
import { GameData } from '../data/game_data';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    public player: Node = null;

    @property(SwitchPanel)
    public switchPanel: SwitchPanel = null;

    @property(Node)
    public startBg: Node = null;
    @property(Node)
    public endBg: Node = null;
    @property(Label)
    public scoreLabel: Label = null;

    private _isGameOver: boolean = false;
    private _isPause: boolean = false;

    private _currentExp: number = 0;
    private _needExp: number = PLAYER_CONFIG.baseExp;
    private _playerLevel: number = 1;
    private _isLevelUp: boolean = false;

    //游戏数据
    private _killCount: number = 0;
    private _survivalTime: number = 0;

    private static _inst: GameManager;
    public static get inst(): GameManager {
        return this._inst;
    }

    protected onLoad(): void {
        GameManager._inst = this;
    }

    protected start(): void {
        this._isPause = true;
    }

    public onPlayerDead() {
        this._isGameOver = true;

        this.scheduleOnce(() => {
            this.endBg.active = true;
        }, 0.5);

        GameData.saveScore();

        if (this.scoreLabel) {
            this.scoreLabel.string =
                `存活时间:${this._survivalTime.toFixed(1)}s\n` +
                `击杀敌人:${GameData.getScore()}\n` +
                `最高击杀:${GameData.getBestScore()}`;
        }
    }

    protected update(dt: number): void {
        if (this._isGameOver || this._isPause) return;
        this._survivalTime += dt;
        const playComp = this.player.getComponent(Player);
        if (playComp && playComp.isDead) {
            this.onPlayerDead();
        }
    }

    public startGame() {
        this.startBg.active = false;
        this._isPause = false;

        GameData.setScore();
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
        WeaponManager.inst.resetAllWeapons();   //重置武器

        this._isGameOver = false; //恢复游戏
        this._isPause = false;
        this._isLevelUp = false;
        this._currentExp = 0;
        this._needExp = PLAYER_CONFIG.baseExp;
        this._playerLevel = 1;
        this.switchPanel.controllSwitchUI;

        this.startBg.active = false;
        this.endBg.active = false;

        GameData.setScore();
    }

    public onClearDataButtonClick(): void {
        GameData.clearAllData();
        // 清空后刷新显示的最高分（变为 0）
        if (this.scoreLabel) {
            this.scoreLabel.string =
                `存活时间:${this._survivalTime.toFixed(1)}s\n` +
                `击杀敌人:${GameData.getScore()}\n` +
                `最高击杀:${GameData.getBestScore()}`;
        }
    }

    addExperience(exp: number) {
        if (this._isLevelUp || this._isGameOver) return;
        this._currentExp += exp;
        if (this._currentExp >= this._needExp) {
            this._isLevelUp = true;
            this._isPause = true;

            // 如果武器槽已满，直接完成升级，不弹出面板
            if (WeaponManager.inst.isSlotsFull()) {
                this.applyUpgrade();   // 仍然增加等级、重置经验
                return;
            }

            // 随机抽取 3 个不重复的武器类型（从 WeaponManager 获取池子）
            const pool = WeaponManager.inst.getUpgradeableWeaponTypes();
            const shuffled = pool.sort(() => Math.random() - 0.5);
            const options = shuffled.slice(0, 3);

            // 显示升级面板
            if (this.switchPanel) {
                this.switchPanel.showUpgradeOptions(options);
            }
        }
    }

    private getExpForLevel(level: number): number {
        if (level === 1) return PLAYER_CONFIG.baseExp;
        const prevExp = this.getExpForLevel(level - 1);
        const inc = PLAYER_CONFIG.baseInc + (level - 2) * PLAYER_CONFIG.incGrowth;
        return prevExp + inc;
    }

    applyUpgrade(weaponType?: string) {

        //TODO：根据 weaponType 应用实际升级效果（后续补充）

        //计算下一级所需经验
        this._playerLevel++;
        this._needExp = this.getExpForLevel(this._playerLevel);

        // 4. 清空当前经验（可保留溢出，这里简单归零）
        this._currentExp = 0;

        this._isLevelUp = false;
        this._isPause = false;
    }

    public get isGameActive(): boolean {
        return this._isGameOver;
    }

    public get isPause(): boolean {
        return this._isPause || this._isGameOver;
    }

    public get currentExp(): number {
        return this._currentExp;
    }

    public get needExp(): number {
        return this._needExp;
    }

    public get playerLevel(): number {
        return this._playerLevel;
    }
}


