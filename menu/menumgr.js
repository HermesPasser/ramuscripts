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
	stack = []

	constructor() {
		super(1, 1, 1, 1)
		this.canDraw = true
	}

	start() {
		this.stack = [ this.#root ]
		this.root.open()
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

	update() {
		// TODO: add way to dinamically biding the keys
		
		const last = this.last
		
		if (!last && last.active)
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
Ramu.init()
Ramu.debugMode = true

// the order matters when is adding a child menu, change it

MenuParams.default.img = Ramu.Utils.getImage('skin.png')

const mgr = new MenuManager()

const m = new Menu(10, 10, 250, 100) // size < 20 quebra (joga exceção)
m.set('fight')
m.set('skill')
m.set('item').active = false
const mitem = m.set('submenu')
m.set('runer')
m.set('dreamer')
m.pack()

mgr.root = m

const subm = new Menu(25, 25, 150, 50)
subm.set('00')
const submitem = subm.set('voltar')
subm.set('')
subm.set('')
subm.set('')
subm.set('')
subm.parentMenu = m // need this to childMenu() work
subm.pack()

subm.onCommandFunc = (item) => {
	// chamando uma vez mesmo quando não cliquei
	if (item.id == submitem.id) {
		console.log("oi")
		subm.close()
		
	}
}
mitem.childMenu = subm
