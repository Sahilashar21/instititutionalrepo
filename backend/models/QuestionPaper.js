// backend/models/QuestionPaper.js
const mongoose = require("mongoose");

// accessionNumber: { type: String, unique: true }

const questionPaperSchema = new mongoose.Schema({
  accessionNumber: {
  type: String,
  required: true,
  unique: true,
},
  year: String,
  course: String,
  semester: String,
  subject: String,
  link: String,
  status: { type: String, default: "available" }, // or shelf/demolished
},{ timestamps: true });

module.exports = mongoose.model("QuestionPaper", questionPaperSchema);
