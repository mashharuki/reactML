/**
 * 文字認識サーバー用のファイル
 */

// 必要なモジュールを読み込む
const path = require('path');
const fs = require('fs');
const express = require('express');
const svm = require('node-svm');

// モデルを指定
const SVM_MODEL = path.join(__dirname, 'database', 'image-model.svm');
// サーバーポート
const portNo = 3001;

// Webサーバの起動
const app = express();
// 起動する
app.listen(portNo, () => {
    console.log('起動しました', `http://localhost:${portNo}`);
});

// 学習モデルの読込
const modelJSON = fs.readFileSync(SVM_MODEL, 'utf-8');
const model = JSON.parse(modelJSON);
const clf = svm.restore(model);

// エラー率を取得するAPIの定義
app.get('/api/predict', (req, res) => {

    const px = req.query.px;

    if (!px) {
        res.json({status: false});
        return
    }

    const pxa = px.split('').map(v => parseInt('0x' + v) * 16);
    console.log('受信:', pxa.join(':'));
    // 予測する
    clf.predict(pxa).then((label) => {
        res.json({status: true, label});
        console.log('分類:', label);
    });
});

// ルーティングの設定を追記する。
app.use('/', express.static('./public'));
