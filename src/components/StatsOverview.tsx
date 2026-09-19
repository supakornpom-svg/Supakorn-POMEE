import React from 'react';
import { Users, Activity, TrendingUp, HeartPulse } from 'lucide-react';
import type { DatabaseStats } from '../types';

interface StatsOverviewProps {
  stats: DatabaseStats | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  if (!stats) return null;

  const total = stats.total || 0;
  const cats = stats.categories || {
    underweight: 0,
    normal: 0,
    overweight: 0,
    obese1: 0,
    obese2: 0,
  };

  const getPercent = (count: number) => {
    if (total === 0) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">บันทึกทั้งหมด</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{total}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">รายการในฐานข้อมูล</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">BMI เฉลี่ย</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {stats.avgBmi > 0 ? stats.avgBmi.toFixed(1) : '--'}
          </div>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">เกณฑ์เฉลี่ยกลุ่ม</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">สมส่วน (สุขภาพดี)</span>
            <HeartPulse className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{cats.normal}</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {getPercent(cats.normal)} ของทั้งหมด
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">เกินเกณฑ์หรืออ้วน</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {cats.overweight + cats.obese1 + cats.obese2}
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            {getPercent(cats.overweight + cats.obese1 + cats.obese2)} ของทั้งหมด
          </span>
        </div>
      </div>

      {/* Distribution Breakdown Bar & Details */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          การกระจายตัวของระดับดัชนีมวลกาย (BMI Distribution)
        </h3>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${total ? (cats.underweight / total) * 100 : 0}%` }}
            className="bg-blue-400 h-full"
            title={`น้ำหนักน้อย: ${cats.underweight} คน`}
          />
          <div
            style={{ width: `${total ? (cats.normal / total) * 100 : 0}%` }}
            className="bg-emerald-500 h-full"
            title={`สมส่วน: ${cats.normal} คน`}
          />
          <div
            style={{ width: `${total ? (cats.overweight / total) * 100 : 0}%` }}
            className="bg-amber-400 h-full"
            title={`น้ำหนักเกิน: ${cats.overweight} คน`}
          />
          <div
            style={{ width: `${total ? (cats.obese1 / total) * 100 : 0}%` }}
            className="bg-orange-500 h-full"
            title={`อ้วน 1: ${cats.obese1} คน`}
          />
          <div
            style={{ width: `${total ? (cats.obese2 / total) * 100 : 0}%` }}
            className="bg-rose-500 h-full"
            title={`อ้วน 2: ${cats.obese2} คน`}
          />
        </div>

        {/* Detailed Breakdown List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2">
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="text-[11px] text-blue-700 font-semibold">ผอม / ต่ำกว่าเกณฑ์</div>
            <div className="text-lg font-bold text-blue-900 mt-0.5">{cats.underweight} คน</div>
            <div className="text-[10px] text-blue-600 mt-0.5">{getPercent(cats.underweight)}</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="text-[11px] text-emerald-700 font-semibold">สมส่วน (ปกติ)</div>
            <div className="text-lg font-bold text-emerald-900 mt-0.5">{cats.normal} คน</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">{getPercent(cats.normal)}</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="text-[11px] text-amber-700 font-semibold">น้ำหนักเกิน (ท้วม)</div>
            <div className="text-lg font-bold text-amber-900 mt-0.5">{cats.overweight} คน</div>
            <div className="text-[10px] text-amber-600 mt-0.5">{getPercent(cats.overweight)}</div>
          </div>

          <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100">
            <div className="text-[11px] text-orange-700 font-semibold">อ้วนระดับ 1</div>
            <div className="text-lg font-bold text-orange-900 mt-0.5">{cats.obese1} คน</div>
            <div className="text-[10px] text-orange-600 mt-0.5">{getPercent(cats.obese1)}</div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
            <div className="text-[11px] text-rose-700 font-semibold">อ้วนระดับ 2 (เสี่ยงสูง)</div>
            <div className="text-lg font-bold text-rose-900 mt-0.5">{cats.obese2} คน</div>
            <div className="text-[10px] text-rose-600 mt-0.5">{getPercent(cats.obese2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
