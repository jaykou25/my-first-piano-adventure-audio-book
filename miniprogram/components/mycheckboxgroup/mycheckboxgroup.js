Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true,
  },
  properties: {
    multi: {
      type: Boolean,
      value: true,
      observer: "_multiChange",
    },
    extClass: {
      type: String,
      value: "",
    },
    prop: {
      type: String,
      value: "",
    },
  },
  data: {
    targetList: [],
    parentCell: null,
  },
});
