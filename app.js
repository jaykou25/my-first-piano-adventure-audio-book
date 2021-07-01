// app.js
App({
  globalData: {
    isClient: false,
  },
  onLaunch() {
    const info = wx.getSystemInfoSync();
    // 判断是否是电脑客户端
    if (["windows", "mac"].includes(info.platform)) {
      this.globalData.isClient = true;
    }
  },
});
