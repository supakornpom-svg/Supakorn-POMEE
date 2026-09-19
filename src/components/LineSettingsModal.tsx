import React, { useState } from 'react';
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Key,
  HelpCircle,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import type { LineSettings } from '../types';

interface LineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineSettings: LineSettings | null;
  onSettingsUpdated: () => void;
}

export const LineSettingsModal: React.FC<LineSettingsModalProps> = ({
  isOpen,
  onClose,
  lineSettings,
  onSettingsUpdated,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/settings/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');

      setTestResult({
        success: true,
        message: data.message || 'บันทึก LINE Token เรียบร้อยแล้ว',
      });
      onSettingsUpdated();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'เกิดข้อผิดพลาดในการบันทึก',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/settings/line/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() || undefined }),
      });
      const data = await response.json();

      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'ส่งข้อความทดสอบสำเร็จแล้ว' : 'ส่งไม่สำเร็จ'),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'เกิดข้อผิดพลาดในการส่งข้อความทดสอบ',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#06C755] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl text-white">
              L
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">ตั้งค่าและทดสอบการแจ้งเตือน LINE</h3>
              <p className="text-xs text-emerald-100">
                รับการแจ้งเตือนทันทีทาง LINE เมื่อมีผู้กรอกข้อมูล BMI ใหม่เข้ามา
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800">
          {/* Current Status Badge */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
              lineSettings?.isConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              {lineSettings?.isConfigured ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="font-bold">
                  {lineSettings?.isConfigured
                    ? 'สถานะ: เชื่อมต่อ LINE เรียบร้อยแล้ว'
                    : 'สถานะ: ยังไม่ได้เชื่อมต่อ LINE'}
                </span>
                {lineSettings?.tokenMasked && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Token ปัจจุบัน: {lineSettings.tokenMasked}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleTestNotification}
              disabled={testing || (!lineSettings?.isConfigured && !tokenInput.trim())}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-[#06C755]" />}
              <span>ทดสอบส่ง LINE</span>
            </button>
          </div>

          {/* Test or Feedback Result */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs sm:text-sm flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Token Input Form */}
          <form onSubmit={handleSaveToken} className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  LINE Notify Access Token
                </label>
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-xs text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>วิธีรับ Token ฟรี</span>
                </button>
              </div>

              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={
                    lineSettings?.isConfigured
                      ? 'ใส่ Token ใหม่ที่นี่เพื่ออัปเดต หรือลบเพื่อยกเลิก'
                      : 'วาง LINE Notify Token ที่นี่...'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#06C755] focus:ring-2 focus:ring-[#06C755]/20 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>บันทึกการตั้งค่า Token</span>
              </button>
            </div>
          </form>

          {/* Instructions Accordion */}
          {showInstructions && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-[#06C755]" />
                <span>วิธีขอรับ LINE Notify Token ฟรี (ใช้เวลา 1 นาที):</span>
              </h4>
              <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-600">
                <li>
                  เปิดเว็บไซต์{' '}
                  <a
                    href="https://notify-bot.line.me/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#06C755] font-semibold underline"
                  >
                    https://notify-bot.line.me
                  </a>{' '}
                  และกดเข้าสู่ระบบด้วยบัญชี LINE ของคุณ
                </li>
                <li>คลิกที่ชื่อโปรไฟล์มุมขวาบน เลือกเมนู <strong>&quot;หน้าของฉัน (My page)&quot;</strong></li>
                <li>เลื่อนลงมาด้านล่างสุด กดปุ่ม <strong>&quot;ออก Token (Generate token)&quot;</strong></li>
                <li>ตั้งชื่อการแจ้งเตือน (เช่น <em>BMI-Alert</em>) และเลือกห้องแชทส่วนตัวหรือกลุ่มที่ต้องการให้แจ้งเตือน</li>
                <li>คัดลอก Token มาวางในช่องด้านบนนี้ แล้วกดปุ่ม <strong>&quot;บันทึกการตั้งค่า&quot;</strong> ได้ทันที</li>
              </ol>
            </div>
          )}

          {/* Real-time LINE Chat Message Preview */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100">
            <div className="bg-[#74879e] text-white px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>ตัวอย่างข้อความแจ้งเตือนที่จะได้รับใน LINE</span>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#06C755] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  L
                </div>
                <div className="bg-white rounded-2xl rounded-tl-xs p-3 text-xs shadow-xs border border-slate-200/80 max-w-[85%] space-y-1 text-slate-800 font-sans">
                  <div className="font-bold text-slate-900">
                    🔔 แจ้งเตือน: มีการบันทึกข้อมูล BMI ใหม่!
                  </div>
                  <div className="text-slate-400 text-[10px]">━━━━━━━━━━━━━━━━━━━━</div>
                  <div>👤 คุณ: นาวา โชคดี (อายุ 28 ปี)</div>
                  <div>⚖️ น้ำหนัก: 78.5 kg | ส่วนสูง: 172 cm</div>
                  <div className="font-semibold text-amber-700">
                    📊 ค่า BMI: 26.5 ⚠️ (อ้วนระดับ 1)
                  </div>
                  <div className="text-emerald-700">🎯 น้ำหนักที่เหมาะสม: 54.7 - 67.7 kg</div>
                  <div>🔥 BMR: 1720 kcal | TDEE: 2365 kcal</div>
                  <div>📌 เป้าหมาย: ลดน้ำหนัก/สลายไขมัน</div>
                  <div className="text-slate-400 text-[10px]">━━━━━━━━━━━━━━━━━━━━</div>
                  <div className="text-[11px] text-slate-500">
                    💡 ดูตารางอาหารและการออกกำลังกายได้ในระบบทันที!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
