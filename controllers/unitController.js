const Unit = require('../models/unitModel');
//const greyKnightsData = require('../data/greyKnightsData.json'); // Parsed XML data

// Get a specific unit by ID
exports.getUnitById = (req, res) => {
  const { id } = req.params;
  const unit = greyKnightsData.find(unit => unit.id === id);
  
  if (!unit) {
    return res.status(404).json({ error: 'Unit not found' });
  }
  
  res.json(unit);
};

// Get all units
exports.getAllUnits = (req, res) => {
  res.json(greyKnightsData);
};