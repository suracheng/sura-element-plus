'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var withIntall = require('c-plus/lib/utils/with-intall');
var vue = require('vue');

const iconProps = {
    size: {
        type: Number,
    },
    color: {
        type: String,
    },
};

var script = vue.defineComponent({
    name: 'CIcon',
    props: iconProps,
    setup(props) {
        const style = vue.computed(() => {
            if (!props.size && !props.color) {
                return {};
            }
            return Object.assign(Object.assign({}, (props.size ? { 'font-size': props.size + 'px' } : {})), (props.color ? { 'color': props.color } : {}));
        });
        return { style };
    }
});

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (vue.openBlock(), vue.createElementBlock("i", {
    class: "z-icon",
    style: vue.normalizeStyle(_ctx.style)
  }, [
    vue.renderSlot(_ctx.$slots, "default")
  ], 4 /* STYLE */))
}

script.render = render;
script.__file = "packages/components/icon/src/icon.vue";

const CIcon = withIntall.withInstall(script);

exports.CIcon = CIcon;
exports["default"] = CIcon;
