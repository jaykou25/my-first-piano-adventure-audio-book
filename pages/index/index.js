// index.js
// 获取应用实例
const app = getApp();

const ba = wx.getBackgroundAudioManager();

const audios = require("./audios");

Page({
  data: {
    audios,
    currentEp: Object.keys(audios)[0],
    currentIndex: "",
    currentAudio: "",
    audioStatus: 0, // 0 默认, 1 waiting, 2 playing, 3 pause,
    icons: app.globalData.icons,
  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: Object.keys(audios)[0],
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

    if (index === this.data.currentIndex) return;

    this.setData({ currentIndex: index, currentAudio: audio });

    this.startPlay(audio);
  },
  startPlay(audio) {
    ba.title = audio.title;
    ba.epname = audio.epname;
    ba.src = audio.src;
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: "展示用户信息", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
      },
    });
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e);
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    });
  },
  isPlaying() {
    return [1, 2].includes(+this.data.audioStatus);
  },
});
