import type { SportWorkoutProgram, BmiRecord } from '../types';

/**
 * Clean cell text for CSV to avoid quoting issues or breakage
 */
function sanitizeCsvCell(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '""';
  const str = String(text).replace(/"/g, '""').trim();
  return `"${str}"`;
}

/**
 * Generate CSV formatted for Excel with UTF-8 BOM
 * Includes:
 * 1. Program Header (Name, Goal, Target, Level, Burn Rating)
 * 2. User Stats (if available)
 * 3. Nutrition & Hydration Guidelines
 * 4. Weekly 7-Day Workout Breakdown (Day, Focus, Exercise, Sets, Reps, Rest, Target Muscle, Tips, Cardio)
 * 5. Monthly 4-Week Progression Roadmap
 */
export function generateWorkoutExcelCsv(
  program: SportWorkoutProgram,
  userRecord?: BmiRecord | null
): string {
  const rows: string[][] = [];

  // Title Block
  rows.push(['SPORT FIT WORKOUT PROGRAM (โปรแกรมการฝึกและการออกกำลังกาย)']);
  rows.push(['ชื่อโปรแกรม', program.title]);
  rows.push(['คำอธิบาย', program.subtitle]);
  rows.push(['กลุ่มเป้าหมาย', program.targetCategory]);
  rows.push(['ระดับความเข้มข้น', program.level]);
  rows.push(['ระดับการเผาผลาญไขมัน (เต็ม 5)', `${program.burnRating}/5`]);
  rows.push(['วันที่ดาวน์โหลดตาราง', new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })]);

  // Optional User Details
  if (userRecord) {
    rows.push([]);
    rows.push(['ข้อมูลผู้ฝึกซ้อม']);
    rows.push(['ชื่อผู้ฝึกซ้อม', userRecord.name]);
    rows.push(['เพศ', userRecord.gender === 'male' ? 'ชาย' : userRecord.gender === 'female' ? 'หญิง' : 'ทั่วไป']);
    rows.push(['อายุ', `${userRecord.age} ปี`]);
    rows.push(['น้ำหนัก', `${userRecord.weight} กก.`]);
    rows.push(['ส่วนสูง', `${userRecord.height} ซม.`]);
    rows.push(['ดัชนีมวลกาย (BMI)', `${userRecord.bmi} (${userRecord.categoryLabelTh})`]);
    rows.push(['พลังงานพื้นฐาน BMR', `${Math.round(userRecord.bmr)} kcal`]);
    rows.push(['พลังงานเผาผลาญต่อวัน TDEE', `${Math.round(userRecord.tdee)} kcal`]);
  }

  rows.push([]);
  rows.push(['คำแนะนำด้านโภชนาการและการพักผ่อน (NUTRITION & RECOVERY GUIDELINES)']);
  rows.push(['ช่วงเวลา', 'คำแนะนำอาหาร & เครื่องดื่ม']);
  rows.push(['ก่อนออกกำลังกาย (Pre-Workout)', program.nutritionTips.preWorkout]);
  rows.push(['หลังออกกำลังกาย (Post-Workout)', program.nutritionTips.postWorkout]);
  rows.push(['การดื่มน้ำ (Hydration)', program.nutritionTips.hydration]);
  rows.push(['อาหารเสริม / แร่ธาตุ (Supplements)', program.nutritionTips.supplement]);

  rows.push([]);
  rows.push(['========================================================================================']);
  rows.push(['ตารางการฝึกรายสัปดาห์ 7 วัน (7-DAY WEEKLY SCHEDULE)']);
  rows.push(['========================================================================================']);
  
  // Weekly Table Header
  rows.push([
    'วัน',
    'ช่วงฝึก/ส่วนที่เน้น',
    'ประเภท/สถานะ',
    'ระยะเวลา (นาที)',
    'ความหนัก',
    'ลำดับท่า',
    'ชื่อท่าออกกำลังกาย',
    'จำนวนเซ็ต',
    'จำนวนครั้ง / เวลา',
    'เวลาพักระหว่างเซ็ต',
    'กล้ามเนื้อมัดเป้าหมาย',
    'เทคนิค & ฟอร์มที่ถูกต้อง (Coaching Tip)',
    'คำแนะนำคาร์ดิโอ / คูลดาวน์',
  ]);

  program.weeklySchedule.forEach((day) => {
    const intensityText = day.intensity === 'low' ? 'เบา (Low)' : day.intensity === 'medium' ? 'ปานกลาง (Medium)' : 'เข้มข้น (High)';
    const statusText = day.isRestDay ? 'วันพักผ่อน (Rest/Recovery)' : 'วันฝึกซ้อม (Training)';

    if (!day.exercises || day.exercises.length === 0) {
      rows.push([
        day.dayName,
        day.focus,
        statusText,
        String(day.durationMinutes),
        intensityText,
        '-',
        'พักผ่อนฟื้นฟูกล้ามเนื้อ',
        '-',
        '-',
        '-',
        'ทั่วร่างกาย',
        'นอนหลับพักผ่อนให้เพียงพอ 7-8 ชม.',
        day.cardioAdvice || '-',
      ]);
    } else {
      day.exercises.forEach((ex, exIdx) => {
        rows.push([
          exIdx === 0 ? day.dayName : '',
          exIdx === 0 ? day.focus : '',
          exIdx === 0 ? statusText : '',
          exIdx === 0 ? String(day.durationMinutes) : '',
          exIdx === 0 ? intensityText : '',
          `ท่าที่ ${exIdx + 1}`,
          ex.name,
          ex.sets,
          ex.reps,
          ex.rest,
          ex.targetMuscle,
          ex.tip,
          exIdx === 0 ? (day.cardioAdvice || '-') : '',
        ]);
      });
    }
  });

  rows.push([]);
  rows.push(['========================================================================================']);
  rows.push(['แผนความก้าวหน้ารายเดือน 4 สัปดาห์ (4-WEEKS PROGRESSION ROADMAP)']);
  rows.push(['========================================================================================']);
  rows.push(['สัปดาห์ที่', 'ช่วงพัฒนาการ (Phase)', 'เป้าหมายหลักประจำช่วง', 'ข้อปฏิบัติและจุดที่ต้องโฟกัส']);

  program.monthlyPhases.forEach((phase) => {
    rows.push([
      `สัปดาห์ที่ ${phase.weekNumber}`,
      phase.phaseTitle,
      phase.goalDescription,
      phase.keyFocus.join('; '),
    ]);
  });

  rows.push([]);
  rows.push(['ข้อควรระวัง: ควรวอร์มอัพ 5-10 นาทีก่อนออกกำลังกาย และหยุดพักทันทีหากมีอาการเวียนศีรษะหรือเจ็บแปลบ']);

  // Convert to CSV string with UTF-8 BOM (\uFEFF) so Excel opens Thai characters seamlessly
  const csvContent =
    '\uFEFF' +
    rows
      .map((row) => row.map((cell) => sanitizeCsvCell(cell)).join(','))
      .join('\r\n');

  return csvContent;
}

/**
 * Trigger download of the CSV / Excel file directly in the browser
 */
export function downloadWorkoutExcel(
  program: SportWorkoutProgram,
  userRecord?: BmiRecord | null
) {
  const csvData = generateWorkoutExcelCsv(program, userRecord);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanTitle = program.id;
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `ตารางออกกำลังกาย_${cleanTitle}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
