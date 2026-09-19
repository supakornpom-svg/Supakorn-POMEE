import type { BmiCategory, BmiRecord, AiHealthPlan, DatabaseStats } from '../types';

const STORAGE_KEY = 'sport_bmi_records_local_v1';

export function getLocalRecords(): BmiRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading local records:', e);
    return [];
  }
}

export function saveLocalRecords(records: BmiRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving local records:', e);
  }
}

export function calculateLocalStats(records: BmiRecord[]): DatabaseStats {
  const total = records.length;
  if (total === 0) {
    return {
      total: 0,
      avgBmi: 0,
      categories: { underweight: 0, normal: 0, overweight: 0, obese1: 0, obese2: 0 },
    };
  }

  const sumBmi = records.reduce((acc, r) => acc + (r.bmi || 0), 0);
  const avgBmi = Number((sumBmi / total).toFixed(1));

  const categories = {
    underweight: 0,
    normal: 0,
    overweight: 0,
    obese1: 0,
    obese2: 0,
  };

  records.forEach((r) => {
    if (r.category && categories[r.category] !== undefined) {
      categories[r.category]++;
    }
  });

  return {
    total,
    avgBmi,
    categories,
  };
}

export function buildLocalHealthPlan(
  category: BmiCategory,
  bmi: number,
  tdee: number,
  goal: string,
  name: string
): AiHealthPlan {
  if (category === 'underweight') {
    return {
      summary: `คุณ ${name} มีค่า BMI ${bmi.toFixed(1)} อยู่ในเกณฑ์น้ำหนักน้อยกว่ามาตรฐาน (ผอม) เป้าหมายหลักคือการเพิ่มมวลกล้ามเนื้อและน้ำหนักตัวให้อยู่ในเกณฑ์สมส่วนอย่างมีคุณภาพ`,
      calorieTarget: Math.round(tdee + 400),
      dietAdvice: {
        title: 'โภชนาการเพิ่มน้ำหนักและสร้างกล้ามเนื้อแบบสุขภาพดี',
        focus: [
          'เพิ่มมื้อย่อยเป็น 4-5 มื้อต่อวัน เพื่อให้ได้รับพลังงานอย่างเพียงพอ',
          'เน้นโปรตีนคุณภาพสูง (ไข่ต้ม, อกไก่, เนื้อปลา, เต้าหู้, นมถั่วเหลือง)',
          'ทานคาร์โบไฮเดรตเชิงซ้อนควบคู่ไขมันดี เช่น อะโวคาโด ถั่วเปลือกแข็ง ข้าวกล้อง',
          'ดื่มน้ำให้เพียงพอวันละ 2 - 2.5 ลิตร',
        ],
        avoid: [
          'หลีกเลี่ยงการทานของหวาน น้ำอัดลม หรือของทอดเพื่อเพิ่มน้ำหนักแบบผิดวิธี',
          'งดเว้นการอดอาหารมื้อเช้า',
        ],
        sampleMeals: {
          breakfast: 'ข้าวต้มกุ้ง/หมูสับ + ไข่ลวก 2 ฟอง + นมสด 1 แก้ว',
          lunch: 'ข้าวผัดอกไก่ใส่ไข่ + ผัดผักรวมมิตร + กล้วยหอม 1 ลูก',
          dinner: 'สเต๊กปลาแซลมอนหรืออกไก่ย่าง + มันฝรั่งต้ม + ซุปฟักทอง',
          snack: 'ถั่วอัลมอนด์อบ 1 กำมือ หรือแซนด์วิชทูน่าโฮลวีต',
        },
      },
      exerciseAdvice: {
        title: 'โปรแกรมสร้างกล้ามเนื้อและฟื้นฟูพละกำลัง',
        weeklyFrequency: '3 - 4 วันต่อสัปดาห์ (วันละ 40-50 นาที)',
        cardio: 'คาร์ดิโอเบาๆ เช่น เดินเร็วสัปดาห์ละ 1-2 ครั้ง เพื่อคงความแข็งแรงของหัวใจ',
        strength: 'เน้นเวทเทรนนิ่งหรือบอดี้เวท (Squat, Push-up, Lunge) 8-12 ครั้ง/เซต รวม 3 เซต',
        cautions: 'นอนหลับพักผ่อนให้เพียงพอ 7-8 ชั่วโมงเพื่อการฟื้นฟูกล้ามเนื้อ',
      },
      keyTakeaways: [
        'รับประทานพลังงานให้มากกว่าที่ใช้ (Caloric Surplus) 300-500 kcal/วัน',
        'เน้นโปรตีนคู่กับการออกกำลังกายสร้างกล้ามเนื้อ ไม่ใช่สะสมไขมัน',
        'ชั่งน้ำหนักสัปดาห์ละครั้งเพื่อติดตามผล',
      ],
    };
  } else if (category === 'normal') {
    return {
      summary: `ยินดีด้วยครับ คุณ ${name} มีค่า BMI ${bmi.toFixed(1)} อยู่ในเกณฑ์มาตรฐาน สมส่วน สุขภาพดี ควรรักษาความสมดุลด้านโภชนาการและการออกกำลังกายอย่างต่อเนื่อง`,
      calorieTarget: Math.round(tdee),
      dietAdvice: {
        title: 'การควบคุมสารอาหารเพื่อรักษารูปร่างและสุขภาพระยะยาว',
        focus: [
          'ใช้สูตรจานสุขภาพ 2:1:1 (ผัก 2 ส่วน, ข้าวแป้ง 1 ส่วน, โปรตีนไขมันต่ำ 1 ส่วน)',
          'ดื่มน้ำสะอาดวันละ 2.5 - 3 ลิตรเพื่อระบบเผาผลาญที่ดี',
          'เลือกอาหารสดใหม่ ลดการปรุงแต่งรสจัด',
        ],
        avoid: [
          'ลดอาหารแปรรูป ของทอดน้ำมันซ้ำ และน้ำหวาน',
          'หลีกเลี่ยงการทานมื้อดึกใกล้เวลานอน',
        ],
        sampleMeals: {
          breakfast: 'ข้าวกล้องต้มอกไก่ฉีก + ไข่ต้ม 1 ฟอง',
          lunch: 'ข้าวไรซ์เบอร์รี 1.5 ทัพพี + ปลากะพงนึ่งซีอิ๊ว + ผักต้ม',
          dinner: 'แกงส้มผักรวมกุ้งสด + ข้าวสวย 1 ทัพพี',
          snack: 'ผลไม้หวานน้อย เช่น ฝรั่ง หรือแอปเปิลเขียว',
        },
      },
      exerciseAdvice: {
        title: 'การออกกำลังกายเพื่อความฟิตกระชับและชะลอวัย',
        weeklyFrequency: '150 นาทีต่อสัปดาห์ (3-5 วันต่อสัปดาห์)',
        cardio: 'วิ่งเหยาะๆ, ว่ายน้ำ หรือปั่นจักรยาน ระดับปานกลาง 30-40 นาที',
        strength: 'บอดี้เวทหรือเวทเทรนนิ่งทั่วตัว 2-3 วันต่อสัปดาห์',
        cautions: 'อบอุ่นร่างกายและยืดเหยียดก่อน-หลังออกกำลังกายเสมอ',
      },
      keyTakeaways: [
        'รับประทานพลังงานสมดุลใกล้เคียง TDEE เพื่อคงน้ำหนักสมส่วน',
        'เน้นความสม่ำเสมอในการออกกำลังกายและนอนหลับให้มีคุณภาพ',
      ],
    };
  } else {
    // Overweight or Obese
    return {
      summary: `คุณ ${name} มีค่า BMI ${bmi.toFixed(1)} (${category === 'overweight' ? 'น้ำหนักเกิน' : 'ภาวะอ้วน'}) เป้าหมายคือการปรับลดไขมันสะสมอย่างปลอดภัย เพื่อสุขภาพข้อต่อและหัวใจที่ยืนยาว`,
      calorieTarget: Math.max(1300, Math.round(tdee - 450)),
      dietAdvice: {
        title: 'โภชนาการลดไขมันสะสมอย่างยั่งยืน ไม่ต้องอดอาหาร',
        focus: [
          'คุมสัดส่วนอาหารจานสุขภาพ 2:1:1 เน้นผักใบเขียวใยอาหารสูง',
          'ทานโปรตีนไม่ติดมันทุกมื้อเพื่อรักษาความอิ่มและคงมวลกล้ามเนื้อ',
          'ดื่มน้ำเปล่า 1 แก้วก่อนมื้ออาหารเพื่อช่วยควบคุมความอยากอาหาร',
        ],
        avoid: [
          'งดเครื่องดื่มชงหวาน ชานม น้ำอัดลม และแอลกอฮอล์เด็ดขาด',
          'งดของทอด ของมัน แกงกะทิ และขนมขบเคี้ยวโซเดียมสูง',
        ],
        sampleMeals: {
          breakfast: 'ไข่ต้ม 2 ฟอง + สลัดผักน้ำใส + ขนมปังโฮลวีต 1 แผ่น',
          lunch: 'เกาเหลาอกไก่/หมูชิ้น ไม่ใส่กระเทียมเจียว + ข้าวสวย 1 ทัพพี',
          dinner: 'สลัดอกไก่ฉีก หรือปลานึ่งจิ้มแจ่วพร้อมผักสดไม่อั้น',
          snack: 'ฝรั่งสด 4-5 ชิ้น หรือมะเขือเทศราชินี',
        },
      },
      exerciseAdvice: {
        title: 'โปรแกรมออกกำลังกายเซฟข้อต่อ เร่งการเผาผลาญไขมัน',
        weeklyFrequency: '4 - 5 วันต่อสัปดาห์ (วันละ 30-45 นาที)',
        cardio: 'คาร์ดิโอแรงกระแทกต่ำ เช่น เดินเร็วต่อเนื่อง (Brisk Walk) หรือว่ายน้ำ',
        strength: 'เวทเทรนนิ่งเบาๆ เช่น บอดี้เวทสควอชกับเก้าอี้, วิดพื้นกับกำแพง',
        cautions: 'หลีกเลี่ยงการกระโดดสูงหรือวิ่งสปีดบนพื้นแข็ง เพื่อถนอมข้อเข่าและข้อเท้า',
      },
      keyTakeaways: [
        'ลดแคลอรี่ลงประมาณ 400-500 kcal/วัน เพื่อให้น้ำหนักลดลงสัปดาห์ละ 0.5 กก. อย่างปลอดภัย',
        'เน้นการเดินเร็วสะสมให้ได้ 7,000 - 10,000 ก้าวต่อวัน',
      ],
    };
  }
}

/**
 * Robust JSON fetcher that checks Content-Type header before parsing.
 * NEVER throws "Unexpected token '<', <!DOCTYPE... is not valid JSON".
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (!contentType.toLowerCase().includes('application/json')) {
      // Server returned HTML (e.g. 502, 504, 404, or warmup page)
      const text = await res.text();
      return {
        ok: false,
        status: res.status,
        data: null,
        error: `ระบบกำลังเริ่มต้นหรือเซิร์ฟเวอร์ยังไม่พร้อม (HTTP ${res.status})`,
      };
    }

    const data = await res.json();
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: res.ok ? null : (data?.error || `เกิดข้อผิดพลาด (HTTP ${res.status})`),
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
    };
  }
}
