# 🚀 GlowSnap: Professional Image Mockup Generator

GlowSnap is a high-end "Code/Text to Image" utility designed for technical creators.

---

## 💻 本地运行与安装 (Local Setup)

```bash
chmod +x start.sh
./start.sh
```
*提示：`start.sh` 会自动检测并关闭占用 3000 端口的进程，并确保所有依赖项已正确安装。*

---

## 🎨 Tailwind CSS 配置说明 (LLM Guidance)

如果您在浏览器控制台中看到 `cdn.tailwindcss.com should not be used in production` 警告，这是因为旧版本使用了 CDN。本项目现已切换为 **PostCSS 编译模式**。

### 给 LLM 的开发建议:
1. **依赖安装**: 确保 `package.json` 中包含 `tailwindcss`, `postcss`, `autoprefixer`。
2. **样式修改**: 请直接修改 `index.css` 或在 React 组件中使用 Tailwind Utility classes。不要在 `index.html` 中重新引入 CDN 脚本。
3. **配置文件**: 
   - `tailwind.config.js`: 定义了内容扫描路径和字体配置。
   - `postcss.config.js`: 处理 CSS 编译插件。
4. **编译流程**: 运行 `npm run dev` 时，Vite 会自动调用 PostCSS 处理样式，实时更新 `index.css`。

---

## ⌨️ 命令行自动化 (CLI Automation)

GlowSnap 提供两个 CLI 脚本，分别用于 **Markdown 文本** 和 **图片** 两种模式。

### 模式对比

| 特性 | Markdown 模式 | 图片模式 |
|------|--------------|----------|
| 脚本名称 | `download_png.sh` | `add-image.sh` |
| 输入 | Markdown 文本 | 本地图片文件 |
| 输出 | 渲染的代码/文本卡片 | 带渐变包边的图片 |
| 窗口控制 | ✅ 显示红黄绿按钮 | ❌ 无窗口控制 |
| 支持格式 | Markdown 纯文本 | PNG, JPG, GIF, WebP |
| 文件大小 | 小 (文本) | 大 (图片 base64) |

---

### 📝 Markdown 模式 (Text to Image)

将 Markdown 代码/文本转换为精美的图片卡片。

**用法**:
```bash
chmod +x download_png.sh
./download_png.sh "Markdown内容" [参数]
```

**基本示例**:
```bash
./download_png.sh "### Hello World\nThis is **bold** text" --p 40 --r 20
```

**代码示例**:
```bash
./download_png.sh "```javascript\nconsole.log('Hello');\n```" --s 3b82f6 --e 9333ea
```

---

### 🖼️ 图片模式 (Image with Gradient Border)

给本地图片添加渐变包边效果并自动导出。

**用法**:
```bash
chmod +x add-image.sh
./add-image.sh <图片路径> [参数]
```

**基本示例**:
```bash
./add-image.sh ./photo.png --p 60 --r 20 --s ff0000 --e 0000ff
```

**工作原理**:
1. 读取本地图片并转换为 base64
2. 启动临时 HTTP 服务器 (localhost:19567)
3. 打开浏览器自动处理并下载到 Downloads 文件夹
4. 15 秒后自动清理临时文件

---

### 通用参数 (Flags)

两个脚本支持相同的参数：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--p` | 内边距 (Padding) | 60 |
| `--r` | 圆角 (Radius) | 16 |
| `--f` | 字体大小 (Font Size) | 16 |
| `--a` | 渐变角度 (Angle) | 135 |
| `--s` | 渐变起点颜色 (Start Hex) | 3b82f6 |
| `--e` | 渐变终点颜色 (End Hex) | 9333ea |
| `--c` | 氛围光颜色 (Accent Color) | - |
| `--cr` | 氛围光范围 (Range) | 50 |
| `--cx` | 氛围光 X 位置 (%) | 50 |
| `--cy` | 氛围光 Y 位置 (%) | 50 |

---

### 使用示例

#### Markdown 模式示例

**默认样式**:
```bash
./download_png.sh "### 🚀 GlowSnap\n\nBeautiful **code** snippets"
```

**蓝紫渐变**:
```bash
./download_png.sh "# Title\n\n- Item 1\n- Item 2" --s 3b82f6 --e 9333ea
```

**完整配置**:
```bash
./download_png.sh "```js\nconst x = 42;\n```" --p 40 --r 20 --f 18 --s ff0000 --e 0000ff
```

#### 图片模式示例

**默认蓝紫渐变**:
```bash
./add-image.sh ./screenshot.png
```

**自定义渐变** (浅蓝 → 橙色):
```bash
./add-image.sh ./photo.png --s becde6 --e ffa361
```

**红橙渐变**:
```bash
./add-image.sh ./photo.png --s ff0000 --e ff8800
```

**绿色单色**:
```bash
./add-image.sh ./image.png --s 00ff00 --e 00ff00
```

**带氛围光效果**:
```bash
./add-image.sh ./pic.png --s 3b82f6 --e 9333ea --c ffffff --cr 60 --cx 80 --cy 30
```

**完整示例** (yanghoo205 主题):
```bash
./add-image.sh ./poster.jpg \
  --p 20 \
  --r 20 \
  --s becde6 \
  --e ffa361 \
  --a 135 \
  --c 028ede \
  --cr 47 \
  --cx 81 \
  --cy 27
```

---

## ✨ 核心特性

- **Accent Light**: 点击画布任意位置调整光源。
- **2x Retina**: 自动导出双倍分辨率 PNG。
- **Theme Sync**: 支持 JSON 导入导出与 CLI 参数同步。
- **Port Cleanup**: `start.sh` 自动管理端口占用。
- **Production-Ready CSS**: 使用本地 PostCSS 编译，避免 CDN 警告。
