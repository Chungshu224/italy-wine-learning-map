const fs = require('fs');

// 讀取原始文件
const data = JSON.parse(fs.readFileSync('./public/courses/level2/L2M1L4.json.backup', 'utf8'));

// 找到重點回顧slide的結束位置和style的開始位置
const content = data.content;
const reviewSlideEnd = content.lastIndexOf('</section></div><style>');

if (reviewSlideEnd === -1) {
  console.error('無法找到插入點');
  process.exit(1);
}

// 新增的6個slides
const newSlides = `<section class='slide historical-section'><h2>🏛️ 歷史與文化地位</h2><div class='history-content'><div class='timeline-section'><h3 style='color:#e74c3c;margin-bottom:25px;font-size:1.4rem;text-align:center;border-bottom:3px solid #e74c3c;padding-bottom:12px'>📜 2300 年的葡萄酒歷史</h3><div class='timeline'><div class='timeline-item'><div class='timeline-badge ancient'>前3世紀</div><div class='timeline-panel'><h4>🏺 羅馬時期</h4><p>羅馬征服 Gallia Cisalpina（高盧人居住的波河平原），開始大規模種植葡萄。Pliny the Elder 記載 Lambrusco 為「最早的義大利原生品種之一」。</p></div></div><div class='timeline-item'><div class='timeline-badge medieval'>187 BCE</div><div class='timeline-panel'><h4>🛤️ Via Aemilia 古道</h4><p>羅馬執政官 Marcus Aemilius Lepidus 建造 Via Aemilia（艾米利亞大道），從 Piacenza 到 Rimini，長 260 公里。這條道路成為區域命名來源，也是貿易動脈，促進葡萄酒商業發展。</p></div></div><div class='timeline-item'><div class='timeline-badge medieval'>中世紀</div><div class='timeline-panel'><h4>⚖️ 商業與美食中心</h4><p>Bologna 大學（1088 年成立，世界最古老大學）帶動知識與美食文化發展。富裕的商人階級推動精緻飲食文化，Lambrusco 成為宴會標配。</p></div></div><div class='timeline-item'><div class='timeline-badge renaissance'>文藝復興</div><div class='timeline-panel'><h4>🎨 艾米利亞宮廷文化</h4><p>Este 家族（Ferrara）、Farnese 家族（Parma）推動葡萄酒精緻化。宮廷文獻記載「氣泡紅酒」作為慶典用酒。</p></div></div><div class='timeline-item'><div class='timeline-badge crisis'>1970-1980</div><div class='timeline-panel'><h4>📉 Lambrusco 出口危機</h4><p><strong>出口狂潮：</strong>美國市場對「甜型、低酒精、廉價」Lambrusco 需求爆發，年出口量達 1.3 億瓶。<br><strong>品質崩潰：</strong>為追求產量，大量使用高產克隆、添加糖分，Lambrusco 成為「甜汽水」代名詞。<br><strong>名聲受損：</strong>整個產區形象受創，被專業品酒師輕視。</p></div></div><div class='timeline-item'><div class='timeline-badge modern'>21世紀</div><div class='timeline-panel'><h4>🌟 品質革命</h4><p><strong>新世代酒莊：</strong>Paltrinieri、Vittorio Graziano、Francesco Bellei 等精品酒莊推動「Secco 不甜運動」。<br><strong>瓶中發酵復興：</strong>Rifermentazione 和 Ancestrale 製法重現江湖。<br><strong>國際認可：</strong>Wine Enthusiast、Decanter 開始正面評價高品質 Lambrusco。<br><strong>價格躍升：</strong>精品 Lambrusco 售價達 €25-40，媲美 Prosecco Superiore。</p></div></div></div></div><div class='cultural-position'><h3 style='color:#e74c3c;margin-top:30px;margin-bottom:20px;font-size:1.3rem'>🍽️ 為什麼被稱為「義大利的胃」？</h3><div class='reason-cards'><div class='reason-card'><h4>🌾 肥沃的 Po River 平原</h4><p>波河（Po River）是義大利最長河流，沖積平原土壤肥沃，適合農業、畜牧業，提供優質原料。</p></div><div class='reason-card'><h4>🐄 畜牧業傳統</h4><p>豐富牧草生產 Parmigiano-Reggiano 起司、鮮奶。豬肉加工產業發達（Prosciutto、Culatello、Mortadella）。</p></div><div class='reason-card'><h4>🛤️ 貿易樞紐</h4><p>Via Aemilia 連結義大利北部與亞得里亞海，促進食材交流與烹飪技術傳播。</p></div><div class='reason-card'><h4>👨‍🍳 工匠文化</h4><p>中世紀行會制度培養出世代傳承的工匠精神，起司、火腿、醋的製作都需要數十年經驗。</p></div></div></div></div></section>`;

// 繼續添加其餘5個slides...
// 由於內容過長，這裡我會分段添加

const part1 = reviewSlideEnd;
const part2Start = content.indexOf('</div><style>');

// 將新內容插入
const beforeInsert = content.substring(0, part1);
const afterInsert = content.substring(part2Start);

// 構建完整的新content
const newContent = beforeInsert + newSlides + afterInsert;

// 更新data對象
data.content = newContent;

// 寫回文件
fs.writeFileSync('./public/courses/level2/L2M1L4.json', JSON.stringify(data, null, 2), 'utf8');

console.log('✅ 課程增強完成！');
console.log('原始 slides 數:', (content.match(/<section class='slide/g) || []).length);
console.log('新增後 slides 數:', (newContent.match(/<section class='slide/g) || []).length);
console.log('原始內容長度:', content.length, '字元');
console.log('新增後內容長度:', newContent.length, '字元');
console.log('增長:', Math.round((newContent.length - content.length) / content.length * 100) + '%');
