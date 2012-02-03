// Draggable Class
// Egor Khmelev - http://blog.egorkhmelev.com/ - MIT Licensed

(function( $ ){

  this.Draggable = function(){
  	this._init.apply( this, arguments );
  };

  Draggable.prototype = {
  	// Methods for re-init in child class
  	oninit: function(){},
  	events: function(){},
  	onmousedown: function(){
  		this.ptr.css({ position: "absolute" });
  	},
  	onmousemove: function( evt, x, y ){
  		this.ptr.css({ left: x, top: y });
  	},
  	onmouseup: function(){},

  	isDefault: {
  		drag: false,
  		clicked: false,
  		toclick: true,
  		mouseup: false
  	},

  	_init: function(){
  		if( arguments.length > 0 ){
  			this.ptr = $(arguments[0]);
  			this.outer = $(".draggable-outer");

  			this.is = {};
  			$.extend( this.is, this.isDefault );

  			var _offset = this.ptr.offset();
  			this.d = {
  				left: _offset.left,
  				top: _offset.top,
  				width: this.ptr.width(),
  				height: this.ptr.height()
  			};

  			this.oninit.apply( this, arguments );

  			this._events();
  		}
  	},
  	_getPageCoords: function( event ){
  	  if( event.targetTouches && event.targetTouches[0] ){
  	    return { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY };
  	  } else
  	    return { x: event.pageX, y: event.pageY };
  	},
  	_bindEvent: function( ptr, eventType, handler ){
  	  var self = this;

  	  if( this.supportTouches_ )
        ptr.get(0).addEventListener( this.events_[ eventType ], handler, false );
  	  
  	  else
  	    ptr.bind( this.events_[ eventType ], handler );
  	},
  	_events: function(){
  		var self = this;

      this.supportTouches_ = ( $.browser.webkit && navigator.userAgent.indexOf("Mobile") != -1 );
      this.events_ = {
        "click": this.supportTouches_ ? "touchstart" : "click",
        "down": this.supportTouches_ ? "touchstart" : "mousedown",
        "move": this.supportTouches_ ? "touchmove" : "mousemove",
        "up"  : this.supportTouches_ ? "touchend" : "mouseup"
      };

      this._bindEvent( $( document ), "move", function( event ){
				if( self.is.drag ){
          event.stopPropagation();
          event.preventDefault();
					self._mousemove( event );
				}
			});
      this._bindEvent( $( document ), "down", function( event ){
				if( self.is.drag ){
          event.stopPropagation();
          event.preventDefault();
				}
			});
      this._bindEvent( $( document ), "up", function( event ){
				self._mouseup( event );
			});
			
      this._bindEvent( this.ptr, "down", function( event ){
				self._mousedown( event );
				return false;
			});
      this._bindEvent( this.ptr, "up", function( event ){
				self._mouseup( event );
			});
			
  		this.ptr.find("a")
  			.click(function(){
  				self.is.clicked = true;

  				if( !self.is.toclick ){
  					self.is.toclick = true;
  					return false;
  				}
  			})
  			.mousedown(function( event ){
  				self._mousedown( event );
  				return false;
  			});

  		this.events();
  	},
  	_mousedown: function( evt ){
  		this.is.drag = true;
  		this.is.clicked = false;
  		this.is.mouseup = false;

  		var _offset = this.ptr.offset();
  		var coords = this._getPageCoords( evt );
  		this.cx = coords.x - _offset.left;
  		this.cy = coords.y - _offset.top;

  		$.extend(this.d, {
  			left: _offset.left,
  			top: _offset.top,
  			width: this.ptr.width(),
  			height: this.ptr.height()
  		});

  		if( this.outer && this.outer.get(0) ){
  			this.outer.css({ height: Math.max(this.outer.height(), $(document.body).height()), overflow: "hidden" });
  		}

  		this.onmousedown( evt );
  	},
  	_mousemove: function( evt ){
  		this.is.toclick = false;
  		var coords = this._getPageCoords( evt );
  		this.onmousemove( evt, coords.x - this.cx, coords.y - this.cy );
  	},
  	_mouseup: function( evt ){
  		var oThis = this;

  		if( this.is.drag ){
  			this.is.drag = false;

  			if( this.outer && this.outer.get(0) ){

  				if( $.browser.mozilla ){
  					this.outer.css({ overflow: "hidden" });
  				} else {
  					this.outer.css({ overflow: "visible" });
  				}

  				if( $.browser.msie && $.browser.version == '6.0' ){
  					this.outer.css({ height: "100%" });
  				} else {
  					this.outer.css({ height: "auto" });
  				}	
  			}

  			this.onmouseup( evt );
  		}
  	}

  };

})( jQuery );
