// TODO: add testing by passing in all .cat files
// TODO: Add support for colors
// TODO: Add support for images
// TODO: Add support for modifiers
// TODO: Add support for additional rules

const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
var xpath = require("xml2js-xpath");
const { DOMParser } = require('xmldom');

const armyLocation = "C:/Users/frank.ashcraft/Development/wh40k-10e/Imperium - Grey Knights.cat";
const filename = armyLocation.split("/")[armyLocation.split("/").length - 1].replace(".cat", ".json");

const jsonFilePath = path.resolve(__dirname, `../data/${filename}`);

// Parser for the XML data
const parser = new xml2js.Parser();

//Read XML data
const xmlData = fs.readFileSync(
  path.resolve(__dirname, armyLocation),
  "utf-8"
);

// Parse the XML data
parser.parseString(xmlData, (err, result) => {
  if (err) {
    console.error("Error parsing XML:", err);
    return;
  }

  // Get List of all possible units
  const unitList = getUnitList(result.catalogue.entryLinks);
  var units = [];

  for (let i = 0; i < unitList.length; i++) {
    console.log(i);
    const unit = unitList[i];
    const unitEntry = result.catalogue.sharedSelectionEntries[0].selectionEntry.find(
      (entry) => entry.$.id === unit.id
    );

    if (
      unitEntry &&
      (unitEntry.$.type == "unit" || unitEntry.$.type == "model")
    ) {
      units.push(parseUnit(unitEntry));
    }
  }

  // Save as JSON
  fs.writeFileSync(
    path.resolve(jsonFilePath),
    JSON.stringify(units, null, 2)
  );
});

/**
 * Function to get a list of all possible units
 * @param {string} entryLinks - The entryLinks from the XML data
 * @returns {object} - The list of all possible units
 */
function getUnitList(entryLinks) {
  return entryLinks[0].entryLink.map((entry) => {
    return {
      id: entry.$.targetId,
      name: entry.$.name,
    };
  });
}

/**
 * Function to find a characteristic in a unit/model entry by name
 * @param {string} entry - The entry to search
 * @param {string} charName - The name of the characteristic to find
 * @returns {string} - The value of the characteristic
 */
function findCharacteristic(entry, charName) {
  console.log(charName);
  return entry.profiles[0].profile[0].characteristics[0].characteristic.find(
    (char) => char.$.name === charName
  )?._;
}

/**
 * Function to find the weapon choice selection entry group
 * @param {string} entry
 * @returns {object} - The weapon choice selection entry group
 */
function findWeaponChoice(entry) {
  if (entry.selectionEntryGroups) {
    return entry.selectionEntryGroups[0].selectionEntryGroup.find(
      (group) => group.$.name === "Weapon Choice"
    );
  }
  return null;
}

/**
 * Function to parse a single unit/model entry
 * @param {string} entry - The entry to parse.
 * @returns {object} - The parsed unit data.
 */
function parseUnit(unitEntry) {
  const unitData = {
    id: unitEntry.$.targetId,
    name: unitEntry.$.name,
    cost: unitEntry.costs ? unitEntry.costs[0].cost[0].$.value : "",
    //modifiers: entry.modifiers
    movement: findCharacteristic(unitEntry, "M"),
    toughness: findCharacteristic(unitEntry, "T"),
    save: findCharacteristic(unitEntry, "SV"),
    wounds: findCharacteristic(unitEntry, "W"),
    leadership: findCharacteristic(unitEntry, "LD"),
    objectiveControl: findCharacteristic(unitEntry, "OC"),
    abilities: unitEntry.profiles[0].profile
      .filter((char) => char.$.typeName === "Abilities")
      ?.map(parseAbility),
    models: [], //initialize models
    colors: {}, //TODO: Add support for colors
    image: {}, //TODO: Add support for images
  };

  findAndParseModels(unitEntry, unitData);

  return unitData;
}

/**
 * Function to parse model data
 * @param {string} modelEntry - A model child of a Unit
 * @returns {object} - The parsed model data
 */
function parseModel(modelEntry) {
  console.log(modelEntry.$.name);
  const modelData = {
    id: modelEntry.$.id,
    name: modelEntry.$.name,
    //cost: modelEntry.costs ? modelEntry.costs[0].cost[0].$.value : "",  //Don't think this is needed for models
    weapons: [],
    minSelection: modelEntry.constraints
      ? modelEntry.constraints[0].constraint.find(
          (char) => char.$.type === "min"
        )?.$.value
      : "1",
    maxSelection: modelEntry.constraints
      ? modelEntry.constraints[0].constraint.find(
          (char) => char.$.type === "max"
        )?.$.value
      : "1",
    selection_scope: modelEntry.constraints
      ? modelEntry.constraints[0].constraint[0].$.scope
      : "",
  };

  findAndParseWeapons(modelEntry, modelData); // Find and parse weapons

  return modelData;
}

/**
 * Function to parse a weapon selection entry
 * @param {string} weaponEntry - parses weapons
 * @returns {object} - The parsed weapon data.
 */
function parseWeapon(weaponEntry) {
  console.log(weaponEntry.$.name);
  return {
    id: weaponEntry.$.id,
    name: weaponEntry.$.name,
    cost: weaponEntry.costs ? weaponEntry.costs[0].cost[0].$.value : "",
    //cost_modifier: weaponEntry.costs
    range: findCharacteristic(weaponEntry, "Range"),
    attacks: findCharacteristic(weaponEntry, "A"),
    weapon_skill:
      findCharacteristic(weaponEntry, "WS") ||
      findCharacteristic(weaponEntry, "BS"),
    armor_penetration: findCharacteristic(weaponEntry, "AP"),
    damage: findCharacteristic(weaponEntry, "D"),
    weapon_type: weaponEntry.$.typeName,
    keywords: findCharacteristic(weaponEntry, "Keywords"),
    additional_rules: weaponEntry.infoLinks
      ? weaponEntry.infoLinks[0].infoLink.map(parseAdditionalRules)
      : [],
    minSelection: weaponEntry.constraints
      ? weaponEntry.constraints[0].constraint.find(
          (char) => char.$.type === "min"
        )?.$.value
      : "1",
    maxSelection: weaponEntry.constraints
      ? weaponEntry.constraints[0].constraint.find(
          (char) => char.$.type === "max"
        )?.$.value
      : "1",
  };
}

/**
 * Function to parse an ability selection entry
 * @param {string} abilityEntry - parses abilities
 * @returns {object} - The parsed ability data.
 * TODO: Add support for modifiers
 * TODO: Add support for additional rules
 */
function parseAbility(abilityEntry) {
  console.log(abilityEntry.$.name);
  return {
    id: abilityEntry.$.id,
    name: abilityEntry.$.name,
    cost: abilityEntry.costs ? abilityEntry.costs[0].cost[0].$.value : "",
    description: abilityEntry.characteristics[0].characteristic.find(
      (char) => char.$.name === "Description"
    )?._,

  };
}

/**
 * Function to parse an additional rule selection entry
 * @param {string} additionalRulesEntry - parses additional rules
 * @returns {object} - The parsed additional rule data.
 * TODO: Add support for modifiers
 */
function parseAdditionalRules(additionalRulesEntry) {
  console.log(additionalRulesEntry.$.name);
  return {
    id: additionalRulesEntry.$.id,
    name: additionalRulesEntry.$.name,
    type: additionalRulesEntry.$.type,
    rule_reference_id: additionalRulesEntry.$.targetId,
  };
}

/**
 * Function to parse a modifier selection entry
 * @param {string} modifierEntry - parses modifiers
 * @returns {object} - The parsed modifier data.
 */
function parseModifier(modifierEntry) {
  console.log(modifierEntry.$.name);
  return {
    type: modifierEntry.$.type,
    value: modifierEntry.$.value,
    field: modifierEntry.$.field ?? "",
  };
}

/**
 * Recursive function to find and parse weapons
 * @param {object} entry - The current XML entry to search for weapons`
 * @param {object} modelData - The model data to store found weapons
 */
function findAndParseWeapons(entry, modelData) {
  var profiles = [];

  if (entry.entryLinks) {
    const entryLinks = entry.entryLinks[0].entryLink;

    for (const entryLink of entryLinks) {
      const targetId = entryLink.$.targetId;
      const targetEntry = findWeaponEntryLink(targetId);
      if (targetEntry) {
        findAndParseWeapons(targetEntry, modelData);
      }
    }
  }
  
  if (entry.profiles) {
    profiles = entry.profiles[0].profile;
  }

  for (const profile of profiles) {
    const typeName = profile.$.typeName;
    if (typeName === "Melee Weapons" || typeName === "Ranged Weapons") {
      modelData.weapons.push(parseWeapon(entry)); // was a weapon profile
    }
  }

  // Recursively check child entries
  if (entry.selectionEntry || entry.selectionEntries || entry.selectionEntryGroups) {
    const childEntries = [];

    if (entry.selectionEntry) {
      childEntries.push(...entry.selectionEntry);
    }
    if (entry.selectionEntries) {
      childEntries.push(...entry.selectionEntries[0].selectionEntry);
    }
    if (entry.selectionEntryGroups) {
      childEntries.push(...entry.selectionEntryGroups[0].selectionEntryGroup);
    }

    for (const childEntry of childEntries) {
      findAndParseWeapons(childEntry, modelData); // Recursively search for weapons
    }
  }

  return;
}

function findAndParseModels(entry, unitData) {

  var models = [];
  if (entry.$.type === "model") {
    models = [entry];
  }
  else if (entry.selectionEntries) {
    models = [...entry.selectionEntries[0].selectionEntry];
  }

  for (const model of models) {
    if (model.$.type === "model") {
      unitData.models.push(parseModel(model));
    }
  }
  
  // Recursively check child entries
  if (entry.selectionEntryGroups) {
    const childEntries = [...entry.selectionEntryGroups[0].selectionEntryGroup];
    
    for (const childEntry of childEntries) {
      findAndParseModels(childEntry, unitData); // Recursively search for weapons
    }
  }

  return;
}

function findWeaponEntryLink(targetId) {
  var parsedresult = null;

  // Parse the XML string.
  xml2js.parseString(xmlData, (err, result) => {
    if (err) {
      console.error("Error parsing XML:", err);
      return;
    }
  
    // Use XPath to find the selectionEntry with a matching id attribute.
    const query = `//selectionEntry[@id='${targetId}']`;
    parsedresult = xpath.find(result, query);

  });
  
  // If a selectionEntry with a matching id is found, return it as a JSON object.
  if (parsedresult && parsedresult.length > 0) {
    // Convert the found selectionEntry back to a JSON object.
    return parsedresult[0];
  } else {
    // If no matching selectionEntry is found, return null.
    return null;
  }
}