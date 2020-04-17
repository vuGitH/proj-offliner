<script id='jsMailBody'>
console.log('inside jsMailBody');
var d=window.document;
var mailPan= d.getElementById('mailPan');
var mBodyPan=d.getElementById('mBodyPan');
var mLablePad=d.getElementById('mLablePad');
if( document.getElementById("head_stl0") ){
  var stl0=document.getElementById("head_stl0");
}else{
  if(!(document.getElementsByTagName('STYLE')) || !(document.getElementsByTagName.length) || (document.getElementsByTagName.length<1)){
    var stl0=document.createElement("STYLE");
    stl0.id='head_stl0';
    document.head.appendChild(stl0);
  }else{
    var stl0=document.createElement("STYLE");
    stl0.id='head_stl'+parseInt(document.getElementsByTagName('STYLE').length-1);
    document.head.appendChild(stl0);
  }
}
var stl0Str="#mailPan{font-size:14px;}"
             +"a:link{color:hsl(196, 100%, 50%);text-decoration:none;}"
             +"a:visited{color:hsl(196, 100%, 50%);}"
             +"a:hover{text-decoration:underline;color:hsl(196, 100%, 44%)}"
             +"a:active{color:hsl(196, 100%, 50%);}"
             +".hue180{color:#0D9C9C;}.hue330{color:#D0257A;}"
             +"#header{margin-left:54px;color:hsl(182,48%,43%);font-family:fantasy;font-size:25px;font-weight:normal;}";
stl0.appendChild( d.createTextNode(stl0Str) );
if( d.getElementById('preMenuPan')){
  var preMenuPan=d.getElementById('preMenuPan');
}else{
  var preMenuPan=d.createElement('DIV');
  preMenuPan.id='preMenuPan';
  d.body.insertBefore(preMenuPan,d.getElementById('beep'));
} 
google.script.run
   .withSuccessHandler(implantMenu)
   .withFailureHandler(warning)
   .withUserObject(preMenuPan)
   .getMenu('wApp');
/**
 * Success handler
 * @para{string html}innerH - htmlstring 
 */
function implantMenu(innerH,el){
  var codes=d.createElement('SCRIPT');
  if(innerH=="" ||innerH===undefined){
    //script from file like a Library (yet doesn't work)
    codes.src="https://drive.google.com/file/d/0B9mOESHtO2LXX0JsWHAyRnVqQnc/view?usp=drivesdk";
  }else{
    // variant of inserting string received from server into script
    codes.appendChild(d.createTextNode(innerH));
  }
  el.appendChild(codes);
  return;
}
/**
 * errors handler
 */
function warning(e){
  var beep=d.getElementById('beep');
  beep.style.cssText="display:block;visibility:visible;border:double 1px red;border-radius:10px;";
  beep.innerHTML=e.message;
  insertCross(beep);
}
</script>