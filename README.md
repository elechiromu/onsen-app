# 🌸 温泉記録帳 🌸

温泉巡りを記録・管理するためのWebアプリケーションです。

## 主な機能

### 📝 温泉記録管理
- 温泉名、住所、訪問日の記録
- 泉質の詳細記録（複数選択可）
  - 単純泉、塩化物泉、硫酸塩泉、炭酸水素塩泉、硫黄泉、酸性泉など
- 源泉温度、pH値の記録
- 施設情報（露天風呂、サウナ、休憩室、レストラン、駐車場）
- 評価システム（お湯の質、清潔さ、アクセス）
- 入浴料金、営業時間、混雑度の記録
- アメニティ情報
- メモ・感想
- 写真の保存（複数枚、URLで追加）

### 📊 統計機能
- 総訪問回数、訪問した温泉数の表示
- 平均評価の表示
- よく訪れる温泉TOP5
- 月別訪問回数グラフ
- 泉質別訪問回数グラフ

### 💾 データ管理
- Firebase/Firestoreでクラウド保存
- クロスデバイス同期
- 編集・削除機能

## セットアップ手順

### 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: onsen-app）
4. Google Analytics は任意で設定
5. プロジェクトが作成されたら、Webアプリを追加

### 2. Firestore Database の設定

1. Firebase Console で「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. テストモードで開始（後でルールを変更可能）
4. ロケーションを選択（asia-northeast1 推奨）

### 3. Authentication（認証）の設定

1. Firebase Console で「Authentication」を選択
2. 「始める」ボタンをクリック
3. 「Sign-in method」タブをクリック
4. 「Google」を選択
5. 「有効にする」をオンに切り替え
6. プロジェクトのサポートメールを選択
7. 「保存」をクリック

### 4. Firebase 設定の取得と設定

1. Firebase Console のプロジェクト設定から、Webアプリの設定情報を取得
2. `src/firebase.js` ファイルを開く
3. 取得した設定情報を以下のように入力:

```javascript
const firebaseConfig = {
  apiKey: "あなたのAPIキー",
  authDomain: "あなたのプロジェクト.firebaseapp.com",
  projectId: "あなたのプロジェクトID",
  storageBucket: "あなたのプロジェクト.appspot.com",
  messagingSenderId: "あなたのメッセージングID",
  appId: "あなたのアプリID"
};
```

### 4. 依存パッケージのインストール

```bash
npm install
```

### 5. 開発サーバーの起動

```bash
npm start
```

ブラウザで `http://localhost:3000` が自動的に開きます。

### 6. Vercel へのデプロイ

#### GitHub にプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/onsen-app.git
git push -u origin main
```

#### Vercel でデプロイ

1. [Vercel](https://vercel.com/) にアクセスしてサインアップ/ログイン
2. 「New Project」をクリック
3. GitHub リポジトリを選択
4. 「Deploy」をクリック

数分後、アプリが公開されます！

## 使い方

### Googleアカウントでログイン

1. アプリを開くとログイン画面が表示されます
2. 「Googleアカウントでログイン」ボタンをクリック
3. Googleアカウントを選択してログイン
4. ログインすると、自分の温泉記録だけが表示されます

### 温泉の記録

1. 「+ 新しい温泉を記録」ボタンをクリック
2. 必要な情報を入力
   - 温泉名と訪問日は必須
   - 泉質は複数選択可能
   - 評価はスライダーで1〜5段階
   - 写真はURLで追加（複数枚可能）
3. 「記録する」ボタンで保存

### 統計の確認

1. 「📊 統計を見る」ボタンをクリック
2. 月別訪問回数、泉質別訪問回数などのグラフが表示されます
3. よく訪れる温泉のランキングも確認できます

### 記録の編集・削除

- 各温泉カードの「編集」ボタンで内容を変更
- 「削除」ボタンで記録を削除（確認ダイアログが表示されます）

## 技術スタック

- React 18
- Firebase / Firestore
- Recharts (グラフ表示)
- date-fns (日付処理)

## デザイン

女性らしい優しいデザインを採用:
- パステルカラー（ピンク、ラベンダー）
- 丸みのあるボタンとカード
- グラデーション効果
- 温泉らしい雰囲気

## セキュリティルール

本番環境では、Firestoreのセキュリティルールを以下のように設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /onsens/{onsen} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

Firebase Console の「Firestore Database」→「ルール」タブで設定できます。

## 初回起動時の注意

初回起動時、Firestoreのインデックスが必要な場合があります。エラーが表示された場合は、エラーメッセージ内のリンクをクリックしてインデックスを自動作成してください（数分かかります）。

## ライセンス

MIT License
