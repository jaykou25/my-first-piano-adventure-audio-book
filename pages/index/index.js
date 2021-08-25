// index.js
// 获取应用实例
const app = getApp();

const ba = wx.getBackgroundAudioManager();

const eps = require("./audios");

Page({
  data: {
    eps,
    epIndex: 0,
    playingTrack: {
      index: "",
      title: "",
      epIndex: "",
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
  },
  isSetSpeed: false,
  nowTime: 0,
  shouldPause: false,
  stopSlider: false,
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
    const defaultEpIndex = wx.getStorageSync("epIndex") || 0;
    const defaultPlayMode = wx.getStorageSync("playMode") || 1;
    this.setData({ epIndex: defaultEpIndex, playMode: defaultPlayMode });

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

    ba.onNext(function () {
      console.log("onNext");
    });
    ba.onPrev(function () {
      console.log("onPrev");
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

    const { epIndex, playingTrack } = this.data;
    const audio = eps[epIndex].audios[index];

    // 正在播放的音频点击忽略
    if (index === playingTrack.index && playingTrack.epIndex === epIndex)
      return;

    this.setData({
      playingTrack: { ...audio, index, epIndex: epIndex },
    });

    this.startPlay(audio);
  },
  startPlay(audio, startTime = 0) {
    const { epIndex, speed } = this.data;
    ba.title = audio.title;
    ba.src = audio.src;
    ba.startTime = startTime;
    ba.coverImgUrl = eps[epIndex].img;
    ba.epname = eps[epIndex].name;
    if (speed) {
      ba.playbackRate = speed;
    }
  },
  confirmPick(e) {
    const index = +e.detail.value;
    this.setData({
      epIndex: index,
      pickerShow: false,
    });

    wx.setStorageSync("epIndex", index);
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
    const { playingTrack, epIndex } = this.data;
    if (playingTrack.index < eps[epIndex].audios.length - 1) {
      this.handlePlay(playingTrack.index + 1);
    } else {
      this.setData({ playingTrack: {} });
    }
  },
});
