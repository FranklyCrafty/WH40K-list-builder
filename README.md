# WH40K-list-builder

catalogue
- catalogueLinks // linking other catalogues
- sharedSelectionEntries
	- selectionEntry // type = model or unit
		- costs
		- categoryLinks // keywords
		- profiles
			- profile TypeName=Unit || TypeName=Abilities // ability could be name in (invulnerable save, leader, specific abilities)
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
						