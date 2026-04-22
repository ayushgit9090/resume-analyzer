const express = require('express');
const router  = express.Router();
const { generateReport } = require('../utils/pdf/reportBuilder');

router.post('/report', (req, res) => {
  const results = req.body;
  if (!results || typeof results.atsScore !== 'number') {
    return res.status(400).json({ error: 'Invalid results payload' });
  }
  const filename = `ResumeIQ_Report_${new Date().toISOString().slice(0,10)}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  try {
    generateReport(results, res);
  } catch (err) {
    console.error('PDF error:', err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

module.exports = router;
