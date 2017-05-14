const path = require('path');
const SVN = require('svn-spawn');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const del = require('del');
const webpack = require('webpack');
const shell = require('shelljs');

// console.log(process.argv);
// return;

const projectRoot = path.resolve(__dirname, './vue-test');
const svn = new SVN({
    cwd: projectRoot,//需要定位到项目root
});

function svnUpdate (upPath) {
    return new Promise((resolve, reject) => {
        svn.update(upPath, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

/**
 * 获取路径下svn变更的文件列表，忽略node_modules和dist文件夹
 * @param {String} targetPath
 * @return {Promise}
 */
function getStatus (targetPath) {
    return new Promise((resolve, reject) => {
        const files = [];
        svn.getStatus(targetPath, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(file => {
                    const filename = file.$.path;//文件名
                    if (/^(node_modules|dist)/.test(filename)) {
                        return;
                    }
                    const op = file['wc-status'].$.item;//变化类型added modified deleted unversioned
                    
                    files.push({
                        name: `[${op}] ${filename}`,
                        value: {
                            op, filename,
                        },
                    });
                });
            }
            resolve(files);
        });
    });
}

svnUpdate(projectRoot).then(() => {
    //生产环境
    const devWebpackConfig = require(path.resolve(projectRoot, './webpack.config.js'));
    const prodWebpackConfig = merge(devWebpackConfig, {
        devtool: false,
        watch: false,
        plugins: [
            new UglifyJSPlugin({
                compress: true,
                comments: false,
            }),
            new webpack.DefinePlugin({
                'process.env': '"production"',
            }),
        ],
    });
    return prodWebpackConfig;
}).then(prodWebpackConfig => {
    // del.sync([path.resolve(projectRoot, './dist/**/*')]);
    return prodWebpackConfig;
}).then(prodWebpackConfig => {
    //安装公共的
    return new Promise((resolve, reject) => {
        console.log('public node modules install beginning ...');
        shell.exec('npm install', {silent: false}, function (code, stdout, stderr) {
            if (code !== 0) {
                console.log(stderr);
                reject(stderr);
                return;
            }
            console.log('public node modules install completed ...');
            resolve(prodWebpackConfig);
        });
    });
}).then(prodWebpackConfig => {
    //安装项目的
    return new Promise((resolve, reject) => {
        process.chdir(projectRoot);//非常重要，切换当前工作目录
        console.log('project node modules install beginning ...');
        shell.exec('npm install', {silent: false}, function (code, stdout, stderr) {
            if (code !== 0) {
                console.log(stderr);
                reject(stderr);
                return;
            }
            console.log('project node modules install completed ...');
            resolve(prodWebpackConfig);
        });
    });
}).then(prodWebpackConfig => {
    return new Promise((resolve, reject) => {
        webpack(prodWebpackConfig, (err, stats) => {
            if (err) {
                console.error(err);
                return;
            }
            
            console.log(stats.toString({
                chunks: false,  // 使构建过程更静默无输出
                colors: true    // 在控制台展示颜色
            }));
            
            console.log('build completed ...');
            resolve();
        });
    });
}).then(() => {
    //检测dist目录下变化的文件列表
    getStatus(path.resolve(projectRoot, './dist')).then(files => {
        console.log(JSON.stringify(files));
    });
});
