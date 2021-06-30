// app.js
App({
  globalData: {
    isClient: false,
  },
  onLaunch() {
    const info = wx.getSystemInfoSync();
    if (["windows", "mac"].includes(info.platform)) {
      this.globalData.isClient = true;
    }
  },
});
