"use strict"

class MenuParams {	
	upperLeftJoint = new Rect(0, 0, 6, 6)
	horizontalLine = new Rect(6, 0, 53, 6)
	verticalLine = new Rect(0, 6, 6, 30)
	
	normalBg = new Rect(6, 6, 30, 30)
	selectedBg = new Rect(36, 6, 30, 30)
	inactiveBg = new Rect(66, 6, 30, 30)
	
	cursorRect = new Rect(6, 36, 7, 7)
	cursorRectInactive = new Rect(13, 36, 7, 7)
	cornerSize = 6
	padding = 4
	img = null
	
	font = '13px sans-serif'
	itemText = '#0197FF'
	inactiveItemText = '#7CC1CE'
	selectedItemText = '#0100FF'
	
	static default = new MenuParams()
}
