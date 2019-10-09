
var path = require('path');

module.exports = {

    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: 'development',

    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: './Samples/Sample_02/ts/main.ts',

    output: {
        filename : 'index.js',
        path: path.join(__dirname, './Samples/Sample_02/wwwroot/js')
    },

    module: {
        rules: [
            {
                // 拡張子 .ts の場合
                test: /\.ts$/,

                // TypeScriptをコンパイルする
                use: 'ts-loader'
            }
        ]
    },

    // ソースマップを含めた状態で出力
    devtool: 'inline-source-map',

    // import 文で .ts ファイルを解決するため
    resolve: {
        extensions: [
            '.ts',
        ]
    }
}