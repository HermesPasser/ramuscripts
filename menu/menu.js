"use strict"
class Menu {
	x = -1
	y = -1
	//TODO: test what happen if one or all is <= 0
	width = -1
	height = -1
	lines = -1
	columns = -1
	
	cursor = 5
	
	// testes
	#fillItens = [] // ainda não usado de fato, serve para manter traço dos itens colocados p preencher espaço
	firstItemToDrawn = 0
	get fill () {return this.#fillItens}
	
	
	#menuItens = [] // use set(text, index) instead?
	#childMenus = {}
	#packed = false
	active = false
	visible = false
	
	onOpenFunc    = () => {}
	onCloseFunc   = () => {}
	onCommandFunc = () => {}
	
	params = MenuParams.default
	manager = null

	constructor(posSize, lines, columns, params = null) {
		this.x = posSize.x
		this.y = posSize.y
		this.width = posSize.width
		this.height = posSize.height
		this.lines = lines
		this.columns = columns
		this.params = params || this.params
	}
	
	setChildMenu(triggerOption, menu) {
		this.#childMenus[triggerOption] = menu
		this.#childMenus[triggerOption].manager = this.manager
	}
	
	get itens() {
		return this.#menuItens
	}

	open() {
		this.onOpenFunc()
		this.visible = true
		this.active = true
	}
	
	close() {
		this.onCloseFunc()
		this.active = false
		this.visible = false
		
		if (this.manager)
			this.manager.pop()
	}
	
	_processCommand(item) {
		if (!item.active)
			return
		
		if (item && this.#childMenus[item.text]) {
			this.#childMenus[item.text].open()
			this.manager.push(this.#childMenus[item.text])
			this.active = false
			
		} else {
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

	pack(index = 0) {
		if (this.#menuItens.length === 0)
			return
		
		// checa se tem mais espaço que item
		// if (this.#menuItens.length < this.lines * this.columns)
			// console.log(this.#menuItens, this.lines * this.columns)
		
		this.#packed = true
		
		const size = this.params.cornerSize
		const windowInnerFrame = new Rect(
			this.x + size, this.y + size,
			this.width - size * 2, this.height - size * 2
		)
		const itemW = windowInnerFrame.width / this.columns
		const itemH = windowInnerFrame.height / this.lines
		
		this.#fillItens = [] // removing the fills from the last pack()
		for (let sY = windowInnerFrame.y, posY = 0, i = index; sY < windowInnerFrame.y + windowInnerFrame.height; sY += itemH, posY++) {
			for (let sX = windowInnerFrame.x, posX = 0; sX < windowInnerFrame.x + windowInnerFrame.width; sX += itemW, posX++, i++) {					
				
				// quando entra aqui varias vezes vai criando vários intens,
				// para impedir isso usar o segundo array com o num de valores imaginarios
				// fillItens
				let item = null
				if (i > this.#menuItens.length - 1) {
					let fillItem = new MenuItem()
					fillItem.index = i
					fillItem.invalid = true
					this.#fillItens.push(fillItem)
					item = fillItem
				} else item = this.#menuItens[i]
				
				item.pos = new Rect(posX, posY, 0, 0)
				item.screenPos = new Rect(sX, sY, itemW, itemH)	
			}
		}
	}

	cursorUp() {
		this.cursor -= this.columns
		if (this.cursor < 0)
			this.cursor += this.columns
	}

	cursorDown() {
		// prevents from selecting an unexistent item
		if (this.#menuItens[this.cursor + this.columns] === void(0) || this.#menuItens[this.cursor + this.columns].invalid)
			return
				
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
		// prevents from selecting an unexistent item
		// const convenicence = this.#menuItens[this.cursor + 1]
		const convenicence2 = this.#menuItens[this.cursor +this.firstItemToDrawn + 1]
		// if (this.#menuItens[this.cursor +this.firstItemToDrawn+ 1] === void(0) || this.#menuItens[this.cursor+this.firstItemToDrawn + 1].invalid) 
			// this.cursor = -1
		
		// não da p resolver sem math
		// já que eu preciso saber quando jogar  this.firstItemToDrawn para zero denovo
		
		++this.cursor 
		if (this.#menuItens[this.cursor +this.firstItemToDrawn] === void(0) || this.#menuItens[this.cursor+this.firstItemToDrawn].invalid) {
			console.log("o")
			this.cursor = 0
			this.firstItemToDrawn = 0
			this.pack(0)
		}		
		if (this.cursor + this.firstItemToDrawn >= this.itens.length)
				this.cursor = 0
			
		
			
		if (this.cursor > this.columns + this.lines) {
			// This item is the last, go back to the first
			// if (this.cursor >= this.itens.length)
				// this.cursor = 0
			// This item is not being drawn, tell the Menu to start to drawn from here on
			// else 
				if (this.itens.length > this.cursor) {
				
				if (this.#menuItens[this.cursor].invalid)
				{
					console.log('console')
					this.firstItemToDrawn = 0
					
					this.pack(0)
				} else {
					this.firstItemToDrawn = this.cursor
					this.pack(this.cursor)
				}
				this.cursor = 0
			}
		
		}
	}

	selectOption() {
		this._processCommand(this.#menuItens[this.cursor + this.firstItemToDrawn]) // + add the firstItemToDrawn?
	}

	_drawWindow() {
		const img = this.params.img
		const vline = this.params.verticalLine
		const hline = this.params.horizontalLine
		const ulJoint = this.params.upperLeftJoint
		const size = this.params.cornerSize
		const originXFlipped = -6 - this.x
		const originYFlipped = -6 - this.y

		// draw lines
		
		Ramu.ctx.drawImage(img, hline.x, hline.y, hline.width, hline.height, this.x + size, this.y, this.width - size * 2, size)
		Ramu.ctx.drawImage(img, hline.x, hline.y, hline.width, hline.height, this.x + size, this.y + this.height - size, this.width - size * 2, size)
		Ramu.ctx.drawImage(img, vline.x, vline.y, vline.width, hline.height, this.x, this.y + size, size, this.height - size * 2)
		Ramu.ctx.drawImage(img, vline.x, vline.y, vline.width, hline.height, this.x + this.width - size, this.y + size, size, this.height - size * 2)
	
		// draw inner coners
		
		Ramu.ctx.drawImage(img, ulJoint.x, ulJoint.y, ulJoint.width, ulJoint.height, this.x, this.y, size, size)
		
		Ramu.restoreAfter( () => {
			Ramu.ctx.scale(-1, 1)
			Ramu.ctx.drawImage(img, ulJoint.x, ulJoint.y, ulJoint.width, ulJoint.height, originXFlipped - this.width + size, this.y, size, size)
		})
		Ramu.restoreAfter( () => {
			Ramu.ctx.scale(1, -1)
			Ramu.ctx.drawImage(img, ulJoint.x, ulJoint.y, ulJoint.width, ulJoint.height, this.x, originYFlipped - this.height + size, size, size)
		})
		Ramu.restoreAfter( () => {
			Ramu.ctx.scale(-1, -1)
			Ramu.ctx.drawImage(img, ulJoint.x, ulJoint.y, ulJoint.width, ulJoint.height, originXFlipped - this.width + size, originYFlipped - this.height + size, size, size)
		})
	}

	_drawSubmenuIcon(item) {
		const cursor = this.params.cursorRect
		if (this.#childMenus[item.text])
			Ramu.ctx.drawImage(
				this.params.img,
				cursor.x, 
				cursor.y, 
				cursor.width, 
				cursor.height, 
				item.screenPos.x + item.screenPos.width - cursor.width - this.params.padding, 
				item.screenPos.y + item.screenPos.height - cursor.height - this.params.padding, 
				cursor.width, cursor.height)
	}

	_drawItemWindow(item, index) {
		const winRect = this.active 
						? this.cursor + this.firstItemToDrawn == index 
							? this.params.normalBg 
							: this.params.selectedBg
						: this.params.inactiveBg
	
		// if (Ramu.debugMode) {
			// Ramu.ctx.strokeStyle = 'red'
			Ramu.ctx.strokeRect(item.screenPos.x, item.screenPos.y, item.screenPos.width, item.screenPos.height)
		// }
		
		Ramu.ctx.drawImage(this.params.img,
			winRect.x, winRect.y, winRect.width, winRect.height,
			item.screenPos.x, item.screenPos.y, item.screenPos.width, item.screenPos.height)
	}

	_drawItemName(item, index) {
		Ramu.ctx.textBaseline = 'top'
		Ramu.ctx.fillStyle = 'white'
		const w = Ramu.ctx.measureText('M').width

		if (!item.active)
			Ramu.ctx.fillStyle = 'gray'
		else if (this.cursor + this.firstItemToDrawn == index)
			Ramu.ctx.fillStyle = '#2fadf5'
		Ramu.ctx.fillText(item.text, item.screenPos.x + w , item.screenPos.y + w/2)
	}

	draw() { // this class do not inherits from Drawable, this will be called in MenuManager
		if (!this.visible) // remove this?
			return

		Ramu.ctx.imageSmoothingEnabled = false
		if (Ramu.debugMode) {
			Ramu.ctx.strokeStyle = 'green'
			Ramu.ctx.strokeRect(this.x, this.y, this.width, this.height)
		}
		
		if (!this.#packed) // do NOT draw even with itens availables since the position wasn't calculated yet
			return
		
		if (this.cursor > this.columns + this.lines && this.itens.length > this.cursor) {
			let d
		}
		// Fill the item list with empty values if the number of actual items are lesser than the space available in the window
		let itens //= this.#menuItens.length < this.lines * this.columns
					 // ? this.#menuItens.slice(this.firstItemToDrawn).concat(this.#fillItens)
					 // : this.#menuItens
		if (this.#menuItens.length > this.lines * this.columns&& this.cursor + this.firstItemToDrawn > this.lines * this.columns) {
			itens = this.#menuItens.slice(this.firstItemToDrawn).concat(this.#fillItens)
		} else {
			itens = this.#menuItens
		}
		// Get all the items stating in firstItemToDrawn and fill the the empty spaces
		// if (this.#menuItens.length -1 > this.lines * this.columns)
			// console.log("oi")
		//itens = this.#menuItens.length -1 > this.lines * this.columns
			//		 ? this.#menuItens.slice(this.firstItemToDrawn).concat(this.#fillItens)
				//	 : itens
		
		let index = this.firstItemToDrawn
		for (let item of itens) {
			if (!item.screenPos)
				continue // TODO gambs enquanto eu não desenho na tela
			this._drawItemWindow(item, index)
			this._drawSubmenuIcon(item)		
			this._drawItemName(item, index)
				
			index++
		}
		
		this._drawWindow()
	}
}
