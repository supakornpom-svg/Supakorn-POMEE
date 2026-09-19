import React, { useState } from 'react';
import {
  Dumbbell,
  Flame,
  Calendar,
  Clock,
  CheckCircle,
  Apple,
  Droplets,
  Trophy,
  Zap,
  Info,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Moon,
  Coffee,
  HeartPulse,
} from 'lucide-react';
import { WORKOUT_PROGRAMS } from '../data/workoutPrograms';
import type { BmiRecord, SportWorkoutProgram } from '../types';
import { MASCOTS } from '../assets/mascots';

interface WorkoutPlannerProps {
  currentRecord?: BmiRecord | null;
  onCelebrate: (title: string, subtitle: string, activityName: string) => void;
}

export const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({
  currentRecord,
  onCelebrate,
}) => {
  // Select initial program based on BMI if available
  const defaultProgramId = currentRecord
    ? currentRecord.category === 'underweight'
      ? 'muscle_hypertrophy'
      : currentRecord.category === 'normal'
      ? 'shred_and_tone'
      : 'fat_burn_safe'
    : 'fat_burn_safe';

  const [selectedProgramId, setSelectedProgramId] = useState<string>(defaultProgramId);
  const [activeView, setActiveView] = useState<'weekly' | 'monthly' | 'nutrition'>('weekly');
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});
  const [activeMascotQuote, setActiveMascotQuote] = useState<'fit' | 'chubby'>('fit');

  const program: SportWorkoutProgram =
    WORKOUT_PROGRAMS.find((p) => p.id === selectedProgramId) || WORKOUT_PROGRAMS[0];

  const handleToggleDay = (dayNumber: number, dayName: string, focus: string) => {
    const key = `${selectedProgramId}_day_${dayNumber}`;
    const isNowDone = !completedDays[key];
    setCompletedDays((prev) => ({ ...prev, [key]: isNowDone }));

    if (isNowDone) {
      // Trigger celebration pop-up!
      onCelebrate(
        `🏆 พิชิตภารกิจ ${dayName} สำเร็จ!`,
        `คุณได้ฝึกซ้อม: ${focus}`,
        `การฝึกซ้อมโปรแกรม ${program.title} (${dayName})`
      );
    }
  };

  const completedCount = program.weeklySchedule.filter(
    (d) => completedDays[`${selectedProgramId}_day_${d.dayNumber}`]
  ).length;

  return (
    <div className="space-y-6">
      {/* Dynamic Sporty Mascot Motivation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 p-5 sm:p-6 text-white border border-slate-700/80 shadow-xl">
        {/* Ambient energetic neon glow */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Mascots Display */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Fit Model Mascot */}
            <div
              onClick={() => setActiveMascotQuote('fit')}
              className={`relative cursor-pointer transition-all ${
                activeMascotQuote === 'fit' ? 'scale-105' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-lime-400 shadow-lg shadow-lime-500/20">
                <img
                  src={MASCOTS.fit}
                  alt="โค้ชหุ่นฟิต"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black bg-lime-500 text-slate-950 px-2 py-0.2 rounded-full whitespace-nowrap shadow">
                โค้ชหุ่นฟิต
              </span>
            </div>

            {/* Chubby Workout Mascot */}
            <div
              onClick={() => setActiveMascotQuote('chubby')}
              className={`relative cursor-pointer transition-all ${
                activeMascotQuote === 'chubby' ? 'scale-105' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg shadow-amber-500/20">
                <img
                  src={MASCOTS.chubby}
                  alt="น้องจ้ำม่ำพลังสปอร์ต"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full whitespace-nowrap shadow">
                น้องจ้ำม่ำสู้ไม่ถอย
              </span>
            </div>
          </div>

          {/* Motivational Dialogue */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-400 uppercase tracking-wider mb-1 bg-lime-500/10 px-2.5 py-0.5 rounded-full border border-lime-500/20">
              <Zap className="w-3.5 h-3.5" /> Sport Motivation Squad
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {activeMascotQuote === 'fit'
                ? '“ฟอร์มที่ดีคือจุดเริ่มต้นของหุ่นในฝัน สู้ไปด้วยกัน!”'
                : '“ผมเริ่มจากศูนย์ วันนี้ก็วิ่งได้ไกลขึ้น พี่ๆ ก็ทำได้แน่นอน!”'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              เลือกโปรแกรมที่เหมาะสมกับสรีระ พร้อมตารางออกกำลังกายรายสัปดาห์-รายเดือน และสูตรโภชนาการสายสปอร์ต
            </p>
          </div>

          {/* Celebration Trophy Trigger Button */}
          <button
            onClick={() =>
              onCelebrate(
                '🏆 ฉลองความมุ่งมั่น & พลังแห่งความฟิต!',
                'คุณกำลังก้าวสู่เวอร์ชันที่ดีที่สุดของตัวเอง',
                'เข้าสู่โปรแกรมออกกำลังกายสายสปอร์ต'
              )
            }
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 shrink-0"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>ฉลองความสำเร็จ (รับถ้วยรางวัล)</span>
          </button>
        </div>
      </div>

      {/* Program Selection Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-600" />
            <span>เลือกโปรแกรมการออกกำลังกายที่เหมาะกับคุณ</span>
          </h3>
          <span className="text-xs text-slate-500 hidden sm:inline">
            ปรับระดับความหนักตามเป้าหมาย
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {WORKOUT_PROGRAMS.map((prog) => {
            const isSelected = prog.id === selectedProgramId;
            return (
              <button
                key={prog.id}
                onClick={() => setSelectedProgramId(prog.id)}
                className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        prog.level === 'เริ่มต้น'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prog.level === 'ปานกลาง'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      ระดับ: {prog.level}
                    </span>

                    {/* Burn flame rating */}
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      {Array.from({ length: prog.burnRating }).map((_, i) => (
                        <Flame key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm sm:text-base leading-snug mb-1">
                    {prog.title}
                  </h4>
                  <p
                    className={`text-xs leading-relaxed line-clamp-2 ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {prog.subtitle}
                  </p>
                </div>

                <div
                  className={`mt-3 pt-2.5 border-t text-[11px] font-semibold flex items-center justify-between ${
                    isSelected
                      ? 'border-slate-800 text-emerald-400'
                      : 'border-slate-100 text-slate-500'
                  }`}
                >
                  <span>สำหรับ: {prog.targetCategory}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Controls: Weekly vs Monthly vs Nutrition */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveView('weekly')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeView === 'weekly'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-lime-400" />
          <span>ตารางรายสัปดาห์ (Weekly 7 Days)</span>
        </button>

        <button
          onClick={() => setActiveView('monthly')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeView === 'monthly'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>แผนยกระดับรายเดือน (4 Weeks Progression)</span>
        </button>

        <button
          onClick={() => setActiveView('nutrition')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeView === 'nutrition'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Apple className="w-4 h-4 text-emerald-400" />
          <span>คำแนะนำการกิน & สารอาหาร</span>
        </button>
      </div>

      {/* VIEW 1: WEEKLY SCHEDULE (DAY 1 - DAY 7) */}
      {activeView === 'weekly' && (
        <div className="space-y-4">
          {/* Progress Tracker Header */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div>
              <div className="text-xs text-lime-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Weekly Workout Streak
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                ความคืบหน้ารอบสัปดาห์: ทำสำเร็จ {completedCount} จาก 7 วัน
              </h4>
            </div>

            {/* Progress bar */}
            <div className="w-full sm:w-60 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-400 to-lime-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Days Grid */}
          <div className="space-y-3">
            {program.weeklySchedule.map((day) => {
              const isCompleted = !!completedDays[`${selectedProgramId}_day_${day.dayNumber}`];

              return (
                <div
                  key={day.dayNumber}
                  className={`rounded-2xl border transition-all p-4 sm:p-5 ${
                    isCompleted
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                      : day.isRestDay
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                          day.isRestDay
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {day.dayName.slice(0, 2)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                            {day.dayName}: {day.focus}
                          </h4>
                          {day.isRestDay && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                              พักฟื้นร่างกาย
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {day.durationMinutes} นาที
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" /> ความเข้มข้น:{' '}
                            {day.intensity === 'high'
                              ? 'สูง'
                              : day.intensity === 'medium'
                              ? 'ปานกลาง'
                              : 'เบา'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Completion Checkbox Button */}
                    <button
                      onClick={() => handleToggleDay(day.dayNumber, day.dayName, day.focus)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                      <span>{isCompleted ? 'สำเร็จแล้ว! 🎉' : 'ทำภารกิจวันนี้'}</span>
                    </button>
                  </div>

                  {/* Exercises Table */}
                  <div className="mt-3.5 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {day.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs space-y-1"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-slate-900">{ex.name}</span>
                            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                              {ex.targetMuscle}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-600 font-medium">
                            <span>เซ็ต: {ex.sets}</span>
                            <span>ครั้ง: {ex.reps}</span>
                            <span>พัก: {ex.rest}</span>
                          </div>
                          <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-1.5 rounded border border-emerald-100 flex items-start gap-1">
                            <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{ex.tip}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {day.cardioAdvice && (
                      <div className="text-xs bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-amber-600 shrink-0" />
                        <span><strong>คำแนะนำคาร์ดิโอ & ยืดเหยียด:</strong> {day.cardioAdvice}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY PHASES (WEEK 1 - WEEK 4) */}
      {activeView === 'monthly' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-600 to-slate-900 text-white p-5 rounded-2xl shadow-md">
            <div className="text-xs text-lime-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-lime-400" /> Progressive Overload Formula
            </div>
            <h4 className="text-base sm:text-lg font-black mt-1">
              แผนการฝึกแบบก้าวหน้า 4 สัปดาห์ (1 Month Transformation)
            </h4>
            <p className="text-xs text-slate-200 mt-1 max-w-xl">
              การออกกำลังกายให้ได้ผลถาวรต้องมีการเพิ่มระดับความหนักอย่างเป็นขั้นตอน เพื่อไม่ให้ร่างกายเคยชินและเกิดสภาวะน้ำหนักตัน (Plateau)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.monthlyPhases.map((phase) => (
              <div
                key={phase.weekNumber}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                    สัปดาห์ที่ {phase.weekNumber}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ระยะพัฒนา
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {phase.phaseTitle}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {phase.goalDescription}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700">เป้าหมายหลักประจำสัปดาห์:</div>
                  <ul className="space-y-1">
                    {phase.keyFocus.map((kf, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{kf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: NUTRITION GUIDELINES */}
      {activeView === 'nutrition' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pre-workout Fuel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Coffee className="w-4 h-4" />
                <span>มื้อก่อนออกกำลังกาย (Pre-Workout Fuel: 30-60 นาที)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                {program.nutritionTips.preWorkout}
              </p>
              <div className="text-[11px] text-slate-500">
                💡 <strong>เคล็ดลับ:</strong> หลีกเลี่ยงอาหารไขมันสูงก่อนออกกำลังกาย เพราะย่อยช้าและอาจทำให้จุกเสียดท้อง
              </div>
            </div>

            {/* Post-workout Recovery */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Apple className="w-4 h-4" />
                <span>มื้อหลังออกกำลังกาย (Post-Workout Recovery: ภายใน 45 นาที)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                {program.nutritionTips.postWorkout}
              </p>
              <div className="text-[11px] text-slate-500">
                💡 <strong>เคล็ดลับ:</strong> หน้าต่างแห่งโอกาส (Anabolic Window) ร่างกายจะดูดซึมกรดอะมิโนไปซ่อมแซมเส้นใยกล้ามเนื้อได้ดีที่สุด
              </div>
            </div>

            {/* Hydration */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-cyan-600 font-bold text-sm">
                <Droplets className="w-4 h-4" />
                <span>การดื่มน้ำ & แร่ธาตุ (Hydration Strategy)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-cyan-50/70 p-3 rounded-xl border border-cyan-200">
                {program.nutritionTips.hydration}
              </p>
              <div className="text-[11px] text-slate-500">
                💧 <strong>สูตรคำนวณ:</strong> น้ำหนักตัว (กก.) × 35 = มล. น้ำที่ร่างกายต้องการขั้นต่ำต่อวัน
              </div>
            </div>

            {/* Supplements & Sleep */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                <Moon className="w-4 h-4" />
                <span>การพักผ่อน & อาหารเสริม (Rest & Supplement)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-purple-50/70 p-3 rounded-xl border border-purple-200">
                {program.nutritionTips.supplement}
              </p>
              <div className="text-[11px] text-slate-500">
                😴 <strong>การนอน:</strong> การนอนหลับลึก 7-8 ชั่วโมงคือช่วงที่ฮอร์โมนเผาผลาญและสร้างกล้ามเนื้อทำงานอย่างเต็มประสิทธิภาพที่สุด
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
