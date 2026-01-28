
export type GradientType = 'linear' | 'radial' | 'conic';

export interface AppSettings {
  content: string;
  padding: number;
  borderWidth: number;
  borderRadius: number;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  // Color C - Radial Accent
  useColorC: boolean;
  gradientColorC: string;
  colorCPosition: { x: number; y: number };
  colorCRange: number;
  showWindowControls: boolean;
  fontSize: number;
  opacity: number;
  shadow: number;
  theme: 'dark' | 'light' | 'obsidian';
}

export interface SavedTheme {
  id: string;
  name: string;
  settings: Partial<AppSettings>;
}

export const DEFAULT_SETTINGS: AppSettings = {
  content: "### 🚀 GLOWSNAP\n\nA high-performance **Markdown Beautifier**.\n\n- Paste your code or text\n- Customize the gradient\n- Export as PNG\n\n```javascript\nconsole.log('Hello World');\n```",
  padding: 60,
  borderWidth: 1,
  borderRadius: 16,
  gradientStart: "#3b82f6",
  gradientEnd: "#9333ea",
  gradientAngle: 135,
  useColorC: false,
  gradientColorC: "#ffffff",
  colorCPosition: { x: 50, y: 50 },
  colorCRange: 50,
  showWindowControls: true,
  fontSize: 16,
  opacity: 100,
  shadow: 40,
  theme: 'dark'
};
