module.exports = { parseConditions };

//TODO: Condition Groups have and & or types
function parseConditions(entry) {
  var conditionEntries = [];
  var conditions = [];

  if (entry.conditions) {
    conditions = entry.conditions[0].condition;

    for (const condition of conditions) {
      console.log(condition);
      conditionEntries.push(
        parseCondition(condition) );
    }
  }
  
  // Recursively check child entries
  if (entry.conditionGroups) {
    const childEntries = [...entry.conditionGroups[0].conditionGroup];

    for (const childEntry of childEntries) {
      conditionEntries.push({
        conditionGroupType: childEntry.$.type ?? "",
        conditions: parseConditions(childEntry), // Recursively search for entries
      });
    }
  }

  return conditionEntries;
}

function parseCondition(entry) {
  return {
    conditionScope: entry.$.scope,
    conditionsType: entry.$.type,
    conditionCheckValue: entry.$.value,
    conditionChildId: entry.$.childId ?? "",
  };
}
