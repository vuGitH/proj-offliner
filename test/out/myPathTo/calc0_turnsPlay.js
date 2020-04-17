/**
 * Creates sheet for specified turn and collects data in it
 * @param{Object Spreadsheet}ss - our data spreadseet object
 * @param{number}turn - the turn is seleting
 * @param{string}ourLName - sheet Name of our List data
 * @return{} 
 */
function setTurnByNo(ss,turn,ourLName){  
  var tName="turn"+turn;
  var shts=ss.getSheets();
  var exist=false; var shNew;
  for( var is in shts ) {
    if( shts[is].getName() == tName ){
      exist=true;
    }
  }  
  if( !exist ){
    shNew=ss.insertSheet(tName);
  }else{
    shNew=ss.getSheetByName(tName);
  }
  
  var newData=[[]];   
  var sOur=ss.getSheetByName(ourLName);
  var currSName=sOur.getName();
  // data
  var ourData=sOur.getDataRange().getValues();
  //---
  var lastCol=sOur.getLastColumn();
  var lastRow=sOur.getLastRow();
  // forming new data array
  // header
  var header=ourData[0];
  var headRng=sOur.getRange(1,1,1);
  //headRng.copyTo(shNew.getRange(1,1,1));
  shNew.appendRow(header);
  for( var i=1;i<ourData.length;i++){
     var currTurn=ourData[i][4];            // turn value     
     //currTurn=currTurn.toString();   // in sheet 'ourList' turn parameter  has to have integer value
     if( currTurn==turn ){
         var row=[];
         row=ourData[i];
         shNew.appendRow(row);
         /*
         var sourceRow=sOur.getRange(i+1,1,1, lastCol );
         var lastRowNew=shNew.getRange(shNew.getLastRow(),1,1, lastCol );
         copyRangeFormat(sourceRow,lastRowNew);
         */
     }
   }
}
/**
 * Sets format for turns sheets
 */
function setTurnSheetsFormat(ss,turn,ourLName,iRowIniOpt){
  var iRowIni=iRowIniOpt||0;
  var tName="turn"+turn;
  var shts=ss.getSheets();
  var exist=false; var shNew;
  for( var is in shts ) {
    if( shts[is].getName() == tName ){
      exist=true;
    }
  } 
  if( !exist ){
    Logger.log("sheet "+tName+"is absent");
  }else{
    shNew=ss.getSheetByName(tName);
  }
  var sOur=ss.getSheetByName(ourLName);
  var ourData=sOur.getDataRange().getValues();
  var lastCol=sOur.getLastColumn();
  var lastRow=sOur.getLastRow();
  // forming format array
  var ir=0;    // correcting addition =1 if target range has no head
  var turnColNo=getColNumb(ourData[0],'очередь');
  for( var i=iRowIni;i<lastRow;i++){
     var currTurn=ourData[i][turnColNo-1];            // turn value     
     // in sheet 'ourList' turn parameter  has to have integer value
     if( currTurn==turn ){
       sOur.getRange(i+1,1, 1,lastCol).copyTo( shNew.getRange(ir+1,1,1,lastCol),{formatOnly:true});
       ir++;
     }
  }
}
/*
* Selects data of specified turn-parameter value
* @param{Object Spreadsheet)ss - spreadsheet
* @param{Object Sheet}sOur - sheet of our data
* @param{object Array[][]}ourData - data array
* @param{Integer}turn - the turn is seleting
* @param{Integer}iRowIniOpt - number of row to begin with
* @return{Integer} index of initial row for next scaning cycle
*/
function selectTurn(ss,sOur,ourData,turn,iRowIniOpt){
  var iRowIni=iRowIniOpt||1;
  
  var tName="turnNo_"+turn;
  var shts=ss.getSheets();
  var exist=false;
  var shNew;
  for( var ish in shts ) {
    if( shts[ish].getName() == tName ){
      exist=true;
    }
  }
  if( !exist ){
    shNew=ss.insertSheet(tName);
  }else{
    shNew=ss.getSheetByName(tName);
  }
  // forming new data array
  
  // header
  if( iRowIni==1){
    var headRng=sOur.getRange(1,1,1,sOur.getLastColumn());
    headRng.copyTo(shNew.getRange(1,1,1,sOur.getLastColumn()));
  }
  var jColOfTurn=getColNumb(ourData[0],'очередь')-1;
  //shNew.appendRow(header);
  for( var i=iRowIni;i<ourData.length;i++){
    var currTurn=ourData[i][jColOfTurn];            // turn value
    if( currTurn==turn ){
      var rowR=sOur.getRange(i+1,1,1,sOur.getLastColumn());
      rowR.copyTo(shNew.getRange(i+1,1,1));
      
      if( !tLimit.check() ){
        var nRow=i+1;
        var t=new Date();
        txtReport+='Time limit expired after copying data and format or rowr='+nRow+
          ' and set of trun= '+turn+' at step= '+step+'/nCurrent Time:'+t+'\n';
        tLimit.tLimitCheck=false;
        if( !fakeTimeLimit) {
          scriptProperties.setProperty('step', step);
          scriptProperties.setProperty('turn',turn);
          scriptProperties.setProperty('iRowIniNext',nRow);
          
          propertiesWritten=true;
        }
        return nRow;
      }
    }
  }
  return 1;
}

/**
 * Copies turns set with formatting
 */
function formTurnSheetsWithFormating(){

  var ss=SpreadsheetApp.openById(ID_SS2709);
  var sOur=ss.getSheetByName(ourListName2709);
  var ourDR=sOur.getDataRange();
  var ourData=ourDR.getValues();
  var turnMax=4;
  // -- copying
  for (var it=1;it<turnMax+1;it++){
    selectTurn( ss,sOur,ourData,it);
  }  
}
/**
 * Forms Turns' sheets and copies ourListName sheet from 18/09 data spreadsheet to actual one
 */
function formTurnsSheets(){
  var ss=SpreadsheetApp.openById(ID_SS2709);
  var sOur=ss.getSheetByName(ourListName2709);
  var ourDR=sOur.getDataRange();
  var ourData=ourDR.getValues();
  var turnMax=4;
  // -- copying
  for (var it=0 ;it<turnMax+1;it++){
    //selectTurn( ss,sOur,ourData,it);
    if( it>0){
    //setTurnByNo(ss,it,ourListName2709)
    }
    //setTurnSheetsFormat(ss,it,ourListName2709)
  }
  // -- formating
  for (var itt=1 ;itt<turnMax+1;itt++){
       
    setTurnSheetsFormat(ss,itt,ourListName2709);
  }
  Logger.log('Turns samples selected.');
}
/**
 * Copy ourList. Transferes original data sheet into current spreadSheet (ID_SS1909)
 * and formats
 */
function copyOurL(){
  
  var ss18=SpreadsheetApp.openById(ID_SS1809);
  var ss19=SpreadsheetApp.openById(ID_SS1909);
  var shts19=ss19.getSheets();
  var hasOurList=false;
  for(var is in shts19){
    if( shts19[is].getName()==ourListName+"_"+tMark){
      hasOurList=true;
    }
  }
  if( !hasOurList ){ 
    var ourL=ss18.getSheetByName(ourListName);
    var sCopy=ourL.copyTo(ss19).setName(ourListName+"_"+tMark);
  }
}

/**
 * Deletes sheets "turn0"-"turn4"
 */
function delSheets(){

  var ss=SpreadsheetApp.getActive();
  var shts=ss.getSheets();
  var tmax=4;
  var nToDelete=[];
  for(var i=0;i<tmax+1;i++){
    nToDelete.push('turn'+i);
  }
  for( var ish=0;ish<shts.length;ish++){
    var s=shts[ish];
    for(var is=0;is<tmax+1;is++){
      if(s.getName()==nToDelete[is]){
      ss.deleteSheet(s);
      break;
      }
    }
  }
}  
/**
 * Copy sheets from place to another
 * @param{Array String[][]}stIDNmes - names of Sources' and Targets' sheet 
 */
function copySS(stIDNms){
  for(var i=0;i<stIDNms.length;i++){
    var id=stIDNms[i][0];
    var idTrgt=stIDNms[i][2];
    var ss=SpreadsheetApp.openById(id);
    var sourceShName=stIDNms[i][1];
    
    var ssNew=(id!=idTrgt)? SpreadsheetApp.openById(idTrgt) : ss;
    var newShName=stIDNms[i][3];
    
    var s=ss.getSheetByName(sourceShName);
    if( (s) ){
      if( !(ss.getSheetByName(newShName) ) ){
        var sNew=s.copyTo(ssNew).setName(newShName);
      }else{
        Logger.log( newShName+" already exits");  
      }
    }else{
      Logger.log(sourceShName+" does not exist");
    }
  }
}
function copySheets(){
// ---------
  var source1Name="msk-recieved-2016-09-19_15-30";
  var newSh1Name="smsCik190916";
  var source2Name="msk-recieved-1am";
  var newSh2Name="smsCik180916";
  
var stIDNames=[ 
               [ID_SS1809,source2Name,ID_SS1909,newSh2Name],
               [ID_SS1909,source1Name,ID_SS1909,newSh1Name]
              ];              
copySS(stIDNames);
}
// Unifies  background color matiz
function f(){  
  var ss=SpreadsheetApp.openById(ID_SS1909);
  var s=ss.getSheetByName(ourListName1909);
  var shs=ss.getSheets();
  for(var is in shs){
    Logger.log("лист/"+shs[is].getName()+"|");
  }  
  var lc=s.getLastColumn();
  var lr=s.getLastRow();
  var sR=s.getDataRange();
  var bs=sR.getBackgrounds();
  for(var i in bs){
    var b=bs[i];
    for(var j in b){
      if(b[j]=="#f1c232"){
        b[j]="#ffd966";
      }
    }
  }
  sR.setBackgrounds(bs);
}
/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
// The onOpen function is executed automatically every time a Spreadsheet is loaded
function onOpen1() {
   var ss = SpreadsheetApp.getActiveSpreadsheet();
   var menuEntries = [];
   // When the user clicks on "SiteAssembleWork" then "Verify Pages Names", the function verifyPagesNames is
   // executed.
   menuEntries.push({name: "Пересчитать smsCik-данные", functionName: "cikMe"});
   menuEntries.push(null); // line separator
   menuEntries.push({name: "Рабочее окно", functionName: "openSideBar"});
   menuEntries.push({name:"Улыбнись", functionName:"smile"});

   ss.addMenu("смсЦИК обработка", menuEntries);
 }  
/**
 * background color unification
 */
function unifyColors(){
  var bgClRed="#ff0000";           // Red
  var bgClGrn="#6aa84f";         // Green
  var bgClBlu="#3c78d8";          // Blue
  var bgClYel="#ffd966";        // Yellow
  var bgClWht="#ffffff";         // White
  var bgClMgn="#ff00ff";       // Magenta
  var bgClOrn="#ff9900";        // Orange
  var bgClPnk="#ff0080";          // Pink
  var bgClBrn="##c77d30";        // Brown

  var ss=SpreadsheetApp.getActive();
  var bgClPairs={bgColors:[{yel:{from:['#ffe599','#fff2cc','#f6b26b','#ffff00','#f1c232'],to:bgClYel}},
                           {gr:{from:['#b6d7a8','#00ff00','#d9ead3'],to:bgClGrn}},
                           {wht:{from:[],to:bgClWht}},
                           {blu:{from:['#ff9900'],to:bgClBlu}},
                           {red:{from:['#f4cccc'],to:bgClRed}}
                          ]};
  var sNames=['Copy of ourList','turn1','turn2','turn3','turn4','ourList_210916_170335'];
  var bcc=['yel','gr','wht','blu','red'];
  for(var ic=0;ic<sNames.length;ic++){
    var s=ss.getSheetByName(sNames[ic]);
    var sDR=s.getDataRange();
    var bgColors=sDR.getBackgrounds();
    for( var ir=0;ir<bgColors.length;ir++){
      
      for(var ico=0;ico<bgColors[0].length;ico++){
        
        var BGC=bgClPairs.bgColors;
        var bgClMatch=false;
        
        for( var ibgc=0;ibgc<BGC.length;ibgc++){
          
          var cfrom= BGC[ibgc] [bcc[ibgc]] .from;
          var cto=BGC[ibgc][bcc[ibgc]].to;                           
                    
          for( var k in cfrom){
            
            if( bgColors[ir][ico]==cfrom[k]){
              bgColors[ir][ico]=cto;
              bgClMatch=true;
              break;
            }
          }
          if(bgClMatch){
            break;
          }
        }
      }
    }
    //-- change to unified backgrounds colors
    sDR.setBackgrounds(bgColors);
  }

}
function testScriptUrl(){

 Logger.log(ScriptApp.getService().getUrl());
}
