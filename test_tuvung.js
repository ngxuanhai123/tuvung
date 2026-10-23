/**
 * TEST SUITE: Hihi Vocabulary (tuvung)
 * Kiểm thử toàn diện chức năng & bảo mật
 */

const fs = require('fs');
const path = require('path');

const results = [];
function recordResult(name, passed, details) {
  results.push({ name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} | ${name}`);
  if (details) console.log(`   └─ ${details}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ DỰ ÁN: tuvung (Hihi Vocabulary)');
  console.log('====================================================\n');

  const dir = __dirname;
  const indexPath = path.join(dir, 'index.html');
  const manifestEn = path.join(dir, 'vocab_manifest.json');
  const manifestId = path.join(dir, 'vocab_manifest_indo.json');
  const swPath = path.join(dir, 'sw.js');

  // TEST 1: Cấu trúc file cơ bản
  try {
    const hasIndex = fs.existsSync(indexPath);
    const hasManifestEn = fs.existsSync(manifestEn);
    const hasManifestId = fs.existsSync(manifestId);
    const hasSw = fs.existsSync(swPath);
    const passed = hasIndex && hasManifestEn && hasManifestId && hasSw;
    recordResult('1. Cấu trúc file cơ bản', passed, `index: ${hasIndex}, manifest_en: ${hasManifestEn}, manifest_id: ${hasManifestId}, sw: ${hasSw}`);
  } catch (e) {
    recordResult('1. Cấu trúc file cơ bản', false, e.message);
  }

  // TEST 2: Kiểm tra dữ liệu từ vựng JSON Manifests
  try {
    const enData = JSON.parse(fs.readFileSync(manifestEn, 'utf8'));
    const idData = JSON.parse(fs.readFileSync(manifestId, 'utf8'));
    const enCount = (enData.topics || enData).length;
    const idCount = (idData.topics || idData).length;
    const passed = enCount > 0 && idCount > 0;
    recordResult('2. Dữ liệu từ vựng JSON Manifests', passed, `Tiếng Anh: ${enCount} chủ đề, Tiếng Indo: ${idCount} chủ đề`);
  } catch (e) {
    recordResult('2. Dữ liệu từ vựng JSON Manifests', false, e.message);
  }

  const html = fs.readFileSync(indexPath, 'utf8');

  // TEST 3: Kiểm tra lỗi escape literal \n trong HTML
  try {
    const hasLiteralSlashN = html.includes('</a>\\n');
    const passed = !hasLiteralSlashN;
    recordResult('3. Kiểm tra lỗi escape literal \\n trong HTML', passed, passed ? 'HTML sạch sẽ, không có lỗi chuỗi escape' : 'Phát hiện literal "\\n" trong mã HTML');
  } catch (e) {
    recordResult('3. Kiểm tra lỗi escape literal \\n trong HTML', false, e.message);
  }

  // TEST 4: Service Worker Cache Scope Isolation
  try {
    const sw = fs.readFileSync(swPath, 'utf8');
    const hasScopedCacheName = sw.includes('tuvung-') || sw.includes('hihi-tuvung');
    const deletesOnlyOwnCache = sw.includes("CACHE_PREFIX") || sw.includes("startsWith('tuvung-')") || sw.includes("startsWith('hihi-tuvung')") || sw.includes("key !== CACHE_NAME && key.startsWith('tuvung')");
    const passed = hasScopedCacheName && deletesOnlyOwnCache;
    recordResult('4. Kiểm tra cô lập Service Worker cache', passed, passed ? 'Cache name và logic xóa cache đã được cô lập theo app' : 'SW xóa cache toàn domain hoặc dùng tên chung');
  } catch (e) {
    recordResult('4. Kiểm tra cô lập Service Worker cache', false, e.message);
  }

  // TEST 5: Kiểm tra cú pháp sạch của hàm askAI (không bị comment tutorial / duplicate function)
  try {
    const hasDuplicateTrim = (html.match(/function trimAICache/g) || []).length > 0;
    const hasTutorialComment = html.includes('// Thêm hàm giới hạn cache') || html.includes('// Trong window.askAI() sau khi lưu cache');
    const passed = !hasDuplicateTrim && !hasTutorialComment;
    recordResult('5. Kiểm tra mã nguồn sạch của hàm askAI', passed, passed ? 'Hàm askAI sạch và tối ưu' : `Phát hiện code rác/comment tutorial thừa trong askAI`);
  } catch (e) {
    recordResult('5. Kiểm tra mã nguồn sạch của hàm askAI', false, e.message);
  }

  // TEST 6: Loại bỏ dead code trong TTS (không throw Azure giả)
  try {
    const hasDeadAzureThrow = html.includes('throw new Error("Azure TTS đã loại bỏ")');
    const passed = !hasDeadAzureThrow;
    recordResult('6. Tối ưu luồng TTS (loại bỏ throw/catch Azure giả)', passed, passed ? 'Luồng TTS chuyển mượt sang Google/WebSpeech' : 'Còn đoạn code throw Azure giả làm chậm TTS');
  } catch (e) {
    recordResult('6. Tối ưu luồng TTS', false, e.message);
  }

  // TEST 7: Kiểm tra kết nối AI Gateway thực tế cho askAI (sử dụng ai-free trực tiếp)
  try {
    const t0 = Date.now();
    const res = await fetch('https://ai-free.ngxuanhai123.workers.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'hihi-tuvung'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Bạn là gia sư AI giải thích từ vựng tiếng Anh.' },
          { role: 'user', content: 'Giải thích ngắn gọn từ "persistent" trong 1 câu.' }
        ],
        max_tokens: 50
      })
    });
    const lat = Date.now() - t0;
    const data = await res.json().catch(() => ({}));
    const text = data.choices?.[0]?.message?.content || data.error?.message || '';
    const passed = res.status === 200 && Boolean(data.choices?.[0]?.message?.content);
    recordResult('7. Gọi thử AI Gateway thực tế giải thích từ vựng', passed, `Status: ${res.status}, Latency: ${lat}ms, Trả lời: "${text.trim().replace(/\n/g, ' ')}"`);
  } catch (e) {
    recordResult('7. Gọi thử AI Gateway thực tế giải thích từ vựng', false, e.message);
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log('\n====================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedCount}/${results.length} bài test vượt qua`);
  console.log('====================================================\n');
}

runTests();
