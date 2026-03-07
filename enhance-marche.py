import json

# 读取原始文件
with open('public/courses/level2/L2M2L1.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('📖 Original content length:', len(data['content']))

# 1. 找到插入位置（在重点回顾section之前）
old_review = "<section class='slide'><h2>🎓 重點回顧</h2><div class='key-points'><div class='point'>✓ Marche 以 Verdicchio 白酒聞名，被稱為「義大利的 Chardonnay」</div><div class='point'>✓ Verdicchio dei Castelli di Jesi 和 Verdicchio di Matelica 是兩大 DOCG</div><div class='point'>✓ Verdicchio 能陳年 10-20 年，發展出蜂蜜、堅果、石油氣息</div><div class='point'>✓ Rosso Conero（Montepulciano 主導）是高品質紅酒</div><div class='point'>✓ Pecorino、Passerina 是新興的優質白葡萄品種</div><div class='point'>✓ Lacrima di Morro d'Alba 是義大利最芳香的紅葡萄品種之一</div></div></section>"

# 2. 新slides的HTML（为节省空间，这里只展示部分作为示例）
# 实际使用时需要包含完整的6个slides HTML

new_slides_content = """
[PLACEHOLDER FOR 6 NEW SLIDES - TO BE ADDED]
"""

# 3. 更新的重点回顾
new_review = """<section class='slide'><h2>🎓 重點回顧</h2><div class='key-points'><div class='point'>✓ Marche 以 Verdicchio 白酒聞名，被稱為「義大利的 Chardonnay」</div><div class='point'>✓ Verdicchio dei Castelli di Jesi 和 Verdicchio di Matelica 是兩大 DOCG</div><div class='point'>✓ Verdicchio 能陳年 10-20 年，發展出蜂蜜、堅果、石油氣息</div><div class='point'>✓ Rosso Conero（Montepulciano 主導）是高品質紅酒</div><div class='point'>✓ Pecorino、Passerina 是新興的優質白葡萄品種</div><div class='point'>✓ Lacrima di Morro d'Alba 是義大利最芳香的紅葡萄品種之一</div><div class='point'>✓ 1950s 魚形 Anfora 酒瓶讓 Verdicchio 國際知名</div><div class='point'>✓ Matelica 的極大日夜溫差與高海拔造就更濃郁、更適合陳年的 Verdicchio</div><div class='point'>✓ Verdicchio 的高酚類與高酸度是陳年能力的科學基礎</div><div class='point'>✓ Monte Conero 的獨特微氣候讓 Montepulciano 達到優雅與結構的平衡</div><div class='point'>✓ Bucci、Sartarelli、Umani Ronchi 是 Verdicchio 三大名莊</div><div class='point'>✓ 陳年 Verdicchio 收藏建議：2021, 2019, 2016, 2015 等卓越年份</div></div></section>"""

# 4. 替换内容
if old_review in data['content']:
    data['content'] = data['content'].replace(old_review, new_slides_content + new_review)
    print('✓ Review section updated')
else:
    print('✗ Could not find review section!')

# 5. 添加CSS（在</style>之前）
# [CSS Content to be added]

# 6. 保存文件
with open('public/courses/level2/L2M2L1.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('✓ File saved!')
print('📊 New content length:', len(data['content']))
