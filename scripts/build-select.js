#!/usr/bin/env node

import inquirer from 'inquirer'
import { execSync } from 'child_process'

const choices = [
  { name: 'Web 端 (静态网站)', value: 'web' },
  { name: '桌面端 (Windows/macOS/Linux)', value: 'desktop' },
  { name: 'iOS (需要 macOS + Xcode)', value: 'ios' },
  { name: 'Android APK', value: 'android' },
  { name: '全部平台', value: 'all' },
]

async function main() {
  console.log('\n========================================')
  console.log('   Discord Clone - 选择打包目标')
  console.log('========================================\n')

  choices.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name}`)
  })
  console.log('\n========================================\n')

  const { choice } = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'choice',
      message: '请选择打包目标:',
      choices: choices,
      pageSize: 10,
    },
  ])

  console.log('')

  try {
    switch (choice) {
      case 'web':
        console.log('📦 打包 Web 端...\n')
        execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() })
        break
      case 'desktop':
        console.log('📦 打包桌面端...\n')
        execSync('npm run tauri:build', { stdio: 'inherit', cwd: process.cwd() })
        break
      case 'ios':
        console.log('📦 打包 iOS...\n')
        execSync('npm run tauri ios build', { stdio: 'inherit', cwd: process.cwd() })
        break
      case 'android':
        console.log('📦 打包 Android APK...\n')
        execSync('npm run tauri android build', { stdio: 'inherit', cwd: process.cwd() })
        break
      case 'all':
        console.log('📦 打包全部平台...\n')
        console.log('📦 [1/2] 打包 Web 端...')
        execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() })
        console.log('\n📦 [2/2] 打包桌面端...')
        execSync('npm run tauri:build', { stdio: 'inherit', cwd: process.cwd() })
        break
    }
    console.log('\n✅ 打包完成!\n')
  } catch (error) {
    console.error('\n❌ 打包失败:', error.message)
    process.exit(1)
  }
}

main()
