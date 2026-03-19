// popup.js
// ユーザーがExcelファイルを選択し、「フォームに入力」ボタンを押したときの処理

// --- 初回設定管理 ---
window.addEventListener('DOMContentLoaded', async () => {
  const mappingUploadSection = document.getElementById('mappingUploadSection');
  const mainSection = document.getElementById('mainSection');
  const remapLink = document.getElementById('remapLink');
  // chrome.storage.localからmappingを取得
  chrome.storage.local.get(['mapping'], (result) => {
    result = result || {};
    if (result.mapping) {
      // 設定済み→通常UI
      mappingUploadSection.style.display = 'none';
      mainSection.style.display = 'block';
    } else {
      // 未設定→設定UI
      mappingUploadSection.style.display = 'block';
      mainSection.style.display = 'none';
    }
  });
  // マッピング再設定リンク
  if (remapLink) {
    remapLink.addEventListener('click', (e) => {
      e.preventDefault();
      mappingUploadSection.style.display = 'block';
      mainSection.style.display = 'none';
    });
  }
});


// mapping.jsonアップロード・保存処理
const saveMappingBtn = document.getElementById('saveMappingBtn');
if (saveMappingBtn) {
  saveMappingBtn.addEventListener('click', () => {
    const mappingFile = document.getElementById('mappingFile');
    const mappingStatus = document.getElementById('mappingStatus');
    if (!mappingFile.files[0]) {
      mappingStatus.textContent = '設定ファイルを選択してください';
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const mapping = JSON.parse(e.target.result);
        chrome.storage.local.set({mapping}, () => {
          mappingStatus.textContent = '設定を保存しました。リロードしてください。';
        });
      } catch (err) {
        mappingStatus.textContent = 'JSONファイルの形式が不正です';
      }
    };
    reader.readAsText(mappingFile.files[0]);
  });
}

// --- 既存Excelアップロード処理 ---
document.getElementById('fillFormBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('excelFile');
  const statusDiv = document.getElementById('status');
  if (!fileInput.files[0]) {
    statusDiv.textContent = 'Excelファイルを選択してください';
    return;
  }
  statusDiv.textContent = 'Excelファイルを読み込み中...';

  const reader = new FileReader();
  reader.onload = async function(e) {
    let workbook;
    try {
      const data = new Uint8Array(e.target.result);
      // ArrayBuffer での読み込み（xlsx/xlsm/xlsb/csv も対応）
      workbook = XLSX.read(data, { type: 'array' });
    } catch (err) {
      console.error('XLSX.read での解析に失敗:', err);
      statusDiv.textContent = 'Excelの解析に失敗しました。ファイルが壊れている、パスワード保護されている、または未対応形式の可能性があります。';
      return;
    }

    try {
      if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
        statusDiv.textContent = 'Excel内にシートが見つかりません。ファイル内容をご確認ください。';
        console.warn('SheetNames が空');
        return;
      }
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      if (!sheet) {
        statusDiv.textContent = `先頭シート(${firstSheetName})の取得に失敗しました。`;
        console.warn('先頭シートが undefined');
        return;
      }

      // chrome.storage.localからmappingを取得して、動的にセル値を読み込む
      chrome.storage.local.get(['mapping'], (result) => {
        try {
          const mappingArr = (result && result.mapping) ? result.mapping : [];
          const values = {};

          if (mappingArr.length === 0) {
            statusDiv.textContent = 'マッピングが設定されていません。設定ファイルを確認してください。';
            console.warn('マッピングが空のため、処理を中断しました。');
            return; // マッピングがない場合は何もしない
          }

          mappingArr.forEach(mapEntry => {
            const cellAddress = mapEntry.cell;
            // cellプロパティが存在しないか、文字列でない場合はスキップ
            if (typeof cellAddress !== 'string') {
              console.warn('無効なセルアドレスを持つマッピングエントリをスキップ:', mapEntry);
              return; // continue の代わりに forEach の場合は return を使用
            }

            const trimmedCellAddress = cellAddress.trim();
            if (!trimmedCellAddress) {
                console.warn('空のセルアドレスを持つマッピングエントリをスキップ:', mapEntry);
                return;
            }

            if (trimmedCellAddress.includes(',')) {
              // 複数のセルがカンマ区切りで指定されている場合 (例: "D4,D5")
              const cellParts = trimmedCellAddress.split(',');
              const combinedValueParts = [];
              cellParts.forEach(part => {
                const trimmedPart = part.trim();
                if (trimmedPart) { // 空の部品をスキップ
                     // セルの値が存在すればその値を、なければ空文字を、数値の0も文字列として扱う
                     const cellValue = sheet[trimmedPart] ? (sheet[trimmedPart].v !== undefined ? String(sheet[trimmedPart].v) : '') : '';
                     combinedValueParts.push(cellValue);
                }
              });
              const combinedKey = trimmedCellAddress.replace(/,/g, '_'); // 例: "D4_D5"
              // 空文字でない値のみを結合する
              values[combinedKey] = combinedValueParts.filter(val => val !== '').join('\n');
            } else {
              // 単独セルの場合
              values[trimmedCellAddress] = sheet[trimmedCellAddress] ? (sheet[trimmedCellAddress].v !== undefined ? String(sheet[trimmedCellAddress].v) : '') : '';
            }
          });

          // content_scriptのロジックを直接実行
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0 || !tabs[0].id) {
              statusDiv.textContent = 'アクティブなタブが見つかりません。';
              console.error('アクティブなタブが見つかりません。');
              return;
            }

            chrome.scripting.executeScript({
              target: {tabId: tabs[0].id, allFrames: true},
              func: (values) => {
                // この関数はコンテンツスクリプトとしてタブのコンテキストで実行される
                chrome.storage.local.get(['mapping'], (result) => {
                  const mappingArr = (result && result.mapping) ? result.mapping : [];
                  const mappingObj = {};
                  mappingArr.forEach(m => {
                    if (m.cell && m.cell.includes(',')) {
                      const key = m.cell.replace(/,/g, '_');
                      mappingObj[key] = m;
                    } else if (m.cell) {
                      mappingObj[m.cell] = m;
                    }
                  });

                  for (const key in values) {
                    const val = values[key];
                    const map = mappingObj[key];
                    if (!map || !map.formId) {
                      console.warn(`マッピングが見つからないか、formIdがありません: ${key}`);
                      continue;
                    }
                    
                    const selector = map.formId.startsWith('#') ? map.formId : ('#' + map.formId);
                    const el = document.querySelector(selector);
                    
                    if (!el) {
                      console.warn(`要素が見つかりません: ${selector}`);
                      continue;
                    }
                    
                    try {
                      if (map.type === 'input' || map.type === 'textarea') {
                        el.value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                      } else if (map.type === 'select') {
                        el.value = val;
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                      }
                    } catch (error) {
                      console.error(`値の設定中にエラーが発生: ${selector}, ${error.message}`);
                    }
                  }
                });
              },
              args: [values]
            });
          });
          statusDiv.textContent = 'フォームへの入力が完了しました。';
        } catch (mappingErr) {
          console.error('マッピング適用中にエラー:', mappingErr);
          statusDiv.textContent = 'マッピングの適用中にエラーが発生しました。設定ファイルの形式とシート内容をご確認ください。';
        }
      });
    } catch (outerErr) {
      console.error('予期せぬエラー:', outerErr);
      statusDiv.textContent = '処理中に予期せぬエラーが発生しました。コンソールを確認してください。';
    }
  };

  reader.onerror = function(ev) {
    console.error('ファイルの読み込みに失敗:', ev);
    const name = fileInput.files[0] ? fileInput.files[0].name : '';
    statusDiv.textContent = `ファイルの読み込みに失敗しました: ${name}`;
  };

  reader.readAsArrayBuffer(fileInput.files[0]);
});
