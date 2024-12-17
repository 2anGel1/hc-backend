const path = require('path');

module.exports = {
    entry: {
        main: './public/js/main.js',
        event: './public/js/event.js',
        staff: './public/js/staff.js',
        zone: './public/js/zone.js',
        terminal: './public/js/terminal.js',
    },
    output: {
        path: path.resolve(__dirname, 'public/bundle'),
        filename: '[name].bundle.js',
    },
    mode: 'production',
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: 'vendors',
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // Si tu utilises Babel (facultatif)
                    options: {
                    },
                },
            },
        ],
    },
};
