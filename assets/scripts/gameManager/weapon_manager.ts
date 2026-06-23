import { _decorator, Component, instantiate, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { GameManager } from './game_manager';
import { WeaponBase } from '../base/weapon_base';
import { WEAPON_CONFIG } from '../../config/weapon_config';
const { ccclass, property } = _decorator;

@ccclass('WeaponManager')
export class WeaponManager extends Component {
    @property([Prefab])
    public weaponPrefabs: Prefab[] = [];    // 按 prefabIndex 顺序拖入所有武器预制体,后续通过load方法重构

    private _equippedSlots: Node[] = [null, null, null, null]; //右 左 上 下
    private _nextSlotIndex: number = 1; //0是初始武器，新武器从1开始

    private _prefabDict: Record<string, Prefab> = {};
    private _iconMap: Record<string, SpriteFrame> = {};

    private static _inst: WeaponManager;
    public static get inst(): WeaponManager {
        return this._inst;
    }

    onLoad() {
        WeaponManager._inst = this;

        //根据配置表建立预制体字典和图标缓存，因为预制体不能直接通过getComponent取到自己的sprite组件,暂时用sprite的形式
        for (const type of Object.keys(WEAPON_CONFIG)) {
            const config = WEAPON_CONFIG[type];
            const prefab = this.weaponPrefabs[config.prefabIndex];
            if (!prefab) {
                console.warn(`[WeaponManager] 武器预制体未设置,type: ${type}, prefabIndex: ${config.prefabIndex}`);
                continue;
            }

            //存储预制体
            this._prefabDict[type] = prefab;

            //提取图标
            const rootNode = prefab.data as Node;
            if (rootNode) {
                const sprite = rootNode.getComponent(Sprite);
                if (sprite?.spriteFrame) {
                    this._iconMap[type] = sprite.spriteFrame;
                }
            }
        }
    }

    protected start(): void {
        this.equipInitialWeapon();
    }

    /**
     * 装备初始武器（默认手枪，索引0）
     */
    private equipInitialWeapon() {
        const prefab = this._prefabDict[`pistol`];
        if (!prefab) {
            console.warn('[WeaponManager] 未找到初始武器 pistol 的预制体');
            return;
        }
        this.equipToSlot(prefab, true, 0, 'pistol'); // 主武器，右边
    }

    /** 根据武器类型 key 装备新武器（供 SwitchPanel 调用） */
    public equipWeapon(type: string) {
        const prefab = this._prefabDict[type];
        if (!prefab) {
            console.warn(`[WeaponManager] 未找到武器配置: ${type}`);
            return;
        }

        // 分配下一个可用槽位
        if (this._nextSlotIndex >= 4) {
            console.warn('所有武器槽已满');
            return;
        }

        const slotIndex = this._nextSlotIndex;
        this._nextSlotIndex++;

        this.equipToSlot(prefab, false, slotIndex, type);
    }


    /**
     * 将预制体实例化并装备到指定槽位
     * @param prefab 预制体
     * @param isPrimary 是否为默认武器
     * @param slotIndex 插槽位置
     * @param weaponType 武器类型（可选，若不传则使用预制体上已有的 weaponType）
     */
    private equipToSlot(prefab: Prefab, isPrimary: boolean, slotIndex: number, weaponType?: string) {
        const player = GameManager.inst.player;
        const weaponNode = instantiate(prefab);
        weaponNode.setParent(player);

        const weapon = weaponNode.getComponent(WeaponBase);
        if (weapon) {
            // 如果提供了武器类型，则注入；否则保持预制体原有值（向后兼容）
            if (weaponType) {
                weapon.weaponType = weaponType;
            }
            weapon.initPositionAndRotation(player, isPrimary, slotIndex);   //绑定位置
            weapon.loadConfig();    //初始化武器
        }

        this._equippedSlots[slotIndex] = weaponNode; //选中的武器节点存入列表
    }

    public resetAllWeapons() {
        for (let i = 0; i < this._equippedSlots.length; i++) {
            const node = this._equippedSlots[i];
            if (node && node.isValid) {
                node.destroy();
            }
            this._equippedSlots[i] = null;
        }
        this._nextSlotIndex = 1;
        this.equipInitialWeapon();
    }

    /** 获取武器类型对应的图标，供升级面板使用 */
    public getWeaponIcon(type: string): SpriteFrame | null {
        return this._iconMap[type] ?? null;
    }

    /** 检查是否所有武器槽都已装备 */
    public isSlotsFull(): boolean {
        return this._nextSlotIndex >= 4;
    }


    /** 获取可升级武器类型列表（排除初始武器） */
    public getUpgradeableWeaponTypes(): string[] {
        // 返回除初始武器外的所有武器类型 key
        return Object.keys(WEAPON_CONFIG).filter(type => type !== 'pistol');
    }
}


