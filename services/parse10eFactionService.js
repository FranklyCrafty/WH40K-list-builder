const fs = require('fs');
const path = require("path");
const xml2js = require('xml2js');

// Parse XML data
const parser = new xml2js.Parser();

//Read XML data
const xmlData = fs.readFileSync(path.resolve(__dirname, '../data/Imperium - Grey Knights.cat'), 'utf-8');

parser.parseString(xmlData, (err, result) => {
  if (err) {
    console.error('Error parsing XML:', err);
    return;
  }

  // Extract relevant data from the parsed result and save as JSON
  const units = result.catalogue.sharedSelectionEntries[0].selectionEntry.map(parseUnit);

  // Save as JSON
  fs.writeFileSync(path.resolve(__dirname, '../data/greyKnightsData.json'), JSON.stringify(units, null, 2));
});

// Function to find a characteristic value by name
function findCharacteristic(entry, charName) {
  console.log(charName);
  return entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === charName)?._;
}

// Function to find the weapon choice selection entry group
function findWeaponChoice(entry) {
  if (entry.selectionEntryGroups) {
    return entry.selectionEntryGroups[0].selectionEntryGroup.find(group => group.$.name === 'Weapon Choice');
  }
  return null;
}

/**
* Function to parse a single unit/model entry
* @param {string} writerId - The Id of the writer.
*/
function parseUnit(entry) {
  if (entry.$.type === "unit" || entry.$.type === "model") {
    const unitData = {
      id: entry.$.id,
      name: entry.$.name,
      cost: entry.costs ? entry.costs[0].cost[0].$.value : [],
      movement: findCharacteristic(entry, 'M'),
      toughness: findCharacteristic(entry, 'T'),
      save: findCharacteristic(entry, 'SV'),
      wounds: findCharacteristic(entry, 'W'),
      leadership: findCharacteristic(entry, 'LD'),
      objectiveControl: findCharacteristic(entry, 'OC'),
      leader: [],
      abilities: [],
      models: [],
      colors: [], // This information is not present in the XML file
      image: [] //entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'image')._
    };
  
    if (entry.$.type === "unit") {
      const modelChoices = entry.selectionEntryGroups[0].selectionEntryGroup[0].selectionEntries[0].selectionEntry;
      unitData.models = modelChoices.map(parseModel);
    } else if (entry.$.type === "model") { 
      unitData.models = parseModel(entry);
    };

    return unitData;
  } else {
    return null;
  }
}

// Function to parse model data
function parseModel(modelEntry) {
  console.log(modelEntry.$.name);
  const modelData = {
    id: modelEntry.$.id,
    name: modelEntry.$.name,
    cost: modelEntry.costs ? modelEntry.costs[0].cost[0].$.value : [],
    weapons: [],
    minSelection: (modelEntry.constraints ? modelEntry.constraints[0].constraint.find(char => char.$.type === "min")?.$.value : "1"),
    maxSelection: (modelEntry.constraints ? modelEntry.constraints[0].constraint.find(char => char.$.type === "max")?.$.value : "1"),
    selection_scope: (modelEntry.constraints ? modelEntry.constraints[0].constraint[0].$.scope : "")
  };

  var weaponChoice = [];
  if (modelEntry.selectionEntries) {
    weaponChoice = modelEntry.selectionEntries[0].selectionEntry;
  }
  if (modelEntry.selectionEntryGroups) {
    const weaponChoiceGroup = findWeaponChoice(modelEntry);
    weaponChoice = weaponChoiceGroup ? weaponChoiceGroup.selectionEntries[0].selectionEntry : [];
  }
  
  if (weaponChoice) {
    modelData.weapons = weaponChoice.map(parseWeapon);
  }

  return modelData;
}

/**
* Function to parse a weapon selection entry
* @param {string} weaponEntry - .
*/
// Function to parse a weapon selection entry
function parseWeapon(weaponEntry) {
  console.log(weaponEntry.$.name);
  return {
    id: weaponEntry.$.id,
    name: weaponEntry.$.name,
    cost: weaponEntry.costs ? weaponEntry.costs[0].cost[0].$.value : [],
    //cost_modifier: weaponEntry.costs
    range: findCharacteristic(weaponEntry, 'Range'),
    attacks: findCharacteristic(weaponEntry, 'A'),
    weapon_skill: findCharacteristic(weaponEntry, 'WS') || findCharacteristic(weaponEntry, 'BS'),
    armor_penetration: findCharacteristic(weaponEntry, 'AP'),
    damage: findCharacteristic(weaponEntry, 'D'),
    weapon_type: weaponEntry.profiles[0].profile[0].$.typeName,
    keywords: findCharacteristic(weaponEntry, 'Keywords'),
    minSelection: (weaponEntry.constraints ? weaponEntry.constraints[0].constraint.find(char => char.$.type === "min")?.$.value : "1"),
    maxSelection: (weaponEntry.constraints ? weaponEntry.constraints[0].constraint.find(char => char.$.type === "max")?.$.value : "1")
  };
}

function parseAbility(abilityEntry) {
  console.log(abilityEntry.$.name);
  return {
    id: abilityEntry.$.id,
    name: abilityEntry.$.name,
    cost: abilityEntry.costs ? abilityEntry.costs[0].cost[0].$.value : [],
    description: findCharacteristic(abilityEntry, 'Description')
  };
}

function parseModifier(modifierEntry) {
  console.log(modifierEntry.$.name);
  return {
    id: modifierEntry.$.id,
    name: modifierEntry.$.name,
    cost: modifierEntry.costs ? modifierEntry.costs[0].cost[0].$.value : [],
    description: findCharacteristic(modifierEntry, 'Description')
  };
}