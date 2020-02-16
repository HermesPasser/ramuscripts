"use strict"

class MenuManager extends Drawable {
	#root = null
	#stack = []
	#clickable = new Clickable(1,1,1,1)

	constructor() {
		super(1, 1, 1, 1)
		this.canDraw = true
		this._setup()
		// Ramu.canvas.oncontextmenu = () => {
			// if (this.last)
				// this.last.checkRightClick()
			// return false
		// }
	}

	get last() {
		return this.#stack[this.#stack.length -1] || null
	}
	
	_setup() {
		this.#clickable.checkClick = () => {
			if (Ramu.Utils.isEmpty(Ramu.clickedPosition))
				return
			
			// verify if one of the items is clicked
			const rect = new Rect(Ramu.clickedPosition.X - 10, Ramu.clickedPosition.Y - 10, 1, 1)
			if (this.last) {
				for (let item of this.last.itens) {
					if (Ramu.Math.overlap(item.screenPos, rect))
						this.last.selectOption()
				}
			}
		}
		this.#clickable.checkHover = () => {
			const rect = new Rect(Ramu.mousePosition.X, Ramu.mousePosition.Y, 1, 1)
			if (this.last) {
				for (let item of this.last.itens) 
					if (Ramu.Math.overlap(item.screenPos, rect))
						this.last.cursor = item.index	
			}
		}	
	}
	
	push(menu) {
		if (this.#stack.length === 0) {
			this.#root = menu
			menu.manager = this
		}
		this.#stack.push(menu)
	}
	
	pop() {
		this.#stack.pop()
		if (this.last) {
			this.last.active = true
		}
	}
	
	reset() {
		if (this.#root) {
			this.push(this.#root)
			this.#root.open()
		}		
	}
	
	// --- Override members ---
	
	start() {
		this.reset()
	}
	
	update() {
		// TODO: add way to dinamically biding the keys
		const last = this.last
		
		if (last === null || !last.active)
			return
		
		if (Ramu.onKeyDown('d')) {
			last.cursorRight()
		} 
		
		else if (Ramu.onKeyDown('a')) {
			last.cursorLeft()
		}
		
		else if (Ramu.onKeyDown('s')) {
			last.cursorDown()
		}
		
		else if (Ramu.onKeyDown('w')) {
			last.cursorUp()
		}
		
		if (Ramu.onKeyDown('q')) { // Action button
			last.selectOption()
		}
		
		else if (Ramu.onKeyDown('e')) { // Cancel buttom
			last.close()
		}
	}

	draw() {
		for(let win of this.#stack) 
			Ramu.restoreAfter( () => { win.draw() } )
	}
}
