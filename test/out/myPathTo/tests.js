function testInitSetters(){
  handle.setAnalysingGroups( new RegExp('our'),PEleCom.inpData.sets);
  var id=PEleCom.inpData.sets.our.dataSrcId;
  
   Glossary.setters.sprShts.initSprSht(id); 
}

function re(){
  var condStr="(our.телефон==smsCik.tel)&&(our['№ УИК']==smsCik.uik)";
  var p=new RegExp('our\[.\]w+?',"g");
  var sNm='our';
  
  var pttDot=new RegExp(sNm+'\\.',"g");
  var pttPrnth=new RegExp(sNm+'\\[',"g");
  
  var condStrForSelect;
  condStrForSelect=condStr.replace(pttDot,'PEleCom.inpData.sets.'+sNm+'.').replace(pttPrnth,'PEleCom.inpData.sets.'+sNm+'[');
  
  // identifies columns mentioned in expression of 
  var pattCol=new RegExp( sNm+'[.]\\w+',"g");
  //var pattCol=new RegExp( sNm+'[.]\\w+?',"g");
  
  // more common pattCol=new RegExp( sNm+"(\\[.\\]\w+|\\[('"+'|"\\).+?\\]\\)' ,"g");  Takes into account property style - obj['some property']
  
  var pattCol1=new RegExp( sNm+"([.]\\w+|[('"+'|").+?])' ,"g");
  var pattCol2=new RegExp( sNm+"\\[('"+'|").+?]' ,"g");
  var pattCol3=new RegExp( sNm+"([.]\\w+|\\[('"+'|").+?])' ,"g");
  var tSP=condStr.match(pattCol);
  var tSP1=condStr.match(pattCol1);
  var tSP2=condStr.match(pattCol2);
  var tSP3=condStr.match(pattCol3);
  
  var str='№ УИК';
  var str1="'№ УИК'";
  var str2=str1.toString();
  var str3=str2.replace(/'/g,'');
  Logger.log(data);
  
  
}
/** ugly indices (russian)
 *
 */
function uglyInd(){
  // expample from:
  // http://stackoverflow.com/questions/13781074/sending-iso-8859-1-chars-from-google-apps-script
  
  var result = Utilities.newBlob('№ УИК').getDataAsString('UTF-8');   

  Logger.log(result);
  var o={uik:'uik',
         уик:'уик',
         "№ УИК":"№ УИК"};
  for( var i in o){
    Logger.log('\n i='+i+'    o.i:'+ o.i +''+'         o[i]:'+o[i]);//+'    eval( "o."+i) : '+eval("o."=i)   );
  }
  //Logger.log('\n o.uik='+o.uik+'        o.уик= '+o.уик+'    eval(...)='+eval("o['"+i+"']")   );
  
}
function testEmptyO(){
  var o={};
  Logger.log(handle.objIsEmpty(o));
  o.a='';
  Logger.log(handle.objIsEmpty(o));
  delete o.a;
  Logger.log(handle.objIsEmpty(o));
  o.f=function(){return "I'm a function";};
  Logger.log(handle.objIsEmpty(o));
  o.b='b';
  for(var ip in o){
    if(typeof o[ip] ==='function'){
    Logger.log(o.f());
    }else{
      Logger.log('i am not');
    } 
  }
}
function throwTest(){
  var a=2;
  if(a<10){
    throw 'a<10';
  }
  Logger.log('endThrowTest');
}
/**
* Tests settings
*/
function testCreateSprSheetsForPatterns(){
  
  var output=PEleCom.output; 
  var ptts=[/^our$/,/smsCik/,/preC/];

  /**
  * How to create sheets for data sets from Glossary determined by patterns
  *
  *   output.createSheetsForPatternsGroups(ptts);
  */
  // Creates independent instance of Glossary - myGloss  :
  var myGloss=PEleCom.addFamily('myGloss','',Glossary);  // special family for 'private' glossary-instances
  
  // creates new Glossary instanciating  object myglossary contained glossary sheet data
  // and includes it into myGloss object
  // to select Existed groups - Patterns are used (RegExp patterns or array of patterns)
  // to assign New groups - "Setterns" are used (object specifying new group's object prarmeters(selectors))
  myGloss=handle.setAnalysingGroups( {labels:['myglossary']},myGloss);  // uses "settern"-object
  
  var myglossary=myGloss.myglossary;
  var dShName=myglossary.dataShName;
  var tM=myglossary.dataSrcTMark;
  var id=myglossary.dataSrcId;
  var ssMy=SpreadsheetApp.openById(id);
  ssMy.rename(dShName); // changes defaul by myGlossary_tM name
  var sMyGl=ssMy.getSheetByName(dShName);
  
  // common (general,conventional) glossary object
  var sGl=SpreadsheetApp.openById(myGloss.ssId).getSheetByName(myGloss.shName);
  var d=sGl.getDataRange().getValues();
  // fills in private glossary's data
  sMyGl.getRange(1,1,d.length,d[0].length).setValues(d);
  myglossary.dataShHeadInd=myGloss.glossaryInitParameters.dataShHeadInd;
  myglossary.dataShHeader=d[parseInt(myglossary.dataShHeadInd,10)];
  // inputs parameter into private glossary instance sheet
  myGloss.addLines({label:'myglossary',dataShHeadInd:myglossary.dataShHeadInd}); // each instance of Glossary has addLines-method
                            
  Logger.log('newGlossary I\'m label= %s',myGloss.im);
  
  var allNewInOne=false;
  var ssId;
  if(allNewInOne){
    // allNewInOne mode - all new groups sheets are placed in one spreadsheet preliminary determined
    var folder=output.getResultFolder('MyTest'+Utilities.formatDate(new Date(),"GMT+03:00",'_ddMMHH_HHmmss'));
    var ss=SpreadsheetApp.create('allNewInOneSS');
    ssId=ss.getId();
    folder.addFile(DriveApp.getFileById(ssId));
  }
  var pGNew={
    labels:['testShForPatt11','testShForPatt12'],
    allNewInOne:allNewInOne,
    oneSsForAll:true,
    ssIdForallNewInOne:function(ssId){return (ssId)?ssId:'';}(ssId),
    selectors:{
    "testShForPatt11":{
    definition:'Definition of group data set from setAnalysingGroups process',
    name:'TestRunsetAnalysingGroups1'}
  }
  };
  var rootFamily=handle.setAnalysingGroups(pGNew);
  var im=rootFamily.im;      
  Logger.log(im);
}
/**
* tests saving procedure
*/
function testScriptPrs(){
  var o={
    tM:tMark,
    a:'a',
    csv:['a','b','c'].toString()
  };
  var str=JSON.stringify(o);
  var fld=DriveApp.getFolderById(ID_FLD_RESULTS);
  // gets lastly created folder name
  Logger.log(fld.getFolders().next().getName());
  
  var f= DriveApp.createFile('tempData_'+tMark,str,MimeType.PLAIN_TEXT);
  var fldNew=DriveApp.createFolder(tMark);
  fldNew.addFile(f);
  fld.addFolder(fldNew);
  var root=DriveApp.getRootFolder();
  // removes newFolder from root
  root.removeFolder(fldNew);  
  // opens folder named tMark
  var folder=DriveApp.getFoldersByName(tMark).next();
  // gets string from file
  var tempD=folder.getFilesByName('tempData_'+tMark).next().getBlob().getDataAsString();
  Logger.log(tempD);
  // handles object got from json string
  var obj=JSON.parse(tempD);
  for (var ip in obj){
    Logger.log('obj.%s =%s',ip,obj[ip]);
    if(/[,]/.test(obj[ip])){
      var arr=obj[ip].split(',');
      Logger.log('array:'+arr);
      //var ff=function(){for(var i=0;i<arr.length;i++){Logger.log(arr[i]);}}();
    }
  } 
}
function testSSheetInFewFolders(){
  var ss=SpreadsheetApp.create('ssInFewFolders');
  var d=[['c0','c1','c2'],[1,2,3],[4,5,6]];
  var s=ss.insertSheet('testSheet');
  s.getRange(1,1,d.length,d[0].length).setValues(d);
  var root=DriveApp.getRootFolder();
  var fldA=DriveApp.createFolder('A');
  var fldB=DriveApp.createFolder('B');
  var fldC=DriveApp.createFolder('C');
  fldA.addFolder(fldC);
  var ssFl=DriveApp.getFileById(ss.getId());
  fldA.addFile(ssFl);
  fldB.addFile(ssFl);
  fldC.addFile(ssFl);
  s.appendRow([7,8,9]);
  root.removeFile(ssFl);
  root.removeFolder(fldC);
  
  var parents=ssFl.getParents();
  var p=[];
  while(parents.hasNext()){
    var pr=parents.next();
    p.push(pr.getName());
    Logger.log(pr.getName());
  }
  s.appendRow(p);
}
function testSS(){
  var id='1jvjTcnfKSb4KyRigCYGBOjKC38rMiBBSX20T_-2yOYU';
  var ss=SpreadsheetApp.openById(id);
  var flds=DriveApp.getFileById(id).getParents();
  while(flds.hasNext()){
    Logger.log(flds.next().getName());
  }
  ss.getSheetByName('testSheet').appendRow(['new','new','new']);
}
function testCloneO(){
  var o={ a:'a',b:'b',f:function(){return 'f';}};
  var donor={c:'c',fc:function(){return 'fc';}};
  var o1=handle.cloneObj(donor,o);
  o1.a='A';
  var o2=handle.cloneObj(o1);
  
  o2.b='bb';
  var o3=handle.cloneObj( handle.cloneObj(donor,o) );
  o3.c='C';
  o3.b="B";
  o1.a='aa';
  Logger.log('%s %s %s %s',o.a,o1.a,o2.a,o3.a);
  Logger.log('%s %s %s %s',o.b,o1.b,o2.b,o3.b);
  Logger.log('%s %s %s %s',o.c,o1.c,o2.c,o3.c);
  
  
  o1={p1:'',p2:'',p3:''};
  o2={p4:'p4',p3:'1'};
  o3=handle.cloneObj(o1,o2,true);
  Logger.log(o3);
  var o4=handle.cloneObj(o1,o2,false);
  Logger.log(o4);
  var o5=handle.cloneObj(o1,o2);
  Logger.log(o5);  
  var o6=handle.cloneObj(o1,o2,true,false);
  Logger.log(o6);
  var o7=handle.cloneObj(o1,o2,false,false);
  Logger.log(o7);
  o7.re=/abc/;
  o7.d=new Date();
  o7.ob={p1:'p1',p2:8};
  var o8=handle.cloneObj(o7);
  o8.re=/fgh/;
  o8.d=new Date(o8.d.setDate(o8.d.getDate()+3));
  o8.ob.p2=10;
  Logger.log('endT');
}
var testM={};
testM.a='a';
testM.o={};
testM.f=function(){
  var o={};
  o.a='b';
  this.a='A';
  o.f1=function(){return this.a;};
  var o1={
    a:'c',
    f:function(){return this.a;}
  };
  return 'f'+' '+o.a+' '+this.a+' '+o.f1()+'\n'+o1.a+' '+o1.f();
};
function testthis(){
  Logger.log(testM.a);
  Logger.log(testM.f());
  
}
function logProjectTriggersId (){
  Logger.log('TriggersIds:');
    var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    Logger.log(allTriggers[i].getUniqueId());
  }
}
