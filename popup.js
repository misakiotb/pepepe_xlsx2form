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
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // セル値を取得
    const values = {
      'B13': sheet['B13'] ? sheet['B13'].v : '',
      'B19': sheet['B19'] ? sheet['B19'].v : '',
      'B20': sheet['B20'] ? sheet['B20'].v : '',
      'B21': sheet['B21'] ? sheet['B21'].v : '',
      'B22': sheet['B22'] ? sheet['B22'].v : '',
      'B32': sheet['B32'] ? sheet['B32'].v : '',
      'D35': sheet['D35'] ? sheet['D35'].v : '',
      'B33': sheet['B33'] ? sheet['B33'].v : '',
      'B34': sheet['B34'] ? sheet['B34'].v : '',
      'B35': sheet['B35'] ? sheet['B35'].v : '',
      'B24': sheet['B24'] ? sheet['B24'].v : '',
      'B28': sheet['B28'] ? sheet['B28'].v : '',
      'D23': sheet['D23'] ? sheet['D23'].v : '',
      'D24': sheet['D24'] ? sheet['D24'].v : '',
      'B30': sheet['B30'] ? sheet['B30'].v : '',
      'B26': sheet['B26'] ? sheet['B26'].v : '',
      'B27': sheet['B27'] ? sheet['B27'].v : '',
      'D16': sheet['D16'] ? sheet['D16'].v : '',
      'B29': sheet['B29'] ? sheet['B29'].v : '',
      'B31': sheet['B31'] ? sheet['B31'].v : '',
      'B36': sheet['B36'] ? sheet['B36'].v : ''
    };
    // 時間外労働（B26+B27）
    values['B26_B27'] = [values['B26'], values['B27']].filter(Boolean).join('\n');

    // content_scriptに送信
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: (vals) => {
          window.postMessage({type: 'EXCEL_TO_FORM', values: vals}, '*');
        },
        args: [values]
      });
    });
    statusDiv.textContent = 'フォームに値を送信しました';
  };
  reader.readAsArrayBuffer(fileInput.files[0]);
});
