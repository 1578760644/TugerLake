//AudioMgr.ts
import { Node, AudioSource, AudioClip, resources, director } from 'cc';
/**
 * @en
 * this is a sington class for audio play, can be easily called from anywhere in you project.
 * @zh
 * 这是一个用于播放音频的单件类，可以很方便地在项目的任何地方调用。
 */
export class AudioMgr {
    // 新增：缓存已加载的音效
    private _audioClipCache: Map<string, AudioClip> = new Map();

    private static _inst: AudioMgr;
    public static get inst(): AudioMgr {
        if (this._inst == null) {
            this._inst = new AudioMgr();
        }
        return this._inst;
    }

    private _audioSource: AudioSource;
    constructor() {
        //@en create a node as audioMgr
        //@zh 创建一个节点作为 audioMgr
        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        //@en add to the scene.
        //@zh 添加节点到场景
        director.getScene().addChild(audioMgr);

        //@en make it as a persistent node, so it won't be destroied when scene change.
        //@zh 标记为常驻节点，这样场景切换的时候就不会被销毁了
        director.addPersistRootNode(audioMgr);

        //@en add AudioSource componrnt to play audios.
        //@zh 添加 AudioSource 组件，用于播放音频。
        this._audioSource = audioMgr.addComponent(AudioSource);
    }

    public get audioSource() {
        return this._audioSource;
    }

    /**
     * 预加载一组音效（建议在游戏开始时调用一次）
     * @param paths 音效资源路径数组，如 ['sounds/shoot', 'sounds/explosion']
     */
    public preload(paths: string[]) {
        for (const path of paths) {
            resources.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.warn('音效加载失败:', path, err);
                } else {
                    this._audioClipCache.set(path, clip);
                }
            });
        }
    }

    /**
     * 播放已缓存或动态加载的音效
     * @param nameOrClip 音效路径或 AudioClip 实例
     * @param volume 音量 0-1
     */
    playOneShot(nameOrClip: AudioClip | string, volume: number = 1.0) {
        if (nameOrClip instanceof AudioClip) {
            this._audioSource.playOneShot(nameOrClip, volume);
        } else {
            // 先从缓存中取
            const cached = this._audioClipCache.get(nameOrClip);
            if (cached) {
                this._audioSource.playOneShot(cached, volume);
            } else {
                // 缓存未命中，动态加载后播放并缓存
                resources.load(nameOrClip, AudioClip, (err, clip) => {
                    if (!err) {
                        this._audioClipCache.set(nameOrClip, clip);
                        this._audioSource.playOneShot(clip, volume);
                    }
                });
            }
        }
    }

    /**
     * @en
     * play long audio, such as the bg music
     * @zh
     * 播放长音频，比如 背景音乐
     * @param sound clip or url for the sound
     * @param volume 
     */
    play(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.stop();
            this._audioSource.clip = sound;
            this._audioSource.play();
            this.audioSource.volume = volume;
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.stop();
                    this._audioSource.clip = clip;
                    this._audioSource.play();
                    this.audioSource.volume = volume;
                }
            });
        }
    }

    /**
     * stop the audio play
     */
    stop() {
        this._audioSource.stop();
    }

    /**
     * pause the audio play
     */
    pause() {
        this._audioSource.pause();
    }

    /**
     * resume the audio play
     */
    resume() {
        this._audioSource.play();
    }
}

