# WH40K-list-builder

catalogue 
        (xmlns="http://www.battlescribe.net/schema/catalogueSchema" library="false" id="50c4-3e83-fe54-97c4" name="Imperium - Grey Knights" gameSystemId="sys-352e-adc2-7639-d6a9" gameSystemRevision="1" revision="7" battleScribeVersion="2.03" type="catalogue")
- catalogueLinks // linking other catalogues 
        (type="catalogue" name="Imperium - Imperial Agents" id="575c-d0f9-7fdc-2ddb" targetId="b00-cd86-4b4c-97ba" importRootEntries="true")
- sharedSelectionEntries   
	- selectionEntry 
            (type = (model or unit) import="true" name="Brother-Captain" hidden="false" id="dce9-6eb4-fa33-e869")
		- costs
            - cost 
                    (name="pts" typeId="51b2-306e-1021-d207" value="95")
		- categoryLinks // keywords
            - categoryLink 
                    (targetId="71ac-a100-1ec8-14e9" id="5012-310-4cac-e45b" primary="false" name="Brother-Captain")
		- profiles
			- profile // ability could be name in (invulnerable save, leader, specific abilities)
                    TypeName=Unit||Abilities 
				- characteristics
					- characteristic
		- infoLinks // rule details from Warhammer 40,000.gst
		- selectionEntryGroups
			- selectionEntryGroup // name=Weapon Choice
				- selectionEntries
					- selectionEntry
						- infoLinks
							- modifiers
								- modifier
						- profiles
							- profile
								- characteristics
									- characteristic // Range, A, BS, S, AP, D, Keywords
						- constraints
							- constraint
						