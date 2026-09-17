# 禾康家 Backend

FastAPI + PostgreSQL。短信登录当前为 **mock**（控制台打印验证码，开发模式接口返回 `debug_code`），后续可切换阿里云短信。OCR 使用智谱 **GLM-4.6V-Flash**（`zai-sdk`）。

## 启动

### 1. 数据库（Docker）

在项目根目录：

```bash
docker compose up -d
```

### 2. 后端

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # 或 cp .env.example .env
# 编辑 .env，填入 ZHIPU_API_KEY

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

文档：http://127.0.0.1:8000/docs

### 3. 前端

```bash
# 项目根目录
npm install
# 可选：.env.local 中设置 VITE_API_BASE=http://127.0.0.1:8000/api/v1
npm run dev
```

## 短信登录联调

1. 打开登录页，输入手机号 → 获取验证码  
2. 开发模式下接口会返回 `debug_code`，页面会自动填入  
3. 同时后端控制台会打印 `[SMS:mock] 验证码已发送至 ...`  
4. 登录后签发 JWT，自动创建家庭与「本人」成员  

切换阿里云：在 `.env` 设置 `SMS_PROVIDER=aliyun` 并填写 `ALIYUN_*`（接入代码已预留接口）。

## OCR

`POST /api/v1/ai/scan`（multipart：`kind=medicine|lab` + `file`）

未配置 `ZHIPU_API_KEY` 时返回 mock 结构化结果；配置后调用 `glm-4.6v-flash`。
