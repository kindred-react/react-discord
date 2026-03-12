# React Discord - 跨平台架构 (四端统一)

这是一个支持 **Web、桌面端、移动端** 的 Discord 克隆项目，基于 React + Tauri + React Native。

## 架构概览

```
react-discord/
├── src/
│   ├── shared/              # 共享代码 (100% 复用)
│   │   ├── types/          # TypeScript 类型定义
│   │   └── stores/         # Zustand 状态管理
│   ├── platform/           # 平台适配层
│   │   ├── api/           # API 服务 (Socket, Tauri)
│   │   ├── components/    # 跨平台 UI 组件
│   │   └── utils/         # 平台检测工具
│   ├── mobile/            # React Native 移动端
│   └── web/               # Web 端 (Vite)
├── src-tauri/            # Tauri 桌面端 (Rust)
└── CROSS_PLATFORM.md     # 架构文档
```

## 平台支持

| 平台 | 技术栈 | 构建命令 |
|------|--------|----------|
| **Web** | Vite + React | `npm run dev` |
| **Desktop** | Tauri 2.0 + Rust | `npm run tauri:dev` |
| **iOS** | Expo + React Native | `npx expo run:ios` |
| **Android** | Expo + React Native | `npx expo run:android` |

## 快速开始

### 1. Web 端 (现有)

```bash
npm install
npm run dev
```

### 2. 桌面端 (Tauri)

**前置要求:**
- [Rust](https://rustup.rs/) (stable)
- Node.js 18+
- Windows/macOS/Linux

**构建桌面应用:**

```bash
# 安装 Rust (如果未安装)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 Tauri CLI
npm install -D @tauri-apps/cli

# 开发模式运行
npm run tauri:dev

# 构建发布版本
npm run tauri:build
```

### 3. 移动端 (React Native/Expo)

```bash
# 创建新的 Expo 项目
npx create-expo-app discord-mobile
cd discord-mobile

# 复制共享代码
cp -r ../react-discord/src/shared ./src/
cp -r ../react-discord/src/platform ./src/

# 安装依赖
npm install zustand socket.io-client
npx expo install react-native react-native-safe-area-context @react-navigation/native @react-navigation/native-stack

# 运行
npx expo run:ios
# 或
npx expo run:android
```

## 平台检测

```typescript
import { getPlatform, isDesktop, isMobile, isWeb } from '../platform/utils/platform'

// 检测当前平台
const platform = getPlatform() // 'web' | 'desktop' | 'ios' | 'android'

if (isDesktop()) {
  // Tauri 桌面端特定逻辑
}

if (isMobile()) {
  // 移动端特定逻辑
}
```

## Tauri 服务

```typescript
import { tauriService } from '../platform/api/tauriService'

// 初始化
await tauriService.init()

// 窗口控制
await tauriService.minimizeWindow()
await tauriService.maximizeWindow()
await tauriService.closeWindow()

// 外部链接
await tauriService.openExternal('https://discord.com')
```

## 核心特性

- **100% 代码共享**: 类型、状态管理、业务逻辑完全复用
- **原生性能**: Tauri 桌面端 < 10MB 安装包
- **真实原生**: React Native 移动端体验
- **热更新**: 开发时无需重新编译

## 项目结构说明

- `src/shared/` - 所有平台共用的业务逻辑
- `src/platform/` - 平台适配层，包含:
  - `api/` - API 服务抽象
  - `components/` - 跨平台 UI 组件
  - `utils/` - 平台检测工具
- `src/mobile/` - React Native 特定代码
- `src-tauri/` - Rust 桌面端代码
