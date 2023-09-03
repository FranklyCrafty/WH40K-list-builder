// models/codexModel.js

class Codex {
    constructor(codexData) {
      this.name = codexData.name;
      this.units = codexData.units;
      this.colors = codexData.colors;
      this.factionLogo = codexData.factionLogo;
    }
  }
  
  module.exports = Codex;