const fs = require('fs');
const xml2js = require('xml2js');

// Read XML data from file
const xmlData = fs.readFileSync('data/Imperium - Grey Knights.cat', 'utf-8');
xml2js.parseString(xmlData, function(err, result) {
  fs.writeFileSync('greyKnightsData.json', JSON.stringify(result));
});


/*
// Parse XML data
const parser = new xml2js.Parser();
parser.parseString(xmlData, (err, result) => {
  if (err) {
    console.error('Error parsing XML:', err);
    return;
  }

  // Extract relevant data from the parsed result and save as JSON
  const units = result.catalogue.sharedSelectionEntries[0].selectionEntry.map(parseUnit);

  // Save as JSON
  fs.writeFileSync('greyKnightsData.json', JSON.stringify(units, null, 2));
});

// Function to parse a single unit/model entry
// Function to parse a single unit/model entry
function parseUnit(entry) {
  if (entry.$.type === "unit" || entry.$.type === "model") {
    const unitData = {
      id: entry.$.id,
      name: entry.$.name,
      movement: findCharacteristic(entry, 'M'),
      toughness: findCharacteristic(entry, 'T'),
      save: findCharacteristic(entry, 'SV'),
      wounds: findCharacteristic(entry, 'W'),
      leadership: findCharacteristic(entry, 'LD'),
      objectiveControl: findCharacteristic(entry, 'OC'),
      colors: [], // This information is not present in the XML file
      image: [], //entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'image')._
      weapons: [] // Initialize the weapons array
    };

    // Handle weapon choice if it's on the same hierarchy as profile
    if (entry.selectionEntries) {
      const weaponChoice = entry.selectionEntries[0].selectionEntry;//.find(item => item.selectionEntry.type === 'upgrade');
      if (weaponChoice) {
        unitData.weapons = weaponChoice.map(parseWeapon);
      }
    }

    // Handle weapon choice if it's a child of the unit/model
    if (entry.selectionEntryGroups) {
      const weaponChoiceGroup = findWeaponChoice(entry);
      if (weaponChoiceGroup) {
        const weaponChoice = weaponChoiceGroup.selectionEntries[0].selectionEntry;
        ;
        if (weaponChoice) {
          unitData.weapons = weaponChoice.map(parseWeapon);
        }
      }
    }

    return unitData;
  } else {
    return null;
  }
}


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

// Function to parse a weapon selection entry
function parseWeapon(weaponEntry) {
  console.log(weaponEntry.$.name);
  return {
    id: weaponEntry.$.id,
    name: weaponEntry.$.name,
    range: findCharacteristic(weaponEntry, 'Range'),
    attacks: findCharacteristic(weaponEntry, 'A'),
    weapon_skill: findCharacteristic(weaponEntry, 'WS') || findCharacteristic(weaponEntry, 'BS'),
    armor_penetration: findCharacteristic(weaponEntry, 'AP'),
    damage: findCharacteristic(weaponEntry, 'D'),
    weapon_type: weaponEntry.profiles[0].profile[0].$.typeName
  };
}
*/