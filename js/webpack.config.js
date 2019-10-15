module.exports = {
    mode: 'development',
    // Example setup for your project:
    // The entry module that requires or imports the rest of your project.
    // Must start with `./`!
    // entry: ['./private/login.js', './private/kit.js','./private/helpers.js'],
    entry:  {
        login : './private/login.js',
        kit : './private/kit.js',
        helper: './private/helpers.js',
        config: './private/config.js'
    },
    // Place output files in `./dist/my-app.js`
    output: {
        // library: "login",
        // libraryTarget: "var",
        path: __dirname + '/public/',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },    
    module: {
        rules: [
            {
                test: /\.(json|js)$/,
				exclude: /node_modules/
            },
        ],
    },
};