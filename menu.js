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
	childMenu = null
	active = true
}

class Menu extends Drawable { // remove from drawable
	upperLeftJoint = new Rect(0, 0, 6, 6)
	horizontalLine = new Rect(6, 0, 53, 6)
	verticalLine = new Rect(0, 6, 6, 53)
	padding = 4
	columns = 3
	lines = 2
	cursor = 0
	#menuItens = []
	active = true
	#packed = false
	
	start() {
		this.canDraw = true
	//	this.pack()
	}
	
	set(name) {
		if (this.#menuItens.length > this.columns * this.lines)
			// TODO: se tiver scroll .pos e .screenPos deve ser re-calculado cada vez que dar scroll
			console.warn("NoImplemented: this have not scroll so this ops will not be shown yet")
		
		const mi = new MenuItem()
		mi.text = name	
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
	
	update() {
		// TODO: PREVENT change cursor position if no option is available in the position
		if (Ramu.onKeyDown('d')) {
			this.cursor = ++this.cursor 
			
			if (this.cursor > this.columns + this.lines)
				this.cursor = 0
		}
		
		if (Ramu.onKeyDown('a')) {
			this.cursor = --this.cursor 
			
			if (this.cursor < 0)
				this.cursor = this.columns + this.lines
		}
		
		if (Ramu.onKeyDown('w')) {
			this.cursor -= this.columns
			if (this.cursor < 0)
				this.cursor += this.columns
		}
		
		if (Ramu.onKeyDown('s')) {
			this.cursor += this.columns
			if (this.cursor > this.columns + this.lines)
				this.cursor -= this.columns
		}
		
		if (Ramu.onKeyDown('q')) {
			this.processCommand(this.#menuItens[this.cursor])
		}
	}
	
	processCommand(item) {
		
	}
	
	draw() {
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
			
			// if (!item.active) {
				// Ramu.ctx.strokeStyle = 'gray'
			// }
						
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
	padding = 4
}

class MenuManager extends Drawable {
	root = null
	stack = []

	constructor() {

	}

	start() {
		stack = [ this.root ]
	}

	draw() {

		for(let win of this.stack) {
			win()
		}

	}

}
Ramu.init()
Ramu.debugMode = true

//new Menu(10, 10, 150, 50).pack(['fight', 'skill', 'item', 'run', 'ana', 'runer', 'dreamer'])
var s = new Menu(25, 10, 150, 50)
s.set('fight')
s.set('skill')
s.set('item').active = false
s.set('run')
s.set('runer')
s.set('dreamer')
s.pack()
