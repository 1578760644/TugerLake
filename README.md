# Tuger Lake

一个使用 Cocos Creator 3.8 + TypeScript 开发的 **2D 肉鸽幸存者游戏**，支持微信小游戏。

![%E5%BC%80%E5%A7%8B%E7%95%8C%E9%9D%A2](https://raw.githubusercontent.com/1578760644/TugerLake/refs/heads/master/screenshot/%E5%BC%80%E5%A7%8B%E7%95%8C%E9%9D%A2.png)

![%E6%AD%A6%E5%99%A8%E9%80%89%E6%8B%A9](https://raw.githubusercontent.com/1578760644/TugerLake/refs/heads/master/screenshot/%E6%AD%A6%E5%99%A8%E9%80%89%E6%8B%A9.png)

![%E6%B8%B8%E7%8E%A9](https://raw.githubusercontent.com/1578760644/TugerLake/refs/heads/master/screenshot/%E6%B8%B8%E7%8E%A9.png)

## 技术栈

- **引擎**: Cocos Creator 3.8
- **语言**: TypeScript
- **平台**: 微信小游戏
- **资源**: Kenney 像素素材

## 核心架构

### 模块设计

- `GameManager` 游戏状态管理（单例）
- `PlayerManager` 移动输入（键盘 + 触摸）
- `EnemyManager` 敌人对象池（Map + NodePool）
- `EnemySpawner` 敌人生成规则（独立计时器）
- `BulletManager` 子弹对象池
- `WeaponManager` 武器槽位管理
- `WeaponBase` 武器基类（模板方法模式）
- `BulletBase` 子弹基类
- `ExperienceManager` 经验值管理
- `AudioMgr` 全局音效管理

### 设计模式

- **单例模式**: GameManager、EnemyManager、BulletManager 等全局管理器
- **模板方法模式**: WeaponBase.tryAttack 被子类重写实现不同攻击模式
- **对象池模式**: 敌人和子弹使用 NodePool 实现复用

### 数据驱动

所有武器、子弹、敌人属性均由配置文件驱动，新增内容只需添加配置和预制体，**不修改业务代码**。

**assets/scripts/config/**
- `weapon_config.ts` — 武器配置
- `bullet_config.ts` — 子弹配置
- `enemy_config.ts` — 敌人配置
- `player_config.ts` — 玩家配置

## 核心玩法

### 战斗循环

生成敌人 → 自动瞄准 → 发射子弹 → 击杀掉落经验 → 经验升级 → 选择武器 → 更强火力

### 武器系统

- **手枪**: 追踪最近敌人
- **冲锋枪**: 固定方向发射
- **霰弹枪**: 追踪 + 散射
- **步枪/狙击枪/火箭筒**: 不同数值和效果

### 升级系统

- 递增经验曲线
- 武器三选一
- 最多 4 把武器同时开火

## 技术亮点

### 1. 触摸输入优化

处理了微信小游戏真机触摸事件的噪声和丢失问题，通过多点触控 ID 管理和静止帧检测保证移动手感。

### 2. 对象池管理

Map + NodePool 实现多类型敌人和子弹的复用，解决了复用状态残留、定时器污染等常见陷阱。

### 3. 配置表驱动

所有游戏数值和行为由配置表控制，实现了“数据与逻辑分离”。

### 4. 性能优化

- 自动图集合并 Draw Call
- 敌人帧动画手动切换（避免 Animation 组件开销）
- 对象池二级水位预警（方案已设计）

## 后续规划

- 数据统计面板
- 虚拟摇杆
- 对象池二级水位预警
- 更多武器和子弹类型
- 敌人死亡特效
- 背景音乐
