#!/usr/bin/env node
/**
 * xlsx ライブラリの standalone ビルドを拡張機能用にコピー
 * npm install 後に実行され、Dependabot で更新された xlsx を反映します
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const destPath = path.join(projectRoot, 'xlsx.full.min.js');

const possiblePaths = [
  path.join(projectRoot, 'node_modules', 'xlsx', 'dist', 'xlsx.full.min.js'),
  path.join(projectRoot, 'node_modules', 'xlsx', 'xlsx.full.min.js'),
  path.join(projectRoot, 'node_modules', 'xlsx', 'dist', 'xlsx.min.js'),
];

let sourcePath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    sourcePath = p;
    break;
  }
}

if (!sourcePath) {
  console.warn('copy-xlsx: xlsx の standalone ビルドが見つかりません。CDN から直接ダウンロードした xlsx.full.min.js を使用してください。');
  process.exit(0);
}

fs.copyFileSync(sourcePath, destPath);
console.log('copy-xlsx: xlsx.full.min.js を更新しました');
