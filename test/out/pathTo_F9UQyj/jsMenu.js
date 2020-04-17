 <!--  menu block sample -->
<script id="body_scrpt1">
try {
var d=window.document;
var b=d.body;
var mPan=getMenuPan();
b.insertBefore(mPan,d.getElementById('beep'));
// -- switching classes while events occure
var cases=[
                 ['m  ','m','m1','m','mouseenter'],
                 ['m','m1','m','m','mouseleave'],
                 ['i1 i2 i3','i hue180','i1','m','mouseenter'],
                 ['i1 i2   i3','  i1','i hue180','m','mouseleave'],
                 ['h','h',' h red','m','mouseenter'],
                 ['h','red    h   ','  h','   m','mouseleave'],
                 ['i1','','msdown','i1','mousedown'],
                 ['i2','','msdown','i2','mousedown'],
                 ['i3','','msdown','i3','mousedown'],
                 ['i1','msdown','i1','i1','mouseup'],
                 ['i2','msdown','i1','i2','mouseup'],
                 ['i3','msdown','i1','i3','mouseup']
               ];
var oNames=['target','classIni','classFin','trigger','event'];
/**
 * Trims all elements strings and changes multi-whitespaces to single space
 */
var clearCases=function(cases){
  for(var i=0;i<cases.length;i++){
    for(var j=0;j<cases[0].length;j++){
      cases[i][j]=cases[i][j].trim().replace(/\s\s+/g,' ');
    }
  }
   return cases;
}
cases=clearCases(cases);
var trans=trArr(cases);
var ob=new obj(cases,oNames);

changeClassesForTargetByEventOfTrigger_Id(ob.target,ob.classIni,ob.classFin,ob.trigger,ob.event); 
  
/**
 * creates menu panel as separate div conainer of width:100%
 */
function getMenuPan(){
  var d=window.document;
  var b=d.body;
  this.init=function(){
                     return d.createElement('DIV');
                     };
  var menuPan=this.init();
  //var menuPan=d.createElement('DIV');
  
  menuPan.id="menuPan";
  menuPan.setAttribute('class','menuPan');
  menuPan.style.cssText="width:87%;margin-left:54px;margin-top:10px;margin-bottom:30px;padding:0px;backgroun-color:#fff;box-shadow:0px 1px 8px #fff, 0px 5px 17px #7799493;border-radius:9px;";
  //  -- header
  var h=d.createElement('H2');
  menuPan.appendChild(h);
  
  var o=d.createElement('DIV');
  var m=d.createElement('DIV');
  // -- items:
  // -- item1 (link)
  var i1=d.createElement('DIV');
  var a1=d.createElement('A');
  a1.setAttribute('class','ai');
  a1.setAttribute('target','_blank');
  a1.appendChild(i1);
  a1.href="https://script.google.com/macros/s/AKfycbzebrLz7mHADcWBNkRN0n2hQ6i6MNC_-qUmP8jUdlUV/dev?m=wApp";
  
  // -- item2 (not a link. Runs function on click)
  var i2=d.createElement('DIV');
  addEvent('click',i2, function(){ google.script.run.sendMailToMe('mail')});
  //var a2=a1.cloneNode(a1,true);
  //a2.setAttribute('target','_self');
  //a2.appendChild(i2);             -- not a link but handler function
  //a2.href="#"; //https://script.google.com/macros/s/AKfycbzebrLz7mHADcWBNkRN0n2hQ6i6MNC_-qUmP8jUdlUV/dev?m=mail";
  //addEvent('click',a2,function(){ google.script.run.sendMailToMe('mail'); return false;});
  
  // --item3 (link)
  var i3=d.createElement('DIV');
  var a3=a1.cloneNode(a1,true);
  a3.appendChild(i3);
  a3.href="https://script.google.com/macros/s/AKfycbzebrLz7mHADcWBNkRN0n2hQ6i6MNC_-qUmP8jUdlUV/dev?m=short";

// -- cross --
  var x=d.createElement('DIV');
  
  menuPan.appendChild(o);
  menuPan.appendChild(m);
  m.appendChild(a1);
  m.appendChild(i2);
  m.appendChild(a3);
  m.appendChild(x);
  
  h.id='h';
  o.id='o';
  m.id='m';
  i1.id='i1';
  i2.id='i2';
  i3.id='i3';
  x.id='x';
  
  h.setAttribute('class','h');
  o.setAttribute('class','o');
  m.setAttribute('class','m');
  i1.setAttribute('class','i hue180');
  i2.setAttribute('class','i hue180');
  i3.setAttribute('class','i hue180');
  x.setAttribute('class','x');
  
  h.innerHTML='Mailer';
  o.innerHTML="&#9776";     // open Menu
  x.innerHTML="x";
  i1.innerHTML='Mailer';
  i2.innerHTML='Mail';		
  i3.innerHTML='Smaily';
  
  var s=d.createElement("STYLE");
  var styles=d.getElementsByTagName('STYLE');
  s.id='head_stl'+parseInt(styles.length-1);
  d.head.appendChild(s);
  
  // font-family: 'Roboto', sans-serif;
  //font-family: 'Open Sans', sans-serif;
  //font-family: 'Roboto Condensed', sans-serif;
  //font-family: 'Merriweather', serif;
  //font-family: 'Arimo', sans-serif;
  
  var sContent=".h{\ntext-align:center;\ncolor:#009999;\nfont-family:'Roboto', serif;\ntext-shadow:4px 4px 4px #ccc;\ndisplay:none;\n}\n"
  +".o{\nfloat:right;\nfont-size:16px;\nfont-family:Arial;\nmargin-right:10px;\ncolor:#00aaaa;\ncursor:pointer;\nz-index:0;\n}\n"
  +".m{\nposition:relative;\ntop:-21px;\nwidth:100%;\nheight:28px;\nbackground-color:hsl(180,40%,99%);\nborder:solid 1px #099;\nborder-radius:33px;\nbox-shadow:0px 4px 6px 2px #fff;\npadding:18px;\noverflow:hidden;\n}\n"
  +".m1{\nposition:relative;\ntop:-21px;\nwidth:100%;\nheight:28px;\nbackground-color:#fff;\nborder:solid 1px #099;\nborder-radius:33px;\nbox-shadow:0px 4px 6px 2px #d2d2d2;\npadding:18px;\noverflow:hidden;\n}\n"
  +".i{\nposition:relative;\nheight:18px;\nfloat:left;\nmargin-left:5px;\nfont-family:'Roboto',Arial,san-serif;\npadding:4px;\nborder:solid 1px #0D9C9C;\nbox-shadow:0px 3px 4px #fff;\nborder-radius: 7px;\ndisplay:inline-block;\n}\n"
  +".i1{\nposition:relative;\nheight:18px;\nfloat:left;\nmargin-left:5px;\nfont-family:'Roboto',Arial,san-serif;\npadding:4px;\nborder:solid 1px #0D9C9C;\nbox-shadow:0px 3px 4px #afafaf;\nborder-radius:7px;\ndisplay:inline-block;\nbackground-color:hsl(180,53%,46%);\ncolor:#fff;\n}\n"
  +".i:hover,.i1:hover{\nbackground:white;\ncolor:#009999;\ncursor:pointer;\n}\n"
  +".x{\nposition:relative;\ncolor:#099;\nwidth:12px;\nheight:20px;\nfloat:right;\nmargin-right:10px;\nfont-family:'Roboto',Arial,san-serif;\ncursor:pointer;\nbackground-color:transparent;\n}"
  +"#menuPan a:hover,.ai{text-decoration:none;}"
  +".hue180{color:#0D9C9C;}.msdown{box-shadow:0px 3px 4px #fff;}.msup{box-shadow:0px 3px 4px #afafaf;}";
  var tstyle=d.createTextNode(sContent);
  s.appendChild(tstyle);
  
  // events
  addEvent('click',x,function(){m.style.display='none'});
  addEvent('click',o,function(){m.style.display='block'});

  return menuPan;
}
/**
* Creates object prototype on the bases of cases array
* @param {array [[]]}cases - 2d-array of cases contained data regarding variants for ' target,classIni,classFin,trigger,event ' cases
* @param {array []} propNames - 1d array of properties names
* return {object} javascript object
*                 Could be used to transform 2d array (cases) into set of js-object properties, using 1-d array as 
*                 properties names, appropiating to each column.
*/
function obj(cases,propNames){
  var tcases=trArr( cases );
  for( var i=0;i<propNames.length;i++){
    this[propNames[i]]=tcases[i];
  }
}
/**
* Transposes array
* @param {array} arr
* @return {array} array transposed;
*/
function trArr( arr ){
  var tarr=[];
  for(var j=0; j<arr[0].length; j++){
    var r=[];
    for(var i=0; i<arr.length; i++){
      r.push( arr[i][j] );
    }
    tarr.push(r);
  }
  return tarr;
}    
/**
* Changes classes of element-target while event triggered by element-trigger
* @param {string}targEl Id of Element changing classes (target-element)
* @param {string}classIni String of class or classes names to be changed
* @param {string}classFin String of class or classes after event
* @param {object}triggEl Id of element whose event should initiate changes of classes (a trigger element)
* @param {string}eventType type(s) of events separated by whitespace For ex.: "load" or "load click"
* 
*                 All params could be arrays of the same length to represent different set of 
*                 input classes and elements, triggereing element and output final classes to be assigned;
*                 _Id at the end of function name indicates that not element objects but elements ids 
*                  are used to specify target and trigger elements
*/
function changeClassesForTargetByEventOfTrigger_Id( targetEl,classIni,classFin,triggerEl,eventType){
  // --- properties ---
  //...
  // --- methods ---
  var arrays =false;
  if( targetEl instanceof Array && classIni instanceof Array && classFin instanceof Array && triggerEl instanceof Array && eventType instanceof Array){
    arrays=true;
  }else{
    // -- NOT ARRAYS case --
    changeOneSet(targetEl,classIni,classFin,triggerEl,eventType);
    return;
  }
  // --- ARRAYS option for cases
  var gogo=true;
  if( arrays ){
    var lng=targetEl.length;
    gogo=(classIni.length==lng)?((classFin.length==lng)?( (triggerEl.length==lng)?((eventType.length==lng)?true:false):false):false):false;
    if(!gogo){
      console.log('Error: input arrays have to be the same length. Function:changeClassesForTargetByEventOfTrigger_Id');
      alert('Error: input arrays have to be the same length. Function:changeClassesForTargetByEventOfTrigger_Id');
    return;
    }	  
  }
  // -- Arrays option ---
  for( var icase=0; icase<targetEl.length;icase++){
    var targetE=targetEl[icase];
    var classIn=classIni[icase];
    var classFi=classFin[icase];
    var triggerE=triggerEl[icase];
    var eventT=eventType[icase];
    changeOneSet(targetE,classIn,classFi,triggerE,eventT);
  }
  // -- End of Arrays option handling
}
/**
* gets array of DOM elements on the basis of array of their id-s attributes
* @param {Array}ids - array of strings of elements' ids
* @return - array of elements' objects
*/
function takeElemsByIds(ids){
  var d=window.document;
  var elems=[];
  for(var iel=0; iel<ids.length;iel++){
    elems.push(document.getElementById(ids[iel]));
  }
  return elems;
}
// --- for NOT ARRAYS method ---
function changeOneSet(targetEl,classIni,classFin,triggerEl,eventType){
  if( !(/(\s*([a-z]|[A-Z])(\w|\d|[-])*)+/g.test(targetEl))){
    console.log( 'Error:targetEl contains non word character(s)!');
    alert('Error:targetEl contains non word character(s)!')
    ;return;
  }
  if( !(/(\s*|(\s*([a-z]|[A-Z])(\w|\d|[-])*)+)/g.test(classIni)) ){
    console.log( 'Error:classIni contains non word character(s)!');
    alert('Error:classIni contains non word character(s)!');
    return;
  }
  if( !(/(\s*|(\s*([a-z]|[A-Z])(\w|\d|[-])*)+)/g.test(classFin))){
    console.log( 'Error:classFin contains non word character(s)!');
    alert('Error:clasFin contains non word character(s)!');
	return;
  }
  if( !(/(\s*([a-z]|[A-Z])(\w|\d|[-])*)+/g.test(triggerEl))){
    console.log( 'Error:triggerEl contains non word character(s)!');
    alert('Error:triggerEl contains non word character(s)!');
    return;
  }
  if( !(/(\s*([a-z]|[A-Z])(\w|\d|[-])*)+/g.test(eventType))){
    console.log( 'Error:eventType contains non word character(s)!');
    alert('Error:eventType contains non word character(s)!');
    return;
  }
  if ( eventType==""|| eventType==undefined || eventType==null || !(/(\s*([a-z]|[A-Z])(([a-z]|[A-Z])|[-])+)+/g.test(eventType)) ){
    console.log('Error: incorrect event type string! Function:triggElemClassChangeId');
    alert('Error: incorrect event type string! Function:triggElemClassChangeId not Arrays option');
    return;
  }
  // --- working arrays 
  var targetId=targetEl.split(' ');
  var triggerId=triggerEl.split(' ');
  var events=eventType.split(' ');
  var oldClasses=classIni.split(' ');
  var newClasses=classFin.split(' ');
  var iclo;
  for( iclo=0;iclo<oldClasses.length;iclo++){
    var clo=oldClasses[iclo];
    var icln;
    for( icln=0;icln<newClasses.length;icln++){
      var cln=newClasses[icln];
      if( cln==clo){
        oldClasses.splice(iclo,1);
        newClasses.splice(icln,1);
      }
    }
  }
  var targets=takeElemsByIds(targetId);
  var triggers=takeElemsByIds(triggerId);
  // -- cycle for triggers
  for( var itr=0;itr<triggers.length;itr++){
    var tr=triggers[itr];
    for( var iev=0;iev<events.length;iev++){
      var evnt=events[iev];
      // -- Set event
      //tr.addEventListener(evnt,function(){
      addEvent(evnt,tr,function(){
        for( var itarg=0;itarg<targets.length;itarg++){
          var targ=targets[itarg];
          // -- event actions ---
          for( icln=0;icln<newClasses.length;icln++){
            var cln=newClasses[icln];
            if( targ.classList ){
              if( cln!=''){
                targ.classList.add(cln);
              }
            }else{
              if( cln!=''){
                if( targ.className.length>0 && /\s*\w/.test(targ.className) ){
                  targ.className+=" "+cln;
                }else{
                  targ.className=cln;
                }
              }
            }
          }
          for( iclo=0; iclo < oldClasses.length; iclo++){
            var clo=oldClasses[iclo];
            if( targ.classList ){
              if( clo!=''){
                targ.classList.remove(clo);
              }
            }else{
              if( targ.className.length>0 &&  /\s*\w/.test(targ.className)  ){
                var patt1=new RegExp('/\\\s\\b'+clo+'\\b\/');
                var patt2=new RegExp('\/\^\\b'+clo+'\\b\\s\+\/');
                if( patt1.test(targ.className)){
                  targ.className=targ.className.replace(patt1,'');
                }else if(patt2.test(targ.className)){
                  targ.className=targ.className.replace(patt2,'');
                }else{
                  console.log('it seems that there is no class '+clo+ ' in element.');
                }
              }else{
                console.log('no className for element');
                return;
              }
            }
          }
          //  -- end of event action
        }
      });          // --- end of addEvent    
      //},false);  // --- end of set event listener  
    }
  }
}
function changeOneSet1(targetEl,classIni,classFin,triggerEl,eventType){
  if( !(/(\s*([a-z]|[A-Z])(\w|\d|[-])*)+/g.test(targetEl))){
    console.log( 'Error:targetEl contains non word character(s)!');
    alert('Error:targetEl contains non word character(s)!')
    ;return;
  }
  if( !(/(\s*|(\s*([a-z]|[A-Z])(\w|\d|[-])*)+)/g.test(classIni)) ){
    console.log( 'Error:classIni contains non word character(s)!');
    alert('Error:classIni contains non word character(s)!');
    return;
  }
  if( !(/(\s*|(\s*([a-z]|[A-Z])(\w|\d|[-])*)+)/g.test(classFin))){
    console.log( 'Error:classFin contains non word character(s)!');
    alert('Error:clasFin contains non word character(s)!');}if( !(/(\s*([a-z]|[A-Z])(\w|\d|[-])*)+/g.test(triggerEl))){
    console.log( 'Error:triggerEl contains non word character(s)!');
    alert('Error:triggerEl contains non word character(s)!');
    return;
  }
  if( !(/(\s*([a-z]|[A-Z])(\w|\d|[-])*)+/g.test(eventType))){
    console.log( 'Error:eventType contains non word character(s)!');
    alert('Error:eventType contains non word character(s)!');
    return;
  }
  if ( eventType==""|| eventType==undefined || eventType==null || !(/(\s*([a-z]|[A-Z])(([a-z]|[A-Z])|[-])+)+/g.test(eventType)) ){
    console.log('Error: incorrect event type string! Function:triggElemClassChangeId');
    alert('Error: incorrect event type string! Function:triggElemClassChangeId not Arrays option');
    return;
  }
  // --- working arrays 
  var targetId=targetEl.split(' ');
  var triggerId=triggerEl.split(' ');
  var events=eventType.split(' ');
  var oldClasses=classIni.split(' ');
  var newClasses=classFin.split(' ');
  var iclo;
  for( iclo=0;iclo<oldClasses.length;iclo++){
    var clo=oldClasses[iclo];
    var icln;
    for( icln=0;icln<newClasses.length;icln++){
      var cln=newClasses[icln];
      if( cln==clo){
        oldClasses.splice(iclo,1);
        newClasses.splice(icln,1);
      }
    }
  }
  var targets=takeElemsByIds(targetId);var triggers=takeElemsByIds(triggerId);// -- cycle for triggers
  for( var itr=0;itr<triggers.length;itr++){
    var tr=triggers[itr];
    for( var iev=0;iev<events.length;iev++){
      var event=events[iev];
      window.addEventListener('load',function(){
        tr.addEventListener(event,function(){
              for( var itarg=0;itarg<targets.length;itarg++){
                var targ=targets[itarg];// -- event actions ---
                for( icln=0;icln<newClasses.length;icln++){
                  var cln=newClasses[icln];
                  if( targ.classList ){
                    if( cln!=''){
                      targ.classList.add(cln);
                    }
                  }else{
                    if( cln!=''){
                      if( targ.className.length>0 && /\s*\w/.test(targ.className) ){
                        targ.className+=" "+cln;
                      }else{
                        targ.className=cln;
                      }
                    }
                  }
                }
                for( iclo=0; iclo < oldClasses.length; iclo++){
                  var clo=oldClasses[iclo];
                  if( targ.classList ){
                  if( clo!=''){
                  targ.classList.remove(clo);
                  }
                  }else{
                    if( targ.className.length>0 &&  /\s*\w/.test(targ.className)  ){
                      var patt1=new RegExp('/\\\s\\b'+clo+'\\b\/');
                      var patt2=new RegExp('\/\^\\b'+clo+'\\b\\s\+\/');
                      if( patt1.test(targ.className)){
                        targ.className=targ.className.replace(patt1,'');
                      }else if(patt2.test(targ.className)){
                        targ.className=targ.className.replace(patt2,'');
                      }else{
                        console.log('it seems that there is no class '+clo+ ' in element.');
                      }
                    }else{
                      console.log('no className for element');
                      return;
                    }
                  }
                }
                //  -- end of event action
              }
            },false);
      },false);
    }
  }
}
//============= local Lib ===
function myChangeClasses(){
    window.addEventListener('load', function(){
        x.addEventListener('click',function(){m.style.display='none'},false);
        o.addEventListener('click',function(){m.style.display='block'},false);
      },false);		
    /**
    * parameters of the block:
    *  Changing(toggleing) classes
    *  'i' and 'i1' - toggled classes for all elements contained them
    *  'm' and 'm1' - toggled classes for elements contained them
    *
    *  Trigger element and events:
    *  'm' - id of element to fire trigger function (id of trigger)
    *  'mouseeneter' and 'mouseleave' event pair to fire toggleing successively (on-event off-event of changing classes)
    */
    var divsI=d.getElementsByClassName('i');
    var divsI1=d.getElementsByClassName('i1');
    window.addEventListener('load',function(){
      var el=document.getElementById('m');
      el.addEventListener('mouseenter',funE,false);
      el.addEventListener('mouseleave',funL,false);
    }
    ,false);
    // fires while mouse enter 
    function funE(){
      while( divsI.length>0 ){
      if( !divsI[0].classList){
        divsI[0].classList.add('i1');
        divsI[0].classList.remove('i');
      }else{
        var el=divsI[0];
        if( el.className ){
          el.className+=' i1';
          if(/\s\bi\b/.test(el.className)){
            el.className=el.className.replace(/\s\bi\b/,'');
          }else if(/^\bi\b/.test(el.className)){
            divsI[0].className=el.className.replace(/^\bi\b\s+/,'');
          }else{
            console.log('it seems that there is no i class in element.');
          }
        }else{
          console.log('no className for element');
          return;
        }
      }
      }
      document.getElementById('m').className='m1';
    }
    function funL(){
      document.getElementById('m').className='m';
      while( divsI1.length>0 ){
        if( !divsI1[0].classList){
          divsI1[0].classList.add('i');
          divsI1[0].classList.remove('i1');
        }else{
          var el=divsI1[0];
          if( el.className ){
            el.className+=' i';
            if(/\s\bi1\b/.test(el.className)){
              el.className=el.className.replace(/\s\bi1\b/,'');
            }else if(/^\bi1\b/.test(el.className)){
              el.className=el.className.replace(/^\bi1\b\s+/,'');
            }else{
              console.log('it seems that there is no i class in element.');
            }
          }else{
            console.log('no className for element');
            return;
          }
        }
      }
    }
  }
function toggleClassPair(){		
  /**
           * parameters of the block:
           *  Changing(toggleing) classes
           *  'i' and 'i1' - toggled classes for all elements contained them
           *  'm' and 'm1' - toggled classes for elements contained them
           *
           *  Trigger element and events:
           *  'm' - id of element to fire trigger function (id of trigger)
           *  'mouseeneter' and 'mouseleave' event pair to fire toggleing successively (on-event off-event of changing classes)
            */
  // Global vars:
        d = window.document;		  
          var divsI=d.getElementsByClassName('i');
          var divsI1=d.getElementsByClassName('i1');
          window.addEventListener('load',function(){
                   var el=document.getElementById('m');            // trigger el
                   //el.addEventListener('mouseenter',funE,false);   // toggle on  (from old class to new)
                   //el.addEventListener('mouseleave',funL,false);   // toggle off  (from new class to old)
                   addEvent('mouseenter',el,funE);
                   addEvent('mouseleave',el,funL);
                   }
          ,false);
          function funE(){
            // if elements has only one class
            // for few elements with unique class
            while( divsI.length>0 ){
              divsI[0].setAttribute('class','i1');
            }
            //element with unique class
            document.getElementById('m').className='m1';
          }
          function funL(){
            //element with unique class
            document.getElementById('m').className='m';
            // if elements has only one class
            // few elements with unique class
            while( divsI1.length>0 ){
              divsI1[0].setAttribute('class','i');
            }
          }		
  }
  }  // end of try
  catch(e){
    var mess=(e.message)?e.message:e;
    alert(' We are in catch Error.mesage='+mess);
    alert('stack:'+e.stack);
    
  }
</script>