module.exports = {
    findWeaponChoice,
    parseWeapon,
    findAndParseWeapons,
    gatherWeaponEntryLinks,
    findWeaponEntryLink,
    parseAdditionalInfo
};

const fc = require("./findCharacteristic");
const pm = require("./parseModifiers");
const pr = require("./parseRules");

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
        range: fc.findCharacteristic(weaponEntry, "Range"),
        attacks: fc.findCharacteristic(weaponEntry, "A"),
        weapon_skill: fc.findCharacteristic(weaponEntry, "WS") || fc.findCharacteristic(weaponEntry, "BS"),
        armor_penetration: fc.findCharacteristic(weaponEntry, "AP"),
        damage: fc.findCharacteristic(weaponEntry, "D"),
        weapon_type: weaponEntry.$.typeName,
        keywords: fc.findCharacteristic(weaponEntry, "Keywords"),
        additional_info: weaponEntry.infoLinks ? weaponEntry.infoLinks[0].infoLink.map(parseAdditionalInfo) : [],
        rules: weaponEntry.rules ? pr.parseRules(weaponEntry.rules) : [],
        minSelection: weaponEntry.constraints ? weaponEntry.constraints[0].constraint.find((char) => char.$.type === "min") ?.$.value : "1",
        maxSelection: weaponEntry.constraints ? weaponEntry.constraints[0].constraint.find((char) => char.$.type === "max") ?.$.value : "1",
        modifiers: pm.parseModifiers(weaponEntry),
    };
}

/**
 * Recursive function to find and parse weapons
 * @param {object} entry - The current XML entry to search for weapons`
 * @param {object} modelData - The model data to store found weapons
 */
function findAndParseWeapons(entry, modelData, linkedSelectionEntries) {
    var profiles = [];

    if (entry.entryLinks) {
        const entryLinks = entry.entryLinks[0].entryLink;

        for (const entryLink of entryLinks) {
            const targetId = entryLink.$.targetId;
            const targetEntry = findWeaponEntryLink(targetId, linkedSelectionEntries);
            if (targetEntry) {
                findAndParseWeapons(targetEntry, modelData, linkedSelectionEntries);
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
            findAndParseWeapons(childEntry, modelData, linkedSelectionEntries); // Recursively search for weapons
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
function gatherWeaponEntryLinks(parsedXMLData) {
    var parsedResult = null;
    // Use XPath to find the selectionEntry with a matching id attribute.
    const query = `//entryLink[@id='${targetId}']`;
    parsedResult = xpath.find(parsedXMLData, query);
    // If a selectionEntry with a matching id is found, return it
    if (parsedResult && parsedResult.length > 0) {
        // Convert the found selectionEntry back to a JSON object.
        return parsedResult[0];
    } else {
        // If no matching selectionEntry is found, return null.
        return null;
    }
}

/**
 * TODO: Need to pre-parse all weapon entry links to pull from a list
 * 
 * If there is a weapon that is added as an entry link, then the information for 
 * that model is stored elsewhere in the file.  This searches the file fo the 
 * information about the weapon
 * @param {object} targetID - the ID of the entry link with the weapon information.
 */
function findWeaponEntryLink(targetId, linkedSelectionEntries) {
    console.log(targetId);
    return linkedSelectionEntries.find((entry) => entry[0].$.id === targetId)[0];
}

/**
 * Function to parse an additional rule selection entry
 * @param {string} additionalRulesEntry - parses additional rules
 * @returns {object} - The parsed additional rule data.
 * TODO: Add support for modifiers
 */
function parseAdditionalInfo(additionalInfoEntry) {
    console.log(additionalInfoEntry.$.name);
    return {
        id: additionalInfoEntry.$.id,
        name: additionalInfoEntry.$.name,
        type: additionalInfoEntry.$.type,
        rule_reference_id: additionalInfoEntry.$.targetId,
    };
}