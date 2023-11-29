// TODO: add testing by passing in all .cat files
// TODO: Add support for colors
// TODO: Add support for images
// TODO: Add support for modifiers
  // for modifiers and conditions, store them in a separate set of JSON objects
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
  var faction = [];
  var units = [];
  var constraints = [];

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
    id: unitEntry.$.id,
    name: unitEntry.$.name,
    cost: unitEntry.costs ? unitEntry.costs[0].cost[0].$.value : "",
    costId: unitEntry.costs ? unitEntry.costs[0].cost[0].$.typeId : "",
    modifiers: parseModifiers(unitEntry),
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
    modifiers: parseModifiers(modelEntry),
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
    modifiers: parseModifiers(weaponEntry),
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

/**
 * Recursive function to find and parse models
 * @param {object} entry - The current XML entry to search for a model`
 * @param {object} unitData - The unit data to store found model in
 */
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

/**
 * If there is a weapon that is added as an entry link, then the information for 
 * that model is stored elsewhere in the file.  This searches the file fo the 
 * information about the weapon
 * @param {object} targetID - the ID of the entry link with the weapon information.
 */
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

/* TODO: Add support for modifiers
//  for modifiers and conditions, store them in a separate set of JSON objects
//example:
    <modifiers>
      <modifier type="set" value="2" field="702-d447-314b-a3f6">
        <conditions>
          <condition type="atLeast" value="10" field="selections" scope="a037-a89c-f59f-8b1e" childId="model" shared="true"/>
        </conditions>
      </modifier>
    </modifiers>
*/ 
function parseModifiers(entry) {
  var modifierEntries = [];
  if (entry.modifiers) {
    modifiers = entry.modifiers[0].modifier;
  

    for (const modifier of modifiers) {
      modifierEntries.push(
        {
          modifierType: modifier.$.type,
          modifierValue: modifier.$.value,
          modiferTargetField: modifier.$.field ?? "",
          conditions: parseConditions(modifier),
        }
      );
    }
  }
  
  // Recursively check child entries
  if (entry.modifierGroups) {
    const childEntries = [...entry.modifierGroups[0].modifierGroup];
    
    for (const childEntry of childEntries) {
      modifierEntries.push(parseModifiers(childEntry)); // Recursively search for weapons
    }
  }

  return modifierEntries;

}

function parseConditions(entry) {
  var conditionEntries = [];
  if (entry.conditions) {
    conditions = entry.conditions[0].condition;

    for (const condition of conditions) {
      console.log(condition);
      conditionEntries.push(
        {
          conditionScope: condition.$.scope,
          conditionsType: condition.$.type,
          conditionCheckValue: condition.$.value,
          conditionChildId: condition.$.childId ?? "",
        }
      );
    }
  }
  
  // Recursively check child entries
  if (entry.conditionGroups) {
    const childEntries = [...entry.conditionGroups[0].conditionGroup];
    
    for (const childEntry of childEntries) {
      conditionEntries.push(parseConditions(childEntry)); // Recursively search for weapons
    }
  }

  return conditionEntries;
}

// MULTIPLE MODIFIERS
/* <categoryEntry id="d39d-c104-5d92-3d58" name="Corsairs and Travelling players" hidden="false">
      <constraints>
        <constraint type="max" value="-1" field="51b2-306e-1021-d207" scope="force" shared="true" id="29ed-407d-211c-bd41" includeChildSelections="true" includeChildForces="true"/>
      </constraints>
      <modifiers>
        <modifier type="set" value="250" field="29ed-407d-211c-bd41">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="greaterThan" value="0" field="selections" scope="force" childId="d62d-db22-4893-4bc0" shared="true" includeChildSelections="true"/>
                <condition type="instanceOf" value="1" field="selections" scope="primary-catalogue" childId="38de-521f-1ce0-44a0" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifier>
        <modifier type="set" value="500" field="29ed-407d-211c-bd41">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="greaterThan" value="0" field="selections" scope="force" childId="baf8-997f-e323-a090" shared="true" includeChildSelections="true"/>
                <condition type="instanceOf" value="1" field="selections" scope="primary-catalogue" childId="38de-521f-1ce0-44a0" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifier>
        <modifier type="set" value="750" field="29ed-407d-211c-bd41">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="greaterThan" value="0" field="selections" scope="force" childId="4204-82d0-908c-a62a" shared="true" includeChildSelections="true"/>
                <condition type="instanceOf" value="1" field="selections" scope="primary-catalogue" childId="38de-521f-1ce0-44a0" shared="true"/>
              </conditions>
            </conditionGroup>
          </conditionGroups>
        </modifier>
        <modifier type="set" value="true" field="hidden">
          <conditions>
            <condition type="notInstanceOf" value="1" field="selections" scope="primary-catalogue" childId="38de-521f-1ce0-44a0" shared="true"/>
          </conditions>
        </modifier>
      </modifiers>
    </categoryEntry> */


// NESTED conditionGroups > Condition Group > Condition Groups > Condition Group?
/*
<modifiers>
        <modifier type="set" value="true" field="hidden">
          <conditionGroups>
            <conditionGroup type="and">
              <conditions>
                <condition type="atLeast" value="1" field="forces" scope="roster" childId="1d6e-2579-8e7f-1ed4" shared="true"/>
              </conditions>
              <conditionGroups>
                <conditionGroup type="or">
                  <conditions>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="df57-7a59-75eb-ce63" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="497a-263e-966a-5a15" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="8732-df2f-a542-805f" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="f48e-276e-a997-c90e" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="b2f5-8219-f875-917e" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="9262-3993-1368-be5a" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="828d-840a-9a67-9074" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="77f9-e8de-225f-9e68" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="c9ed-d190-419c-78d3" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="6f18-95b7-2662-8925" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="1fbf-55d9-5ca8-4e9e" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="e53b-7d09-eb7c-c6c7" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="dd79-c2fe-59d6-d2" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="ada5-25ce-d5d5-4ccb" shared="true" includeChildSelections="true"/>
                    <condition type="atLeast" value="1" field="selections" scope="force" childId="ffed-8509-9bf7-820e" shared="true" includeChildSelections="true"/>
                  </conditions>
                </conditionGroup>
              </conditionGroups>
            </conditionGroup>
          </conditionGroups>
        </modifier>
      </modifiers>
*/


//INFO LINK MODIFIERS: Always append?  If so, just auto append
/*
      <infoLinks>
        <infoLink id="928c-14fb-79fb-5b2e" name="Deep Strike" hidden="false" targetId="7cb5-dd6b-dd87-ad3b" type="rule"/>
        <infoLink id="c804-b1d7-bb3-5750" name="Deadly Demise" hidden="false" targetId="b68a-5ded-65ac-98c" type="rule">
          <modifiers>
            <modifier type="append" field="name" value="D3"/>
          </modifiers>
        </infoLink>
      </infoLinks>
*/
