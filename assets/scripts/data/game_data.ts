import { sys } from 'cc';

export class GameData {
    private static readonly BEST_SCORE_KEY = 'BestScore';
    private static _score: number = 0;

    /**
     * 增加分数（默认加1）
     * @param count 1
     */
    public static addScore(count: number = 1) {
        this._score += count;
    }

    //获取当前分数
    public static getScore(): number {
        return this._score;
    }

    /**
     * 重置当前分数
     */
    public static setScore(): void {
        this._score = 0;
    }

    //读取历史最高分
    public static getBestScore(): number {
        const stored = sys.localStorage.getItem(this.BEST_SCORE_KEY);
        if (stored) {
            //保证以10进制显示
            return parseInt(stored, 10);
        }
        return 0;
    }

    /**
     * 判断并保存最高分
     */
    public static saveScore(): void {
        const current = this.getScore();
        const best = this.getBestScore();
        if (current > best) {
            sys.localStorage.setItem(this.BEST_SCORE_KEY, current.toString());
        }
    }
}


