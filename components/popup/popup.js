Component({
  data: {},
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    epnames: {
      type: Array,
      value: [],
    },
  },
  methods: {
    onClose: () => {
      this.$emit("close");
    },
    onConfirm: () => {
      this.$emit("confirm");
    },
  },
});
