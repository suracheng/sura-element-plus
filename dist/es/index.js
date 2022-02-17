import { CIcon } from 'c-plus/es/components';
export * from 'c-plus/es/components';

const components = [CIcon];
const install = (app) => {
    components.forEach((component) => app.use(component));
};
var index = {
    install,
};

export { index as default };
