// index.js
// 获取应用实例
const app = getApp();

const ba = wx.getBackgroundAudioManager();

Page({
  data: {
    audios: [
      {
        name: "春夏秋冬 - 张国荣",
        src: "https://piano.ttnote.cn/audios/%E6%98%A5%E5%A4%8F%E7%A7%8B%E5%86%AC%20-%20%E5%BC%A0%E5%9B%BD%E8%8D%A3.mp3",
      },
      {
        name: "春夏秋冬 - 张国荣2",
        src: "https://piano.ttnote.cn/audios/%E6%98%A5%E5%A4%8F%E7%A7%8B%E5%86%AC%20-%20%E5%BC%A0%E5%9B%BD%E8%8D%A3.mp3",
      },
    ],
    currentIndex: "",
  },
  onLoad() {
    // 音频播放进度实时回调
    ba.onTimeUpdate(function () {});
    ba.onCanplay(function () {
      console.log("onCanplay");
    });
    ba.onWaiting(() => {
      console.log("onWaiting", ba.duration);
    });
    ba.onPlay(() => {
      console.log("onPlay", ba);
      console.log("onPlayTitle", ba.title);
      // this.setData({ currentIndex: index });
    });
    ba.onError(function (e) {
      console.log("onError", e);
    });
    ba.onEnded(function () {
      console.log("onEnd");
    });
    ba.onNext(function () {
      console.log("onNext");
    });
    ba.onPrev(function () {
      console.log("onPrev");
    });
    ba.onEnded(function () {
      console.log("onEnded");
    });
    ba.onStop(function () {
      console.log("onStope");
    });
    ba.onWaiting(function () {
      console.log("onWaiting", "正在拼命加载中...");
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
    ba.play();
  },
  handlePlay(e) {
    const index = e.currentTarget.dataset.index;
    const audio = this.data.audios[index];

    ba.title = audio.name;
    ba.epname = "hello";
    ba.singer = "jay";
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
});
