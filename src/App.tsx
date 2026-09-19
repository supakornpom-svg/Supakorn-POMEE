import { useState, useEffect } from 'react';
import type { BmiRecord, DatabaseStats, LineSettings } from './types';
import { Header } from './components/Header';
import { BmiForm } from './components/BmiForm';
import { HealthAdviceCard } from './components/HealthAdviceCard';
import { HistoryList } from './components/HistoryList';
import { StatsOverview } from './components/StatsOverview';
import { LineSettingsModal } from './components/LineSettingsModal';
import { AdviceDetailModal } from './components/AdviceDetailModal';
import { Sparkles, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'stats'>('form');
  const [records, setRecords] = useState<BmiRecord[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [lineSettings, setLineSettings] = useState<LineSettings | null>(null);
  const [latestSavedRecord, setLatestSavedRecord] = useState<BmiRecord | null>(null);
  const [selectedRecordForAdvice, setSelectedRecordForAdvice] = useState<BmiRecord | null>(null);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [lineNotificationBanner, setLineNotificationBanner] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [recordsRes, statsRes, lineRes] = await Promise.all([
        fetch('/api/records'),
        fetch('/api/records/stats'),
        fetch('/api/settings/line'),
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

      if (lineRes.ok) {
        const lineData = await lineRes.json();
        setLineSettings(lineData);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordSaved = (
    newRecord: BmiRecord,
    lineResult?: { success: boolean; message: string }
  ) => {
    setRecords((prev) => [newRecord, ...prev]);
    setLatestSavedRecord(newRecord);
    fetchData();

    if (lineResult) {
      setLineNotificationBanner(lineResult);
      // Auto-hide banner after 7 seconds
      setTimeout(() => {
        setLineNotificationBanner(null);
      }, 7000);
    }
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
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordCount={records.length}
        lineSettings={lineSettings}
        onOpenLineModal={() => setIsLineModalOpen(true)}
      />

      {/* Real-time LINE Notification Delivery Banner */}
      {lineNotificationBanner && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3 w-full animate-in fade-in slide-in-from-top-2">
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs ${
              lineNotificationBanner.success
                ? 'bg-[#06C755]/10 border-[#06C755]/30 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  lineNotificationBanner.success ? 'bg-[#06C755] text-white' : 'bg-amber-500 text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold">
                  {lineNotificationBanner.success
                    ? 'แจ้งเตือน LINE สำเร็จ: '
                    : 'สถานะการแจ้งเตือน LINE: '}
                </span>
                <span className="text-slate-600">{lineNotificationBanner.message}</span>
              </div>
            </div>

            <button
              onClick={() => setIsLineModalOpen(true)}
              className="text-xs font-semibold underline text-[#06C755] hover:text-emerald-800 shrink-0 cursor-pointer"
            >
              ดูรายละเอียด LINE
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form & Gauge */}
            <div className="lg:col-span-7 space-y-6">
              <BmiForm onRecordSaved={handleRecordSaved} />
            </div>

            {/* Right Column: Tailored Health Plan */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>คำแนะนำการกินและการออกกำลังกาย</span>
                </div>
                {latestSavedRecord && (
                  <span className="text-[11px] text-slate-500">
                    ข้อมูลล่าสุด: {latestSavedRecord.name}
                  </span>
                )}
              </div>

              {latestSavedRecord && latestSavedRecord.aiRecommendation ? (
                <HealthAdviceCard
                  record={latestSavedRecord}
                  plan={latestSavedRecord.aiRecommendation}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    ยังไม่มีข้อมูลคำแนะนำในขณะนี้
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    กรอกข้อมูลชื่อ น้ำหนัก และส่วนสูงในฟอร์มด้านซ้าย
                    เพื่อรับตารางอาหารและการออกกำลังกายเฉพาะบุคคลทันที
                  </p>
                </div>
              )}

              {/* Quick LINE Reminder Card */}
              {!lineSettings?.isConfigured && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <div className="w-5 h-5 rounded-full bg-[#06C755] text-white flex items-center justify-center text-[10px] font-bold">
                      L
                    </div>
                    <span>ต้องการรับแจ้งเตือนเมื่อมีข้อมูลใหม่หรือไม่?</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    คุณสามารถเชื่อมต่อ LINE Notify ฟรี เพื่อให้ระบบส่งสรุปผล BMI,
                    สถานะสุขภาพ และคำแนะนำเข้าแชท LINE อัตโนมัติทุกครั้งที่มีผู้กรอกข้อมูล
                  </p>
                  <button
                    onClick={() => setIsLineModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                  >
                    ตั้งค่า LINE Notify ตอนนี้ &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryList
            records={records}
            onSelectRecord={(rec) => setSelectedRecordForAdvice(rec)}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'stats' && <StatsOverview stats={stats} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>
            ระบบบันทึกดัชนีมวลกาย (BMI) ออนไลน์ • ตามเกณฑ์มาตรฐานเอเชีย (Asian BMI Classification)
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> ฐานข้อมูลเรียลไทม์
            </span>
            <span>•</span>
            <button
              onClick={() => setIsLineModalOpen(true)}
              className="text-slate-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5" /> แจ้งเตือน LINE
            </button>
          </div>
        </div>
      </footer>

      {/* LINE Settings & Test Modal */}
      <LineSettingsModal
        isOpen={isLineModalOpen}
        onClose={() => setIsLineModalOpen(false)}
        lineSettings={lineSettings}
        onSettingsUpdated={fetchData}
      />

      {/* Advice Detail Modal */}
      <AdviceDetailModal
        record={selectedRecordForAdvice}
        onClose={() => setSelectedRecordForAdvice(null)}
      />
    </div>
  );
}
