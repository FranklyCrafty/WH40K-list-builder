module.exports = { parseRules };

/**
 * Parses the rule tags of an entry.
 * 
 * @param {Object} entry - The entry object containing rule.
 * @returns {Array} - An array of modifier entries.
 */
function parseRules(rulesEntry) {    
    var ruleEntries = [];
    const rulesGroup = rulesEntry[0].rule;

    if (rulesGroup) {
        
        for (const rule of rulesGroup) {
            ruleEntries.push(parseRule(rule));
        }
    }

    return ruleEntries;
}

/**
 * Parses a single rule entry.
 * 
 * @param {Object} entry - The rule entry to parse.
 * @returns {Object} - The parsed rule entry.
 */
function parseRule(entry) {
    console.log("rule: " + entry.$.id)
    return {
        id: entry.$.id,
        name: entry.$.name,
        description: entry.description,
    };
}
