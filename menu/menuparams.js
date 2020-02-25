"use strict"

class MenuParams {	
	upperLeftJoint = new Rect(0, 0, 6, 6)
	horizontalLine = new Rect(6, 0, 53, 6)
	verticalLine = new Rect(0, 6, 6, 53)
	
	normalBg = new Rect(6, 6, 28, 37)
	selectedBg = new Rect(34, 6, 27, 37)
	inactiveBg = new Rect(1, 1, 1, 1)
	
	cursorRect = new Rect(50, 44, 9, 15)
	cornerSize = 6
	padding = 4
	img = null
	
	font = '13px sans-serif'
	itemText = 'white'
	inactiveItemText = 'gray'
	selectedItemText = '#2fadf5'
	
	static default = new MenuParams()
}
