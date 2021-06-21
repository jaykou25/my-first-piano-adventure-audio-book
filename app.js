// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);

    // 登录
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    });
  },
  globalData: {
    userInfo: null,
    icons: {
      play: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHRpdGxlPlBsYXk8L3RpdGxlPjxwYXRoIGQ9J00xMzMgNDQwYTM1LjM3IDM1LjM3IDAgMDEtMTcuNS00LjY3Yy0xMi02LjgtMTkuNDYtMjAtMTkuNDYtMzQuMzNWMTExYzAtMTQuMzcgNy40Ni0yNy41MyAxOS40Ni0zNC4zM2EzNS4xMyAzNS4xMyAwIDAxMzUuNzcuNDVsMjQ3Ljg1IDE0OC4zNmEzNiAzNiAwIDAxMCA2MWwtMjQ3Ljg5IDE0OC40QTM1LjUgMzUuNSAwIDAxMTMzIDQ0MHonLz48L3N2Zz4=",
      pause:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHRpdGxlPlBhdXNlPC90aXRsZT48cGF0aCBkPSdNMjA4IDQzMmgtNDhhMTYgMTYgMCAwMS0xNi0xNlY5NmExNiAxNiAwIDAxMTYtMTZoNDhhMTYgMTYgMCAwMTE2IDE2djMyMGExNiAxNiAwIDAxLTE2IDE2ek0zNTIgNDMyaC00OGExNiAxNiAwIDAxLTE2LTE2Vjk2YTE2IDE2IDAgMDExNi0xNmg0OGExNiAxNiAwIDAxMTYgMTZ2MzIwYTE2IDE2IDAgMDEtMTYgMTZ6Jy8+PC9zdmc+",
      refresh:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHRpdGxlPlJlZnJlc2g8L3RpdGxlPjxwYXRoIGQ9J00zMjAgMTQ2czI0LjM2LTEyLTY0LTEyYTE2MCAxNjAgMCAxMDE2MCAxNjAnIGZpbGw9J25vbmUnIHN0cm9rZT0nY3VycmVudENvbG9yJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1taXRlcmxpbWl0PScxMCcgc3Ryb2tlLXdpZHRoPSczMicvPjxwYXRoIGZpbGw9J25vbmUnIHN0cm9rZT0nY3VycmVudENvbG9yJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS13aWR0aD0nMzInIGQ9J00yNTYgNThsODAgODAtODAgODAnLz48L3N2Zz4=",
      infoGray:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIGNsYXNzPSdpb25pY29uJyB2aWV3Qm94PScwIDAgNTEyIDUxMic+PHRpdGxlPkluZm9ybWF0aW9uIENpcmNsZTwvdGl0bGU+PHBhdGggZmlsbD0nI2FhYScgZD0nTTI1NiA1NkMxNDUuNzIgNTYgNTYgMTQ1LjcyIDU2IDI1NnM4OS43MiAyMDAgMjAwIDIwMCAyMDAtODkuNzIgMjAwLTIwMFMzNjYuMjggNTYgMjU2IDU2em0wIDgyYTI2IDI2IDAgMTEtMjYgMjYgMjYgMjYgMCAwMTI2LTI2em00OCAyMjZoLTg4YTE2IDE2IDAgMDEwLTMyaDI4di04OGgtMTZhMTYgMTYgMCAwMTAtMzJoMzJhMTYgMTYgMCAwMTE2IDE2djEwNGgyOGExNiAxNiAwIDAxMCAzMnonLz48L3N2Zz4=",
    },
  },
});
