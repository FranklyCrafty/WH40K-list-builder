// models/unitModel.js

  class Unit {
    constructor(unitData) {
      this.id = unitData.id;
      this.name = unitData.name;
      this.cost = unitData.cost;
      this.keywords = unitData.keywords;
      this.movement = unitData.movement;
      this.toughness = unitData.toughness;
      this.save = unitData.save;
      this.wounds = unitData.wounds;
      this.leadership = unitData.leadership;
      this.objective_control = objective_control;
      this.invulnerableSave = unitData.invulnerableSave;
      this.leader = unitData.leader;
      this.abilities = unitData.abilities;
      this.models = unitData.models;
      this.colors = unitData.colors;
      this.image = unitData.image;
    }
  }
  
  module.exports = Unit;