import { _decorator, Component, Node } from 'cc';
import { BaseItemManager } from '../base/base_item_manager';
const { ccclass, property } = _decorator;

@ccclass('ExperienceManager')
export class ExperienceManager extends BaseItemManager {
    private static _inst: ExperienceManager;
    public static get inst(): ExperienceManager {
        return this._inst;
    }

    protected onLoad(): void {
        super.onLoad(); // 必须先调用，基类在此预加载对象池
        ExperienceManager._inst = this;
    }


    //不应该单独管理经验，而是直接管理所有生成物品的基类
}


