export const withInstall = (comp) => {
    const compNew = comp;
    compNew.install = function (app) {
        app.component(compNew.name, comp);
    };
    return compNew;
};
