// models/unitModel.js

  class Unit {
    constructor(unitData) {
      this.id = unitData.id;
      this.name = unitData.name;
      this.movement = unitData.movement;
      this.toughness = unitData.toughness;
      this.save = unitData.save;
      this.wounds = unitData.wounds;
      this.leadership = unitData.leadership;
      this.objective_control = objective_control;
      this.invulnerableSave = unitData.invulnerableSave;
      this.abilities = unitData.abilities;
      this.upgrades = unitData.upgrades;
      this.colors = unitData.colors;
      this.image = unitData.image;
      this.faction = faction;
    }
    
    static fromXMLData(entry) {
      return new Unit({
        id: entry.$.id,
        name: entry.$.name,
        movement: entry.characteristics[0].characteristic.find(char => char.$.name === 'M')._,
        toughness: entry.characteristics[0].characteristic.find(char => char.$.name === 'T')._,
        save: entry.characteristics[0].characteristic.find(char => char.$.name === 'Sv')._,
        wounds: entry.characteristics[0].characteristic.find(char => char.$.name === 'W')._,
        leadership: entry.characteristics[0].characteristic.find(char => char.$.name === 'Ld')._,
        obnjective_control: entry.characteristics[0].characteristic.find(char => char.$.name === 'OC')._,
        invulnerableSave: entry.characteristics[0].characteristic.find(char => char.$.typeName === 'Invulnerable')._,
        abilities: entry.characteristics[0].characteristic.find(char => char.$.typeName === 'Ability')._,
        upgrades: entry.characteristics[0].characteristic.find(char => char.$.typeName === 'Wargear')._,
        colors: [], // This information is not present in the XML file
        image: [], // This information is not present in the XML file
        faction: entry.characteristics[0].characteristic.find(char => char.$.typeName === 'Faction')._
      });
    }
  }
  
  module.exports = Unit;