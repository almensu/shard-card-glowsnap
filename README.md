# 🚀 GlowSnap: Professional Image Mockup Generator

GlowSnap is a high-end "Code/Text to Image" utility designed for developers, technical writers, and social media creators who want to transform raw Markdown or code snippets into aesthetically pleasing, shareable mockups.

---

## 💻 本地运行与安装 (Local Setup)

这是一个标准的 Vite 前端项目。您可以直接通过以下步骤在本地 `localhost:3000` 启动。

### 1. 快速一键启动
脚本会自动检测您的 `~/.zshrc` 并提取 `ZHIPU_API_KEY`。
```bash
chmod +x start.sh
./start.sh
```

### 2. 手动安装与运行
如果您更喜欢手动操作：

**使用 Bun (推荐):**
```bash
bun install
# 脚本会自动读取环境中的 ZHIPU_API_KEY
API_KEY=$ZHIPU_API_KEY bun dev
```

**使用 NPM:**
```bash
npm install
API_KEY=$ZHIPU_API_KEY npm run dev
```

---

## ✨ 核心特性 (Core Features)

### 🎨 视觉与美学设计
- **动态渐变背景**: 支持双色线性渐变，角度 0° 到 360° 可调。
- **Accent Light (Color C)**: 独特的径向“氛围光”图层。
  - **交互式定位**: 点击预览画布任意位置即可瞬间移动光源中心。
  - **扩散控制**: 自由调整光晕的范围与强度，营造深邃的 3D 质感。
- **环境切换**: 一键切换工作区 **Deep Space (Dark)** 与 **Clean Paper (Light)** 模式。
- **磨砂玻璃效果 (Glassmorphism)**: 窗口边缘带有细腻的高光遮罩，增强空间层次感。

### 🛠 布局与窗口控制
- **精准调节**: 提供 Padding、Border Radius、Font Size 的滑动条，并实时显示 `px` 数值反馈。
- **macOS 风格控件**: 经典的红黄绿三色窗体控制按钮。
- **内置主题**: 预设 `Dark`、`Light` 和 `Obsidian` 三种窗体内部配色。

### 💾 主题管理与迁移
- **保存与命名**: 随时将当前的视觉配置（背景、光源、边距等）存为自定义主题。
- **本地存储**: 主题持久化保存在浏览器 LocalStorage 中。
- **导入/导出 (JSON)**:
  - 支持将主题导出为 `.json` 文件备份。
  - 支持点击 **Import** 按钮读取 `.json` 文件快速恢复配置。
- **CLI 命令导出**: 每一个主题都可以生成一段紧凑的命令行参数，方便在不同设备间快速同步。

### 🤖 AI 增强功能
- **Gemini 集成**: 使用 `gemini-3-flash-preview` 模型一键润色 Markdown 内容，将其转化为更加专业、适合社交媒体传播的文案。

### ⌨️ 内部命令行 (Internal CLI)
按下 `/` 或 `Ctrl + K` 唤起。

- `config --p 80 --r 20`: 快速调整参数。
- `theme obsidian`: 切换窗体风格。
- `ai`: 启动 AI 文本美化。
- `export`: 快速下载图片。

---

## 🖼 导出质量
- **2x Retina**: 采用双倍像素比导出，确保在高分辨率屏幕上文字与边缘依然锐利。
- **透明阴影**: 高质量的阴影渲染技术，完美保留窗口下方的环境遮挡（Ambient Occlusion）质感。

---

## 🏗 项目结构 (Project Structure)

```text
.
├── components/          # 核心 UI 组件
│   ├── CommandBar.tsx   # 终端命令行工具
│   ├── PreviewWindow.tsx # 预览画布 (带 Accent Light)
│   └── Sidebar.tsx      # 参数控制面板
├── App.tsx              # 应用主逻辑
├── index.tsx            # 入口文件
├── types.ts             # 类型定义
├── vite.config.ts       # Vite 配置
└── tsconfig.json        # TypeScript 配置
```
