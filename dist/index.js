(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CPlus = {}, global.Vue));
})(this, (function (exports, vue) { 'use strict';

  const withInstall = (comp) => {
      const compNew = comp;
      compNew.install = function (app) {
          app.component(compNew.name, comp);
      };
      return compNew;
  };

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

  const CIcon = withInstall(script);

  const components = [CIcon];
  const install = (app) => {
      components.forEach((component) => app.use(component));
  };
  var index = {
      install,
  };

  exports.CIcon = CIcon;
  exports["default"] = index;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
