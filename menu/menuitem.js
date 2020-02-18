"use strict"

class MenuItem {
	pos = null
	screenPos = null
	index = -1 
	text = ''
	callback = null //?
	parentMenu = null
	#childMenu = null
	active = true
	
	set childMenu(menu) {
		this.#childMenu = menu
		this.#childMenu.manager = this.parentMenu.manager
	}
	
	get childMenu() {
		return this.#childMenu
	}
}
