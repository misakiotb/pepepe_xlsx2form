// content_script.js
// ページ側でwindow.postMessageされた値をフォームに入力する
console.log('content_script loaded');

// mappingはchrome.storage.localから取得して使う

window.addEventListener('message', function(event) {
  // logDebug('メッセージを受信しました', { type: event.type, data: event.data });
  
  if (event.data && event.data.type === 'EXCEL_TO_FORM') {
    const values = event.data.values;
    // logDebug('Excelから取得した値', values);
    
    // mapping取得
    chrome.storage.local.get(['mapping'], (result) => {
      // logDebug('ストレージからマッピングを取得', result);
      
      const mappingArr = (result && result.mapping) ? result.mapping : [];
      // logDebug('マッピング配列', mappingArr);
      
      // cellをキーにしたオブジェクトへ変換（例: "A1,A2" のような複数セル指定も考慮）
      const mappingObj = {};
      mappingArr.forEach(m => {
        // 複数セル（例: "A1,A2"）は "A1_A2" のようなキーとして扱う
        if (m.cell.includes(',')) {
          const key = m.cell.replace(/,/g, '_');
          mappingObj[key] = m;
        } else {
          mappingObj[m.cell] = m;
        }
      });
      
      // logDebug('変換後のマッピングオブジェクト', mappingObj);
      
      for (const key in values) {
        const val = values[key];
        const map = mappingObj[key];
        
        // logDebug(`処理中: キー=${key}, 値=`, val);
        // logDebug(`マッピング情報:`, map);
        
        if (!map) {
          // logDebug(`マッピングが見つかりません: ${key}`);
          continue;
        }
        
        // セレクターに#がなければ自動で付与
        const selector = map.formId.startsWith('#') ? map.formId : ('#' + map.formId);
        const el = document.querySelector(selector);
        
        // logDebug(`要素検索: セレクタ=${selector}, 要素=`, el);
        
        if (!el) {
          console.warn(`要素が見つかりません: ${selector}`); // エラーの代わりに警告を残す
          continue;
        }
        
        try {
          if (map.type === 'input' || map.type === 'textarea') {
            // logDebug(`input/textareaに値を設定: ${selector} = ${val}`);
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (map.type === 'select') {
            // logDebug(`selectの値を設定: ${selector} = ${val}`);
            el.value = val;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
          // logDebug(`値の設定が完了: ${selector}`, { value: el.value });
        } catch (error) {
          console.error(`値の設定中にエラーが発生: ${error.message}`, error); // エラーの代わりにコンソールエラーを残す
        }
      }
    });
  }
});
