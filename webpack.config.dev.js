const { merge } = require("webpack-merge");
const sharedConfig = require("./webpack.config");
module.exports = merge(sharedConfig, {
    devtool: "source-map",
    mode: "development",
    optimization: {
        minimize: false,
    },
});