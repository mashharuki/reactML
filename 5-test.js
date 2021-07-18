/**
 * 機械学習済みモデルを検証するためのファイル
 */

// 必要なモジュールを読み込む
const fs = require('fs');
const path = require('path');
const svm = require('node-svm');

// 学習済みデータを読み込む
const json = fs.readFileSync(path.join(__dirname, 'database', 'image-model.svm'), 'utf-8');
// json形式で変数を用意する。
const model = JSON.parse(json);
const clf = svm.restore(model);

// テストデータを読み込む関数を呼び出す。
const testData = loadCSV('image-test.csv');
// 毎行データをテストしてエラー率を調べる
let count = 0;
let ng = 0;
// テストデータに対してエラー率を調べる
testData.forEach(ex => {
    const x = ex[0];
    const label = ex[1];
    const pre = clf.predictSync(x);
    // ラベルと回答が間違っていた場合
    if (label !== pre) {
        ng++;
        console.log('ng=', label, pre);
    }
    count++;
});
console.log('エラー率=', (ng / count) * 100);

// テストデータを読み込む関数
function loadCSV (fname) {
    const csv = fs.readFileSync(fname, 'utf-8');
    // 改行コードで分割する。
    const lines = csv.split('\n');
    // データを整形する。
    const data = lines.map(line => {
        const cells = line.split(',');
        const x = cells.map(v => parseInt(v));
        const label = x.shift();
        return [x, label]
    });
    return data;
}
