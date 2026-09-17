import React, { useEffect, useState } from 'react';
import { APP_ICONS } from '../data/mockData';
import { api, AuthUser, setSession } from '../api/client';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('未注册手机号将自动创建家庭账号');
  const [agreed, setAgreed] = useState(true);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown]);

  const phoneValid = /^1\d{10}$/.test(phone);

  const handleSendCode = async () => {
    setError('');
    if (!phoneValid) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    setSending(true);
    try {
      const res = await api.sendSms(phone);
      setCountdown(60);
      if (res.debug_code) {
        setHint(`开发模式验证码：${res.debug_code}（正式环境将通过短信下发）`);
        setCode(res.debug_code);
      } else {
        setHint(res.message || '验证码已发送');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phoneValid) {
      setError('请输入正确的 11 位手机号');
      return;
    }
    if (!code.trim()) {
      setError('请输入短信验证码');
      return;
    }
    if (!agreed) {
      setError('请先同意用户协议与隐私政策');
      return;
    }
    setLoading(true);
    try {
      const res = await api.loginSms(phone, code.trim());
      setSession(res.access_token, res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh relative overflow-hidden bg-[#f0fcf5] text-[#131e1a]">
      {/* Atmospheric background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(164,242,216,0.7), transparent 60%), radial-gradient(ellipse 60% 40% at 100% 80%, rgba(0,104,93,0.08), transparent), radial-gradient(ellipse 50% 35% at 0% 70%, rgba(46,158,109,0.1), transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2300685d\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      <div className="relative z-10 max-w-md mx-auto min-h-dvh flex flex-col px-5 pt-14 pb-8">
        {/* Brand hero */}
        <div className="flex flex-col items-center text-center mb-10 animate-[fadeIn_0.6s_ease-out]">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-3xl bg-[#a4f2d8]/50 blur-xl scale-110" />
            <img
              src={APP_ICONS.logo}
              alt="禾康家"
              className="relative h-20 w-20 object-contain rounded-2xl shadow-[0_8px_32px_rgba(0,104,93,0.18)] ring-4 ring-white/80"
            />
          </div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-[#00685d] font-['Plus_Jakarta_Sans'] leading-none">
            禾康家
          </h1>
          <p className="mt-2.5 text-[14px] text-[#3e4946] font-medium max-w-[260px] leading-relaxed">
            三代同堂的健康守护，从一次安心登录开始
          </p>
        </div>

        {/* Login form — interaction surface */}
        <form
          onSubmit={handleLogin}
          className="flex-1 flex flex-col bg-white/80 backdrop-blur-md rounded-[28px] border border-[#00685d]/10 shadow-[0_12px_40px_rgba(0,104,93,0.08)] px-5 py-6"
        >
          <div className="mb-5">
            <h2 className="text-[18px] font-bold text-[#131e1a]">手机号登录</h2>
            <p className="text-[12px] text-[#6f7975] mt-1">{hint}</p>
          </div>

          <label className="block mb-4">
            <span className="text-[12px] font-medium text-[#6f7975] mb-1.5 block">手机号</span>
            <div className="flex items-center gap-2 h-12 px-3.5 rounded-2xl bg-[#f0fcf5] border border-[#00685d]/10 focus-within:border-[#00685d]/40 focus-within:ring-2 focus-within:ring-[#a4f2d8]/60 transition-all">
              <span className="material-symbols-outlined text-[#00685d] text-[20px]">smartphone</span>
              <span className="text-[14px] text-[#3e4946] font-medium shrink-0">+86</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号"
                className="flex-1 bg-transparent outline-none text-[15px] font-medium placeholder:text-[#9aa6a1]"
              />
            </div>
          </label>

          <label className="block mb-2">
            <span className="text-[12px] font-medium text-[#6f7975] mb-1.5 block">验证码</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 h-12 px-3.5 rounded-2xl bg-[#f0fcf5] border border-[#00685d]/10 focus-within:border-[#00685d]/40 focus-within:ring-2 focus-within:ring-[#a4f2d8]/60 transition-all">
                <span className="material-symbols-outlined text-[#00685d] text-[20px]">sms</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="6 位验证码"
                  className="flex-1 bg-transparent outline-none text-[15px] font-medium placeholder:text-[#9aa6a1]"
                />
              </div>
              <button
                type="button"
                disabled={!phoneValid || countdown > 0 || sending}
                onClick={handleSendCode}
                className="shrink-0 h-12 px-3.5 rounded-2xl text-[13px] font-semibold text-[#00685d] bg-[#e5f1ea] hover:bg-[#d4ebe0] disabled:opacity-45 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
              >
                {sending ? '发送中…' : countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </label>

          {error && (
            <div className="mt-3 flex items-start gap-1.5 text-[12px] text-[#a7391e] bg-[#fdecea] rounded-xl px-3 py-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full rounded-2xl bg-[#00685d] text-white text-[15px] font-bold shadow-[0_8px_24px_rgba(0,104,93,0.28)] hover:bg-[#005a51] disabled:opacity-60 transition-all active:scale-[0.99]"
          >
            {loading ? '登录中…' : '登录 / 注册'}
          </button>

          <label className="mt-4 flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[#00685d]"
            />
            <span className="text-[11px] text-[#6f7975] leading-relaxed">
              我已阅读并同意
              <button type="button" className="text-[#00685d] font-medium mx-0.5">
                《用户协议》
              </button>
              与
              <button type="button" className="text-[#00685d] font-medium mx-0.5">
                《隐私政策》
              </button>
            </span>
          </label>

          <div className="mt-auto pt-8 flex flex-col items-center gap-2 text-[#9aa6a1]">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-8 h-px bg-[#00685d]/15" />
              家庭健康 · 安全守护
              <span className="w-8 h-px bg-[#00685d]/15" />
            </div>
            <p className="text-[10px]">短信服务后续接入阿里云，当前为开发联调模式</p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
