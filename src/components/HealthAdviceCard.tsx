import React, { useState } from 'react';
import {
  Utensils,
  Dumbbell,
  Flame,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import type { AiHealthPlan, BmiRecord } from '../types';

interface HealthAdviceCardProps {
  record: BmiRecord;
  plan: AiHealthPlan;
  onCelebrate?: () => void;
  onGoToWorkout?: () => void;
}

export const HealthAdviceCard: React.FC<HealthAdviceCardProps> = ({
  record,
  plan,
  onCelebrate,
  onGoToWorkout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'diet' | 'exercise' | 'meals'>('diet');
  const [isExpanded, setIsExpanded] = useState(true);

  const isOverweight = record.category === 'overweight' || record.category === 'obese1' || record.category === 'obese2';
  const isUnderweight = record.category === 'underweight';

  return (
    <div
      id={`health-advice-${record.id}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  แผนสุขภาพเฉพาะบุคคล (โภชนาการและการออกกำลังกาย)
                </h3>
                <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  AI Nutritionist
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ออกแบบสำหรับคุณ {record.name} • BMI {record.bmi} ({record.categoryLabelTh})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
          >
            <span>{isExpanded ? 'ย่อคำแนะนำ' : 'แสดงคำแนะนำฉบับเต็ม'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Overview Summary */}
        <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed bg-white/5 border border-white/10 rounded-xl p-3">
          {plan.summary}
        </p>

        {/* Energy Target Bar */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-lg p-2">
            <span className="text-[10px] text-slate-400 block">เผาผลาญพื้นฐาน (BMR)</span>
            <span className="text-sm font-bold text-white">{Math.round(record.bmr)} kcal</span>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <span className="text-[10px] text-slate-400 block">พลังงานที่ใช้ต่อวัน (TDEE)</span>
            <span className="text-sm font-bold text-white">{Math.round(record.tdee)} kcal</span>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-2">
            <span className="text-[10px] text-emerald-300 block font-medium">เป้าหมายแคลอรี่/วัน</span>
            <span className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {plan.calorieTarget} kcal
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5">
          {/* Sub-Tabs */}
          <div className="flex border-b border-slate-200 mb-5 gap-1">
            <button
              onClick={() => setActiveSubTab('diet')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === 'diet'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>การกิน & สารอาหาร</span>
            </button>
            <button
              onClick={() => setActiveSubTab('exercise')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === 'exercise'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>การออกกำลังกาย</span>
            </button>
            <button
              onClick={() => setActiveSubTab('meals')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === 'meals'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>เมนูตัวอย่างแบบไทย</span>
            </button>
          </div>

          {/* Sub Tab: Diet */}
          {activeSubTab === 'diet' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{plan.dietAdvice.title}</span>
                {isOverweight && (
                  <span className="text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    ควบคุมแคลอรี่
                  </span>
                )}
                {isUnderweight && (
                  <span className="text-[11px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    เพิ่มพลังงานและโปรตีน
                  </span>
                )}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Foods to Focus */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs sm:text-sm mb-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>อาหารและโภชนาการที่ควรเน้น</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.dietAdvice.focus.map((item, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Foods to Avoid */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs sm:text-sm mb-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>สิ่งที่ควรจำกัดหรือหลีกเลี่ยง</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.dietAdvice.avoid.map((item, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: Exercise */}
          {activeSubTab === 'exercise' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900">{plan.exerciseAdvice.title}</h4>
                <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                  ความถี่: {plan.exerciseAdvice.weeklyFrequency}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cardio */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs sm:text-sm mb-2">
                    <Activity className="w-4 h-4 text-sky-600" />
                    <span>การคาร์ดิโอ (Cardiovascular)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {plan.exerciseAdvice.cardio}
                  </p>
                </div>

                {/* Strength */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs sm:text-sm mb-2">
                    <Dumbbell className="w-4 h-4 text-indigo-600" />
                    <span>การฝึกแรงต้าน / สร้างกล้ามเนื้อ</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {plan.exerciseAdvice.strength}
                  </p>
                </div>
              </div>

              {/* Safety Cautions (Especially for high or low BMI) */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-amber-900">
                    ข้อควรระวังสำคัญสำหรับระดับ BMI นี้
                  </h5>
                  <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                    {plan.exerciseAdvice.cautions}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: Sample Meals */}
          {activeSubTab === 'meals' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 mb-2">
                ตัวอย่างมื้ออาหารประจำวัน (สูตรอาหารไทยทำง่ายหรือหาซื้อง่าย)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    มื้อเช้า (Breakfast)
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 mt-2 font-medium">
                    {plan.dietAdvice.sampleMeals.breakfast}
                  </p>
                </div>
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    มื้อกลางวัน (Lunch)
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 mt-2 font-medium">
                    {plan.dietAdvice.sampleMeals.lunch}
                  </p>
                </div>
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    มื้อเย็น (Dinner)
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 mt-2 font-medium">
                    {plan.dietAdvice.sampleMeals.dinner}
                  </p>
                </div>
                {plan.dietAdvice.sampleMeals.snack && (
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                      ของว่างเพื่อสุขภาพ (Healthy Snack)
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 mt-2 font-medium">
                      {plan.dietAdvice.sampleMeals.snack}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Takeaways */}
          {plan.keyTakeaways && plan.keyTakeaways.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>3 เคล็ดลับปฏิบัติให้สำเร็จอย่างยั่งยืน:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {plan.keyTakeaways.map((tip, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5"
                  >
                    <span className="font-bold text-emerald-600 shrink-0">{idx + 1}.</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row: Workout program & Trophy share */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
            {onGoToWorkout && (
              <button
                onClick={onGoToWorkout}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-lime-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-800"
              >
                <Dumbbell className="w-4 h-4" />
                <span>ดูตารางออกกำลังกายรายสัปดาห์ & รายเดือน</span>
              </button>
            )}

            {onCelebrate && (
              <button
                onClick={onCelebrate}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
              >
                <span>🏆 รับถ้วย & เซฟภาพสรุป</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
