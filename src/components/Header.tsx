import React from 'react';
import { Activity, Bell, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import type { LineSettings } from '../types';

interface HeaderProps {
  activeTab: 'form' | 'history' | 'stats';
  setActiveTab: (tab: 'form' | 'history' | 'stats') => void;
  recordCount: number;
  lineSettings: LineSettings | null;
  onOpenLineModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  recordCount,
  lineSettings,
  onOpenLineModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  ระบบบันทึก BMI ออนไลน์
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Database className="w-3 h-3" /> บันทึกทันที
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate hidden xs:block">
                วิเคราะห์สุขภาพ • แนะนำอาหารและการออกกำลังกาย • แจ้งเตือน LINE
              </p>
            </div>
          </div>

          {/* Quick Actions & LINE Status */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="line-status-button"
              onClick={onOpenLineModal}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                lineSettings?.isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title="คลิกเพื่อตั้งค่าและทดสอบแจ้งเตือน LINE"
            >
              <div className="w-4 h-4 rounded-full bg-[#06C755] flex items-center justify-center text-white font-bold text-[9px]">
                L
              </div>
              <span className="hidden md:inline">
                {lineSettings?.isConfigured ? 'LINE เชื่อมต่อแล้ว' : 'ตั้งค่าแจ้งเตือน LINE'}
              </span>
              <span className="md:hidden">LINE</span>
              {lineSettings?.isConfigured ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Optimized for touch / mobile) */}
        <div className="flex items-center space-x-1 border-t border-slate-100 py-1.5 overflow-x-auto no-scrollbar">
          <button
            id="tab-btn-form"
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'form'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📝 กรอกข้อมูล BMI
          </button>
          <button
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>📜 ประวัติในฐานข้อมูล</span>
            {recordCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {recordCount}
              </span>
            )}
          </button>
          <button
            id="tab-btn-stats"
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📊 สรุปสถิติ
          </button>
          <button
            id="tab-btn-line"
            onClick={onOpenLineModal}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer ml-auto flex items-center gap-1"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>จัดการ LINE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
