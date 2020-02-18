"use strict"
class Menu extends GameObj{
	// remove and use MenuParams
	params = MenuParams.default
	
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

	constructor(x, y, w, h, params = null) {
		super(x, y, w, h)
		if (params)
			this.params = params
	}

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

	drawWindow() {
		const vline = this.params.verticalLine
		const hline = this.params.horizontalLine
		const ulJoint = this.params.upperLeftJoint
		const size = this.params.cornerSize
		const originXFlipped = -6 - this.x
		const originYFlipped = -6 - this.y

		// draw lines
		
		Ramu.ctx.drawImage(IMG, hline.x, hline.y, hline.width, hline.height, this.x + size, this.y, this.width - size * 2, size)
		Ramu.ctx.drawImage(IMG, hline.x, hline.y, hline.width, hline.height, this.x + size, this.y + this.height - size, this.width - size * 2, size)
		Ramu.ctx.drawImage(IMG, vline.x, vline.y, vline.width, hline.height, this.x, this.y + size, size, this.height - size * 2)
		Ramu.ctx.drawImage(IMG, vline.x, vline.y, vline.width, hline.height, this.x + this.width - size, this.y + size, size, this.height - size * 2)
	
		// draw inner coners
		
		Ramu.ctx.drawImage(IMG, ulJoint.x, ulJoint.y, ulJoint.width, ulJoint.height, this.x, this.y, size, size)
		
		Ramu.restoreAfter( () => {
			Ramu.ctx.scale(-1, 1)
			Ramu.ctx.drawImage(IMG, ulJoint.x, ulJoint.y, ulJoint.width, ulJoint.height, originXFlipped - this.width + size, this.y, size, size)
		})
		Ramu.restoreAfter( () => {
			Ramu.ctx.scale(1, -1)
			Ramu.ctx.drawImage(IMG, ulJoint.x, ulJoint.y, ulJoint.width, ulJoint.height, this.x, originYFlipped - this.height + size, size, size)
		})
		Ramu.restoreAfter( () => {
			Ramu.ctx.scale(-1, -1)
			Ramu.ctx.drawImage(IMG, ulJoint.x, ulJoint.y, ulJoint.width, ulJoint.height, originXFlipped - this.width + size, originYFlipped - this.height + size, size, size)
		})
	}

	drawSubmenuIcon(item) {
		const cursor = this.params.cursorRect
		if (item.childMenu)
			Ramu.ctx.drawImage(IMG,
				cursor.x, 
				cursor.y, 
				cursor.width, 
				cursor.height, 
				item.screenPos.x + item.screenPos.width - cursor.width - this.params.padding, 
				item.screenPos.y + item.screenPos.height - cursor.height - this.params.padding, 
				cursor.width, cursor.height)
	}

	drawItemWindow(item, index) {
		if (this.cursor == index) {
			Ramu.ctx.fillStyle = 'cyan'
			Ramu.ctx.strokeStyle = 'white'
		} else {
			Ramu.ctx.fillStyle = '#86d1fc'
			Ramu.ctx.strokeStyle = '#2fadf5'
		}
		
		if (!this.active) {
			Ramu.ctx.fillStyle = '#c2eff2'
		}
					
		Ramu.ctx.fillRect(item.screenPos.x, item.screenPos.y, item.screenPos.width, item.screenPos.height)
		Ramu.ctx.strokeRect(item.screenPos.x, item.screenPos.y, item.screenPos.width, item.screenPos.height)
	}

	drawItemName(item, index) {
		Ramu.ctx.textBaseline = 'top'
		Ramu.ctx.fillStyle = 'white'
		const w = Ramu.ctx.measureText('M').width

		if (!item.active)
			Ramu.ctx.fillStyle = 'gray'
		else if (this.cursor == index)
			Ramu.ctx.fillStyle = '#2fadf5'
		
		Ramu.ctx.fillText(item.text, item.screenPos.x + w , item.screenPos.y + w/2)
	}

	draw() {
		if (!this.visible) // remove this?
			return

		Ramu.ctx.imageSmoothingEnabled = false
		if (Ramu.debugMode) {
			Ramu.ctx.strokeStyle = 'green'
			Ramu.ctx.strokeRect(this.x, this.y, this.width, this.height)
		}
		
		if (!this.#packed) // do NOT draw even with itens availables since the position wasn't calculated yet
			return
		
		let index = 0
		for (let item of this.#menuItens) {
			this.drawItemWindow(item, index)

			this.drawSubmenuIcon(item)		
			this.drawItemName(item, index)
				
			index++
		}
		
		this.drawWindow()
	}
}
