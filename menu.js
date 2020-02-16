"use strict"
const IMG = Ramu.Utils.getImage('skin.png')

Ramu.restoreAfter = function (func) {
	if (!Ramu.ctx)
		return
	Ramu.ctx.save()
	func()
	Ramu.ctx.restore()
}

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

class Menu extends GameObj{
	// remove and use MenuParams
	upperLeftJoint = new Rect(0, 0, 6, 6)
	horizontalLine = new Rect(6, 0, 53, 6)
	verticalLine = new Rect(0, 6, 6, 53)
	padding = 4
	
	columns = 3
	lines = 2
	cursor = 0
	#menuItens = []
	active = false
	#packed = false
	onCloseFunc = null
	onOpenFunc = null
	onCommandFunc = null
	visible = false
	
	manager = null
	
	open() {
		if(this.onOpenFunc)
			this.onOpenFunc()
		this.visible = true
		this.active = true
	}
	
	close() {
		if(this.onCloseFunc)
			this.onCloseFunc()
		this.active = false
		this.visible = false
		
		if (this.manager)
			this.manager.pop()
	}
	
	processCommand(item) {
		if (item && item.childMenu) {
			item.childMenu.open()
			this.manager.push(item.childMenu)
			this.active = false
			
		} else {
			if (this.onCommandFunc)
				this.onCommandFunc(item)
		}
	}
	
	get(id) {
		return this.#menuItens[id]
	}
	
	set(name) {
		if (this.#menuItens.length > this.columns * this.lines)
			// TODO: se tiver scroll .pos e .screenPos deve ser re-calculado cada vez que dar scroll
			console.warn("NoImplemented: this have not scroll so this ops will not be shown yet")
		
		const mi = new MenuItem()
		mi.text = name
		mi.parentMenu = this
		mi.index = this.#menuItens.push(mi) - 1
		return mi
	}

	pack() {
		if (this.#menuItens.length === 0)
			return
		
		this.#packed = true
		
		const size = 6
		const windowInnerFrame = new Rect(
			this.x + size, this.y + size,
			this.width - size * 2, this.height - size * 2
		)
		const itemW = windowInnerFrame.width / this.columns
		const itemH = windowInnerFrame.height / this.lines

		for (let sY = windowInnerFrame.y, posY = 0, i = 0; sY < windowInnerFrame.y + windowInnerFrame.height; sY += itemH, posY++) {
			for (let sX = windowInnerFrame.x, posX = 0; sX < windowInnerFrame.x + windowInnerFrame.width; sX += itemW, posX++, i++) {					
				
				if (i > this.#menuItens.length - 1)
					continue
				
				this.#menuItens[i].pos = new Rect(posX, posY, 0, 0)
				this.#menuItens[i].screenPos = new Rect(sX, sY, itemW, itemH)	
			}
		}
	}

	cursorUp() {
		this.cursor -= this.columns
		if (this.cursor < 0)
			this.cursor += this.columns
	}

	cursorDown() {
		this.cursor += this.columns
		if (this.cursor > this.columns + this.lines)
			this.cursor -= this.columns
	}

	cursorLeft() {
		this.cursor = --this.cursor 
			
		if (this.cursor < 0)
			this.cursor = this.columns + this.lines
	}

	cursorRight() {
		this.cursor = ++this.cursor 
			
		if (this.cursor > this.columns + this.lines)
			this.cursor = 0
	}

	selectOption() {
		this.processCommand(this.#menuItens[this.cursor])
	}

	draw() {
		if (!this.visible) // remove this?
			return

		Ramu.ctx.imageSmoothingEnabled = false
		if (Ramu.debugMode) {
			Ramu.ctx.strokeStyle = 'green'
			Ramu.ctx.strokeRect(this.x, this.y, this.width, this.height)
		}
		
		const size = 6
		const originXFlipped = -6 - this.x
		const originYFlipped = -6 - this.y

		// draw lines
		
		Ramu.ctx.drawImage(IMG, this.horizontalLine.x, this.horizontalLine.y, this.horizontalLine.width, this.horizontalLine.height, this.x + size, this.y, this.width - size * 2, size)
		Ramu.ctx.drawImage(IMG, this.horizontalLine.x, this.horizontalLine.y, this.horizontalLine.width, this.horizontalLine.height, this.x + size, this.y + this.height - size, this.width - size * 2, size)
		Ramu.ctx.drawImage(IMG, this.verticalLine.x, this.verticalLine.y, this.verticalLine.width, this.horizontalLine.height, this.x, this.y + size, size, this.height - size * 2)
		Ramu.ctx.drawImage(IMG, this.verticalLine.x, this.verticalLine.y, this.verticalLine.width, this.horizontalLine.height, this.x + this.width - size, this.y + size, size, this.height - size * 2)
	
		// draw inner coners
		
		Ramu.ctx.drawImage(IMG, this.upperLeftJoint.x, this.upperLeftJoint.y, this.upperLeftJoint.width, this.upperLeftJoint.height, this.x, this.y, size, size)
		
		Ramu.restoreAfter( () => {
			Ramu.ctx.scale(-1, 1)
			Ramu.ctx.drawImage(IMG, this.upperLeftJoint.x, this.upperLeftJoint.y, this.upperLeftJoint.width, this.upperLeftJoint.height, originXFlipped - this.width + size, this.y, size, size)
		})
		Ramu.restoreAfter( () => {
			Ramu.ctx.scale(1, -1)
			Ramu.ctx.drawImage(IMG, this.upperLeftJoint.x, this.upperLeftJoint.y, this.upperLeftJoint.width, this.upperLeftJoint.height, this.x, originYFlipped - this.height + size, size, size)
		})
		Ramu.restoreAfter( () => {
			Ramu.ctx.scale(-1, -1)
			Ramu.ctx.drawImage(IMG, this.upperLeftJoint.x, this.upperLeftJoint.y, this.upperLeftJoint.width, this.upperLeftJoint.height, originXFlipped - this.width + size, originYFlipped - this.height + size, size, size)
		})
		
		// draw menu & text
		
		if (!this.#packed) // do NOT draw even with itens availables since the position wasn't calculated yet
			return// this.pack()
		
		let index = 0
		for (let item of this.#menuItens) {
			if (this.cursor == index) {
				Ramu.ctx.fillStyle = 'cyan'
				Ramu.ctx.strokeStyle = 'white'
			} else {
				Ramu.ctx.fillStyle = '#86d1fc'
				Ramu.ctx.strokeStyle = '#2fadf5'
			}
			
			if (!this.active) {
				Ramu.ctx.fillStyle = 'blue'
			}
						
			Ramu.ctx.fillRect(item.screenPos.x, item.screenPos.y, item.screenPos.width, item.screenPos.height)
			Ramu.ctx.strokeRect(item.screenPos.x, item.screenPos.y, item.screenPos.width, item.screenPos.height)
			
			// text
			
			Ramu.ctx.textBaseline = 'top'
			Ramu.ctx.fillStyle = 'white'
			
			if (!item.active)
				Ramu.ctx.fillStyle = 'gray'
			
			const w = Ramu.ctx.measureText('M').width
			
			if (this.cursor == index)
				Ramu.ctx.fillStyle = '#2fadf5'
			
			Ramu.ctx.fillText(item.text, item.screenPos.x + w , item.screenPos.y + w/2)
			index++
		}
		
	}
}

class MenuParams {
	upperLeftJoint = new Rect(0, 0, 6, 6)
	horizontalLine = new Rect(6, 0, 53, 6)
	verticalLine = new Rect(0, 6, 6, 53)
	cornerSize = 6
	padding = 4
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
		
		if (!last)
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
		
		else if (Ramu.onKeyDown('q')) { // Action button
			last.selectOption()
		}
		
		else if (Ramu.onKeyDown('e')) { // Cancel buttom
			last.close()
		}
	}

	draw() {
		// TODO: draw sign of sub menu
		for(let win of this.stack) {
			win.draw()
		}

	}
}
Ramu.init()
Ramu.debugMode = true

// the order matters when is adding a child menu, change it

const mgr = new MenuManager()

const m = new Menu(10, 10, 150, 50)
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

subm.onCloseFunc = () => {
	console.log('oi')
}

subm.onCommandFunc = (item) => {
	// chamando uma vez mesmo quando não cliquei
	if (item.id == submitem.id) {
		console.log("oi")
		subm.close()
		
	}
}
mitem.childMenu = subm

