# gg122ma.github.io
# 摄影素材档案管理系统

一个面向摄影团队的可视化素材归档与检索平台，支持按时间线浏览拍摄作品、查看拍摄详情并跳转 Google Drive 下载原始素材。

## 技术栈

- **前端**：原生 HTML / CSS / JavaScript（SPA 单页应用）
- **后端 & 数据库**：Supabase（PostgreSQL）
- **图片资源**：Unsplash（默认封面）
- **版本管理**：GitHub

## 功能特性

- 基于 `location.hash` 的纯前端路由系统，支持首页 / 月份列表 / 素材详情三级页面无刷新切换
- 图片画廊：主图 + 缩略图联动，支持键盘左右箭头导航，opacity 渐变过渡
- 动态导航菜单：根据数据库实际数据生成年月下拉面板，仅含数据的月份可点击
- Hero 区域视差滚动效果
- 卡片交错入场动画（IntersectionObserver）
- 事件监听自动清理，避免内存泄漏
- 响应式布局

## 数据结构

Supabase `shoots` 表字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| slug | text | 唯一标识，用于路由 |
| shoot_date | date | 拍摄日期 |
| year_num | int | 年份 |
| month_num | int | 月份 |
| title | text | 标题 |
| description | text | 简介 |
| people | jsonb | 人物数组 |
| equipment | text | 拍摄设备 |
| drive_link | text | Google Drive 下载链接 |
| cover_url | text | 封面图 URL |

## 开发工具

| 工具 | 用途 |
|------|------|
| MiMo v2.5 Pro | 代码生成、逻辑设计、调试排错 |
| Claude Code | 代码审查、架构建议 |

本项目由零编程基础通过 AI 辅助独立完成，AI 承担了 Supabase 连接配置、路由设计、画廊交互逻辑和动画系统的代码生成与调试。
