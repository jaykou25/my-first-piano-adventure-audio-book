// index.js
// 获取应用实例

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
    pickerShow: false,
    playMode: 1,
    loading: false,
  },
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
      this.setData({
        currentTime: ba.currentTime,
        duration: ba.duration,
        waiting: false,
      });
    });

    ba.onCanplay(() => {
      this.setData({ loading: false });
    });

    ba.onWaiting(() => {
      this.setData({ waiting: true });
    });

    ba.onPlay(() => {
      this.setData({ audioStatus: 2 });
    });

    ba.onPause(() => {
      this.setData({ audioStatus: 3 });
    });

    ba.onError(function (e) {});

    ba.onEnded(() => {
      this.setData({ audioStatus: 0 });

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
      this.setData({ audioStatus: 0, playingTrack: {} });
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
    if (this.data.audioStatus === 0) {
      this.setData({ playingTrack: {} });
    } else {
      ba.stop();
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
  handleAudioClick(e) {
    const index = e.currentTarget.dataset.index;
    this.handlePlay(index);
  },
  handlePlay(index) {
    this.setData({ loading: true });

    const { epIndex, playingTrack } = this.data;
    const audio = eps[epIndex].audios[index];

    if (index === playingTrack.index && playingTrack.epIndex === epIndex)
      return;

    this.setData({
      playingTrack: { ...audio, index, epIndex: epIndex },
    });

    this.startPlay(audio);
  },
  startPlay(audio) {
    ba.title = audio.title;
    ba.src = audio.src;
  },

  confirmPick(e) {
    const index = +e.detail.value;
    this.setData({
      epIndex: index,
      pickerShow: false,
    });

    wx.setStorageSync("epIndex", index);
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
    if (playingTrack.index < eps[epIndex].audios.length) {
      this.handlePlay(playingTrack.index + 1);
    }
  },
});
