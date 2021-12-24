import { behavior } from "miniprogram-computed";
// index.js
// 获取应用实例
const app = getApp();

const ba = wx.getBackgroundAudioManager();

const epsCn = require("./audios");
const epsEn = require("./audiosEn");

Component({
  behaviors: [behavior],
  data: {
    eps: { cn: epsCn, en: epsEn },
    version: "cn",
    visualVersion: "",
    epName: "",
    epId: "",
    playingTrack: {
      index: "",
      title: "",
      epName: "",
    },
    audioStatus: 0, // 0 默认, 2 playing, 3 pause,
    waiting: false, // 歌曲快进时会有waiting
    currentTime: "",
    duration: "",
    percent: 0,
    pickerShow: false,
    playMode: 1,
    loading: false, // 歌曲初次载入时会有loading
    speedShow: false,
    speedOptions: [
      { value: 0.75, label: "0.75X", icon: "🐢" },
      { value: 1, label: "1.0X", icon: "🧒" },
      { value: 1.25, label: "1.25X", icon: "🐇" },
      { value: 1.5, label: "1.5X", icon: "🐆" },
    ],
    speed: "",
    speedLabel: "",
    speedIcon: "",
    showNotice: false,
    oldEpIds: [], // 缓存中的epIds, 用于通知小红点
    newEpIds: [], // 请求到的新epIds, 用于通知小红点
    contentLoading: false, // 从数据库获取音频内容
    current: 1, //当前页数
    limit: 20, // 每页数
    total: 0, // 当前专辑的歌曲总数
  },
  isSetSpeed: false,
  nowTime: 0,
  shouldPause: false,
  stopSlider: false,
  computed: {
    hasMore(data) {
      return data.total > data.current * data.limit;
    },
    targetEp(data) {
      const { eps, version, epName } = data;
      const target = eps[version].find((ep) => {
        return ep.name === epName;
      });
      return target || {};
    },
    targetAudios(data) {
      return data.targetEp.audios;
    },
    isEmpty(data) {
      const { audios } = data.targetEp;
      return audios && audios.length < 1;
    },
  },
  methods: {
    onShareAppMessage() {
      return {
        title: "我的钢琴第一课音频素材",
        path: "/pages/index/index",
        imageUrl: "/pages/index/levelA800.png",
      };
    },
    onShareTimeline() {
      return {
        title: "我的钢琴第一课音频素材",
        imageUrl: "/pages/index/levelA800.png",
      };
    },
    onLoad() {
      const defaultEpName = wx.getStorageSync("epName") || "我的钢琴第一课·A级";
      const defaultEpId = wx.getStorageSync("epId");
      const defaultPlayMode = wx.getStorageSync("playMode") || 1;
      const defaultVersion = wx.getStorageSync("version") || "cn";
      const oldEpIds = wx.getStorageSync("oldEpIds");

      this.setData({
        epName: defaultEpName,
        epId: defaultEpId,
        playMode: defaultPlayMode,
        version: defaultVersion,
        visualVersion: defaultVersion,
        oldEpIds: oldEpIds ? oldEpIds.split(",") : [],
      });

      // 读取云数据库内容
      this.queryCloudEps(defaultEpId);
      this.queryNewEpIds();

      // 音频播放进度实时回调
      ba.onTimeUpdate(() => {
        // 在进度条拖动期间, 只更新当前时间和时长
        if (this.stopSlider) {
          this.setData({
            currentTime: ba.currentTime,
            waiting: false,
            duration: ba.duration,
          });
          return;
        }

        // 当音频播放完毕后
        if (ba.currentTime === 0) {
          this.setData({
            currentTime: 0,
            waiting: false,
            percent: 0,
          });
        } else {
          this.setData({
            currentTime: ba.currentTime,
            waiting: false,
            duration: ba.duration,
            percent: Math.round((ba.currentTime / ba.duration) * 100),
          });
        }
      });

      ba.onCanplay(() => {
        this.setData({
          loading: false,
        });
      });

      ba.onWaiting(() => {
        this.setData({ waiting: true });
      });

      ba.onPlay(() => {
        if (this.shouldPause) {
          ba.pause();
          this.shouldPause = false;
        }

        this.setData({ audioStatus: 2 });
      });

      ba.onPause(() => {
        this.setData({ audioStatus: 3 });
      });

      ba.onError(function (e) {});

      ba.onEnded(() => {
        this.setData({ audioStatus: 0, currentTime: 0, percent: 0 });

        const { playMode } = this.data;

        // 单曲循环
        if (playMode === 2) {
          this.play();
          return;
        }

        // 顺序播放
        if (playMode === 3) {
          this.playNext();

          return;
        }
      });

      ba.onStop(() => {
        // 调速播放的音频需要先stop后再play
        if (this.isSetSpeed) {
          this.startPlay(this.data.playingTrack, this.nowTime);
          this.isSetSpeed = false;
        } else {
          this.setData({ audioStatus: 0, playingTrack: {} });
        }
      });

      ba.onNext(() => {
        console.log("onNext");
        this.playNext();
      });
      ba.onPrev(() => {
        console.log("onPrev");
        // 如果当前歌曲播放时间大于3秒就重放, 小于3秒就播上一曲
        const { currentTime } = this.data;
        if (currentTime < 3) {
          this.playPrev();
        } else {
          this.refresh();
        }
      });
    },
    pause() {
      ba.pause();
    },
    play() {
      // 对已经播放完毕的歌
      if (
        (this.data.playingTrack.index || this.data.playingTrack.index === 0) &&
        this.data.audioStatus === 0
      ) {
        this.startPlay(this.data.playingTrack);
      } else {
        ba.play();
      }
    },
    refresh() {
      ba.seek(0);
    },
    closePlaying() {
      if (this.data.audioStatus === 0) {
        this.setData({ playingTrack: {} });
      } else {
        ba.stop();
        // 客户端监听不到stop, 这也只是临时的措施.
        if (app.globalData.isClient) {
          wx.showToast({
            title: "客户端暂不支持关闭后台音频, 只能暂停",
            icon: "none",
            duration: 2000,
          });
        }
      }
    },
    playBack() {
      if (this.data.audioStatus > 0) {
        ba.seek(this.data.currentTime - 5);
      }
    },
    playForward() {
      if (this.data.audioStatus > 0) {
        ba.seek(this.data.currentTime + 5);
      }
    },
    seekAudio(e) {
      this.stopSlider = false;
      const { value } = e.detail;
      const currentTime = this.data.duration * value * 0.01;
      this.setData({ currentTime });
      ba.seek(currentTime);
    },
    handleBindChanging() {
      this.stopSlider = true;
    },
    handleAudioClick(e) {
      const index = e.currentTarget.dataset.index;
      this.handlePlay(index);
    },
    handlePlay(index) {
      this.setData({ loading: true });

      const { epName, playingTrack, version, eps } = this.data;
      const audio = eps[version].find((ep) => ep.name === epName).audios[index];

      // 正在播放的音频点击忽略
      if (index === playingTrack.index && playingTrack.epName === epName)
        return;

      this.setData({
        playingTrack: { ...audio, index, epName: epName },
      });

      this.startPlay(audio);
    },
    startPlay(audio, startTime = 0) {
      const { epName, speed, version, eps } = this.data;
      const targetEp = eps[version].find((ep) => ep.name === epName);
      ba.title = audio.title;

      if (audio.epId) {
        ba.src = "https://www.ttnote.cn" + audio.src;
      } else if (audio._id) {
        ba.src = audio.src;
      } else {
        ba.src = audio.src.replace(
          "https://pianoadventures.cn/",
          "https://www.ttnote.cn/"
        );
      }

      ba.startTime = startTime;
      ba.coverImgUrl = targetEp.img;
      ba.epname = targetEp.name;
      if (speed) {
        ba.playbackRate = speed;
      }
    },
    confirmPick(e) {
      const epName = e.currentTarget.dataset.name;
      const epId = e.currentTarget.dataset.id;
      const notice = e.currentTarget.dataset.notice;

      const { oldEpIds } = this.data;

      this.setData({
        epName,
        epId,
        pickerShow: false,
        version: this.data.visualVersion,
      });

      if (notice) {
        this.setData({ oldEpIds: oldEpIds.concat(epId) });
        wx.setStorageSync("oldEpIds", oldEpIds.concat(epId).join(","));
      }

      wx.setStorageSync("epName", epName);
      wx.setStorageSync("epId", epId);
      wx.setStorageSync("version", this.data.visualVersion);

      if (epId) {
        const eps = this.data.eps;
        const ep = eps.cn.find(($ep) => $ep._id === epId);
        if (!ep.audios) {
          this.queryCloudTracks(epId);
        }
      }
    },
    confirmSpeed(e) {
      const speed = +e.detail.value;
      const target = this.data.speedOptions.find((op) => op.value === speed);
      this.setData({
        speed,
        speedIcon: target.icon,
        speedLabel: target.label,
        speedShow: false,
      });

      // 处理速度播放的逻辑, 如果正在播放, 应该要先停掉这个歌, 设置好速度后再定位到当时的时间
      this.isSetSpeed = true;
      this.nowTime = this.data.currentTime;
      if (this.data.audioStatus === 3) {
        this.shouldPause = true;
      }
      ba.stop();
    },
    isPlaying() {
      return [1, 2].includes(+this.data.audioStatus);
    },
    toPickerShow() {
      this.setData({ pickerShow: true });
    },
    toPickerHide() {
      this.setData({ pickerShow: false });
    },
    toSpeedShow() {
      this.setData({ speedShow: true });
    },
    toSpeedHide() {
      this.setData({ speedShow: false });
    },
    catchTouchMove() {},
    togglePlayMode() {
      const mode = this.data.playMode;

      if (mode === 3) {
        this.setData({ playMode: 1 });

        wx.setStorageSync("playMode", 1);
        return;
      }

      this.setData({ playMode: mode + 1 });

      wx.setStorageSync("playMode", mode + 1);
    },
    playNext() {
      const { playingTrack, epName, version, eps } = this.data;
      const targetEp = eps[version].find((ep) => ep.name === epName);
      if (playingTrack.index < targetEp.audios.length - 1) {
        this.handlePlay(playingTrack.index + 1);
      } else {
        this.setData({ playingTrack: {} });
      }
    },
    playPrev() {
      // 当前是第一曲的话就重放
      const { playingTrack, epName, version, eps } = this.data;
      if (playingTrack.index === 0) {
        this.refresh();
      } else {
        this.handlePlay(playingTrack.index - 1);
      }
    },
    toggleVersion(e) {
      const version = e.currentTarget.dataset.version;
      this.setData({ visualVersion: version });
    },
    async queryToneExerciseAudios() {
      const eps = this.data.eps;
      const db = wx.cloud.database();
      this.setData({ contentLoading: true });
      try {
        const res = await db.collection("audios").where({}).limit(100).get();
        eps.cn[0].audios = res.data;
        this.setData({ eps, contentLoading: false });
      } catch (e) {
        this.setData({ contentLoading: false });
      }
    },
    queryCloudEps(defaultEpId) {
      const db = wx.cloud.database();
      db.collection("eps")
        .where({})
        .limit(100)
        .get()
        .then((res) => {
          this.setData({ eps: { cn: epsCn.concat(res.data), en: epsEn } });

          this.queryToneExerciseAudios();

          if (defaultEpId) this.queryCloudTracks(defaultEpId);
        });
    },
    queryCloudTracks(epId, current = 1) {
      this.setData({ contentLoading: true });
      const eps = this.data.eps;

      wx.cloud
        .callFunction({
          name: "queryTracksByPage",
          data: {
            epId,
            current,
            limit: this.limit,
          },
        })
        .then((res) => {
          const ep = eps.cn.find(($ep) => $ep._id === epId);
          ep.audios = (ep.audios || []).concat(res.result.data);
          this.setData({ eps, total: res.result.total, current });
        })
        .finally(() => {
          this.setData({ contentLoading: false });
        });
    },
    // 用于显示通知小红点
    queryNewEpIds() {
      const db = wx.cloud.database();
      db.collection("newEps")
        .limit(1)
        .get()
        .then((res) => {
          const ids = res.data[0] ? res.data[0].newEpIds : [];
          this.setData({ newEpIds: ids });
        });
    },
    // 触底后的操作
    handleToLower() {
      const { total, current, limit, contentLoading, epId } = this.data;
      const hasMore = total > current * limit;
      if (!contentLoading && hasMore) {
        this.queryCloudTracks(epId, current + 1);
      }
    },
  },
});
