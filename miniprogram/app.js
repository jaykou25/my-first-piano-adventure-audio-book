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
    //云开发
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: "cloud1-0g76pj36226690cc",
        traceUser: true,
      });
    }
  },
});
