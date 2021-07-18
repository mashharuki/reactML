/**
 * 手書きデータベースをダウンロードする処理ファイル
 */

// メイン処理 - 逐次ダウンロードする。
(async () => {
    // 必要なモジュールを読み込む
    const path = require('path');
    // ベースとなるＵＲＬ
    const base = 'http://yann.lecun.com/exdb/mnist';
    // ダウンロード処理関数を呼び出す。
    await download(
        base + '/t10k-images-idx3-ubyte.gz',
        path.join(__dirname, 'database', 'images-idx3')
    );
    // ダウンロード処理関数を呼び出す。
    await download(
        base + '/t10k-labels-idx1-ubyte.gz',
        path.join(__dirname, 'database', 'labels-idx1')
    );
})();

// ダウンロードと解凍を行う処理
async function download (url, savepath) {
    console.log('開始:', url)
    const tmp = savepath + '.gz'
    // ファイルダウンロードを行う関数を呼び出す。
    await downloadPromise(url, tmp);
    // ファイルを解凍する関数を呼び出す。
    await gunzip(tmp, savepath);
    console.log('ok:', savepath);
}

// ファイルのダウンロードを行う関数
function downloadPromise (url, savepath) {
    return new Promise((resolve, reject) => {
        // 必要なモジュールを読み込む
        const http = require('http');
        const fs = require('fs');
        if (fs.existsSync(savepath)) return resolve();
        //　出力ファイル
        const outfile = fs.createWriteStream(savepath);
        http.get(url, (res) => {
            res.pipe(outfile);
            res.on('end', () => {
                outfile.close()
                resolve()
            });
        })
        .on('error', (err) => reject(err));
  });
}

// ファイルの解凍を行う関数
function gunzip (infile, outfile) {
    return new Promise((resolve, reject) => {
        // 必要なモジュールを読み込む
        const zlib = require('zlib');
        const fs = require('fs');
        // ファイルを読み込む
        const rd = fs.readFileSync(infile);
        // 解凍処理
        zlib.gunzip(rd, (err, bin) => {
            if (err) reject(err);
            // ファイルに書き込む
            fs.writeFileSync(outfile, bin);
            resolve();
        });
    });
}
