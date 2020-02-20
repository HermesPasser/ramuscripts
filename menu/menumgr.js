"use strict"

class MenuParams {	
	upperLeftJoint = new Rect(0, 0, 6, 6)
	horizontalLine = new Rect(6, 0, 53, 6)
	verticalLine = new Rect(0, 6, 6, 53)
	cursorRect = new Rect(32, 19, 9, 15)
	cornerSize = 6
	padding = 4
	img = null
	
	static default = new MenuParams()
}

class MenuManager extends Drawable {
	#root = null
	#clickable = new Clickable(1,1,1,1)
	stack = []

	constructor() {
		super(1, 1, 1, 1)
		this.canDraw = true
		this.setup()
		// Ramu.canvas.oncontextmenu = () => {
			// if (this.last)
				// this.last.checkRightClick()
			// return false
		// }
	}

	push(menu) {
		this.stack.push(menu)
	}
	
	pop() {
		this.stack.pop()
		if (this.last) {
			this.last.active = true
		}
	}
	
	get last() {
		return this.stack[this.stack.length -1]
	}
	
	set root (menu) {
		this.#root = menu
		menu.manager = this
	}

	get root() {
		return this.#root
	}
	
	setup() {
		this.#clickable.checkClick = () => {
			if (Ramu.Utils.isEmpty(Ramu.clickedPosition))
				return
			
			// verify if one of the items is clicked
			const rect = new Rect(Ramu.clickedPosition.X - 10, Ramu.clickedPosition.Y - 10, 1, 1)
			for (let item of this.last.itens) {
				if (Ramu.Math.overlap(item.screenPos, rect))
					this.last.selectOption()
				
			}
		}
		this.#clickable.checkHover = () => {
			const rect = new Rect(Ramu.mousePosition.X, Ramu.mousePosition.Y, 1, 1)
			for (let item of this.last.itens) 
				if (Ramu.Math.overlap(item.screenPos, rect))
					this.last.cursor = item.index	
		}	
	}
	
	// --- Override members ---
	
	start() {
		this.stack = [ this.#root ]
		this.root.open()
	}
	
	update() {
		// TODO: add way to dinamically biding the keys
		const last = this.last
		
		// TODO: input parou de funfar
		if (last !== void(0) && last.active)
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
		// TODO: draw sign of sub menu
		for(let win of this.stack) 
			Ramu.restoreAfter( () => { win.draw() } )
	}
}

