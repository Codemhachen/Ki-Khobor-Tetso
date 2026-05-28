import affordableFood from "@/data/affordable_food_options.json";
import assignmentReminders from "@/data/assignment_reminders.json";
import cafeAnalysis from "@/data/cafe_analysis.json";
import campusRules from "@/data/campus_rules.json";
import clubs from "@/data/clubs_and_activities.json";
import directOrder from "@/data/direct_order_system.json";
import examAttendance from "@/data/exam_and_attendance_survival_tips.json"; // CHECK THIS — match your real filename
import examDates from "@/data/exam_dates.json";
import facultyContacts from "@/data/faculty_contacts.json";
import faqs from "@/data/faqs.json";
import seniorMentor from "@/data/senior_mentor.json";
import deliveryPartners from "@/data/student_delivery_partner_system.json";
import studentQuestions from "@/data/student_questions.json";
import timetable from "@/data/timetable.json";

export interface SearchUnit {
  category: string;
  keywords: string[];
  reply: string;
  data: unknown;
}

function itemsOf(ds: any): any[] {
  if (Array.isArray(ds)) return ds;
  if (Array.isArray(ds?.entries)) return ds.entries;
  if (Array.isArray(ds?.records)) return ds.records;
  for (const v of Object.values(ds ?? {})) if (Array.isArray(v)) return v as any[];
  return [];
}

function keywordsOf(item: any): string[] {
  return Array.isArray(item?.keywords) ? item.keywords.map(String) : [];
}

function replyOf(item: any): string {
  if (typeof item?.answer === "string") return item.answer;
  if (typeof item?.response === "string") return item.response;
  const skip = new Set(["id", "keywords", "intent", "category", "version", "type"]);
  const parts: string[] = [];
  for (const [k, v] of Object.entries(item ?? {})) {
    if (skip.has(k) || v == null) continue;
    parts.push(typeof v === "object" ? `${k}: ${JSON.stringify(v)}` : `${k}: ${v}`);
  }
  return parts.join(" | ");
}

function toUnits(ds: any, fallbackCategory: string): SearchUnit[] {
  const category = ds?.category ?? fallbackCategory;
  return itemsOf(ds).map((item) => ({
    category,
    keywords: keywordsOf(item),
    reply: replyOf(item),
    data: item,
  }));
}

export const INDEX: SearchUnit[] = [
  ...toUnits(affordableFood, "affordable_food_options"),
  ...toUnits(assignmentReminders, "assignment_reminders"),
  ...toUnits(cafeAnalysis, "cafe_analysis"),
  ...toUnits(campusRules, "campus_rules"),
  ...toUnits(clubs, "clubs_and_activities"),
  ...toUnits(directOrder, "direct_order_system"),
  ...toUnits(examAttendance, "exam_and_attendance"),
  ...toUnits(examDates, "exam_dates"),
  ...toUnits(facultyContacts, "faculty_contacts"),
  ...toUnits(faqs, "faqs"),
  ...toUnits(seniorMentor, "senior_mentor"),
  ...toUnits(deliveryPartners, "student_delivery_partners"),
  ...toUnits(studentQuestions, "student_questions"),
  ...toUnits(timetable, "timetable"),
];