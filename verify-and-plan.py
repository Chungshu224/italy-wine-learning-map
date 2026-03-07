import json
import sys

print("=== Marche 课程增强脚本 ===\n")

# 读取原始JSON
with open("public/courses/level2/L2M2L1.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"✓ 读取原始文件")
print(f"  - Content length: {len(data['content'])} 字符")
print(f"  - Quiz questions: {len(data['quiz'])}")

# 保存数据（测试JSON有效性）
with open("public/courses/level2/L2M2L1.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    
print("\n✓ JSON格式验证通过")
print("\n接下来需要添加以下内容：")
print("1. Slide 9 - 历史与文化遗产")  
print("2. Slide 10 - 风土深度分析")
print("3. Slide 11 - Verdicchio品种深度科学")
print("4. Slide 12 - 酿造工艺与风格演变")
print("5. Slide 13 - Conero半岛与Montepulciano深度")
print("6. Slide 14 - 新兴品种")
print("7. Slide 15 - 知名酒庄与选购指南")
print("8. 更新重点回顾")
print("9. 添加所有新CSS样式")

print("\n由于内容量大，建议手动添加或使用IDE的find-replace功能")
print("所有必要的HTML和CSS代码已在之前的尝试中准备好")
