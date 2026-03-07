import json
import sys

# 读取备份
with open("public/courses/level2/L2M2L1.json.backup", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"原始 content 长度: {len(data['content'])} 字符")
print(f"原始 quiz 数量: {len(data['quiz'])} 题")

# 由于内容太长，建议分步操作
# 这个脚本作为示例展示如何处理
print("\n建议：使用文件编辑工具分步添加内容")
print("1. 先添加新slides的HTML")  
print("2. 再添加新的CSS样式")
print("3. 最后验证JSON格式")
