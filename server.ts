import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import type { BmiRecord, BmiCategory, AiHealthPlan, DatabaseStats } from "./src/types.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Persistent Data Storage Paths
const DATA_DIR = path.join(process.cwd(), "data");
const RECORDS_FILE = path.join(DATA_DIR, "bmi_records.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Sample Records for immediate demonstration
const INITIAL_RECORDS: BmiRecord[] = [
  {
    id: "bmi_demo_1",
    name: "สมชาย ใจดี",
    gender: "male",
    age: 32,
    weight: 84.5,
    height: 172,
    bmi: 28.6,
    category: "obese1",
    categoryLabelTh: "อ้วนระดับ 1 (เสี่ยงปานกลาง-สูง)",
    categoryColor: "#f97316",
    idealWeightMin: 54.7,
    idealWeightMax: 67.7,
    bmr: 1780,
    tdee: 2448,
    activityLevel: "light",
    goal: "lose_weight",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: "ต้องการลดน้ำหนักเพื่อสุขภาพและลดอาการปวดข้อเข่า",
  },
  {
    id: "bmi_demo_2",
    name: "วิภา สดใส",
    gender: "female",
    age: 26,
    weight: 42.0,
    height: 160,
    bmi: 16.4,
    category: "underweight",
    categoryLabelTh: "น้ำหนักน้อยกว่าเกณฑ์ (เสี่ยงขาดสารอาหาร)",
    categoryColor: "#3b82f6",
    idealWeightMin: 47.4,
    idealWeightMax: 58.6,
    bmr: 1145,
    tdee: 1775,
    activityLevel: "moderate",
    goal: "gain_weight",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: "ต้องการเพิ่มมวลกล้ามเนื้อและน้ำหนักให้สมส่วน",
  },
  {
    id: "bmi_demo_3",
    name: "กิตติพงษ์ สุขภาพดี",
    gender: "male",
    age: 29,
    weight: 66.0,
    height: 174,
    bmi: 21.8,
    category: "normal",
    categoryLabelTh: "น้ำหนักปกติ สมส่วน (สุขภาพดี)",
    categoryColor: "#10b981",
    idealWeightMin: 56.0,
    idealWeightMax: 69.3,
    bmr: 1630,
    tdee: 2241,
    activityLevel: "light",
    goal: "maintain",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    notes: "รักษาน้ำหนักให้คงที่ ตรวจสุขภาพประจำปีปกติ",
  },
];

function readRecords(): BmiRecord[] {
  try {
    if (!fs.existsSync(RECORDS_FILE)) {
      fs.writeFileSync(RECORDS_FILE, JSON.stringify(INITIAL_RECORDS, null, 2), "utf-8");
      return INITIAL_RECORDS;
    }
    const data = fs.readFileSync(RECORDS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading records file:", error);
    return [];
  }
}

function writeRecords(records: BmiRecord[]) {
  try {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing records file:", error);
  }
}

// Helper to determine Asian BMI Category
function getBmiClassification(bmi: number): { category: BmiCategory; labelTh: string; color: string } {
  if (bmi < 18.5) {
    return {
      category: "underweight",
      labelTh: "น้ำหนักน้อยกว่าเกณฑ์ (เสี่ยงขาดสารอาหาร)",
      color: "#3b82f6", // Blue
    };
  } else if (bmi <= 22.9) {
    return {
      category: "normal",
      labelTh: "น้ำหนักปกติ สมส่วน (สุขภาพดี)",
      color: "#10b981", // Emerald Green
    };
  } else if (bmi <= 24.9) {
    return {
      category: "overweight",
      labelTh: "น้ำหนักเกิน / ท้วม (เริ่มมีความเสี่ยง)",
      color: "#eab308", // Amber
    };
  } else if (bmi <= 29.9) {
    return {
      category: "obese1",
      labelTh: "อ้วนระดับ 1 (เสี่ยงปานกลาง-สูง)",
      color: "#f97316", // Orange
    };
  } else {
    return {
      category: "obese2",
      labelTh: "อ้วนระดับ 2 (อันตรายมาก)",
      color: "#ef4444", // Red
    };
  }
}

// Built-in clinical recommendations
function getBuiltInHealthAdvice(
  category: BmiCategory,
  bmi: number,
  tdee: number,
  goal: string,
  name: string
): AiHealthPlan {
  if (category === "underweight") {
    return {
      summary: `คุณ ${name} มีค่า BMI ${bmi.toFixed(1)} อยู่ในเกณฑ์น้ำหนักต่ำกว่ามาตรฐาน ควรเพิ่มน้ำหนักอย่างถูกวิธีโดยเน้นอาหารที่ให้พลังงานและโปรตีนสูงเพื่อสร้างมวลกล้ามเนื้อ หลีกเลี่ยงของทอดหวานมัน`,
      calorieTarget: Math.round(tdee + 400),
      dietAdvice: {
        title: "หลักการรับประทานอาหารสำหรับผู้ที่มีน้ำหนักน้อย",
        focus: [
          "เพิ่มมื้ออาหารเป็น 4-5 มื้อต่อวัน หรือเพิ่มมื้อของว่างที่มีประโยชน์",
          "เน้นโปรตีนคุณภาพสูง (ไข่ต้ม อกไก่ ปลา เต้าหู้ ถั่ว นมจืด นมถั่วเหลือง) 1.5-2.0 กรัม/กก.",
          "ทานไขมันดี เช่น ถั่วเปลือกแข็ง อะโวคาโด เมล็ดฟักทอง น้ำมันมะกอก เพื่อเพิ่มพลังงานหนาแน่น",
          "ดื่มน้ำอย่างเพียงพอ ไม่ดื่มน้ำปริมาณมากก่อนมื้ออาหารเพราะจะทำให้อิ่มเร็ว",
        ],
        avoid: [
          "หลีกเลี่ยงการเพิ่มน้ำหนักด้วยน้ำหวาน น้ำอัดลม หรือขนมหวานขยะ (ทำให้ได้ไขมันพอกตับแทนกล้ามเนื้อ)",
          "หลีกเลี่ยงการงดมื้ออาหารหรือทานไม่ตรงเวลา",
        ],
        sampleMeals: {
          breakfast: "ข้าวต้มข้าวกล้องอกไก่ฉีก ใส่ไข่ลวก 2 ฟอง โรยกระเทียมเจียวเล็กน้อย + กล้วยหอม 1 ลูก",
          lunch: "ข้าวสวย 2 ทัพพี + ผัดกะเพราอกไก่ไข่ดาว + ต้มจืดเต้าหู้หมูสับสาหร่าย",
          dinner: "สเต๊กปลาแซลมอนหรืออกไก่ย่าง + มันหวานนึ่ง 1 หัว + ผักสลัดราดน้ำมันมะกอก",
          snack: "นมถั่วเหลืองหวานน้อย 1 กล่อง + อัลมอนด์อบ 1 กำมือ หรือแซนด์วิชทูน่าโฮลวีต",
        },
      },
      exerciseAdvice: {
        title: "โปรแกรมออกกำลังกายสร้างมวลกล้ามเนื้อ (Hypertrophy)",
        weeklyFrequency: "3 - 4 วันต่อสัปดาห์ (วันละ 45-60 นาที)",
        cardio: "คาร์ดิโอเบาๆ เพียงสัปดาห์ละ 1-2 ครั้ง (ครั้งละ 15-20 นาที) เช่น เดินเร็ว เพื่อรักษาระบบหัวใจและหลอดเลือด ไม่ควรวิ่งหนักเพราะเผาผลาญแคลอรี่สูงเกินไป",
        strength: "เน้นเวทเทรนนิ่งหรือบอดี้เวทท่า Compound (Squat, Push-up, Lunge, Dumbbell Row) 8-12 ครั้ง/เซต รวม 3-4 เซต เพื่อกระตุ้นการสร้างกล้ามเนื้อ",
        cautions: "ควรพักผ่อนให้เพียงพอ 7-8 ชั่วโมงต่อคืน เพราะกล้ามเนื้อจะเจริญเติบโตและซ่อมแซมช่วงนอนหลับ",
      },
      keyTakeaways: [
        "รับประทานพลังงานเกินกว่าที่ใช้ (Caloric Surplus) ประมาณ 300-500 kcal/วัน",
        "เน้นโปรตีนคู่กับการออกกำลังกายแบบแรงต้านเพื่อสร้างกล้ามเนื้อ ไม่ใช่สะสมไขมัน",
        "ชั่งน้ำหนักสัปดาห์ละ 1 ครั้งหลังตื่นนอน เพื่อติดตามการเปลี่ยนแปลงอย่างสม่ำเสมอ",
      ],
    };
  } else if (category === "normal") {
    return {
      summary: `ยินดีด้วยครับ คุณ ${name} มีค่า BMI ${bmi.toFixed(1)} อยู่ในเกณฑ์มาตรฐาน สมส่วน สุขภาพดี ควรรักษาพฤติกรรมการรับประทานอาหารและการเคลื่อนไหวร่างกายให้ต่อเนื่อง`,
      calorieTarget: Math.round(tdee),
      dietAdvice: {
        title: "การควบคุมสารอาหารเพื่อรักษารูปร่างและสุขภาพระยะยาว",
        focus: [
          "ใช้สูตรจานสุขภาพ 2:1:1 (ผัก 2 ส่วน, ข้าว-แป้งไม่ขัดสี 1 ส่วน, โปรตีนไขมันต่ำ 1 ส่วน)",
          "ดื่มน้ำเปล่าสะอาดอย่างน้อย 2-2.5 ลิตรต่อวัน",
          "เน้นอาหารสดใหม่ ปรุงสุก ลดการใช้เครื่องปรุงรสโซเดียมสูง",
        ],
        avoid: [
          "ลดอาหารแปรรูป ของทอดน้ำมันซ้ำ และเครื่องดื่มชงหวาน",
          "หลีกเลี่ยงการทานมื้อดึกเกิน 20:00 น.",
        ],
        sampleMeals: {
          breakfast: "ข้าวโอ๊ตต้มนมสด ใส่ผลไม้สด (กล้วย เบอร์รี่) และไข่ต้ม 1 ฟอง",
          lunch: "ข้าวไรซ์เบอร์รี 1.5 ทัพพี + ปลากะพงนึ่งซีอิ๊ว + ผักกวางตุ้งลวก",
          dinner: "แกงส้มผักรวมกุ้งสด + ข้าวสวย 1 ทัพพี + ไข่ต้ม 1 ฟอง",
          snack: "ผลไม้หวานน้อย เช่น ฝรั่ง หรือแอปเปิลเขียว 1 ผล",
        },
      },
      exerciseAdvice: {
        title: "การออกกำลังกายเพื่อความกระฉับกระเฉงและชะลอวัย",
        weeklyFrequency: "150 นาทีต่อสัปดาห์ (3-5 วันต่อสัปดาห์)",
        cardio: "วิ่งเหยาะๆ, ว่ายน้ำ, ปั่นจักรยาน หรือเดินเร็ว ความเหนื่อยระดับปานกลาง 30 นาที/ครั้ง",
        strength: "เวทเทรนนิ่งทั่วตัว (Full Body Workout) หรือโยคะ/พิลาทิส 2 วันต่อสัปดาห์",
        cautions: "ยืดเหยียดกล้ามเนื้อ (Stretching) ก่อนและหลังออกกำลังกายเสมอเพื่อป้องกันการบาดเจ็บ",
      },
      keyTakeaways: [
        "รักษาน้ำหนักตัวให้อยู่ในเกณฑ์ และตรวจเช็กความดันโลหิต ผลเลือดประจำปี",
        "นอนหลับอย่างมีคุณภาพ และบริหารความเครียด",
      ],
    };
  } else {
    // Overweight, Obese 1, Obese 2
    const isSevere = category === "obese2";
    return {
      summary: `คุณ ${name} มีค่า BMI ${bmi.toFixed(1)} (${isSevere ? "อ้วนระดับอันตราย" : "น้ำหนักเกินเกณฑ์"}) แนะนำให้เริ่มปรับลดน้ำหนักอย่างปลอดภัย โดยควบคุมปริมาณแคลอรี่ควบคู่กับการออกกำลังกายที่ไม่ทำลายข้อต่อ`,
      calorieTarget: Math.max(1200, Math.round(tdee - 500)),
      dietAdvice: {
        title: "การปรับโภชนาการแบบ Caloric Deficit ปลอดภัย ไม่โยโย่",
        focus: [
          "ลดพลังงานจากอาหารลงประมาณ 400-500 kcal/วัน (เป้าหมายลดน้ำหนัก 0.5 - 1 กก./สัปดาห์)",
          "ทานผักใบเขียวเป็นหลักในทุกมื้อ เพื่อให้อิ่มนานและได้กากใยชะลอการดูดซึมน้ำตาล",
          "เลือกโปรตีนไขมันต่ำ (อกไก่ ปลาน้ำจืด/ทะเล เต้าหู้ ไข่ขาว) เพื่อคงมวลกล้ามเนื้อ",
          "ดื่มน้ำเปล่า 1 แก้วก่อนมื้ออาหาร 15 นาที ช่วยให้อิ่มเร็วขึ้น",
        ],
        avoid: [
          "งดน้ำหวาน ชานมไข่มุก น้ำอัดลม ขนมเบเกอรี่ และแอลกอฮอล์โดยเด็ดขาด",
          "หลีกเลี่ยงอาหารทอด ผัดน้ำมันเยิ้ม ขาหมู หนังไก่ แคบหมู",
          "ระวังน้ำจิ้มและแกงกะทิรสหวานมันเข้มข้น",
        ],
        sampleMeals: {
          breakfast: "ไข่ต้ม 2 ฟอง (ทานไข่แดง 1 ฟอง) + น้ำเต้าหู้ไม่ใส่น้ำตาล 1 แก้ว + ขนมปังโฮลวีต 1 แผ่น",
          lunch: "เกาเหลาอกไก่ใส่ผักบุ้ง/ถั่วงอกเยอะๆ (ไม่เจียวกระเทียม ไม่ปรุงน้ำตาล) + ข้าวสวย 1 ทัพพี",
          dinner: "สลัดอกไก่ฉีกน้ำสลัดบัลซามิก/น้ำใส หรือ ต้มยำน้ำใสกุ้งเห็ดรวม + ผักลวก",
          snack: "แตงกวาหั่นแท่ง หรือ ฝรั่ง 3-4 ชิ้นแก้หิว",
        },
      },
      exerciseAdvice: {
        title: isSevere
          ? "โปรแกรม Low-Impact เพื่อเซฟข้อเข่าและข้อเท้า"
          : "โปรแกรมเผาผลาญไขมันและเพิ่มความแข็งแรงของหัวใจ",
        weeklyFrequency: "4 - 5 วันต่อสัปดาห์ (เริ่มต้น 20-30 นาที แล้วค่อยๆ เพิ่มเป็น 45 นาที)",
        cardio: isSevere
          ? "หลีกเลี่ยงการวิ่งหรือกระโดดเด็ดขาด! ให้เน้น 'เดินเร็วบนพื้นราบ', 'ปั่นจักรยานเอนปั่น (Recumbent Bike)', หรือ 'ว่ายน้ำ/เดินในน้ำ' เพื่อลดแรงกระแทกที่ข้อเข่า"
          : "เดินเร็วชัน, ปั่นจักรยาน, หรือเครื่องเดินวงรี (Elliptical) สัปดาห์ละ 150-200 นาที",
        strength: "บอดี้เวทท่าง่าย เช่น Wall Squat (พิงผนัง), Glute Bridge, Seated Leg Extension และยืดเหยียดกล้ามเนื้อ",
        cautions: "หากมีอาการหน้ามืด หายใจไม่ออก แน่นหน้าอก หรือเจ็บแปลบที่ข้อเข่า ให้หยุดพักทันทีและปรึกษาแพทย์",
      },
      keyTakeaways: [
        "การลดน้ำหนัก 5-10% ของน้ำหนักตัว จะช่วยลดความเสี่ยงเบาหวานและความดันโลหิตลงอย่างเห็นได้ชัด",
        "เน้นความสม่ำเสมอในระยะยาว ไม่ต้องอดอาหารจนทรมาน",
        "จดบันทึกอาหารหรือถ่ายรูปสิ่งที่ทานเพื่อสร้างสติในการรับประทาน",
      ],
    };
  }
}

// Generate Personalized Health Plan using Gemini AI
async function generateGeminiHealthPlan(record: BmiRecord): Promise<AiHealthPlan> {
  if (!ai) {
    return getBuiltInHealthAdvice(record.category, record.bmi, record.tdee, record.goal, record.name);
  }

  try {
    const prompt = `คุณคือนักกำหนดอาหารวิชาชีพ (Clinical Dietitian) และผู้เชี่ยวชาญด้านเวชศาสตร์การกีฬาชาวไทย
กรุณาวิเคราะห์และจัดทำคำแนะนำเฉพาะบุคคลสำหรับผู้รับบริการชาวไทยคนนี้:
- ชื่อ: ${record.name}
- เพศ: ${record.gender === "male" ? "ชาย" : record.gender === "female" ? "หญิง" : "ทั่วไป"}
- อายุ: ${record.age} ปี
- น้ำหนัก: ${record.weight} กก.
- ส่วนสูง: ${record.height} ซม.
- ค่า BMI: ${record.bmi.toFixed(1)} (เกณฑ์คนไทย/เอเชีย: ${record.categoryLabelTh})
- ช่วงน้ำหนักสมส่วนที่เหมาะสม: ${record.idealWeightMin.toFixed(1)} - ${record.idealWeightMax.toFixed(1)} กก.
- BMR: ${Math.round(record.bmr)} kcal, TDEE: ${Math.round(record.tdee)} kcal
- ระดับกิจกรรม: ${record.activityLevel}
- เป้าหมาย: ${record.goal}
- หมายเหตุเพิ่มเติม: ${record.notes || "ไม่มี"}

กรุณาให้คำแนะนำการกินอาหารไทยที่หาทานได้จริง และตารางการออกกำลังกายที่เหมาะสมกับสถานะ BMI โดยระวังข้อต่อหากมีน้ำหนักเกิน หรือเน้นการสร้างกล้ามเนื้อหากน้ำหนักต่ำกว่าเกณฑ์ ตอบเป็นภาษาไทยที่สุภาพ กระชับ อ่านเข้าใจง่าย ในรูปแบบ JSON ตามโครงสร้างที่กำหนด`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "บทสรุปประเมินสุขภาพและเป้าหมายใน 2-3 บรรทัด",
            },
            calorieTarget: {
              type: Type.NUMBER,
              description: "เป้าหมายพลังงานแคลอรี่ที่แนะนำต่อวัน (kcal)",
            },
            dietAdvice: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                focus: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "สิ่งที่ควรเน้นทาน 3-4 ข้อ",
                },
                avoid: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "สิ่งที่ควรเลี่ยง 2-3 ข้อ",
                },
                sampleMeals: {
                  type: Type.OBJECT,
                  properties: {
                    breakfast: { type: Type.STRING, description: "เมนูอาหารเช้าแบบไทย" },
                    lunch: { type: Type.STRING, description: "เมนูอาหารกลางวันแบบไทย" },
                    dinner: { type: Type.STRING, description: "เมนูอาหารเย็นแบบไทย" },
                    snack: { type: Type.STRING, description: "ของว่างเพื่อสุขภาพ" },
                  },
                  required: ["breakfast", "lunch", "dinner"],
                },
              },
              required: ["title", "focus", "avoid", "sampleMeals"],
            },
            exerciseAdvice: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                weeklyFrequency: { type: Type.STRING, description: "ความถี่ต่อสัปดาห์" },
                cardio: { type: Type.STRING, description: "การออกกำลังกายแบบคาร์ดิโอที่ปลอดภัย" },
                strength: { type: Type.STRING, description: "การออกกำลังกายแบบแรงต้าน/สร้างกล้ามเนื้อ" },
                cautions: { type: Type.STRING, description: "ข้อควรระวังสำคัญสำหรับระดับ BMI นี้" },
              },
              required: ["title", "weeklyFrequency", "cardio", "strength", "cautions"],
            },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 เคล็ดลับปฏิบัติสำคัญที่สุด",
            },
          },
          required: ["summary", "calorieTarget", "dietAdvice", "exerciseAdvice", "keyTakeaways"],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return parsed as AiHealthPlan;
    }
  } catch (error) {
    console.error("Gemini AI generation failed, falling back to clinical rules:", error);
  }

  return getBuiltInHealthAdvice(record.category, record.bmi, record.tdee, record.goal, record.name);
}

// ---------------- API ROUTES ----------------

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Get all BMI records
app.get("/api/records", (_req, res) => {
  const records = readRecords();
  // Sort latest first
  records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ records });
});

// 3. Database Statistics
app.get("/api/records/stats", (_req, res) => {
  const records = readRecords();
  const total = records.length;
  const avgBmi = total > 0 ? Number((records.reduce((acc, r) => acc + r.bmi, 0) / total).toFixed(1)) : 0;
  const categories = {
    underweight: records.filter((r) => r.category === "underweight").length,
    normal: records.filter((r) => r.category === "normal").length,
    overweight: records.filter((r) => r.category === "overweight").length,
    obese1: records.filter((r) => r.category === "obese1").length,
    obese2: records.filter((r) => r.category === "obese2").length,
  };

  const stats: DatabaseStats = {
    total,
    avgBmi,
    categories,
  };
  res.json(stats);
});

// 4. Save new BMI record immediately into database
app.post("/api/records", async (req, res) => {
  try {
    const { name, gender, age, weight, height, activityLevel, goal, notes } = req.body;

    if (!name || !weight || !height || !age) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลชื่อ น้ำหนัก ส่วนสูง และอายุ ให้ครบถ้วน" });
    }

    const numWeight = parseFloat(weight);
    const numHeight = parseFloat(height);
    const numAge = parseInt(age, 10);

    if (isNaN(numWeight) || numWeight <= 0 || isNaN(numHeight) || numHeight <= 0) {
      return res.status(400).json({ error: "ค่าน้ำหนักหรือส่วนสูงไม่ถูกต้อง" });
    }

    // Height in meters
    const heightM = numHeight / 100;
    const bmi = Number((numWeight / (heightM * heightM)).toFixed(1));

    const { category, labelTh, color } = getBmiClassification(bmi);

    // Asian BMI Ideal Weight range (BMI 18.5 - 22.9)
    const idealWeightMin = Number((18.5 * heightM * heightM).toFixed(1));
    const idealWeightMax = Number((22.9 * heightM * heightM).toFixed(1));

    // BMR (Mifflin-St Jeor)
    let bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge;
    if (gender === "male") {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    bmr = Math.max(800, Math.round(bmr));

    // TDEE multipliers
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
    };
    const act = activityLevel || "sedentary";
    const mult = multipliers[act] || 1.2;
    const tdee = Math.round(bmr * mult);

    const newRecord: BmiRecord = {
      id: `bmi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      gender: gender || "male",
      age: numAge,
      weight: numWeight,
      height: numHeight,
      bmi,
      category,
      categoryLabelTh: labelTh,
      categoryColor: color,
      idealWeightMin,
      idealWeightMax,
      bmr,
      tdee,
      activityLevel: act,
      goal: goal || "maintain",
      createdAt: new Date().toISOString(),
      notes: notes ? String(notes).trim() : "",
    };

    // Generate AI recommendations
    const aiPlan = await generateGeminiHealthPlan(newRecord);
    newRecord.aiRecommendation = aiPlan;

    // Immediate Database Write
    const currentRecords = readRecords();
    currentRecords.unshift(newRecord);
    writeRecords(currentRecords);

    res.status(201).json({
      record: newRecord,
      message: "บันทึกข้อมูลเข้าฐานข้อมูลเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("Error creating BMI record:", error);
    res.status(500).json({ error: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
  }
});

// 5. Delete a BMI record
app.delete("/api/records/:id", (req, res) => {
  try {
    const { id } = req.params;
    const records = readRecords();
    const filtered = records.filter((r) => r.id !== id);
    if (filtered.length === records.length) {
      return res.status(404).json({ error: "ไม่พบข้อมูลที่ต้องการลบ" });
    }
    writeRecords(filtered);
    res.json({ success: true, message: "ลบข้อมูลเรียบร้อยแล้ว" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการลบข้อมูล" });
  }
});

// 6. Request AI Health Plan for existing record or re-analysis
app.post("/api/ai/recommend", async (req, res) => {
  try {
    const record = req.body as BmiRecord;
    if (!record || !record.weight || !record.height) {
      return res.status(400).json({ error: "ข้อมูล record ไม่ครบถ้วน" });
    }
    const plan = await generateGeminiHealthPlan(record);
    res.json({ plan });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการสร้างคำแนะนำ AI" });
  }
});

// Start server with Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BMI System Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
