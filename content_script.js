// content_script.js
// ページ側でwindow.postMessageされた値をフォームに入力する
console.log('content_script loaded');

// mappingはchrome.storage.localから取得して使う

window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'EXCEL_TO_FORM') {
    const values = event.data.values;
    // mapping取得
    chrome.storage.local.get(['mapping'], (result) => {
      const mappingArr = (result && result.mapping) ? result.mapping : [];
      // cellをキーにしたオブジェクトへ変換（B26,B27のような複数セルも考慮）
      const mappingObj = {};
      mappingArr.forEach(m => {
        // 複数セル（例: B26,B27）はB26_B27として扱う
        if (m.cell.includes(',')) {
          const key = m.cell.replace(/,/g, '_');
          mappingObj[key] = m;
        } else {
          mappingObj[m.cell] = m;
        }
      });
      for (const key in mappingObj) {
        const val = values[key] || '';
        const map = mappingObj[key];
        if (!map) continue;
        // セレクターに#がなければ自動で付与
        const selector = map.formId.startsWith('#') ? map.formId : ('#' + map.formId);
        const el = document.querySelector(selector);
        if (!el) continue;
        if (map.type === 'input' || map.type === 'textarea') {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (map.type === 'select') {
          el.value = val;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  }
});
