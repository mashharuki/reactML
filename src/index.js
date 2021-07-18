/**
 * メインコンポーネント用のファイル
 */

// 必要なモジュールを読み込む
import React from 'react';
import ReactDOM from 'react-dom';
import request from 'superagent';
import styles from './styles';

// 定数の定義
const numRows = 28;
const numCols = 28;
const numPixels = numRows * numCols;
const sizeRow = 10;
const sizeCol = 10;

/**
 * メインコンポーネント
 */
class TegakiApp extends React.Component {
    // コンストラクター関数
    constructor (props) {
        super(props)
        // 初期値設定
        this.canvas = this.ctx = null
        // ステート変数を用意する。
        this.state = {
            // マウスが押されているか
            isDown: false,
            // 画像データ
            pixels: null,
            // 予測結果
            label: '?'
        };
    }

    // コンポーネントがマウントされる直前に処理する関数
    componentDidMount () {
        // 関数を呼び出す。
        this.clearPixels()
    }

    // 画像データをクリアする関数
    clearPixels() {
        // 画像データを格納する配列
        const p = [];
        // 全ピクセルに0を挿入する。
        for (let i = 0; i < numPixels; i++) p.push(0);
        // ステート変数を更新する。
        this.setState({
            pixels: p,
            label: '?'
        });
    }

    // コンポーネントが描画された後に処理される関数
    componentDidUpdate () {
        // キャンパスを描く関数
        this.drawCanvas();
    }

    // キャンパスを描画する関数
    drawCanvas () {
        if (!this.canvas) return;
        if (!this.ctx) this.ctx = this.canvas.getContext('2d');
        this.ctx.clearRect(0, 0, 280, 280);
        // 補助線を描画する。
        this.ctx.strokeStyle = 'silver';
        this.ctx.moveTo(140, 0);
        this.ctx.lineTo(140, 280);
        this.ctx.moveTo(0, 140);
        this.ctx.lineTo(280, 140);
        this.ctx.stroke();
        // ドットを描画する。
        this.ctx.fillStyle = 'blue';
        // ピクセル1つ1つに対して描画する。
        for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
                const p = this.state.pixels[y * numRows + x];
                if (p === 0) continue;
                const xx = x * sizeCol;
                const yy = y * sizeRow;
                this.ctx.fillRect(xx, yy, sizeCol, sizeRow);
            }
        }
    }

    // マウスで動きがあった時に処理する関数(下にスライド)
    doMouseDown (e) {
        e.preventDefault();
        // ステート変数更新
        this.setState({isDown: true});
    }

    // マウスで動きがあった時に処理する関数(上にスライド)
    doMouseUp (e) {
        e.preventDefault();
        // ステート変数を更新
        this.setState({isDown: false});
        // 文字認識を行うための関数を呼び出す
        this.predictLabel();
    }

    // マウスで動きがあった時に処理する関数
    doMouseMove(e) {
        e.preventDefault();
        if (!this.state.isDown) return;
        const eve = e.nativeEvent;
        const b = e.target.getBoundingClientRect();
        const rx = eve.clientX - b.left;
        const ry = eve.clientY - b.top;
        const x = Math.floor(rx / sizeCol);
        const y = Math.floor(ry / sizeRow);
        const pixels = this.state.pixels;
        pixels[y * numRows + x] = 0xF;
        // ステート変数を更新する。
        this.setState({pixels});
    }

    // 文字認識を行うための関数
    predictLabel () {
        const px = this.state.pixels.map(v => v.toString(16)).join('');
        // APIを使ってリクエストを送信する。
        request
          .get('/api/predict')
          .query({px})
          .end((err, res) => {
              if (err) return
              if (res.body.status) {
                   this.setState({label: res.body.label})
              }
          });
    }

    // レンダリング
    render () {
        // 描画する
        return (
            <div style={styles.app}>
                <canvas ref={(e) => { this.canvas = e }} width={280} height={280} style={styles.canvas}
                  onMouseDown={e => this.doMouseDown(e)}
                  onMouseMove={e => this.doMouseMove(e)}
                  onMouseUp={e => this.doMouseUp(e)}
                  onMouseOut={e => this.doMouseUp(e)} />
                <p style={styles.predict}>予測: {this.state.label}</p>
                <button onClick={e => this.clearPixels()}>クリア</button>
            </div>
        )
      }
}

// DOMにメインコンポーネントを書き込む
ReactDOM.render(
    <TegakiApp />,
    document.getElementById('root')
);