"use strict"

class MenuManager extends Drawable {
	#root = null
	#stack = []
	#clickable = new Clickable(1,1,1,1)
	surpressDisableInput = false // if true the root menu will not be deactivated by the user input

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
						this.last.selectOption(item.index)
				}
			}
		}
		this._lastClicked = null
		this.#clickable.checkHover = () => {
			// TODO: for f's sake refactor this
			
			const rect = new Rect(Ramu.mousePosition.X, Ramu.mousePosition.Y, 1, 1)
			if (this.last) {
				for (let item of this.last.itens){
					if (Ramu.Math.overlap(item.screenPos, rect) && !this.#clickable.isInHover) {
						if (this._lastClicked === item)
							return
							
						this._lastClicked = item
						this.#clickable.onHoverEnter(item);	
						break
					}
				}
			}
		}
		this.#clickable.onHoverEnter = (item) => {
			this.last.selectItem(item.index)
			this.last.playChangeAudio()
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
		//console.log(this.#stack, this.last)
		this.#stack.pop()
		//console.log(this.#stack, this.last)
		if (this.last) {
			// since the previous item on the stack would be inactive
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
		// TODO: add way to dinamically the bind of the keys
		const last = this.last
		
		if (last === null || !last.active || !last.visible) 
		// TODO: is never null or not active so util if refactor this the way this i add
		// visible to the checks to prevent from executing when is supossed to be disabled
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
		
		const canDisable = !this.surpressDisableInput || last !== this.#root
		if (Ramu.onKeyDown('q')) { // Action button
			last.selectOption()
		}
				
		else if (Ramu.onKeyDown('e') && canDisable) { // Cancel buttom
			last.close()
		}
	}

	draw() {
		for(let win of this.#stack) 
			Ramu.restoreAfter( () => { win.draw() } )
	}
}
