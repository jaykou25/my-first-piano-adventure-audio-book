Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true,
  },
  properties: {
    multi: {
      type: Boolean,
      value: true,
    },
    checked: {
      type: Boolean,
      value: false,
    },
    value: {
      type: String,
      value: "",
    },
    label: {
      type: String,
      value: "",
    },
    extClass: {
      type: String,
      value: "",
    },
  },
  data: {},
  relations: {
    "weui-miniprogram/checkbox-group/checkbox-group": {
      type: "ancestor",
      linked(target) {
        this.data.group = target;
      },
      unlinked() {
        this.data.group = null;
      },
    },
  },
  methods: {
    setMulti(multi) {
      this.setData({
        multi,
      });
    },
    setOuterClass(className) {
      this.setData({
        outerClass: className,
      });
    },
    checkedChange() {
      if (this.data.multi) {
        const checked = !this.data.checked;
        this.setData({
          checked,
        });
        if (this.data.group) {
          this.data.group.checkedChange(checked, this);
        }
      } else {
        const checked = this.data.checked;
        if (checked) return;
        this.setData({
          checked: true,
        });
        if (this.data.group) {
          this.data.group.checkedChange(checked, this);
        }
      }
      this.triggerEvent("change", {
        value: this.data.value,
        checked: this.data.checked,
      });
    },
  },
});
