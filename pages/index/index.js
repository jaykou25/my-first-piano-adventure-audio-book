// index.js
// 获取应用实例
const app = getApp();

const ba = wx.getBackgroundAudioManager();

const eps = require("./audios");

Page({
  data: {
    eps,
    epIndex: 0,
    playingTrack: { index: "", title: "", epIndex: "" },
    audioStatus: 0, // 0 默认, 1 waiting, 2 playing, 3 pause,
    icons: app.globalData.icons,
    pickerShow: false,
  },
  temp: {
    epIndex: "",
  },
  onLoad() {
    wx.getStorage({
      key: "epIndex",
      success: (res) => {
        this.setData({ epIndex: res.data });

        wx.setNavigationBarTitle({
          title: eps[res.data].name,
        });
      },
    });

    wx.setNavigationBarTitle({
      title: eps[this.data.epIndex].name,
    });
    // 音频播放进度实时回调
    ba.onTimeUpdate(function () {});
    ba.onCanplay(function () {
      console.log("onCanplay");
    });
    ba.onWaiting(() => {
      this.setData({ audioStatus: 1 });
    });
    ba.onPlay(() => {
      console.log("onPlay");
      this.setData({ audioStatus: 2 });
    });
    ba.onPause(() => {
      console.log("onPause");
      this.setData({ audioStatus: 4 });
    });
    ba.onError(function (e) {
      console.log("onError", e);
    });
    ba.onEnded(() => {
      console.log("onEnd");
      this.setData({ audioStatus: 0 });
    });
    ba.onStop(() => {
      console.log("onStop");
      this.setData({ audioStatus: 0 });
    });
    ba.onNext(function () {
      console.log("onNext");
    });
    ba.onPrev(function () {
      console.log("onPrev");
    });

    // 处理从其他页面进入之前，该播放器已经实例过
    if (ba.duration > 0) {
      return;
    }
    // 初始加载完成后，将音频列表放到globalData中，缓存播放列表
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: "../logs/logs",
    });
  },
  pause() {
    ba.pause();
  },
  play() {
    if (this.data.currentIndex && this.data.audioStatus === 0) {
      this.startPlay(this.data.currentAudio);
    } else {
      ba.play();
    }
  },
  refresh() {
    ba.seek(0);
  },
  handlePlay(e) {
    const index = e.currentTarget.dataset.index;
    const audio = e.currentTarget.dataset.audio;

    if (
      index === this.data.playingTrack.index &&
      this.data.playingTrack.epIndex === this.data.epIndex
    )
      return;

    this.setData({
      playingTrack: { ...audio, index, epIndex: this.data.epIndex },
    });

    this.startPlay(audio);
  },
  startPlay(audio) {
    ba.title = audio.title;
    ba.src = audio.src;
  },
  pickerChange(e) {
    this.temp.epIndex = e.detail.value[0];
  },
  confirmPick() {
    this.setData({
      epIndex: this.temp.epIndex,
      pickerShow: false,
    });

    wx.setNavigationBarTitle({
      title: eps[this.data.epIndex].name,
    });

    wx.setStorage({
      key: "epIndex",
      data: this.data.epIndex,
    });
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
  catchTouchMove() {},
});
