# ================================================================
# Basilicata Slides 插入脚本
# 目的: 从临时文件读取6个专业slides并插入到L2M3L3.json
# ================================================================

# 文件路径定义
$sourceFile = "c:\Users\Chungshu\AppData\Roaming\Code\User\workspaceStorage\5a2fbb3e83282d1d6bb781d82836ab4c\GitHub.copilot-chat\chat-session-resources\6d5524a1-e748-4c6a-8d61-3aa085c5e3ca\toolu_bdrk_01DmZTdUBg5Fm58ksTHg5MvH__vscode-1772802721188\content.txt"
$targetFile = "c:\Users\Chungshu\Desktop\教學網站製作20260220\Italy Wine Learning-map\public\courses\level2\L2M3L3.json"
$backupFile = "$targetFile.backup"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Basilicata Slides 插入工具" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 步骤1: 验证源文件存在
Write-Host "[1/6] 验证源文件..." -ForegroundColor Yellow
if (-not (Test-Path $sourceFile)) {
    Write-Host "❌ 错误: 源文件不存在!" -ForegroundColor Red
    Write-Host "路径: $sourceFile" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 源文件存在" -ForegroundColor Green

# 步骤2: 读取源文件内容
Write-Host "`n[2/6] 读取源文件..." -ForegroundColor Yellow
$sourceContent = Get-Content $sourceFile -Raw -Encoding UTF8

# 步骤3: 提取6个slides
Write-Host "`n[3/6] 提取slides..." -ForegroundColor Yellow
$slides = @()

# 分割内容，提取每个slide
$parts = $sourceContent -split '===SLIDE \d+==='

# 提取slides 1-6 (索引1-6，因为索引0是开头文本)
for ($i = 1; $i -le 6; $i++) {
    if ($i -lt $parts.Count) {
        $slideContent = $parts[$i].Trim()
        
        # 移除可能存在的```html或```结尾标记
        $slideContent = $slideContent -replace '^```html\s*', ''
        $slideContent = $slideContent -replace '\s*```$', ''
        
        # 查找下一个===SLIDE标记或```结束标记，截取到该位置
        if ($slideContent -match '^(.*?)(?=(?:===SLIDE|```)|\Z)' ) {
            $slideContent = $matches[1].Trim()
        }
        
        $slides += $slideContent
        Write-Host "  ✓ Slide $i 提取完成 (${slideContent.Length} 字符)" -ForegroundColor Green
    }
}

Write-Host "`n✓ 成功提取 $($slides.Count) 个slides" -ForegroundColor Green

if ($slides.Count -ne 6) {
    Write-Host "⚠ 警告: 期望6个slides，实际提取了 $($slides.Count) 个" -ForegroundColor Yellow
}

# 步骤4: 读取目标JSON文件
Write-Host "`n[4/6] 读取目标JSON文件..." -ForegroundColor Yellow
if (-not (Test-Path $targetFile)) {
    Write-Host "❌ 错误: 目标文件不存在!" -ForegroundColor Red
    Write-Host "路径: $targetFile" -ForegroundColor Red
    exit 1
}

# 创建备份
Copy-Item $targetFile $backupFile -Force
Write-Host "✓ 已创建备份: $backupFile" -ForegroundColor Green

$jsonContent = Get-Content $targetFile -Raw -Encoding UTF8
$originalSize = $jsonContent.Length

# 步骤5: 解析JSON并插入slides
Write-Host "`n[5/6] 插入slides到JSON..." -ForegroundColor Yellow

try {
    # 解析JSON
    $jsonObj = $jsonContent | ConvertFrom-Json
    
    # 获取当前content
    $currentContent = $jsonObj.content
    
    # 合并所有新slides为一个字符串
    $newSlidesHtml = ($slides -join "`n")
    
    # 查找插入位置: 在最后的</div></div>之前插入
    # 首先找到slides容器的结束位置
    $insertPattern = '</div><style>'
    
    if ($currentContent -match $insertPattern) {
        # 在</div><style>之前插入新slides
        $currentContent = $currentContent -replace '(</div>)(<style>)', "`$1$newSlidesHtml`$2"
        Write-Host "✓ 在</div><style>之前插入slides" -ForegroundColor Green
    }
    else {
        # 如果找不到上述模式，尝试在slides结束标签之前插入
        $insertPattern2 = '</div></div><style>'
        if ($currentContent -match $insertPattern2) {
            $currentContent = $currentContent -replace '(</div></div>)(<style>)', "`$1$newSlidesHtml`$2"
            Write-Host "✓ 在</div></div><style>之前插入slides" -ForegroundColor Green
        }
        else {
            Write-Host "⚠ 警告: 未找到标准插入点，尝试在第一个<style>标签之前插入" -ForegroundColor Yellow
            $currentContent = $currentContent -replace '(<style>)', "$newSlidesHtml`$1"
        }
    }
    
    # 更新JSON对象
    $jsonObj.content = $currentContent
    
    # 转换回JSON格式
    $newJsonContent = $jsonObj | ConvertTo-Json -Depth 100 -Compress:$false
    
    # 步骤6: 保存文件
    Write-Host "`n[6/6] 保存文件..." -ForegroundColor Yellow
    $newJsonContent | Out-File $targetFile -Encoding UTF8 -NoNewline
    
    $newSize = (Get-Item $targetFile).Length
    
    Write-Host "✓ 文件保存成功" -ForegroundColor Green
    
    # 显示结果
    Write-Host "`n================================================" -ForegroundColor Cyan
    Write-Host "   插入完成!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 统计信息:" -ForegroundColor Cyan
    Write-Host "  • 成功插入slides数量: $($slides.Count)" -ForegroundColor White
    Write-Host "  • 原始文件大小: $([math]::Round($originalSize/1KB, 2)) KB" -ForegroundColor White
    Write-Host "  • 新文件大小: $([math]::Round($newSize/1KB, 2)) KB" -ForegroundColor White
    Write-Host "  • 增加大小: $([math]::Round(($newSize - $originalSize)/1KB, 2)) KB" -ForegroundColor White
    Write-Host ""
    Write-Host "📁 文件位置:" -ForegroundColor Cyan
    Write-Host "  • 目标文件: $targetFile" -ForegroundColor White
    Write-Host "  • 备份文件: $backupFile" -ForegroundColor White
    Write-Host ""
    
    # 验证JSON格式
    Write-Host "🔍 验证JSON格式..." -ForegroundColor Cyan
    try {
        $testParse = Get-Content $targetFile -Raw | ConvertFrom-Json
        Write-Host "  ✓ JSON格式正确" -ForegroundColor Green
        Write-Host "  ✓ Content字段长度: $($testParse.content.Length) 字符" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ JSON格式验证失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  正在恢复备份..." -ForegroundColor Yellow
        Copy-Item $backupFile $targetFile -Force
        Write-Host "  ✓ 已恢复备份文件" -ForegroundColor Green
        exit 1
    }
    
    Write-Host "`n✅ 所有操作完成！" -ForegroundColor Green
    
}
catch {
    Write-Host "❌ 错误: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "正在恢复备份..." -ForegroundColor Yellow
    Copy-Item $backupFile $targetFile -Force
    Write-Host "✓ 已恢复备份文件" -ForegroundColor Green
    exit 1
}
