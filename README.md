# STEP新着情報 Version 2.1（スマートフォン改善版）

Google Blogger の記事を、Wixホームページ内に写真付きカードとして表示するための
GitHub Pages用ファイル一式です。

## 対象ブログ

https://stepkobetsublog.blogspot.com/

## ファイル

- `index.html`
- `styles.css`
- `app.js`

3ファイルを `stepkobetsu-hub/step-news` リポジトリの直下に置きます。

## 主な仕様

- 最新6件
- PC：3列
- タブレット：2列
- スマートフォン：1列
- 記事の最初の画像を自動表示
- 画像がない場合は `STEP NEWS`
- 公開5日以内は `NEW`
- Bloggerのラベルをカテゴリーとして表示
- `重要` または `重要なお知らせ` ラベルの記事を先頭へ表示
- 記事を押すとBlogger本文を別タブで開く
- Wixのiframe埋め込み対応

## GitHub Pagesの有効化

1. GitHubの `step-news` リポジトリを開く
2. `Settings`
3. 左側の `Pages`
4. `Build and deployment`
5. Source：`Deploy from a branch`
6. Branch：`main`
7. Folder：`/(root)`
8. `Save`

公開URL：

https://stepkobetsu-hub.github.io/step-news/

## Wixへの埋め込み

1. WixのHTML埋め込み部品を選択
2. `コードを入力`
3. `ウェブアドレス`を選択
4. 次のURLを入力

https://stepkobetsu-hub.github.io/step-news/

5. Wix上の枠を横いっぱいに広げる
6. 高さはPC表示で約900～1050pxから調整
7. テストサイトでPC・スマートフォンを確認
8. 問題なければ公開

## Bloggerでの運用

通常どおり、写真・タイトル・本文を入れて公開します。
特別な操作は不要です。

重要記事として上へ出したい場合は、Bloggerの記事ラベルに
`重要` または `重要なお知らせ` を追加します。


## Version 2.1 のスマートフォン表示

- 見出しを画面上部に固定
- 最新4記事を小さな画像アイコンとして横4列表示
- アイコンをタップすると下の記事内容が切り替わる
- 選択中の記事はオレンジ枠
- Wixと埋め込みページの二重縦スクロールを避ける設計
- パソコン・タブレット表示は従来のカード形式を維持

## 更新方法

GitHubのリポジトリ直下にある次の3ファイルを置き換えます。

- `index.html`
- `styles.css`
- `app.js`

`README.md`も一緒に上書きして構いません。
