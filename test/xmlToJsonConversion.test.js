const fs = require("fs");
const path = require("path");
const assert = require("assert");
const xml2js = require("xml2js");
const xpath = require("xpath");
const dom = require("@xmldom/xmldom").DOMParser;

const { parseUnit } = require("../services/parse10eFactionService.js");

describe("XML to JSON Conversion", () => {
  it("should have the same number of models in XML and JSON", () => {
    const xmlFilePath = path.resolve(__dirname, "../data/Imperium - Grey Knights.cat");
    const filename = xmlFilePath.split("/")[xmlFilePath.split("/").length - 1].replace(".cat", ".json");

    const jsonFilePath = path.resolve(__dirname, `../data/$(filename)`);

    const xmlData = fs.readFileSync(xmlFilePath, "utf-8");
    const parser = new xml2js.Parser();
    let xmlResult;

    parser.parseString(xmlData, (err, result) => {
      if (err) {
        throw err;
      }
      xmlResult = result;
    });

    const xmlModels = getModelsFromXML(xmlResult);
    const jsonModels = getModelsFromJSON(jsonFilePath);

    const xmlModelNames = xmlModels.map((model) => model.name);
    const jsonModelNames = jsonModels.map((model) => model.name);

    // Perform the assertion
    assert.deepStrictEqual(xmlModelNames, jsonModelNames);
  });
});

function getModelsFromXML(xmlResult) {
  const jsBuilder = new xml2js.Builder();
  const doc = new dom().parseFromString(jsBuilder.buildObject(xmlResult));
  const select = xpath.useNamespaces({ "": "http://www.w3.org/2001/XMLSchema-instance" });

  // XPath query to select model selectionEntry elements
  const modelNodes = select("//selectionEntry[@type='model']", doc);

  const models = [];

  for (const node of modelNodes) {
    const unitEntry = xmlResult.catalogue.sharedSelectionEntries[0].selectionEntry.find(
      (entry) => entry.$.id === node.getAttribute("id")
    );

    if (unitEntry && (unitEntry.$.type == "unit" || unitEntry.$.type == "model")) {
      models.push(parseUnit(unitEntry));
    }
  }

  return models;
}

function getModelsFromJSON(jsonFilePath) {
  const jsonData = fs.readFileSync(jsonFilePath, "utf-8");
  return JSON.parse(jsonData);
}
