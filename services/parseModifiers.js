module.exports = { parseModifiers };

const svc_conditions = require('./parseConditions');

/**
 * Parses the modifiers of an entry.
 * 
 * @param {Object} entry - The entry object containing modifiers.
 * @returns {Array} - An array of modifier entries.
 */
function parseModifiers(entry) {
  var modifierEntries = [];
  var modifiers = [];
  if (entry.modifiers) {
    modifiers = entry.modifiers[0].modifier;
  

    for (const modifier of modifiers) {
      modifierEntries.push(
        {
          modifierType: modifier.$.type,
          modifierValue: modifier.$.value,
          modifierTargetField: modifier.$.field ?? "",
          conditions: svc_conditions.parseConditions(modifier), // Recursively search for entries
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
