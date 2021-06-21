Component({
  data: {},
  properties: {
    title: {
      type: String,
      value: "Hello",
    },
    menuIcon: {
      type: String,
      value: "",
    },
  },
  attached() {
    wx.getSystemInfo().then((res) => {
      const isIos = res.system.indexOf("iOS") > -1;
      this.setData({
        statusHeight: res.statusBarHeight,
        navHeight: isIos ? 40 : 48,
      });
    });
  },
  methods: {
    shortcutListTap: function (event) {
      this.setData({
        toView: event.target.dataset.index,
        currentIndex: event.target.dataset.index,
      });
    },
  },
});
