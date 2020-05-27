"use strict"

class MenuItem {
	pos = null
	screenPos = null
	index = -1 
	text = ''
	parentMenu = null
	active = false
	playSoundOnSelect = true // since you can set the item to close the menu triggering the close song together with the select song

	constructor(name) {
		this.text = name || this.text
	}
}
