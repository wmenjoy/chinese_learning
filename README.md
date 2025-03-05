# 汉字学习助手 (Chinese Character Learning Assistant)

一个现代化的汉字学习应用，帮助用户学习和练习汉字书写。使用 React、TypeScript 和 Vite 构建，提供直观的用户界面和丰富的学习功能。

## ✨ 特色功能

### 1. 汉字学习 (Character Learning)
- 📝 交互式汉字书写练习
- 🎯 多种演示模式：
  - 整体演示：完整展示汉字笔画
  - 部件演示：使用不同颜色展示汉字结构
  - 分步演示：逐步展示笔画过程
- ✍️ 标准米字格背景辅助书写
- 🔄 练习模式支持反复练习

### 2. 汉字词典 (Character Dictionary)
- 🔍 快速汉字查询
- 📚 详细的汉字信息：
  - 拼音标注
  - 部首信息
  - 笔画数量
  - 字义解释
  - 常用词组
- 📖 字源信息（适用时）
- ✏️ 互动式笔画演示

### 3. 拼音转换 (Pinyin Converter)
- 🔤 汉字到拼音的快速转换
- 🎵 支持声调显示
- 📝 批量文本处理

## 🚀 快速开始

### 系统要求
- Node.js 16.0 或更高版本
- pnpm 7.0 或更高版本

### 安装步骤

1. 克隆仓库
```bash
git clone [repository-url]
cd chinese-learning
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm dev
```

4. 构建生产版本
```bash
pnpm build
```

## 🛠️ 技术栈

- **前端框架**: React 18
- **开发语言**: TypeScript
- **构建工具**: Vite
- **样式解决方案**: styled-components
- **汉字处理**: hanzi-writer
- **状态管理**: React Hooks
- **包管理器**: pnpm

## 📦 项目结构

```
chinese-learning/
├── src/
│   ├── components/     # 可复用组件
│   ├── pages/         # 页面组件
│   ├── services/      # 服务层
│   ├── types/         # TypeScript 类型定义
│   ├── styles/        # 全局样式
│   └── App.tsx        # 应用入口
├── public/            # 静态资源
├── index.html         # HTML 模板
├── vite.config.ts     # Vite 配置
└── package.json       # 项目配置
```

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出改进建议！请遵循以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📝 开发计划

### 待实现功能
- [ ] 用户账户系统
- [ ] 学习进度追踪
- [ ] 智能识别书写
- [ ] 更多汉字数据
- [ ] 移动端适配优化
- [ ] 学习数据统计
- [ ] 社交分享功能

### 技术优化
- [ ] 性能优化
- [ ] 离线支持
- [ ] 测试覆盖
- [ ] CI/CD 流程
- [ ] 代码重构

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

- 开发者名字 - [@开发者GitHub用户名](https://github.com/username)

## 🙏 致谢

- [hanzi-writer](https://github.com/chanind/hanzi-writer) - 优秀的汉字书写动画库
- [React](https://reactjs.org/) - 用户界面构建库
- [Vite](https://vitejs.dev/) - 现代前端构建工具
