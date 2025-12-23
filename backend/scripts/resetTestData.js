/**
 * ⚠️ TESTING ONLY SCRIPT
 * This resets documents + counters
 * DO NOT run in production
 * node scripts/resetTestData.js

 */

const mongoose = require("mongoose");
const Counter = require("../models/Counter");
const QuestionPaper = require("../models/QuestionPaper");
const ResearchPaper = require("../models/ResearchPaper");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/institutional_repo2";

async function resetTestData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ❌ Delete all documents
    await QuestionPaper.deleteMany({});
    await ResearchPaper.deleteMany({});

    // ❌ Reset counters
    await Counter.deleteMany({});

    console.log("🔥 Test data reset complete");
    console.log("➡ Next uploads will start from QP001 / RP001");
  } catch (err) {
    console.error("❌ Reset failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

resetTestData();
