import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import {
  Trophy,
  Download,
  Share2,
  X,
  CheckCircle,
  Flame,
  Scale,
  Activity,
  Heart,
  Calendar,
  Sparkles,
  Award,
  Loader2,
  Copy,
  Camera,
  User,
  Trash2,
} from 'lucide-react';
import type { AchievementData } from '../types';
import { MASCOTS, MOTIVATIONAL_QUOTES } from '../assets/mascots';
import { ProfilePhotoCapture } from './ProfilePhotoCapture';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AchievementData;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedMascot, setSelectedMascot] = useState<'fit' | 'chubby'>('fit');
  const [userPhoto, setUserPhoto] = useState<string | undefined>(
    data.userPhoto || data.record?.photoUrl
  );
  const [showPhotoTool, setShowPhotoTool] = useState(false);

  // Sync user photo whenever data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setUserPhoto(data.userPhoto || data.record?.photoUrl);
      setShowPhotoTool(false);
    }
  }, [isOpen, data]);

  // Trigger celebration confetti when opened
  useEffect(() => {
    if (isOpen) {
      // Confetti burst
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#84cc16'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#34d399', '#f43f5e'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#38bdf8', '#a855f7'],
        });
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    try {
      // Generate clean PNG image
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0f172a',
      });

      const link = document.createElement('a');
      link.download = `fitness_achievement_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export achievement image:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const shareText = `🏆 ยินดีกับความสำเร็จด้านสุขภาพ!
👤 ${data.record?.name || 'สมาชิกสายสปอร์ต'}
📊 ค่า BMI: ${data.record ? data.record.bmi : 'เป้าหมายสำเร็จ'} (${data.record?.categoryLabelTh || 'สุดยอด!'})
🔥 พิชิต: ${data.completedActivity || data.title}
💪 สุขภาพดีเริ่มต้นได้ทุกวัน!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ถ้วยรางวัลความสำเร็จด้านสุขภาพ & ฟิตเนส',
          text: shareText,
        });
      } catch (e) {
        // Fallback to clipboard
        navigator.clipboard?.writeText(shareText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      }
    } else {
      navigator.clipboard?.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          {/* Backdrop dismiss */}
          <div className="fixed inset-0" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative w-full max-w-lg bg-slate-900 text-white rounded-3xl border border-slate-700/80 shadow-2xl shadow-emerald-500/20 overflow-hidden z-10 my-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bouncy Golden Trophy Header with dynamic glow */}
            <div className="relative pt-8 pb-3 text-center px-4 overflow-hidden bg-gradient-to-b from-amber-500/20 via-emerald-500/10 to-transparent">
              {/* Animated Glow Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

              {/* Bouncy 3D Trophy */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: [0, 1.25, 0.95, 1.08, 1], rotate: [-20, 10, -5, 3, 0] }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="relative inline-block mb-2"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-xl shadow-amber-500/30">
                  <img
                    src={MASCOTS.trophy}
                    alt="ถ้วยรางวัลชนะเลิศ"
                    className="w-full h-full object-cover rounded-[22px]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-500 to-lime-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> CHAMPION
                  </div>
                </div>
              </motion.div>

              {/* Title & Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider mb-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> {data.badgeName || 'ความสำเร็จสายฟิตเนส'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-lime-300 tracking-tight">
                  {data.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto">
                  {data.subtitle}
                </p>
              </motion.div>

              {/* Custom Controls Bar: Mascot & Photo Toggle */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">มาสคอต:</span>
                  <button
                    onClick={() => setSelectedMascot('fit')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      selectedMascot === 'fit'
                        ? 'bg-lime-500 text-slate-950 shadow-md shadow-lime-500/30 scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    โค้ชหุ่นฟิต
                  </button>
                  <button
                    onClick={() => setSelectedMascot('chubby')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      selectedMascot === 'chubby'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    น้องจ้ำม่ำ
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-700 hidden sm:block" />

                {/* Camera / Photo Button */}
                <button
                  type="button"
                  onClick={() => setShowPhotoTool(!showPhotoTool)}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    userPhoto
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-lime-400" />
                  <span>{userPhoto ? 'เปลี่ยนภาพตัวเอง' : 'ถ่ายภาพตัวเองลงการ์ด'}</span>
                </button>
              </div>

              {/* Photo Tool Dropdown inside Modal */}
              {showPhotoTool && (
                <div className="mt-3 p-3 bg-slate-950 rounded-2xl border border-slate-700 text-left">
                  <ProfilePhotoCapture
                    photoUrl={userPhoto}
                    onPhotoChange={(newPhoto) => {
                      setUserPhoto(newPhoto);
                      if (data.record) {
                        data.record.photoUrl = newPhoto;
                      }
                    }}
                    label="ถ่ายภาพตัวเองเพื่อโชว์บนการ์ดใบนี้"
                  />
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setShowPhotoTool(false)}
                      className="text-xs text-lime-400 font-semibold hover:underline cursor-pointer"
                    >
                      เสร็จสิ้นการตั้งค่ารูป
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Achievement Card Content (Target for Image Export) */}
            <div className="p-4 sm:p-5">
              <div
                ref={cardRef}
                id="achievement-sport-card"
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xl space-y-4 relative overflow-hidden"
              >
                {/* Background decorative watermark */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Card Top Branding */}
                <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                      ⚡
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-400 tracking-wider">
                        SPORT HEALTH TRACKER
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Official Athlete Certificate
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" /> VICTORY
                    </span>
                  </div>
                </div>

                {/* Mascot & User Spotlight with Athlete Photo */}
                <div className="flex items-center gap-3.5 bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/70 relative">
                  {/* Visual Pair: User Self Photo + Mascot Cheerleader */}
                  <div className="flex items-center -space-x-4 shrink-0">
                    {/* User Athlete Photo */}
                    {userPhoto ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg z-10 bg-slate-900">
                        <img
                          src={userPhoto}
                          alt="ภาพตนเอง"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-[9px] text-center font-bold text-white py-0.5">
                          ATHLETE
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setShowPhotoTool(true)}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-slate-600 hover:border-emerald-400 bg-slate-900 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors z-10"
                        title="คลิกเพื่อถ่ายภาพตัวเองลงบนการ์ด"
                      >
                        <Camera className="w-5 h-5 text-lime-400" />
                        <span className="text-[9px] font-semibold mt-1">ถ่ายภาพ</span>
                      </div>
                    )}

                    {/* Mascot Cheerleader Companion */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-md bg-slate-900">
                      <img
                        src={selectedMascot === 'fit' ? MASCOTS.fit : MASCOTS.chubby}
                        alt="Mascot"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-center font-bold text-amber-300 py-0.5">
                        {selectedMascot === 'fit' ? 'COACH' : 'MASCOT'}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 pl-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{data.date || new Date().toLocaleDateString('th-TH')}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white truncate flex items-center gap-1.5">
                      <span>{data.record?.name || 'ยอดนักกีฬาเพื่อสุขภาพ'}</span>
                      {userPhoto && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          VERIFIED
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-lime-400 font-semibold mt-0.5 truncate">
                      {data.completedActivity || 'บันทึกสุขภาพ & ฟิตเนสสำเร็จ'}
                    </p>
                    <p className="text-[11px] text-slate-300 italic line-clamp-1 mt-1">
                      {selectedMascot === 'fit'
                        ? '“สุดยอดมากครับ! รักษาโมเมนตัมนี้ไว้ หุ่นดีอยู่ไม่ไกล!”'
                        : '“เย้! เราทำได้แล้วครับ วันนี้ชนะใจตัวเองได้อีก 1 วัน!”'}
                    </p>
                  </div>
                </div>

                {/* Key Stats Grid */}
                {data.record && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-400" /> BMI
                      </div>
                      <div className="text-lg font-black text-emerald-400 mt-0.5">
                        {data.record.bmi}
                      </div>
                      <div className="text-[9px] text-slate-300 truncate">
                        {data.record.categoryLabelTh}
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" /> เผาผลาญ TDEE
                      </div>
                      <div className="text-lg font-black text-amber-400 mt-0.5">
                        {Math.round(data.record.tdee)}
                      </div>
                      <div className="text-[9px] text-slate-300">
                        kcal / วัน
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                        <Scale className="w-3 h-3 text-cyan-400" /> นน. เหมาะสม
                      </div>
                      <div className="text-sm font-black text-cyan-400 mt-1">
                        {data.record.idealWeightMin}-{data.record.idealWeightMax}
                      </div>
                      <div className="text-[9px] text-slate-300">
                        กิโลกรัม
                      </div>
                    </div>
                  </div>
                )}

                {/* Motivational Quote */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-center">
                  <p className="text-[11px] text-emerald-300 font-medium">
                    {randomQuote}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Save Image & Share */}
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  id="btn-save-achievement-card"
                  onClick={handleDownloadCard}
                  disabled={isSaving}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>กำลังสร้างรูปภาพ...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>เซฟภาพสรุปความสำเร็จ (Save Image)</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-share-achievement"
                  onClick={handleShare}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>คัดลอกข้อความแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>แชร์ผลลัพธ์</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

