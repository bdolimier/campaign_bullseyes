/*
Copyright (c) 2011 Sencha Inc. - Author: Nicolas Garcia Belmonte (http://philogb.github.com/)
 */
 (function () { 

window.$jit = function(w) {
  w = w || window;
  for(var k in $jit) {
    if($jit[k].$extend) {
      w[k] = $jit[k];
    }
  }
};

$jit.version = '2.0.1';
var $ = function(d) {
  return document.getElementById(d);
};

$.empty = function() {
};

$.extend = function(original, extended) {
  for ( var key in (extended || {}))
    original[key] = extended[key];
  return original;
};

// oui
$.lambda = function(value) {
  return (typeof value == 'function') ? value : function() {
    return value;
  };
};

$.time = Date.now || function() {
  return +new Date;
};

$.splat = function(obj) {
  var type = $.type(obj);
  return type ? ((type != 'array') ? [ obj ] : obj) : [];
};

$.type = function(elem) {
  var type = $.type.s.call(elem).match(/^\[object\s(.*)\]$/)[1].toLowerCase();
  if(type != 'object') return type;
  if(elem && elem.$$family) return elem.$$family;
  return (elem && elem.nodeName && elem.nodeType == 1)? 'element' : type;
};
$.type.s = Object.prototype.toString;

/*

*/
$.each = function(iterable, fn) {
  var type = $.type(iterable);
  if (type == 'object') {
    for ( var key in iterable)
      fn(iterable[key], key);
  } else {
    for ( var i = 0, l = iterable.length; i < l; i++)
      fn(iterable[i], i);
  }
};

$.indexOf = function(array, item) {
  if(Array.indexOf) return array.indexOf(item);
  for(var i=0,l=array.length; i<l; i++) {
    if(array[i] === item) return i;
  }
  return -1;
};

/*
  Method: merge - oui
*/
$.merge = function() {
  var mix = {};
  for ( var i = 0, l = arguments.length; i < l; i++) {
    var object = arguments[i];
    if ($.type(object) != 'object')
      continue;
    for ( var key in object) {
      var op = object[key], mp = mix[key];
      mix[key] = (mp && $.type(op) == 'object' && $.type(mp) == 'object') ? $
          .merge(mp, op) : $.unlink(op);
    }
  }
  return mix;
};
// oui
$.unlink = function(object) {
  var unlinked;
  switch ($.type(object)) {
  case 'object':
    unlinked = {};
    for ( var p in object)
      unlinked[p] = $.unlink(object[p]);
    break;
  case 'array':
    unlinked = [];
    for ( var i = 0, l = object.length; i < l; i++)
      unlinked[i] = $.unlink(object[i]);
    break;
  default:
    return object;
  }
  return unlinked;
};

/*
  Method: addEvent
*/
// oui
$.addEvent = function(obj, type, fn) {
  if (obj.addEventListener)
    obj.addEventListener(type, fn, false);
  else
    obj.attachEvent('on' + type, fn);
};

// oui
$.addEvents = function(obj, typeObj) {
  for(var type in typeObj) {
    $.addEvent(obj, type, typeObj[type]);
  }
};

$.hasClass = function(obj, klass) {
  return (' ' + obj.className + ' ').indexOf(' ' + klass + ' ') > -1;
};

$.addClass = function(obj, klass) {
  if (!$.hasClass(obj, klass))
    obj.className = (obj.className + " " + klass);
};

$.removeClass = function(obj, klass) {
  obj.className = obj.className.replace(new RegExp(
      '(^|\\s)' + klass + '(?:\\s|$)'), '$1');
};

$.getPos = function(elem) {
  var offset = getOffsets(elem);
  var scroll = getScrolls(elem);
  return {
    x: offset.x - scroll.x,
    y: offset.y - scroll.y
  };

  function getOffsets(elem) {
    var position = {
      x: 0,
      y: 0
    };
    while (elem && !isBody(elem)) {
      position.x += elem.offsetLeft;
      position.y += elem.offsetTop;
      elem = elem.offsetParent;
    }
    return position;
  }

  function getScrolls(elem) {
    var position = {
      x: 0,
      y: 0
    };
    while (elem && !isBody(elem)) {
      position.x += elem.scrollLeft;
      position.y += elem.scrollTop;
      elem = elem.parentNode;
    }
    return position;
  }

  function isBody(element) {
    return (/^(?:body|html)$/i).test(element.tagName);
  }
};

$.event = {
  get: function(e, win) {
    win = win || window;
    return e || win.event;
  },
  getWheel: function(e) {
    return e.wheelDelta? e.wheelDelta / 120 : -(e.detail || 0) / 3;
  },
  isRightClick: function(e) {
    return (e.which == 3 || e.button == 2);
  },
  getPos: function(e, win) {
    // get mouse position
    win = win || window;
    e = e || win.event;
    var doc = win.document;
    doc = doc.documentElement || doc.body;
    if(e.touches && e.touches.length) {
      e = e.touches[0];
    }
    var page = {
      x: e.pageX || (e.clientX + doc.scrollLeft),
      y: e.pageY || (e.clientY + doc.scrollTop)
    };
    return page;
  },
  stop: function(e) {
    if (e.stopPropagation) e.stopPropagation();
    e.cancelBubble = true;
    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
  }
};

$jit.util = $jit.id = $;

var Class = function(properties) {
  properties = properties || {};
  var klass = function() {
    for ( var key in this) {
      if (typeof this[key] != 'function')
        this[key] = $.unlink(this[key]);
    }
    this.constructor = klass;
    if (Class.prototyping)
      return this;
    var instance = this.initialize ? this.initialize.apply(this, arguments)
        : this;
    this.$$family = 'class';
    return instance;
  };

  for ( var mutator in Class.Mutators) {
    if (!properties[mutator])
      continue;
    properties = Class.Mutators[mutator](properties, properties[mutator]);
    delete properties[mutator];
  }

  $.extend(klass, this);
  klass.constructor = Class;
  klass.prototype = properties;
  return klass;
};

Class.Mutators = {

  Implements: function(self, klasses) {
    $.each($.splat(klasses), function(klass) {
      Class.prototyping = klass;
      var instance = (typeof klass == 'function') ? new klass : klass;
      for ( var prop in instance) {
        if (!(prop in self)) {
          self[prop] = instance[prop];
        }
      }
      delete Class.prototyping;
    });
    return self;
  }

};

$.extend(Class, {

  inherit: function(object, properties) {
    for ( var key in properties) {
      var override = properties[key];
      var previous = object[key];
      var type = $.type(override);
      if (previous && type == 'function') {
        if (override != previous) {
          Class.override(object, key, override);
        }
      } else if (type == 'object') {
        object[key] = $.merge(previous, override);
      } else {
        object[key] = override;
      }
    }
    return object;
  },

  override: function(object, name, method) {
    var parent = Class.prototyping;
    if (parent && object[name] != parent[name])
      parent = null;
    var override = function() {
      var previous = this.parent;
      this.parent = parent ? parent[name] : object[name];
      var value = method.apply(this, arguments);
      this.parent = previous;
      return value;
    };
    object[name] = override;
  }

});

Class.prototype.implement = function() {
  var proto = this.prototype;
  $.each(Array.prototype.slice.call(arguments || []), function(properties) {
    Class.inherit(proto, properties);
  });
  return this;
};

$jit.Class = Class;

/*
     An object containing multiple type of transformations. 
*/

$jit.Trans = {
  $extend: true,
  linear: function(p){
    return p;
  }
};

var Trans = $jit.Trans;
// oui
(function(){
  var makeTrans = function(transition, params){
    params = $.splat(params);
    return $.extend(transition, {
      easeIn: function(pos){
        return transition(pos, params);
      },
      easeOut: function(pos){
        return 1 - transition(1 - pos, params);
      },
      easeInOut: function(pos){
        return (pos <= 0.5)? transition(2 * pos, params) / 2 : (2 - transition(
            2 * (1 - pos), params)) / 2;
      }
    });
  };

  var transitions = {

    Pow: function(p, x){
      return Math.pow(p, x[0] || 6);
    },

    Expo: function(p){
      return Math.pow(2, 8 * (p - 1));
    },

    Circ: function(p){
      return 1 - Math.sin(Math.acos(p));
    },

    Sine: function(p){
      return 1 - Math.sin((1 - p) * Math.PI / 2);
    },

    Back: function(p, x){
      x = x[0] || 1.618;
      return Math.pow(p, 2) * ((x + 1) * p - x);
    },

    Bounce: function(p){
      var value;
      for ( var a = 0, b = 1; 1; a += b, b /= 2) {
        if (p >= (7 - 4 * a) / 11) {
          value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
          break;
        }
      }
      return value;
    },

    Elastic: function(p, x){
      return Math.pow(2, 10 * --p)
          * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
    }

  };
// oui
  $.each(transitions, function(val, key){
    Trans[key] = makeTrans(val);
  });

  $.each( [
      'Quad', 'Cubic', 'Quart', 'Quint'
  ], function(elem, i){
    Trans[elem] = makeTrans(function(p){
      return Math.pow(p, [
        i + 2
      ]);
    });
  });

})();

/*
   The Animation class is based in the MooTools Framework <http://mootools.net>. Copyright (c) 2006-2009 Valerio Proietti, <http://mad4milk.net/>. MIT license <http://mootools.net/license.txt>.
*/
//oui
var Animation = new Class( {
  initialize: function(options){
    this.setOptions(options);
  },

  setOptions: function(options){
    var opt = {
      duration: 2500,
      fps: 40,
      transition: Trans.Quart.easeInOut,
      compute: $.empty,
      complete: $.empty,
      link: 'ignore'
    };
    this.opt = $.merge(opt, options || {});
    return this;
  },

  step: function(){
    var time = $.time(), opt = this.opt;
    if (time < this.time + opt.duration) {
      var delta = opt.transition((time - this.time) / opt.duration);
      opt.compute(delta);
    } else {
      this.timer = clearInterval(this.timer);
      opt.compute(1);
      opt.complete();
    }
  },

  start: function(){
    if (!this.check())
      return this;
    this.time = 0;
    this.startTimer();
    return this;
  },

  startTimer: function(){
    var that = this, fps = this.opt.fps;
    if (this.timer)
      return false;
    this.time = $.time() - this.time;
    this.timer = setInterval((function(){
      that.step();
    }), Math.round(1000 / fps));
    return true;
  },

  pause: function(){
    this.stopTimer();
    return this;
  },

  resume: function(){
    this.startTimer();
    return this;
  },

  stopTimer: function(){
    if (!this.timer)
      return false;
    this.time = $.time() - this.time;
    this.timer = clearInterval(this.timer);
    return true;
  },

  check: function(){
    if (!this.timer)
      return true;
    if (this.opt.link == 'cancel') {
      this.stopTimer();
      return true;
    }
    return false;
  }
});


var Options = function() {
  var args = arguments;
  for(var i=0, l=args.length, ans={}; i<l; i++) {
    var opt = Options[args[i]];
    if(opt.$extend) {
      $.extend(ans, opt);
    } else {
      ans[args[i]] = opt;  
    }
  }
  return ans;
};

  

Options.Margin = {
  $extend: false,
  
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

Options.Canvas = {
    $extend: true,
    injectInto: 'id',
    type: '2D',
    width: false,
    height: false,
    useCanvas: false,
    withLabels: true,
    background: false,
    
    Scene: {
      Lighting: {
        enable: false,
        ambient: [1, 1, 1],
        directional: {
          direction: { x: -100, y: -100, z: -100 },
          color: [0.5, 0.3, 0.1]
        }
      }
    }
};


/*
 * File: Options.Node.js
*/
Options.Node = {
  $extend: false,
  
  overridable: false,
  type: 'circle',
  color: '#ccb',
  alpha: 1,
  dim: 3,
  height: 20,
  width: 90,
  autoHeight: false,
  autoWidth: false,
  lineWidth: 1,
  transform: true,
  align: "center",
  angularWidth:1,
  span:1,
  CanvasStyles: {}
};


/*
 * File: Options.Edge.js
 *
*/

Options.Edge = {
  $extend: false,
  
  overridable: false,
  type: 'line',
  color: '#ccb',
  lineWidth: 1,
  dim:15,
  alpha: 1,
  epsilon: 7,
  CanvasStyles: {}
};


/*
*/
Options.Fx = {
  $extend: true,
  
  fps:40,
  duration: 2500,
  transition: $jit.Trans.Quart.easeInOut,
  clearCanvas: true
};

/*
 * File: Options.Label.js
*/
Options.Label = {
  $extend: false,
  
  overridable: false,
  type: 'HTML', //'SVG', 'Native'
  style: ' ',
  size: 10,
  family: 'sans-serif',
  textAlign: 'center',
  textBaseline: 'alphabetic',
  color: '#fff'
};

/*
 * File: Options.Tips.js
 *
 */

Options.Tips = {
  $extend: false,
  
  enable: false,
  type: 'auto',
  offsetX: 20,
  offsetY: 20,
  force: false,
  onShow: $.empty,
  onHide: $.empty
};


/*
 * File: Options.NodeStyles.js
 */

Options.NodeStyles = {
  $extend: false,
  
  enable: false,
  type: 'auto',
  stylesHover: false,
  stylesClick: false
};


Options.Events = {
  $extend: false,
  
  enable: false,
  enableForEdges: false,
  type: 'auto',
  onClick: $.empty,
  onRightClick: $.empty,
  onMouseMove: $.empty,
  onMouseEnter: $.empty,
  onMouseLeave: $.empty,
  onDragStart: $.empty,
  onDragMove: $.empty,
  onDragCancel: $.empty,
  onDragEnd: $.empty,
  onTouchStart: $.empty,
  onTouchMove: $.empty,
  onTouchEnd: $.empty,
  onMouseWheel: $.empty
};

/*
 * File: Options.Navigation.js
 *
*/

Options.Navigation = {
  $extend: false,
  
  enable: false,
  type: 'auto',
  panning: false, //true | 'avoid nodes'
  zooming: false
};

/*
 * File: Options.Controller.js
*/

Options.Controller = {
  $extend: true,
  
  onBeforeCompute: $.empty,
  onAfterCompute:  $.empty,
  onCreateLabel:   $.empty,
  onPlaceLabel:    $.empty,
  onComplete:      $.empty,
  onBeforePlotLine:$.empty,
  onAfterPlotLine: $.empty,
  onBeforePlotNode:$.empty,
  onAfterPlotNode: $.empty,
  request:         false
};


/*
 * File: Extras.js
 * 
 * Provides Extras such as Tips and Style Effects.
 * 
 * Description:
 * 
 * Provides the <Tips> and <NodeStyles> classes and functions.
 *
 */

/*
 * Manager for mouse events (clicking and mouse moving).
 * 
 * This class is used for registering objects implementing onClick
 * and onMousemove methods. These methods are called when clicking or
 * moving the mouse around  the Canvas.
 * For now, <Tips> and <NodeStyles> are classes implementing these methods.
 * 
 */
// oui
var ExtrasInitializer = {
  initialize: function(className, viz) {	
    this.viz = viz;
    this.canvas = viz.canvas;
    this.config = viz.config[className];
    this.nodeTypes = viz.fx.nodeTypes;
    var type = this.config.type;
    this.dom = type == 'auto'? (viz.config.Label.type != 'Native') : (type != 'Native');
    this.labelContainer = this.dom && viz.labels.getLabelContainer();
    this.isEnabled() && this.initializePost();
  },
  initializePost: $.empty,
  setAsProperty: $.lambda(false),
  isEnabled: function() {
    return this.config.enable;
  },
  isLabel: function(e, win, group) {
    e = $.event.get(e, win);
    var labelContainer = this.labelContainer,
        target = e.target || e.srcElement,
        related = e.relatedTarget;
    if(group) {
      return related && related == this.viz.canvas.getCtx().canvas 
          && !!target && this.isDescendantOf(target, labelContainer);
    } else {
      return this.isDescendantOf(target, labelContainer);
    }
  },
  isDescendantOf: function(elem, par) {
    while(elem && elem.parentNode) {
      if(elem.parentNode == par)
        return elem;
      elem = elem.parentNode;
    }
    return false;
  }
};

var EventsInterface = {
  onMouseUp: $.empty,
  onMouseDown: $.empty,
  onMouseMove: $.empty,
  onMouseOver: $.empty,
  onMouseOut: $.empty,
  onMouseWheel: $.empty,
  onTouchStart: $.empty,
  onTouchMove: $.empty,
  onTouchEnd: $.empty,
  onTouchCancel: $.empty
};

var MouseEventsManager = new Class({
  initialize: function(viz) {
    this.viz = viz;
    this.canvas = viz.canvas;
    this.node = false;
    this.edge = false;
    this.registeredObjects = [];
    this.attachEvents();
  },
  
  attachEvents: function() {
    var htmlCanvas = this.canvas.getElement(), 
        that = this;
    htmlCanvas.oncontextmenu = $.lambda(false);
    $.addEvents(htmlCanvas, {
      'mouseup': function(e, win) {
        var event = $.event.get(e, win);
        that.handleEvent('MouseUp', e, win, 
            that.makeEventObject(e, win), 
            $.event.isRightClick(event));
      },
      'mousedown': function(e, win) {
        var event = $.event.get(e, win);
        that.handleEvent('MouseDown', e, win, that.makeEventObject(e, win), 
            $.event.isRightClick(event));
      },
      'mousemove': function(e, win) {
        that.handleEvent('MouseMove', e, win, that.makeEventObject(e, win));
      },
      'mouseover': function(e, win) {
        that.handleEvent('MouseOver', e, win, that.makeEventObject(e, win));
      },
      'mouseout': function(e, win) {
        that.handleEvent('MouseOut', e, win, that.makeEventObject(e, win));
      },
      'touchstart': function(e, win) {
        that.handleEvent('TouchStart', e, win, that.makeEventObject(e, win));
      },
      'touchmove': function(e, win) {
        that.handleEvent('TouchMove', e, win, that.makeEventObject(e, win));
      },
      'touchend': function(e, win) {
        that.handleEvent('TouchEnd', e, win, that.makeEventObject(e, win));
      }
    });
    //attach mousewheel event
    var handleMouseWheel = function(e, win) {
      var event = $.event.get(e, win);
      var wheel = $.event.getWheel(event);
      that.handleEvent('MouseWheel', e, win, wheel);
    };
    //TODO(nico): this is a horrible check for non-gecko browsers!
    if(!document.getBoxObjectFor && window.mozInnerScreenX == null) {
      $.addEvent(htmlCanvas, 'mousewheel', handleMouseWheel);
    } else {
      htmlCanvas.addEventListener('DOMMouseScroll', handleMouseWheel, false);
    }
  },
  
  register: function(obj) {
    this.registeredObjects.push(obj);
  },
  
  handleEvent: function() {
    var args = Array.prototype.slice.call(arguments),
        type = args.shift();
    for(var i=0, regs=this.registeredObjects, l=regs.length; i<l; i++) {
      regs[i]['on' + type].apply(regs[i], args);
    }
  },
  
  makeEventObject: function(e, win) {
    var that = this,
        graph = this.viz.graph,
        fx = this.viz.fx,
        ntypes = fx.nodeTypes,
        etypes = fx.edgeTypes;
    return {
      pos: false,
      node: false,
      edge: false,
      contains: false,
      getNodeCalled: false,
      getEdgeCalled: false,
      getPos: function() {
        //TODO(nico): check why this can't be cache anymore when using edge detection
        //if(this.pos) return this.pos;
        var canvas = that.viz.canvas,
            s = canvas.getSize(),
            p = canvas.getPos(),
            ox = canvas.translateOffsetX,
            oy = canvas.translateOffsetY,
            sx = canvas.scaleOffsetX,
            sy = canvas.scaleOffsetY,
            pos = $.event.getPos(e, win);
        this.pos = {
          x: (pos.x - p.x - s.width/2 - ox) * 1/sx,
          y: (pos.y - p.y - s.height/2 - oy) * 1/sy
        };
        return this.pos;
      },
      getNode: function() {
        if(this.getNodeCalled) return this.node;
        this.getNodeCalled = true;
        for(var id in graph.nodes) {
          var n = graph.nodes[id],
              geom = n && ntypes[n.getData('type')],
              contains = geom && geom.contains && geom.contains.call(fx, n, this.getPos());
          if(contains) {
            this.contains = contains;
            return that.node = this.node = n;
          }
        }
        return that.node = this.node = false;
      },
      getEdge: function() {
        if(this.getEdgeCalled) return this.edge;
        this.getEdgeCalled = true;
        var hashset = {};
        for(var id in graph.edges) {
          var edgeFrom = graph.edges[id];
          hashset[id] = true;
          for(var edgeId in edgeFrom) {
            if(edgeId in hashset) continue;
            var e = edgeFrom[edgeId],
                geom = e && etypes[e.getData('type')],
                contains = geom && geom.contains && geom.contains.call(fx, e, this.getPos());
            if(contains) {
              this.contains = contains;
              return that.edge = this.edge = e;
            }
          }
        }
        return that.edge = this.edge = false;
      },
      getContains: function() {
        if(this.getNodeCalled) return this.contains;
        this.getNode();
        return this.contains;
      }
    };
  }
});

/* 
 * Provides the initialization function for <NodeStyles> and <Tips> implemented 
 * by all main visualizations.
 *
 */
var Extras = {
  initializeExtras: function() {
    var mem = new MouseEventsManager(this), that = this;
    $.each(['NodeStyles', 'Tips', 'Navigation', 'Events'], function(k) {
      var obj = new Extras.Classes[k](k, that);
      if(obj.isEnabled()) {
        mem.register(obj);
      }
      if(obj.setAsProperty()) {
        that[k.toLowerCase()] = obj;
      }
    });
  }   
};

Extras.Classes = {};
/*
  Class: Events
   
  This class defines an Event API to be accessed by the user.
  The methods implemented are the ones defined in the <Options.Events> object.
*/

Extras.Classes.Events = new Class({
  Implements: [ExtrasInitializer, EventsInterface],
  
  initializePost: function() {
    this.fx = this.viz.fx;
    this.ntypes = this.viz.fx.nodeTypes;
    this.etypes = this.viz.fx.edgeTypes;
    
    this.hovered = false;
    this.pressed = false;
    this.touched = false;

    this.touchMoved = false;
    this.moved = false;
    
  },
  
  setAsProperty: $.lambda(true),
  
  onMouseUp: function(e, win, event, isRightClick) {
    var evt = $.event.get(e, win);
    if(!this.moved) {
      if(isRightClick) {
        this.config.onRightClick(this.hovered, event, evt);
      } else {
        this.config.onClick(this.pressed, event, evt);
      }
    }
    if(this.pressed) {
      if(this.moved) {
        this.config.onDragEnd(this.pressed, event, evt);
      } else {
        this.config.onDragCancel(this.pressed, event, evt);
      }
      this.pressed = this.moved = false;
    }
  },

  onMouseOut: function(e, win, event) {
   //mouseout a label
   var evt = $.event.get(e, win), label;
   if(this.dom && (label = this.isLabel(e, win, true))) {
     this.config.onMouseLeave(this.viz.graph.getNode(label.id),
                              event, evt);
     this.hovered = false;
     return;
   }
   //mouseout canvas
   var rt = evt.relatedTarget,
       canvasWidget = this.canvas.getElement();
   while(rt && rt.parentNode) {
     if(canvasWidget == rt.parentNode) return;
     rt = rt.parentNode;
   }
   if(this.hovered) {
     this.config.onMouseLeave(this.hovered,
         event, evt);
     this.hovered = false;
   }
  },
  
  onMouseOver: function(e, win, event) {
    //mouseover a label
    var evt = $.event.get(e, win), label;
    if(this.dom && (label = this.isLabel(e, win, true))) {
      this.hovered = this.viz.graph.getNode(label.id);
      this.config.onMouseEnter(this.hovered,
                               event, evt);
    }
  },
  
  onMouseMove: function(e, win, event) {

   var label, evt = $.event.get(e, win);
   if(this.pressed) {
	 this.moved = true;
     this.config.onDragMove(this.pressed, event, evt);
     return;
   }
   if(this.dom) {
	 this.config.onMouseMove(this.hovered,
         event, evt);
   } else {		
     if(this.hovered) {
	   var hn = this.hovered;
       var geom = hn.nodeFrom? this.etypes[hn.getData('type')] : this.ntypes[hn.getData('type')];
       var contains = geom && geom.contains 
         && geom.contains.call(this.fx, hn, event.getPos());
       if(contains) {
         this.config.onMouseMove(hn, event, evt);
         return;
       } else {
         this.config.onMouseLeave(hn, event, evt);
         this.hovered = false;
       }
     }
     if(this.hovered = (event.getNode() || (this.config.enableForEdges && event.getEdge()))) {
       this.config.onMouseEnter(this.hovered, event, evt);
     } else {
       this.config.onMouseMove(false, event, evt);
     }
   }
  },
  
  onMouseWheel: function(e, win, delta) {
    this.config.onMouseWheel(delta, $.event.get(e, win));
  },
  
  onMouseDown: function(e, win, event) {
    var evt = $.event.get(e, win), label;
    if(this.dom) {
      if(label = this.isLabel(e, win)) {
        this.pressed = this.viz.graph.getNode(label.id);
      }
    } else {
      this.pressed = event.getNode() || (this.config.enableForEdges && event.getEdge());
    }
    this.pressed && this.config.onDragStart(this.pressed, event, evt);
  },
  
  onTouchStart: function(e, win, event) {
    var evt = $.event.get(e, win), label;
    if(this.dom && (label = this.isLabel(e, win))) {
      this.touched = this.viz.graph.getNode(label.id);
    } else {
      this.touched = event.getNode() || (this.config.enableForEdges && event.getEdge());
    }
    this.touched && this.config.onTouchStart(this.touched, event, evt);
  },
  
  onTouchMove: function(e, win, event) {
    var evt = $.event.get(e, win);
    if(this.touched) {
      this.touchMoved = true;
      this.config.onTouchMove(this.touched, event, evt);
    }
  },
  
  onTouchEnd: function(e, win, event) {
    var evt = $.event.get(e, win);
    if(this.touched) {
      if(this.touchMoved) {
        this.config.onTouchEnd(this.touched, event, evt);
      } else {
        this.config.onTouchCancel(this.touched, event, evt);
      }
      this.touched = this.touchMoved = false;
    }
  }
});

/*
   Class: Tips
*/
// oui
Extras.Classes.Tips = new Class({
  Implements: [ExtrasInitializer, EventsInterface],
  
  initializePost: function() {
    //add DOM tooltip
    if(document.body) {
      var tip = $('_tooltip') || document.createElement('div');
      tip.id = '_tooltip';
      tip.className = 'tip';
      $.extend(tip.style, {
        position: 'absolute',
        display: 'none',
        zIndex: 13000
      });
      document.body.appendChild(tip);
      this.tip = tip;
      this.node = false;
    }
  },
  
  setAsProperty: $.lambda(true),
  
  onMouseOut: function(e, win) {
    //mouseout a label
    var evt = $.event.get(e, win);
    if(this.dom && this.isLabel(e, win, true)) {
      this.hide(true);
      return;
    }
    //mouseout canvas
    var rt = e.relatedTarget,
        canvasWidget = this.canvas.getElement();
    while(rt && rt.parentNode) {
      if(canvasWidget == rt.parentNode) return;
      rt = rt.parentNode;
    }
    this.hide(false);
  },
  
  onMouseOver: function(e, win) {
    //mouseover a label
    var label;
    if(this.dom && (label = this.isLabel(e, win, false))) {
      this.node = this.viz.graph.getNode(label.id);
      this.config.onShow(this.tip, this.node, label);
    }
  },
  
  onMouseMove: function(e, win, opt) {
    if(this.dom && this.isLabel(e, win)) {
      this.setTooltipPosition($.event.getPos(e, win));
    }
    if(!this.dom) {
      var node = opt.getNode();
      if(!node) {
        this.hide(true);
        return;
      }
      if(this.config.force || !this.node || this.node.id != node.id) {
        this.node = node;
        this.config.onShow(this.tip, node, opt.getContains());
      }
      this.setTooltipPosition($.event.getPos(e, win));
    }
  },
  
  setTooltipPosition: function(pos) {
    var tip = this.tip, 
        style = tip.style, 
        cont = this.config;
    style.display = '';
    //get window dimensions
    var win = {
      'height': document.body.clientHeight,
      'width': document.body.clientWidth
    };
    //get tooltip dimensions
    var obj = {
      'width': tip.offsetWidth,
      'height': tip.offsetHeight  
    };
    //set tooltip position
    var x = cont.offsetX, y = cont.offsetY;
    style.top = ((pos.y + y + obj.height > win.height)?  
        (pos.y - obj.height - y) : pos.y + y) + 'px';
    style.left = ((pos.x + obj.width + x > win.width)? 
        (pos.x - obj.width - x) : pos.x + x) + 'px';
  },
  
  hide: function(triggerCallback) {
    this.tip.style.display = 'none';
    triggerCallback && this.config.onHide();
  }
});

/*
  Class: NodeStyles
  Change node styles when clicking or hovering a node. This class is used internally.
  Used by:  
  See also:  
  <Options.NodeStyles>
*/
Extras.Classes.NodeStyles = new Class({
  Implements: [ExtrasInitializer, EventsInterface],
  
  initializePost: function() {
    this.fx = this.viz.fx;
    this.types = this.viz.fx.nodeTypes;
    this.nStyles = this.config;
    this.nodeStylesOnHover = this.nStyles.stylesHover;
    this.nodeStylesOnClick = this.nStyles.stylesClick;
    this.hoveredNode = false;
    this.fx.nodeFxAnimation = new Animation();
    
    this.down = false;
    this.move = false;
  },
  
  onMouseOut: function(e, win) {
    this.down = this.move = false;
    if(!this.hoveredNode) return;
    //mouseout a label
    if(this.dom && this.isLabel(e, win, true)) {
      this.toggleStylesOnHover(this.hoveredNode, false);
    }
    //mouseout canvas
    var rt = e.relatedTarget,
        canvasWidget = this.canvas.getElement();
    while(rt && rt.parentNode) {
      if(canvasWidget == rt.parentNode) return;
      rt = rt.parentNode;
    }
    this.toggleStylesOnHover(this.hoveredNode, false);
    this.hoveredNode = false;
  },
  
  onMouseOver: function(e, win) {
   //mouseover a label
    var label;
    if(this.dom && (label = this.isLabel(e, win, true))) {
      var node = this.viz.graph.getNode(label.id);
      if(node.selected) return;
      this.hoveredNode = node;
      this.toggleStylesOnHover(this.hoveredNode, true);
    }
  },
  
  onMouseDown: function(e, win, event, isRightClick) {
    if(isRightClick) return;
    var label;
    if(this.dom && (label = this.isLabel(e, win))) {
      this.down = this.viz.graph.getNode(label.id);
    } else if(!this.dom) {
      this.down = event.getNode();
    }
    this.move = false;
  },
  
  onMouseUp: function(e, win, event, isRightClick) {
    if(isRightClick) return;
    if(!this.move) {
      this.onClick(event.getNode());
    }
    this.down = this.move = false;
  },
  
  getRestoredStyles: function(node, type) {
    var restoredStyles = {}, 
        nStyles = this['nodeStylesOn' + type];
    for(var prop in nStyles) {
      restoredStyles[prop] = node.styles['$' + prop];
    }
    return restoredStyles;
  },
  
  toggleStylesOnHover: function(node, set) {
    if(this.nodeStylesOnHover) {
      this.toggleStylesOn('Hover', node, set);
    }
  },

  toggleStylesOnClick: function(node, set) {
    if(this.nodeStylesOnClick) {
      this.toggleStylesOn('Click', node, set);
    }
  },
  
  toggleStylesOn: function(type, node, set) {
    var viz = this.viz;
    var nStyles = this.nStyles;
    if(set) {
      var that = this;
      if(!node.styles) {
        node.styles = $.merge(node.data, {});
      }
      for(var s in this['nodeStylesOn' + type]) {
        var $s = '$' + s;
        if(!($s in node.styles)) {
            node.styles[$s] = node.getData(s); 
        }
      }
      viz.fx.nodeFx($.extend({
        'elements': {
          'id': node.id,
          'properties': that['nodeStylesOn' + type]
         },
         transition: Trans.Quart.easeOut,
         duration:300,
         fps:40
      }, this.config));
    } else {
      var restoredStyles = this.getRestoredStyles(node, type);
      viz.fx.nodeFx($.extend({
        'elements': {
          'id': node.id,
          'properties': restoredStyles
         },
         transition: Trans.Quart.easeOut,
         duration:300,
         fps:40
      }, this.config));
    }
  },

  /*onClick: function(node) {
    //if(!node) return;
    var nStyles = this.nodeStylesOnClick;
	if(!nStyles) return;
    //if the node is selected then unselect it
	alert("ns="+node.selected) ;
    if(node.selected) {
      this.toggleStylesOnClick(node, false);
      delete node.selected;
    } else {
      alert("ns="+node.selected) ;
      //unselect all selected nodes...
      this.viz.graph.eachNode(function(n) {
        if(n.selected) {
          for(var s in nStyles) {
            n.setData(s, n.styles['$' + s], 'end');
          }
          delete n.selected;
        }
      });
      //select clicked node
      this.toggleStylesOnClick(node, true);
      node.selected = true;
      delete node.hovered;
      this.hoveredNode = false;
    }
  },*/
  
  onMouseMove: function(e, win, event) {
    //if mouse button is down and moving set move=true
    if(this.down) this.move = true;
    //already handled by mouseover/out
    if(this.dom && this.isLabel(e, win)) return;
    var nStyles = this.nodeStylesOnHover;
    if(!nStyles) return;
    
    if(!this.dom) {
      if(this.hoveredNode) {
        var geom = this.types[this.hoveredNode.getData('type')];
        var contains = geom && geom.contains && geom.contains.call(this.fx, 
            this.hoveredNode, event.getPos());
        if(contains) return;
      }
      var node = event.getNode();
      //if no node is being hovered then just exit
      if(!this.hoveredNode && !node) return;
      //if the node is hovered then exit
      if(node.hovered) return;
      //select hovered node
      if(node && !node.selected) {
        //check if an animation is running and exit it
        this.fx.nodeFxAnimation.stopTimer();
        //unselect all hovered nodes...
        this.viz.graph.eachNode(function(n) {
          if(n.hovered && !n.selected) {
            for(var s in nStyles) {
              n.setData(s, n.styles['$' + s], 'end');
            }
            delete n.hovered;
          }
        });
        //select hovered node
        node.hovered = true;
        this.hoveredNode = node;
        this.toggleStylesOnHover(node, true);
      } else if(this.hoveredNode && !this.hoveredNode.selected) {
        //check if an animation is running and exit it
        this.fx.nodeFxAnimation.stopTimer();
        //unselect hovered node
        this.toggleStylesOnHover(this.hoveredNode, false);
        delete this.hoveredNode.hovered;
        this.hoveredNode = false;
      }
    }
  }
});

Extras.Classes.Navigation = new Class({
  Implements: [ExtrasInitializer, EventsInterface],
  
  initializePost: function() {
    this.pos = false;
    this.pressed = false;
  },
  
  onMouseWheel: function(e, win, scroll) {
    if(!this.config.zooming) return;
    $.event.stop($.event.get(e, win));
    var val = this.config.zooming / 1000,
        ans = 1 + scroll * val;
    this.canvas.scale(ans, ans);
  },
  
  onMouseDown: function(e, win, eventInfo) {
    if(!this.config.panning) return;
    if(this.config.panning == 'avoid nodes' && (this.dom? this.isLabel(e, win) : eventInfo.getNode())) return;
    this.pressed = true;
    this.pos = eventInfo.getPos();
    var canvas = this.canvas,
        ox = canvas.translateOffsetX,
        oy = canvas.translateOffsetY,
        sx = canvas.scaleOffsetX,
        sy = canvas.scaleOffsetY;
    this.pos.x *= sx;
    this.pos.x += ox;
    this.pos.y *= sy;
    this.pos.y += oy;
  },
  
  onMouseMove: function(e, win, eventInfo) {
    if(!this.config.panning) return;
    if(!this.pressed) return;
    if(this.config.panning == 'avoid nodes' && (this.dom? this.isLabel(e, win) : eventInfo.getNode())) return;
    var thispos = this.pos, 
        currentPos = eventInfo.getPos(),
        canvas = this.canvas,
        ox = canvas.translateOffsetX,
        oy = canvas.translateOffsetY,
        sx = canvas.scaleOffsetX,
        sy = canvas.scaleOffsetY;
    currentPos.x *= sx;
    currentPos.y *= sy;
    currentPos.x += ox;
    currentPos.y += oy;
    var x = currentPos.x - thispos.x,
        y = currentPos.y - thispos.y;
    this.pos = currentPos;
    this.canvas.translate(x * 1/sx, y * 1/sy);
  },
  
  onMouseUp: function(e, win, eventInfo, isRightClick) {
    if(!this.config.panning) return;
    this.pressed = false;
  }
});


/*
 * File: Canvas.js
 *
 */
var Canvas;
(function() {
  //check for native canvas support
  var canvasType = typeof HTMLCanvasElement,
      supportsCanvas = (canvasType == 'object' || canvasType == 'function');
  //create element function
  function $E(tag, props) {
    var elem = document.createElement(tag);
    for(var p in props) {
      if(typeof props[p] == "object") {
        $.extend(elem[p], props[p]);
      } else {
        elem[p] = props[p];
      }
    }
    if (tag == "canvas" && !supportsCanvas && G_vmlCanvasManager) {
      elem = G_vmlCanvasManager.initElement(document.body.appendChild(elem));
    }
    return elem;
  }
  //canvas widget which we will call just Canvas
  $jit.Canvas = Canvas = new Class({
    canvases: [],
    pos: false,
    element: false,
    labelContainer: false,
    translateOffsetX: 0,
    translateOffsetY: 0,
    scaleOffsetX: 1,
    scaleOffsetY: 1,
    
    initialize: function(viz, opt) {
      this.viz = viz;
      this.opt = this.config = opt;
      var id = $.type(opt.injectInto) == 'string'? 
          opt.injectInto:opt.injectInto.id,
          type = opt.type,
          idLabel = id + "-label", 
          wrapper = $(id),
          width = opt.width || wrapper.offsetWidth,
          height = opt.height || wrapper.offsetHeight;
      this.id = id;
      // Canvas options
      var canvasOptions = {
        injectInto: id,
        width: width,
        height: height
      };
      //create main wrapper
      this.element = $E('div', {
        'id': id + '-canvaswidget',
        'style': {
          'position': 'relative',
          'width': width + 'px',
          'height': height + 'px'
        }
      });
      //create label container
      this.labelContainer = this.createLabelContainer(opt.Label.type, 
          idLabel, canvasOptions);
      //create primary canvas
      this.canvases.push(new Canvas.Base[type]({
        config: $.extend({idSuffix: '-canvas'}, canvasOptions),
        plot: function(base) {
          viz.fx.plot();
        },
        resize: function() {
          viz.refresh();
        }
      }));
      //create secondary canvas
      var back = opt.background;
      if(back) {
        var backCanvas = new Canvas.Background[back.type](viz, $.extend(back, canvasOptions));
        this.canvases.push(new Canvas.Base[type](backCanvas));
      }
      //insert canvases
      var len = this.canvases.length;
      while(len--) {
        this.element.appendChild(this.canvases[len].canvas);
        if(len > 0) {
          this.canvases[len].plot();
        }
      }
      this.element.appendChild(this.labelContainer);
      wrapper.appendChild(this.element);
      //Update canvas position when the page is scrolled.
      var timer = null, that = this;
      $.addEvent(window, 'scroll', function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
          that.getPos(true); //update canvas position
        }, 500);
      });
    },
    /*
      Method: getCtx
     */
    getCtx: function(i) {
      return this.canvases[i || 0].getCtx();
    },
    /*
      Method: getConfig
    */
    getConfig: function() {
      return this.opt;
    },
    /*
      Method: getElement
    */
    getElement: function() {
      return this.element;
    },
    /*
      Method: getSize
    */
    getSize: function(i) {
      return this.canvases[i || 0].getSize();
    },
    /*
      Method: resize
    */
    resize: function(width, height) {
      this.getPos(true);
      this.translateOffsetX = this.translateOffsetY = 0;
      this.scaleOffsetX = this.scaleOffsetY = 1;
      for(var i=0, l=this.canvases.length; i<l; i++) {
        this.canvases[i].resize(width, height);
      }
      var style = this.element.style;
      style.width = width + 'px';
      style.height = height + 'px';
      if(this.labelContainer)
        this.labelContainer.style.width = width + 'px';
    },
    /*
      Method: translate 
    */
    translate: function(x, y, disablePlot) {
      this.translateOffsetX += x*this.scaleOffsetX;
      this.translateOffsetY += y*this.scaleOffsetY;
      for(var i=0, l=this.canvases.length; i<l; i++) {
        this.canvases[i].translate(x, y, disablePlot);
      }
    },
    /*
      Method: scale
     */
    scale: function(x, y, disablePlot) {
      var px = this.scaleOffsetX * x,
          py = this.scaleOffsetY * y;
      var dx = this.translateOffsetX * (x -1) / px,
          dy = this.translateOffsetY * (y -1) / py;
      this.scaleOffsetX = px;
      this.scaleOffsetY = py;
      for(var i=0, l=this.canvases.length; i<l; i++) {
        this.canvases[i].scale(x, y, true);
      }
      this.translate(dx, dy, false);
    },
    /*
      Method: getPos
   */
    getPos: function(force){
      if(force || !this.pos) {
        return this.pos = $.getPos(this.getElement());
      }
      return this.pos;
    },
    /*
       Method: clear
       Clears the canvas.
    */
    clear: function(i){
      this.canvases[i||0].clear();
    },
    
    path: function(type, action){
      var ctx = this.canvases[0].getCtx();
      ctx.beginPath();
      action(ctx);
      ctx[type]();
      ctx.closePath();
    },
    
    createLabelContainer: function(type, idLabel, dim) {
      var NS = 'http://www.w3.org/2000/svg';
      if(type == 'HTML' || type == 'Native') {
        return $E('div', {
          'id': idLabel,
          'style': {
            'overflow': 'visible',
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': dim.width + 'px',
            'height': 0
          }
        });
      } else if(type == 'SVG') {
        var svgContainer = document.createElementNS(NS, 'svg:svg');
        svgContainer.setAttribute("width", dim.width);
        svgContainer.setAttribute('height', dim.height);
        var style = svgContainer.style;
        style.position = 'absolute';
        style.left = style.top = '0px';
        var labelContainer = document.createElementNS(NS, 'svg:g');
        labelContainer.setAttribute('width', dim.width);
        labelContainer.setAttribute('height', dim.height);
        labelContainer.setAttribute('x', 0);
        labelContainer.setAttribute('y', 0);
        labelContainer.setAttribute('id', idLabel);
        svgContainer.appendChild(labelContainer);
        return svgContainer;
      }
    }
  });
  //base canvas wrapper
  Canvas.Base = {};
  Canvas.Base['2D'] = new Class({
    translateOffsetX: 0,
    translateOffsetY: 0,
    scaleOffsetX: 1,
    scaleOffsetY: 1,

    initialize: function(viz) {
      this.viz = viz;
      this.opt = viz.config;
      this.size = false;
      this.createCanvas();
      this.translateToCenter();
    },
    createCanvas: function() {
      var opt = this.opt,
          width = opt.width,
          height = opt.height;
      this.canvas = $E('canvas', {
        'id': opt.injectInto + opt.idSuffix,
        'width': width,
        'height': height,
        'style': {
          'position': 'absolute',
          'top': 0,
          'left': 0,
          'width': width + 'px',
          'height': height + 'px'
        }
      });
    },
    getCtx: function() {
      if(!this.ctx) 
        return this.ctx = this.canvas.getContext('2d');
      return this.ctx;
    },
    getSize: function() {
      if(this.size) return this.size;
      var canvas = this.canvas;
      return this.size = {
        width: canvas.width,
        height: canvas.height
      };
    },
    translateToCenter: function(ps) {
      var size = this.getSize(),
          width = ps? (size.width - ps.width - this.translateOffsetX*2) : size.width;
          height = ps? (size.height - ps.height - this.translateOffsetY*2) : size.height;
      var ctx = this.getCtx();
      ps && ctx.scale(1/this.scaleOffsetX, 1/this.scaleOffsetY);
      ctx.translate(width/2, height/2);
    },
    resize: function(width, height) {
      var size = this.getSize(),
          canvas = this.canvas,
          styles = canvas.style;
      this.size = false;
      canvas.width = width;
      canvas.height = height;
      styles.width = width + "px";
      styles.height = height + "px";
      //small ExCanvas fix
      if(!supportsCanvas) {
        this.translateToCenter(size);
      } else {
        this.translateToCenter();
      }
      this.translateOffsetX =
        this.translateOffsetY = 0;
      this.scaleOffsetX = 
        this.scaleOffsetY = 1;
      this.clear();
      this.viz.resize(width, height, this);
    },
    translate: function(x, y, disablePlot) {
      var sx = this.scaleOffsetX,
          sy = this.scaleOffsetY;
      this.translateOffsetX += x*sx;
      this.translateOffsetY += y*sy;
      this.getCtx().translate(x, y);
      !disablePlot && this.plot();
    },
    scale: function(x, y, disablePlot) {
      this.scaleOffsetX *= x;
      this.scaleOffsetY *= y;
      this.getCtx().scale(x, y);
      !disablePlot && this.plot();
    },
    clear: function(){
      var size = this.getSize(),
          ox = this.translateOffsetX,
          oy = this.translateOffsetY,
          sx = this.scaleOffsetX,
          sy = this.scaleOffsetY;
      this.getCtx().clearRect((-size.width / 2 - ox) * 1/sx, 
                              (-size.height / 2 - oy) * 1/sy, 
                              size.width * 1/sx, size.height * 1/sy);
    },
    plot: function() {
      this.clear();
      this.viz.plot(this);
    }
  });
  //background canvases

  Canvas.Background = {};
  Canvas.Background.Circles = new Class({
    initialize: function(viz, options) {
      this.viz = viz;
      this.config = $.merge({
        idSuffix: '-bkcanvas',
        levelDistance: 100,
        numberOfCircles: 6,
        CanvasStyles: {},
        offset: 0
      }, options);
    },
    resize: function(width, height, base) {
      this.plot(base);
    },
    plot: function(base) {
      var canvas = base.canvas,
          ctx = base.getCtx(),
          conf = this.config,
          styles = conf.CanvasStyles;
      //set canvas styles
      for(var s in styles) ctx[s] = styles[s];
      var n = conf.numberOfCircles,
          rho = conf.levelDistance;
      for(var i=1; i<=n; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, rho * i, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.closePath();
      }
    }
  });
})();






/*
 * File: Complex.js
 * 
 * Defines the <Complex> class.
 *
 * Description:
 *
 * The <Complex> class, just like the <Polar> class, is used by the <Hypertree>, <ST> and <RGraph> as a 2D point representation.
 *
 * See also:
 *
 * <http://en.wikipedia.org/wiki/Complex_number>
 *
*/

/*
   Class: Complex
    
   A multi-purpose Complex Class with common methods.
 
   Description:
 
   The <Complex> class, just like the <Polar> class, is used by the <Hypertree>, <ST> and <RGraph> as a 2D point representation.
 
   See also:
 
   <http://en.wikipedia.org/wiki/Complex_number>

   Parameters:

   x - _optional_ A Complex number real part.
   y - _optional_ A Complex number imaginary part.
 
*/

var Complex = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

$jit.Complex = Complex;

Complex.prototype = {
    /*
       Method: getc
       Returns a complex number.
 
       Returns:   
          A complex number.
    */
    getc: function() {
        return this;
    },

    /*
       Method: getp
       Returns a <Polar> representation of this number.
    
       Parameters:
       simple - _optional_ If *true*, this method will return only an object holding theta and rho properties and not a <Polar> instance. Default's *false*.
       Returns:
    
          A variable in <Polar> coordinates.
    */
    getp: function(simple) {
        return this.toPolar(simple);
    },


    /*
       Method: set
       Sets a number.

       Parameters:
       c - A <Complex> or <Polar> instance.
    
    */
    set: function(c) {
      c = c.getc(true);
      this.x = c.x; 
      this.y = c.y;
    },

    /*
       Method: setc
       Sets a complex number.

       Parameters:
       x - A <Complex> number Real part.
       y - A <Complex> number Imaginary part.
    
    */
    setc: function(x, y) {
        this.x = x; 
        this.y = y;
    },

    /*
       Method: setp
       Sets a polar number.

       Parameters:
       theta - A <Polar> number theta property.
       rho - A <Polar> number rho property.
    
    */
    setp: function(theta, rho) {
        this.x = Math.cos(theta) * rho;
        this.y = Math.sin(theta) * rho;
    },

    /*
       Method: clone
    
       Returns a copy of the current object.
    
       Returns:
    
          A copy of the real object.
    */
    clone: function() {
        return new Complex(this.x, this.y);
    },

    /*
       Method: toPolar
    
       Transforms cartesian to polar coordinates.
    
       Parameters:

       simple - _optional_ If *true* this method will only return an object with theta and rho properties (and not the whole <Polar> instance). Default's *false*.
       
       Returns:
    
          A new <Polar> instance.
    */
    
    toPolar: function(simple) {
        var rho = this.norm();
        var atan = Math.atan2(this.y, this.x);
        if(atan < 0) atan += Math.PI * 2;
        if(simple) return { 'theta': atan, 'rho': rho };
        return new Polar(atan, rho);
    },
    /*
       Method: norm
    
       Calculates a <Complex> number norm.
    
       Returns:
    
          A real number representing the complex norm.
    */
    norm: function () {
        return Math.sqrt(this.squaredNorm());
    },
    
    /*
       Method: squaredNorm
    
       Calculates a <Complex> number squared norm.
    
       Returns:
    
          A real number representing the complex squared norm.
    */
    squaredNorm: function () {
        return this.x*this.x + this.y*this.y;
    },

    /*
       Method: add
    
       Returns the result of adding two complex numbers.
       
       Does not alter the original object.

       Parameters:
    
          pos - A <Complex> instance.
    
       Returns:
    
         The result of adding two complex numbers.
    */
    add: function(pos) {
        return new Complex(this.x + pos.x, this.y + pos.y);
    },

    /*
       Method: prod
    
       Returns the result of multiplying two <Complex> numbers.
       
       Does not alter the original object.

       Parameters:
    
          pos - A <Complex> instance.
    
       Returns:
    
         The result of multiplying two complex numbers.
    */
    prod: function(pos) {
        return new Complex(this.x*pos.x - this.y*pos.y, this.y*pos.x + this.x*pos.y);
    },

    /*
       Method: conjugate
    
       Returns the conjugate of this <Complex> number.

       Does not alter the original object.

       Returns:
    
         The conjugate of this <Complex> number.
    */
    conjugate: function() {
        return new Complex(this.x, -this.y);
    },


    /*
       Method: scale
    
       Returns the result of scaling a <Complex> instance.
       
       Does not alter the original object.

       Parameters:
    
          factor - A scale factor.
    
       Returns:
    
         The result of scaling this complex to a factor.
    */
    scale: function(factor) {
        return new Complex(this.x * factor, this.y * factor);
    },

    /*
       Method: equals
    
       Comparison method.

       Returns *true* if both real and imaginary parts are equal.

       Parameters:

       c - A <Complex> instance.

       Returns:

       A boolean instance indicating if both <Complex> numbers are equal.
    */
    equals: function(c) {
        return this.x == c.x && this.y == c.y;
    },

    /*
       Method: $add
    
       Returns the result of adding two <Complex> numbers.
       
       Alters the original object.

       Parameters:
    
          pos - A <Complex> instance.
    
       Returns:
    
         The result of adding two complex numbers.
    */
    $add: function(pos) {
        this.x += pos.x; this.y += pos.y;
        return this;    
    },
    
    /*
       Method: $prod
    
       Returns the result of multiplying two <Complex> numbers.
       
       Alters the original object.

       Parameters:
    
          pos - A <Complex> instance.
    
       Returns:
    
         The result of multiplying two complex numbers.
    */
    $prod:function(pos) {
        var x = this.x, y = this.y;
        this.x = x*pos.x - y*pos.y;
        this.y = y*pos.x + x*pos.y;
        return this;
    },
    
    /*
       Method: $conjugate
    
       Returns the conjugate for this <Complex>.
       
       Alters the original object.

       Returns:
    
         The conjugate for this complex.
    */
    $conjugate: function() {
        this.y = -this.y;
        return this;
    },
    
    /*
       Method: $scale
    
       Returns the result of scaling a <Complex> instance.
       
       Alters the original object.

       Parameters:
    
          factor - A scale factor.
    
       Returns:
    
         The result of scaling this complex to a factor.
    */
    $scale: function(factor) {
        this.x *= factor; this.y *= factor;
        return this;
    },
    
    /*
       Method: $div
    
       Returns the division of two <Complex> numbers.
       
       Alters the original object.

       Parameters:
    
          pos - A <Complex> number.
    
       Returns:
    
         The result of scaling this complex to a factor.
    */
    $div: function(pos) {
        var x = this.x, y = this.y;
        var sq = pos.squaredNorm();
        this.x = x * pos.x + y * pos.y; this.y = y * pos.x - x * pos.y;
        return this.$scale(1 / sq);
    },

    /*
      Method: isZero
   
      Returns *true* if the number is zero.
   
   */
    isZero: function () {
      var almostZero = 0.0001, abs = Math.abs;
      return abs(this.x) < almostZero && abs(this.y) < almostZero;
    }
};

var $C = function(a, b) { return new Complex(a, b); };

Complex.KER = $C(0, 0);


 

$jit.Graph = new Class({

  initialize: function(opt, Node, Edge, Label) {
    var innerOptions = {
    'klass': Complex,
    'Node': {}
    };
    this.Node = Node;
    this.Edge = Edge;
    this.Label = Label;
    this.opt = $.merge(innerOptions, opt || {});
    this.nodes = {};
    this.edges = {};
    
    //add nodeList methods
    var that = this;
    this.nodeList = {};
    for(var p in Accessors) {
      that.nodeList[p] = (function(p) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          that.eachNode(function(n) {
            n[p].apply(n, args);
          });
        };
      })(p);
    }

 },

/*
     Method: getNode
     Returns a <Graph.Node> by *id*
     Parameters:
     id - (string) A <Graph.Node> id.

     Example:
     (start code js)
       var node = graph.getNode('nodeId');
     (end code)
*/  
 getNode: function(id) {
    if(this.hasNode(id)) return this.nodes[id];
    return false;
 },

 /*
     Method: get
    
     An alias for <Graph.Util.getNode>. Returns a node by *id*.
    
     Parameters:
    
     id - (string) A <Graph.Node> id.
    
     Example:
    
     (start code js)
       var node = graph.get('nodeId');
     (end code)
*/  
  get: function(id) {
    return this.getNode(id);
  },

 /*
   Method: getByName
  
   Returns a <Graph.Node> by *name*.
  
   Parameters:
  
   name - (string) A <Graph.Node> name.
  
   Example:
  
   (start code js)
     var node = graph.getByName('someName');
   (end code)
  */  
  getByName: function(name) {
    for(var id in this.nodes) {
      var n = this.nodes[id];
      if(n.name == name) return n;
    }
    return false;
  },

/*
   Method: getAdjacence
  
   Returns a <Graph.Adjacence> object connecting nodes with ids *id* and *id2*.

   Parameters:

   id - (string) A <Graph.Node> id.
   id2 - (string) A <Graph.Node> id.
*/  
  getAdjacence: function (id, id2) {
    if(id in this.edges) {
      return this.edges[id][id2];
    }
    return false;
 },

    /*
     Method: addNode
    
     Adds a node.
     
     Parameters:
    
      obj - An object with the properties described below

      id - (string) A node id
      name - (string) A node's name
      data - (object) A node's data hash

    See also:
    <Graph.Node>

  */  
  addNode: function(obj) { 
   if(!this.nodes[obj.id]) {  
     var edges = this.edges[obj.id] = {};
     this.nodes[obj.id] = new Graph.Node($.extend({
        'id': obj.id,
        'name': obj.name,
        'data': $.merge(obj.data || {}, {}),
        'adjacencies': edges 
      }, this.opt.Node), 
      this.opt.klass, 
      this.Node, 
      this.Edge,
      this.Label);
    }
    return this.nodes[obj.id];
  },
  
    /*
     Method: addAdjacence
    
     Connects nodes specified by *obj* and *obj2*. If not found, nodes are created.
     
     Parameters:
    
      obj - (object) A <Graph.Node> object.
      obj2 - (object) Another <Graph.Node> object.
      data - (object) A data object. Used to store some extra information in the <Graph.Adjacence> object created.

    See also:

    <Graph.Node>, <Graph.Adjacence>
    */  
  addAdjacence: function (obj, obj2, data) {
    if(!this.hasNode(obj.id)) { this.addNode(obj); }
    if(!this.hasNode(obj2.id)) { this.addNode(obj2); }
    obj = this.nodes[obj.id]; obj2 = this.nodes[obj2.id];
    if(!obj.adjacentTo(obj2)) {
      var adjsObj = this.edges[obj.id] = this.edges[obj.id] || {};
      var adjsObj2 = this.edges[obj2.id] = this.edges[obj2.id] || {};
      adjsObj[obj2.id] = adjsObj2[obj.id] = new Graph.Adjacence(obj, obj2, data, this.Edge, this.Label);
      return adjsObj[obj2.id];
    }
    return this.edges[obj.id][obj2.id];
 },

    /*
     Method: removeNode
    
     Removes a <Graph.Node> matching the specified *id*.

     Parameters:

     id - (string) A node's id.

    */  
  removeNode: function(id) {
    if(this.hasNode(id)) {
      delete this.nodes[id];
      var adjs = this.edges[id];
      for(var to in adjs) {
        delete this.edges[to][id];
      }
      delete this.edges[id];
    }
  },
  
/*
     Method: removeAdjacence
    
     Removes a <Graph.Adjacence> matching *id1* and *id2*.

     Parameters:

     id1 - (string) A <Graph.Node> id.
     id2 - (string) A <Graph.Node> id.
*/  
  removeAdjacence: function(id1, id2) {
    delete this.edges[id1][id2];
    delete this.edges[id2][id1];
  },

   /*
     Method: hasNode
    
     Returns a boolean indicating if the node belongs to the <Graph> or not.
     
     Parameters:
    
        id - (string) Node id.
   */  
  hasNode: function(id) {
    return id in this.nodes;
  },
  
  /*
    Method: empty

    Empties the Graph

  */
  empty: function() { this.nodes = {}; this.edges = {};}

});

var Graph = $jit.Graph;

/*
 Object: Accessors
 
 Defines a set of methods for data, canvas and label styles manipulation implemented by <Graph.Node> and <Graph.Adjacence> instances.
 
 */
var Accessors;

(function () {
  var getDataInternal = function(prefix, prop, type, force, prefixConfig) {
    var data;
    type = type || 'current';
    prefix = "$" + (prefix ? prefix + "-" : "");

    if(type == 'current') {
      data = this.data;
    } else if(type == 'start') {
      data = this.startData;
    } else if(type == 'end') {
      data = this.endData;
    }

    var dollar = prefix + prop;

    if(force) {
      return data[dollar];
    }

    if(!this.Config.overridable)
      return prefixConfig[prop] || 0;

    return (dollar in data) ?
      data[dollar] : ((dollar in this.data) ? this.data[dollar] : (prefixConfig[prop] || 0));
  }

  var setDataInternal = function(prefix, prop, value, type) {
    type = type || 'current';
    prefix = '$' + (prefix ? prefix + '-' : '');

    var data;

    if(type == 'current') {
      data = this.data;
    } else if(type == 'start') {
      data = this.startData;
    } else if(type == 'end') {
      data = this.endData;
    }

    data[prefix + prop] = value;
  }

  var removeDataInternal = function(prefix, properties) {
    prefix = '$' + (prefix ? prefix + '-' : '');
    var that = this;
    $.each(properties, function(prop) {
      var pref = prefix + prop;
      delete that.data[pref];
      delete that.endData[pref];
      delete that.startData[pref];
    });
  }

  Accessors = {
    /*
    Method: getData

    Returns the specified data value property.
    This is useful for querying special/reserved <Graph.Node> data properties
    (i.e dollar prefixed properties).

    Parameters:

      prop  - (string) The name of the property. The dollar sign is not needed. For
              example *getData(width)* will return *data.$width*.
      type  - (string) The type of the data property queried. Default's "current". You can access *start* and *end* 
              data properties also. These properties are used when making animations.
      force - (boolean) Whether to obtain the true value of the property (equivalent to
              *data.$prop*) or to check for *node.overridable = true* first.

    Returns:

      The value of the dollar prefixed property or the global Node/Edge property
      value if *overridable=false*

    Example:
    (start code js)
     node.getData('width'); //will return node.data.$width if Node.overridable=true;
    (end code)
    */
    getData: function(prop, type, force) {
      return getDataInternal.call(this, "", prop, type, force, this.Config);
    },


    /*
    Method: setData

    Sets the current data property with some specific value.
    This method is only useful for reserved (dollar prefixed) properties.

    Parameters:

      prop  - (string) The name of the property. The dollar sign is not necessary. For
              example *setData(width)* will set *data.$width*.
      value - (mixed) The value to store.
      type  - (string) The type of the data property to store. Default's "current" but
              can also be "start" or "end".

    Example:
    
    (start code js)
     node.setData('width', 30);
    (end code)
    
    If we were to make an animation of a node/edge width then we could do
    
    (start code js)
      var node = viz.getNode('nodeId');
      //set start and end values
      node.setData('width', 10, 'start');
      node.setData('width', 30, 'end');
      //will animate nodes width property
      viz.fx.animate({
        modes: ['node-property:width'],
        duration: 1000
      });
    (end code)
    */
    setData: function(prop, value, type) {
      setDataInternal.call(this, "", prop, value, type);
    },

    /*
    Method: setDataset

    Convenience method to set multiple data values at once.
    
    Parameters:
    
    types - (array|string) A set of 'current', 'end' or 'start' values.
    obj - (object) A hash containing the names and values of the properties to be altered.

    Example:
    (start code js)
      node.setDataset(['current', 'end'], {
        'width': [100, 5],
        'color': ['#fff', '#ccc']
      });
      //...or also
      node.setDataset('end', {
        'width': 5,
        'color': '#ccc'
      });
    (end code)
    
    See also: 
    
    <Accessors.setData>
    
    */
    setDataset: function(types, obj) {
      types = $.splat(types);
      for(var attr in obj) {
        for(var i=0, val = $.splat(obj[attr]), l=types.length; i<l; i++) {
          this.setData(attr, val[i], types[i]);
        }
      }
    },
    
    /*
    Method: removeData

    Remove data properties.

    Parameters:

    One or more property names as arguments. The dollar sign is not needed.

    Example:
    (start code js)
    node.removeData('width'); //now the default width value is returned
    (end code)
    */
    removeData: function() {
      removeDataInternal.call(this, "", Array.prototype.slice.call(arguments));
    },

    /*
    Method: getCanvasStyle

    Returns the specified canvas style data value property. This is useful for
    querying special/reserved <Graph.Node> canvas style data properties (i.e.
    dollar prefixed properties that match with $canvas-<name of canvas style>).

    Parameters:

      prop  - (string) The name of the property. The dollar sign is not needed. For
              example *getCanvasStyle(shadowBlur)* will return *data[$canvas-shadowBlur]*.
      type  - (string) The type of the data property queried. Default's *current*. You can access *start* and *end* 
              data properties also.
              
    Example:
    (start code js)
      node.getCanvasStyle('shadowBlur');
    (end code)
    
    See also:
    
    <Accessors.getData>
    */
    getCanvasStyle: function(prop, type, force) {
      return getDataInternal.call(
          this, 'canvas', prop, type, force, this.Config.CanvasStyles);
    },

    /*
    Method: setCanvasStyle

    Sets the canvas style data property with some specific value.
    This method is only useful for reserved (dollar prefixed) properties.
    
    Parameters:
    
    prop - (string) Name of the property. Can be any canvas property like 'shadowBlur', 'shadowColor', 'strokeStyle', etc.
    value - (mixed) The value to set to the property.
    type - (string) Default's *current*. Whether to set *start*, *current* or *end* type properties.
    
    Example:
    
    (start code js)
     node.setCanvasStyle('shadowBlur', 30);
    (end code)
    
    If we were to make an animation of a node/edge shadowBlur canvas style then we could do
    
    (start code js)
      var node = viz.getNode('nodeId');
      //set start and end values
      node.setCanvasStyle('shadowBlur', 10, 'start');
      node.setCanvasStyle('shadowBlur', 30, 'end');
      //will animate nodes canvas style property for nodes
      viz.fx.animate({
        modes: ['node-style:shadowBlur'],
        duration: 1000
      });
    (end code)
    
    See also:
    
    <Accessors.setData>.
    */
    setCanvasStyle: function(prop, value, type) {
      setDataInternal.call(this, 'canvas', prop, value, type);
    },

    /*
    Method: setCanvasStyles

    Convenience method to set multiple styles at once.

    Parameters:
    
    types - (array|string) A set of 'current', 'end' or 'start' values.
    obj - (object) A hash containing the names and values of the properties to be altered.

    See also:
    
    <Accessors.setDataset>.
    */
    setCanvasStyles: function(types, obj) {
      types = $.splat(types);
      for(var attr in obj) {
        for(var i=0, val = $.splat(obj[attr]), l=types.length; i<l; i++) {
          this.setCanvasStyle(attr, val[i], types[i]);
        }
      }
    },

    /*
    Method: removeCanvasStyle

    Remove canvas style properties from data.

    Parameters:
    
    A variable number of canvas style strings.

    See also:
    
    <Accessors.removeData>.
    */
    removeCanvasStyle: function() {
      removeDataInternal.call(this, 'canvas', Array.prototype.slice.call(arguments));
    },

    /*
    Method: getLabelData

    Returns the specified label data value property. This is useful for
    querying special/reserved <Graph.Node> label options (i.e.
    dollar prefixed properties that match with $label-<name of label style>).

    Parameters:

      prop  - (string) The name of the property. The dollar sign prefix is not needed. For
              example *getLabelData(size)* will return *data[$label-size]*.
      type  - (string) The type of the data property queried. Default's *current*. You can access *start* and *end* 
              data properties also.
              
    See also:
    
    <Accessors.getData>.
    */
    getLabelData: function(prop, type, force) {
      return getDataInternal.call(
          this, 'label', prop, type, force, this.Label);
    },

    /*
    Method: setLabelData

    Sets the current label data with some specific value.
    This method is only useful for reserved (dollar prefixed) properties.

    Parameters:
    
    prop - (string) Name of the property. Can be any canvas property like 'shadowBlur', 'shadowColor', 'strokeStyle', etc.
    value - (mixed) The value to set to the property.
    type - (string) Default's *current*. Whether to set *start*, *current* or *end* type properties.
    
    Example:
    
    (start code js)
     node.setLabelData('size', 30);
    (end code)
    
    If we were to make an animation of a node label size then we could do
    
    (start code js)
      var node = viz.getNode('nodeId');
      //set start and end values
      node.setLabelData('size', 10, 'start');
      node.setLabelData('size', 30, 'end');
      //will animate nodes label size
      viz.fx.animate({
        modes: ['label-property:size'],
        duration: 1000
      });
    (end code)
    
    See also:
    
    <Accessors.setData>.
    */
    setLabelData: function(prop, value, type) {
      setDataInternal.call(this, 'label', prop, value, type);
    },

    /*
    Method: setLabelDataset

    Convenience function to set multiple label data at once.

    Parameters:
    
    types - (array|string) A set of 'current', 'end' or 'start' values.
    obj - (object) A hash containing the names and values of the properties to be altered.

    See also:
    
    <Accessors.setDataset>.
    */
    setLabelDataset: function(types, obj) {
      types = $.splat(types);
      for(var attr in obj) {
        for(var i=0, val = $.splat(obj[attr]), l=types.length; i<l; i++) {
          this.setLabelData(attr, val[i], types[i]);
        }
      }
    },

    /*
    Method: removeLabelData

    Remove label properties from data.
    
    Parameters:
    
    A variable number of label property strings.

    See also:
    
    <Accessors.removeData>.
    */
    removeLabelData: function() {
      removeDataInternal.call(this, 'label', Array.prototype.slice.call(arguments));
    }
  };
})();

/*
     Class: Graph.Node

     A <Graph> node.
     
     Implements:
     
     <Accessors> methods.
     
     The following <Graph.Util> methods are implemented by <Graph.Node>
     
    - <Graph.Util.eachAdjacency>
    - <Graph.Util.eachLevel>
    - <Graph.Util.eachSubgraph>
    - <Graph.Util.eachSubnode>
    - <Graph.Util.anySubnode>
    - <Graph.Util.getSubnodes>
    - <Graph.Util.getParents>
    - <Graph.Util.isDescendantOf>     
*/
Graph.Node = new Class({
    
  initialize: function(opt, klass, Node, Edge, Label) {
    var innerOptions = {
      'id': '',
      'name': '',
      'data': {},
      'startData': {},
      'endData': {},
      'adjacencies': {},

      'selected': false,
      'drawn': false,
      'exist': false,

      'angleSpan': {
        'begin': 0,
        'end' : 0
      },

      'pos': new klass,
      'startPos': new klass,
      'endPos': new klass
    };
    
    $.extend(this, $.extend(innerOptions, opt));
    this.Config = this.Node = Node;
    this.Edge = Edge;
    this.Label = Label;
  },

    /*
       Method: adjacentTo
    
       Indicates if the node is adjacent to the node specified by id

       Parameters:
    
          id - (string) A node id.
    
       Example:
       (start code js)
        node.adjacentTo('nodeId') == true;
       (end code)
    */
    adjacentTo: function(node) {
        return node.id in this.adjacencies;
    },

    /*
       Method: getAdjacency
    
       Returns a <Graph.Adjacence> object connecting the current <Graph.Node> and the node having *id* as id.

       Parameters:
    
          id - (string) A node id.
    */  
    getAdjacency: function(id) {
        return this.adjacencies[id];
    },

    /*
      Method: getPos
   
      Returns the position of the node.
  
      Parameters:
   
         type - (string) Default's *current*. Possible values are "start", "end" or "current".
   
      Returns:
   
        A <Complex> or <Polar> instance.
  
      Example:
      (start code js)
       var pos = node.getPos('end');
      (end code)
   */
   getPos: function(type) {
       type = type || "current";
       if(type == "current") {
         return this.pos;
       } else if(type == "end") {
         return this.endPos;
       } else if(type == "start") {
         return this.startPos;
       }
   },
   /*
     Method: setPos
  
     Sets the node's position.
  
     Parameters:
  
        value - (object) A <Complex> or <Polar> instance.
        type - (string) Default's *current*. Possible values are "start", "end" or "current".
  
     Example:
     (start code js)
      node.setPos(new $jit.Complex(0, 0), 'end');
     (end code)
  */
  setPos: function(value, type) {
      type = type || "current";
      var pos;
      if(type == "current") {
        pos = this.pos;
      } else if(type == "end") {
        pos = this.endPos;
      } else if(type == "start") {
        pos = this.startPos;
      }
      pos.set(value);
  }
});

Graph.Node.implement(Accessors);

/*
     Class: Graph.Adjacence

     A <Graph> adjacence (or edge) connecting two <Graph.Nodes>.
     
     Implements:
     
     <Accessors> methods.

     See also:

     <Graph>, <Graph.Node>

     Properties:
     
      nodeFrom - A <Graph.Node> connected by this edge.
      nodeTo - Another  <Graph.Node> connected by this edge.
      data - Node data property containing a hash (i.e {}) with custom options.
*/
Graph.Adjacence = new Class({
  
  initialize: function(nodeFrom, nodeTo, data, Edge, Label) {
    this.nodeFrom = nodeFrom;
    this.nodeTo = nodeTo;
    this.data = data || {};
    this.startData = {};
    this.endData = {};
    this.Config = this.Edge = Edge;
    this.Label = Label;
  }
});

Graph.Adjacence.implement(Accessors);

/*
   Object: Graph.Util

   <Graph> traversal and processing utility object.
   
   Note:
   
   For your convenience some of these methods have also been appended to <Graph> and <Graph.Node> classes.
*/
Graph.Util = {
    /*
       filter
    
       For internal use only. Provides a filtering function based on flags.
    */
    filter: function(param) {
        if(!param || !($.type(param) == 'string')) return function() { return true; };
        var props = param.split(" ");
        return function(elem) {
            for(var i=0; i<props.length; i++) { 
              if(elem[props[i]]) { 
                return false; 
              }
            }
            return true;
        };
    },
    /*
       Method: getNode
    
       Returns a <Graph.Node> by *id*.
       
       Also implemented by:
       
       <Graph>

       Parameters:

       graph - (object) A <Graph> instance.
       id - (string) A <Graph.Node> id.

       Example:

       (start code js)
         $jit.Graph.Util.getNode(graph, 'nodeid');
         //or...
         graph.getNode('nodeid');
       (end code)
    */
    getNode: function(graph, id) {
        return graph.nodes[id];
    },
    
    /*
       Method: eachNode
    
       Iterates over <Graph> nodes performing an *action*.
       
       Also implemented by:
       
       <Graph>.

       Parameters:

       graph - (object) A <Graph> instance.
       action - (function) A callback function having a <Graph.Node> as first formal parameter.

       Example:
       (start code js)
         $jit.Graph.Util.eachNode(graph, function(node) {
          alert(node.name);
         });
         //or...
         graph.eachNode(function(node) {
           alert(node.name);
         });
       (end code)
    */
    eachNode: function(graph, action, flags) {
        var filter = this.filter(flags);
        for(var i in graph.nodes) {
          if(filter(graph.nodes[i])) action(graph.nodes[i]);
        } 
    },
    
    /*
      Method: each
   
      Iterates over <Graph> nodes performing an *action*. It's an alias for <Graph.Util.eachNode>.
      
      Also implemented by:
      
      <Graph>.
  
      Parameters:
  
      graph - (object) A <Graph> instance.
      action - (function) A callback function having a <Graph.Node> as first formal parameter.
  
      Example:
      (start code js)
        $jit.Graph.Util.each(graph, function(node) {
         alert(node.name);
        });
        //or...
        graph.each(function(node) {
          alert(node.name);
        });
      (end code)
   */
   each: function(graph, action, flags) {
      this.eachNode(graph, action, flags); 
   },

 /*
       Method: eachAdjacency
    
       Iterates over <Graph.Node> adjacencies applying the *action* function.
       
       Also implemented by:
       
       <Graph.Node>.

       Parameters:

       node - (object) A <Graph.Node>.
       action - (function) A callback function having <Graph.Adjacence> as first formal parameter.

       Example:
       (start code js)
         $jit.Graph.Util.eachAdjacency(node, function(adj) {
          alert(adj.nodeTo.name);
         });
         //or...
         node.eachAdjacency(function(adj) {
           alert(adj.nodeTo.name);
         });
       (end code)
    */
    eachAdjacency: function(node, action, flags) {
        var adj = node.adjacencies, filter = this.filter(flags);
        for(var id in adj) {
          var a = adj[id];
          if(filter(a)) {
            if(a.nodeFrom != node) {
              var tmp = a.nodeFrom;
              a.nodeFrom = a.nodeTo;
              a.nodeTo = tmp;
            }
            action(a, id);
          }
        }
    },

     /*
       Method: computeLevels
    
       Performs a BFS traversal setting the correct depth for each node.
        
       Also implemented by:
       
       <Graph>.
       
       Note:
       
       The depth of each node can then be accessed by 
       >node._depth

       Parameters:

       graph - (object) A <Graph>.
       id - (string) A starting node id for the BFS traversal.
       startDepth - (optional|number) A minimum depth value. Default's 0.

    */
    computeLevels: function(graph, id, startDepth, flags) {
        startDepth = startDepth || 0;
        var filter = this.filter(flags);
        this.eachNode(graph, function(elem) {
            elem._flag = false;
            elem._depth = -1;
        }, flags);
        var root = graph.getNode(id);
        root._depth = startDepth;
        var queue = [root];
        while(queue.length != 0) {
            var node = queue.pop();
            node._flag = true;
            this.eachAdjacency(node, function(adj) {
                var n = adj.nodeTo;
                if(n._flag == false && filter(n)) {
                    if(n._depth < 0) n._depth = node._depth + 1 + startDepth;
                    queue.unshift(n);
                }
            }, flags);
        }
    },

    /*
       Method: eachBFS
    
       Performs a BFS traversal applying *action* to each <Graph.Node>.
       
       Also implemented by:
       
       <Graph>.

       Parameters:

       graph - (object) A <Graph>.
       id - (string) A starting node id for the BFS traversal.
       action - (function) A callback function having a <Graph.Node> as first formal parameter.

       Example:
       (start code js)
         $jit.Graph.Util.eachBFS(graph, 'mynodeid', function(node) {
          alert(node.name);
         });
         //or...
         graph.eachBFS('mynodeid', function(node) {
           alert(node.name);
         });
       (end code)
    */
    eachBFS: function(graph, id, action, flags) {
        var filter = this.filter(flags);
        this.clean(graph);
        var queue = [graph.getNode(id)];
        while(queue.length != 0) {
            var node = queue.pop();
            node._flag = true;
            action(node, node._depth);
            this.eachAdjacency(node, function(adj) {
                var n = adj.nodeTo;
                if(n._flag == false && filter(n)) {
                    n._flag = true;
                    queue.unshift(n);
                }
            }, flags);
        }
    },
    
    /*
       Method: eachLevel
    
       Iterates over a node's subgraph applying *action* to the nodes of relative depth between *levelBegin* and *levelEnd*.
       
       Also implemented by:
       
       <Graph.Node>.

       Parameters:
       
       node - (object) A <Graph.Node>.
       levelBegin - (number) A relative level value.
       levelEnd - (number) A relative level value.
       action - (function) A callback function having a <Graph.Node> as first formal parameter.

    */
    eachLevel: function(node, levelBegin, levelEnd, action, flags) {
        var d = node._depth, filter = this.filter(flags), that = this;
        levelEnd = levelEnd === false? Number.MAX_VALUE -d : levelEnd;
        (function loopLevel(node, levelBegin, levelEnd) {
            var d = node._depth;
            if(d >= levelBegin && d <= levelEnd && filter(node)) action(node, d);
            if(d < levelEnd) {
                that.eachAdjacency(node, function(adj) {
                    var n = adj.nodeTo;
                    if(n._depth > d) loopLevel(n, levelBegin, levelEnd);
                });
            }
        })(node, levelBegin + d, levelEnd + d);      
    },

    /*
       Method: eachSubgraph
    
       Iterates over a node's children recursively.
       
       Also implemented by:
       
       <Graph.Node>.

       Parameters:
       node - (object) A <Graph.Node>.
       action - (function) A callback function having a <Graph.Node> as first formal parameter.

       Example:
       (start code js)
         $jit.Graph.Util.eachSubgraph(node, function(node) {
           alert(node.name);
         });
         //or...
         node.eachSubgraph(function(node) {
           alert(node.name);
         });
       (end code)
    */
    eachSubgraph: function(node, action, flags) {
      this.eachLevel(node, 0, false, action, flags);
    },

    /*
       Method: eachSubnode
    
       Iterates over a node's children (without deeper recursion).
       
       Also implemented by:
       
       <Graph.Node>.
       
       Parameters:
       node - (object) A <Graph.Node>.
       action - (function) A callback function having a <Graph.Node> as first formal parameter.


    */
    eachSubnode: function(node, action, flags) {
        this.eachLevel(node, 1, 1, action, flags);
    },

    /*
       Method: anySubnode    
 */
    anySubnode: function(node, cond, flags) {
      var flag = false;
      cond = cond || $.lambda(true);
      var c = $.type(cond) == 'string'? function(n) { return n[cond]; } : cond;
      this.eachSubnode(node, function(elem) {
        if(c(elem)) flag = true;
      }, flags);
      return flag;
    },
  
    /*
       Method: getSubnodes
    */
    getSubnodes: function(node, level, flags) {
        var ans = [], that = this;
        level = level || 0;
        var levelStart, levelEnd;
        if($.type(level) == 'array') {
            levelStart = level[0];
            levelEnd = level[1];
        } else {
            levelStart = level;
            levelEnd = Number.MAX_VALUE - node._depth;
        }
        this.eachLevel(node, levelStart, levelEnd, function(n) {
            ans.push(n);
        }, flags);
        return ans;
    },
  
  
    /*
       Method: getParents
    */
    getParents: function(node) {
        var ans = [];
        this.eachAdjacency(node, function(adj) {
            var n = adj.nodeTo;
            if(n._depth < node._depth) ans.push(n);
        });
        return ans;
    },
    
    /*
    Method: isDescendantOf
 */
 isDescendantOf: function(node, id) {
    if(node.id == id) return true;
    var pars = this.getParents(node), ans = false;
    for ( var i = 0; !ans && i < pars.length; i++) {
    ans = ans || this.isDescendantOf(pars[i], id);
  }
    return ans;
 },

 /*
     Method: clean
  */
  clean: function(graph) { this.eachNode(graph, function(elem) { elem._flag = false; }); },
  
  /* 
    Method: getClosestNodeToOrigin 
  */
  getClosestNodeToOrigin: function(graph, prop, flags) {
   return this.getClosestNodeToPos(graph, Polar.KER, prop, flags);
  },
  
  /* 
    Method: getClosestNodeToPos
  */
  getClosestNodeToPos: function(graph, pos, prop, flags) {
   var node = null;
   prop = prop || 'current';
   pos = pos && pos.getc(true) || Complex.KER;
   var distance = function(a, b) {
     var d1 = a.x - b.x, d2 = a.y - b.y;
     return d1 * d1 + d2 * d2;
   };
   this.eachNode(graph, function(elem) {
     node = (node == null || distance(elem.getPos(prop).getc(true), pos) < distance(
         node.getPos(prop).getc(true), pos)) ? elem : node;
   }, flags);
   return node;
  } 
};

//Append graph methods to <Graph>
$.each(['get', 'getNode', 'each', 'eachNode', 'computeLevels', 'eachBFS', 'clean', 'getClosestNodeToPos', 'getClosestNodeToOrigin'], function(m) {
  Graph.prototype[m] = function() {
    return Graph.Util[m].apply(Graph.Util, [this].concat(Array.prototype.slice.call(arguments)));
  };
});

//Append node methods to <Graph.Node>
$.each(['eachAdjacency', 'eachLevel', 'eachSubgraph', 'eachSubnode', 'anySubnode', 'getSubnodes', 'getParents', 'isDescendantOf'], function(m) {
  Graph.Node.prototype[m] = function() {
    return Graph.Util[m].apply(Graph.Util, [this].concat(Array.prototype.slice.call(arguments)));
  };
});

/*
 * File: Graph.Op.js
*/
Graph.Op = {

    options: {
      type: 'nothing',
      duration: 2000,
      hideLabels: true,
      fps:30
    },
    
    initialize: function(viz) {
      this.viz = viz;
    },

    /*
       Method: removeNode
    
       Removes one or more <Graph.Nodes> from the visualization. 
       It can also perform several animations like fading sequentially, fading concurrently, iterating or replotting.

       Parameters:
    
        node - (string|array) The node's id. Can also be an array having many ids.
        opt - (object) Animation options. It's an object with optional properties described below
        type - (string) Default's *nothing*. Type of the animation. Can be "nothing", "replot", "fade:seq",  "fade:con" or "iter".
        duration - Described in <Options.Fx>.
        fps - Described in <Options.Fx>.
        transition - Described in <Options.Fx>.
        hideLabels - (boolean) Default's *true*. Hide labels during the animation.
   
      Example:
      (start code js)
        var viz = new $jit.Viz(options);
        viz.op.removeNode('nodeId', {
          type: 'fade:seq',
          duration: 1000,
          hideLabels: false,
          transition: $jit.Trans.Quart.easeOut
        });
        //or also
        viz.op.removeNode(['someId', 'otherId'], {
          type: 'fade:con',
          duration: 1500
        });
      (end code)
    */
  
    removeNode: function(node, opt) {
        var viz = this.viz;
        var options = $.merge(this.options, viz.controller, opt);
        var n = $.splat(node);
        var i, that, nodeObj;
        switch(options.type) {
            case 'nothing':
                for(i=0; i<n.length; i++) viz.graph.removeNode(n[i]);
                break;
            
            case 'replot':
                this.removeNode(n, { type: 'nothing' });
                viz.labels.clearLabels();
                viz.refresh(true);
                break;
            
            case 'fade:seq': case 'fade':
                that = this;
                //set alpha to 0 for nodes to remove.
                for(i=0; i<n.length; i++) {
                    nodeObj = viz.graph.getNode(n[i]);
                    nodeObj.setData('alpha', 0, 'end');
                }
                viz.fx.animate($.merge(options, {
                    modes: ['node-property:alpha'],
                    onComplete: function() {
                        that.removeNode(n, { type: 'nothing' });
                        viz.labels.clearLabels();
                        viz.reposition();
                        viz.fx.animate($.merge(options, {
                            modes: ['linear']
                        }));
                    }
                }));
                break;
            
            case 'fade:con':
                that = this;
                //set alpha to 0 for nodes to remove. Tag them for being ignored on computing positions.
                for(i=0; i<n.length; i++) {
                    nodeObj = viz.graph.getNode(n[i]);
                    nodeObj.setData('alpha', 0, 'end');
                    nodeObj.ignore = true;
                }
                viz.reposition();
                viz.fx.animate($.merge(options, {
                    modes: ['node-property:alpha', 'linear'],
                    onComplete: function() {
                        that.removeNode(n, { type: 'nothing' });
                        options.onComplete && options.onComplete();
                    }
                }));
                break;
            
            case 'iter':
                that = this;
                viz.fx.sequence({
                    condition: function() { return n.length != 0; },
                    step: function() { that.removeNode(n.shift(), { type: 'nothing' });  viz.labels.clearLabels(); },
                    onComplete: function() { options.onComplete && options.onComplete(); },
                    duration: Math.ceil(options.duration / n.length)
                });
                break;
                
            default: this.doError();
        }
    },
    
    /*
       Method: removeEdge
    
       Removes one or more <Graph.Adjacences> from the visualization. 
       It can also perform several animations like fading sequentially, fading concurrently, iterating or replotting.

       Parameters:
    
       vertex - (array) An array having two strings which are the ids of the nodes connected by this edge (i.e ['id1', 'id2']). Can also be a two dimensional array holding many edges (i.e [['id1', 'id2'], ['id3', 'id4'], ...]).
       opt - (object) Animation options. It's an object with optional properties described below
       type - (string) Default's *nothing*. Type of the animation. Can be "nothing", "replot", "fade:seq",  "fade:con" or "iter".
       duration - Described in <Options.Fx>.
       fps - Described in <Options.Fx>.
       transition - Described in <Options.Fx>.
       hideLabels - (boolean) Default's *true*. Hide labels during the animation.
   
      Example:
      (start code js)
        var viz = new $jit.Viz(options);
        viz.op.removeEdge(['nodeId', 'otherId'], {
          type: 'fade:seq',
          duration: 1000,
          hideLabels: false,
          transition: $jit.Trans.Quart.easeOut
        });
        //or also
        viz.op.removeEdge([['someId', 'otherId'], ['id3', 'id4']], {
          type: 'fade:con',
          duration: 1500
        });
      (end code)
    
    */
    removeEdge: function(vertex, opt) {
        var viz = this.viz;
        var options = $.merge(this.options, viz.controller, opt);
        var v = ($.type(vertex[0]) == 'string')? [vertex] : vertex;
        var i, that, adj;
        switch(options.type) {
            case 'nothing':
                for(i=0; i<v.length; i++)   viz.graph.removeAdjacence(v[i][0], v[i][1]);
                break;
            
            case 'replot':
                this.removeEdge(v, { type: 'nothing' });
                viz.refresh(true);
                break;
            
            case 'fade:seq': case 'fade':
                that = this;
                //set alpha to 0 for edges to remove.
                for(i=0; i<v.length; i++) {
                    adj = viz.graph.getAdjacence(v[i][0], v[i][1]);
                    if(adj) {
                        adj.setData('alpha', 0,'end');
                    }
                }
                viz.fx.animate($.merge(options, {
                    modes: ['edge-property:alpha'],
                    onComplete: function() {
                        that.removeEdge(v, { type: 'nothing' });
                        viz.reposition();
                        viz.fx.animate($.merge(options, {
                            modes: ['linear']
                        }));
                    }
                }));
                break;
            
            case 'fade:con':
                that = this;
                //set alpha to 0 for nodes to remove. Tag them for being ignored when computing positions.
                for(i=0; i<v.length; i++) {
                    adj = viz.graph.getAdjacence(v[i][0], v[i][1]);
                    if(adj) {
                        adj.setData('alpha',0 ,'end');
                        adj.ignore = true;
                    }
                }
                viz.reposition();
                viz.fx.animate($.merge(options, {
                    modes: ['edge-property:alpha', 'linear'],
                    onComplete: function() {
                        that.removeEdge(v, { type: 'nothing' });
                        options.onComplete && options.onComplete();
                    }
                }));
                break;
            
            case 'iter':
                that = this;
                viz.fx.sequence({
                    condition: function() { return v.length != 0; },
                    step: function() { that.removeEdge(v.shift(), { type: 'nothing' }); viz.labels.clearLabels(); },
                    onComplete: function() { options.onComplete(); },
                    duration: Math.ceil(options.duration / v.length)
                });
                break;
                
            default: this.doError();
        }
    },
    
    /*
       Method: sum
    
       Adds a new graph to the visualization. 
       The JSON graph (or tree) must at least have a common node with the current graph plotted by the visualization. 
       The resulting graph can be defined as follows <http://mathworld.wolfram.com/GraphSum.html>

       Parameters:
    
       json - (object) A json tree or graph structure. See also <Loader.loadJSON>.
       opt - (object) Animation options. It's an object with optional properties described below
       type - (string) Default's *nothing*. Type of the animation. Can be "nothing", "replot", "fade:seq",  "fade:con".
       duration - Described in <Options.Fx>.
       fps - Described in <Options.Fx>.
       transition - Described in <Options.Fx>.
       hideLabels - (boolean) Default's *true*. Hide labels during the animation.
   
      Example:
      (start code js)
        //...json contains a tree or graph structure...

        var viz = new $jit.Viz(options);
        viz.op.sum(json, {
          type: 'fade:seq',
          duration: 1000,
          hideLabels: false,
          transition: $jit.Trans.Quart.easeOut
        });
        //or also
        viz.op.sum(json, {
          type: 'fade:con',
          duration: 1500
        });
      (end code)
    
    */
    sum: function(json, opt) {
        var viz = this.viz;
        var options = $.merge(this.options, viz.controller, opt), root = viz.root;
        var graph;
        viz.root = opt.id || viz.root;
        switch(options.type) {
            case 'nothing':
                graph = viz.construct(json);
                graph.eachNode(function(elem) {
                    elem.eachAdjacency(function(adj) {
                        viz.graph.addAdjacence(adj.nodeFrom, adj.nodeTo, adj.data);
                    });
                });
                break;
            
            case 'replot':
                viz.refresh(true);
                this.sum(json, { type: 'nothing' });
                viz.refresh(true);
                break;
            
            case 'fade:seq': case 'fade': case 'fade:con':
                that = this;
                graph = viz.construct(json);

                //set alpha to 0 for nodes to add.
                var fadeEdges = this.preprocessSum(graph);
                var modes = !fadeEdges? ['node-property:alpha'] : ['node-property:alpha', 'edge-property:alpha'];
                viz.reposition();
                if(options.type != 'fade:con') {
                    viz.fx.animate($.merge(options, {
                        modes: ['linear'],
                        onComplete: function() {
                            viz.fx.animate($.merge(options, {
                                modes: modes,
                                onComplete: function() {
                                    options.onComplete();
                                }
                            }));
                        }
                    }));
                } else {
                    viz.graph.eachNode(function(elem) {
                        if (elem.id != root && elem.pos.isZero()) {
                          elem.pos.set(elem.endPos); 
                          elem.startPos.set(elem.endPos);
                        }
                    });
                    viz.fx.animate($.merge(options, {
                        modes: ['linear'].concat(modes)
                    }));
                }
                break;

            default: this.doError();
        }
    },
    
    /*
       Method: morph
    
       This method will transform the current visualized graph into the new JSON representation passed in the method. 
       The JSON object must at least have the root node in common with the current visualized graph.

       Parameters:
    
       json - (object) A json tree or graph structure. See also <Loader.loadJSON>.
       opt - (object) Animation options. It's an object with optional properties described below
       type - (string) Default's *nothing*. Type of the animation. Can be "nothing", "replot", "fade:con".
       duration - Described in <Options.Fx>.
       fps - Described in <Options.Fx>.
       transition - Described in <Options.Fx>.
       hideLabels - (boolean) Default's *true*. Hide labels during the animation.
       id - (string) The shared <Graph.Node> id between both graphs.
       
       extraModes - (optional|object) When morphing with an animation, dollar prefixed data parameters are added to 
                    *endData* and not *data* itself. This way you can animate dollar prefixed parameters during your morphing operation. 
                    For animating these extra-parameters you have to specify an object that has animation groups as keys and animation 
                    properties as values, just like specified in <Graph.Plot.animate>.
   
      Example:
      (start code js)
        //...json contains a tree or graph structure...

        var viz = new $jit.Viz(options);
        viz.op.morph(json, {
          type: 'fade',
          duration: 1000,
          hideLabels: false,
          transition: $jit.Trans.Quart.easeOut
        });
        //or also
        viz.op.morph(json, {
          type: 'fade',
          duration: 1500
        });
        //if the json data contains dollar prefixed params
        //like $width or $height these too can be animated
        viz.op.morph(json, {
          type: 'fade',
          duration: 1500
        }, {
          'node-property': ['width', 'height']
        });
      (end code)
    
    */
    morph: function(json, opt, extraModes) {
        extraModes = extraModes || {};
        var viz = this.viz;
        var options = $.merge(this.options, viz.controller, opt), root = viz.root;
        var graph;
        //Need to check if it has been solved and this can be removed.
        viz.root = opt.id || viz.root;
        switch(options.type) {
            case 'nothing':
                graph = viz.construct(json);
                graph.eachNode(function(elem) {
                  var nodeExists = viz.graph.hasNode(elem.id);  
                  elem.eachAdjacency(function(adj) {
                    var adjExists = !!viz.graph.getAdjacence(adj.nodeFrom.id, adj.nodeTo.id);
                    viz.graph.addAdjacence(adj.nodeFrom, adj.nodeTo, adj.data);
                    //Update data properties if the node existed
                    if(adjExists) {
                      var addedAdj = viz.graph.getAdjacence(adj.nodeFrom.id, adj.nodeTo.id);
                      for(var prop in (adj.data || {})) {
                        addedAdj.data[prop] = adj.data[prop];
                      }
                    }
                  });
                  //Update data properties if the node existed
                  if(nodeExists) {
                    var addedNode = viz.graph.getNode(elem.id);
                    for(var prop in (elem.data || {})) {
                      addedNode.data[prop] = elem.data[prop];
                    }
                  }
                });
                viz.graph.eachNode(function(elem) {
                    elem.eachAdjacency(function(adj) {
                        if(!graph.getAdjacence(adj.nodeFrom.id, adj.nodeTo.id)) {
                            viz.graph.removeAdjacence(adj.nodeFrom.id, adj.nodeTo.id);
                        }
                    });
                    if(!graph.hasNode(elem.id)) viz.graph.removeNode(elem.id);
                });
                
                break;
            
            case 'replot':
                viz.labels.clearLabels(true);
                this.morph(json, { type: 'nothing' });
                viz.refresh(true);
                viz.refresh(true);
                break;
                
            case 'fade:seq': case 'fade': case 'fade:con':
                that = this;
                graph = viz.construct(json);
                //preprocessing for nodes to delete.
                //get node property modes to interpolate
                var nodeModes = ('node-property' in extraModes) 
                  && $.map($.splat(extraModes['node-property']), 
                      function(n) { return '$' + n; });
                viz.graph.eachNode(function(elem) {
                  var graphNode = graph.getNode(elem.id);   
                  if(!graphNode) {
                      elem.setData('alpha', 1);
                      elem.setData('alpha', 1, 'start');
                      elem.setData('alpha', 0, 'end');
                      elem.ignore = true;
                    } else {
                      //Update node data information
                      var graphNodeData = graphNode.data;
                      for(var prop in graphNodeData) {
                        if(nodeModes && ($.indexOf(nodeModes, prop) > -1)) {
                          elem.endData[prop] = graphNodeData[prop];
                        } else {
                          elem.data[prop] = graphNodeData[prop];
                        }
                      }
                    }
                }); 
                viz.graph.eachNode(function(elem) {
                    if(elem.ignore) return;
                    elem.eachAdjacency(function(adj) {
                        if(adj.nodeFrom.ignore || adj.nodeTo.ignore) return;
                        var nodeFrom = graph.getNode(adj.nodeFrom.id);
                        var nodeTo = graph.getNode(adj.nodeTo.id);
                        if(!nodeFrom.adjacentTo(nodeTo)) {
                            var adj = viz.graph.getAdjacence(nodeFrom.id, nodeTo.id);
                            fadeEdges = true;
                            adj.setData('alpha', 1);
                            adj.setData('alpha', 1, 'start');
                            adj.setData('alpha', 0, 'end');
                        }
                    });
                }); 
                //preprocessing for adding nodes.
                var fadeEdges = this.preprocessSum(graph);

                var modes = !fadeEdges? ['node-property:alpha'] : 
                                        ['node-property:alpha', 
                                         'edge-property:alpha'];
                //Append extra node-property animations (if any)
                modes[0] = modes[0] + (('node-property' in extraModes)? 
                    (':' + $.splat(extraModes['node-property']).join(':')) : '');
                //Append extra edge-property animations (if any)
                modes[1] = (modes[1] || 'edge-property:alpha') + (('edge-property' in extraModes)? 
                    (':' + $.splat(extraModes['edge-property']).join(':')) : '');
                //Add label-property animations (if any)
                if('label-property' in extraModes) {
                  modes.push('label-property:' + $.splat(extraModes['label-property']).join(':'))
                }
                //only use reposition if its implemented.
                if (viz.reposition) {
                  viz.reposition();
                } else {
                  viz.compute('end');
                }
                viz.graph.eachNode(function(elem) {
                    if (elem.id != root && elem.pos.getp().equals(Polar.KER)) {
                      elem.pos.set(elem.endPos); elem.startPos.set(elem.endPos);
                    }
                });
                viz.fx.animate($.merge(options, {
                    modes: [extraModes.position || 'polar'].concat(modes),
                    onComplete: function() {
                        viz.graph.eachNode(function(elem) {
                            if(elem.ignore) viz.graph.removeNode(elem.id);
                        });
                        viz.graph.eachNode(function(elem) {
                            elem.eachAdjacency(function(adj) {
                                if(adj.ignore) viz.graph.removeAdjacence(adj.nodeFrom.id, adj.nodeTo.id);
                            });
                        });
                        options.onComplete();
                    }
                }));
                break;

            default:;
        }
    },

    
  /*
    Method: contract
 
    Collapses the subtree of the given node. The node will have a _collapsed=true_ property.
    
    Parameters:
 
    node - (object) A <Graph.Node>.
    opt - (object) An object containing options described below
    type - (string) Whether to 'replot' or 'animate' the contraction.
   
    There are also a number of Animation options. For more information see <Options.Fx>.

    Example:
    (start code js)
     var viz = new $jit.Viz(options);
     viz.op.contract(node, {
       type: 'animate',
       duration: 1000,
       hideLabels: true,
       transition: $jit.Trans.Quart.easeOut
     });
   (end code)
 
   */
    contract: function(node, opt) {
      var viz = this.viz;
      if(node.collapsed || !node.anySubnode($.lambda(true))) return;
      opt = $.merge(this.options, viz.config, opt || {}, {
        'modes': ['node-property:alpha:span', 'linear']
      });
      node.collapsed = true;
      (function subn(n) {
        n.eachSubnode(function(ch) {
          ch.ignore = true;
          ch.setData('alpha', 0, opt.type == 'animate'? 'end' : 'current');
          subn(ch);
        });
      })(node);
      if(opt.type == 'animate') {
        viz.compute('end');
        if(viz.rotated) {
          viz.rotate(viz.rotated, 'none', {
            'property':'end'
          });
        }
        (function subn(n) {
          n.eachSubnode(function(ch) {
            ch.setPos(node.getPos('end'), 'end');
            subn(ch);
          });
        })(node);
        viz.fx.animate(opt);
      } else if(opt.type == 'replot'){
        viz.refresh();
      }
    },
    
    /*
    Method: expand
 
    Expands the previously contracted subtree. The given node must have the _collapsed=true_ property.
    
    Parameters:
 
    node - (object) A <Graph.Node>.
    opt - (object) An object containing options described below
    type - (string) Whether to 'replot' or 'animate'.
     
    There are also a number of Animation options. For more information see <Options.Fx>.

    Example:
    (start code js)
      var viz = new $jit.Viz(options);
      viz.op.expand(node, {
        type: 'animate',
        duration: 1000,
        hideLabels: true,
        transition: $jit.Trans.Quart.easeOut
      });
    (end code)
 
   */
    expand: function(node, opt) {
      if(!('collapsed' in node)) return;
      var viz = this.viz;
      opt = $.merge(this.options, viz.config, opt || {}, {
        'modes': ['node-property:alpha:span', 'linear']
      });
      delete node.collapsed;
      (function subn(n) {
        n.eachSubnode(function(ch) {
          delete ch.ignore;
          ch.setData('alpha', 1, opt.type == 'animate'? 'end' : 'current');
          subn(ch);
        });
      })(node);
      if(opt.type == 'animate') {
        viz.compute('end');
        if(viz.rotated) {
          viz.rotate(viz.rotated, 'none', {
            'property':'end'
          });
        }
        viz.fx.animate(opt);
      } else if(opt.type == 'replot'){
        viz.refresh();
      }
    },

    preprocessSum: function(graph) {
        var viz = this.viz;
        graph.eachNode(function(elem) {
            if(!viz.graph.hasNode(elem.id)) {
                viz.graph.addNode(elem);
                var n = viz.graph.getNode(elem.id);
                n.setData('alpha', 0);
                n.setData('alpha', 0, 'start');
                n.setData('alpha', 1, 'end');
            }
        }); 
        var fadeEdges = false;
        graph.eachNode(function(elem) {
            elem.eachAdjacency(function(adj) {
                var nodeFrom = viz.graph.getNode(adj.nodeFrom.id);
                var nodeTo = viz.graph.getNode(adj.nodeTo.id);
                if(!nodeFrom.adjacentTo(nodeTo)) {
                    var adj = viz.graph.addAdjacence(nodeFrom, nodeTo, adj.data);
                    if(nodeFrom.startAlpha == nodeFrom.endAlpha 
                    && nodeTo.startAlpha == nodeTo.endAlpha) {
                        fadeEdges = true;
                        adj.setData('alpha', 0);
                        adj.setData('alpha', 0, 'start');
                        adj.setData('alpha', 1, 'end');
                    } 
                }
            });
        }); 
        return fadeEdges;
    }
};



/*
   File: Helpers.js
 
   Helpers are objects that contain rendering primitives (like rectangles, ellipses, etc), for plotting nodes and edges.
   Helpers also contain implementations of the *contains* method, a method returning a boolean indicating whether the mouse
   position is over the rendered shape.
   
   Helpers are very useful when implementing new NodeTypes, since you can access them through *this.nodeHelper* and 
   *this.edgeHelper* <Graph.Plot> properties, providing you with simple primitives and mouse-position check functions.
   
   Example:
   (start code js)
   //implement a new node type
   $jit.Viz.Plot.NodeTypes.implement({
     'customNodeType': {
       'render': function(node, canvas) {
         this.nodeHelper.circle.render ...
       },
       'contains': function(node, pos) {
         this.nodeHelper.circle.contains ...
       }
     }
   });
   //implement an edge type
   $jit.Viz.Plot.EdgeTypes.implement({
     'customNodeType': {
       'render': function(node, canvas) {
         this.edgeHelper.circle.render ...
       },
       //optional
       'contains': function(node, pos) {
         this.edgeHelper.circle.contains ...
       }
     }
   });
   (end code)

*/

/*
   Object: NodeHelper
   
   Contains rendering and other type of primitives for simple shapes.
 */
var NodeHelper = {
  'none': {
    'render': $.empty,
    'contains': $.lambda(false)
  },
  /*
   Object: NodeHelper.circle
   */
  'circle': {
    /*
     Method: render
     
     Renders a circle into the canvas.
     
     Parameters:
     
     type - (string) Possible options are 'fill' or 'stroke'.
     pos - (object) An *x*, *y* object with the position of the center of the circle.
     radius - (number) The radius of the circle to be rendered.
     canvas - (object) A <Canvas> instance.
     
     Example:
     (start code js)
     NodeHelper.circle.render('fill', { x: 10, y: 30 }, 30, viz.canvas);
     (end code)
     */
    'render': function(type, pos, radius, canvas){
      var ctx = canvas.getCtx();
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2, true);
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.closePath();
      ctx[type]();
    },
    /*
    Method: contains
    
    Returns *true* if *pos* is contained in the area of the shape. Returns *false* otherwise.
    
    Parameters:
    
    npos - (object) An *x*, *y* object with the <Graph.Node> position.
    pos - (object) An *x*, *y* object with the position to check.
    radius - (number) The radius of the rendered circle.
    
    Example:
    (start code js)
    NodeHelper.circle.contains({ x: 10, y: 30 }, { x: 15, y: 35 }, 30); //true
    (end code)
    */
    'contains': function(npos, pos, radius){
      var diffx = npos.x - pos.x, 
          diffy = npos.y - pos.y, 
          diff = diffx * diffx + diffy * diffy;
      return diff <= radius * radius;
    }
  },
  /*
  Object: NodeHelper.ellipse
  */
  'ellipse': {
    /*
    Method: render
    
    Renders an ellipse into the canvas.
    
    Parameters:
    
    type - (string) Possible options are 'fill' or 'stroke'.
    pos - (object) An *x*, *y* object with the position of the center of the ellipse.
    width - (number) The width of the ellipse.
    height - (number) The height of the ellipse.
    canvas - (object) A <Canvas> instance.
    
    Example:
    (start code js)
    NodeHelper.ellipse.render('fill', { x: 10, y: 30 }, 30, 40, viz.canvas);
    (end code)
    */
    'render': function(type, pos, width, height, canvas){
      var ctx = canvas.getCtx(),
          scalex = 1,
          scaley = 1,
          scaleposx = 1,
          scaleposy = 1,
          radius = 0;

      if (width > height) {
          radius = width / 2;
          scaley = height / width;
          scaleposy = width / height;
      } else {
          radius = height / 2;
          scalex = width / height;
          scaleposx = height / width;
      }

      ctx.save();
      ctx.scale(scalex, scaley);
      ctx.beginPath();
      ctx.arc(pos.x * scaleposx, pos.y * scaleposy, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx[type]();
      ctx.restore();
    },
    /*
    Method: contains
    
    Returns *true* if *pos* is contained in the area of the shape. Returns *false* otherwise.
    
    Parameters:
    
    npos - (object) An *x*, *y* object with the <Graph.Node> position.
    pos - (object) An *x*, *y* object with the position to check.
    width - (number) The width of the rendered ellipse.
    height - (number) The height of the rendered ellipse.
    
    Example:
    (start code js)
    NodeHelper.ellipse.contains({ x: 10, y: 30 }, { x: 15, y: 35 }, 30, 40);
    (end code)
    */
    'contains': function(npos, pos, width, height){
      var radius = 0,
          scalex = 1,
          scaley = 1,
          diffx = 0,
          diffy = 0,
          diff = 0;

      if (width > height) {
	      radius = width / 2;
	      scaley = height / width;
      } else {
          radius = height / 2;
          scalex = width / height;
      }

      diffx = (npos.x - pos.x) * (1 / scalex);
      diffy = (npos.y - pos.y) * (1 / scaley);
      diff = diffx * diffx + diffy * diffy;
      return diff <= radius * radius;
    }
  },
  /*
  Object: NodeHelper.square
  */
  'square': {
    /*
    Method: render
    
    Renders a square into the canvas.
    
    Parameters:
    
    type - (string) Possible options are 'fill' or 'stroke'.
    pos - (object) An *x*, *y* object with the position of the center of the square.
    dim - (number) The radius (or half-diameter) of the square.
    canvas - (object) A <Canvas> instance.
    
    Example:
    (start code js)
    NodeHelper.square.render('stroke', { x: 10, y: 30 }, 40, viz.canvas);
    (end code)
    */
    'render': function(type, pos, dim, canvas){
      canvas.getCtx()[type + "Rect"](pos.x - dim, pos.y - dim, 2*dim, 2*dim);
      canvas.strokeStyle = 'white';
	  canvas.lineWidth =2;
      canvas.getCtx()["stroke" + "Rect"](pos.x - dim, pos.y - dim, 2.1*dim, 2.1*dim);
			
    },
    /*
    Method: contains
    
    Returns *true* if *pos* is contained in the area of the shape. Returns *false* otherwise.
    
    Parameters:
    
    npos - (object) An *x*, *y* object with the <Graph.Node> position.
    pos - (object) An *x*, *y* object with the position to check.
    dim - (number) The radius (or half-diameter) of the square.
    
    Example:
    (start code js)
    NodeHelper.square.contains({ x: 10, y: 30 }, { x: 15, y: 35 }, 30);
    (end code)
    */
    'contains': function(npos, pos, dim){
      return Math.abs(pos.x - npos.x) <= dim && Math.abs(pos.y - npos.y) <= dim;
    }
  },
  /*
  Object: NodeHelper.rectangle
  */
  'rectangle': {
    /*
    Method: render
    
    Renders a rectangle into the canvas.
    
    Parameters:
    
    type - (string) Possible options are 'fill' or 'stroke'.
    pos - (object) An *x*, *y* object with the position of the center of the rectangle.
    width - (number) The width of the rectangle.
    height - (number) The height of the rectangle.
    canvas - (object) A <Canvas> instance.
    
    Example:
    (start code js)
    NodeHelper.rectangle.render('fill', { x: 10, y: 30 }, 30, 40, viz.canvas);
    (end code)
    */
    'render': function(type, pos, width, height, canvas){
      canvas.getCtx()[type + "Rect"](pos.x - width / 2, pos.y - height / 2, 
                                      width, height);
    },
    /*
    Method: contains
    
    Returns *true* if *pos* is contained in the area of the shape. Returns *false* otherwise.
    
    Parameters:
    
    npos - (object) An *x*, *y* object with the <Graph.Node> position.
    pos - (object) An *x*, *y* object with the position to check.
    width - (number) The width of the rendered rectangle.
    height - (number) The height of the rendered rectangle.
    
    Example:
    (start code js)
    NodeHelper.rectangle.contains({ x: 10, y: 30 }, { x: 15, y: 35 }, 30, 40);
    (end code)
    */
    'contains': function(npos, pos, width, height){
      return Math.abs(pos.x - npos.x) <= width / 2
          && Math.abs(pos.y - npos.y) <= height / 2;
    }
  },
  /*
  Object: NodeHelper.triangle
  */
  'triangle': {
    /*
    Method: render
    
    Renders a triangle into the canvas.
    
    Parameters:
    
    type - (string) Possible options are 'fill' or 'stroke'.
    pos - (object) An *x*, *y* object with the position of the center of the triangle.
    dim - (number) Half the base and half the height of the triangle.
    canvas - (object) A <Canvas> instance.
    
    Example:
    (start code js)
    NodeHelper.triangle.render('stroke', { x: 10, y: 30 }, 40, viz.canvas);
    (end code)
    */
    'render': function(type, pos, dim, canvas){
      var ctx = canvas.getCtx(), 
          c1x = pos.x, 
          c1y = pos.y - dim, 
          c2x = c1x - dim, 
          c2y = pos.y + dim, 
          c3x = c1x + dim, 
          c3y = c2y;
      ctx.beginPath();
      ctx.moveTo(c1x, c1y);
      ctx.lineTo(c2x, c2y);
      ctx.lineTo(c3x, c3y);
      ctx.closePath();
      ctx[type]();
    },
    /*
    Method: contains
    
    Returns *true* if *pos* is contained in the area of the shape. Returns *false* otherwise.
    
    Parameters:
    
    npos - (object) An *x*, *y* object with the <Graph.Node> position.
    pos - (object) An *x*, *y* object with the position to check.
    dim - (number) Half the base and half the height of the triangle.
    
    Example:
    (start code js)
    NodeHelper.triangle.contains({ x: 10, y: 30 }, { x: 15, y: 35 }, 30);
    (end code)
    */
    'contains': function(npos, pos, dim) {
      return NodeHelper.circle.contains(npos, pos, dim);
    }
  },
  /*
  Object: NodeHelper.star
  */
  'star': {
    /*
    Method: render
    
    Renders a star (concave decagon) into the canvas.
    
    Parameters:
    
    type - (string) Possible options are 'fill' or 'stroke'.
    pos - (object) An *x*, *y* object with the position of the center of the star.
    dim - (number) The length of a side of a concave decagon.
    canvas - (object) A <Canvas> instance.
    
    Example:
    (start code js)
    NodeHelper.star.render('stroke', { x: 10, y: 30 }, 40, viz.canvas);
    (end code)
    */
    'render': function(type, pos, dim, canvas){
      var ctx = canvas.getCtx(), 
          pi5 = Math.PI / 5;
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.beginPath();
      ctx.moveTo(dim, 0);
      for (var i = 0; i < 9; i++) {
        ctx.rotate(pi5);
        if (i % 2 == 0) {
          ctx.lineTo((dim / 0.525731) * 0.200811, 0);
        } else {
          ctx.lineTo(dim, 0);
        }
      }
      ctx.closePath();
      ctx[type]();
      ctx.restore();
    },
    /*
    Method: contains
    
    Returns *true* if *pos* is contained in the area of the shape. Returns *false* otherwise.
    
    Parameters:
    
    npos - (object) An *x*, *y* object with the <Graph.Node> position.
    pos - (object) An *x*, *y* object with the position to check.
    dim - (number) The length of a side of a concave decagon.
    
    Example:
    (start code js)
    NodeHelper.star.contains({ x: 10, y: 30 }, { x: 15, y: 35 }, 30);
    (end code)
    */
    'contains': function(npos, pos, dim) {
      return NodeHelper.circle.contains(npos, pos, dim);
    }
  }
};

/*
  Object: EdgeHelper
  
  Contains rendering primitives for simple edge shapes.
*/
var EdgeHelper = {
  /*
    Object: EdgeHelper.line
  */
  'line': {
      /*
      Method: render
      
      Renders a line into the canvas.
      
      Parameters:
      
      from - (object) An *x*, *y* object with the starting position of the line.
      to - (object) An *x*, *y* object with the ending position of the line.
      canvas - (object) A <Canvas> instance.
      
      Example:
      (start code js)
      EdgeHelper.line.render({ x: 10, y: 30 }, { x: 10, y: 50 }, viz.canvas);
      (end code)
      */
      'render': function(from, to, canvas){
        var ctx = canvas.getCtx();
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
//        ctx.strokeStyle = couleur ;
        ctx.stroke();
      },
      /*
      Method: contains
      
      Returns *true* if *pos* is contained in the area of the shape. Returns *false* otherwise.
      
      Parameters:
      
      posFrom - (object) An *x*, *y* object with a <Graph.Node> position.
      posTo - (object) An *x*, *y* object with a <Graph.Node> position.
      pos - (object) An *x*, *y* object with the position to check.
      epsilon - (number) The dimension of the shape.
      
      Example:
      (start code js)
      EdgeHelper.line.contains({ x: 10, y: 30 }, { x: 15, y: 35 }, { x: 15, y: 35 }, 30);
      (end code)
      */
      'contains': function(posFrom, posTo, pos, epsilon) {
        var min = Math.min, 
            max = Math.max,
            minPosX = min(posFrom.x, posTo.x),
            maxPosX = max(posFrom.x, posTo.x),
            minPosY = min(posFrom.y, posTo.y),
            maxPosY = max(posFrom.y, posTo.y);
        
        if(pos.x >= minPosX && pos.x <= maxPosX 
            && pos.y >= minPosY && pos.y <= maxPosY) {
          if(Math.abs(posTo.x - posFrom.x) <= epsilon) {
            return true;
          }
          var dist = (posTo.y - posFrom.y) / (posTo.x - posFrom.x) * (pos.x - posFrom.x) + posFrom.y;
          return Math.abs(dist - pos.y) <= epsilon;
        }
        return false;
      }
    },
  /*
    Object: EdgeHelper.arrow
  */
  'arrow': {
      /*
      Method: render
      
      Renders an arrow into the canvas.
      
      Parameters:
      
      from - (object) An *x*, *y* object with the starting position of the arrow.
      to - (object) An *x*, *y* object with the ending position of the arrow.
      dim - (number) The dimension of the arrow.
      swap - (boolean) Whether to set the arrow pointing to the starting position or the ending position.
      canvas - (object) A <Canvas> instance.
      
      Example:
      (start code js)
      EdgeHelper.arrow.render({ x: 10, y: 30 }, { x: 10, y: 50 }, 13, false, viz.canvas);
      (end code)
      */
    'render': function(from, to, dim, swap, canvas){
        var ctx = canvas.getCtx();
        // invert edge direction
        if (swap) {
          var tmp = from;
          from = to;
          to = tmp;
        }
        var vect = new Complex(to.x - from.x, to.y - from.y);
        vect.$scale(dim / vect.norm());
        var intermediatePoint = new Complex(to.x - vect.x, to.y - vect.y),
            normal = new Complex(-vect.y / 2, vect.x / 2),
            v1 = intermediatePoint.add(normal), 
            v2 = intermediatePoint.$add(normal.$scale(-1));
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.lineTo(to.x, to.y);
        ctx.closePath();
        ctx.fill();
    },
    /*
    Method: contains
    
    Returns *true* if *pos* is contained in the area of the shape. Returns *false* otherwise.
    
    Parameters:
    
    posFrom - (object) An *x*, *y* object with a <Graph.Node> position.
    posTo - (object) An *x*, *y* object with a <Graph.Node> position.
    pos - (object) An *x*, *y* object with the position to check.
    epsilon - (number) The dimension of the shape.
    
    Example:
    (start code js)
    EdgeHelper.arrow.contains({ x: 10, y: 30 }, { x: 15, y: 35 }, { x: 15, y: 35 }, 30);
    (end code)
    */
    'contains': function(posFrom, posTo, pos, epsilon) {
      return EdgeHelper.line.contains(posFrom, posTo, pos, epsilon);
    }
  },
  /*
    Object: EdgeHelper.hyperline
  */
  'hyperline': {
    /*
    Method: render
    
    Renders a hyperline into the canvas. A hyperline are the lines drawn for the <Hypertree> visualization.
    
    Parameters:
    
    from - (object) An *x*, *y* object with the starting position of the hyperline. *x* and *y* must belong to [0, 1).
    to - (object) An *x*, *y* object with the ending position of the hyperline. *x* and *y* must belong to [0, 1).
    r - (number) The scaling factor.
    canvas - (object) A <Canvas> instance.
    
    Example:
    (start code js)
    EdgeHelper.hyperline.render({ x: 10, y: 30 }, { x: 10, y: 50 }, 100, viz.canvas);
    (end code)
    */
    'render': function(from, to, r, canvas){
      var ctx = canvas.getCtx();  
      var centerOfCircle = computeArcThroughTwoPoints(from, to);
      if (centerOfCircle.a > 1000 || centerOfCircle.b > 1000
          || centerOfCircle.ratio < 0) {
        ctx.beginPath();
        ctx.moveTo(from.x * r, from.y * r);
        ctx.lineTo(to.x * r, to.y * r);
        ctx.stroke();
      } else {
        var angleBegin = Math.atan2(to.y - centerOfCircle.y, to.x
            - centerOfCircle.x);
        var angleEnd = Math.atan2(from.y - centerOfCircle.y, from.x
            - centerOfCircle.x);
        var sense = sense(angleBegin, angleEnd);
        ctx.beginPath();
        ctx.arc(centerOfCircle.x * r, centerOfCircle.y * r, centerOfCircle.ratio
            * r, angleBegin, angleEnd, sense);
        ctx.stroke();
      }
      /*      
        Calculates the arc parameters through two points.
        
        More information in <http://en.wikipedia.org/wiki/Poincar%C3%A9_disc_model#Analytic_geometry_constructions_in_the_hyperbolic_plane> 
      
        Parameters:
      
        p1 - A <Complex> instance.
        p2 - A <Complex> instance.
        scale - The Disk's diameter.
      
        Returns:
      
        An object containing some arc properties.
      */
      function computeArcThroughTwoPoints(p1, p2){
        var aDen = (p1.x * p2.y - p1.y * p2.x), bDen = aDen;
        var sq1 = p1.squaredNorm(), sq2 = p2.squaredNorm();
        // Fall back to a straight line
        if (aDen == 0)
          return {
            x: 0,
            y: 0,
            ratio: -1
          };
    
        var a = (p1.y * sq2 - p2.y * sq1 + p1.y - p2.y) / aDen;
        var b = (p2.x * sq1 - p1.x * sq2 + p2.x - p1.x) / bDen;
        var x = -a / 2;
        var y = -b / 2;
        var squaredRatio = (a * a + b * b) / 4 - 1;
        // Fall back to a straight line
        if (squaredRatio < 0)
          return {
            x: 0,
            y: 0,
            ratio: -1
          };
        var ratio = Math.sqrt(squaredRatio);
        var out = {
          x: x,
          y: y,
          ratio: ratio > 1000? -1 : ratio,
          a: a,
          b: b
        };
    
        return out;
      }
      /*      
        Sets angle direction to clockwise (true) or counterclockwise (false). 
         
        Parameters: 
      
           angleBegin - Starting angle for drawing the arc. 
           angleEnd - The HyperLine will be drawn from angleBegin to angleEnd. 
      
        Returns: 
      
           A Boolean instance describing the sense for drawing the HyperLine. 
      */
      function sense(angleBegin, angleEnd){
        return (angleBegin < angleEnd)? ((angleBegin + Math.PI > angleEnd)? false
            : true) : ((angleEnd + Math.PI > angleBegin)? true : false);
      }
    },
    /*
    Method: contains
    
    Not Implemented
    
    Returns *true* if *pos* is contained in the area of the shape. Returns *false* otherwise.
    
    Parameters:
    
    posFrom - (object) An *x*, *y* object with a <Graph.Node> position.
    posTo - (object) An *x*, *y* object with a <Graph.Node> position.
    pos - (object) An *x*, *y* object with the position to check.
    epsilon - (number) The dimension of the shape.
    
    Example:
    (start code js)
    EdgeHelper.hyperline.contains({ x: 10, y: 30 }, { x: 15, y: 35 }, { x: 15, y: 35 }, 30);
    (end code)
    */
    'contains': $.lambda(false)
  }
};


/*
 * File: Graph.Plot.js
 */

/*
   Object: Graph.Plot

   <Graph> rendering and animation methods.
   
   Properties:
   
   nodeHelper - <NodeHelper> object.
   edgeHelper - <EdgeHelper> object.
*/
Graph.Plot = {
    //Default initializer
    initialize: function(viz, klass){
      this.viz = viz;
      this.config = viz.config;
      this.node = viz.config.Node;
      this.edge = viz.config.Edge;
      this.animation = new Animation;
      this.nodeTypes = new klass.Plot.NodeTypes;
      this.edgeTypes = new klass.Plot.EdgeTypes;
      this.labels = viz.labels;
   },

    //Add helpers
    nodeHelper: NodeHelper,
    edgeHelper: EdgeHelper,
    
    Interpolator: {
        //node/edge property parsers
        'map': {
          'border': 'color',
          'color': 'color',
          'width': 'number',
          'height': 'number',
          'dim': 'number',
          'alpha': 'number',
          'lineWidth': 'number',
          'angularWidth':'number',
          'span':'number',
          'valueArray':'array-number',
          'dimArray':'array-number'
          //'colorArray':'array-color'
        },
        
        //canvas specific parsers
        'canvas': {
          'globalAlpha': 'number',
          'fillStyle': 'color',
          'strokeStyle': 'color',
          'lineWidth': 'number',
          'shadowBlur': 'number',
          'shadowColor': 'color',
          'shadowOffsetX': 'number',
          'shadowOffsetY': 'number',
          'miterLimit': 'number'
        },
  
        //label parsers
        'label': {
          'size': 'number',
          'color': 'color'
        },
  
        //Number interpolator
        'compute': function(from, to, delta) {
          return from + (to - from) * delta;
        },
        
        //Position interpolators
        'moebius': function(elem, props, delta, vector) {
          var v = vector.scale(-delta);  
          if(v.norm() < 1) {
              var x = v.x, y = v.y;
              var ans = elem.startPos
                .getc().moebiusTransformation(v);
              elem.pos.setc(ans.x, ans.y);
              v.x = x; v.y = y;
            }           
        },

        'linear': function(elem, props, delta) {
            var from = elem.startPos.getc(true);
            var to = elem.endPos.getc(true);
            elem.pos.setc(this.compute(from.x, to.x, delta), 
                          this.compute(from.y, to.y, delta));
        },

        'polar': function(elem, props, delta) {
          var from = elem.startPos.getp(true);
          var to = elem.endPos.getp();
          var ans = to.interpolate(from, delta);
          elem.pos.setp(ans.theta, ans.rho);
        },
        
        //Graph's Node/Edge interpolators
        'number': function(elem, prop, delta, getter, setter) {
          var from = elem[getter](prop, 'start');
          var to = elem[getter](prop, 'end');
          elem[setter](prop, this.compute(from, to, delta));
        },

        'color': function(elem, prop, delta, getter, setter) {
          var from = $.hexToRgb(elem[getter](prop, 'start'));
          var to = $.hexToRgb(elem[getter](prop, 'end'));
          var comp = this.compute;
          var val = $.rgbToHex([parseInt(comp(from[0], to[0], delta)),
                                parseInt(comp(from[1], to[1], delta)),
                                parseInt(comp(from[2], to[2], delta))]);
          
          elem[setter](prop, val);
        },
        
        'array-number': function(elem, prop, delta, getter, setter) {
          var from = elem[getter](prop, 'start'),
              to = elem[getter](prop, 'end'),
              cur = [];
          for(var i=0, l=from.length; i<l; i++) {
            var fromi = from[i], toi = to[i];
            if(fromi.length) {
              for(var j=0, len=fromi.length, curi=[]; j<len; j++) {
                curi.push(this.compute(fromi[j], toi[j], delta));
              }
              cur.push(curi);
            } else {
              cur.push(this.compute(fromi, toi, delta));
            }
          }
          elem[setter](prop, cur);
        },
        
        'node': function(elem, props, delta, map, getter, setter) {
          map = this[map];
          if(props) {
            var len = props.length;
            for(var i=0; i<len; i++) {
              var pi = props[i];
              this[map[pi]](elem, pi, delta, getter, setter);
            }
          } else {
            for(var pi in map) {
              this[map[pi]](elem, pi, delta, getter, setter);
            }
          }
        },
        
        'edge': function(elem, props, delta, mapKey, getter, setter) {
            var adjs = elem.adjacencies;
            for(var id in adjs) this['node'](adjs[id], props, delta, mapKey, getter, setter);
        },
        
        'node-property': function(elem, props, delta) {
          this['node'](elem, props, delta, 'map', 'getData', 'setData');
        },
        
        'edge-property': function(elem, props, delta) {
          this['edge'](elem, props, delta, 'map', 'getData', 'setData');  
        },

        'label-property': function(elem, props, delta) {
          this['node'](elem, props, delta, 'label', 'getLabelData', 'setLabelData');
        },
        
        'node-style': function(elem, props, delta) {
          this['node'](elem, props, delta, 'canvas', 'getCanvasStyle', 'setCanvasStyle');
        },
        
        'edge-style': function(elem, props, delta) {
          this['edge'](elem, props, delta, 'canvas', 'getCanvasStyle', 'setCanvasStyle');  
        }
    },
    
  
    /*
       sequence
    
       Iteratively performs an action while refreshing the state of the visualization.

       Parameters:

       options - (object) An object containing some sequence options described below
       condition - (function) A function returning a boolean instance in order to stop iterations.
       step - (function) A function to execute on each step of the iteration.
       onComplete - (function) A function to execute when the sequence finishes.
       duration - (number) Duration (in milliseconds) of each step.

      Example:
       (start code js)
        var rg = new $jit.RGraph(options);
        var i = 0;
        rg.fx.sequence({
          condition: function() {
           return i == 10;
          },
          step: function() {
            alert(i++);
          },
          onComplete: function() {
           alert('done!');
          }
        });
       (end code)

    */
    sequence: function(options) {
        var that = this;
        options = $.merge({
          condition: $.lambda(false),
          step: $.empty,
          onComplete: $.empty,
          duration: 200
        }, options || {});

        var interval = setInterval(function() {
          if(options.condition()) {
            options.step();
          } else {
            clearInterval(interval);
            options.onComplete();
          }
          that.viz.refresh(true);
        }, options.duration);
    },
    
    /*
      prepare
 
      Prepare graph position and other attribute values before performing an Animation. 
      This method is used internally by the Toolkit.
      
      See also:
       
       <Animation>, <Graph.Plot.animate>

    */
    prepare: function(modes) {
      var graph = this.viz.graph,
          accessors = {
            'node-property': {
              'getter': 'getData',
              'setter': 'setData'
            },
            'edge-property': {
              'getter': 'getData',
              'setter': 'setData'
            },
            'node-style': {
              'getter': 'getCanvasStyle',
              'setter': 'setCanvasStyle'
            },
            'edge-style': {
              'getter': 'getCanvasStyle',
              'setter': 'setCanvasStyle'
            }
          };

      //parse modes
      var m = {};
      if($.type(modes) == 'array') {
        for(var i=0, len=modes.length; i < len; i++) {
          var elems = modes[i].split(':');
          m[elems.shift()] = elems;
        }
      } else {
        for(var p in modes) {
          if(p == 'position') {
            m[modes.position] = [];
          } else {
            m[p] = $.splat(modes[p]);
          }
        }
      }
      
      graph.eachNode(function(node) { 
        node.startPos.set(node.pos);
        $.each(['node-property', 'node-style'], function(p) {
          if(p in m) {
            var prop = m[p];
            for(var i=0, l=prop.length; i < l; i++) {
              node[accessors[p].setter](prop[i], node[accessors[p].getter](prop[i]), 'start');
            }
          }
        });
        $.each(['edge-property', 'edge-style'], function(p) {
          if(p in m) {
            var prop = m[p];
            node.eachAdjacency(function(adj) {
              for(var i=0, l=prop.length; i < l; i++) {
                adj[accessors[p].setter](prop[i], adj[accessors[p].getter](prop[i]), 'start');
              }
            });
          }
        });
      });
      return m;
    },
    
    /*
       Method: animate
    
       Animates a <Graph> by interpolating some <Graph.Node>, <Graph.Adjacence> or <Graph.Label> properties.

       Parameters:

       opt - (object) Animation options. The object properties are described below
       duration - (optional) Described in <Options.Fx>.
       fps - (optional) Described in <Options.Fx>.
       hideLabels - (optional|boolean) Whether to hide labels during the animation.
       modes - (required|object) An object with animation modes (described below).

       Animation modes:
       
       Animation modes are strings representing different node/edge and graph properties that you'd like to animate. 
       They are represented by an object that has as keys main categories of properties to animate and as values a list 
       of these specific properties. The properties are described below
       
       position - Describes the way nodes' positions must be interpolated. Possible values are 'linear', 'polar' or 'moebius'.
       node-property - Describes which Node properties will be interpolated. These properties can be any of the ones defined in <Options.Node>.
       edge-property - Describes which Edge properties will be interpolated. These properties can be any the ones defined in <Options.Edge>.
       label-property - Describes which Label properties will be interpolated. These properties can be any of the ones defined in <Options.Label> like color or size.
       node-style - Describes which Node Canvas Styles will be interpolated. These are specific canvas properties like fillStyle, strokeStyle, lineWidth, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, etc.
       edge-style - Describes which Edge Canvas Styles will be interpolated. These are specific canvas properties like fillStyle, strokeStyle, lineWidth, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, etc.

       Example:
       (start code js)
       var viz = new $jit.Viz(options);
       //...tweak some Data, CanvasStyles or LabelData properties...
       viz.fx.animate({
         modes: {
           'position': 'linear',
           'node-property': ['width', 'height'],
           'node-style': 'shadowColor',
           'label-property': 'size'
         },
         hideLabels: false
       });
       //...can also be written like this...
       viz.fx.animate({
         modes: ['linear',
                 'node-property:width:height',
                 'node-style:shadowColor',
                 'label-property:size'],
         hideLabels: false
       });
       (end code)
    */
    animate: function(opt, versor) {
      opt = $.merge(this.viz.config, opt || {});
      var that = this,
          viz = this.viz,
          graph  = viz.graph,
          interp = this.Interpolator,
          animation =  opt.type === 'nodefx'? this.nodeFxAnimation : this.animation;
      // Prepare graph values
      var m = this.prepare(opt.modes);
      
      // Animate
      if(opt.hideLabels) this.labels.hideLabels(true);
      animation.setOptions($.extend(opt, {
        $animating: false,
        compute: function(delta) {
          graph.eachNode(function(node) { 
            for(var p in m) {
              interp[p](node, m[p], delta, versor);
            }
          });
          that.plot(opt, this.$animating, delta);
          this.$animating = true;
      	  drawTargetLine() ;
        },
        complete: function() {
          if(opt.hideLabels) that.labels.hideLabels(false);
          that.plot(opt);
          opt.onComplete();
      	  drawTargetLine() ;
        }       
      })).start();
    },
    
    /*
      nodeFx
   */
   nodeFx: function(opt) {
	 alert( "nodefx");
     var viz = this.viz,
         graph  = viz.graph,
         animation = this.nodeFxAnimation,
         options = $.merge(this.viz.config, {
           'elements': {
             'id': false,
             'properties': {}
           },
           'reposition': false
         });
     opt = $.merge(options, opt || {}, {
       onBeforeCompute: $.empty,
       onAfterCompute: $.empty
     });
     //check if an animation is running
     animation.stopTimer();
     var props = opt.elements.properties;
     //set end values for nodes
     if(!opt.elements.id) {
       graph.eachNode(function(n) {
         for(var prop in props) {
           n.setData(prop, props[prop], 'end');
         }
       });
     } else {
       var ids = $.splat(opt.elements.id);
       $.each(ids, function(id) {
         var n = graph.getNode(id);
         if(n) {
           for(var prop in props) {
             n.setData(prop, props[prop], 'end');
           }
         }
       });
     }
     //get keys
     var propnames = [];
     for(var prop in props) propnames.push(prop);
     //add node properties modes
     var modes = ['node-property:' + propnames.join(':')];
     //set new node positions
     if(opt.reposition) {
       modes.push('linear');
       viz.compute('end');
     }
     //animate
     this.animate($.merge(opt, {
       modes: modes,
       type: 'nodefx'
     }));
   },

    
    /*
       Method: plot
    
       Plots a <Graph>.

       Parameters:

       opt - (optional) Plotting options. Most of them are described in <Options.Fx>.

       Example:

       (start code js)
       var viz = new $jit.Viz(options);
       viz.fx.plot(); 
       (end code)

    */
   plot: function(opt, animating) {
     var viz = this.viz, 
         aGraph = viz.graph, 
         canvas = viz.canvas, 
         id = viz.root, 
         that = this, 
         ctx = canvas.getCtx(), 
         min = Math.min,
         opt = opt || this.viz.controller;
     
     opt.clearCanvas && canvas.clear();
       
     var root = aGraph.getNode(id);
     if(!root) return;
     
     var T = !!root.visited;
     aGraph.eachNode(function(node) {
       var nodeAlpha = node.getData('alpha');
       node.eachAdjacency(function(adj) {
         var nodeTo = adj.nodeTo;
         if(!!nodeTo.visited === T && node.drawn && nodeTo.drawn) {
           !animating && opt.onBeforePlotLine(adj);
           that.plotLine(adj, canvas, animating);
           !animating && opt.onAfterPlotLine(adj);
         }
       });
       if(node.drawn) {
         !animating && opt.onBeforePlotNode(node);
         that.plotNode(node, canvas, animating);
         !animating && opt.onAfterPlotNode(node);
       }
       if(!that.labelsHidden && opt.withLabels) {
         if(node.drawn && nodeAlpha >= 0.95) {
           that.labels.plotLabel(canvas, node, opt);
         } else {
           that.labels.hideLabel(node, false);
         }
       }
       node.visited = !T;
     });
    },


  /*
       Method: plotNode
    */
    plotNode: function(node, canvas, animating) {
        var f = node.getData('type'), 
            ctxObj = this.node.CanvasStyles;
        if(f != 'none') {
          var width = node.getData('lineWidth'),
              color = node.getData('color'),
              alpha = node.getData('alpha'),
              ctx = canvas.getCtx();

          // Grey if inactive
          if ( node.getData('inactive' ) == '1' ) color = '#383838' ;

          ctx.save();
          ctx.lineWidth = width;
          ctx.fillStyle = ctx.strokeStyle = color;
          ctx.globalAlpha = alpha;
          
          for(var s in ctxObj) {
            ctx[s] = node.getCanvasStyle(s);
          }

          this.nodeTypes[f].render.call(this, node, canvas, animating);
          ctx.restore();
        }
    },
    
    /*
       Method: plotLine
    
       Plots a <Graph.Adjacence>.

       Parameters:

       adj - (object) A <Graph.Adjacence>.
       canvas - (object) A <Canvas> instance.

    */
    plotLine: function(adj, canvas, animating) {
      var f = adj.getData('type'),
          ctxObj = this.edge.CanvasStyles;
      if(f != 'none') {
        var width = adj.getData('lineWidth'),
            color = adj.getData('color'),
            ctx = canvas.getCtx(),
            nodeFrom = adj.nodeFrom,
            nodeTo = adj.nodeTo;
        
        color = nodeFrom.getData('color') ;
        ctx.save();
        ctx.lineWidth = width;
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        
        //ctx.fill();
        //ctx.fillStyle = '#ee2222';
        
        
        //alert( adj.getData( 'name=') + color );
        ctx.globalAlpha = Math.min(nodeFrom.getData('alpha'), 
            nodeTo.getData('alpha'), 
            adj.getData('alpha'));
        
        for(var s in ctxObj) {
          ctx[s] = adj.getCanvasStyle(s);
        }

        this.edgeTypes[f].render.call(this, adj, canvas, animating);
        ctx.restore();
      }
    }    
  
};

/*
  Object: Graph.Plot3D
  
  <Graph> 3D rendering and animation methods.
  
  Properties:
  
  nodeHelper - <NodeHelper> object.
  edgeHelper - <EdgeHelper> object.

*/
Graph.Plot3D = $.merge(Graph.Plot, {
  Interpolator: {
    'linear': function(elem, props, delta) {
      var from = elem.startPos.getc(true);
      var to = elem.endPos.getc(true);
      elem.pos.setc(this.compute(from.x, to.x, delta), 
                    this.compute(from.y, to.y, delta),
                    this.compute(from.z, to.z, delta));
    }
  },
  
  plotNode: function(node, canvas) {
    if(node.getData('type') == 'none') return;
    this.plotElement(node, canvas, {
      getAlpha: function() {
        return node.getData('alpha');
      }
    });
  },
  
  plotLine: function(adj, canvas) {
    if(adj.getData('type') == 'none') return;
    this.plotElement(adj, canvas, {
      getAlpha: function() {
        return Math.min(adj.nodeFrom.getData('alpha'),
                        adj.nodeTo.getData('alpha'),
                        adj.getData('alpha'));
      }
    });
  },
  
  plotElement: function(elem, canvas, opt) {
    var gl = canvas.getCtx(),
        viewMatrix = new Matrix4,
        lighting = canvas.config.Scene.Lighting,
        wcanvas = canvas.canvases[0],
        program = wcanvas.program,
        camera = wcanvas.camera;
    
    if(!elem.geometry) {
      elem.geometry = new O3D[elem.getData('type')];
    }
    elem.geometry.update(elem);
    if(!elem.webGLVertexBuffer) {
      var vertices = [],
          faces = [],
          normals = [],
          vertexIndex = 0,
          geom = elem.geometry;
      
      for(var i=0, vs=geom.vertices, fs=geom.faces, fsl=fs.length; i<fsl; i++) {
        var face = fs[i],
            v1 = vs[face.a],
            v2 = vs[face.b],
            v3 = vs[face.c],
            v4 = face.d? vs[face.d] : false,
            n = face.normal;
        
        vertices.push(v1.x, v1.y, v1.z);
        vertices.push(v2.x, v2.y, v2.z);
        vertices.push(v3.x, v3.y, v3.z);
        if(v4) vertices.push(v4.x, v4.y, v4.z);
            
        normals.push(n.x, n.y, n.z);
        normals.push(n.x, n.y, n.z);
        normals.push(n.x, n.y, n.z);
        if(v4) normals.push(n.x, n.y, n.z);
            
        faces.push(vertexIndex, vertexIndex +1, vertexIndex +2);
        if(v4) {
          faces.push(vertexIndex, vertexIndex +2, vertexIndex +3);
          vertexIndex += 4;
        } else {
          vertexIndex += 3;
        }
      }
      //create and store vertex data
      elem.webGLVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, elem.webGLVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      //create and store faces index data
      elem.webGLFaceBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elem.webGLFaceBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);
      elem.webGLFaceCount = faces.length;
      //calculate vertex normals and store them
      elem.webGLNormalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, elem.webGLNormalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    }
    viewMatrix.multiply(camera.matrix, elem.geometry.matrix);
    //send matrix data
    gl.uniformMatrix4fv(program.viewMatrix, false, viewMatrix.flatten());
    gl.uniformMatrix4fv(program.projectionMatrix, false, camera.projectionMatrix.flatten());
    //send normal matrix for lighting
    var normalMatrix = Matrix4.makeInvert(viewMatrix);
    normalMatrix.$transpose();
    gl.uniformMatrix4fv(program.normalMatrix, false, normalMatrix.flatten());
    //send color data
    var color = $.hexToRgb(elem.getData('color'));
    color.push(opt.getAlpha());
    gl.uniform4f(program.color, color[0] / 255, color[1] / 255, color[2] / 255, color[3]);
    //send lighting data
    gl.uniform1i(program.enableLighting, lighting.enable);
    if(lighting.enable) {
      //set ambient light color
      if(lighting.ambient) {
        var acolor = lighting.ambient;
        gl.uniform3f(program.ambientColor, acolor[0], acolor[1], acolor[2]);
      }
      //set directional light
      if(lighting.directional) {
        var dir = lighting.directional,
            color = dir.color,
            pos = dir.direction,
            vd = new Vector3(pos.x, pos.y, pos.z).normalize().$scale(-1);
        gl.uniform3f(program.lightingDirection, vd.x, vd.y, vd.z);
        gl.uniform3f(program.directionalColor, color[0], color[1], color[2]);
      }
    }
    //send vertices data
    gl.bindBuffer(gl.ARRAY_BUFFER, elem.webGLVertexBuffer);
    gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);
    //send normals data
    gl.bindBuffer(gl.ARRAY_BUFFER, elem.webGLNormalBuffer);
    gl.vertexAttribPointer(program.normal, 3, gl.FLOAT, false, 0, 0);
    //draw!
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elem.webGLFaceBuffer );
    gl.drawElements(gl.TRIANGLES, elem.webGLFaceCount, gl.UNSIGNED_SHORT, 0);
  }
});


/*
 * File: Graph.Label.js
 *
*/

/*
   Object: Graph.Label

   An interface for plotting/hiding/showing labels.

   Description:

   This is a generic interface for plotting/hiding/showing labels.
   The <Graph.Label> interface is implemented in multiple ways to provide
   different label types.

   For example, the Graph.Label interface is implemented as <Graph.Label.HTML> to provide
   HTML label elements. Also we provide the <Graph.Label.SVG> interface for SVG type labels. 
   The <Graph.Label.Native> interface implements these methods with the native Canvas text rendering functions.
   
   All subclasses (<Graph.Label.HTML>, <Graph.Label.SVG> and <Graph.Label.Native>) implement the method plotLabel.
*/

Graph.Label = {};

/*
   Class: Graph.Label.Native

   Implements labels natively, using the Canvas text API.
*/
Graph.Label.Native = new Class({
    initialize: function(viz) {
      this.viz = viz;
    },

    /*
       Method: plotLabel

       Plots a label for a given node.

       Parameters:

       canvas - (object) A <Canvas> instance.
       node - (object) A <Graph.Node>.
       controller - (object) A configuration object.
       
       Example:
       
       (start code js)
       var viz = new $jit.Viz(options);
       var node = viz.graph.getNode('nodeId');
       viz.labels.plotLabel(viz.canvas, node, viz.config);
       (end code)
    */
    plotLabel: function(canvas, node, controller) {
      var ctx = canvas.getCtx();
      var pos = node.pos.getc(true);

      ctx.font = node.getLabelData('style') + ' ' + node.getLabelData('size') + 'px ' + node.getLabelData('family');
      ctx.textAlign = node.getLabelData('textAlign');
      ctx.fillStyle = ctx.strokeStyle = node.getLabelData('color');
      ctx.textBaseline = node.getLabelData('textBaseline');

      this.renderLabel(canvas, node, controller);
    },

    /*
       renderLabel

       Does the actual rendering of the label in the canvas. The default
       implementation renders the label close to the position of the node, this
       method should be overriden to position the labels differently.

       Parameters:

       canvas - A <Canvas> instance.
       node - A <Graph.Node>.
       controller - A configuration object. See also <Hypertree>, <RGraph>, <ST>.
    */
    renderLabel: function(canvas, node, controller) {
      var ctx = canvas.getCtx();
      var pos = node.pos.getc(true);
      ctx.fillText(node.name, pos.x, pos.y + node.getData("height") / 2);
    },

    hideLabel: $.empty,
    hideLabels: $.empty
});

/*
   Class: Graph.Label.DOM

   Abstract Class implementing some DOM label methods.

   Implemented by:

   <Graph.Label.HTML> and <Graph.Label.SVG>.

*/
Graph.Label.DOM = new Class({
    //A flag value indicating if node labels are being displayed or not.
    labelsHidden: false,
    //Label container
    labelContainer: false,
    //Label elements hash.
    labels: {},

    /*
       Method: getLabelContainer

       Lazy fetcher for the label container.

       Returns:

       The label container DOM element.

       Example:

      (start code js)
        var viz = new $jit.Viz(options);
        var labelContainer = viz.labels.getLabelContainer();
        alert(labelContainer.innerHTML);
      (end code)
    */
    getLabelContainer: function() {
      return this.labelContainer ?
        this.labelContainer :
        this.labelContainer = document.getElementById(this.viz.config.labelContainer);
    },

    /*
       Method: getLabel

       Lazy fetcher for the label element.

       Parameters:

       id - (string) The label id (which is also a <Graph.Node> id).

       Returns:

       The label element.

       Example:

      (start code js)
        var viz = new $jit.Viz(options);
        var label = viz.labels.getLabel('someid');
        alert(label.innerHTML);
      (end code)

    */
    getLabel: function(id) {
      return (id in this.labels && this.labels[id] != null) ?
        this.labels[id] :
        this.labels[id] = document.getElementById(id);
    },

    /*
       Method: hideLabels

       Hides all labels (by hiding the label container).

       Parameters:

       hide - (boolean) A boolean value indicating if the label container must be hidden or not.

       Example:
       (start code js)
        var viz = new $jit.Viz(options);
        rg.labels.hideLabels(true);
       (end code)

    */
    hideLabels: function (hide) {
      var container = this.getLabelContainer();
      if(hide)
        container.style.display = 'none';
      else
        container.style.display = '';
      this.labelsHidden = hide;
    },

    /*
       Method: clearLabels

       Clears the label container.

       Useful when using a new visualization with the same canvas element/widget.

       Parameters:

       force - (boolean) Forces deletion of all labels.

       Example:
       (start code js)
        var viz = new $jit.Viz(options);
        viz.labels.clearLabels();
        (end code)
    */
    clearLabels: function(force) {
      for(var id in this.labels) {
        if (force || !this.viz.graph.hasNode(id)) {
          this.disposeLabel(id);
          delete this.labels[id];
        }
      }
    },

    /*
       Method: disposeLabel

       Removes a label.

       Parameters:

       id - (string) A label id (which generally is also a <Graph.Node> id).

       Example:
       (start code js)
        var viz = new $jit.Viz(options);
        viz.labels.disposeLabel('labelid');
       (end code)
    */
    disposeLabel: function(id) {
      var elem = this.getLabel(id);
      if(elem && elem.parentNode) {
        elem.parentNode.removeChild(elem);
      }
    },

    /*
       Method: hideLabel

       Hides the corresponding <Graph.Node> label.

       Parameters:

       node - (object) A <Graph.Node>. Can also be an array of <Graph.Nodes>.
       show - (boolean) If *true*, nodes will be shown. Otherwise nodes will be hidden.

       Example:
       (start code js)
        var rg = new $jit.Viz(options);
        viz.labels.hideLabel(viz.graph.getNode('someid'), false);
       (end code)
    */
    hideLabel: function(node, show) {
      node = $.splat(node);
      var st = show ? "" : "none", lab, that = this;
      $.each(node, function(n) {
        var lab = that.getLabel(n.id);
        if (lab) {
          lab.style.display = st;
        }
      });
    },

    /*
       fitsInCanvas

       Returns _true_ or _false_ if the label for the node is contained in the canvas dom element or not.

       Parameters:

       pos - A <Complex> instance (I'm doing duck typing here so any object with _x_ and _y_ parameters will do).
       canvas - A <Canvas> instance.

       Returns:

       A boolean value specifying if the label is contained in the <Canvas> DOM element or not.

    */
    fitsInCanvas: function(pos, canvas) {
      var size = canvas.getSize();
      if(pos.x >= size.width || pos.x < 0
         || pos.y >= size.height || pos.y < 0) return false;
       return true;
    }
});

/*
   Class: Graph.Label.HTML

   Implements HTML labels.

   Extends:

   All <Graph.Label.DOM> methods.

*/


/*
 * File: Loader.js
 * 
 */

/*
   Object: Loader

   Provides methods for loading and serving JSON data.
*/
var Loader = {
     construct: function(json) {
        var isGraph = ($.type(json) == 'array');
        var ans = new Graph(this.graphOptions, this.config.Node, this.config.Edge, this.config.Label);
        if(!isGraph) 
            // Make tree
            (function (ans, json) {
                ans.addNode(json);
                if(json.children) {
                  for(var i=0, ch = json.children; i<ch.length; i++) {
                    ans.addAdjacence(json, ch[i]);
                    arguments.callee(ans, ch[i]);
                  }
                }
            })(ans, json);
        else
            //make graph
            (function (ans, json) {
                var getNode = function(id) {
                  //alert( "make a graph ") ;

                  for(var i=0, l=json.length; i<l; i++) {
                    if(json[i].id == id) {
                      return json[i];
                    }
                  }
                  // The node was not defined in the JSON
                  // Let's create it
                  var newNode = {
                		"id" : id,
                		"name" : id
                	};
                  return ans.addNode(newNode);
                };

                for(var i=0, l=json.length; i<l; i++) {
                  ans.addNode(json[i]);
                  var adj = json[i].adjacencies;
                  if (adj) {
                    for(var j=0, lj=adj.length; j<lj; j++) {
                      var node = adj[j], data = {};
                      if(typeof adj[j] != 'string') {
                        data = $.merge(node.data, {});
                        node = node.nodeTo;
                      }
                      ans.addAdjacence(json[i], getNode(node), data);
                    }
                  }
                }
            })(ans, json);

        return ans;
    },

    /*
     Method: loadJSON
    
     Loads a JSON structure to the visualization. The JSON structure can be a JSON *tree* or *graph* structure.
     
      A JSON tree or graph structure consists of nodes, each having as properties
       
       id - (string) A unique identifier for the node
       name - (string) A node's name
       data - (object) The data optional property contains a hash (i.e {}) 
       where you can store all the information you want about this node.
        
      For JSON *Tree* structures, there's an extra optional property *children* of type Array which contains the node's children.
      
      Example:

      (start code js)
        var json = {  
          "id": "aUniqueIdentifier",  
          "name": "usually a nodes name",  
          "data": {
            "some key": "some value",
            "some other key": "some other value"
           },  
          "children": [ *other nodes or empty* ]  
        };  
      (end code)
        
        JSON *Graph* structures consist of an array of nodes, each specifying the nodes to which the current node is connected. 
        For JSON *Graph* structures, the *children* property is replaced by the *adjacencies* property.
        
        There are two types of *Graph* structures, *simple* and *extended* graph structures.
        
        For *simple* Graph structures, the adjacencies property contains an array of strings, each specifying the 
        id of the node connected to the main node.
        
        Example:
        
        (start code js)
        var json = [  
          {  
            "id": "aUniqueIdentifier",  
            "name": "usually a nodes name",  
            "data": {
              "some key": "some value",
              "some other key": "some other value"
             },  
            "adjacencies": ["anotherUniqueIdentifier", "yetAnotherUniqueIdentifier", 'etc']  
          },

          'other nodes go here...' 
        ];          
        (end code)
        
        For *extended Graph structures*, the adjacencies property contains an array of Adjacency objects that have as properties
        
        nodeTo - (string) The other node connected by this adjacency.
        data - (object) A data property, where we can store custom key/value information.
        
        Example:
        
        (start code js)
        var json = [  
          {  
            "id": "aUniqueIdentifier",  
            "name": "usually a nodes name",  
            "data": {
              "some key": "some value",
              "some other key": "some other value"
             },  
            "adjacencies": [  
            {  
              nodeTo:"aNodeId",  
              data: {} //put whatever you want here  
            },
            'other adjacencies go here...'  
          },

          'other nodes go here...' 
        ];          
        (end code)
       
       About the data property:
       
       As described before, you can store custom data in the *data* property of JSON *nodes* and *adjacencies*. 
       You can use almost any string as key for the data object. Some keys though are reserved by the toolkit, and 
       have special meanings. This is the case for keys starting with a dollar sign, for example, *$width*.
       
       For JSON *node* objects, adding dollar prefixed properties that match the names of the options defined in 
       <Options.Node> will override the general value for that option with that particular value. For this to work 
       however, you do have to set *overridable = true* in <Options.Node>.
       
       The same thing is true for JSON adjacencies. Dollar prefixed data properties will alter values set in <Options.Edge> 
       if <Options.Edge> has *overridable = true*.
       
       When loading JSON data into TreeMaps, the *data* property must contain a value for the *$area* key, 
       since this is the value which will be taken into account when creating the layout. 
       The same thing goes for the *$color* parameter.
       
       In JSON Nodes you can use also *$label-* prefixed properties to refer to <Options.Label> properties. For example, 
       *$label-size* will refer to <Options.Label> size property. Also, in JSON nodes and adjacencies you can set 
       canvas specific properties individually by using the *$canvas-* prefix. For example, *$canvas-shadowBlur* will refer 
       to the *shadowBlur* property.
       
       These properties can also be accessed after loading the JSON data from <Graph.Nodes> and <Graph.Adjacences> 
       by using <Accessors>. For more information take a look at the <Graph> and <Accessors> documentation.
       
       Finally, these properties can also be used to create advanced animations like with <Options.NodeStyles>. For more 
       information about creating animations please take a look at the <Graph.Plot> and <Graph.Plot.animate> documentation.
       
       loadJSON Parameters:
    
        json - A JSON Tree or Graph structure.
        i - For Graph structures only. Sets the indexed node as root for the visualization.

    */
    loadJSON: function(json, i) {
      this.json = json;
      //if they're canvas labels erase them.
      if(this.labels && this.labels.clearLabels) {
        this.labels.clearLabels(true);
      }
      this.graph = this.construct(json);
      if($.type(json) != 'array'){
        this.root = json.id;
      } else {
        this.root = json[i? i : 0].id;
      }
    },
    
    /*
      Method: toJSON
   
      Returns a JSON tree/graph structure from the visualization's <Graph>. 
      See <Loader.loadJSON> for the graph formats available.
      
      See also:
      
      <Loader.loadJSON>
      
      Parameters:
      
      type - (string) Default's "tree". The type of the JSON structure to be returned. 
      Possible options are "tree" or "graph".
    */    
    toJSON: function(type) {
      type = type || "tree";
      if(type == 'tree') {
        var ans = {};
        var rootNode = this.graph.getNode(this.root);
        var ans = (function recTree(node) {
          var ans = {};
          ans.id = node.id;
          ans.name = node.name;
          ans.data = node.data;
          var ch =[];
          node.eachSubnode(function(n) {
            ch.push(recTree(n));
          });
          ans.children = ch;
          return ans;
        })(rootNode);
        return ans;
      } else {
        var ans = [];
        var T = !!this.graph.getNode(this.root).visited;
        this.graph.eachNode(function(node) {
          var ansNode = {};
          ansNode.id = node.id;
          ansNode.name = node.name;
          ansNode.data = node.data;
          var adjs = [];
          node.eachAdjacency(function(adj) {
            var nodeTo = adj.nodeTo;
            if(!!nodeTo.visited === T) {
              var ansAdj = {};
              ansAdj.nodeTo = nodeTo.id;
              ansAdj.data = adj.data;
              adjs.push(ansAdj);
            }
          });
          ansNode.adjacencies = adjs;
          ans.push(ansNode);
          node.visited = !T;
        });
        return ans;
      }
    }
};



/*
 * File: Layouts.js
 * 
 * Implements base Tree and Graph layouts.
 *
 * Description:
 *
 * Implements base Tree and Graph layouts like Radial, Tree, etc.
 * 
 */

/*
 * Object: Layouts
 * 
 * Parent object for common layouts.
 *
 */
var Layouts = $jit.Layouts = {};


//Some util shared layout functions are defined here.
var NodeDim = {
  label: null,
  
  compute: function(graph, prop, opt) {
    this.initializeLabel(opt);
    var label = this.label, style = label.style;
    graph.eachNode(function(n) {
      var autoWidth  = n.getData('autoWidth'),
          autoHeight = n.getData('autoHeight');
      if(autoWidth || autoHeight) {
        //delete dimensions since these are
        //going to be overridden now.
        delete n.data.$width;
        delete n.data.$height;
        delete n.data.$dim;
        
        var width  = n.getData('width'),
            height = n.getData('height');
        //reset label dimensions
        style.width  = autoWidth? 'auto' : width + 'px';
        style.height = autoHeight? 'auto' : height + 'px';
        
        //TODO(nico) should let the user choose what to insert here.
        label.innerHTML = n.name;
        
        var offsetWidth  = label.offsetWidth,
            offsetHeight = label.offsetHeight;
        var type = n.getData('type');
        if($.indexOf(['circle', 'square', 'triangle', 'star'], type) === -1) {
          n.setData('width', offsetWidth);
          n.setData('height', offsetHeight);
        } else {
          var dim = offsetWidth > offsetHeight? offsetWidth : offsetHeight;
          n.setData('width', dim);
          n.setData('height', dim);
          n.setData('dim', dim); 
        }
      }
    });
  },
  
  initializeLabel: function(opt) {
    if(!this.label) {
      this.label = document.createElement('div');
      document.body.appendChild(this.label);
    }
    this.setLabelStyles(opt);
  },
  
  setLabelStyles: function(opt) {
    $.extend(this.label.style, {
      'visibility': 'hidden',
      'position': 'absolute',
      'width': 'auto',
      'height': 'auto'
    });
    this.label.className = 'jit-autoadjust-label';
  }
};




/*
 * File: Layouts.ForceDirected.js
 * bcd mmcible
 */

 Layouts.ForceDirected = new Class({
  getOptions: function(random) {
    var s = this.canvas.getSize();
    var w = s.width, h = s.height;
    myCanvas = this.canvas ;
    //count nodes
    var count = 0;
    this.graph.eachNode(function(n) { 
      count++;
    });
    var k2 = w * h / count, k = Math.sqrt(k2);   
    var l = this.config.levelDistance;
    
    return {
      width: w,
      height: h,
      tstart: w * 0.1,
      nodef: function(x) { return k2 / (x || 1); },
      edgef: function(x) { return /* x * x / k; */ k * (x - l); }
    };
  },
  
  compute: function(property, incremental) {
    var prop = $.splat(property || ['current', 'start', 'end']);
    var opt = this.getOptions();
	var graph = this.graph;
	myGraph = graph ;
    NodeDim.compute(this.graph, prop, this.config);
    this.graph.computeLevels(this.root, 0, "ignore");
	var maxlvl = 1 ;
    this.graph.eachNode(function(n) {
    	$.each(prop, function(p) {
	        lvl = graph.getNode(n.id).getData('lvl');
	        view = parseInt(graph.getNode(n.id).getData('view')) ;
	        click = parseInt(graph.getNode(n.id).getData('click')) ;
	        ctr = click * 1000 / view ;
	        if ( ctr < 0.01 ) ctr = 0.01 ;
	        if ( ctr > 10 ) ctr = 10 ;
	        if ( maxctr < ctr ) {maxctr =ctr ; }
	        if ( minctr > ctr ) {minctr =ctr ; }
	        if ( lvl > maxlvl ) maxlvl = lvl ;
            if ( lvl==1 ) { lvlcount += 1 ; graph.getNode(n.id).setData('color',getMyColor(lvlcount)); } // count and color
            if ( lvl==2 ) { lvl2count += 1 ; }
	        //dist = ( Math.sqrt(maxctr) - Math.sqrt(ctr) ) * 450 / ( Math.sqrt(maxctr) - Math.sqrt(minctr) ) ;
	        dist = ( Math.sqrt(maxctr) - Math.sqrt(ctr) ) * 297 / ( Math.sqrt(maxctr) - Math.sqrt(minctr) ) ;
    	});
    });
    lvl2count = lvl2count + ( lvlcount/2)  ;
    maxctr = 11 ;
    minctr = 0.1 ;
    var vv = 0 ;
    var heading= [] ;
    // Calculate angles on level 1
    this.graph.eachNode(function(n) {
        var gNode = graph.getNode(n.id); 
    	$.each(prop, function(p) {
	        parentName = graph.getNode(n.id).getData('parent');
	        if ( parentName=="" ) {
		        var pos = n.getPos(p);
    	        graph.getNode(n.id).setData('click',0);
    	        graph.getNode(n.id).setData('view',0);
        		// The children
			    var nbChildren = 0 ;
		        n.eachAdjacency(function(adj) {
		        	nbChildren += 1;
		        });
	        	langle = monAngle( graph.getNode(n.id).id , parentName , nbChildren ) ;
	        }
    	});
    });
    // The level 2 and up
    this.graph.eachNode(function(n) {
        var gNode = graph.getNode(n.id); // children
        var parentName = graph.getNode(n.id).getData('parent') ;
    	$.each(prop, function(p) {
	        if ( parentName!="" ) {
	        	var pos = n.getPos(p);
        		// The parent
			    var nbParent = 0 ;
		        n.eachAdjacency(function(adj) {
		        	nbParent += 1;
		        });
	        	langle = monAngle( graph.getNode(n.id).id , parentName , nbParent-1 ) ;
	        	couleur = graph.getNode(parentName).getData('color') ;
	        	graph.getNode(n.id).setData('color',couleur) ;
		        lvl = graph.getNode(n.id).getData('lvl');
		        view = graph.getNode(n.id).getData('view') ;
		        click = graph.getNode(n.id).getData('click') ;
		        // Grand Total
		        if ( graph.getNode(n.id).getData('inactive') != '1' ) {
			        totView += parseInt( view ) ;
			        totClick += parseInt(click) ;
		        }
		        if ( graph.getNode(n.id).getData('inactive') != '1' || graph.getNode(parentName).getData('inactive') == '1' ) {
			        // Total by level 1
			        pclick = parseInt(graph.getNode(parentName).getData('click')) ;
			        pclick = pclick + parseInt(click) ;
	    	        graph.getNode(parentName).setData('click',pclick);
			        pview = parseInt(graph.getNode(parentName).getData('view')) ;
			        pview = pview + parseInt(view) ;
	    	        graph.getNode(parentName).setData('view',pview);
		        }
		        
		        ctr = click * 1000 / view ;
		        if ( ctr < 0.01 ) ctr = 0.01 ;
    	        if ( ctr < 10 ) {
    	        	dist = ( Math.sqrt(maxctr) - Math.sqrt(ctr) ) * 268 / ( Math.sqrt(maxctr) - Math.sqrt(minctr) ) ;  
    	        } else {
    	        	dist = (100-ctr) * 0.268 ;  
    	        }
		        if ( langle > 360 ) { langle-=360 ; }
		        radius = langle * ( Math.PI / 180 ) ;
		        pos.x = dist * Math.cos( radius ) ;
		        pos.y = dist * Math.sin( radius ) ;
			    n.disp = {};
			    $.each(prop, function(p) {
			    	n.disp[p] = $C(0, 0);
			    });
			    n.disp[p].$add(pos);
	        }
    	});
    });
    // The level 1 again
    this.graph.eachNode(function(n) {
        var gNode = graph.getNode(n.id); 
    	$.each(prop, function(p) {
	        parentName = graph.getNode(n.id).getData('parent');
	        if ( parentName=="" ) {
		        var pos = n.getPos(p);
        		// The children
			    var nbChildren = 0 ;
		        n.eachAdjacency(function(adj) {
		        	nbChildren += 1;
		        });
	        	langle = monAngle( graph.getNode(n.id).id , graph.getNode(n.id).id , nbChildren ) ;
	        	if ( langle >= 0 ) {
	    	        view = parseInt(graph.getNode(n.id).getData('view')) ;
	    	        click = parseInt(graph.getNode(n.id).getData('click')) ;
	    	        graph.getNode(n.id).setData('angle',langle) ;
			        lvl = graph.getNode(n.id).getData('lvl');
	    	        ctr = click * 1000 / view ;
	    	        if ( ctr < 0.01 ) ctr = 0.01 ;
					// if sq=900 maxdist is 402 if sq=600 maxdist is 268
	    	        if ( ctr < 10 ) {
	    	        	dist = ( Math.sqrt(maxctr) - Math.sqrt(ctr) ) * 268 / ( Math.sqrt(maxctr) - Math.sqrt(minctr) ) ;  
	    	        } else {
	    	        	dist = (100-ctr) * 0.268 ;
	    	        }
			        if ( langle > 360 ) { langle-=360 ; }
			        radius = langle * ( Math.PI / 180 ) ;
			        pos.x = dist * Math.cos( radius ) ;
			        pos.y = dist * Math.sin( radius ) ;
				    n.disp = {};
				    $.each(prop, function(p) {
				    	n.disp[p] = $C(0, 0);
				    });
				    n.disp[p].$add(pos);
	        	}
	        }
    	});
    });
    incremental.onComplete();
    if ( oriView == '0' ) {
    	oriView=totView ; oriClick=totClick ; 
    	oriCtr = Math.round( (oriClick * 100000 / oriView ), 2  )/100 ;
    }
    //this.computePositions(prop, opt, incremental);
  },
  
  
  computePositions: function(property, opt, incremental) {
    var times = this.config.iterations, i = 0, that = this;
	var graph = this.graph;
    if(incremental) {
    	(function iter() {
        for(var total=incremental.iter, j=0; j<total; j++) {
          opt.t = opt.tstart;
          if(times) opt.t *= (1 - i++/(times -1));
          //that.computePositionStep(property, opt);
          //that.computeBestSpot(property, opt);
          if(times && i >= times) {
            incremental.onComplete();
            return;
          }
        }
        //incremental.onStep(Math.round(i / (times -1) * 100));
        setTimeout(iter, 1);
      })();
    } else {
      for(i=0; i < times; i++) {
    	opt.t = opt.tstart * (1 - i/(times -1));
        //this.computePositionStep(property, opt);
      }
    }
  },
  computeBestSpot: function(property, opt) {
	    var graph = this.graph;
	    var min = Math.min, max = Math.max;
	    var dpos = $C(0, 0);
	    //calculate repulsive forces
	    graph.eachNode(function(v) {
	      //initialize disp
	      $.each(property, function(p) {
	        v.disp[p].x = 0; v.disp[p].y = 0;
	      });
	      graph.eachNode(function(u) {

	        if(u.id != v.id) {
	          $.each(property, function(p) {
                if (v.name=="Frengo" ) alert("before " +v.name+" = " + v.disp[p].x );
	            var vp = v.getPos(p), up = u.getPos(p);
	            dpos.x = vp.x - up.x;
	            dpos.y = vp.y - up.y;	            
	            var norm = dpos.norm() || 1;
	            v.disp[p].$add(dpos.$scale(opt.nodef(norm) / norm));
                if (v.name=="Frengo" ) alert("after " + v.name+" = " + v.disp[p].x + "\nNorm="+norm );
	          });
	        }
	      });
	    });
	    //calculate attractive forces
	    var T = !!graph.getNode(this.root).visited;
	    graph.eachNode(function(node) {
	      node.eachAdjacency(function(adj) {
	        var nodeTo = adj.nodeTo;
	        if(!!nodeTo.visited === T) {
	          $.each(property, function(p) {
	            var vp = node.getPos(p), up = nodeTo.getPos(p);
	            dpos.x = vp.x - up.x;
	            dpos.y = vp.y - up.y;
	            
	            var norm = dpos.norm() || 1;
	            node.disp[p].$add(dpos.$scale(-opt.edgef(norm) / norm));
	            nodeTo.disp[p].$add(dpos.$scale(-1));
	          });
	        }
	      });
	      node.visited = !T;
	    });
	    //arrange positions to fit the canvas
	    var t = opt.t, w2 = opt.width / 2, h2 = opt.height / 2;
	    graph.eachNode(function(u) {
	      $.each(property, function(p) {
	        var disp = u.disp[p];
	        var norm = disp.norm() || 1;
	        var p = u.getPos(p);
	        p.$add($C(disp.x * min(Math.abs(disp.x), t) / norm, 
	            disp.y * min(Math.abs(disp.y), t) / norm));
	        p.x = min(w2, max(-w2, p.x));
	        p.y = min(h2, max(-h2, p.y));
	      });
	    });
	  },
  computePositionStep: function(property, opt) {
    var graph = this.graph;
    var min = Math.min, max = Math.max;
    var dpos = $C(0, 0);
    //calculate repulsive forces
    graph.eachNode(function(v) {
      //initialize disp
      $.each(property, function(p) {
        v.disp[p].x = 0; v.disp[p].y = 0;
      });
      graph.eachNode(function(u) {
        if(u.id != v.id) {
          $.each(property, function(p) {
            var vp = v.getPos(p), up = u.getPos(p);
            //alert( "before "+vp.x ) ;
            //alert( "up before" + up.x ) ;
            dpos.x = vp.x - up.x;
            dpos.y = vp.y - up.y;
            //alert( "after " + dpos.x ) ;
            
            var norm = dpos.norm() || 1;
            v.disp[p].$add(dpos.$scale(opt.nodef(norm) / norm));
          });
        }
      });
    });
    //calculate attractive forces
    var T = !!graph.getNode(this.root).visited;
    graph.eachNode(function(node) {
      node.eachAdjacency(function(adj) {
        var nodeTo = adj.nodeTo;
        if(!!nodeTo.visited === T) {
          $.each(property, function(p) {
            var vp = node.getPos(p), up = nodeTo.getPos(p);
            dpos.x = vp.x - up.x;
            dpos.y = vp.y - up.y;
            
            var norm = dpos.norm() || 1;
            node.disp[p].$add(dpos.$scale(-opt.edgef(norm) / norm));
            nodeTo.disp[p].$add(dpos.$scale(-1));
          });
        }
      });
      node.visited = !T;
    });
    //arrange positions to fit the canvas
    var t = opt.t, w2 = opt.width / 2, h2 = opt.height / 2;
    graph.eachNode(function(u) {
      $.each(property, function(p) {
        var disp = u.disp[p];
        var norm = disp.norm() || 1;
        var p = u.getPos(p);
        p.$add($C(disp.x * min(Math.abs(disp.x), t) / norm, 
            disp.y * min(Math.abs(disp.y), t) / norm));
        p.x = min(w2, max(-w2, p.x));
        p.y = min(h2, max(-h2, p.y));
        /*curPosX += 10 ;
        curPosY += 10 ; 
        p.x = curPosX ;
        p.y = curPosY ;*/
      });
    });
  }
});

/*
 * File: ForceDirected.js
 */

/*
   Class: ForceDirected
   A visualization that lays graphs using a Force-Directed layout algorithm.
   Inspired by:
   Force-Directed Drawing Algorithms (Stephen G. Kobourov) <http://www.cs.brown.edu/~rt/gdhandbook/chapters/force-directed.pdf>
   
  Implements:
  
  All <Loader> methods
   Constructor Options:
   
   Inherits options from
   - <Options.Canvas>
   - <Options.Controller>
   - <Options.Node>
   - <Options.Edge>
   - <Options.Label>
   - <Options.Events>
   - <Options.Tips>
   - <Options.NodeStyles>
   - <Options.Navigation>
   
   Additionally, there are two parameters
   
   levelDistance - (number) Default's *50*. The natural length desired for the edges.
   iterations - (number) Default's *50*. The number of iterations for the spring layout simulation. Depending on the browser's speed you could set this to a more 'interesting' number, like *200*. 
     
   Instance Properties:
   canvas - Access a <Canvas> instance.
   graph - Access a <Graph> instance.
   op - Access a <ForceDirected.Op> instance.
   fx - Access a <ForceDirected.Plot> instance.
   labels - Access a <ForceDirected.Label> interface implementation.

*/

$jit.ForceDirected = new Class( {

  Implements: [ Loader, Extras, Layouts.ForceDirected ],

  initialize: function(controller) {
    var $ForceDirected = $jit.ForceDirected;

    var config = {
      iterations: 50,
      levelDistance: 50
    };

    this.controller = this.config = $.merge(Options("Canvas", "Node", "Edge",
        "Fx", "Tips", "NodeStyles", "Events", "Navigation", "Controller", "Label"), config, controller);

    var canvasConfig = this.config;
    if(canvasConfig.useCanvas) {
      this.canvas = canvasConfig.useCanvas;
      this.config.labelContainer = this.canvas.id + '-label';
    } else {
      if(canvasConfig.background) {
        canvasConfig.background = $.merge({
          type: 'Circles'
        }, canvasConfig.background);
      }
      this.canvas = new Canvas(this, canvasConfig);
      this.config.labelContainer = (typeof canvasConfig.injectInto == 'string'? canvasConfig.injectInto : canvasConfig.injectInto.id) + '-label';
    }

    this.graphOptions = {
      'klass': Complex,
      'Node': {
        'selected': false,
        'exist': true,
        'drawn': true
      }
    };
    this.graph = new Graph(this.graphOptions, this.config.Node,
        this.config.Edge);
    this.labels = new $ForceDirected.Label[canvasConfig.Label.type](this);
    this.fx = new $ForceDirected.Plot(this, $ForceDirected);
    this.op = new $ForceDirected.Op(this);
    this.json = null;
    this.busy = false;
    // initialize extras
    this.initializeExtras();
  },

  /* 
    Method: refresh 
    Computes positions and plots the tree.
  */
  refresh: function() {
    this.compute();
    this.plot();
  },

  reposition: function() {
    this.compute('end');
  },

/*

  
  */
  computeIncremental: function(opt) {
    opt = $.merge( {
      iter: 20,
      property: 'end',
      onStep: $.empty,
      onComplete: $.empty
    }, opt || {});

    this.config.onBeforeCompute(this.graph.getNode(this.root));
    this.compute(opt.property, opt);
  },

  /*
    Method: plot
   
    Plots the ForceDirected graph. This is a shortcut to *fx.plot*.
   */
  plot: function() {
    this.fx.plot();
  },

  /*
     Method: animate
     Animates the graph from the current positions to the 'end' node positions.
  */
  animate: function(opt) {
    this.fx.animate($.merge( {
      modes: [ 'linear' ]
    }, opt || {}))
  }
});

$jit.ForceDirected.$extend = true;

(function(ForceDirected) {
  /*
     Class: ForceDirected.Op
  */
  ForceDirected.Op = new Class( {
    Implements: Graph.Op
  });

  /*
    Class: ForceDirected.Plot
  */
  ForceDirected.Plot = new Class( {
    Implements: Graph.Plot
  });

  /*
    Class: ForceDirected.Label
  */
  ForceDirected.Label = {};
  /*
     ForceDirected.Label.Native
  */
  ForceDirected.Label.Native = new Class( {
    Implements: Graph.Label.Native
  });

  /*
    ForceDirected.Label.SVG
  */
  ForceDirected.Label.SVG = new Class( {
    Implements: Graph.Label.SVG,

    initialize: function(viz) {
      this.viz = viz;
    },

    /* 
       placeLabel
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), 
          canvas = this.viz.canvas,
          ox = canvas.translateOffsetX,
          oy = canvas.translateOffsetY,
          sx = canvas.scaleOffsetX,
          sy = canvas.scaleOffsetY,
          radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x * sx + ox + radius.width / 2),
        y: Math.round(pos.y * sy + oy + radius.height / 2)
      };
      tag.setAttribute('x', labelPos.x);
      tag.setAttribute('y', labelPos.y);

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
     ForceDirected.Label.HTML
     Custom extension of <Graph.Label.HTML>.

     Extends:
     All <Graph.Label.HTML> methods.
     See also:
     <Graph.Label.HTML>
  */
  ForceDirected.Label.HTML = new Class( {
    Implements: Graph.Label.HTML,

    initialize: function(viz) {
      this.viz = viz;
    },
    /* 
       placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.
       Parameters:
       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), 
          canvas = this.viz.canvas,
          ox = canvas.translateOffsetX,
          oy = canvas.translateOffsetY,
          sx = canvas.scaleOffsetX,
          sy = canvas.scaleOffsetY,
          radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x * sx + ox + radius.width / 2),
        y: Math.round(pos.y * sy + oy + radius.height / 2)
      };
      var style = tag.style;
      style.left = labelPos.x + 'px';
      style.top = labelPos.y + 'px';
      style.display = this.fitsInCanvas(labelPos, canvas) ? '' : 'none';

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
  */
  ForceDirected.Plot.NodeTypes = new Class({
    'none': {
      'render': $.empty,
      'contains': $.lambda(false)
    },
    'circle': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            dim = node.getData('view')/500;
        if ( dim > 16 ) dim = 16 ;
        if ( dim < 4  ) dim = 4 ;
        this.nodeHelper.circle.render('fill', pos, dim, canvas);
      },
      'contains': function(node, pos){
        var npos = node.pos.getc(true), 
            dim = node.getData('view')/500;
        if ( dim > 18 ) dim = 18 ;
        if ( dim < 5  ) dim = 5 ;

        return this.nodeHelper.circle.contains(npos, pos, dim);
      }
    },
    'ellipse': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            width = node.getData('width'), 
            height = node.getData('height');
        this.nodeHelper.ellipse.render('fill', pos, width, height, canvas);
        },
      'contains': function(node, pos){
        var npos = node.pos.getc(true), 
            width = node.getData('width'), 
            height = node.getData('height');
        return this.nodeHelper.ellipse.contains(npos, pos, width, height);
      }
    },
    'square': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            dim = node.getData('view')/500;
        	if ( dim > 15 ) dim = 15 ;
        	if ( dim < 4  ) dim = 4 ;
 
        this.nodeHelper.square.render('fill', pos, dim, canvas);
        //this.nodeHelper.square.render('stroke', pos, dim, canvas);
      },
      'contains': function(node, pos){
        var npos = node.pos.getc(true), 
            dim = node.getData('view')/500;
    	if ( dim > 20 ) dim = 20 ;
    	if ( dim < 5  ) dim = 5 ;
        return this.nodeHelper.square.contains(npos, pos, dim);
      }
    },
    'rectangle': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            width = node.getData('width'), 
            height = node.getData('height');
        this.nodeHelper.rectangle.render('fill', pos, width, height, canvas);
      },
      'contains': function(node, pos){
        var npos = node.pos.getc(true), 
            width = node.getData('width'), 
            height = node.getData('height');
        return this.nodeHelper.rectangle.contains(npos, pos, width, height);
      }
    },
    'triangle': {
    	      'render': function(node, canvas){
        var pos = node.pos.getc(true), 
            dim = node.getData('dim');
        this.nodeHelper.triangle.render('fill', pos, dim, canvas);
      },
      'contains': function(node, pos) {
        var npos = node.pos.getc(true), 
            dim = node.getData('dim');
        return this.nodeHelper.triangle.contains(npos, pos, dim);
      }
    },
    'star': {
      'render': function(node, canvas){
        var pos = node.pos.getc(true),
        	dim = node.getData('dim');
        dim = node.getData('view')/500;
        if ( dim > 15 ) dim = 15 ;
        if ( dim < 5 ) dim = 5 ;
        dim += 5 ; 
        this.nodeHelper.star.render('fill', pos, dim, canvas);
      },
      'contains': function(node, pos) {
        var npos = node.pos.getc(true),
        dim = node.getData('view')/500;
        if ( dim > 15 ) dim = 15 ;
        if ( dim < 5 ) dim = 5 ;
        dim += 5 ; 
        return this.nodeHelper.star.contains(npos, pos, dim);
      }
    }
  });

  /*
  */
  ForceDirected.Plot.EdgeTypes = new Class({
    'none': $.empty,
    'line': {
      'render': function(adj, canvas) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true);
        this.edgeHelper.line.render(from, to, canvas);
      },
      'contains': function(adj, pos) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true);
        return this.edgeHelper.line.contains(from, to, pos, this.edge.epsilon);
      }
    },
    'arrow': {
      'render': function(adj, canvas) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true),
            dim = adj.getData('dim'),
            direction = adj.data.$direction,
            inv = (direction && direction.length>1 && direction[0] != adj.nodeFrom.id);
        this.edgeHelper.arrow.render(from, to, dim, inv, canvas);
      },
      'contains': function(adj, pos) {
        var from = adj.nodeFrom.pos.getc(true),
            to = adj.nodeTo.pos.getc(true);
        return this.edgeHelper.arrow.contains(from, to, pos, this.edge.epsilon);
      }
    }
  });

})($jit.ForceDirected);

 })();
 function getMyColor(lvlcount) {
	 modulo = lvlcount%7 ;
	 //alert("mod="+modulo + colorArr[modulo]);
	 return colorArr[modulo] ;
 }
 