var labelType, useGradients, nativeTextSupport, animate;
var angle = 0      ;
var myCanvas       ;
var myGraph        ;
var maxDist    = 0  , minDist = 9999 ;
var headingArr= new Array();
var nodeArr   = new Array();
var pasArr    = new Array();
var totClick = 0 , totView = 0 ;
var maxctr = 0 , minctr = 9999 ;
var lvlcount = 0 , lvl2count = 0 ;
var oriView  = '0' ;
var oriClick = '0' ;
var oriCtr   = '0' ;
var goal     = 3.9 ;
var colorArr =  [ '#e8ee14','#cc6600','#e2a451','#8e9468','#a4a81f','#8a6e7d','#3057ba' ] ;
var couleur = "#1111FF" ;
//
var pas = 1 ;
//
(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/usa/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  		//I'm setting this based on the fact that ExCanvas provides text support for IE
  		//and that as of today usa/iPad current text support is lame
	  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
	  nativeTextSupport = labelType == 'Native';
	  useGradients = nativeCanvasSupport;
	  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (350 - this.elem.offsetWidth / 2) + 'px';
  }
};


function init(){
  // init data
  // end
  // init ForceDirected
  //alert( "h="+ document.body.clientHeight );
  initvar() ;
  var fd = new $jit.ForceDirected({
    //id of the visualization container
    injectInto: 'infovis',
    //Enable zooming and panning
    //by scrolling and DnD
    Navigation: {
      enable: true,
      //Enable panning events only if we're dragging the empty
      //canvas (and not a node).
      panning: 'avoid nodes',
      zooming: 70 //zoom speed. higher is more sensible
    },
    // Change node and edge styles such as
    // color and width.
    // These properties are also set per node
    // with dollar prefixed data-properties in the
    // JSON structure.
    Node: {
      overridable: true
    },
    Edge: {
      overridable: true,
      color: '#23A4FF',
      lineWidth: 0.9
    },
    //Native canvas text styling
    Label: {
      type: labelType, //Native or HTML
      size: 10
    },
    //Add Tips
    Tips: {
      enable: true,
      onShow: function(tip, node) {
    	  //count connections
    	  var count = 0;
    	  node.eachAdjacency(function() { count++; });
    	  var click = parseInt(node.getData('click')) ;
    	  var view = parseInt(node.getData('view')) ;
    	  var llaa = parseInt(node.getData('angle')) ;
    	  ctr = Math.round( (click * 100000 / view ), 2  )/100 ;
    	  dist = ( maxctr - ctr ) * 402 / ( maxctr - minctr ) ;
		  view = numberWithCommas( view ) ;
    	  // Display node info in tooltip
    	  tip.innerHTML = "<div class=\"tip-text\"><b>" + node.name + "</b>"
          + "<p>View:" + view + "<br>Click:" + click + "<br>ctr:" + ctr + "<br>Connection(s): " + count+ "</div>";

      }
    },
    // Add node events
    Events: {
      enable: true,
      type: 'Native',
      //Change cursor style when hovering a node
      onMouseEnter: function() {
        fd.canvas.getElement().style.cursor = 'move';
      },
      onMouseLeave: function() {
        fd.canvas.getElement().style.cursor = '';
      },
      //Update node positions when dragged
      onDragMove: function(node, eventInfo, e) {
          var pos = eventInfo.getPos();
          node.pos.setc(pos.x, pos.y);
		  //node.pos.setc(pos.x+100, pos.y+100);
		  fd.plot();  
	  },
      //Implement the same handler for touchscreens
      /*onTouchMove: function(node, eventInfo, e) {
    	$jit.util.event.stop(e); //stop default touchmove event
        this.onDragMove(node, eventInfo, e);
      },*/
      //Add also a click handler to nodes
      onClick: function(node) {
        if(!node) return;
        // Build the right column relations list.
        // This is done by traversing the clicked node connections.
    	//totCtr = totClick * 1000 / totView ;
    	inactive = node.getData('inactive');
    	if ( inactive == '1' ) { inactive = 0 ; } else { inactive = 1 ; }

    	node.setData('inactive', inactive );
    	if ( node.getData('lvl') == '1' ) {
    		node.eachAdjacency(function(adj){
    			adj.nodeTo.setData('inactive', inactive ) ;
    		});
    	}
    	initvar() ;
    	// 
  	  	fd.computeIncremental({
		    iter: 1,
		    property: 'end',
		    onStep: function(perc){
		  	  var ago = fd.getOptions() ;
		      //Log.write(perc + '% loaded...');
		      fd.plot() ;
		    },
		    onComplete: function(){
		      fd.animate({
		        modes: ['linear'],
		        transition: $jit.Trans.Elastic.easeOut,
		        duration: 2000
		      });
		    }
		  });
        var html = "<h4>" 
            + node.name + "<br>(View="+ node.getData('view') + " Click="+ node.getData('click')+")</h4>" 
        	+ "<table border=0><tr><td><b><u>Cx(s)</td><td><b><u>View</td><td><b><u>Click</td></tr><tr>";
        list = [];
        node.eachAdjacency(function(adj){
          list.push("<td>"+ adj.nodeTo.name + "</td><td align='right'>" + adj.nodeTo.getData('view') + "</td><td align='right'>"+ adj.nodeTo.getData('click')+"</td>" );
        });
        //append connections information
        $jit.id('inner-details').innerHTML = html + list.join("</tr><tr>") + "</tr></table>";
        Log.write( "Real: View=" + numberWithCommas(oriView) + " click=" + oriClick + " CTR="+ oriCtr+"<br>Optz: View="+numberWithCommas(totView) + " click="+totClick + " CTR=" +Math.round( (totClick * 100000 / totView ), 2  )/100 ) ;
      }
    },
    //Number of iterations for the FD algorithm
    iterations: 200,
    //Edge length
    levelDistance: 130,
    // Add text to the labels. This method is only triggered
    // on label creation and only for DOM labels (not native canvas ones).
    onCreateLabel: function(domElement, node){
      domElement.innerHTML = node.name;
      var style = domElement.style;
      style.fontSize = "0.8em";
      style.color = "#ddd";
    },
    // Change node styles when DOM labels are placed
    // or moved.
    onPlaceLabel: function(domElement, node){
      var style = domElement.style;
      var left = parseInt(style.left);
      var top = parseInt(style.top);
      var w = domElement.offsetWidth;
      style.left = (left - w / 2) + 'px';
      style.top = (top + 10) + 'px';
      style.display = '';
    }
  });
  // load JSON data.
  fd.loadJSON(json);
  // compute positions incrementally and animate.
  fd.computeIncremental({
    iter: 1,
    property: 'end',
    onStep: function(perc){
  	  var ago = fd.getOptions() ;
      Log.write(perc + '% loaded...');
      fd.plot() ;
    },
    onComplete: function(){
      //Log.write('done');
      fd.animate({
        modes: ['linear'],
        transition: $jit.Trans.Elastic.easeOut,
        duration: 2000
      });
    }
  });
  // end
}
// Get and Update the angle 
function monAngle( child , parent , nbChildren ) {
	child = "_"+child ;
	parent = "_"+parent ;
    var langle = angle ;
    if ( parent == "_" ) {
	  // Child has no parent, it is a sole parent - set langle and place for first child
  	  avgGrdChildren = lvl2count / lvlcount ; 
      pas = 360 / lvlcount * ( nbChildren / avgGrdChildren )  ;
      pas = ( 360 / lvl2count ) * nbChildren  ;
      angle += pas ;
      if ( angle > 360 ) angle -= 360 ;
  	  totang += pas ;
      cepas = pas / (nbChildren+2) ;
  	  fChildHeading = langle + cepas ;
      langle = angle  ;
      nodeArr.push( child ) ;
      pasArr.push( cepas );
      headingArr.push( fChildHeading );
    } else if ( child == parent ) {
  	  var pindex = nodeArr.indexOf( parent ) ;
	  if ( pindex == -1 ) return -1 ;
	  langle = headingArr[pindex] - ( pasArr[pindex] * nbChildren / 2 )  ;
    } else {
	  var pindex = nodeArr.indexOf( parent ) ;
	  if ( pindex == -1 ) return -1 ;
	  langle = headingArr[pindex] ; 
	  headingArr[pindex] = langle + pasArr[pindex] ;
      cepas = pasArr[pindex] ;
  	  fChildHeading = langle + cepas ;
    }
	return langle ;
}
//
function drawTargetLine() {
	ctx = myCanvas.getCtx(),
    ctx.lineWidth = 2;
	ctx.textAlign = 'left' ;
	
    // the bulleye
    ctx.beginPath();
    ctx.fillStyle = '#ee3322';
    ctx.arc( 0 , 0 , 5, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#ee2222';
    ctx.fillText( "100" , 5 ,0);
    ctx.stroke();
    
    // the achieved ctr
    totCtr = totClick * 1000 / totView ;
	//dist = ( Math.sqrt(maxctr) - Math.sqrt(totCtr) ) * 402 / ( Math.sqrt(maxctr) - Math.sqrt(minctr) ) ;  
	dist = ( Math.sqrt(maxctr) - Math.sqrt(totCtr) ) * 265 / ( Math.sqrt(maxctr) - Math.sqrt(minctr) ) ;  
    radius = 270 * ( Math.PI / 180 ) ;
    posx = dist * Math.cos( radius ) ;
    posy = dist * Math.sin( radius ) ;
    ctx.beginPath();
    ctx.globalAlpha = 1 ;
    //ctx.fillStyle = '#229922';
    if (totCtr > goal) { ctx.fillStyle = '#229922'; } else { ctx.fillStyle = '#ee2222'; }

    ctx.arc( posx , posy , (totView/4000) , 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText( Math.round( (totClick * 100000 / totView ), 2  )/100 , posx-10 ,posy+3);
    ctx.stroke();
    
	// the 10 ctr line
    ctx.globalAlpha = 0.2 ;
	ctx.fillStyle = '#424242';
	ctx.beginPath();
    dist = 28.3 ; // 42.5 ;
	ctx.arc( 0 , 0 , dist , 0, 2 * Math.PI, false);
	ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.stroke();
    ctx.fillStyle = '#eeeeee';
    ctx.fillText( "10" , dist ,0);
	ctx.stroke(); 
	
    // the One circle
	ctx.beginPath() ;
	cc = 219 ; // 329
	cct = Math.round( cc ,0 ) ;
	ctx.arc(0,0 , cct  , 0 , Math.PI*2 , true);
	ctx.stroke();
	ctx.fillText( "1" , cc , 0 );
	ctx.stroke();

	// the Outer circle .01
	ctx.beginPath();
	cc = maxDist * .95 ;
	cc = 276 ; // 415 
	cct = Math.round( cc ,0 ) ;
	ctx.arc(0,0 , cct , 0 , Math.PI*2 , true);
	ctx.stroke();
	ctx.fillText( "0.1" , cc , 0 );
	ctx.stroke();
}
function initvar() {
    angle = 0 ;
    headingArr= new Array();
    nodeArr   = new Array();
    pasArr    = new Array();
    totClick = 0 , totView = 0 ;
    maxctr = 0 , minctr = 9999 ;
    lvlcount = 0 , lvl2count = 0 ;
    totang = 0 ;
}
function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}
