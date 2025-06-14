# ペペペ：Excel2Form（Chrome拡張）

## 概要
Excelファイル（非構造化・ワード的な使い方）から、Webフォームへ指定セルの内容を自動で入力するChrome拡張です。

- 指定セル（例：B13, B19, D35 など）とフォーム項目をマッピングして自動入力
- 業務求人などの定型フォーム入力作業を効率化
- xlsx.full.min.js をローカル同梱し、CSP制限にも対応

## 使い方

1. **拡張のインストール**
   - Chromeの「拡張機能」画面で「パッケージ化されていない拡張機能を読み込む」から、このフォルダを選択

2. **フォームページを開く**
   - 例: https://www.heroz-job.com/i など、対応フォームを開いておく

3. **拡張アイコンをクリック**
   - popup画面が表示される

4. **Excelファイルを選択し「フォームに入力」ボタンを押す**
   - 指定セルの値が自動でフォーム各項目に入力される

## マッピング仕様
| Excelセル | フォーム項目 | フォーム要素ID | 備考 |
|:---------:|:------------|:--------------|:-----|
| B13       | タイトル    | job_title     | input |
| B19       | 業務内容    | job_description| textarea |
| B20       | 業務内容（変更範囲）| job_description_change_range | textarea |
| B21       | 応募資格（必須スキル・経験）| job_requirement | textarea |
| B22       | 歓迎スキル・経験 | job_welcome_skill | textarea |
| B32       | 勤務地      | job_working_place | input |
| D35       | 転勤の有無  | job_transfer   | select |
| B33       | 転勤の範囲  | job_transfer_range | textarea |
| B34       | リモートワークの詳細 | job_remote_detail | textarea |
| B35       | 受動喫煙対策備考 | job_passive_smoking_note | textarea |
| B24       | 給与備考    | job_salary_detail | textarea |
| B28       | 昇給・賞与  | job_salary_increase_and_bonus | textarea |
| D23       | 就業時間    | job_working_hours | input |
| D24       | 休憩時間    | job_break_time | input |
| B30       | 休日・休暇  | job_day_off | textarea |
| B26,B27   | 時間外労働  | job_overtime | textarea（2セル結合）|
| D16       | 試用期間詳細 | job_trial_detail | textarea |
| B29       | 制度・福利厚生 | job_benefit_system | textarea |
| B31       | 選考方法    | job_selection_process | textarea |
| B36       | 魅力ポイント | job_attractive_points | textarea |

## ディレクトリ構成
```
Excel-to-Form/
├── manifest.json            # Chrome拡張の定義
├── popup.html               # 拡張のUI
├── popup.js                 # Excel読み込み・送信ロジック
├── content_script.js        # フォーム自動入力ロジック
├── xlsx.full.min.js         # Excel解析ライブラリ（ローカル）
├── background.js            # バックグラウンド（空）
├── icon16.png, icon48.png, icon128.png # アイコン
├── sample_data/             # サンプルExcel, HTML等
└── README.md                # このファイル
```

## 注意事項・ヒント
- Excelファイルは「.xlsx」形式のみ対応
- xlsx.full.min.jsは必ずローカルに配置し、popup.htmlから読み込むこと（CSP対策）
- フォームのIDや構造が変わった場合は、content_script.jsのmappingを修正
- 拡張の更新後はChromeの拡張管理画面で「更新」ボタンを押すこと

## 開発・カスタマイズ
- mappingの追加・変更は `content_script.js` を編集
- セルの追加や複雑な結合ルールもロジック追加で対応可能
- エラー処理やUI改善も自由にカスタマイズ可能

---

何か不明点や改善要望があれば、お気軽にご相談ください！
