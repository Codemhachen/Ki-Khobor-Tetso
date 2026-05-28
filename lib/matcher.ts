import faqs from "@/data/faqs.json";
import studentQuestions from "@/data/student_questions.json";
import directOrders from "@/data/direct_order_system.json";


// =========================
// DIRECT ORDER MATCHER
// =========================

export function matchDirectOrder(query: string, records: any[]) {
  const normalizedQuery = query.toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  for (const record of records) {
    let score = 0; 

    for (const keyword of record.keywords) {
      const normalizedKeyword = keyword.toLowerCase();

      // Exact phrase match
      if (normalizedQuery.includes(normalizedKeyword)) {
        score += 5;
      }

      // Partial word match
      const queryWords = normalizedQuery.split(" ");
      const keywordWords = normalizedKeyword.split(" ");

      for (const qWord of queryWords) {
        for (const kWord of keywordWords) {
          if (qWord === kWord) {
            score += 2;
          }
        }
      }
    }

    // Boost available items
    if (record.available) {
      score += 1;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = record;
    }
  }

  // Minimum confidence threshold
  if (highestScore < 3) {
    return null;
  }

  return bestMatch;
}


// =========================
// GENERIC MATCH FUNCTION
// =========================

function genericMatch(query: string, records: any[]) {
  const normalizedQuery = query.toLowerCase().trim();

  let bestMatch = null;
  let highestScore = 0;

  // Common weak words to ignore
  const stopWords = [
    "how",
    "what",
    "where",
    "is",
    "the",
    "a",
    "an",
    "to",
    "do",
    "can",
    "i",
    "you",
    "me"
  ];

  const queryWords = normalizedQuery
    .split(" ")
    .filter(word => !stopWords.includes(word));

  for (const record of records) {
    let score = 0;

    for (const keyword of record.keywords || []) {
      const normalizedKeyword = keyword.toLowerCase();

      // Strong exact phrase match
      if (normalizedQuery.includes(normalizedKeyword)) {
        score += 10;
      }

      // Partial keyword matching
      const keywordWords = normalizedKeyword
        .split(" ")
        .filter((word: string) => !stopWords.includes(word));

      for (const qWord of queryWords) {
        for (const kWord of keywordWords) {
          if (qWord === kWord) {
            score += 3;
          }
        }
      }
    }

    // Bonus if question text matches
    if (
      normalizedQuery.includes(
        record.question?.toLowerCase() || ""
      )
    ) {
      score += 15;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = record;
    }
  }

  // Confidence threshold
  if (highestScore < 5) {
    return null;
  }

  return bestMatch;
}


// =========================
// MAIN CHATBOT FUNCTION
// =========================

export function answerQuery(message: string) {
  const normalizedMessage = message.toLowerCase();


  // =========================
  // FOOD / ORDER INTENT
  // =========================

  const foodIntentWords = [
    "food",
    "eat",
    "canteen",
    "order",
    "biryani",
    "momos",
    "momo",
    "coffee",
    "drink",
    "lunch",
    "dinner",
    "pork",
    "meal",
    "snack"
  ];

  const isFoodQuery = foodIntentWords.some(word =>
    normalizedMessage.includes(word)
  );

  if (isFoodQuery) {
    const orderMatch = matchDirectOrder(
      normalizedMessage,
      directOrders.records
    );

    if (orderMatch) {
      return {
        reply: orderMatch.available
          ? `${orderMatch.item} is available at ${orderMatch.vendor} for ₹${orderMatch.price}. Estimated delivery time is ${orderMatch.eta_minutes} minutes.`
          : `${orderMatch.item} is currently unavailable at ${orderMatch.vendor}.`
      };
    }
  }


  // =========================
  // FAQ MATCHING
  // =========================

  const faqMatch = genericMatch(
  normalizedMessage,
  faqs.entries
);

  if (faqMatch) {
    return {
      reply: faqMatch.answer
    };
  }


  // =========================
  // STUDENT QUESTION MATCHING
  // =========================

  const studentMatch = genericMatch(
  normalizedMessage,
  studentQuestions.entries
);

  if (studentMatch) {
    return {
      reply: studentMatch.answer
    };
  }


  // =========================
  // FALLBACK
  // =========================

  return {
    reply:
      "Sorry, I could not find an answer for that question yet."
  };
}