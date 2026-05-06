# 单词气球挑战 — Word Balloon Challenge

> 快乐背单词，打气球，拿星星！一个专为儿童设计的趣味英语单词学习网页应用。

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 功能特点

### 学习模式

| 模式 | 说明 |
|------|------|
| **英文气球** | 看中文释义，在漂浮的气球中点击正确英文翻译（附带读音），进度 0→1 |
| **中文气球** | 看英文单词，在漂浮的气球中点击正确中文翻译，进度 1→2 |
| **简单拼写** | 小汽车遇障碍，用键盘逐个输入字母拼写单词，可重试，进度 2→3 |
| **普通拼写** | 更高难度拼写，答错直接显示答案后继续，完成即精通（进度 3→4） |

### 游戏特色

- **6 种随机障碍**：路障、悬崖、巨石、水坑、断桥、锥桶阵，每次拼写都是新挑战
- **飞跃 & 爆炸动画**：拼写正确小汽车飞跃障碍，错误触发爆炸/掉落特效
- **车辆与特效商店**：使用银币购买 13 款小汽车皮肤和 3 种视觉特效
- **美式发音朗读**：点击气球或按钮均可播放单词英文读音
- **音效系统**：可开关的点击音效、正确/错误反馈音

### 学习管理

- **单元管理**：新增/删除/重命名单元，增删改单词（中文、英文、进度）
- **进度追踪**：每词 5 级进度（0→1→2→3→4），对应分值 0/10/20/40/80
- **导入/导出 CSV**：方便批量管理词库
- **首页状态面板**：实时展示银币、金币、总单词数、各阶段进度

### 货币系统

| 货币 | 获取方式 | 用途 |
|------|---------|------|
| **银币** | 每次答对题目获得（气球 +10，简单拼写 +20，普通拼写 +40） | 商店购买车辆皮肤和特效 |
| **金币** | 仅在普通模式下完成单词获得（每词 +80，每词仅一次） | 累计成就展示 |

---

## 快速开始

### 前置要求

- Python 3.8+
- 现代浏览器（Chrome / Firefox / Edge）

### 运行

```bash
python server.py
```

然后打开浏览器访问 **http://127.0.0.1:8765/**

---

## 项目结构

```
Word Balloon Challenge/
├── server.py              # Python HTTP 后端
├── words.csv              # 单词数据
├── progress_meta.json     # 进度与货币元数据
├── index.html             # 前端入口
├── app.core.js            # 核心模块：状态、常量、DOM 引用、网络同步
├── app.game.js            # 游戏模块：气球/拼写逻辑、Canvas 渲染
├── app.market.js          # 市场模块：车辆与特效商店
├── app.admin.js           # 管理模块：单元与单词增删改
├── styles/
│   ├── base.css           # 通用布局、按钮、表单、首页状态面板
│   └── game.css           # 游戏舞台、拼写场景、路障动画与特效
├── run_web.bat            # Windows 一键启动脚本
└── README.md
```

### 架构说明

```
┌──────────────────────────────────────┐
│  index.html                          │
│  ├── app.core.js   (核心 + 同步)      │
│  ├── app.game.js   (游戏逻辑)         │
│  ├── app.market.js (商店)            │
│  └── app.admin.js  (管理后台)         │
└──────────┬───────────────────────────┘
           │  HTTP REST API
┌──────────▼───────────────────────────┐
│  server.py                           │
│  ├── GET  /api/words   读取词库+元数据 │
│  ├── POST /api/sync    同步进度+货币   │
│  └── POST /api/admin/save  保存词库   │
└──────────┬───────────────────────────┘
           │
┌──────────▼───────────────────────────┐
│  words.csv  +  progress_meta.json    │
└──────────────────────────────────────┘
```

---

## API 文档

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/words` | GET | 读取当前词库和统计元数据 |
| `/api/sync` | POST | 提交状态与元数据并回写 |
| `/api/admin/save` | POST | 保存完整词库（增删改操作） |

### `GET /api/words` 响应格式

```json
{
  "words": [
    { "chinese": "苹果", "english": "apple", "unit": "Unit1", "status": 2, "score": 20 }
  ],
  "totalScore": 30,
  "cumulativeScore": 1880,
  "silverCoins": 1880,
  "goldCoins": 5440,
  "goldEarnedWords": ["苹果", "香蕉", "橘子"],
  "ownedVehicleIds": ["default_bugatti"],
  "equippedVehicleId": "default_bugatti",
  "ownedEffectIds": ["effect_default"],
  "equippedEffectId": "effect_default",
  "reviewCounts": { "Unit1": 3 },
  "units": ["Unit1", "Unit2"]
}
```

### 分值映射

| 进度 | 状态 | 分值 |
|------|------|------|
| 0/4 | 英文气球 | 0 |
| 1/4 | 中文气球 | 10 |
| 2/4 | 简单拼写 | 20 |
| 3/4 | 普通拼写 | 40 |
| 4/4 | 已完成 | 80 |

---

## 技术栈

- **前端**：HTML5 + CSS3 + Vanilla JavaScript（Canvas 动画、Web Speech API）
- **后端**：Python 标准库 `http.server`（零外部依赖）
- **数据格式**：CSV 词库 + JSON 元数据
- **语音**：浏览器原生 Speech Synthesis API（美式发音）

---

## 许可

MIT License
