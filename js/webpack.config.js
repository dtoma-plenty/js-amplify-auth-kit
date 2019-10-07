module.exports = {
    mode: 'development',
    // Example setup for your project:
    // The entry module that requires or imports the rest of your project.
    // Must start with `./`!
    entry: './private/main.js',
    // Place output files in `./dist/my-app.js`
    output: {
        library: "main",
        libraryTarget: "var",
        path: __dirname + '/public/',
        filename: 'main.js',
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },    
    module: {
        rules: [
            {
                test: /\.json$/
            },
        ],
    },
};