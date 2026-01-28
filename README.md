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

您可以使用 `download_png.sh` 脚本，完全不经过图形界面操作，直接从终端生成并下载图片。

### 使用示例
```bash
chmod +x download_png.sh
./download_png.sh "### Hello World\nThis was generated via CLI!" config --p 40 --r 20 --f 18 --s #3b82f6 --e #9333ea
```

### 参数说明 (Flags)
- `--p`: 内边距 (Padding)
- `--r`: 圆角 (Radius)
- `--f`: 字体大小 (Font Size)
- `--a`: 渐变角度 (Angle)
- `--s`: 渐变起点颜色 (Start Hex)
- `--e`: 渐变终点颜色 (End Hex)
- `--c`: 氛围光颜色 (Accent Color Hex)
- `--cr`: 氛围光范围 (Range)
- `--cx`/`--cy`: 氛围光位置 (Position X/Y)

---

## ✨ 核心特性

- **Accent Light**: 点击画布任意位置调整光源。
- **2x Retina**: 自动导出双倍分辨率 PNG。
- **Theme Sync**: 支持 JSON 导入导出与 CLI 参数同步。
- **Port Cleanup**: `start.sh` 自动管理端口占用。
- **Production-Ready CSS**: 使用本地 PostCSS 编译，避免 CDN 警告。
