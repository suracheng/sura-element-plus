import { withInstall } from 'c-plus/es/utils/with-intall';
import { defineComponent, computed, openBlock, createElementBlock, normalizeStyle, renderSlot } from 'vue';

const iconProps = {
    size: {
        type: Number,
    },
    color: {
        type: String,
    },
};

var script = defineComponent({
    name: 'CIcon',
    props: iconProps,
    setup(props) {
        const style = computed(() => {
            if (!props.size && !props.color) {
                return {};
            }
            return Object.assign(Object.assign({}, (props.size ? { 'font-size': props.size + 'px' } : {})), (props.color ? { 'color': props.color } : {}));
        });
        return { style };
    }
});

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("i", {
    class: "z-icon",
    style: normalizeStyle(_ctx.style)
  }, [
    renderSlot(_ctx.$slots, "default")
  ], 4 /* STYLE */))
}

script.render = render;
script.__file = "packages/components/icon/src/icon.vue";

const CIcon = withInstall(script);

export { CIcon, CIcon as default };
