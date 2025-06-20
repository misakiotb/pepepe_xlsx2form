# ペペペ:Excel2Form (Chrome拡張)

## 概要
このChrome拡張機能は、Excelファイルから指定したセルのデータを読み取り、Webフォームの対応するフィールドに自動で入力します。
手作業でのコピー＆ペーストを削減し、定型的なフォーム入力作業を効率化することを目的としています。
エクセル方眼のような使い方をされている非構造化データであっても、セル指定でマッピングすることで、手軽に一括コピペができます。

- **マッピング**: ExcelのセルとWebフォームの項目をJSONファイルでマッピングします。
- **汎用性**: 様々なExcelファイルとWebフォームに対応可能です。
- **効率化**: 面倒な繰り返し入力を自動化します。

## 使い方

1.  **拡張機能のインストール**:
    *   Chromeウェブストアから「Excel to Form」をインストールします。（※ストア公開後）
    *   または、開発者モードでこのリポジトリのソースコードを読み込みます。
        1.  このリポジトリをダウンロードまたはクローンします。
        2.  Chromeブラウザで `chrome://extensions` を開きます。
        3.  「デベロッパーモード」をオンにします。
        4.  「パッケージ化されていない拡張機能を読み込む」ボタンをクリックし、ダウンロードしたフォルダを選択します。

2.  **マッピングファイルの準備**:
    *   入力元のExcelファイルと入力先のWebフォームに合わせて、マッピング情報を記述したJSONファイルを作成します。
    *   詳細は「マッピング仕様」セクションを参照してください。
    *   サンプルとして `docs/sample_form_mapping.json` があります。

3.  **拡張機能の設定**:
    *   Chromeの拡張機能アイコンをクリックしてポップアップを開きます。
    *   初回起動時、または「マッピングを再設定」リンクから、作成したマッピングJSONファイルをアップロードします。

4.  **フォーム入力の実行**:
    *   データ入力対象のWebフォームのページを開きます。
    *   拡張機能のポップアップを開きます。
    *   「Excelファイルを選択」ボタンから、データが記載されたExcelファイルを選択します。
    *   「フォームに入力」ボタンをクリックすると、マッピングに従ってExcelのデータがフォームに自動入力されます。

## マッピング仕様

マッピングファイル (JSON形式) は、以下の構造を持つオブジェクトの配列です。

```json
[
  {
    "label": "項目名（任意）",
    "cell": "A1",
    "formId": "form_element_id",
    "type": "input"
  },
  {
    "label": "複数セル結合項目",
    "cell": "B2,B3",
    "formId": "another_element_id",
    "type": "textarea"
  }
  // ... 他のマッピング
]
```

-   `label`: マッピング項目を識別するための任意の名前です（拡張機能の動作には影響しません）。
-   `cell`:
    -   Excelシート上のセル番地を指定します（例: "D3", "P3"）。
    -   複数のセルを結合して1つの項目に入力する場合は、カンマ区切りで指定します（例: "D4,D5"）。結合された値は改行で区切られて入力されます。
-   `formId`: Webフォーム上の入力要素のID属性の値を指定します。
-   `type`: 入力要素の種類を指定します。現在は `input` (テキストボックスなど)、`textarea` (複数行テキストエリア)、`select` (ドロップダウンリスト) に対応しています。

**サンプルマッピングファイル:** `docs/sample_form_mapping.json`
**サンプルフォーム:** `docs/sample_form.html`
**サンプルExcel:** [`docs/sample_excel.xlsx`](docs/sample_excel.xlsx) (このファイルをダウンロードして利用できます)

## ディレクトリ構成 (主要ファイル)
```
Excel-to-Form/
├── manifest.json            # Chrome拡張の定義
├── popup.html               # 拡張のUI (ファイル選択、実行ボタンなど)
├── popup.js                 # Excel読み込み、マッピングに基づいたデータ抽出、content_scriptへの送信ロジック
├── content_script.js        # Webページに挿入され、フォーム自動入力を行うロジック
├── xlsx.full.min.js         # Excelファイル解析ライブラリ (SheetJS)
├── icons/                   # アイコン画像
└── docs/                    # ドキュメント、サンプルファイル
    ├── sample_form.html
    └── sample_form_mapping.json
```

## 注意事項
-   Excelファイルは「.xlsx」形式のみ対応しています。
-   マッピングファイルで指定する `formId` は、入力対象WebフォームのHTML要素の `id` 属性と正確に一致している必要があります。ブラウザの開発者ツールなどで確認してください。
-   拡張機能の更新後は、Chromeの拡張機能管理画面 (`chrome://extensions`) で本拡張機能の「更新」ボタンを押すか、一度無効化してから再度有効化してください。

## 開発・カスタマイズ
-   対応するフォーム要素の種類を増やしたい場合は、`content_script.js` の値設定ロジックを拡張してください。
-   より複雑なデータ加工や入力ルールが必要な場合は、`popup.js` (データ抽出部分) や `content_script.js` (入力部分) を適宜修正してください。

---

ご意見、ご要望、バグ報告などがありましたら、[GitHub Issues](https://github.com/misakiotb/pepepe_xlsx2form/issues)までお知らせください。
