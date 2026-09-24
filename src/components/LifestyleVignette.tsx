import React from 'react';
import { APP_ICONS } from '../data/mockData';

export const LifestyleVignette: React.FC = () => {
  return (
    <section className="relative rounded-2xl overflow-hidden shadow-sm bg-white border border-[#00685d]/10">
      <div className="h-36 w-full relative overflow-hidden">
        <img
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          alt="晨光餐桌与健康草本调养"
          src={APP_ICONS.vignette}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-[#00685d] text-[14px]">spa</span>
          <span className="text-[11px] font-semibold text-[#131e1a]">家庭健康微锦囊</span>
        </div>
      </div>

      <div className="p-4 -mt-3 relative flex flex-col space-y-1">
        <h3 className="text-[15px] font-bold text-[#131e1a] font-['Plus_Jakarta_Sans']">
          初夏温和调养建议
        </h3>
        <p className="text-[13px] text-[#3e4946] leading-relaxed">
          今日紫外线偏强，午后建议减少户外暴晒；老人避免剧烈运动，儿童可在傍晚适度日照补充维生素D。
        </p>
      </div>
    </section>
  );
};
