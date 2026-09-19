import React from 'react';
import type { BmiCategory } from '../types';

interface BmiGaugeProps {
  bmi: number;
  category: BmiCategory;
  categoryLabelTh: string;
  idealWeightMin: number;
  idealWeightMax: number;
  heightCm: number;
}

export const BmiGauge: React.FC<BmiGaugeProps> = ({
  bmi,
  categoryLabelTh,
  idealWeightMin,
  idealWeightMax,
  heightCm,
}) => {
  // Mapping BMI scale: from 14 to 35
  const minScale = 14;
  const maxScale = 35;
  const clampedBmi = Math.min(Math.max(bmi || 21, minScale), maxScale);
  const percentage = ((clampedBmi - minScale) / (maxScale - minScale)) * 100;

  const getBmiBadgeColor = () => {
    if (bmi < 18.5) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (bmi <= 22.9) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (bmi <= 24.9) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (bmi <= 29.9) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div id="bmi-gauge-card" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            ผลการคำนวณดัชนีมวลกาย (BMI)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {bmi > 0 ? bmi.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-500 font-normal">กก./ม.² (เกณฑ์คนไทย/เอเชีย)</span>
          </div>
        </div>

        {bmi > 0 && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBmiBadgeColor()} text-center`}
          >
            {categoryLabelTh}
          </div>
        )}
      </div>

      {/* Visual Multi-Segment Gauge Bar */}
      <div className="mt-4 mb-2">
        <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
          {/* Underweight: < 18.5 (~21.4%) */}
          <div
            style={{ width: `${((18.5 - 14) / 21) * 100}%` }}
            className="h-full bg-blue-400"
            title="ต่ำกว่าเกณฑ์ (< 18.5)"
          />
          {/* Normal: 18.5 - 22.9 (~21.0%) */}
          <div
            style={{ width: `${((22.9 - 18.5) / 21) * 100}%` }}
            className="h-full bg-emerald-500"
            title="ปกติ สมส่วน (18.5 - 22.9)"
          />
          {/* Overweight: 23 - 24.9 (~9.5%) */}
          <div
            style={{ width: `${((24.9 - 22.9) / 21) * 100}%` }}
            className="h-full bg-amber-400"
            title="น้ำหนักเกิน (23.0 - 24.9)"
          />
          {/* Obese 1: 25 - 29.9 (~23.8%) */}
          <div
            style={{ width: `${((29.9 - 24.9) / 21) * 100}%` }}
            className="h-full bg-orange-400"
            title="อ้วนระดับ 1 (25.0 - 29.9)"
          />
          {/* Obese 2: >= 30 (~24.3%) */}
          <div
            style={{ width: `${((35 - 29.9) / 21) * 100}%` }}
            className="h-full bg-rose-500"
            title="อ้วนระดับ 2 (≥ 30.0)"
          />
        </div>

        {/* Dynamic Needle/Indicator */}
        {bmi > 0 && (
          <div className="relative w-full h-5">
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
              style={{ left: `${percentage}%` }}
            >
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-slate-800" />
              <div className="w-2 h-2 rounded-full bg-slate-800 -mt-0.5" />
            </div>
          </div>
        )}

        {/* Scale labels */}
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5 mt-0.5">
          <span>&lt; 18.5 (ผอม)</span>
          <span className="text-emerald-600 font-semibold">18.5-22.9 (สมส่วน)</span>
          <span>23-24.9 (ท้วม)</span>
          <span>25-29.9 (อ้วน 1)</span>
          <span>≥ 30 (อ้วน 2)</span>
        </div>
      </div>

      {/* Ideal Weight Insight */}
      {heightCm > 0 && idealWeightMin > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>น้ำหนักที่เหมาะสมสำหรับส่วนสูง {heightCm} ซม.:</span>
          </div>
          <div className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            {idealWeightMin} - {idealWeightMax} กก.
          </div>
        </div>
      )}
    </div>
  );
};
