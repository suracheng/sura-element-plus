"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withInstall = void 0;
const withInstall = (comp) => {
    const compNew = comp;
    compNew.install = function (app) {
        app.component(compNew.name, comp);
    };
    return compNew;
};
exports.withInstall = withInstall;
