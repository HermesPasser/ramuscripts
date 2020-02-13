'use strict';

// ---------------------------------- //
// Ramu 0.7 - Hermes Passer           //
//      hermespasser.github.io        //
// blog: gladiocitrico.blogspot.com   //
// ---------------------------------- //

// para caso alguma func seja chamada no mesmo frame que o start
// criar um callnextframe para ela ser chamada apos o start 
// para não quebrar tudo

const keyCode = {
	a:    65, b:    66, c:    67, d:    68, e:    69, f:    70, g:    71, h:    72, i:    73, j:    74, 
	k:    75, l:    76, m:    77, n:    78, o:    79, p:    80, q:	  81, r:    82, s:    83, t:    84,
	u:    85, v:    86, w:    87, x:    88, y:    89, z:    90, 
	num0: 48, num1: 49, num2: 50, num3: 51, num4: 52, num5: 53, num6: 54, num7: 55, num8: 56, num9: 57, 
	
	numpad0: 96,  numpad1: 97,  numpad2: 98,  numpad3: 99,  numpad4: 100, numpad5: 101, numpad6: 102, numpad7: 103, 
	numpad8: 104, numpad9: 105,

	space: 32,
	
	f1: 112, f2: 113, f3: 114, f4: 115, f5: 116, f6: 117, f7: 118, f8: 119, f9: 120, f10: 121, f11: 122, f12: 123,
	
	left_arrow: 37, up_arrow: 38, right_arrow: 39, down_arrow: 40, backspace: 8, tab: 9, enter: 13, shift: 16, 
	
	capslock: 20, numlock: 144, scrolllock: 145, left_window_key: 91, right_window_key: 92, 
	
	open_bracket: 219, close_braket: 221, ctrl: 17, alt: 18, end: 35, home: 36, insert: 45, delete: 46, select: 93, pause_break: 19, 
	
	escape: 27, page_up: 33, page_down: 34, multiply: 106, add: 107, subtract: 109, decimal_point: 110, divide: 111, semi_colon: 186, 

	equal_sign: 187, comma: 188, dash: 189, period: 190, forward_slash: 191, back_slash: 220, grave_accent: 192, single_quote: 222
};
//Ramu.Rect = 
class Rect{	
	constructor(x, y, w, h){
		if (arguments.length != 4) throw new Error('ArgumentError: Wrong number of arguments');
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}
	
	static hasNegativeValue(rect){
		return Rect.hasNegativeValueInXY(rect) || Rect.hasNegativeValueInWH(rect);
	}
	
	static hasNegativeValueInXY(rect){
		return rect.x < 0 || rect.y < 0;
	}
	
	static hasNegativeValueInWH(rect){
		return rect.width < 0 || rect.height < 0;
	}
}

// ============ RAMU DECLARATION 0.7 - 2018-08-25 ============ //

class Ramu{
	/// Prevents creating an instance of this class.
	constructor(){
		throw new Error('This is a static class');
	}
	
	static get width(){
		if (Ramu.canvas)
			return Ramu.canvas.width;
		return 0;
	}

	static get height(){
		if (Ramu.canvas)
			return Ramu.canvas.height;
		return 0;
	}
	
	static get VERSION() {
		return '0.7c';
	}
}


Ramu.callDestroy	   = false;
Ramu.callSortUpdate    = false;
Ramu.callSortDraw 	   = false;
Ramu.callSortCollision = false;

Ramu.debugMode  = false;
Ramu.inLoop 	= true;

Ramu.canvas = document.createElement('canvas');
Ramu.ctx = Ramu.canvas.getContext('2d');

Ramu.time = {last: 0, delta: 1/60, frameTime: 0};

/// Init the Ramu and the main loop.
Ramu.init = function(width = 500, height = 500, parentNode = null){
	Ramu.canvas.width  = width;
	Ramu.canvas.height = height;

	const exception = () => { throw new Error('No body tag found.'); };
	(parentNode || document.body || exception()).appendChild(Ramu.canvas);
	
	Ramu.callSortUpdate    = false;
	Ramu.callSortDraw 	   = false;
	Ramu.callSortCollision = false;
	
	Ramu.debugMode = false;
	Ramu.inLoop = true;
	
	// Deltatime is actually a timestep and frametime is originally the delta time,
	// change of terms exists for timestep be used instead of delta (frametimne)
	Ramu.time = { last: Date.now(), delta: 1/60, frameTime: 0 };
	
	Ramu.input();
	window.requestAnimationFrame(Ramu.loop);
}

// ============ RAMU INPUT 1.7 - 2018-10-28 ============ //

Ramu.pressedKeys	 = {};
Ramu.clickedPosition = {};
Ramu.mousePosition   = { X: 0, Y: 0};

/// Start all input events listeners
Ramu.input = function(){

	function _getMousePosition(event){
		const bound = Ramu.canvas.getBoundingClientRect();
		return {
			// previously used bound.left/bound.top but it not work well when the canvas is distorced.
			X: event.clientX - bound.x - Ramu.canvas.clientLeft,
			Y: event.clientY - bound.y - Ramu.canvas.clientTop
		}
	}
	
	function _key(){
		class KeyData{
			constructor() {
				this.pressed = false;
				this.released = false;
				this.repeated = false;
			}
		}

		Ramu.pressedKeys = {}; 

		document.body.addEventListener('keydown', e => {	
			let pressedKey = Ramu.pressedKeys[e.keyCode];
			if (pressedKey == void(0))
				pressedKey = new KeyData();
					
			pressedKey.released = false;
			pressedKey.pressed = true;
			Ramu.pressedKeys[e.keyCode] = pressedKey
		}, false);
		
		document.body.addEventListener('keyup', e => {
			let pressedKey = Ramu.pressedKeys[e.keyCode];
			if (pressedKey == void(0))
				pressedKey = new KeyData();
						
			pressedKey.repeated = false;
			pressedKey.pressed = false;
			pressedKey.released = true;
			Ramu.pressedKeys[e.keyCode] = pressedKey
		}, false);
	}
	
	function _click(){
		Ramu.clickedPosition = {};
		Ramu.canvas.addEventListener('click', event => {
			// esse metodo não é tão bom, clicar apos deixar a aba ativa gerara isso a ser chamado varias vezes num mesmo clique
			Ramu.clickedPosition = _getMousePosition(event);
		});
	}
	
	function _mouseMove(){
		Ramu.canvas.addEventListener('mousemove', event => {
			Ramu.mousePosition = _getMousePosition(event);
		}); 
	}
	
	_key();
	_click();
	_mouseMove();
}

Ramu.onKeyUp = function(key) {
	if (typeof(key) === 'string')
		key = keyCode[key.toLowerCase()];	
	
	const keyData = Ramu.pressedKeys[key];
	if (keyData)
		return keyData.released;
	
	return false;
}

Ramu.onKeyDown = function(key) {
	if (typeof(key) === 'string')
		key = keyCode[key.toLowerCase()];	
	
	const keyData = Ramu.pressedKeys[key];
	if (keyData)
		return keyData.pressed && !keyData.repeated;
	
	return false;
}

Ramu.isPressed = function(key) {
	if (typeof(key) === 'string') // if 'key' is the key name instead of key code
		key = keyCode[key.toLowerCase()];
		
	const keyData = Ramu.pressedKeys[key];
	if (keyData)
		return keyData.pressed;
	
	return false;
}

Ramu._clearInput = function(){	
	for(const i in Ramu.pressedKeys) {
		Ramu.pressedKeys[i].released = false;
		
		if (Ramu.pressedKeys[i].pressed)
			Ramu.pressedKeys[i].repeated = true;
	}
	
	Ramu.clickedPosition = {};
}

// ============ RAMU GAME LOOP 0.7 - 2018-11-13 ============ //

Ramu.gameObjs	    = [];
Ramu.objsToDraw 	= [];
Ramu.objsToCollide  = [];

Ramu.updateLastPriority    = 0;
Ramu.drawLastPriority	   = 0;
Ramu.collisionLastPriority = 0;


/// Game loop of Ramu.
Ramu.loop = function(){	
	function _updateSteps(){
		// Panic | from isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
		let numUpdateSteps = 0;
		if (++numUpdateSteps >= 240) {
			Ramu.time.frameTime = 0;
			console.warn("Panic.")
			return true;
		}
		return false;
	}
	
	let now = 0;
	if (Ramu.inLoop){		
		now = Date.now();
		Ramu.time.frameTime = Ramu.time.frameTime + Math.min(1, (now - Ramu.time.last) / 1000);
	
		while(Ramu.time.frameTime > Ramu.time.delta) {
			
			Ramu.start();
			Ramu.checkCollision();	
			Ramu.update();
			Ramu.garbageCollector();
			Ramu.time.frameTime = Ramu.time.frameTime - Ramu.time.delta;
			
			if (_updateSteps()); // if it return true so is panic then stop the loop
				break;
		}
	}
	
	Ramu.draw();
	Ramu._clearInput();
	
	if (Ramu.inLoop) Ramu.time.last = now;
	window.requestAnimationFrame(Ramu.loop);
}

// ============ RAMU MAIN ENGINE 0.7 - 2018-8-30 ============ //

Ramu._canUpdate = function(gameobj){
	return gameobj._start_was_called && gameobj.canUpdate && !gameobj.canDestroy;
}

/// Executes all start methods of all Ramu.gameObjs in the game.
Ramu.start = function(){
	for (var i = 0; i < Ramu.gameObjs.length; ++i){
		let obj = Ramu.gameObjs[i];
		
		if (obj._start_was_called) // If this was defined then start already was called, so skip it
			continue;
		
		obj._start_was_called = true;
		obj.start();
	}
}

/// Update all Ramu.gameObjs in the game.
Ramu.update = function(){
	function _sortUpdate(){
		if (Ramu.callSortUpdate){
			Ramu.callSortUpdate = false;
			GameObj.sortPriority();
		}
	}
	
	_sortUpdate();
	for (var i = 0; i < Ramu.gameObjs.length; ++i){
		let obj = Ramu.gameObjs[i];
		
		if (Ramu._canUpdate(obj)){
			obj.update();
		}
	}
}

/// Check all collisions in the game.
Ramu.checkCollision = function(){
	function _sortCollision(){
		if (Ramu.callSortCollision){
			Ramu.callSortCollision = false;
			Collider.sortPriority();
		}
	}
	
	_sortCollision();
	for (var i = 0; i < Ramu.objsToCollide.length; ++i){
		let obj = Ramu.objsToCollide[i];
		
		if (Ramu._canUpdate(obj)){
			obj.checkCollision();
		}
	}
}

/// Executes all draw methods of all Ramu.gameObjs in the game.
Ramu.draw = function(){
	function _sortDraw (){
		if (Ramu.callSortDraw){
			Ramu.callSortDraw = false;
			Drawable.sortPriority();
		}
	}
	
	_sortDraw();
	Ramu.ctx.imageSmoothingEnabled = true; // reset the defaut value
	Ramu.ctx.clearRect(0, 0, Ramu.width, Ramu.height);
		
	for (var i = 0; i < Ramu.objsToDraw.length; ++i){
		let obj = Ramu.objsToDraw[i];
		
		if (Ramu._canUpdate(obj)){
			if (obj.drawOutOfCanvas || Ramu.Utils.isInsideOfCanvas(obj)){
				obj.drawInCanvas();
			}
		}
	}
}

// ============ RAMU DESTROY 0.7 - 2018-11-13 ============ //


Ramu.garbageCollector = function(){
	function _destroyGameObj(){
		for (let i = Ramu.gameObjs.length - 1; i >= 0; --i){
			let obj = Ramu.gameObjs[i];
			if (Ramu.gameObjs[i].canDestroy){
				
				// To not call these loops when is not needed.
				if (obj instanceof Drawable)
					Ramu._destroyDrawableIsNeed = true;
				
				if (obj instanceof Collider)
					Ramu._destroyColliderIsNeed = true;
				
				Ramu.gameObjs.splice(i, 1);
			}		
		}	
	}

	function _destroyDrawable(){
		if (!Ramu._destroyDrawableIsNeed)
			return;

		for (let i = Ramu.objsToDraw.length - 1; i >= 0; --i){
			if (Ramu.objsToDraw[i].canDestroy){
				Ramu.objsToDraw.splice(i, 1);
			}
		}
	}

	function _destroyCollider(){
		if (!Ramu._destroyColliderIsNeed)
			return;

		for (let i = Ramu.objsToCollide.length - 1; i >= 0; --i){
			if (Ramu.objsToCollide[i].canDestroy){
				Ramu.objsToCollide.splice(i, 1);
			}
		}
	}
	
	Ramu._destroyDrawableIsNeed = false;
	Ramu._destroyColliderIsNeed = false;

	if (Ramu.callDestroy){
		Ramu.callDestroy = false;
		_destroyGameObj();
		_destroyDrawable();
		_destroyCollider();
	}
}

// ============ RAMU MATH 1.7 - 2018-06-30 ============ //

Ramu.Math = class Math{
	/// Prevents creating an instance of this class.
	constructor(){
		throw new Error('This is a static class');
	}
	
	static distance(gameObjectA, gameObjectB){
		let x = Math.pow(gameObjectA.x - gameObjectB.x, 2),
			y = Math.pow(gameObjectA.y - gameObjectB.y, 2);
		return Math.sqrt(x + y, 2);
	}
	
	static overlap(rect1, rect2) {
		return(rect1.x < rect2.x + rect2.width &&
			   rect1.x + rect1.width > rect2.x &&
			   rect1.y < rect2.y + rect2.height &&
			   rect1.height + rect1.y > rect2.y);
	}
}

// ============ RAMU UTILS 1.7 - 2018-07-10 ============ //

Ramu.Utils = class Utils{
	constructor(){
		throw new Error('This is a static class');
	}
	
	/// Get a image from the source
	static getImage(src){
		let img = new Image();
		img.src = src;
		return img;
	}
	
	// Move to RamuAudio soon
	static playSound(sound, volume = null){
		if (volume != null)
			sound.volume = volume;
		
		const playPromise = sound.play();
		if (playPromise !== null){
			
			playPromise.catch( () => { 
				sound.play();
			});
		}
	}
	
	/// Check if image is loaded
	static imageIsLoaded(img){
		if (!(img instanceof Image)) return false;
		return img.complete && img.naturalWidth !== 0 && img.naturalHeight !== 0;
	}
	
	/// Check if the gameObject position (x,y) is out of the canvas
	static isOutOfCanvas(gameObject){ // canvas rect starts at 0 and ends at canvas.size - 1
		return gameObject.x < 0 || gameObject.x >= Ramu.canvas.width ||
			   gameObject.y < 0 || gameObject.y >= Ramu.canvas.height;
	}
	
	/// Check if the part of gameObject size (x,y,w,h) is inside of the canvas
	static isInsideOfCanvas(gameObject){ // canvas rect starts at 0 and ends at canvas.size - 1
		return (gameObject.x + gameObject.width) >= 0  && 
				gameObject.x < Ramu.width  &&
				(gameObject.y + gameObject.height) >= 0 &&
				gameObject.y < Ramu.height;	   
	}
	
	/// Check if object/hash is empty
	static isEmpty(obj){
		for(var key in obj)
			return false;
		return true;
	}
	
	/// Used in ramu internal to throw erros
	static CustomTypeError(instance, classToCompare){
		// esse keys é inutil pois ele retorna a palavra instance e não o nome da variavel que passei no metodo
		// criar um outro método só para converter para string e passar como parametro aqui
		return new Error("TypeError: " + Object.keys({instance})[0] + ' must be a ' + classToCompare.name + ' instance.');
	}
}

class GameObj{	
	constructor(x = 0, y = 0, w = 0, h = 0){
		if (arguments.length > 4) throw new Error('ArgumentError: Wrong number of arguments');

		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.tag =  this.tag || "none";
		this.updatePriority = ++Ramu.updateLastPriority;
		this.canUpdate = true;
		this.canDestroy = false;
		
		GameObj.addObjt(this);
	}
	
	static addObjt(obj){
		if (!obj instanceof GameObj)
			throw new Error("'obj' is not a GameObj instance.");
		Ramu.gameObjs.push(obj);
		Ramu.callSortUpdate = true;
	}
	
	static sortPriority(){
		for (let i = 0; i < Ramu.gameObjs.length; ++i){
			for (let j = i + 1; j < Ramu.gameObjs.length; ++j){
				if (Ramu.gameObjs[i].updatePriority > Ramu.gameObjs[j].updatePriority){
					let temp =  Ramu.gameObjs[i];
					Ramu.gameObjs[i] = Ramu.gameObjs[j];
					Ramu.gameObjs[j] = temp;
				}
			}
		}
	}
	
	toRect(){
		return new Rect(this.x, this.y, this.width, this.height);
	}
	
	setActive(bool){
		if (!(typeof(bool) === 'boolean')) throw Ramu.Utils.CustomTypeError(bool, Boolean);
		this.canUpdate = bool;
	}
	
	destroy(){
		if (!this._start_was_called){	
			console.warn(`Forcing update call of ${this.toString()}.`); // "The update was not called yet,")
			this.start(); // return false;	
		}
		
		this.setActive(false);
		this.canDestroy = true;
		Ramu.callDestroy = true;
	}
	
	// TODO: Looks like is unstable, try in other browser to see it works? 
	toString(){
		return `<${this.constructor.name}#${this.tag}>`;
	}
	
	/// Virtual start to be inherited.
	start() { }
	
	/// Virtual update to be inherited.
	update() { }
}

class Drawable extends GameObj{
	constructor(x, y, width, height, canDraw = false){
		super(x, y, width, height);
		if (arguments.length < 4) throw new Error('ArgumentError: Wrong number of arguments');
		this.canDraw = canDraw;
		this.drawPriority     = ++Ramu.drawLastPriority;
		this.flipHorizontally = false;
		this.flipVertically   = false;
		this.drawOutOfCanvas  = false;
		this.opacity = 1;
		Drawable.addObjt(this)
	}
	
	static addObjt(drawableObj){
		if (!drawableObj instanceof Drawable)
			throw new Error("'drawableObj' is not a Drawable instance.");
		Ramu.objsToDraw.push(drawableObj);
		Ramu.callSortDraw = true;
	}
	
	static sortPriority(){
		for (let i = 0; i < Ramu.objsToDraw.length; ++i){
			for (let j = i + 1; j < Ramu.objsToDraw.length; ++j){
				if (Ramu.objsToDraw[i].drawPriority > Ramu.objsToDraw[j].drawPriority){
					let temp =  Ramu.objsToDraw[i];
					Ramu.objsToDraw[i] = Ramu.objsToDraw[j];
					Ramu.objsToDraw[j] = temp;
				}
			}
		}
	}
	
	drawInCanvas(){	
		if (this.canDraw){

			Ramu.ctx.globalAlpha = this.opacity;
		
			// To flip anything that is drawn (the position need be recalculated in draw() method).
			if (this.flipHorizontally || this.flipVertically){
				Ramu.ctx.save();
				Ramu.ctx.scale(this.flipHorizontally ? -1 : 1, this.flipVertically ? -1 : 1);
			}
			
			this.draw();
			
			if (this.flipHorizontally || this.flipVertically)
				Ramu.ctx.restore();
		}
	}
	
	/// Virtual draw to be inherited.
	draw(){ }
}

class Collider extends Drawable{
	constructor(x, y, width, height){
		super(x, y, width, height);
		if (arguments.length != 4) throw new Error('ArgumentError: Wrong number of arguments');
		this.canCollide = true;
		this.collision = [];
		this.collisionPriority = ++Ramu.collisionLastPriority;

		Collider.addObjt(this);
	}
	
	static addObjt(colObj){
		if (!colObj instanceof Collider) 
			throw new Error("'colObj' is not a Collider instance.");
		Ramu.objsToCollide.push(colObj);
		Ramu.callSortCollision = true;
	}
	
	static sortPriority(){
		for (let i = 0; i < Ramu.objsToCollide.length; ++i){
			for (let j = i + 1; j < Ramu.objsToCollide.length; ++j){
				if (Ramu.objsToCollide[i].collisionPriority > Ramu.objsToCollide[j].collisionPriority){
					let temp =  Ramu.objsToCollide[i];
					Ramu.objsToCollide[i] = Ramu.objsToCollide[j];
					Ramu.objsToCollide[j] = temp;
				}
			}
		}
	}
	
	update(){
		this.canDraw = Ramu.debugMode;
	}
	
	get isInCollision(){ 
		return this.collision.length != 0; 
	}
	
	/// Virtual onCollision to be inherited.
	onCollision(){ }

	checkCollision(){
		if(!this.canCollide) return;
		
		this.collision = [];
		for (let i = 0; i < Ramu.objsToCollide.length; ++i){
			let obj = Ramu.objsToCollide[i];
			
			if (obj === this || !obj.canCollide || !obj.canUpdate)
				continue;
			
			let rect1 = new Rect(this.x, this.y, this.width, this.height);
			let rect2 = new Rect(obj.x, obj.y, obj.width, obj.height);
			
			if (Ramu.Math.overlap(rect1, rect2)){
				obj.collision.push(this);
				this.collision.push(obj);
				this.onCollision();
			}
		}
	}
}

class SimpleRectCollider extends Collider{	
	start() {
		super.start()
		this.canDraw = true
	}
	draw(){
		if (Ramu.debugMode){
			if (this.canCollide)
				if (this.isInCollision)
					Ramu.ctx.strokeStyle = "red";
				else Ramu.ctx.strokeStyle = "blue";	
			else Ramu.ctx.strokeStyle = "green";

			Ramu.ctx.strokeRect(this.x, this.y, this.width, this.height);
			Ramu.ctx.strokeStyle = "#000000"; // reset to default value
		}
	}
}

class Raycast extends Collider{
	constructor(){
		super(1, 1, 1, 1);
		this.started = false;
		this.abort();
	}

	onRaycastEnd(){} // Virtual
	
	init(initX, initY, velocityX, velocityY, lifeTime){
		if (arguments.length != 5) throw new Error('ArgumentError: Wrong number of arguments');

		// To call onRaycastEnd when was aborted
		if (this.started)
			this.onRaycastEnd();
		
		this.x = initX;
		this.y = initY;
		this.initX = initX;
		this.initY = initY;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.lifeTime = lifeTime;
		this.currentTime = 0;
		this.started = true;
	}
	
	abort(){
		this.currentTime = 0;
		this.started = false;
	}
	
	update(){
		if (this.started && this.currentTime >= this.lifeTime){			
			this.onRaycastEnd();
			this.abort();
		}
	
		if (!this.started || this.currentTime >= this.lifeTime)
			return;
		
		if (this.started){			
			super.update();
					
			this.currentTime += Ramu.time.delta;
			this.x += this.velocityX * Ramu.time.delta;
			this.y += this.velocityY * Ramu.time.delta;
		}
	}
	
	draw(){
		if (this.canCollide)
			if (this.isInCollision)
				Ramu.ctx.strokeStyle = "red";
			else Ramu.ctx.strokeStyle = "blue";	
		else Ramu.ctx.strokeStyle = "green";
			
		Ramu.ctx.beginPath();
		Ramu.ctx.moveTo(this.x, this.y);
		Ramu.ctx.lineTo(this.initX, this.initY);
		Ramu.ctx.stroke();

		Ramu.ctx.strokeStyle = "#000000"; // reset to default value
	}
}

/// Displays an entire image
class Sprite extends Drawable{
	constructor(img, x, y, w, h, canDraw = true){
		super(x, y, w, h);
		if (arguments.length < 5) throw new Error('ArgumentError: Wrong number of arguments');
		if (!(img instanceof Image)) throw Ramu.Utils.CustomTypeError(img, Image);

		this.img = img;
		this.canDraw = canDraw;	
	}
	
	draw(){
		let originX = this.flipHorizontally ? -this.width - this.x : this.x;
		let originY = this.flipVertically   ? -this.height - this.y : this.y;
		
		if (!Ramu.Utils.imageIsLoaded(this.img)){
			Ramu.ctx.fillRect(originX, originY, this.width, this.height); // Draw a black rect instead of image
			return;
		}
		
		//if (this.canDraw)
		Ramu.ctx.imageSmoothingEnabled = false;
		Ramu.ctx.drawImage(this.img, originX, originY, this.width, this.height);
	}
}

/// Displays a region (sprite sheet) of an image
class Spritesheet extends Drawable{
	constructor(image, sheetRect, x, y, w, h, canDraw = true){
		super(x, y, w, h);
		if (arguments.length < 6) throw new Error('ArgumentError: Wrong number of arguments');
		if (!(image instanceof Image)) throw Ramu.Utils.CustomTypeError(image, Image);

		this.img = image;
		this.setSheet(sheetRect);
		this.canDraw = canDraw;	
	}
	
	setSheet(sheetRect){
		if (!(sheetRect instanceof Rect)) throw Ramu.Utils.CustomTypeError(sheetRect, Rect);

		this.sheet = sheetRect;
	}
	
	setPosition(x, y){
		// why parsefloat? parseint isn't better since it is manipulating a canvas array?
		this.x = parseFloat(x);
		this.y = parseFloat(y);
	}
	
	draw(){					
		let originX = this.flipHorizontally ? -this.width - this.x : this.x;
		// does not work
		let originY = this.flipVertically   ? -this.height - this.y : this.y;

		if (!Ramu.Utils.imageIsLoaded(this.img)){
			Ramu.ctx.fillRect(originX, originY, this.width, this.height); // Draw a black rect instead of image
			return;
		}
		
		Ramu.ctx.imageSmoothingEnabled = false;
		Ramu.ctx.drawImage(this.img, this.sheet.x, this.sheet.y, this.sheet.width, this.sheet.height, 
					originX, originY, this.width, this.height);
	}
}

/// Displays an animation that uses various images
class SpriteAnimation extends Drawable{
	constructor(x, y, width, height){
		super(x, y, width, height, true);
		if (arguments.length != 4) throw new Error('ArgumentError: Wrong number of arguments');
		this.frames 		 = [];
		this.currentFrame 	 = 0;
		this.currentTime 	 = 0;
		this.animationTime 	 = 2;
		this.animationPause  = false;
		this.animationIsOver = false;
		this.playInLoop 	 = true;
	}
	
	addFrame(img){ 
		if(void 0 === img || arguments.length != 1)
			throw new Error('ArgumentError: Wrong number of arguments');
		
		if(Array.isArray(img)){
			for (let i = 0, len = img.length; i < len; ++i) {
				const currImg = img[i];
				if(!currImg instanceof Image)
					throw Ramu.Utils.CustomTypeError(img, img);
				
				this.frames.push(currImg);
			}
			return;
		} else if(img instanceof Image){
			if(!img instanceof Image)
				throw Ramu.Utils.CustomTypeError(img, img);
			
			this.frames.push(img);
			return;
		}

		throw Ramu.Utils.CustomTypeError(img, Image);
	}
	
	reset(){
		this.animationIsOver = false;
		this.currentFrame = 0;
		this.currentTime  = 0;
	}
	
	update(){
		const len = this.frames.length;
		if (this.animationPause) return;
		if (this.currentFrame == len - 1){
			this.animationIsOver = true;
			if (!this.playInLoop) return;
			
		} else this.animationIsOver = false;
		
		this.currentTime += Ramu.time.delta;
		if (len > 0 && this.currentTime > this.animationTime){ 
			this.currentFrame = (this.currentFrame + 1) % len;
			this.currentTime = 0;
		} 
	}
		
	draw(){
		let originX = this.flipHorizontally ? -this.width - this.x : this.x;
		let originY = this.flipVertically   ? -this.height - this.y : this.y;
		
		if (this.frames.length > 0){
			if (!Ramu.Utils.imageIsLoaded(this.frames[this.currentFrame])){
				Ramu.ctx.fillRect(originX, originY, this.width, this.height); // Draw a black rect instead of image
				return;
			}
			
			Ramu.ctx.imageSmoothingEnabled = false;
			Ramu.ctx.drawImage(this.frames[this.currentFrame], originX, originY, this.width, this.height);
		}
	}
}

// se eu colocar para ele se mexer em x ou y com algum valor que nao seja inteiro
// e ele tiver setado para girar o sprite em vertical ou horizontal
// ele desenha parte fora do sprite
// isso acontece mesmo se a animação tiver um frame

/// Displays an animation that uses various sprite sheets of a single image
class SpritesheetAnimation extends SpriteAnimation{
	constructor(img, x, y, width, height){
		super(x, y, width, height);
		if (arguments.length != 5) throw new Error('ArgumentError: Wrong number of arguments');
		if (!(img instanceof Image)) throw Ramu.Utils.CustomTypeError(img, Image);

		this.img = img;
	}
	
	addFrame(rect){
		// multi frame support by github.com/Kawtmany
		if(void 0 === rect || arguments.length != 1)
			throw new Error('ArgumentError: Wrong number of arguments');
		
		if(Array.isArray(rect)){
			for (let i = 0, len = rect.length; i < len; ++i){
				const r = rect[i];
				
				if(!r instanceof Rect)
					throw Ramu.Utils.CustomTypeError(rect, rect);
				
				if (Rect.hasNegativeValueInXY(r))
					throw new Error('ArgumentOutOfRangeError: The rect position cannot be negative.');
				
				this.frames.push(r);			
			}
			
			return;
		} else if(rect instanceof Rect){
			if(!rect instanceof Rect)
				throw Ramu.Utils.CustomTypeError(rect, rect);
			
			if (Rect.hasNegativeValueInXY(rect))
				throw new Error('ArgumentOutOfRangeError: The rect position cannot be negative.');
			
			this.frames.push(rect);
			return;
		}

		throw Ramu.Utils.CustomTypeError(rect, rect);
	}
	
	draw(){
		// o problema deve estar aqui
		let originX = this.flipHorizontally ? -this.width - this.x : this.x;
		let originY = this.flipVertically   ? -this.height - this.y : this.y;
		let rect    = this.frames[this.currentFrame];
		
		if (Ramu.Utils.imageIsLoaded(this.img) && rect && (rect.width > this.img.width || rect.height > this.img.height))
			throw new Error('The rect size cannot be greater than the image size.');

		//Draw
		if (this.frames.length > 0){
			if (!Ramu.Utils.imageIsLoaded(this.img)){
				Ramu.ctx.fillRect(originX, originY, this.width, this.height); // Draw a black rect instead of image
				return;
			}	
			
			Ramu.ctx.imageSmoothingEnabled = false;
			Ramu.ctx.drawImage(this.img, 
								rect.x, 
								rect.y, 
								rect.width, 
								rect.height, 
								originX, 
								originY, 
								this.width, 
								this.height);	
		}
	}
}

class Animator extends GameObj{
	constructor(x, y, width, height){
		super(x, y, width, height);
		if (arguments.length != 4) throw new Error('ArgumentError: Wrong number of arguments');
		
		this.anim = {};
		this.animDrawPriority = Ramu.drawLastPriority++;
		this.currentID = "";
	}
	
	// to replace the old one that will be depreciated
	set canDraw(bool){
		this.setCanDraw(bool);
	}

	get X(){
		return this.x;
	}

	set X(num){
		// instead i can just set the this.x and leave to set the this.anim[key].x on the setCurrentAnimation
		for (const key in this.anim)
			this.anim[key].x = num
		this.x = num;
	}
	
	get Y(){
		return this.y;
	}

	set X(num){
		// instead i can just set the this.y and leave to set the this.anim[key].y on the setCurrentAnimation
		for (const key in this.anim)
			this.anim[key].y = num
		this.y = num;
	}
	
	setCanDraw(bool){
		if (!(typeof(bool) === 'boolean')) throw Ramu.Utils.CustomTypeError(bool, Boolean);
		this.anim[this.currentID].canDraw = bool;
	}
	
	setDrawPriority(integer){
		if (arguments.length != 1) throw new Error('ArgumentError: Wrong number of arguments');

		for (const key in this.anim)
			this.anim[key].drawPriority = parseInt(integer);
	}
	
	addAnimation(nameID, spritesheetAnimation){
		if (arguments.length != 2) throw new Error('ArgumentError: Wrong number of arguments');
		// if (!(nameID instanceof String)) throw Ramu.Utils.CustomTypeError(nameID, String);
		if (!(spritesheetAnimation instanceof SpriteAnimation)) throw Ramu.Utils.CustomTypeError(spritesheetAnimation, SpritesheetAnimation);

		spritesheetAnimation.x = this.x;
		spritesheetAnimation.y = this.y;
		spritesheetAnimation.canDraw = false;
		spritesheetAnimation.drawPriority = this.animDrawPriority;
		Ramu.callSortDraw = true;
		this.anim[nameID] = spritesheetAnimation;
	}
	
	setCurrentAnimation(nameID){
		if (arguments.length != 1) throw new Error('ArgumentError: Wrong number of arguments');

		this.currentID = nameID;
		for (const key in this.anim)
			this.anim[key].canDraw = false;
		
		if (this.anim[key] != null)
			this.anim[nameID].canDraw = true;
	}
	
	getAnimation(id){
		return this.anim[id];
	}

	getCurrentAnimationID(){
		for (const key in this.anim)
			if (this.anim[key].canDraw)
				return key;
		return null;		
	}
	
	setFlipHorizontally(bool){
		if (!(typeof(bool) === 'boolean')) throw Ramu.Utils.CustomTypeError(bool, Boolean);

		for (const key in this.anim)
			this.anim[key].flipHorizontally = bool;
	}
	
	setFlipVertically(bool){
		if (!(typeof(bool) === 'boolean')) throw Ramu.Utils.CustomTypeError(bool, Boolean);

		for (const key in this.anim)
			this.anim[key].flipVertically = bool;
	}
	
	setX(x){
		this.x = x;
		for (const key in this.anim)
			this.anim[key].x = x;
	}
	
	setY(y){
		this.y = y;
		for (const key in this.anim)
			this.anim[key].y = y;
	}
	
	setActive(bool){
		super.setActive(bool);
		for(const key in this.anim)
			this.anim[key].setActive(bool);
	}
	
	addX(x){
		this.x += x;
		for (const key in this.anim)
			this.anim[key].x += x;
	}
	
	addY(y){
		this.y += y;
		for (const key in this.anim)
			this.anim[key].y += y;
	}
	
	destroy(){
		super.destroy();
		for (const key in this.anim){
			this.anim[key].destroy();
		}
	}
}

class Clickable extends GameObj{
	constructor(x, y, w, h){
		super(x, y, w, h);
		if (arguments.length != 4) throw new Error('ArgumentError: Wrong number of arguments');
		this.enabled = true;
		this.isInHover = false;
	}
	
	static clickEventExists(){
		return 'click' in document.documentElement;
	}

	update(){
		if (!Clickable.clickEventExists() || !this.enabled)
			return;
		
		this.checkHover();
		this.checkClick();
	}
	
	checkClick(){
		// to add a onClickEnter and a onClickExit will be need add an onmouseup and onmousedown event
		if (!Ramu.clickedPosition.X && !Ramu.clickedPosition.Y)
			return;
		
		let rect = new Rect(Ramu.clickedPosition.X, Ramu.clickedPosition.Y, 1, 1);
		
		if (Ramu.Math.overlap(this.toRect(), rect)){
			if (!this.isClicking)
				this.isClicking = true;
			this.onClick();
		} else {
			this.isClicking = false;
		}
	}
	
	checkHover(){
		let rect = new Rect(Ramu.mousePosition.X, Ramu.mousePosition.Y, 1, 1);
		
		if (Ramu.Math.overlap(this.toRect(), rect)){
			if (!this.isInHover){
				this.isInHover = true;
				this.onHoverEnter();
				return;
			}
		} else {
			if (this.isInHover){
				this.isInHover = false;
				this.onHoverExit();
				return;
			}
		}
		
		if (this.isInHover)
			this.onHoverStay();
	}
	
	/// Virtual to be inherited
	onHoverEnter(){ }
	
	/// Virtual to be inherited
	onHoverStay(){ }
	
	/// Virtual to be inherited
	onHoverExit(){ }
	
	/// Virtual to be inherited
	onClick(){ }
}

/// Abstract superclass of SimpleparentBtnButton and SimpleparentBtnsheetButton
class SimpleButtonBase extends Clickable{
	constructor(x, y, w, h){
		super(x, y, w, h);
		if (arguments.length != 4) throw new Error('ArgumentError: Wrong number of arguments');
		
		this.onClickFunc = null;
		this.onClickFuncIsAdded = false;
		
		this.onHoverEnterFunc = null;
		this.onHoverEnterFuncIsAdded = false;

		this.onHoverExitFunc = null;
		this.onHoverExitFuncIsAdded = false;
		
		// Because there is a delay to go back to previous image, it was no need if it have a onClickEnter/Exit
		this.clicked = false;
		this.timeToCancelClickDrawable = 0.2;
		this.currentTimeToCancel = 0;
	}
	
	get drawableObj(){ } // Virtual
	
	set drawableImage(value) { } // Virtual
	
	get drawableImage() { } // Virtual
	
	get drawableNormal(){ } // Virtual
	
	get drawableHover(){ } // Virtual
	
	get drawableClick(){ } // Virtual
	
	set drawableBeforeClick(value){ } // Virtual
	
	get drawableBeforeClick(){ } // Virtual
	
	start(){
		this.updateEvents();
	}
	
	setRect(rect){
		if (!(rect instanceof Rect)) throw Ramu.Utils.CustomTypeError(rect, Rect);
		
		this.x = rect.x;
		this.drawableObj.x = rect.x;
		this.y = rect.y;
		this.drawableObj.y = rect.x;
	}
	
	setEnabled(bool){
		if (!(typeof(bool) === 'boolean')) throw Ramu.Utils.CustomTypeError(bool, Boolean);
		this.enabled = bool;
		this.drawableObj.enabled = bool;
	}
	
	setOnClick(func){
		if (!(typeof(func) === 'function')) throw Ramu.Utils.CustomTypeError(func, Function);
		this.onClickFunc = func;
		this.onClickFuncIsAdded = true;
	}
	
	setOnHoverEnter(func){
		if (!(typeof(func) === 'function')) throw Ramu.Utils.CustomTypeError(func, Function);
		this.onHoverEnterFunc = func;
		this.onHoverEnterFuncIsAdded = true;
	}
	
	setOnHoverStay(func){
		if (!(typeof(func) === 'function')) throw Ramu.Utils.CustomTypeError(func, Function);
		this.onHoverStay = func;
	}
	
	setOnHoverExit(func){
		if (!(typeof(func) === 'function')) throw Ramu.Utils.CustomTypeError(func, Function);
		this.onHoverExitFunc = func;
		this.onHoverExitFuncIsAdded = true;
	}
	
	_setToHoverImage(){
		this.clicked = false;
		if (this.drawableHover)
			this.drawableImage = this.drawableHover;
	}
	
	_setToClickImage(){
		if (this.drawableClick){
			this.clicked = true;
			this.drawableBeforeClick = this.drawableImage;
			this.drawableImage = this.drawableClick;
			this.currentTimeToCancel = 0;
		}
	}
	
	updateEvents(){
		this.onHoverEnter = function(){
			if (this.onHoverEnterFunc){
				this.onHoverEnterFunc.call(this);
			}
			
			this._setToHoverImage();
		};
		
		this.onHoverExit = function(){
			if (this.onHoverExitFunc){
				this.onHoverExitFunc.call(this);
			}
			
			this.clicked = false;
			this.drawableImage = this.drawableNormal;
		};
		
		this.onClick = function(){
			if (this.onClickFunc){
				this.onClickFunc.call(this);
			}
			
			this._setToClickImage();
		};	
	}
	
	setActive(bool){
		super.setActive(bool);
		this.drawableObj.setActive(bool);
	}
	
	update(){
		super.update();
		
		if (this.clicked){			
			this.currentTimeToCancel += Ramu.time.delta;
			if (this.currentTimeToCancel >= this.timeToCancelClickDrawable){
				this.drawableImage = this.drawableBeforeClick;
				this.clicked = false;
			}
		}
		
		// Because if setOnClick/OnHoverEnter/Etc was written before Ramu.init then this.onClickFunc will be null and will never be called
		
		if (this.onClickFuncIsAdded){
			this.updateEvents();
			this.onClickFuncIsAdded = false;			
		}
		
		if (this.onHoverEnterFuncIsAdded){
			this.updateEvents();
			this.onHoverEnterFuncIsAdded = false;			
		}
		
		if (this.onHoverEnterFuncIsAdded){
			this.updateEvents();
			this.onHoverEnterFuncIsAdded = false;			
		}
	}
	
	destroy(){
		super.destroy();
		this.drawableObj.destroy();
	}
}

class SimpleSpriteButton extends SimpleButtonBase{
	constructor(x, y, w, h, bottonImg, buttonHover = null, buttonClick = null){
		super(x, y, w, h);
		if (arguments.length < 5 || arguments.length > 7) throw new Error('ArgumentError: Wrong number of arguments');
		this.sprite = new Sprite(bottonImg, x, y, w, h);		
		this.imgNormal = bottonImg;
		this.imgHover = buttonHover;
		this.imgClick = buttonClick;
		this.imgBeforeClick = bottonImg;
	}

	get drawableObj(){
		return this.sprite;
	}
	
	set drawableImage(img){
		if (!(img instanceof Image)) throw Ramu.Utils.CustomTypeError(img, Image);
		this.sprite.img = img;
	}
	
	get drawableImage(){
		return this.sprite.img;
	}
		
	get drawableNormal(){
		return this.imgNormal;
	}
	
	get drawableHover(){
		return this.imgHover;
	}
	
	get drawableClick(){
		return this.imgClick;
	}
	
	set drawableBeforeClick(img){
		if (!(img instanceof Image)) throw Ramu.Utils.CustomTypeError(img, Image);
		this.rectBeforeClick = img;
	}
	
	get drawableBeforeClick(){
		return this.imgBeforeClick;
	}
}

class SimpleSpritesheetButton extends SimpleButtonBase{
	constructor(x, y, w, h, img, rectNormal, rectHover = null, rectClick = null){
		super(x, y, w, h);
		if (arguments.length < 6 || arguments.length > 8) throw new Error('ArgumentError: Wrong number of arguments');
		this.spritesheet = new Spritesheet(img, rectNormal, x, y, w, h);
		this.rectNormal = rectNormal;
		this.rectHover = rectHover;
		this.rectClick = rectClick;
		this.rectBeforeClick = rectNormal;
	}

	get drawableObj(){
		return this.spritesheet;
	}
	
	set drawableImage(rect){
		if (!(rect instanceof Rect)) throw Ramu.Utils.CustomTypeError(rect, Rect);
		this.spritesheet.setSheet(rect);
	}
	
	get drawableImage(){
		return this.spritesheet.sheet;
	}
		
	get drawableNormal(){
		return this.rectNormal;
	}
	
	get drawableHover(){
		return this.rectHover;
	}
	
	get drawableClick(){
		return this.rectClick;
	}
	
	set drawableBeforeClick(rect){
		if (!(rect instanceof Rect)) throw Ramu.Utils.CustomTypeError(rect, Rect);
		this.rectBeforeClick = rect;
	}
	
	get drawableBeforeClick(){
		return this.rectBeforeClick;
	}
}

class Destroyer extends GameObj{
	constructor(time, gameObj){
		super(0,0,0,0);
		if (arguments.length !== 2) throw new Error('ArgumentError: Wrong number of arguments');
		this.timeToDestroy = time;
		this.currentTime = 0;
		this.objToBeDestroyed = gameObj;
	}
	
	update(){
		this.currentTime += Ramu.time.delta;
		if(this.currentTime >= this.timeToDestroy){
			if(this.objToBeDestroyed)
				this.objToBeDestroyed.destroy();
			this.destroy();
		}
	}
}

/// Simple abstraction to execute instructions when audio ends, and add a func to stop.
Ramu.Audio = class extends GameObj{
	constructor(src){
		super();
		if (arguments.length != 1) throw new Error('ArgumentError: Wrong number of arguments');
		this.audio = new Audio(src);
		this.isPlaying = false;
		
		var ref = this;
		this.promiseCatch = function(){
			ref.isPlaying = false;
			if (Ramu.debugMode)
				console.warn('Ramu.Audio: Cannot play if the user did not interact with the document first.')
		};
	}
	
	prepareToPlay(){
		this.audio.play().catch(this.promiseCatch);
	}
	
	play(startAt = 0){
		if (!this.canUpdate)
			return;
		this.isPlaying = true;
		this.audio.currentTime = startAt;
		this.audio.load()
		this.prepareToPlay();
	}
	
	stop(){
		this.isPlaying = false;
		this.audio.pause();
		this.audio.currentTime = 0;
	}
	
	pause(){
		this.audio.pause();
	}
	
	resume(){
		if (!this.canUpdate)
			return;
		this.prepareToPlay();
	}
	
	update(){
		if (this.isPlaying && this.audio.ended){
			this.stop();
			this.onAudioEnd();
		}
	}
		
	setActive(bool){
		super.setActive(bool);
		this.pause();
	}
	
	/// Virtual to be inherited
	onAudioEnd(){ } 
}

class Panorama extends GameObj{
	constructor(img, x, y, w, h, velocity = 20){
		super(x, y, w, h);
		if (arguments.length < 5) throw new Error('ArgumentError: Wrong number of arguments');
		if (!(img instanceof Image)) throw Ramu.Utils.CustomTypeError(img, Image);

		this.left   = new Sprite(img, x - w, y, w, h);
		this.center = new Sprite(img, x  + w  , y, w, h);
		this.right  = new Sprite(img, x + w, y, w, h);
		this.velocity = velocity;
		this.setDrawPriority(-1);
	}
	
	canDraw(bool){
		if (!(typeof(bool) === 'boolean')) throw Ramu.Utils.CustomTypeError(bool, Boolean);

		this.left.canDraw   = bool;
		this.center.canDraw = bool;
		this.right.canDraw  = bool;
	}
	
	setDrawPriority(num){
		this.left.drawPriority   = parseInt(num);
		this.center.drawPriority = parseInt(num);
		this.right.drawPriority  = parseInt(num);
		Ramu.callSortDraw = true;
	}
	
	update(){
		let vel = this.velocity * Ramu.time.delta;
		this.left.x   += vel;
		this.center.x += vel;
		this.right.x  += vel;
		
		// Left
		if (this.center.x >= Ramu.canvas.width)
			this.center.x = this.right.x - this.right.width;
		
		if (this.right.x >= Ramu.canvas.width)
			this.right.x = this.center.x - this.center.width;
		
		// Right
		if (this.center.x + this.center.width <= 0)
			this.center.x = this.right.width;
		
		if (this.right.x + this.right.width <= 0)
			this.right.x = this.center.width;
	}
	
	setActive(bool){
		super.setActive(bool);
		this.left.setActive(bool);
		this.center.setActive(bool);
		this.right.setActive(bool);
	}
	
	destroy(){
		super.destroy();
		this.left.destroy();
		this.center.destroy();
		this.right.destroy();
	}
}


Ramu.Text = class extends Drawable {
	constructor(text, x, y, maxWidth, lineHeight = 25){
		super(x, y, 1, 1, true);
		if (arguments.length < 4) throw new Error('ArgumentError: Wrong number of arguments');
		this.text = text;
		this.maxWidth = maxWidth; // this don't break the line in the middle of a word
		this.lineHeight = lineHeight;
		
		this.font = Ramu.ctx.font;
		this.fillStyle = Ramu.ctx.fillStyle;
		
		this.drawOutOfCanvas = true;
	}
	
	get textWidth() {
		return Ramu.ctx.measureText(this.text).width;  // probably not work when _addLineBreak breaks the lines
	}
	
	start(){
		// this._addLineBreak();
	}

	// Adapted from www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial
	draw(){
		let y = this.y, testWidth = 0;
		let line = '', testLine = '', metrics = null;
		
		let oldFont = Ramu.ctx.font;
		let oldStyle = Ramu.ctx.fillStyle;
		
		Ramu.ctx.font = this.font;
		Ramu.ctx.fillStyle = this.fillStyle;
		
		this._words = this.text.replace(/\n/g, " \\n ").split(' ');
		
		for(var n = 0, len = this._words.length; n < len; ++n) {
			testLine = line + this._words[n] + ' ';
			metrics = Ramu.ctx.measureText(testLine);			
			testWidth = metrics.width;
			
			if (this._words[n] == "\\n"){
				Ramu.ctx.fillText(line, this.x, y);
				line = '';
				y += this.lineHeight;
				
			}
			else if (testWidth > this.maxWidth && n > 0) {
				Ramu.ctx.fillText(line, this.x, y);
				line = this._words[n] + ' ';
				y += this.lineHeight;
			}
			else {
				line = testLine;
			}
		}
		
		Ramu.ctx.fillText(line, this.x, y);
		Ramu.ctx.font = oldFont;
		Ramu.ctx.fillStyle = oldStyle;
	}
	
	_addLineBreak(){ // throwin exception in apathy cloud
		this._words = this.text.replace(/\n/g, " \\n ").split(' ');
	}
}

class SimpleParticle extends GameObj{
	constructor(img, rect, lifeSpan, particleNumber){
		super(rect.x, rect.y, rect.width, rect.height);
		if (arguments.length != 4) throw new Error('ArgumentError: Wrong number of arguments');
		
		this.drawPriority = Ramu.drawLastPriority++;
		this.particleNumber = particleNumber / 2;
		this.particle = img;
		this.destroyOnEnd = false;
		this.lifeSpan = lifeSpan;
	}
	
	start(){
		this.particles = [];
		this.isOver = true;
		this.alreadyPlayed = false;
		Ramu.callSortDraw = true;
		// can use ctx.drawRect + Rect instead of a Sprite but so i cannot use it to profiling tests
		for (let i = 0; i < this.particleNumber; ++i){
			this.particles[i] = new Sprite(this.particle, this.x, this.y, this.width, this.height, false);
			this.particles[i].drawPriority = this.drawPriority;
			this.particles[i].tag = 'particle-sprite';
		}
	}
	
	init(){
		if (!this._start_was_called){
			console.warn("The start was not called yet, calling...")
			this.start();
			this._start_was_called = true;
		}
		
		for (let i = 0, len = this.particles.length; i < len ; ++i){
			this.particles[i].canDraw = true;
			this.particles[i].opacity = 1;
		}

		this.currentTimeToFall = 0;
		this.currentLife = 0;
		this.isOver = false;		
	}
	
	setDrawPriority(priority){
		Ramu.callSortDraw = true;
		this.drawPriority = priority;

		for (let i = 0, len = this.particles.length; i < len; ++i)
			this.particles[i].drawPriority = priority;	
	}
	
	addToPosition(x, y){
		this.x += x;
		this.y += y;
		for (let i = 0, len = this.particles.length; i < len; ++i){
			this.particles[i].x += x;
			this.particles[i].y += y;			
		}
	}
	
	setPosition(x, y){
		this.x = x;
		this.y = y;
		
		// if (this.isOver)
		this.resetPosition();
	}
	
	setActive(bool){
		super.setActive(bool);
		for (let i = 0, len = this.particles.length; i < len ; ++i)
			this.particles[i].setActive(bool);
	}
	
	update(){
		if (this.isOver)
			return;
			
		this.currentTimeToFall >= this.currentLife / 2 ? this.move(this.particleNumber) : this.move(this.particleNumber / 2);
		this.currentLife += Ramu.time.delta;
				
		if (this.currentLife > this.lifeSpan){
			for (let i = 0; i < this.particles.length ; i++)
				this.particles[i].opacity -= 0.07;
		}
		
		if (this.particles[0] && this.particles[0].opacity <= 0){ // first clausule because one time this throw an undefined error (even canUpdate of this obj being false it was called and try to access an already undefined position)
			this.isOver = true;
			this.alreadyPlayed = true;
			
			if (this.destroyOnEnd)
				this.destroy();
			else this.resetPosition(); // why this is called? this set canDraw to false too, maybe create other method
		}
	}
	
	resetPosition(){
		for (let i = 0, len = this.particles.length; i < len; ++i){
			this.particles[i].x = this.x;
			this.particles[i].y = this.y;			
			this.particles[i].canDraw = false;
		}
	}
	
	destroy(){
		super.destroy();
		for (let i = 0, len = this.particles.length; i < len ; ++i)
			this.particles[i].destroy();
		this.particles = []; // cleaning up the references
	}
	
	random(max, min){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	move(vel){
		for (let i = 0, len = this.particles.length; i < len ; i++){
			let x = this.random(-vel, vel);
			let y = this.random(-vel, vel);
			this.particles[i].x += x * Ramu.time.delta;
			this.particles[i].y += y * Ramu.time.delta;
		}	
	}
}

