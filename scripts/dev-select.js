#!/usr/bin/env node

import inquirer from 'inquirer'
import { execSync } from 'child_process'

const choices = [
  { name: 'Web 端 (Vite + React)', value: 'web' },
  { name: '桌面端 (Tauri)', value: 'desktop' },
  { name: 'iOS 模拟器 (Tauri)', value: 'ios' },
  { name: 'Android 模拟器 (Tauri)', value: 'android' },
]

async function main() {
  console.log('\n========================================')
  console.log('   Discord Clone - 选择启动模式')
  console.log('========================================\n')

  choices.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name}`)
  })
  console.log('\n========================================\n')

  const { choice } = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'choice',
      message: '请选择启动模式:',
      choices: choices,
      pageSize: 10,
    },
  ])

  console.log('')

  try {
    switch (choice) {
      case 'web':
        console.log('🚀 启动 Web 端...\n')
        execSync('npm run dev', { stdio: 'inherit', cwd: process.cwd() })
        break
      case 'desktop':
        console.log('🚀 启动桌面端...\n')
        execSync('npm run tauri:dev', { stdio: 'inherit', cwd: process.cwd() })
        break
      case 'ios':
        console.log('🚀 启动 iOS 模拟器...\n')
        execSync('npm run tauri ios dev', { stdio: 'inherit', cwd: process.cwd() })
        break
      case 'android':
        console.log('🚀 启动 Android 模拟器...\n')
        execSync('npm run tauri android dev', { stdio: 'inherit', cwd: process.cwd() })
        break
    }
  } catch (error) {
    console.error('\n❌ 启动失败:', error.message)
    process.exit(1)
  }
}

main()
