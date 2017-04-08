module.exports = function(config) {
    config.set({
        logLevel: config.LOG_DEBUG,
        basePath: '../..',
        frameworks: ['jasmine'],
        browsers: ['Chrome', 'IE'],
        files: [
            'js/*.js',
            'spec/*.js'
        ],
        preprocessors: {
            'js/*.js': ['inject-html'],
            'spec/*.js': ['inject-html']
        },
        injectHtml: {
            file: 'test.html'
        },
        singleRun: true
    });
};