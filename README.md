# 禾康家 · 家庭健康守护

Vite + React 前端，FastAPI + PostgreSQL 后端。

## 快速启动

### 1. 数据库

需安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，然后在项目根目录：

```bash
docker compose up -d
```

### 2. 后端

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt 
copy .env.example .env          # 填写 ZHIPU_API_KEY（可选）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API 文档：http://127.0.0.1:8000/docs

### 3. 前端

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000 ，先进入**手机短信登录页**。

开发模式：点击「获取验证码」后页面会显示并自动填入 `debug_code`（同时后端控制台打印）。

## 能力说明

| 能力 | 状态 |
|------|------|
| 手机号 + 短信验证码登录 | Mock 已通，阿里云接入位已预留 |
| JWT 会话 | 已实现 |
| 家庭 / 成员 / 用药 / 病历 / 化验 / 日程 API | 已实现 |
| OCR（智谱 glm-4.6v-flash） | 已对接；无 Key 时返回 mock |
| 前端业务数据全量改打 API | 登录与 OCR 已接；其余仍可用 localStorage，后续可继续迁移 |

更多后端细节见 `backend/README.md`。
