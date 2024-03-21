// TODO: Add support for colors
// TODO: Add support for images
// TODO: Add support for additional rules
// TODO: Handle linkedSelectionEntries much better.  
//         Need to pass targetIds to supporting army to get linked entries in another army, then return the entries to the previous army

const svc_modifiers = require('./parseModifiers');
const svc_characteristics = require('./findCharacteristic');
const svc_weapons = require('./parseWeapons');
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
var xpath = require("xml2js-xpath");
const { DOMParser } = require('xmldom');
const e = require('express');
//const armyLocation = "C:/Users/frank.ashcraft/Development/WH40K-list-builder/test/All.cat";
const armyLocation = "C:/Users/frank.ashcraft/Development/wh40k-10e/Aeldari - Ynnari.cat";
//const armyLocation = "C:/Users/frank.ashcraft/Development/wh40k-10e/Chaos - Chaos Knights Library.cat";
//C:\Users\frank.ashcraft\Development\wh40k-10e\Imperium - Space Marines.cat

parseArmy(armyLocation);

function parseArmy(armyFileLocation, linkedTargetIds) {
    // File Locations
    const filename = path.basename(armyFileLocation, '.cat') + '.json';
    const jsonFilePath = path.join(__dirname, `../data/${filename}`);

    // Parser for the XML data
    const parser = new xml2js.Parser({ ignoreAttrs: false });

    // Read XML data
    const xmlData = fs.readFileSync(path.resolve(__dirname, armyFileLocation), "utf-8");
    var linkedSelectionEntries = [];
    // Parse the XML data
    parser.parseString(xmlData, (err, result) => {
        if (err) {
            console.error("Error parsing XML:", err);
            return;
        }
        
        // Extract all linked targetId values from the XML data
        const targetIds = xpath.find(result, "//entryLink/@targetId").map(entry => entry.$.targetId).concat(linkedTargetIds);

        // Get List of all possible units
        if (result.catalogue.catalogueLinks) {
            linkedSelectionEntries = parseSupportingArmy(result.catalogue.catalogueLinks, targetIds);
        }

        //TODO: Remove this testing code for All
        if (result.catalogue.$.name !== "All") {

            // retrieve all selection entries with the targetID above as the id
            if (targetIds) {
                linkedSelectionEntries = linkedSelectionEntries.concat(
                    targetIds.map(id => {
                        let selectionEntry = xpath.find(result,"//selectionEntry").filter(entry => entry.$.id === id);

                        if (!selectionEntry || selectionEntry.length === 0) {
                            selectionEntry = xpath.find(result,"//selectionEntryGroup").filter(entry => entry.$.id === id);
                        }

                        return selectionEntry;
                    }).filter(selectionEntry => selectionEntry !== undefined && selectionEntry.length > 0)
                );
            }

            const unitIds = xpath.find(result, "//selectionEntry").filter(entry => (entry.$.type === "unit" || entry.$.type === "model") && entry.profiles !== undefined);

            const units = unitIds.map((unitId, index) => {
                console.log(index);
                return parseUnit(unitId, linkedSelectionEntries);
            });

            // Save as JSON
            fs.writeFileSync(jsonFilePath, JSON.stringify(units, null, 2));
        }
    });

    return linkedSelectionEntries;
}

//TODO: Figure out better way to deal with Chaos Daemons Library naming in catalogue links
function parseSupportingArmy(catalogueLinks, linkedTargetIds) {
    var supportingLinkedSelectionEntries = [];
    const supportingArmies = catalogueLinks[0].catalogueLink.map((entry) => {
        return {
            id: entry.$.Id,
            name: entry.$.name === "Chaos - Daemons Library"? "Chaos - Chaos Daemons Library": 
                    entry.$.name === "Chaos Space Marines"? "Chaos - Chaos Space Marines": 
                    entry.$.name === "Astartes Heresy Legends"? "Library - Astartes Heresy Legends":
                    entry.$.name === "Imperium - Imperial Agents"? "Imperium - Agents of the Imperium":
                    entry.$.name,

        };
    });
    for (const supportingArmy of supportingArmies) {
        supportingLinkedSelectionEntries = supportingLinkedSelectionEntries.concat(
            parseArmy("C:/Users/frank.ashcraft/Development/wh40k-10e/" + supportingArmy.name + ".cat", linkedTargetIds)
        );
    }

    return supportingLinkedSelectionEntries;
}

function parseUnit(unitEntry, linkedSelectionEntries) {
    const unitData = {
        id: unitEntry.$.id,
        name: unitEntry.$.name,
        costs: {
            cost: unitEntry.costs ? unitEntry.costs[0].cost[0].$.value : "",
            id: unitEntry.costs ? unitEntry.costs[0].cost[0].$.typeId : "",
        },
        modifiers: svc_modifiers.parseModifiers(unitEntry),
        movement: svc_characteristics.findCharacteristic(unitEntry, "M"),
        toughness: svc_characteristics.findCharacteristic(unitEntry, "T"),
        save: svc_characteristics.findCharacteristic(unitEntry, "SV"),
        wounds: svc_characteristics.findCharacteristic(unitEntry, "W"),
        leadership: svc_characteristics.findCharacteristic(unitEntry, "LD"),
        objectiveControl: svc_characteristics.findCharacteristic(unitEntry, "OC"),
        abilities: unitEntry.profiles[0].profile
            .filter((char) => char.$.typeName === "Abilities")
            ?.map(parseAbility),
        models: [], //initialize models
        colors: {}, //TODO: Add support for colors
        image: {}, //TODO: Add support for images
    };

    findAndParseModels(unitEntry, unitData, linkedSelectionEntries);

    return unitData;
}

function parseModel(modelEntry, linkedSelectionEntries) {
    console.log(modelEntry.$.name);
    const modelData = {
        id: modelEntry.$.id,
        name: modelEntry.$.name,
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
        modifiers: svc_modifiers.parseModifiers(modelEntry),
    };

    svc_weapons.findAndParseWeapons(modelEntry, modelData, linkedSelectionEntries); // Find and parse weapons

    return modelData;
}

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

function findAndParseModels(entry, unitData, linkedSelectionEntries) {
    var models = [];
    if (entry.$.type === "model") {
        models = [entry];
    }
    else if (entry.selectionEntries) {
        models = [...entry.selectionEntries[0].selectionEntry];
    }

    for (const model of models) {
        if (model.$.type === "model") {
            unitData.models.push(parseModel(model, linkedSelectionEntries));
        }
    }

    // Recursively check child entries
    if (entry.selectionEntryGroups) {
        const childEntries = [...entry.selectionEntryGroups[0].selectionEntryGroup];

        for (const childEntry of childEntries) {
            findAndParseModels(childEntry, unitData, linkedSelectionEntries); // Recursively search for weapons
        }
    }

    return;
}