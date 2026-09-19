import React, { useState } from 'react';
import {
  User,
  Scale,
  Ruler,
  Calendar,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import type { BmiCategory, BmiRecord } from '../types';
import { BmiGauge } from './BmiGauge';
import { ProfilePhotoCapture } from './ProfilePhotoCapture';

interface BmiFormProps {
  onRecordSaved: (record: BmiRecord) => void;
  onCelebrate?: (title: string, subtitle: string, activityName: string, targetRecord?: BmiRecord) => void;
}

export const BmiForm: React.FC<BmiFormProps> = ({ onRecordSaved, onCelebrate }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState<number>(30);
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(68);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active'>('light');
  const [goal, setGoal] = useState<'lose_weight' | 'maintain' | 'gain_weight'>('maintain');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Live BMI calculation
  const heightM = height > 0 ? height / 100 : 1.7;
  const liveBmi = height > 0 && weight > 0 ? Number((weight / (heightM * heightM)).toFixed(1)) : 0;

  // Live Category
  let category: BmiCategory = 'normal';
  let categoryLabelTh = 'สมส่วน (เกณฑ์ปกติ)';
  if (liveBmi < 18.5) {
    category = 'underweight';
    categoryLabelTh = 'น้ำหนักน้อยกว่าเกณฑ์';
  } else if (liveBmi <= 22.9) {
    category = 'normal';
    categoryLabelTh = 'น้ำหนักปกติ สมส่วน';
  } else if (liveBmi <= 24.9) {
    category = 'overweight';
    categoryLabelTh = 'น้ำหนักเกิน (ท้วม)';
  } else if (liveBmi <= 29.9) {
    category = 'obese1';
    categoryLabelTh = 'อ้วนระดับ 1';
  } else {
    category = 'obese2';
    categoryLabelTh = 'อ้วนระดับ 2 (อันตราย)';
  }

  const idealWeightMin = Number((18.5 * heightM * heightM).toFixed(1));
  const idealWeightMax = Number((22.9 * heightM * heightM).toFixed(1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'กรุณาระบุชื่อหรือชื่อเล่น' });
      return;
    }
    if (weight <= 0 || height <= 0 || age <= 0) {
      setStatusMessage({ type: 'error', text: 'กรุณาระบุน้ำหนัก ส่วนสูง และอายุให้ถูกต้อง' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          gender,
          age,
          weight,
          height,
          activityLevel,
          goal,
          notes,
          photoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
      }

      setStatusMessage({
        type: 'success',
        text: 'บันทึกข้อมูลเข้าฐานข้อมูลสำเร็จทันที!',
      });

      if (data.record) {
        onRecordSaved(data.record);
        if (onCelebrate) {
          onCelebrate(
            `🏆 บันทึกค่าสุขภาพสำเร็จ: คุณ ${data.record.name}!`,
            `BMI: ${data.record.bmi} (${data.record.categoryLabelTh}) • TDEE: ${Math.round(data.record.tdee)} kcal`,
            'บันทึกข้อมูลดัชนีมวลกาย (BMI) เรียบร้อยแล้ว',
            data.record
          );
        }
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Gauge */}
      <BmiGauge
        bmi={liveBmi}
        category={category}
        categoryLabelTh={categoryLabelTh}
        idealWeightMin={idealWeightMin}
        idealWeightMax={idealWeightMax}
        heightCm={height}
      />

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        id="bmi-entry-form"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              กรอกข้อมูลเพื่อบันทึกลงฐานข้อมูล
            </h2>
            <p className="text-xs text-slate-500">
              บันทึกข้อมูลเรียลไทม์ พร้อมคำนวณและวิเคราะห์คำแนะนำเฉพาะบุคคลทันที
            </p>
          </div>
          <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
            Asian Standard
          </span>
        </div>

        {/* Status Toast / Alert */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{statusMessage.text}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name Field */}
          <div className="sm:col-span-2">
            <label htmlFor="input-name" className="block text-xs font-semibold text-slate-800 mb-1.5">
              ชื่อ / นามสกุล หรือชื่อเล่น <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี หรือ นุ่น"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-950 font-medium text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Profile Photo Camera / Upload Capture */}
          <div className="sm:col-span-2">
            <ProfilePhotoCapture
              photoUrl={photoUrl}
              onPhotoChange={setPhotoUrl}
              label="ถ่ายภาพตัวเองเพื่อตั้งเป็นโปรไฟล์ผู้ฝึกซ้อม (โชว์บนการ์ดแชร์ความสำเร็จ)"
            />
          </div>

          {/* Gender Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">เพศ</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-gender-male"
                onClick={() => setGender('male')}
                className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                  gender === 'male'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ชาย
              </button>
              <button
                type="button"
                id="btn-gender-female"
                onClick={() => setGender('female')}
                className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                  gender === 'female'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'
                }`}
              >
                หญิง
              </button>
              <button
                type="button"
                id="btn-gender-other"
                onClick={() => setGender('other')}
                className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                  gender === 'other'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ทั่วไป
              </button>
            </div>
          </div>

          {/* Age Field */}
          <div>
            <label htmlFor="input-age" className="block text-xs font-semibold text-slate-800 mb-1.5">
              อายุ (ปี) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-age"
                type="number"
                min="5"
                max="120"
                value={age}
                onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-950 font-bold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAge((prev) => Math.max(5, prev - 1))}
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  aria-label="ลดอายุ"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAge((prev) => prev + 1)}
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  aria-label="เพิ่มอายุ"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Weight Field (kg) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="input-weight" className="text-xs font-semibold text-slate-800">
                น้ำหนัก (กิโลกรัม) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">ทศนิยม 1 ตำแหน่ง</span>
            </div>
            <div className="relative flex items-center">
              <Scale className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-weight"
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-950 font-bold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setWeight((prev) => Math.max(20, Number((prev - 0.5).toFixed(1))))}
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  aria-label="ลดน้ำหนัก 0.5 กก."
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setWeight((prev) => Number((prev + 0.5).toFixed(1)))}
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  aria-label="เพิ่มน้ำหนัก 0.5 กก."
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Height Field (cm) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="input-height" className="text-xs font-semibold text-slate-800">
                ส่วนสูง (เซนติเมตร) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">หน่วย cm</span>
            </div>
            <div className="relative flex items-center">
              <Ruler className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-height"
                type="number"
                step="0.5"
                min="50"
                max="250"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-950 font-bold text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setHeight((prev) => Math.max(50, prev - 1))}
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  aria-label="ลดส่วนสูง 1 ซม."
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setHeight((prev) => prev + 1)}
                  className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  aria-label="เพิ่มส่วนสูง 1 ซม."
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label htmlFor="select-activity" className="block text-xs font-semibold text-slate-800 mb-1.5">
              ระดับกิจกรรมในชีวิตประจำวัน
            </label>
            <select
              id="select-activity"
              value={activityLevel}
              onChange={(e: any) => setActivityLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-950 font-medium text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none cursor-pointer"
            >
              <option value="sedentary" className="text-slate-950 bg-white">นั่งทำงานเป็นหลัก แทบไม่ได้ออกกำลังกาย</option>
              <option value="light" className="text-slate-950 bg-white">ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์</option>
              <option value="moderate" className="text-slate-950 bg-white">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์</option>
              <option value="very_active" className="text-slate-950 bg-white">ออกกำลังกายหนัก/ทำงานใช้แรง 6-7 วัน</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label htmlFor="select-goal" className="block text-xs font-semibold text-slate-800 mb-1.5">
              เป้าหมายสุขภาพ
            </label>
            <select
              id="select-goal"
              value={goal}
              onChange={(e: any) => setGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-950 font-medium text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none cursor-pointer"
            >
              <option value="lose_weight" className="text-slate-950 bg-white">ลดน้ำหนัก / สลายไขมัน</option>
              <option value="maintain" className="text-slate-950 bg-white">รักษาน้ำหนัก / เพื่อสุขภาพสมบูรณ์</option>
              <option value="gain_weight" className="text-slate-950 bg-white">เพิ่มน้ำหนัก / เสริมสร้างกล้ามเนื้อ</option>
            </select>
          </div>

          {/* Optional Notes */}
          <div className="sm:col-span-2">
            <label htmlFor="input-notes" className="block text-xs font-semibold text-slate-800 mb-1.5">
              หมายเหตุเพิ่มเติมหรือข้อจำกัดร่างกาย (ถ้ามี)
            </label>
            <input
              id="input-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น มีอาการปวดเข่า, ทานมังสวิรัติ, แพ้อาหารทะเล"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-medium text-xs sm:text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ระบบจะสร้างแผนอาหารและการออกกำลังกายเฉพาะบุคคลทันที</span>
          </div>

          <button
            id="btn-submit-record"
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400 hover:from-lime-500 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>กำลังบันทึกและวิเคราะห์สุขภาพ...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>บันทึกข้อมูล & รับผลวิเคราะห์ทันที</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
