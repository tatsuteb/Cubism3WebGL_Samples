# Cubism3WebGL_Samples

Live2D Cubism SDK for Web の使い方を勉強するために作ったサンプル集です。
少しずつサンプルを増やしていく予定です。

# ビルド方法

1. このリポジトリをクローン
1. Live2DのSDKダウンロードページから、[Cubism SDK for Web](https://live2d.github.io/#web)をダウンロード
1. ダウンロードしたCubism SDK for WebのCore、Framework、Resources フォルダの中身を、それぞれ、./Core、./Framework、./Samples/Resources フォルダにコピー
1. クローンしたリポジトリのルートで、以下のコマンドを実行
    ```
    npm install
    npm build-framework
    npm build-sample_01
    ```

# 実行方法

以下は、Visual Studio Code を使った実行方法です。

1. Visual Studio Code に [Live Server](https://github.com/ritwickdey/vscode-live-server) をインストール
1. ./Samples/Sample_01/wwwroot/index.html を右クリック、コンテキストメニューの[Open with Live Server]を選択

# 関連記事

[Qiita - Cubism 3 SDK for Web でモデルを表示する](https://qiita.com/tatsuteb/items/2c00855968acd9f4b7df)