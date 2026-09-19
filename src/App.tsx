import { useState, useEffect } from 'react';
import type { BmiRecord, DatabaseStats, AchievementData } from './types';
import { Header } from './components/Header';
import { BmiForm } from './components/BmiForm';
import { HealthAdviceCard } from './components/HealthAdviceCard';
import { HistoryList } from './components/HistoryList';
import { StatsOverview } from './components/StatsOverview';
import { AdviceDetailModal } from './components/AdviceDetailModal';
import { WorkoutPlanner } from './components/WorkoutPlanner';
import { CelebrationModal } from './components/CelebrationModal';
import { Sparkles, CheckCircle2, ShieldCheck, Heart, Trophy, Dumbbell } from 'lucide-react';
import { MASCOTS } from './assets/mascots';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'workout' | 'history' | 'stats'>('form');
  const [records, setRecords] = useState<BmiRecord[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [latestSavedRecord, setLatestSavedRecord] = useState<BmiRecord | null>(null);
  const [selectedRecordForAdvice, setSelectedRecordForAdvice] = useState<BmiRecord | null>(null);

  // Celebration Trophy Pop-up State
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<AchievementData>({
    title: '🏆 ยินดีด้วยกับความสำเร็จด้านสุขภาพ!',
    subtitle: 'เริ่มต้นก้าวแรกเพื่อร่างกายที่แข็งแกร่งและฟิตสมส่วน',
    badgeName: 'ภารกิจสุขภาพสำเร็จ',
    mascotType: 'fit',
    date: new Date().toLocaleDateString('th-TH'),
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [recordsRes, statsRes] = await Promise.all([
        fetch('/api/records'),
        fetch('/api/records/stats'),
      ]);

      if (recordsRes.ok) {
        const data = await recordsRes.json();
        setRecords(data.records || []);
        if (data.records && data.records.length > 0 && !latestSavedRecord) {
          setLatestSavedRecord(data.records[0]);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerCelebration = (
    title: string,
    subtitle: string,
    activityName: string,
    targetRecord?: BmiRecord
  ) => {
    const rec = targetRecord || latestSavedRecord || records[0];
    setCelebrationData({
      title,
      subtitle,
      badgeName: 'VICTORY TROPHY',
      mascotType: 'fit',
      record: rec,
      completedActivity: activityName,
      date: new Date().toLocaleDateString('th-TH'),
    });
    setIsCelebrationOpen(true);
  };

  const handleRecordSaved = (newRecord: BmiRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    setLatestSavedRecord(newRecord);
    fetchData();
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (latestSavedRecord?.id === id) {
          setLatestSavedRecord(null);
        }
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-lime-400 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordCount={records.length}
        onOpenCelebration={() =>
          triggerCelebration(
            '🏆 ถ้วยรางวัลแห่งความสำเร็จด้านสุขภาพ!',
            'บันทึกสถิติความฟิตและแชร์ความภาคภูมิใจของคุณ',
            'สถิติสุขภาพ & บันทึกดัชนีมวลกาย'
          )
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* TAB 1: FORM & LIVE GAUGE */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form & Gauge */}
            <div className="lg:col-span-7 space-y-6">
              <BmiForm
                onRecordSaved={handleRecordSaved}
                onCelebrate={(title, subtitle, activity) =>
                  triggerCelebration(title, subtitle, activity)
                }
              />
            </div>

            {/* Right Column: Tailored Health Plan & Quick Workout Prompt */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-lime-400 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-lime-400" />
                  <span>คำแนะนำการกิน & การออกกำลังกาย</span>
                </div>
                {latestSavedRecord && (
                  <span className="text-[11px] text-slate-400">
                    ข้อมูลล่าสุด: {latestSavedRecord.name}
                  </span>
                )}
              </div>

              {latestSavedRecord && latestSavedRecord.aiRecommendation ? (
                <HealthAdviceCard
                  record={latestSavedRecord}
                  plan={latestSavedRecord.aiRecommendation}
                  onGoToWorkout={() => setActiveTab('workout')}
                  onCelebrate={() =>
                    triggerCelebration(
                      `🏆 ยินดีกับคุณ ${latestSavedRecord.name}!`,
                      `ได้รับแผนโภชนาการและการออกกำลังกายเฉพาะบุคคลเรียบร้อยแล้ว`,
                      `แผนสุขภาพเฉพาะบุคคล BMI ${latestSavedRecord.bmi}`
                    )
                  }
                />
              ) : (
                <div className="bg-slate-900 rounded-3xl border border-dashed border-slate-700 p-7 text-center space-y-3">
                  <div className="flex items-center justify-center -space-x-2">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-lime-400 shadow">
                      <img
                        src={MASCOTS.fit}
                        alt="Coach Fit"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 shadow">
                      <img
                        src={MASCOTS.chubby}
                        alt="Chubby Hero"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    พร้อมเริ่มต้นฟิตหุ่นไปด้วยกันหรือยัง?
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    กรอกข้อมูลชื่อ น้ำหนัก และส่วนสูงในฟอร์มด้านซ้าย
                    เพื่อรับการวิเคราะห์ BMI, TDEE ตารางอาหาร และโปรแกรมการออกกำลังกายทันที!
                  </p>
                </div>
              )}

              {/* Quick Jump to Workout Schedule Card */}
              <div
                onClick={() => setActiveTab('workout')}
                className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/40 hover:border-lime-400 rounded-3xl p-4 text-xs space-y-2 cursor-pointer transition-all hover:scale-[1.01] shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-lime-300">
                    <Dumbbell className="w-4 h-4 text-lime-400" />
                    <span>ตารางแนะนำโปรแกรมออกกำลังกาย</span>
                  </div>
                  <span className="text-[10px] bg-lime-400 text-slate-950 font-black px-2 py-0.5 rounded-full group-hover:bg-lime-300">
                    เปิดตาราง &gt;
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  เลือกโปรแกรมรายสัปดาห์ (7 วัน) หรือรายเดือน (4 สัปดาห์) เหมาะสมทั้งผู้เริ่มต้น ผู้มีน้ำหนักเกิน และผู้ต้องการสร้างกล้ามเนื้อ
                </p>
              </div>

              {/* Health Guidance Overview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-xs space-y-2 text-slate-300">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ระบบคำนวณและบันทึกข้อมูลอัตโนมัติ</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  เมื่อบันทึกข้อมูล ระบบจะคำนวณค่า BMI (เกณฑ์เอเชีย), BMR, TDEE และช่วงน้ำหนักที่เหมาะสม พร้อมตารางอาหารที่ออกแบบเฉพาะบุคคลทันที
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPORT WORKOUT & NUTRITION PROGRAM (WEEKLY & MONTHLY) */}
        {activeTab === 'workout' && (
          <WorkoutPlanner
            currentRecord={latestSavedRecord || records[0]}
            onCelebrate={(title, subtitle, activity) =>
              triggerCelebration(title, subtitle, activity)
            }
          />
        )}

        {/* TAB 3: HISTORY LIST */}
        {activeTab === 'history' && (
          <HistoryList
            records={records}
            onSelectRecord={(rec) => setSelectedRecordForAdvice(rec)}
            onDeleteRecord={handleDeleteRecord}
            onCelebrateRecord={(rec) =>
              triggerCelebration(
                `🏆 ประวัติความสำเร็จ: คุณ ${rec.name}`,
                `บันทึกเมื่อ: ${new Date(rec.createdAt).toLocaleDateString('th-TH')} • BMI ${rec.bmi} (${rec.categoryLabelTh})`,
                `บันทึกประวัติสุขภาพดัชนีมวลกาย`,
                rec
              )
            }
          />
        )}

        {/* TAB 4: STATS OVERVIEW */}
        {activeTab === 'stats' && <StatsOverview stats={stats} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/90 py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>
            SPORT FIT & BMI TRACKER • ระบบดัชนีมวลกายและโปรแกรมฟิตเนสสายสปอร์ต (Asian Standard)
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                triggerCelebration(
                  '🏆 ฉลองความสำเร็จด้านสุขภาพ!',
                  'ยินดีกับทุกความพยายามเพื่อสุขภาพที่ดีของคุณ',
                  'แชมเปี้ยนประจำวัน'
                )
              }
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" /> ฉลองความสำเร็จ
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> ฐานข้อมูลเรียลไทม์
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> หุ่นดี สุขภาพแข็งแกร่ง
            </span>
          </div>
        </div>
      </footer>

      {/* Advice Detail Modal */}
      <AdviceDetailModal
        record={selectedRecordForAdvice}
        onClose={() => setSelectedRecordForAdvice(null)}
      />

      {/* Celebration Trophy Pop-up Modal */}
      <CelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        data={celebrationData}
      />
    </div>
  );
}
