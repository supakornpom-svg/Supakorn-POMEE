import React from 'react';
import { Database, Dumbbell, Trophy } from 'lucide-react';
import { MASCOTS } from '../assets/mascots';

interface HeaderProps {
  activeTab: 'form' | 'workout' | 'history' | 'stats';
  setActiveTab: (tab: 'form' | 'workout' | 'history' | 'stats') => void;
  recordCount: number;
  onOpenCelebration: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  recordCount,
  onOpenCelebration,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Sport Brand */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Athletic Mascots Avatar Duo */}
            <div className="flex -space-x-2 shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-lime-400 shadow-md">
                <img
                  src={MASCOTS.fit}
                  alt="Fit Coach"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md">
                <img
                  src={MASCOTS.chubby}
                  alt="Chubby Hero"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-cyan-400 truncate">
                  SPORT FIT & BMI TRACKER
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase bg-lime-400/20 text-lime-300 px-2 py-0.5 rounded-full border border-lime-400/30">
                  ⚡ PRO ATHLETE
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden xs:block">
                ระบบคำนวณ BMI • โปรแกรมออกกำลังกายรายสัปดาห์/รายเดือน • ถ้วยรางวัลแห่งความสำเร็จ
              </p>
            </div>
          </div>

          {/* Right Action: Trophy Share & Database Count */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Trophy Pop-up Button */}
            <button
              id="header-btn-trophy"
              onClick={onOpenCelebration}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
              title="เปิดป๊อปอัพถ้วยรางวัลและเซฟภาพความสำเร็จ"
            >
              <Trophy className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">ฉลองความสำเร็จ / รับถ้วย</span>
              <span className="sm:hidden">ถ้วยรางวัล</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-800/80 text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>ฐานข้อมูล: </span>
              <strong className="text-white">{recordCount} รายการ</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with Sporty Energy */}
        <div className="flex items-center space-x-1 border-t border-slate-800 py-1.5 overflow-x-auto no-scrollbar">
          <button
            id="tab-btn-form"
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📝 คำนวณ & บันทึก BMI</span>
          </button>

          <button
            id="tab-btn-workout"
            onClick={() => setActiveTab('workout')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'workout'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>🏋️ โปรแกรมออกกำลังกาย & การกิน</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-amber-400 text-slate-950">
              ใหม่
            </span>
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📜 ประวัติในฐานข้อมูล</span>
            {recordCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'history'
                    ? 'bg-slate-950 text-lime-400'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {recordCount}
              </span>
            )}
          </button>

          <button
            id="tab-btn-stats"
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20 font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            📊 สรุปสถิติภาพรวม
          </button>
        </div>
      </div>
    </header>
  );
};
