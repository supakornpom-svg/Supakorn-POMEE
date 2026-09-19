import React from 'react';
import { X, Sparkles, Printer } from 'lucide-react';
import type { BmiRecord } from '../types';
import { HealthAdviceCard } from './HealthAdviceCard';

interface AdviceDetailModalProps {
  record: BmiRecord | null;
  onClose: () => void;
}

export const AdviceDetailModal: React.FC<AdviceDetailModalProps> = ({ record, onClose }) => {
  if (!record || !record.aiRecommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              คำแนะนำโภชนาการและการออกกำลังกาย - คุณ {record.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="พิมพ์คำแนะนำ"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          <HealthAdviceCard record={record} plan={record.aiRecommendation} />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
