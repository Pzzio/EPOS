module.exports = function(config) {
    config.set({
        logLevel: config.LOG_DEBUG,
        basePath: '../..',
        frameworks: ['jasmine'],
        plugins: ['babel-preset-es2015'],
        browsers: ['Chrome', 'IE'],
        files: [
            'js/*.js',
            'spec/*.js'
        ],
        preprocessors: {
            'js/*.js': ['babel', 'inject-html'],
            'spec/*.js': ['babel', 'inject-html']
        },
        babelPreprocessor: {
            options: {
                presets: ['es2015'],
                sourceMap: 'inline'
            },
            filename: function (file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function (file) {
                return file.originalPath;
            }
        },
        injectHtml: {
            file: 'test.html'
        },
        singleRun: true
    });
};