# React Discord - 跨平台架构 (Tauri 2.0 统一四端)

这是一个支持 **Web、桌面端、移动端** 的 Discord 克隆项目，基于 React + Tauri 2.0。

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
│   ├── mobile/            # 移动端特定代码 (可选)
│   └── pages/            # Web/桌面端页面
├── src-tauri/            # Tauri 2.0 (Rust)
└── CROSS_PLATFORM.md     # 架构文档
```

## 平台支持

| 平台 | 技术栈 | 构建命令 | 环境要求 |
|------|--------|----------|----------|
| **Web** | Vite + React | `npm run dev` | - |
| **Desktop** | Tauri 2.0 + Rust | `npm run tauri:build` | Rust |
| **iOS** | Tauri 2.0 + Rust | `npm run tauri ios build` | macOS + Xcode |
| **Android** | Tauri 2.0 + Rust | `npm run tauri android build` | Android SDK |

## 快速开始

### 1. Web 端

```bash
npm install
npm run dev
```

### 2. 桌面端 (Tauri)

```bash
# 开发模式运行
npm run tauri:dev

# 构建桌面应用
npm run tauri:build
```

### 3. iOS (需要 macOS)

```bash
# 初始化 iOS 项目（首次）
npm run tauri ios init

# 构建 iOS 应用
npm run tauri ios build
```

### 4. Android

**前置要求:**
- [Android Studio](https://developer.android.com/studio) 安装
- 设置 `ANDROID_HOME` 环境变量

```bash
# 初始化 Android 项目（首次）
npm run tauri android init

# 构建 Android 应用
npm run tauri android build
```

## 环境配置问题排查

### iOS 常见问题

1. **证书问题**: 需要 Apple Developer 证书
   - 运行 `tauri info` 查看可用证书
   - 在 `tauri.conf.json` 中设置 `bundle.iOS.developmentTeam`

2. **CocoaPods 问题**: 需要 macOS 命令行工具
   ```bash
   sudo xcode-select --install
   ```

### Android 常见问题

1. **Android SDK 未安装**:
   - 下载 [Android Studio](https://developer.android.com/studio)
   - 或使用命令行工具 [sdkmanager](https://developer.android.com/studio/command-line/sdkmanager)

2. **设置环境变量**:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
   ```

## 平台检测

```typescript
import { getPlatform, isDesktop, isMobile, isWeb } from '../platform/utils/platform'

const platform = getPlatform() // 'web' | 'desktop' | 'ios' | 'android'

if (isDesktop()) {
  // 桌面端特定逻辑
}

if (isMobile()) {
  // 移动端特定逻辑
}
```

## Tauri 服务

```typescript
import { tauriService } from '../platform/api/tauriService'

await tauriService.init()
await tauriService.minimizeWindow()
await tauriService.maximizeWindow()
await tauriService.closeWindow()
```

## 核心特性

- **一套代码，四端运行**: Web、桌面端、iOS、Android
- **原生性能**: Tauri 安装包 < 10MB
- **Rust 后端**: 高性能、安全
