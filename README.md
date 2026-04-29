# 🎈 单词气球挑战 — Word Balloon Challenge

> 快乐背单词，打气球，拿星星！一个专为儿童设计的趣味英语单词学习网页应用。
> A fun, child-friendly web app for learning English vocabulary through balloon-popping and car-racing games.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ 功能特点 / Features

### 🎯 学习模式 / Learning Modes

| 模式 | 说明 |
|------|------|
| **🎈 气球模式** | 单词以彩色气球漂浮在屏幕上，点击正确的中文翻译打爆气球（附带读音） |
| **🚗 拼写闯关** | 小汽车沿道路前进遇到障碍，正确拼写单词即可闯关通过 |

### 🕹️ 游戏特色 / Game Highlights

- **6 种随机障碍玩法**：路障、悬崖、巨石、水坑、断桥、锥桶阵，每次拼写都是新挑战
- **飞跃 & 爆炸动画**：拼写正确时小汽车飞跃障碍，错误时触发爆炸/掉落特效
- **儿童友好视觉**：漂浮气球、云朵、彩色粒子、可爱小汽车
- **美式发音朗读**：点击任意气球或按钮均可播放单词英文读音
- **音效系统**：可开关的点击音效、正确/错误反馈音

### 📚 学习管理 / Study Management

- **单元管理**：新增/删除单元，在单元内增删改单词（中文、英文、进度）
- **进度追踪**：每词 5 级进度（0→1→2→3→4），对应分值 0/10/20/40/80
- **复习模式**：单元内所有单词达到 4/4 后可进入复习，从 0/4 重新开始
- **积分系统**：本局分数 + 累计总分，自动记录复习完成次数
- **导入/导出 CSV**：方便批量管理词库

### 🧩 更多 / More

- **本地商店系统**：使用金币购买小汽车皮肤等道具
- **双模式切换**：简单模式（可重试）和普通模式（显示答案后继续）
- **数据持久化**：自动同步到本地 `words.csv`，进度不丢失

---

## 🚀 快速开始 / Quick Start

### 前置要求 / Prerequisites

- Python 3.8+
- 现代浏览器（Chrome / Firefox / Edge）

### 运行 / Run

**方式一（推荐）**：双击 `run_web.bat`

**方式二**：在终端中运行

```bash
python server.py
```

然后打开浏览器访问 **http://127.0.0.1:8765/** 🎉

---

## 📦 项目结构 / Project Structure

```
web_client/
├── server.py              # Python HTTP 后端服务器
├── words.csv              # 单词数据文件
├── progress_meta.json     # 进度统计元数据
├── index.html             # 前端入口页面
├── app.core.js            # 核心业务逻辑（状态管理、渲染、游戏、管理页）
├── app.js                 # 启动入口（仅调用 bootstrapApp）
├── styles.css             # 样式入口（@import 聚合）
├── styles/
│   ├── base.css           # 通用布局、按钮、表单、管理页样式
│   └── game.css           # 游戏舞台、拼写场景、路障动画与特效
├── run_web.bat            # Windows 一键启动脚本
└── README.md              # 本文件
```

### 架构说明 / Architecture

```
┌─────────────┐     HTTP      ┌──────────────┐
│   index.html │ ◄─────────► │  server.py   │
│  (Frontend)  │   REST API   │  (Backend)   │
└─────────────┘              └──────┬───────┘
                                    │
                          ┌─────────▼────────┐
                          │  words.csv        │
                          │  progress_meta.json│
                          └──────────────────┘
```

- `app.core.js` — 所有业务状态、渲染函数、游戏逻辑、管理页逻辑、同步逻辑
- `app.js` — 轻量启动文件，仅负责调用 `bootstrapApp()`
- `styles.css` — 仅通过 `@import` 聚合 `base.css` 和 `game.css`

---

## 🌐 API 文档 / API Reference

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/words` | GET | 读取当前词库和统计元数据 |
| `/api/sync` | POST | 提交状态与元数据并回写 CSV |
| `/api/admin/save` | POST | 保存完整词库（增删改操作） |

### `GET /api/words` 响应格式

```json
{
  "words": [
    { "chinese": "苹果", "english": "apple", "unit": "Unit1", "status": 2 },
    { "chinese": "香蕉", "english": "banana", "unit": "Unit1", "status": 1 }
  ],
  "totalScore": 30,
  "cumulativeScore": 1880,
  "reviewCounts": { "Unit1": 3, "所有单元": 1 },
  "units": ["Unit1", "Unit2"],
  "totalReviewCompletions": 4
}
```

### `POST /api/sync` 请求示例

```json
{
  "words": [
    { "chinese": "苹果", "status": 2 },
    { "chinese": "香蕉", "status": 1 }
  ],
  "meta": {
    "cumulativeScore": 1880,
    "reviewCounts": { "Unit1": 3, "所有单元": 1 }
  }
}
```

### 分值映射 / Score Mapping

| 状态 | 分值 |
|------|------|
| 0/4 （未学习） | 0 |
| 1/4 （认识）   | 10 |
| 2/4 （熟悉）   | 20 |
| 3/4 （掌握）   | 40 |
| 4/4 （精通）   | 80 |

---

## 🛠️ 技术栈 / Tech Stack

- **前端**：纯 HTML5 + CSS3 + Vanilla JavaScript（Canvas 动画）
- **后端**：Python 标准库 `http.server`（零外部依赖）
- **数据格式**：CSV（可导入导出，方便编辑）
- **语音**：浏览器原生 Speech Synthesis API（美式发音）

---

## 📸 截图 / Screenshots

> *（建议在此处添加游戏截图，展示气球界面和小汽车闯关界面）*

---

## 🤝 贡献 / Contributing

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

---

## 📄 许可 / License

本项目基于 MIT 许可证开源。

---

## 🙏 致谢 / Acknowledgments

- 灵感来自经典的「打气球」背单词游戏
- 所有动画和音效均使用前端原生技术实现，无需外部依赖
