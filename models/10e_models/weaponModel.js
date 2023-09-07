// models/weaponModel.js

class Weapon {
    constructor(weaponData) {
      this.id = weaponData.id;
      this.name = weaponData.name;
      this.keywords = weaponData.keywords;
      this.range = weaponData.range;
      this.attacks = weaponData.attacks;
      this.weapon_skill = weaponData.weapon_skill;
      this.armor_penetration = weaponData.armor_penetration;
      this.damage = weaponData.damage;
      this.rules = weaponData.rules; // 
      this.weapon_type = weaponData.weapon_type; // ranged weapon or melee weapon
      this.minSelection = weaponData.minSelection; // minimum selectable
      this.maxSelection = weaponData.maxSelection; // maximum selectable
    }
  }
  
  module.exports = Weapon;