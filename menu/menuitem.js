"use strict"

class MenuItem {
	pos = null
	screenPos = null
	index = -1 
	text = ''
	parentMenu = null
	active = false

	constructor(name) {
		this.text = name || this.text
	}
}
