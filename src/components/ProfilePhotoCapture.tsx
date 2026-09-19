import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  Check,
  SwitchCamera,
  AlertCircle,
  User,
  Trash2,
} from 'lucide-react';

interface ProfilePhotoCaptureProps {
  photoUrl?: string;
  onPhotoChange: (photoUrl: string | undefined) => void;
  label?: string;
}

export const ProfilePhotoCapture: React.FC<ProfilePhotoCaptureProps> = ({
  photoUrl,
  onPhotoChange,
  label = 'รูปภาพโปรไฟล์ผู้ฝึกซ้อม (สำหรับโชว์บนการ์ดแชร์ความสำเร็จ)',
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera media tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  }, []);

  // Start camera stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('เบราว์เซอร์ไม่รองรับการเปิดกล้องถ่ายภาพ');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.error('Video play error:', err);
        });
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = 'ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาตใช้งานกล้อง (Camera Permission)';
      if (err.name === 'NotAllowedError') {
        message = 'ท่านได้ปฏิเสธการเข้าถึงกล้อง กรุณากดอนุญาตในแถบเบราว์เซอร์ หรือใช้วิธีอัปโหลดรูปภาพแทน';
      } else if (err.name === 'NotFoundError') {
        message = 'ไม่พบอุปกรณ์กล้องบนเครื่องของคุณ กรุณาอัปโหลดรูปภาพแทน';
      }
      setCameraError(message);
      setIsCameraActive(false);
    }
  };

  // Switch between front and back camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  // Re-start camera when facingMode toggles while active
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Capture frame from video stream to base64
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Crop to square for profile
    const sourceSize = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    const targetSize = Math.min(sourceSize, 320); // crisp and lightweight avatar

    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop
    const startX = ((video.videoWidth || sourceSize) - sourceSize) / 2;
    const startY = ((video.videoHeight || sourceSize) - sourceSize) / 2;

    // Mirror if front camera
    if (facingMode === 'user') {
      ctx.translate(targetSize, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, sourceSize, sourceSize, 0, 0, targetSize, targetSize);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
    onPhotoChange(dataUrl);
    stopCamera();
  };

  // Upload photo from file input (supports camera on mobile via capture)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress & scale to square thumbnail max 320x320
        const maxDim = 320;
        const width = img.width;
        const height = img.height;
        const size = Math.min(width, height);
        const targetDim = Math.min(size, maxDim);

        const canvas = document.createElement('canvas');
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sx = (width - size) / 2;
          const sy = (height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, targetDim, targetDim);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          onPhotoChange(compressed);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);

    // Reset input value
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>{label}</span>
        </label>
        {photoUrl && (
          <button
            type="button"
            onClick={() => onPhotoChange(undefined)}
            className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer font-medium"
          >
            <Trash2 className="w-3 h-3" />
            <span>ลบรูป</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        {/* Preview / Live Viewport */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-200 border-2 border-slate-300 shadow-inner shrink-0 flex items-center justify-center">
          {isCameraActive ? (
            <div className="relative w-full h-full bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              <div className="absolute top-1 right-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
              </div>
            </div>
          ) : photoUrl ? (
            <img
              src={photoUrl}
              alt="ภาพโปรไฟล์ผู้ฝึกซ้อม"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
              <User className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[10px] mt-1 font-medium text-slate-500">ไม่มีรูปโปรไฟล์</span>
            </div>
          )}

          {/* Active indicator or badge */}
          {photoUrl && !isCameraActive && (
            <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1 rounded-full shadow-sm">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 w-full space-y-2 text-center sm:text-left">
          {isCameraActive ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                จัดใบหน้าให้อยู่ในกรอบ แล้วกดยิงชัตเตอร์เพื่อถ่ายภาพ
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>ถ่ายภาพนี้ (Take Photo)</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="สลับกล้องหน้า/กล้องหลัง"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                ถ่ายภาพตนเองหรืออัปโหลดรูปภาพ เพื่อให้ภาพถ่ายของคุณปรากฏบน{' '}
                <strong className="text-emerald-700 font-bold">ป๊อปอัพถ้วยรางวัลความสำเร็จ</strong>{' '}
                และแชร์ผลลัพธ์ได้อย่างภาคภูมิใจ
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                {/* Take Photo Button */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-lime-400" />
                  <span>เปิดกล้องถ่ายภาพตัวเอง</span>
                </button>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>เลือกรูปจากเครื่อง</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {cameraError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{cameraError}</p>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  สามารถเลือกรูปภาพจากมือถือหรือคอมพิวเตอร์ผ่านปุ่ม &quot;เลือกรูปจากเครื่อง&quot; แทนได้ทันที
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
