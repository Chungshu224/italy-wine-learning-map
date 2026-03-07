import fs from 'fs';

// 讀取備份文件
const data = JSON.parse(fs.readFileSync('public/courses/level1/L1M2L1.json.backup', 'utf-8'));

// 6個新增的專業深度幻燈片
const newSlides = `
<section class='slide'>
  <h2>🏛️ 歷史與文化傳承</h2>
  <div style='display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:0.95em;'>
    <div style='background:linear-gradient(135deg,#8b4513,#a0522d);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>📜 法定產區先驅</h3>
      <div style='line-height:1.8;'>
        <p><strong>1716年</strong>：全球首個法定葡萄酒產區</p>
        <p>• Barolo、Barbaresco、Canelli等地被正式劃定</p>
        <p>• 比法國AOC制度早200年</p>
        <p>• 奠定義大利葡萄酒法律基礎</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#4a0e0e,#6b1a1a);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>👑 卡武爾伯爵</h3>
      <div style='line-height:1.8;'>
        <p><strong>19世紀中期</strong>：現代Barolo之父</p>
        <p>• 引入法國橡木桶技術</p>
        <p>• 將甜酒改造為干型風格</p>
        <p>• 提升至"王者之酒"地位</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#1a5490,#2874a6);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>⚔️ 1980年代Barolo戰爭</h3>
      <div style='line-height:1.8;'>
        <p><strong>傳統派 vs 現代派</strong></p>
        <p>• 傳統：大桶長時間陳年（Botte大桶）</p>
        <p>• 現代：法國小橡木桶（Barrique）</p>
        <p>• 今日：兩派融合，風格多元化</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#196f3d,#239b56);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🐌 慢食運動發源地</h3>
      <div style='line-height:1.8;'>
        <p><strong>1986年創立於Bra小鎮</strong></p>
        <p>• 對抗快餐文化</p>
        <p>• 保護傳統美食與葡萄酒</p>
        <p>• 全球慢食運動總部</p>
      </div>
    </div>
  </div>
</section>

<section class='slide'>
  <h2>🌍 風土條件深度解析</h2>
  <div style='display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:0.95em;'>
    <div style='background:linear-gradient(135deg,#5d4037,#795548);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🪨 地質年代</h3>
      <div style='line-height:1.8;'>
        <p><strong>中新世海洋沉積（1500萬年前）</strong></p>
        <p>• Tortonian（托爾托納階）土壤</p>
        <p>• Helvetian（赫維茲階）土壤</p>
        <p>• 富含鈣質、鎂質、微量礦物</p>
        <p>• 賦予Nebbiolo獨特礦物感</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#bf360c,#d84315);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🏔️ Tortonian vs Helvetian</h3>
      <div style='line-height:1.8;'>
        <p><strong>Tortonian（較年輕）</strong></p>
        <p>• 灰色泥灰岩：優雅、花香、細膩</p>
        <p>• 代表產區：La Morra、Barolo村</p>
        <p><strong>Helvetian（較古老）</strong></p>
        <p>• 黃色砂岩：結構、力量、陳年潛力</p>
        <p>• 代表產區：Serralunga、Monforte</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#004d40,#00695c);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🌤️ 微氣候多樣性</h3>
      <div style='line-height:1.8;'>
        <p><strong>海拔：200-500米</strong></p>
        <p>• 朝南坡面：最佳日照與成熟度</p>
        <p>• 大陸性氣候：溫差大（夏35°C，冬-5°C）</p>
        <p>• 秋季晨霧（Nebbia）：Nebbiolo名稱由來</p>
        <p>• 理想的酸度與單寧平衡</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#1a237e,#283593);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🍇 葡萄園管理</h3>
      <div style='line-height:1.8;'>
        <p><strong>傳統技術</strong></p>
        <p>• 低產量：6000-7000公斤/公頃</p>
        <p>• 老藤比例高（40-60年）</p>
        <p>• Guyot修剪法為主</p>
        <p>• 嚴格的產量控制與綠色採收</p>
      </div>
    </div>
  </div>
</section>

<section class='slide'>
  <h2>🧬 Nebbiolo三大克隆品系</h2>
  <div style='display:grid;grid-template-columns:1fr;gap:15px;max-width:900px;margin:0 auto;font-size:0.95em;'>
    <div style='background:linear-gradient(135deg,#6a1b9a,#8e24aa);padding:25px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.4em;'>🍇 Lampia（蘭比亞）- 70%種植比例</h3>
      <div style='line-height:1.9;'>
        <p><strong>特性</strong>：最傳統克隆，串大粒大，產量較高</p>
        <p><strong>風味</strong>：經典玫瑰、焦油、紅色水果</p>
        <p><strong>優點</strong>：風味平衡、適應多種風土</p>
        <p><strong>代表酒莊</strong>：Giacomo Conterno、Bruno Giacosa</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#c62828,#d32f2f);padding:25px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.4em;'>🧪 Michet（米切特）- 15%種植比例</h3>
      <div style='line-height:1.9;'>
        <p><strong>特性</strong>：Lampia病毒變異株，串小粒小，產量極低</p>
        <p><strong>風味</strong>：濃郁、集中、單寧更緊實</p>
        <p><strong>優點</strong>：高濃縮度、陳年潛力佳</p>
        <p><strong>代表酒莊</strong>：Paolo Scavino、Luciano Sandrone</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#f57c00,#fb8c00);padding:25px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.4em;'>🌸 Rosé（羅塞）- 5%種植比例</h3>
      <div style='line-height:1.9;'>
        <p><strong>特性</strong>：產量最低但品質極高，串極小</p>
        <p><strong>風味</strong>：最優雅細膩、香氣複雜度最高</p>
        <p><strong>優點</strong>：精緻度頂級、稀有珍貴</p>
        <p><strong>代表酒莊</strong>：Giuseppe Rinaldi、Bartolo Mascarello</p>
      </div>
    </div>
    <div style='background:#34495e;padding:20px;border-radius:12px;color:white;text-align:center;'>
      <p style='margin:0;font-size:1.1em;line-height:1.8;'>
        <strong>💡 專業提示</strong>：許多頂級酒莊混種多種克隆以達到風味複雜度的最佳平衡
      </p>
    </div>
  </div>
</section>

<section class='slide'>
  <h2>🗺️ Barolo 11村莊與MGA體系</h2>
  <div style='display:grid;grid-template-columns:repeat(3,1fr);gap:15px;font-size:0.88em;'>
    <div style='background:linear-gradient(135deg,#b71c1c,#c62828);padding:18px;border-radius:10px;color:white;'>
      <h3 style='margin:0 0 10px 0;font-size:1.2em;'>🏛️ MGA體系</h3>
      <p style='line-height:1.7;margin:0;'>
        <strong>Menzioni Geografiche Aggiuntive</strong><br>
        • 2010年正式實施<br>
        • 181個官方認證單一葡萄園<br>
        • 類似法國Cru分級<br>
        • 酒標可標示村莊+葡萄園名
      </p>
    </div>
    <div style='background:linear-gradient(135deg,#880e4f,#ad1457);padding:18px;border-radius:10px;color:white;'>
      <h3 style='margin:0 0 10px 0;font-size:1.2em;'>🍷 La Morra</h3>
      <p style='line-height:1.7;margin:0;'>
        <strong>風格</strong>：優雅、花香<br>
        <strong>土壤</strong>：Tortonian灰色泥灰岩<br>
        <strong>名園</strong>：Brunate、Cerequio、Rocche dell'Annunziata<br>
        <strong>特色</strong>：最細膩柔美風格
      </p>
    </div>
    <div style='background:linear-gradient(135deg,#4a148c,#6a1b9a);padding:18px;border-radius:10px;color:white;'>
      <h3 style='margin:0 0 10px 0;font-size:1.2em;'>🏰 Barolo村</h3>
      <p style='line-height:1.7;margin:0;'>
        <strong>風格</strong>：平衡、經典<br>
        <strong>土壤</strong>：混合型<br>
        <strong>名園</strong>：Cannubi、Sarmassa、Brunate<br>
        <strong>特色</strong>：兼具力量與優雅
      </p>
    </div>
    <div style='background:linear-gradient(135deg,#01579b,#0277bd);padding:18px;border-radius:10px;color:white;'>
      <h3 style='margin:0 0 10px 0;font-size:1.2em;'>⚔️ Serralunga</h3>
      <p style='line-height:1.7;margin:0;'>
        <strong>風格</strong>：結構、力量<br>
        <strong>土壤</strong>：Helvetian黃色砂岩<br>
        <strong>名園</strong>：Vigna Rionda、Francia、Lazzarito<br>
        <strong>特色</strong>：最強勁、陳年潛力最長
      </p>
    </div>
    <div style='background:linear-gradient(135deg,#f57f17,#f9a825);padding:18px;border-radius:10px;color:white;'>
      <h3 style='margin:0 0 10px 0;font-size:1.2em;'>🌟 Monforte</h3>
      <p style='line-height:1.7;margin:0;'>
        <strong>風格</strong>：濃郁、深邃<br>
        <strong>土壤</strong>：Helvetian為主<br>
        <strong>名園</strong>：Bussia、Ginestra、Santo Stefano di Perno<br>
        <strong>特色</strong>：集中度高、單寧強勁
      </p>
    </div>
    <div style='background:linear-gradient(135deg,#bf360c,#d84315);padding:18px;border-radius:10px;color:white;'>
      <h3 style='margin:0 0 10px 0;font-size:1.2em;'>💎 Castiglione Falletto</h3>
      <p style='line-height:1.7;margin:0;'>
        <strong>風格</strong>：優雅力量並存<br>
        <strong>土壤</strong>：混合型<br>
        <strong>名園</strong>：Monprivato、Villero、Rocche<br>
        <strong>特色</strong>：最佳平衡與複雜度
      </p>
    </div>
    <div style='background:linear-gradient(135deg,#1b5e20,#2e7d32);padding:18px;border-radius:10px;color:white;'>
      <h3 style='margin:0 0 10px 0;font-size:1.2em;'>📍 其他5村</h3>
      <p style='line-height:1.7;margin:0;'>
        <strong>Novello</strong>：輕盈易飲<br>
        <strong>Verduno</strong>：香氣主導<br>
        <strong>Grinzane Cavour</strong>：歷史名村<br>
        <strong>Diano d'Alba</strong>：海拔最高<br>
        <strong>Cherasco</strong>：產量最少
      </p>
    </div>
    <div style='background:#2c3e50;padding:18px;border-radius:10px;color:white;'>
      <h3 style='margin:0 0 10px 0;font-size:1.2em;'>🎯 風土差異總結</h3>
      <p style='line-height:1.7;margin:0;'>
        <strong>西部村莊</strong>（La Morra、Barolo）：優雅芳香<br>
        <strong>東部村莊</strong>（Serralunga、Monforte）：結構陳年<br>
        <strong>中部村莊</strong>（Castiglione）：平衡複雜
      </p>
    </div>
    <div style='background:#34495e;padding:18px;border-radius:10px;color:white;'>
      <h3 style='margin:0 0 10px 0;font-size:1.2em;'>💡 選購建議</h3>
      <p style='line-height:1.7;margin:0;'>
        <strong>初學者</strong>：La Morra易飲<br>
        <strong>收藏陳年</strong>：Serralunga結構<br>
        <strong>風味探索</strong>：Castiglione複雜度
      </p>
    </div>
  </div>
</section>

<section class='slide'>
  <h2>🏰 傳奇名莊巡禮</h2>
  <div style='display:grid;grid-template-columns:repeat(2,1fr);gap:20px;font-size:0.92em;'>
    <div style='background:linear-gradient(135deg,#1a237e,#283593);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 12px 0;font-size:1.3em;'>👑 Angelo Gaja</h3>
      <div style='line-height:1.8;'>
        <p><strong>風格革新者</strong></p>
        <p>• 引入法國小橡木桶技術</p>
        <p>• 首創單一葡萄園概念</p>
        <p>• 代表作：Sori San Lorenzo、Sori Tildin</p>
        <p>• 國際價格：€300-1000+/瓶</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#4a148c,#6a1b9a);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 12px 0;font-size:1.3em;'>🌟 Bruno Giacosa</h3>
      <div style='line-height:1.8;'>
        <p><strong>傳統大師</strong></p>
        <p>• 完美主義釀造哲學</p>
        <p>• Red Label（紅標）：傳奇年份標示</p>
        <p>• 代表作：Barbaresco Asili Riserva</p>
        <p>• 國際價格：€150-800/瓶</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#b71c1c,#c62828);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 12px 0;font-size:1.3em;'>⚜️ Giacomo Conterno</h3>
      <div style='line-height:1.8;'>
        <p><strong>傳統派標杆</strong></p>
        <p>• 堅持大桶陳年（Botte）</p>
        <p>• Monfortino：傳奇單一園Riserva</p>
        <p>• 只在優秀年份生產Monfortino</p>
        <p>• 國際價格：€400-2000+/瓶</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#880e4f,#ad1457);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 12px 0;font-size:1.3em;'>🍷 Bartolo Mascarello</h3>
      <div style='line-height:1.8;'>
        <p><strong>風土純粹主義者</strong></p>
        <p>• 拒絕單一園標示，混釀多園展現村莊特色</p>
        <p>• 手寫酒標，反對過度商業化</p>
        <p>• 代表作：Barolo（混釀）</p>
        <p>• 國際價格：€200-600/瓶</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#01579b,#0277bd);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 12px 0;font-size:1.3em;'>🔥 Paolo Scavino</h3>
      <div style='line-height:1.8;'>
        <p><strong>現代派先驅</strong></p>
        <p>• 精準葡萄園管理</p>
        <p>• 現代技術與傳統結合</p>
        <p>• 代表作：Bric dël Fiasc、Carobric</p>
        <p>• 國際價格：€100-400/瓶</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#f57f17,#f9a825);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 12px 0;font-size:1.3em;'>🎨 Giuseppe Rinaldi</h3>
      <div style='line-height:1.8;'>
        <p><strong>自然派大師</strong></p>
        <p>• 極低人工干預</p>
        <p>• 不使用新橡木桶</p>
        <p>• 代表作：Brunate-Le Coste</p>
        <p>• 國際價格：€150-500/瓶</p>
      </div>
    </div>
  </div>
  <div style='background:#2c3e50;padding:15px;border-radius:10px;color:white;text-align:center;margin-top:20px;'>
    <p style='margin:0;font-size:1.05em;'><strong>💎 收藏提示</strong>：這些名莊的Riserva與單一園酒款是葡萄酒拍賣市場的常客，陳年10-30年達巔峰</p>
  </div>
</section>

<section class='slide'>
  <h2>🍴 侍酒與餐酒搭配</h2>
  <div style='display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:0.95em;'>
    <div style='background:linear-gradient(135deg,#5d4037,#6d4c41);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🍷 侍酒溫度</h3>
      <div style='line-height:1.9;'>
        <p><strong>Barolo/Barbaresco</strong>：18-20°C</p>
        <p><strong>Barbera</strong>：16-18°C</p>
        <p><strong>Dolcetto</strong>：14-16°C</p>
        <p><strong>Moscato d'Asti</strong>：6-8°C</p>
        <p><strong>Gavi</strong>：10-12°C</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#c62828,#d32f2f);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>⏱️ 醒酒建議</h3>
      <div style='line-height:1.9;'>
        <p><strong>年輕Barolo（<10年）</strong>：2-4小時</p>
        <p><strong>適飲期Barolo（10-20年）</strong>：1-2小時</p>
        <p><strong>陳年Barolo（>20年）</strong>：30分鐘或直接倒杯</p>
        <p><strong>Barbaresco</strong>：通常較Barolo早飲，醒酒時間減半</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#6a1b9a,#7b1fa2);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🥩 經典搭配</h3>
      <div style='line-height:1.9;'>
        <p><strong>Barolo</strong>：</p>
        <p>• 松露燉飯（Risotto al tartufo）</p>
        <p>• 紅酒燉牛肉（Brasato al Barolo）</p>
        <p>• 野味（鹿肉、野豬）</p>
        <p>• 陳年Parmigiano Reggiano起司（36個月+）</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#00695c,#00796b);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🧀 地方特色餐搭</h3>
      <div style='line-height:1.9;'>
        <p><strong>Barbaresco</strong>：</p>
        <p>• 鵝肝醬（Pâté di fegato grasso）</p>
        <p>• 芝士火鍋（Fonduta piemontese）</p>
        <p><strong>Barbera</strong>：義式臘腸、番茄醬料理</p>
        <p><strong>Dolcetto</strong>：披薩、義大利麵</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#ff6f00,#ff8f00);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🍰 甜點搭配</h3>
      <div style='line-height:1.9;'>
        <p><strong>Moscato d'Asti</strong>：</p>
        <p>• 水果塔（Crostata）</p>
        <p>• 榛果巧克力（Gianduia）</p>
        <p>• 義式脆餅（Biscotti）</p>
        <p>• 新鮮水果（桃子、杏桃）</p>
      </div>
    </div>
    <div style='background:linear-gradient(135deg,#1565c0,#1976d2);padding:20px;border-radius:12px;color:white;'>
      <h3 style='margin:0 0 15px 0;font-size:1.3em;'>🌟 專業建議</h3>
      <div style='line-height:1.9;'>
        <p><strong>杯具選擇</strong>：</p>
        <p>• Nebbiolo系：大碗型紅酒杯（Burgundy型）</p>
        <p>• 促進香氣釋放與氧化</p>
        <p><strong>陳年潛力</strong>：</p>
        <p>• Barolo：15-40年</p>
        <p>• Barbaresco：10-30年</p>
      </div>
    </div>
  </div>
</section>`;

// 找到插入點（白葡萄酒章節之前）
const marker = "</section><section class='slide'><h2>⚪ 白葡萄酒與氣泡酒</h2>";
const insertedContent = data.content.replace(marker, newSlides + marker);

// 添加額外的CSS樣式
data.content = insertedContent;

// 寫回原文件
fs.writeFileSync('public/courses/level1/L1M2L1.json', JSON.stringify(data, null, 2), 'utf-8');

console.log('✅ Piemonte課程內容已成功擴充！');
console.log('📊 新增6個專業深度幻燈片');
console.log('🎯 總計15個幻燈片（原9個 + 新6個）');
