# Discord Clone - 跨平台 Discord 克隆应用

基于 React + Tauri 2.0 的跨平台 Discord 聊天应用，支持 Web、桌面端（Windows/macOS/Linux）、iOS 和 Android。

## 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | React 19 + TypeScript |
| **构建工具** | Vite 7 |
| **桌面/移动端** | Tauri 2.0 (Rust) |
| **状态管理** | Zustand |
| **样式方案** | Tailwind CSS 4 |
| **动画** | Framer Motion |
| **表单** | React Hook Form + Zod |
| **路由** | React Router DOM 7 |
| **图标** | Lucide React |
| **虚拟列表** | TanStack Virtual |

## 项目结构

```
react-discord/
├── src/
│   ├── components/         # UI 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── mobile/             # 移动端特定代码
│   ├── pages/              # 页面组件
│   ├── platform/           # 平台适配层
│   ├── services/           # 服务层
│   ├── shared/             # 共享代码 (stores, types)
│   │   ├── stores/         # Zustand 状态管理
│   │   └── types/          # TypeScript 类型定义
│   ├── App.tsx             # 主应用入口
│   └── main.tsx            # Web 入口
├── src-tauri/              # Tauri Rust 后端
│   ├── src/                # Rust 源代码
│   ├── capabilities/        # 权限配置
│   └── gen/                # 生成的代码
├── public/                  # 静态资源
└── package.json            # 项目配置
```

## 功能特性

- ✅ 用户登录认证
- ✅ 服务器/频道管理
- ✅ 实时消息收发
- ✅ 语音频道面板
- ✅ 响应式设计
- ✅ 跨平台支持 (Web/Desktop/iOS/Android)

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 交互式选择启动方式
npm run dev:select

# 或直接指定平台
npm run dev          # Web 端
npm run tauri:dev    # 桌面端
```

### 构建打包

```bash
# 交互式选择打包目标
npm run build:select

# 或直接指定平台
npm run tauri:build # 桌面端 (Windows/macOS/Linux)
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Web 开发服务器 |
| `npm run tauri:dev` | 启动桌面端开发模式 |
| `npm run tauri:build` | 构建桌面端应用 |
| `npm run tauri:ios` | 构建 iOS 应用 (需要 macOS + Xcode) |
| `npm run tauri:android` | 构建 Android 应用 |
| `npm run build` | 构建 Web 前端 |
| `npm run lint` | 代码检查 |

## 环境要求

- **通用**: Node.js 20+, npm 9+
- **桌面端**: Rust 1.70+
- **iOS**: macOS + Xcode 15+
- **Android**: Android Studio + NDK

## 平台检测

项目包含平台检测工具：

```typescript
import { getPlatform, isDesktop, isMobile, isWeb } from './platform/utils/platform'

// 返回: 'web' | 'desktop' | 'ios' | 'android'
const platform = getPlatform()
```

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由

### 添加新组件

1. 在 `src/components/` 创建组件
2. 使用 `clsx` 和 `tailwind-merge` 处理 className

### 状态管理

使用 Zustand 创建 store：

```typescript
import { create } from 'zustand'

interface AppState {
  count: number
  increment: () => void
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

## 许可证

MIT
