// 義大利葡萄酒大區基礎資訊
export const regionOverviews = {
  veneto: {
    name: 'Veneto',
    nameCN: '威尼托',
    location: '義大利東北部',
    climate: '溫帶大陸性氣候，受阿爾卑斯山和亞得里亞海影響',
    area: '約 75,000 公頃葡萄園',
    production: '義大利第三大葡萄酒產區',
    appellations: {
      docg: 14,
      doc: 28,
      igt: 10
    },
    mainGrapes: ['Corvina', 'Rondinella', 'Garganega', 'Glera', 'Pinot Grigio'],
    characteristics: '以 Prosecco 氣泡酒、Amarone 和 Valpolicella 紅酒聞名',
    highlights: ['Prosecco 氣泡酒世界知名', 'Amarone della Valpolicella 頂級干紅', 'Soave 優質白酒', 'Bardolino 清新紅酒']
  },
  
  piedmont: {
    name: 'Piemonte',
    nameCN: '皮埃蒙特',
    location: '義大利西北部，阿爾卑斯山腳下',
    climate: '大陸性氣候，溫差大，秋季多霧',
    area: '約 45,000 公頃葡萄園',
    production: '義大利最重要的優質葡萄酒產區',
    appellations: {
      docg: 18,
      doc: 42,
      igt: 6
    },
    mainGrapes: ['Nebbiolo', 'Barbera', 'Dolcetto', 'Moscato', 'Cortese'],
    characteristics: 'Barolo 和 Barbaresco 等頂級 Nebbiolo 紅酒的故鄉',
    highlights: ['Barolo 酒王', 'Barbaresco 酒后', 'Asti 氣泡酒', 'Alba 白松露產地']
  },
  
  tuscany: {
    name: 'Toscana',
    nameCN: '托斯卡納',
    location: '義大利中部，面向第勒尼安海',
    climate: '地中海氣候，夏季炎熱乾燥，冬季溫和',
    area: '約 63,000 公頃葡萄園',
    production: '義大利最著名的葡萄酒產區',
    appellations: {
      docg: 11,
      doc: 41,
      igt: 6
    },
    mainGrapes: ['Sangiovese', 'Canaiolo', 'Colorino', 'Trebbiano', 'Vernaccia'],
    characteristics: 'Chianti 和 Brunello di Montalcino 等 Sangiovese 紅酒聖地',
    highlights: ['Brunello di Montalcino', 'Chianti Classico', 'Vino Nobile di Montepulciano', 'Super Tuscan 超級托斯卡納']
  },
  
  lombardy: {
    name: 'Lombardy',
    nameCN: '倫巴第',
    location: '義大利北部，米蘭所在地',
    climate: '大陸性氣候，受阿爾卑斯山和湖泊調節',
    area: '約 25,000 公頃葡萄園',
    production: '以氣泡酒 Franciacorta 聞名',
    appellations: {
      docg: 5,
      doc: 21,
      igt: 15
    },
    mainGrapes: ['Nebbiolo', 'Pinot Nero', 'Chardonnay', 'Pinot Bianco'],
    characteristics: 'Franciacorta 是義大利最頂級的傳統法氣泡酒',
    highlights: ['Franciacorta DOCG 氣泡酒', 'Valtellina Superiore 紅酒', 'Oltrepò Pavese 產區']
  },
  
  trentino: {
    name: 'Trentino',
    nameCN: '特倫蒂諾-上阿迪傑',
    location: '義大利東北部，阿爾卑斯山區',
    climate: '高山氣候，日夜溫差大',
    area: '約 15,000 公頃葡萄園',
    production: '優質白酒和氣泡酒產區',
    appellations: {
      docg: 2,
      doc: 8,
      igt: 6
    },
    mainGrapes: ['Pinot Grigio', 'Chardonnay', 'Teroldego', 'Lagrein', 'Gewürztraminer'],
    characteristics: '高海拔葡萄園，生產清新優雅的白酒',
    highlights: ['Trentodoc 氣泡酒', 'Alto Adige 白酒', 'Teroldego Rotaliano 紅酒']
  },
  
  friuli: {
    name: 'Friuli-Venezia Giulia',
    nameCN: '弗留利-威尼斯朱利亞',
    location: '義大利東北部，與斯洛維尼亞接壤',
    climate: '溫帶氣候，受亞得里亞海影響',
    area: '約 18,000 公頃葡萄園',
    production: '義大利頂級白酒產區',
    appellations: {
      docg: 4,
      doc: 12,
      igt: 3
    },
    mainGrapes: ['Friulano', 'Ribolla Gialla', 'Pinot Grigio', 'Refosco', 'Merlot'],
    characteristics: '以優質白酒和橙酒（Orange Wine）聞名',
    highlights: ['Collio 白酒', 'Colli Orientali 產區', 'Ramandolo 甜酒', '橙酒（皮膚發酵白酒）先驅']
  },
  
  emilia: {
    name: 'Emilia-Romagna',
    nameCN: '艾米利亞-羅馬涅',
    location: '義大利北部，波隆那所在地',
    climate: '大陸性和地中海氣候過渡',
    area: '約 58,000 公頃葡萄園',
    production: 'Lambrusco 氣泡紅酒的故鄉',
    appellations: {
      docg: 2,
      doc: 20,
      igt: 9
    },
    mainGrapes: ['Lambrusco', 'Sangiovese', 'Trebbiano', 'Albana'],
    characteristics: 'Lambrusco 微氣泡紅酒和 Parmigiano Reggiano 起司',
    highlights: ['Lambrusco 微氣泡紅酒', 'Albana di Romagna 白酒', 'Sangiovese di Romagna']
  },
  
  marche: {
    name: 'Marche',
    nameCN: '馬爾凱',
    location: '義大利中部，亞得里亞海沿岸',
    climate: '地中海氣候，受海洋調節',
    area: '約 16,000 公頃葡萄園',
    production: 'Verdicchio 白酒的故鄉',
    appellations: {
      docg: 5,
      doc: 15,
      igt: 1
    },
    mainGrapes: ['Verdicchio', 'Montepulciano', 'Sangiovese', 'Pecorino'],
    characteristics: 'Verdicchio 清爽白酒和 Rosso Conero 紅酒',
    highlights: ['Verdicchio dei Castelli di Jesi', 'Conero 紅酒', 'Offida DOCG']
  },
  
  umbria: {
    name: 'Umbria',
    nameCN: '翁布里亞',
    location: '義大利中部，唯一沒有海岸線的大區',
    climate: '大陸性氣候，山區和丘陵',
    area: '約 13,000 公頃葡萄園',
    production: 'Orvieto 白酒和 Sagrantino 紅酒',
    appellations: {
      docg: 2,
      doc: 13,
      igt: 6
    },
    mainGrapes: ['Sagrantino', 'Sangiovese', 'Grechetto', 'Trebbiano'],
    characteristics: 'Sagrantino di Montefalco 是義大利最強勁的紅酒之一',
    highlights: ['Sagrantino di Montefalco DOCG', 'Orvieto 白酒', 'Torgiano Rosso Riserva']
  },
  
  lazio: {
    name: 'Lazio',
    nameCN: '拉齊奧',
    location: '義大利中部，羅馬所在地',
    climate: '地中海氣候',
    area: '約 22,000 公頃葡萄園',
    production: 'Est! Est!! Est!!! 和 Frascati 白酒',
    appellations: {
      docg: 3,
      doc: 27,
      igt: 6
    },
    mainGrapes: ['Malvasia', 'Trebbiano', 'Cesanese', 'Montepulciano'],
    characteristics: '以清新白酒為主，配搭羅馬料理',
    highlights: ['Frascati 白酒', 'Est! Est!! Est!!! di Montefiascone', 'Cesanese del Piglio']
  },
  
  abruzzo: {
    name: 'Abruzzo',
    nameCN: '阿布魯佐',
    location: '義大利中部，亞得里亞海沿岸',
    climate: '地中海氣候，受亞平寧山脈影響',
    area: '約 32,000 公頃葡萄園',
    production: 'Montepulciano d\'Abruzzo 的故鄉',
    appellations: {
      docg: 1,
      doc: 8,
      igt: 8
    },
    mainGrapes: ['Montepulciano', 'Trebbiano', 'Pecorino', 'Passerina'],
    characteristics: 'Montepulciano d\'Abruzzo 是義大利最受歡迎的紅酒之一',
    highlights: ['Montepulciano d\'Abruzzo', 'Trebbiano d\'Abruzzo', 'Pecorino 白酒']
  },
  
  campania: {
    name: 'Campania',
    nameCN: '坎帕尼亞',
    location: '義大利南部，那不勒斯所在地',
    climate: '地中海氣候，火山土壤',
    area: '約 25,000 公頃葡萄園',
    production: '古老葡萄品種的寶庫',
    appellations: {
      docg: 4,
      doc: 15,
      igt: 10
    },
    mainGrapes: ['Aglianico', 'Fiano', 'Greco', 'Falanghina'],
    characteristics: 'Taurasi（南方 Barolo）和優質白酒',
    highlights: ['Taurasi DOCG（Aglianico）', 'Fiano di Avellino', 'Greco di Tufo', 'Falanghina']
  },
  
  puglia: {
    name: 'Puglia',
    nameCN: '普利亞',
    location: '義大利南部，亞得里亞海和愛奧尼亞海之間',
    climate: '地中海氣候，炎熱乾燥',
    area: '約 86,000 公頃葡萄園',
    production: '義大利最大的葡萄酒產區之一',
    appellations: {
      docg: 4,
      doc: 28,
      igt: 6
    },
    mainGrapes: ['Primitivo', 'Negroamaro', 'Nero di Troia', 'Bombino Bianco'],
    characteristics: '強勁濃郁的紅酒，Primitivo 與 Zinfandel 同源',
    highlights: ['Primitivo di Manduria', 'Salice Salentino', 'Castel del Monte 產區']
  },
  
  basilicata: {
    name: 'Basilicata',
    nameCN: '巴西利卡塔',
    location: '義大利南部，山區為主',
    climate: '山區氣候，日夜溫差大',
    area: '約 5,000 公頃葡萄園',
    production: '小而精緻的產區，Aglianico del Vulture 聞名',
    appellations: {
      docg: 1,
      doc: 4,
      igt: 2
    },
    mainGrapes: ['Aglianico', 'Greco', 'Malvasia', 'Moscato'],
    characteristics: 'Aglianico del Vulture 火山土壤紅酒',
    highlights: ['Aglianico del Vulture Superiore DOCG', '火山土壤風土']
  },
  
  calabria: {
    name: 'Calabria',
    nameCN: '卡拉布里亞',
    location: '義大利南端，靴尖位置',
    climate: '地中海氣候，山區和海岸',
    area: '約 10,000 公頃葡萄園',
    production: '古老葡萄品種保存地',
    appellations: {
      docg: 1,
      doc: 12,
      igt: 10
    },
    mainGrapes: ['Gaglioppo', 'Greco Bianco', 'Mantonico', 'Magliocco'],
    characteristics: 'Cirò 紅酒，古希臘時期即種植葡萄',
    highlights: ['Cirò DOCG （Calabria 首個 DOCG）', 'Greco di Bianco 甜酒', '古老葡萄品種']
  },
  
  sicily: {
    name: 'Sicily',
    nameCN: '西西里',
    location: '義大利最大島嶼，地中海中心',
    climate: '地中海氣候，火山土壤（Etna）',
    area: '約 110,000 公頃葡萄園',
    production: '義大利最大葡萄酒產區',
    appellations: {
      docg: 1,
      doc: 23,
      igt: 7
    },
    mainGrapes: ['Nero d\'Avola', 'Nerello Mascalese', 'Grillo', 'Catarratto', 'Zibibbo'],
    characteristics: 'Etna 火山葡萄酒和 Marsala 加烈酒',
    highlights: ['Etna DOC 火山酒', 'Nero d\'Avola 紅酒', 'Marsala 加烈酒', 'Passito di Pantelleria 甜酒']
  },
  
  sardinia: {
    name: 'Sardegna',
    nameCN: '薩丁尼亞',
    location: '地中海第二大島',
    climate: '地中海氣候，受海風影響',
    area: '約 28,000 公頃葡萄園',
    production: 'Vermentino 白酒和 Cannonau 紅酒',
    appellations: {
      docg: 1,
      doc: 19,
      igt: 15
    },
    mainGrapes: ['Vermentino', 'Cannonau', 'Carignano', 'Monica'],
    characteristics: '獨特的島嶼風土和西班牙影響',
    highlights: ['Vermentino di Gallura DOCG', 'Cannonau di Sardegna', 'Carignano del Sulcis']
  },
  
  liguria: {
    name: 'Liguria',
    nameCN: '利古里亞',
    location: '義大利西北部，地中海沿岸',
    climate: '溫和的地中海氣候',
    area: '約 1,500 公頃葡萄園',
    production: '小而精緻，陡峭梯田葡萄園',
    appellations: {
      docg: 0,
      doc: 8,
      igt: 4
    },
    mainGrapes: ['Vermentino', 'Pigato', 'Rossese', 'Bosco'],
    characteristics: 'Cinque Terre 五漁村陡坡葡萄園',
    highlights: ['Cinque Terre 白酒', 'Rossese di Dolceacqua 紅酒', 'Sciacchetrà 甜酒']
  },
  
  molise: {
    name: 'Molise',
    nameCN: '莫利塞',
    location: '義大利中南部，小型產區',
    climate: '地中海和山區氣候',
    area: '約 6,000 公頃葡萄園',
    production: '義大利最小產區之一',
    appellations: {
      docg: 0,
      doc: 4,
      igt: 3
    },
    mainGrapes: ['Montepulciano', 'Aglianico', 'Trebbiano', 'Falanghina'],
    characteristics: '傳統葡萄酒生產，質樸風格',
    highlights: ['Biferno DOC', 'Tintilia 本地品種', 'Pentro di Isernia']
  }
}
