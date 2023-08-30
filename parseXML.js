const fs = require('fs');
const xml2js = require('xml2js');

// Read XML data from file
const xmlData = fs.readFileSync('data/Imperium - Grey Knights.cat', 'utf-8');

// Parse XML data
const parser = new xml2js.Parser();
parser.parseString(xmlData, (err, result) => {
  if (err) {
    console.error('Error parsing XML:', err);
    return;
  }

  // Extract relevant data from the parsed result and save as JSON
  const units = result.catalogue.sharedSelectionEntries[0].selectionEntry.map(entry => {
    if (entry.$.type == "unit" || entry.$.type == "model"){
      const unitData = {
        id: entry.$.id,
        name: entry.$.name,
        movement: entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'M')._,
        toughness: entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'T')._,
        save: entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'SV')._,
        wounds: entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'W')._,
        leadership: entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'LD')._,
        objectiveControl: entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'OC')._,
        //abilities: entry.profiles[0].profile[1].characteristics[0].characteristic.find(char => char.$.typeName === 'Abilities')._,
        //leaderAbilities: entry.profiles[0].profile[2].characteristics[0].characteristic.find(char => char.$.typeName === 'Abilities')._,
        //psychicAbilities: [
        //  entry.profiles[0].profile[3].characteristics[0].characteristic.find(char => char.$.typeName === 'Abilities')._,
        //  entry.profiles[0].profile[4].characteristics[0].characteristic.find(char => char.$.typeName === 'Abilities')._
        //],
        colors: [], // This information is not present in the XML file
        image: [],//entry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'image')._
        weapons: [] // Initialize the weapons array
      };

      // Check if the entry has selectionEntryGroups and if its typeName is 'Weapon Choice'
      if (entry.selectionEntryGroups && entry.selectionEntryGroups[0].selectionEntryGroup[0].$.name === 'Weapon Choice') {
        // Iterate through selectionEntries within the selectionEntryGroup
        const weaponSelections = entry.selectionEntryGroups[0].selectionEntryGroup[0].selectionEntries[0].selectionEntry.map(weaponEntry => {
          const weaponData = {
          // Extract weapon attributes here based on XML structure
          id: weaponEntry.selectionEntry.find(char => char.$.type === 'upgrade').id,
          name: weaponEntry.selectionEntry.find(char => char.$.type === 'upgrade').name,
          //keywords: weaponData.keywords;
          range: weaponEntry.selectionEntry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'Range')._,
          attacks: weaponEntry.selectionEntry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'A')._,
          weapon_skill: weaponEntry.selectionEntry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'WS'||char.$.name === 'BS')._,
          armor_penetration: entry.selectionEntry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'A')._,
          damage: weaponEntry.selectionEntry.profiles[0].profile[0].characteristics[0].characteristic.find(char => char.$.name === 'D')._,
          //rules: weaponData.rules;
          //constraints: weaponData.constraints;
          weapon_type: weaponEntry.selectionEntry.profiles[0].profile.find(char => char.$.type === name).typeName
          };
        });
      }
      else{
        weaponSelections=[];
      }
         
      unitData.weapons = weaponSelections;
      
      return unitData;
    }
    else {
      return null;
    }

  });

  // Save as JSON
  fs.writeFileSync('greyKnightsData.json', JSON.stringify(units, null, 2));
});