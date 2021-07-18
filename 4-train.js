/**
 * 機械学習を実行するファイル
 */

// 必要なモジュールを読み込む
const fs = require('fs');
const path = require('path');
const svm = require('node-svm');

// CSVファイルを読み込む
const data = loadCSV('image-train.csv');

// node-svmを利用してデータを学習する
const clf = new svm.CSVC();
// 学習実行
clf.train(data)
    .progress(progress => {
        console.log('訓練: %d%', Math.round(progress * 100))
    })
    .spread((model, report) => {
        // 学習データを保存する
        const json = JSON.stringify(model);
        // jsonファイルを出力する。
        fs.writeFileSync(path.join(__dirname, 'databas', 'image-model.svm'),json);
        console.log('完了');
    });

// CSVファイルを読み込んでnode-svmの形式に変換する関数
function loadCSV (fname) {
    // csvファイルを読み込む
    const csv = fs.readFileSync(fname, 'utf-8');
    // 改行コードで分割する。
    const lines = csv.split('\n');
    // 機械学習用にデータを整形する
    const data = lines.map(line => {
        const cells = line.split(',');
        const x = cells.map(v => parseInt(v));
        const label = x.shift();
        return [x, label]
    });
    return data;
}
