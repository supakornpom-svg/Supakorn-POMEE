import React from 'react';
import type { BmiCategory } from '../types';
import { Activity, Flame, Zap } from 'lucide-react';
import { MASCOTS } from '../assets/mascots';

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
  category,
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
    if (bmi < 18.5) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (bmi <= 22.9) return 'bg-lime-400/20 text-lime-300 border-lime-400/40';
    if (bmi <= 24.9) return 'bg-amber-400/20 text-amber-300 border-amber-400/40';
    if (bmi <= 29.9) return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  };

  const getMascotEncouragement = () => {
    if (bmi <= 0) return { mascot: MASCOTS.fit, text: 'กรอกข้อมูลน้ำหนักส่วนสูง เพื่อวิเคราะห์ความฟิตของคุณ!' };
    if (category === 'underweight') {
      return {
        mascot: MASCOTS.fit,
        text: '“น้ำหนักต่ำกว่าเกณฑ์นิดหน่อย มาเพิ่มกล้ามเนื้อและพลังงานไปพร้อมกัน!”',
      };
    }
    if (category === 'normal') {
      return {
        mascot: MASCOTS.fit,
        text: '“สุดยอด! รูปร่างสมส่วน สุขภาพดีมาก รักษาวินัยแบบนี้ต่อไปเลยครับ!”',
      };
    }
    return {
      mascot: MASCOTS.chubby,
      text: '“สู้ไปด้วยกันนะครับ! ปรับอาหาร ขยับวันละนิด เดี๋ยวเราก็ลดได้แน่นอน!”',
    };
  };

  const advice = getMascotEncouragement();

  return (
    <div
      id="bmi-gauge-card"
      className="bg-slate-900 rounded-3xl border border-slate-700/80 p-5 sm:p-6 text-white shadow-xl relative overflow-hidden"
    >
      {/* Dynamic Background Sport Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-lime-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-lime-400" />
            <span>ATHLETE BMI GAUGE • มาตรวัดดัชนีมวลกาย</span>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-200 to-cyan-300 tracking-tight">
              {bmi > 0 ? bmi.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">kg/m² (Asian Standard)</span>
          </div>
        </div>

        {bmi > 0 && (
          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-black border ${getBmiBadgeColor()} flex items-center gap-1.5 self-start sm:self-center shadow-sm`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{categoryLabelTh}</span>
          </div>
        )}
      </div>

      {/* Visual Multi-Segment Sport Gauge Bar */}
      <div className="mt-2 mb-3">
        <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700">
          {/* Underweight: < 18.5 */}
          <div
            style={{ width: `${((18.5 - 14) / 21) * 100}%` }}
            className="h-full bg-cyan-400 rounded-l-full"
            title="ต่ำกว่าเกณฑ์ (< 18.5)"
          />
          {/* Normal: 18.5 - 22.9 */}
          <div
            style={{ width: `${((22.9 - 18.5) / 21) * 100}%` }}
            className="h-full bg-lime-400"
            title="สมส่วน นักกีฬา (18.5 - 22.9)"
          />
          {/* Overweight: 23 - 24.9 */}
          <div
            style={{ width: `${((24.9 - 22.9) / 21) * 100}%` }}
            className="h-full bg-amber-400"
            title="น้ำหนักเกิน (23.0 - 24.9)"
          />
          {/* Obese 1: 25 - 29.9 */}
          <div
            style={{ width: `${((29.9 - 24.9) / 21) * 100}%` }}
            className="h-full bg-orange-500"
            title="อ้วนระดับ 1 (25.0 - 29.9)"
          />
          {/* Obese 2: >= 30 */}
          <div
            style={{ width: `${((35 - 29.9) / 21) * 100}%` }}
            className="h-full bg-rose-500 rounded-r-full"
            title="อ้วนระดับ 2 (≥ 30.0)"
          />
        </div>

        {/* Dynamic Needle/Indicator */}
        {bmi > 0 && (
          <div className="relative w-full h-6">
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
              style={{ left: `${percentage}%` }}
            >
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-lime-400 shadow-md" />
              <div className="w-2.5 h-2.5 rounded-full bg-lime-400 -mt-0.5 shadow-md shadow-lime-400/50" />
            </div>
          </div>
        )}

        {/* Scale labels */}
        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-0.5 mt-1">
          <span className="text-cyan-400">&lt; 18.5 (ผอม)</span>
          <span className="text-lime-400 font-extrabold">18.5-22.9 (สมส่วน)</span>
          <span className="text-amber-400">23-24.9 (ท้วม)</span>
          <span className="text-orange-400">25-29.9 (อ้วน 1)</span>
          <span className="text-rose-400">≥ 30 (อ้วน 2)</span>
        </div>
      </div>

      {/* Mascot Encouragement Box */}
      <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-lime-400 shrink-0 shadow-md">
          <img
            src={advice.mascot}
            alt="Mascot Cheering"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-lime-300 font-bold italic leading-snug">
            {advice.text}
          </p>
          {heightCm > 0 && idealWeightMin > 0 && (
            <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400">ช่วงน้ำหนักที่สมส่วน (สูง {heightCm} ซม.):</span>
              <span className="font-extrabold text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/30">
                {idealWeightMin} - {idealWeightMax} กก.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
