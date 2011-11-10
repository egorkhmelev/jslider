// jQuery Slider Plugin
// Egor Khmelev - http://blog.egorkhmelev.com/ - hmelyoff@gmail.com

(function(){

  // Simple Inheritance
  Function.prototype.inheritFrom = function(BaseClass, oOverride){
  	var Inheritance = function() {};
  	Inheritance.prototype = BaseClass.prototype;
  	this.prototype = new Inheritance();
  	this.prototype.constructor = this;
  	this.prototype.baseConstructor = BaseClass;
  	this.prototype.superClass = BaseClass.prototype;

  	if(oOverride){
  		for(var i in oOverride) {
  			this.prototype[i] = oOverride[i];
  		}
  	}
  };
  
  // Format numbers
  Number.prototype.jSliderNice=function(iRoundBase){
  	var re=/^(-)?(\d+)([\.,](\d+))?$/;
  	var iNum=Number(this);
  	var sNum=String(iNum);
  	var aMatches;
  	var sDecPart='';
  	var sTSeparator=' ';
  	if((aMatches = sNum.match(re))){
  		var sIntPart=aMatches[2];
  		var iDecPart=(aMatches[4]) ? Number('0.'+aMatches[4]) : 0;
  		if(iDecPart){
  			var iRF=Math.pow(10, (iRoundBase) ? iRoundBase : 2);
  			iDecPart=Math.round(iDecPart*iRF);
  			sNewDecPart=String(iDecPart);
  			sDecPart = sNewDecPart;
  			if(sNewDecPart.length < iRoundBase){
  				var iDiff = iRoundBase-sNewDecPart.length;
  				for (var i=0; i < iDiff; i++) {
  					sDecPart = "0" + sDecPart;
  				};
  			}
  			sDecPart = "," + sDecPart;
  		} else {
  			if(iRoundBase && iRoundBase != 0){
  				for (var i=0; i < iRoundBase; i++) {
  					sDecPart += "0";
  				};
  				sDecPart = "," + sDecPart;
  			}
  		}
  		var sResult;
  		if(Number(sIntPart) < 1000){
  			sResult = sIntPart+sDecPart;
  		}else{
  			var sNewNum='';
  			var i;
  			for(i=1; i*3<sIntPart.length; i++)
  				sNewNum=sTSeparator+sIntPart.substring(sIntPart.length - i*3, sIntPart.length - (i-1)*3)+sNewNum;
  			sResult = sIntPart.substr(0, 3 - i*3 + sIntPart.length)+sNewNum+sDecPart;
  		}
  		if(aMatches[1])
  			return '-'+sResult;
  		else
  			return sResult;
  	}
  	else{
  		return sNum;
  	}
  };

  this.jSliderIsArray = function( value ){
    if( typeof value == "undefined" ) return false;
    
    if (value instanceof Array ||  // Works quickly in same execution context.
        // If value is from a different execution context then
        // !(value instanceof Object), which lets us early out in the common
        // case when value is from the same context but not an array.
        // The {if (value)} check above means we don't have to worry about
        // undefined behavior of Object.prototype.toString on null/undefined.
        //
        // HACK: In order to use an Object prototype method on the arbitrary
        //   value, the compiler requires the value be cast to type Object,
        //   even though the ECMA spec explicitly allows it.
        (!(value instanceof Object) &&
         (Object.prototype.toString.call(
             /** @type {Object} */ (value)) == '[object Array]') ||

         // In IE all non value types are wrapped as objects across window
         // boundaries (not iframe though) so we have to do object detection
         // for this edge case
         typeof value.length == 'number' &&
         typeof value.splice != 'undefined' &&
         typeof value.propertyIsEnumerable != 'undefined' &&
         !value.propertyIsEnumerable('splice')

        )) {
      return true;
    }
    
    return false;
  }
  
  
})();


// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed

(function(){
  var cache = {};
  
  this.jSliderTmpl = function jSliderTmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !(/\W/).test(str) ?
      cache[str] = cache[str] ||
        jSliderTmpl(str) :
      
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
    
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();


// Draggable Class
// Egor Khmelev - http://blog.egorkhmelev.com/

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



// jQuery Slider (Safari)
// Egor Khmelev - http://blog.egorkhmelev.com/

(function( $ ) {

	$.slider = function( node, settings ){
	  var jNode = $(node);
	  if( !jNode.data( "jslider" ) )
	    jNode.data( "jslider", new jSlider( node, settings ) );
	  
	  return jNode.data( "jslider" );
	};
	
	$.fn.slider = function( action, opt_value ){
	  var returnValue, args = arguments;
	  
	  function isDef( val ){
	    return val !== undefined;
	  };

	  function isDefAndNotNull( val ){
      return val != null;
	  };
	  
		this.each(function(){
		  var self = $.slider( this, action );
		  
		  // do actions
		  if( typeof action == "string" ){
		    switch( action ){
		      case "value":
		        if( isDef( args[ 1 ] ) && isDef( args[ 2 ] ) ){
		          var pointers = self.getPointers();
		          if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
		            pointers[0].set( args[ 1 ] );
		            pointers[0].setIndexOver();
		          }
		          
		          if( isDefAndNotNull( pointers[1] ) && isDefAndNotNull( args[2] ) ){
		            pointers[1].set( args[ 2 ] );
		            pointers[1].setIndexOver();
		          }
		        }
		        
		        else if( isDef( args[ 1 ] ) ){
		          var pointers = self.getPointers();
		          if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
		            pointers[0].set( args[ 1 ] );
		            pointers[0].setIndexOver();
		          }
		        }
		        
		        else
  		        returnValue = self.getValue();

		        break;

		      case "prc":
		        if( isDef( args[ 1 ] ) && isDef( args[ 2 ] ) ){
		          var pointers = self.getPointers();
		          if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
		            pointers[0]._set( args[ 1 ] );
		            pointers[0].setIndexOver();
		          }

		          if( isDefAndNotNull( pointers[1] ) && isDefAndNotNull( args[2] ) ){
		            pointers[1]._set( args[ 2 ] );
		            pointers[1].setIndexOver();
		          }
		        }

		        else if( isDef( args[ 1 ] ) ){
		          var pointers = self.getPointers();
		          if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
		            pointers[0]._set( args[ 1 ] );
		            pointers[0].setIndexOver();
		          }
		        }

		        else
  		        returnValue = self.getPrcValue();

		        break;

  		    case "calculatedValue":
  		      var value = self.getValue().split(";");
  		      returnValue = "";
  		      for (var i=0; i < value.length; i++) {
  		        returnValue += (i > 0 ? ";" : "") + self.nice( value[i] );
  		      };
  		      
  		      break;
  		      
  		    case "skin":
		        self.setSkin( args[1] );

  		      break;
		    };
		  
		  }
		  
		  // return actual object
		  else if( !action && !opt_value ){
		    if( !jSliderIsArray( returnValue ) )
		      returnValue = [];

		    returnValue.push( slider );
		  }
		});
		
		// flatten array just with one slider
		if( jSliderIsArray( returnValue ) && returnValue.length == 1 )
		  returnValue = returnValue[ 0 ];
		
		return returnValue || this;
	};
  
  var OPTIONS = {

    settings: {
      from: 1,
      to: 10,
      step: 1,
      smooth: true,
      limits: true,
      round: 0,
      value: "5;7",
      dimension: ""
    },
    
    className: "jslider",
    selector: ".jslider-",

    template: jSliderTmpl(
      '<span class="<%=className%>">' +
        '<table><tr><td>' +
          '<div class="<%=className%>-bg">' +
            '<i class="l"><i></i></i><i class="r"><i></i></i>' +
            '<i class="v"><i></i></i>' +
          '</div>' +

          '<div class="<%=className%>-pointer"><i></i></div>' +
          '<div class="<%=className%>-pointer <%=className%>-pointer-to"><i></i></div>' +
        
          '<div class="<%=className%>-label"><span><%=settings.from%></span></div>' +
          '<div class="<%=className%>-label <%=className%>-label-to"><span><%=settings.to%></span><%=settings.dimension%></div>' +

          '<div class="<%=className%>-value"><span></span><%=settings.dimension%></div>' +
          '<div class="<%=className%>-value <%=className%>-value-to"><span></span><%=settings.dimension%></div>' +
          
          '<div class="<%=className%>-scale"><%=scale%></div>'+

        '</td></tr></table>' +
      '</span>'
    )
    
  };

  this.jSlider = function(){
  	return this.init.apply( this, arguments );
  };

  jSlider.prototype = {
    init: function( node, settings ){
      this.settings = $.extend(true, {}, OPTIONS.settings, settings ? settings : {});
      
      // obj.sliderHandler = this;
      this.inputNode = $( node ).hide();
      						
			this.settings.interval = this.settings.to-this.settings.from;
			this.settings.value = this.inputNode.attr("value");
			
			if( this.settings.calculate && $.isFunction( this.settings.calculate ) )
			  this.nice = this.settings.calculate;

			if( this.settings.onstatechange && $.isFunction( this.settings.onstatechange ) )
			  this.onstatechange = this.settings.onstatechange;

      this.is = {
        init: false
      };
			this.o = {};

      this.create();
    },
    
    onstatechange: function(){},
    
    create: function(){
      var $this = this;
      
      this.domNode = $( OPTIONS.template({
        className: OPTIONS.className,
        settings: {
          from: this.nice( this.settings.from ),
          to: this.nice( this.settings.to ),
          dimension: this.settings.dimension
        },
        scale: this.generateScale()
      }) );
      
      this.inputNode.after( this.domNode );
      this.drawScale();
      
      // set skin class
      if( this.settings.skin && this.settings.skin.length > 0 )
        this.setSkin( this.settings.skin );

			this.sizes = {
			  domWidth: this.domNode.width(),
			  domOffset: this.domNode.offset()
			};

      // find some objects
      $.extend(this.o, {
        pointers: {},
        labels: {
          0: {
            o: this.domNode.find(OPTIONS.selector + "value").not(OPTIONS.selector + "value-to")
          },
          1: {
            o: this.domNode.find(OPTIONS.selector + "value").filter(OPTIONS.selector + "value-to")
          }
        },
        limits: {
          0: this.domNode.find(OPTIONS.selector + "label").not(OPTIONS.selector + "label-to"),
          1: this.domNode.find(OPTIONS.selector + "label").filter(OPTIONS.selector + "label-to")
        }
      });

      $.extend(this.o.labels[0], {
        value: this.o.labels[0].o.find("span")
      });

      $.extend(this.o.labels[1], {
        value: this.o.labels[1].o.find("span")
      });

      
      if( !$this.settings.value.split(";")[1] ){
        this.settings.single = true;
        this.domNode.addDependClass("single");
      }

      if( !$this.settings.limits )
        this.domNode.addDependClass("limitless");

      this.domNode.find(OPTIONS.selector + "pointer").each(function( i ){
        var value = $this.settings.value.split(";")[i];
        if( value ){
          $this.o.pointers[i] = new jSliderPointer( this, i, $this );

          var prev = $this.settings.value.split(";")[i-1];
          if( prev && new Number(value) < new Number(prev) ) value = prev;

          value = value < $this.settings.from ? $this.settings.from : value;
          value = value > $this.settings.to ? $this.settings.to : value;
        
          $this.o.pointers[i].set( value, true );
        }
      });
      
      this.o.value = this.domNode.find(".v");
      this.is.init = true;
      
      $.each(this.o.pointers, function(i){
        $this.redraw(this);
      });
      
      (function(self){
        $(window).resize(function(){
          self.onresize();
        });
      })(this);

    },
    
    setSkin: function( skin ){
      if( this.skin_ )
        this.domNode.removeDependClass( this.skin_, "_" );

      this.domNode.addDependClass( this.skin_ = skin, "_" );
    },
    
    setPointersIndex: function( i ){
      $.each(this.getPointers(), function(i){
        this.index( i );
      });
    },
    
    getPointers: function(){
      return this.o.pointers;
    },
    
    generateScale: function(){
      if( this.settings.scale && this.settings.scale.length > 0 ){
        var str = "";
        var s = this.settings.scale;
        var prc = Math.round((100/(s.length-1))*10)/10;
        for( var i=0; i < s.length; i++ ){
          str += '<span style="left: ' + i*prc + '%">' + ( s[i] != '|' ? '<ins>' + s[i] + '</ins>' : '' ) + '</span>';
        };
        return str;
      } else return "";

      return "";
    },
    
    drawScale: function(){
      this.domNode.find(OPTIONS.selector + "scale span ins").each(function(){
        $(this).css({ marginLeft: -$(this).outerWidth()/2 });
      });
    },
    
    onresize: function(){
      var self = this;
			this.sizes = {
			  domWidth: this.domNode.width(),
			  domOffset: this.domNode.offset()
			};

      $.each(this.o.pointers, function(i){
        self.redraw(this);
      });
    },
    
    limits: function( x, pointer ){
  	  // smooth
  	  if( !this.settings.smooth ){
  	    var step = this.settings.step*100 / ( this.settings.interval );
  	    x = Math.round( x/step ) * step;
  	  }
  	  
  	  var another = this.o.pointers[1-pointer.uid];
  	  if( another && pointer.uid && x < another.value.prc ) x = another.value.prc;
  	  if( another && !pointer.uid && x > another.value.prc ) x = another.value.prc;

      // base limit
  	  if( x < 0 ) x = 0;
  	  if( x > 100 ) x = 100;
  	  
      return Math.round( x*10 ) / 10;
    },
    
    redraw: function( pointer ){
      if( !this.is.init ) return false;
      
      this.setValue();
      
      // redraw range line
      if( this.o.pointers[0] && this.o.pointers[1] )
        this.o.value.css({ left: this.o.pointers[0].value.prc + "%", width: ( this.o.pointers[1].value.prc - this.o.pointers[0].value.prc ) + "%" });

      this.o.labels[pointer.uid].value.html(
        this.nice(
          pointer.value.origin
        )
      );
      
      // redraw position of labels
      this.redrawLabels( pointer );

    },
    
    redrawLabels: function( pointer ){

      function setPosition( label, sizes, prc ){
    	  sizes.margin = -sizes.label/2;

        // left limit
        label_left = sizes.border + sizes.margin;
        if( label_left < 0 )
          sizes.margin -= label_left;

        // right limit
        if( sizes.border+sizes.label / 2 > self.sizes.domWidth ){
          sizes.margin = 0;
          sizes.right = true;
        } else
          sizes.right = false;
          
        label.o.css({ left: prc + "%", marginLeft: sizes.margin, right: "auto" });
        if( sizes.right ) label.o.css({ left: "auto", right: 0 });
        return sizes;
      }

      var self = this;
  	  var label = this.o.labels[pointer.uid];
  	  var prc = pointer.value.prc;

  	  var sizes = {
  	    label: label.o.outerWidth(),
  	    right: false,
  	    border: ( prc * this.sizes.domWidth ) / 100
  	  };

      //console.log(this.o.pointers[1-pointer.uid])
      if( !this.settings.single ){
        // glue if near;
        var another = this.o.pointers[1-pointer.uid];
      	var another_label = this.o.labels[another.uid];

        switch( pointer.uid ){
          case 0:
            if( sizes.border+sizes.label / 2 > another_label.o.offset().left-this.sizes.domOffset.left ){
              another_label.o.css({ visibility: "hidden" });
          	  another_label.value.html( this.nice( another.value.origin ) );

            	label.o.css({ visibility: "visible" });

            	prc = ( another.value.prc - prc ) / 2 + prc;
            	if( another.value.prc != pointer.value.prc ){
            	  label.value.html( this.nice(pointer.value.origin) + "&nbsp;&ndash;&nbsp;" + this.nice(another.value.origin) );
              	sizes.label = label.o.outerWidth();
              	sizes.border = ( prc * this.sizes.domWidth ) / 100;
              }
            } else {
            	another_label.o.css({ visibility: "visible" });
            }
            break;

          case 1:
            if( sizes.border - sizes.label / 2 < another_label.o.offset().left - this.sizes.domOffset.left + another_label.o.outerWidth() ){
              another_label.o.css({ visibility: "hidden" });
          	  another_label.value.html( this.nice(another.value.origin) );

            	label.o.css({ visibility: "visible" });

            	prc = ( prc - another.value.prc ) / 2 + another.value.prc;
            	if( another.value.prc != pointer.value.prc ){
            	  label.value.html( this.nice(another.value.origin) + "&nbsp;&ndash;&nbsp;" + this.nice(pointer.value.origin) );
              	sizes.label = label.o.outerWidth();
              	sizes.border = ( prc * this.sizes.domWidth ) / 100;
              }
            } else {
              another_label.o.css({ visibility: "visible" });
            }
            break;
        }
      }

      sizes = setPosition( label, sizes, prc );
      
      /* draw second label */
      if( another_label ){
        var sizes = {
    	    label: another_label.o.outerWidth(),
    	    right: false,
    	    border: ( another.value.prc * this.sizes.domWidth ) / 100
    	  };
        sizes = setPosition( another_label, sizes, another.value.prc );
      }
  	  
	    this.redrawLimits();
    },
    
    redrawLimits: function(){
  	  if( this.settings.limits ){

        var limits = [ true, true ];

        for( key in this.o.pointers ){

          if( !this.settings.single || key == 0 ){
          
        	  var pointer = this.o.pointers[key];
            var label = this.o.labels[pointer.uid];
            var label_left = label.o.offset().left - this.sizes.domOffset.left;

        	  var limit = this.o.limits[0];
            if( label_left < limit.outerWidth() )
              limits[0] = false;

        	  var limit = this.o.limits[1];
        	  if( label_left + label.o.outerWidth() > this.sizes.domWidth - limit.outerWidth() )
        	    limits[1] = false;
        	}

        };

        for( var i=0; i < limits.length; i++ ){
          if( limits[i] )
            this.o.limits[i].fadeIn("fast");
          else
            this.o.limits[i].fadeOut("fast");
        };

  	  }
    },
    
    setValue: function(){
      var value = this.getValue();
      this.inputNode.attr( "value", value );
      this.onstatechange.call( this, value );
    },
    getValue: function(){
      if(!this.is.init) return false;
      var $this = this;
      
      var value = "";
      $.each( this.o.pointers, function(i){
        if( this.value.prc != undefined && !isNaN(this.value.prc) ) value += (i > 0 ? ";" : "") + $this.prcToValue( this.value.prc );
      });
      return value;
    },
    getPrcValue: function(){
      if(!this.is.init) return false;
      var $this = this;
      
      var value = "";
      $.each( this.o.pointers, function(i){
        if( this.value.prc != undefined && !isNaN(this.value.prc) ) value += (i > 0 ? ";" : "") + this.value.prc;
      });
      return value;
    },
    prcToValue: function( prc ){

  	  if( this.settings.heterogeneity && this.settings.heterogeneity.length > 0 ){
    	  var h = this.settings.heterogeneity;

    	  var _start = 0;
    	  var _from = this.settings.from;

    	  for( var i=0; i <= h.length; i++ ){
    	    if( h[i] ) var v = h[i].split("/");
    	    else       var v = [100, this.settings.to];
    	    
    	    v[0] = new Number(v[0]);
    	    v[1] = new Number(v[1]);
    	      
    	    if( prc >= _start && prc <= v[0] ) {
    	      var value = _from + ( (prc-_start) * (v[1]-_from) ) / (v[0]-_start);
    	    }

    	    _start = v[0];
    	    _from = v[1];
    	  };

  	  } else {
        var value = this.settings.from + ( prc * this.settings.interval ) / 100;
  	  }

      return this.round( value );
    },
    
  	valueToPrc: function( value, pointer ){  	  
  	  if( this.settings.heterogeneity && this.settings.heterogeneity.length > 0 ){
    	  var h = this.settings.heterogeneity;

    	  var _start = 0;
    	  var _from = this.settings.from;

    	  for (var i=0; i <= h.length; i++) {
    	    if(h[i]) var v = h[i].split("/");
    	    else     var v = [100, this.settings.to];
    	    v[0] = new Number(v[0]); v[1] = new Number(v[1]);
    	      
    	    if(value >= _from && value <= v[1]){
    	      var prc = pointer.limits(_start + (value-_from)*(v[0]-_start)/(v[1]-_from));
    	    }

    	    _start = v[0]; _from = v[1];
    	  };

  	  } else {
    	  var prc = pointer.limits((value-this.settings.from)*100/this.settings.interval);
  	  }

  	  return prc;
  	},
    
    
  	round: function( value ){
	    value = Math.round( value / this.settings.step ) * this.settings.step;
  		if( this.settings.round ) value = Math.round( value * Math.pow(10, this.settings.round) ) / Math.pow(10, this.settings.round);
  		else value = Math.round( value );
  		return value;
  	},
  	
  	nice: function( value ){
  		value = value.toString().replace(/,/gi, ".");
  		value = value.toString().replace(/ /gi, "");
  		if( Number.prototype.jSliderNice )
  		  return (new Number(value)).jSliderNice(this.settings.round).replace(/-/gi, "&minus;");
  		else
  		  return new Number(value);
  	}
    
  };
  
  function jSliderPointer(){
  	this.baseConstructor.apply(this, arguments);
  }

  jSliderPointer.inheritFrom(Draggable, {
    oninit: function( ptr, id, _constructor ){
      this.uid = id;
      this.parent = _constructor;
      this.value = {};
      this.settings = this.parent.settings;
    },
  	onmousedown: function(evt){
  	  this._parent = {
  	    offset: this.parent.domNode.offset(),
  	    width: this.parent.domNode.width()
  	  };
  	  this.ptr.addDependClass("hover");
  	  this.setIndexOver();
  	},
  	onmousemove: function( evt, x ){
  	  var coords = this._getPageCoords( evt );
  	  this._set( this.calc( coords.x ) );
  	},
  	onmouseup: function( evt ){
      // var coords = this._getPageCoords( evt );
      // this._set( this.calc( coords.x ) );

  	  if( this.parent.settings.callback && $.isFunction(this.parent.settings.callback) )
  	    this.parent.settings.callback.call( this.parent, this.parent.getValue() );
  	    
  	  this.ptr.removeDependClass("hover");
  	},
  	
  	setIndexOver: function(){
  	  this.parent.setPointersIndex( 1 );
  	  this.index( 2 );
  	},
  	
  	index: function( i ){
  	  this.ptr.css({ zIndex: i });
  	},
  	
  	limits: function( x ){
  	  return this.parent.limits( x, this );
  	},
  	
  	calc: function(coords){
  	  var x = this.limits(((coords-this._parent.offset.left)*100)/this._parent.width);
  	  return x;
  	},

  	set: function( value, opt_origin ){
  	  this.value.origin = this.parent.round(value);
  	  this._set( this.parent.valueToPrc( value, this ), opt_origin );
  	},  	
  	_set: function( prc, opt_origin ){
  	  if( !opt_origin )
  	    this.value.origin = this.parent.prcToValue(prc);

  	  this.value.prc = prc;
  		this.ptr.css({ left: prc + "%" });
  	  this.parent.redraw(this);
  	}
  	
  });
  
  
})(jQuery);





/* end */