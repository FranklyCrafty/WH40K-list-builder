module.exports = { findCharacteristic };

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
