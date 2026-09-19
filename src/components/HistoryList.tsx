import React, { useState } from 'react';
import {
  Search,
  Trash2,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  Bell,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import type { BmiRecord } from '../types';

interface HistoryListProps {
  records: BmiRecord[];
  onSelectRecord: (record: BmiRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch = rec.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || rec.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exportToCsv = () => {
    if (records.length === 0) return;
    const headers = [
      'ID',
      'ชื่อ',
      'เพศ',
      'อายุ',
      'น้ำหนัก(kg)',
      'ส่วนสูง(cm)',
      'BMI',
      'สถานะ',
      'ช่วงน้ำหนักที่เหมาะสม',
      'BMR(kcal)',
      'TDEE(kcal)',
      'สถานะ LINE',
      'วันที่บันทึก',
    ];

    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.name}"`,
      `"${r.gender}"`,
      r.age,
      r.weight,
      r.height,
      r.bmi,
      `"${r.categoryLabelTh}"`,
      `"${r.idealWeightMin}-${r.idealWeightMax}"`,
      Math.round(r.bmr),
      Math.round(r.tdee),
      `"${r.lineNotificationStatus || 'none'}"`,
      `"${new Date(r.createdAt).toLocaleString('th-TH')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bmi_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBmiBadge = (bmi: number, label: string) => {
    if (bmi < 18.5) return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">{label}</span>;
    if (bmi <= 22.9) return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium">{label}</span>;
    if (bmi <= 24.9) return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-medium">{label}</span>;
    if (bmi <= 29.9) return <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-medium">{label}</span>;
    return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-medium">{label}</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            ประวัติการบันทึกในฐานข้อมูล ({filteredRecords.length} รายการ)
          </h2>
          <p className="text-xs text-slate-500">
            ข้อมูลจะถูกบันทึกจัดเก็บถาวรในฐานข้อมูล สามารถค้นหา ส่งออก หรือเปิดดูคำแนะนำได้
          </p>
        </div>

        <button
          onClick={exportToCsv}
          disabled={records.length === 0}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>ส่งออก CSV (Excel)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อผู้บันทึก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="all">ทุกระดับเกณฑ์ BMI</option>
            <option value="underweight">ผอม (ต่ำกว่าเกณฑ์)</option>
            <option value="normal">ปกติ (สมส่วน)</option>
            <option value="overweight">น้ำหนักเกิน (ท้วม)</option>
            <option value="obese1">อ้วนระดับ 1</option>
            <option value="obese2">อ้วนระดับ 2</option>
          </select>
        </div>
      </div>

      {/* Record Cards (Mobile-friendly list) */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">ไม่พบรายการข้อมูล</p>
          <p className="text-xs text-slate-400 mt-0.5">ลองเปลี่ยนคำค้นหา หรือกรอกข้อมูล BMI ใหม่</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((rec) => {
            const dateStr = new Date(rec.createdAt).toLocaleString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={rec.id}
                className="border border-slate-200 hover:border-emerald-300 rounded-xl p-4 transition-all bg-slate-50/40 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rec.name}</span>
                    <span className="text-xs text-slate-400">
                      ({rec.gender === 'male' ? 'ชาย' : rec.gender === 'female' ? 'หญิง' : 'ทั่วไป'}, {rec.age} ปี)
                    </span>
                    {getBmiBadge(rec.bmi, rec.categoryLabelTh)}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <div>
                      <span>น้ำหนัก: </span>
                      <strong className="text-slate-800">{rec.weight} กก.</strong>
                    </div>
                    <div>
                      <span>ส่วนสูง: </span>
                      <strong className="text-slate-800">{rec.height} ซม.</strong>
                    </div>
                    <div>
                      <span>BMI: </span>
                      <strong className="text-emerald-700 font-bold">{rec.bmi}</strong>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* LINE status tag */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                        rec.lineNotificationStatus === 'sent'
                          ? 'bg-[#06C755]/10 text-[#06C755] border border-[#06C755]/20'
                          : rec.lineNotificationStatus === 'failed'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Bell className="w-2.5 h-2.5" />
                      {rec.lineNotificationStatus === 'sent'
                        ? 'ส่งแจ้งเตือน LINE สำเร็จ'
                        : rec.lineNotificationStatus === 'failed'
                        ? 'แจ้งเตือน LINE ล้มเหลว'
                        : 'ยังไม่ได้แจ้งเตือน LINE'}
                    </span>

                    {rec.notes && (
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        โน้ต: {rec.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => onSelectRecord(rec)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-xs border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="เปิดดูคำแนะนำอาหารและการออกกำลังกาย"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ดูคำแนะนำอาหาร/ออกกำลังกาย</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`ต้องการลบประวัติของ "${rec.name}" ออกจากฐานข้อมูลหรือไม่?`)) {
                        onDeleteRecord(rec.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ลบรายการนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
