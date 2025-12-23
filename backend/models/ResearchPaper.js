// backend/models/ResearchPaper.js
const mongoose = require("mongoose");

// accessionNumber: { type: String, unique: true,required: true },

const researchPaperSchema = new mongoose.Schema({
  accessionNumber: {
  type: String,
  required: true,
  unique: true,
},
  title: String,
  author: String,
  abstract: String,
  link: String,
  status: { type: String, default: "available" },
}, { timestamps: true }); // ✅ This enables createdAt & updatedAt);

module.exports = mongoose.model("ResearchPaper", researchPaperSchema);
