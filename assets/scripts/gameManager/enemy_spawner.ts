import { _decorator, CCString, Component, Node } from 'cc';
import { EnemyManager } from './enemy_manager';
import { SPAWN_CONFIG } from '../../config/spawn_config';
import { GameManager } from './game_manager';
const { ccclass, property } = _decorator;

@ccclass('EnemySpawner')
export class EnemySpawner extends Component {

    private _gameTime: number = 0;          // 累计游戏时间

    private _timers: Map<string, number> = new Map();

    private static _inst: EnemySpawner;
    public static get inst(): EnemySpawner {
        return this._inst;
    }


    protected onLoad(): void {
        EnemySpawner._inst = this;
    }

    protected start(): void {
        for (const type of Object.keys(SPAWN_CONFIG)) {
            this._timers.set(type, 0)
        }
    }

    protected update(dt: number): void {
        if (GameManager.inst.isGameActive) return;
        //累计游戏总时间
        this._gameTime += dt;

        //遍历配置表中的敌人
        for (const type of Object.keys(SPAWN_CONFIG)) {
            const rule = SPAWN_CONFIG[type];

            //游戏时间小于敌人出场时间，跳过
            if (this._gameTime < rule.startTime) continue;

            //获取该类型的独立计时器
            let timer = this._timers.get(type) + dt;

            //计算当前实际间隔（随时间递减，不能低于minInterval）
            const currentInterval = Math.max(
                rule.minInterval,
                rule.interval - this._gameTime * rule.decay
            );

            /* 
            关于 while 循环
            假设 dt 很大比如 0.05秒，而 currentInterval 只有 0.01秒，
            那么 timer 可能累积到 0.05，而间隔只有 0.01，
            则一次 while 循环会执行 5 次，生成 5 波敌人，确保不会因为帧率低而丢失生成机会。 
            */
            while (timer >= currentInterval) {
                timer -= currentInterval; //减去间隔
                for (let i = 0; i < rule.count; i++) {
                    EnemyManager.inst.spawnEnemy(type);
                }
            }

            //存回计时器
            this._timers.set(type, timer);
        }
    }

    resetSpawner() {
        this._gameTime = 0;
        for (const type of Object.keys(SPAWN_CONFIG)) {
            this._timers.set(type, 0)
        }
    }
}


