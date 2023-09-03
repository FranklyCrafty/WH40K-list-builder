// models/abilityModel.js

class Ability {
    constructor(abilityData) {
      this.id = abilityData.id;
      this.name = abilityData.name;
      this.description = abilityData.description;
    }
  }
  
  module.exports = Ability;