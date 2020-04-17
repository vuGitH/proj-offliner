<script id='jsLib'>
/**
 * Sets parameters of inner Window, (browser independently)
 * (codes got from w3c tutorial)
 * Global (on the scope of my javascript) Object: innerWidth
 * Properties:
 *  innerWindow.w {number}- width of inner window. Number of pixels
 *  innerWindow.h {number}- height of inner window. Number of pixels
 */ 
var innerWindow={};
innerWindow.w=function(){
  var w = window.innerWidth
  || document.documentElement.clientWidth
  || document.body.clientWidth;
  return w;
  }
innerWindow.h=function(){
  var h = window.innerHeight
  || document.documentElement.clientHeight
  || document.body.clientHeight;
  return h;
}
/** 
 * Event attaching function which takes into account cross browsers 
 * compatability.
 * for .addEventListener( evType (if exists) presumes bubling event propogation (capturing - false)
 * For details see: http://stackoverflow.com/questions/6927637/addeventlistener-in-internet-explorer
 * or read John Resig (creator of jQuery)
 * http://ejohn.org/projects/flexible-javascript-events/
 * @param{string} evType - event type 'click' 'load' etc.
 * @param{object} elem - element javascript DOM object
 * @param{function} handler - event handler function name or anonimous function(){}
 */
function addEvent(evType, elem, handler) {
  if (elem.addEventListener){  // W3C DOM
    elem.addEventListener(evType,handler,false);
  }else if (elem.attachEvent) { // IE DOM
    elem.attachEvent("on"+evType, handler);
  }else{ // No much to do
    elem[evType] = handler;
  }
}
/**
 * Remove event handler
 * @param{string}evType - event type ('click','mousemove',...)
 * @param{object}elem - element object DOM
 * @param{function}handler 
 */
function removeEvent(evType, elem, handler) {
  if (elem.addEventListener) { // W3C DOM
    elem.removeEventListener(evType,handler);
  }
  if(elem.attachEvent) { // IE DOM
    elem.dettachEvent("on"+evType, handler);
  }
}

/**
 * Determins current maximum z-index value among parent element and children
 * @param{object} parent - element's object
 * Uses global variable z to whom the result of calculation should be assigned
 * EXAMPLE: elZ(document.body);
 *  console.log('current maximun z-index value ='+z);
 * -------------------------
 */
var z;
function elZ(parent){
  var zPar=(parent.style.zIndex!==undefined)?parent.style.zIndex:undefined;
  z=(zPar!=undefined)? (( z==undefined || ((z!=undefined) && (zPar>z)) )? zPar:z):z;
  var chldrn=parent.children;
  if( (chldrn.length) && chldrn.length>0){
    for( var iel=0;iel<chldrn.length;iel++){
      elZ(chldrn[iel]);
    }
  }else{
    return;
  }
}
/**
 * Transforms mesurement units of a size from some units to number as px size
 * @param {string|number}size - a size to transform to number
 * @param {object}elemOpt - Optional. element's object. Not necessary for px and %.
 *                           For em - units mesure relative to element's font-size
 *                               rem relative to font size of root element
 * @return {number} value of size in px transformed as number
 */
function unitToNumber( size,elemOpt ){
  var currElem=elemOpt||document.body;
  var root=document.body;
  if(typeof size !=='number'){
    if(/px/.test(size)){
      return parseInt(size,10);
    }else if(/[\%]/.test(size)){
      return innerW*parseInt(size,10)/100;
    }else if(/em/.test(size)){
      // reative to font-size of current Element. Font size should be in px only
      var fSz=currElem.style.fontSize;
      if( /px/.test(fSz) ){
        return parseInt(fSz,10)*parseInt(size,10);
      }else{
        throw( 'Error! Font-size of current element with id='+currElem.id+'is not set in px');
      }
    }else if(/rem/.test(size)){
      // relative to font-size of root element (document. body)
      return  parseInt(document.body.style.fontSize,10)*parseInt(size,10);
    }else{
      throw('Error!Non standard units for size are used while positioning element. setElemPosition');
    }
  }else{
    return size;
  }
}
/**
 * Transferes number value of size variable to units representation
 * @param{Number}sizeValue - variable contained value of size considered
 * @param {string | number}base - string displaying appropriate value of parameter relative to which
 *                       values should be transformed ( for ex. in case of em - font-size of current elem in px - "12px" of "25px")
 *                       ( or in case of rem - font size in px for root element )
 * @param{string}unitActualOpt - Optional. Units to which trnsformation is done
 * @param{object}elem - html element object which some size is transfermed. 
 *                      is used while relative measure units are used( em, rem )
 * @return {string} - value of size in appropriate actual units.
 */
function numberToUnit(sizeValue,baseOpt,unitActualOpt,elemOpt){
  var base=parseInt(baseOpt)||undefined;
  var aUnits=unitActualOpt || units;  // units - global variable
  if(aUnits=='px'){
    return (sizeValue+"px");
  }else if(aUnits=='%'){
    if(base){
      return Math.ceil((sizeValue/base)*10000)/100+'%';
    }else{
      throw('Error! base is not defined while % units are used for a size ');
    }
  }else if(aUnits=="em" || aUnits=="rem" ){
    return sizeValue*base;
  }else{
    throw('Error! Non conventional(for this Lib mesurements units are indicated.');
  }
}
/**
 * sets Element position in the center of window with shift xOpt and yOpt
 *@param{object}elem - element's html DOM object
 *@param{string)xOpt - optional. If set specifies x -coordinate shift relative to 'center' position (units:  px | % | typeof==='number')
 *@param{string)yOpt - optional. If set specifies y -coordinate  shift relative to 'center' position (in px units)
 *after processing  elem.style. top and left attribute will be set
 * Now only px and % units are used.
 */
function setElemPosition( elem,xOpt,yOpt){
  var xShift=xOpt ||0;
  var yShift=yOpt ||0;
  xShift=unitToNumber(xShift);
  yShift=unitToNumber(yShift);
  
  var elStyle=( window.getComputedStyle(elem,null) )? window.getComputedStyle(elem,null): elem.currentStyle;
  var elW= unitToNumber( elStyle.width );
  var elH= unitToNumber( elStyle.height) ;
    
  var elTop = (units=='px')? Math.ceil((innerH-elH)/2-yShift)+'px': Math.ceil((((innerH-elH)/2 -yShift)/innerH)*10000)/100+'%';
  elem.style.top=elTop;
  var elLeft=( units=='px')? Math.ceil((innerW-elW)/2+xShift)+'px': Math.ceil((((innerW-elW)/2 +xShift)/innerW)*10000)/100+'%';
  elem.style.left=elLeft;
}/**
 * sets Element position in the center of parent Element with shift xOpt and yOpt
 *@param{object}elem - element's html DOM object
 *@param{string)xOpt - optional. If set specifies x -coordinate shift relative to 'center' position (units:  px | % | typeof==='number')
 *@param{string)yOpt - optional. If set specifies y -coordinate  shift relative to 'center' position (in px units)
 *after processing  elem.style. top and left attribute will be set
 * Now only px and % units are used.
 */
function setElPositionInsideParent( elem,xOpt,yOpt){
  
   
  var xShift=xOpt ||0;
  var yShift=yOpt ||0;
  xShift=unitToNumber(xShift);
  yShift=unitToNumber(yShift);
  
  var parent= elem.offsetParent();
  var parStyle=( window.getComputedStyle(parent,null) )? window.getComputedStyle(parent,null): parent.currentStyle;
  var parW= unitToNumber( parStyle.width );
  var parH= unitToNumber( parStyle.height) ;
  
  var elStyle=( window.getComputedStyle(elem,null) )? window.getComputedStyle(elem,null): elem.currentStyle;
  var elW= unitToNumber( elStyle.width );
  var elH= unitToNumber( elStyle.height) ;
    
  var elTop = (units=='px')? Math.ceil((parH-elH)/2-yShift)+'px': Math.ceil((((parH-elH)/2 -yShift)/parH)*10000)/100+'%';
  elem.offsetTop=elTop;
  var elLeft=( units=='px')? Math.ceil((parW-elW)/2+xShift)+'px': Math.ceil((((parW-elW)/2 +xShift)/parW)*10000)/100+'%';
  elem.offsetLeft=elLeft;
}
/**
 * checks array and set the index of element equeled to target
 * @param{void}target - value to match
 * @return {number} index of element of -1 if there were no matches
 */
function indexOf(arr,target){
   var ind=-1;
   for(var i=0;i<arr.length;i++){
     if( arr[i]===target){
       ind=i;
       break;
     }
   }
   return ind;
}
/**
 * constructor of Css object
 * @param{string}selector - css selector string
 * @param{string}style - style appropriate to css selector
 * @return{string} css string as content for <style> tag
 */
function Css(selector,style){
  this.sel=selector;
  this.stl=style;
  
  this.selNew=function(select){
    if(select != undefined && select != ''){
      this.sel= (( this.sel != undefined) && ( this.sel !=''))? this.sel+ ', '+select : select;
      this.cssStr= (((this.sel != undefined) && (this.sel != ''))&&((this.stl !=undefined)&&(this.stl != '')))? this.sel+"{"+this.stl+"}":"";
      return this.sel;
    }
  };
  this.cssNew=function(style){
    if( style != undefined && style !='' ){
    style=(/[;]\s*$/.test(style))?style:style+";";
      this.stl= ((this.stl != undefined) && (this.stl != ''))? this.stl+style : style ;
      this.cssStr= ((( this.sel != undefined) && (this.sel != '')) && ( (this.stl != undefined)&&( this.stl != '')))? this.sel+"{"+this.stl+"}":"";
      return this.stl;
    }
  };
  this.cssStr= (((this.sel != undefined) && (this.sel != ''))&&((this.stl != undefined)&&(this.stl != '')))? this.sel+"{"+this.stl+"}":"";
  this.reset=function(){
    this.stl='';
    this.sel='';
    this.cssStr='';
  };   
}
/**
 * Create Cross Element to close parent element
 * @param {object} parent
 * @param{string} whereOpt - location of the cross inside or ouside parent element
 * @param{string}colorSchemeOpt Optional.Takes into account contrast relating to background( light or dark back)
 */
function insertCross(parent,whereOpt,colorSchemeOpt){
  var where= whereOpt||'downRight';
  var cScheme=colorSchemeOpt||'onLightBack';
// --- Cross element to close callBackBox
  var cross=d.createElement('DIV');
  if(where=='downRight'){
    parent.appendChild(cross);
  }else if(where=='upRight'){
    if( (parent.firstElementChild) ){
      parent.insertBefore(cross,parent.firstElementChild);
    }else{
      parent.appendChild(cross);
    }
  }else{
    // outside right
    if( (parent.firstElementChild) ){
      parent.insertBefore(cross,parent.firstElementChild);
    }else{
      parent.appendChild(cross);
    }
  }
  cross.id='x_'+parent.id;
  cross.setAttribute('class','x');
  cross.innerHTML='x';
  var xColor=(cScheme=='onDark')?'#fff;':'#aaa;'
  if( where=='downRight'){
  cross.setAttribute('style',''
    +"position:absolute;right:4px;bottom:4px;color:"+xColor+"font-size:14px;margin:0px;padding:0px;"
    +"border:solid 0px;width:20px;height:20px;cursor:pointer;font-style:normal;");
  }else if(where=='upRight'){
    cross.setAttribute('style',''
    +"position:absolute;right:4px;top:4px;color:"+xColor+"font-size:14px;margin:0px;padding:0px;"
    +"border:solid 0px;width:20px;height:20px;cursor:pointer;font-style:normal;");
  }else{
    // -- outside
    cross.setAttribute('style',''
    +"position:absolute;right:-4px;top:4px;color:"+xColor+"font-size:14px;margin:0px;padding:0px;"
    +"border:solid 0px;width:20px;height:20px;cursor:pointer;font-style:normal;");
  }
  addEvent('click',cross, function(){parent.style.display='none';} );
  /*
  cross.addEventListener('click',function(){
    parent.style.display='none';
  },false);
  */
  // --- Cross:hover Style. Add callBackBox's Cross :hover style to css data in first <style> tag
  if( d.getElementsByTagName('STYLE')[0] ){
    var style=d.getElementsByTagName('STYLE')[0];
  }else{
    var style=d.createElement('STYLE');
    style.id='head_stl0';
    document.head.appendChild(style);
    style.appendChild( d.createTextNode('') );
  }
  if( style ){
    style.firstChild.nodeValue+='\n#x_'+parent.id+':hover{color:#888;font-weight:bold;cursor:pointer;}';
  }
}
</script>
<script>
var frgm=document.createDocumentFragment();
var scrpt=document.getElementById('jsLib');
frgm.appendChild(scrpt);
document.head.appendChild(frgm);
</script>
