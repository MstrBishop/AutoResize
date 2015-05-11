//

var TokenResize = TokenResize || (function() {
    'use strict';
 
    var version  = 0.17,
        schemaVersion = 0.1,
        
    performAutoOff = function() {
    	if( ! state.AutoResize.locked ) {
			state.AutoResize.locked = true;
		}
		sendChat('TokenResize','/w gm '
			+'<div style="border: 1px solid #666666; background: #ffffee;">'
				+'Auto resizing is now <span style="color: #990000; font-weight: bold;">Off</span>.'
			+'</div>'
		);
	},
    
    performAutoOn = function() {
    	if( state.AutoResize.locked ) {
			state.AutoResize.locked = false;
		}
		sendChat('TokenResize','/w gm '
			+'<div style="border: 1px solid #666666; background: #ffffee;">'
				+'Auto resizing is now <span style="color: #009900; font-weight: bold;">On</span>.'
			+'</div>'
		);
	},
    
    performPlayerOn = function(msg) {
        if( state.PlayerResize.locked ) {
			state.PlayerResize.locked = false;
		}
		sendChat('TokenResize','/w gm '
			+'<div style="border: 1px solid #666666; background: #ffffee;">'
				+'Player manual resizing is now <span style="color: #009900; font-weight: bold;">On</span>.'
			+'</div>'
		);
	},
    
    performPlayerOff = function(msg) {
        if( ! state.PlayerResize.locked ) {
    		state.PlayerResize.locked = true;
		}
		sendChat('TokenResize','/w gm '
			+'<div style="border: 1px solid #666666; background: #ffffee;">'
				+'Player manual resizing is now <span style="color: #990000; font-weight: bold;">Off</span>.'
			+'</div>'
		);
	},
    
    isSelected = function(msg) {
        if( ! state.isSelected.locked ) {
            state.isSelected.locked = true;
        }
        sendChat('TokenResize','/w gm '
            +'<div style="border: 1px solid #666666; background: #ffffee;">'
    			+'Tokens can be targetted for resize is now <span style="color: #990000; font-weight: bold;">Off</span>.'
			+'</div>'
        );
    },
    
    isTargetted = function(msg) {
        if(  state.isSelected.locked ) {
            state.isSelected.locked = false;
        }
        sendChat('TokenResize','/w gm '
            +'<div style="border: 1px solid #666666; background: #ffffee;">'
        		+'Tokens can be targetted for resize is now <span style="color: #009900; font-weight: bold;">On</span>.'
			+'</div>'
        );
    },
    
    ch = function (c) {
        var entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};
 
		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	},
    
    handleInput = function(msg) {
        var args, obj, prev;
 
        if (msg.type !== "api") {
			return;
		}
        var selected = msg.selected;
		args = msg.content.split(" ");
		switch(args[0]) {
            case '!tr':
                switch(args[1]) {
    				case '--auto-off':
						performAutoOff();
						break;
					case '--auto-on':
						performAutoOn();
						break;
                    case '--player-off':
    					performPlayerOff();
						break;
					case '--player-on':
						performPlayerOn();
						break;
                    case '--target-on':
    					isTargetted();
						break;
                    case '--target-off':
    					isSelected();
						break;
                    case '--help':
        				showHelp();
						break;
				}
                if( args[2] && state.PlayerResize.locked && !playerIsGM(msg.playerid) ) {
                    sendChat("", "/desc Check player resize.");
					return;
                } else if ( args[2] && state.isSelected.locked && !selected ) { // Only allows a token to be resized if selected. This prevents players from resizing tokens that don't belong to them.
            		sendChat("", "/desc Select token and try again.");
        			return; // quit if nothing selected
        		} else {
                    if(args[2]){
                        var obj = getObj("graphic", args[1]),
                            ptop = obj.get('top'),
                            pleft = obj.get('left'),
                            pheight = obj.get('height'),
                            scaleSize = args[2],
                            gridSize = 70;
    						if( (gridSize * scaleSize) !== obj.get('width') ) {
        			            obj.set({
            					width: (gridSize * scaleSize),
            					height: (gridSize * scaleSize)
        			            })
                                if( (gridSize * scaleSize) > gridSize ) {
                                    obj.set({
                                        top: (ptop + ((gridSize / 2) * (scaleSize - (pheight / gridSize)))),
                                        left: (pleft + ((gridSize / 2) * (scaleSize - (pheight / gridSize))))
                                    })
                                } else {
                                    obj.set({
                                        top: (ptop - ((gridSize / 2) * ((pheight / gridSize) - scaleSize))),
                                        left: (pleft - ((gridSize / 2) * ((pheight / gridSize) - scaleSize)))
                                    })
                                }
            		        }
                    }
				}
            break;
		}
 
	},
    
    autoChange = function(obj, prev) {

        if ('card' !== obj.get("subtype") && obj.get("sides") && '' !== obj.get("represents")) {
            var aid = obj.get("imgsrc"),
                tid = findObjs({
                    type: 'tableitem',
                    avatar: aid
                }, { caseInsensitive: true })[0],
                    weight,
                    pheight, 
                    gridSize = 70;
                if(tid) {
                    weight = tid.get("weight");
                    pheight = obj.get("height");
                    
                    if(tid.get("weight") <= 0 || state.AutoResize.locked) {
                        //showHelp();
                        return;  // Even though we use weight for the tile size, let's make sure there is something there to avoid errors.
                    };
        				 if ((gridSize * weight) !== obj.get('width')) {
                            obj.set({
                                width: (gridSize * weight),
                                height: (gridSize * weight)
                            });
                            if ((gridSize * weight) > gridSize) {
                                obj.set({
                                    top: (prev.top + ((gridSize / 2) * (weight - (pheight / gridSize)))),
                                    left: (prev.left + ((gridSize / 2) * (weight - (pheight / gridSize))))
                                })
                            } else {
                                obj.set({
                                    top: (prev.top - ((gridSize / 2) * ((pheight / gridSize) - weight))),
                                    left: (prev.left - ((gridSize / 2) * ((pheight / gridSize) - weight)))
                                })
                            }
                        } else {
                            return;
                        }
                }
		}
    },
    
    showHelp = function() {
        var playerColor = (state.PlayerResize.locked) ? ('#990000') : ('#009900'),
    	    playerName  = (state.PlayerResize.locked) ? ('Locked') : ('Unlocked'),
            autoColor = (state.AutoResize.locked) ? ('#990000') : ('#009900'),
    	    autoName  = (state.AutoResize.locked) ? ('Locked') : ('Unlocked'),
            selectColor = (state.isSelected.locked) ? ('#990000') : ('#009900'),
            selectName  = (state.isSelected.locked) ? ('Off') : ('On');
            
        sendChat('TokenResize',
                '/w gm '
    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                +'TokenResize v'+version
    		+'<div style="clear: both"></div>'
            +'<div style="padding-left:10px;padding-top:10px;">'
        	    +'<span style="font-weight:bold; font-size: 70%;">Player Resize:</span><div style="float:right;width:90px;border:1px solid black;background-color:#ffc;text-align:center;font-size: 70%;"><span style="color: '+playerColor+'; font-weight:bold; padding: 0px 4px;">'+playerName+'</span></div>'
    	    +'</div>'
            +'<div style="padding-left:10px">'
                +'<span style="font-weight:bold; font-size: 70%;">Auto Resize:</span><div style="float:right;width:90px;border:1px solid black;background-color:#ffc;text-align:center;font-size: 70%;"><span style="color: '+autoColor+'; font-weight:bold; padding: 0px 4px;">'+autoName+'</span></div>'
            +'</div>'
            +'<div style="padding-left:10px;margin-bottom:10px;">'
                +'<span style="font-weight:bold; font-size: 70%;">Can Target:</span><div style="float:right;width:90px;border:1px solid black;background-color:#ffc;text-align:center;font-size: 70%;"><span style="color: '+selectColor+'; font-weight:bold; padding: 0px 4px;">'+selectName+'</span></div>'
            +'</div>'
            +'<div style="clear: both"></div>'
        +'</div>'
    	+'<div style="padding-left:10px;margin-bottom:10px;margin-top:10px;">'
    		+'<p>TokenResize allows players to resize their tokens when unlocked.'
    	+'</div>'
    	+'<b>Commands</b>'
    	+'<div style="padding-left:10px;"><b><span style="font-family: serif;">!tr</span></b>'
    		+'<div style="padding-left: 10px;padding-right:20px">'
    			+'Executing the command with no arguments prints this help.  The following arguments may be supplied in order to change the configuration.  All changes are persisted between script restarts.'
    			+'<ul>'
        			+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
    					+'<b><span style="font-family: serif;">--player-on</span></b> -- Unlocks TokenResize to allow players to resize tokens.'
    				+'</li> '
    				+'<li style="border-bottom: 1px solid #ccc;">'
    					+'<b><span style="font-family: serif;">--player-off</span></b> -- Locks TokenResize and prevents anyone but a GM from resizing tokens.'
    				+'</li> '
                    +'<li style="border-bottom: 1px solid #ccc;">'
        				+'<b><span style="font-family: serif;">--auto-on</span></b> -- Unlocks TokenResize to allow resizing of rollable table based tokens, where the size of the token is defined by the weight property.'
    				+'</li> '
                    +'<li style="border-bottom: 1px solid #ccc;">'
        				+'<b><span style="font-family: serif;">--auto-off</span></b> -- Locks TokenResize and prevents automatically resizing tokens.'
    				+'</li> '
                    +'<li style="border-bottom: 1px solid #ccc;">'
            			+'<b><span style="font-family: serif;">--target-on</span></b> -- A token can be resized when targetting, as well as being selected.'
    				+'</li> '
                    +'<li style="border-bottom: 1px solid #ccc;">'
        				+'<b><span style="font-family: serif;">--target-off</span></b> -- A token can only be resized when selected. Using this option allows players to only resize tokens they control.'
    				+'</li> '
    			+'</ul>'
                +'<b><span style="font-family: serif;">Commands to be used when manually resizing:</span></b>'
                +'<ul>'
    				+'<li style="border-bottom: 1px solid #ccc;">'
    					+'<b><span style="font-family: serif;">'+ch('<')+'token_id'+ch('>')+'</span></b> -- Select or target the token. Set to select by default.'
    				+'</li> '
    				+'<li style="border-bottom: 1px solid #ccc;">'
    					+'<b><span style="font-family: serif;">#</span></b> -- Number of squares across the creature will take up (i.e.: 1=Medium/Small, 2=Large, etc.).'
    				+'</li> '
    			+'</ul>'
                +'<b><span style="font-family: serif;">--help</span></b> -- Entering this, or entering nothing at all after !tr, will bring this help window back.'
    		+'</div>'
    	+'</div>'
    +'</div>'
                );
    },

    CheckInstall = function() {    
        if( ! _.has(state,'AutoResize') || ! _.has(state,'PlayerResize') || ! _.has(state,'isSelected') || TokenResize.version !== schemaVersion)
        {
            //Default Settings stored in the state.
            state.AutoResize = {
                version: TokenResize.schemaVersion,
                locked: false
        	};
            state.PlayerResize = {
                version: TokenResize.schemaVersion,
                locked: false
            };
            state.isSelected = {
                version: TokenResize.schemaVersion,
                locked: true
            };
		}
	},
	RegisterEventHandlers = function() {
		on('change:graphic', autoChange);
        on('chat:message', handleInput);
	};
 
	return {
		RegisterEventHandlers: RegisterEventHandlers,
		CheckInstall: CheckInstall
	};
}());
on("ready",function(){
	'use strict';
        TokenResize.CheckInstall(); 
        TokenResize.RegisterEventHandlers();
});
