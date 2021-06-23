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
    waiting: false,
    currentTime: "",
    duration: "",
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

        // wx.setNavigationBarTitle({
        //   title: eps[res.data].name,
        // });
      },
    });

    // wx.setNavigationBarTitle({
    //   title: eps[this.data.epIndex].name,
    // });
    // 音频播放进度实时回调
    ba.onTimeUpdate(() => {
      this.setData({
        currentTime: ba.currentTime,
        duration: ba.duration,
        waiting: false,
      });
    });
    ba.onCanplay(function () {
      console.log("onCanplay");
    });
    ba.onWaiting(() => {
      console.log("onwaiting");
      this.setData({ waiting: true });
    });
    ba.onPlay(() => {
      console.log("onPlay");
      this.setData({ audioStatus: 2 });
    });
    ba.onPause(() => {
      console.log("onPause");
      this.setData({ audioStatus: 3 });
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
      this.setData({ audioStatus: 0, playingTrack: {} });
    });
    ba.onNext(function () {
      console.log("onNext");
    });
    ba.onPrev(function () {
      console.log("onPrev");
    });
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
    // 已经播放完毕的歌
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
    ba.stop();
  },
  playBack() {
    ba.seek(this.data.currentTime - 5);
  },
  playForward() {
    ba.seek(this.data.currentTime + 5);
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

    // wx.setNavigationBarTitle({
    //   title: eps[this.data.epIndex].name,
    // });

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
