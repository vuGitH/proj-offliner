URL_ORIGINAL="https://drive.google.com/open?id=1329uMXxtik_7R4rJyM_NaO1ptAGM9rjjSYrgNSuGqAA"; // 'Копия город Москва-all-5pct - 27.09.2016' folder: smsCIK_ourData
ID_ORIGINAL="1329uMXxtik_7R4rJyM_NaO1ptAGM9rjjSYrgNSuGqAA";

var originalSsName="Копия город Москва-all-5pct - 27.09.2016";
var originalDate="27-09-2016 T01:00:00 GMT+03";
var originalShName='город Москва-all-5pct выборка';
var originalAuthor="DmitryNesterov";

ID_GLOSSARY='13zc5Xaid7crD3MxqSexKvtHODZh02f9tbCjDzqs2ZU8';            // dataGlossaryAndGroups
var shGloss='dataGroups';

ID_INPUTDATA_FOLDER='0B9mOESHtO2LXYnNXOU5JbjdQZkk';                      // folder smsCIK_OurData

var continuePar=false;
var propertiesWritten=false;      // parameter to exclude incorrect scriptProperties reWriting. 
var fakeTimeLimit=true;          // parameter to imitate timeLimit exceeding (while ==false) to write something in report wile some error has occured
var destinationFolderParentId='';

var txtReport='';   // Logging during calculation
// -- timer --
// Global parameter tLimitChedk=false is time limit is expired
 var tLimitCheck=true;
//
var propertiesWritten;
var step;
// max turn Number to separate data sets
var turnMax=4;
var formatSeparately=false;   // spcification of how to format turn data sheet
/** Handling procedure
 *
 */
function postCallHandle(){
  var mailToSwitchOffFilter=false;
  var scriptProperties=PropertiesService.getScriptProperties();
  step=( scriptProperties.getProperty('step') )?scriptProperties.getProperty('step'):'init';
  var turnIni=( scriptProperties.getProperty('turn') )?parseInt(scriptProperties.getProperty('turn'),10):1;
  var iRowIni=( scriptProperties.getProperty('iRowIni') )?parseInt(scriptProperties.getProperty('iRowIni'),10):1;
  var ssOurId=( scriptProperties.getProperty('ssOurId') )?scriptProperties.getProperty('ssOurId'):'';
  var tM=( scriptProperties.getProperty('tMark') )?scriptProperties.getProperty('tMark'):tMark;
  if( !(scriptProperties.getProperty('tMark')) ){scriptProperties.setProperty('tMark',tMark);}
  var t=new Date(); var report;
  txtReport+=(turnIni==1)?
    'We postCallHandle step:'+step+' time: '+t+'\n'
  :'postCallHandle Coninues after trigger relaunch step= '+step+' turn= '+turnIni+' iRowIni= '+iRowIni+'\ntime: '+t;
  // -- input Data setting
  var sCopyOrig;
  // Original
  var ssOurName="OurData_"+originalSsName+'_'+tM;
  var inpOurDataFolder=DriveApp.getFolderById(ID_INPUTDATA_FOLDER);
  var ssOur=(ssOurId)?SpreadsheetApp.openById(ssOurId):SpreadsheetApp.create(ssOurName);
  if(!(ssOurId)){
    inpOurDataFolder.addFile(DriveApp.getFileById(ssOur.getId()));
    scriptProperties.setProperty('ssOurId',ssOur.getId());
  }
  if(step=='init'){      
    // ssOrig is data set labeled in Gloassary as importOur (original data set created by Dmitry Nesterov and others)
    // so we could quer it using Glossary object
    var ssOrig=SpreadsheetApp.openById(ID_ORIGINAL);
    var sOrig=ssOrig.getSheetByName(originalShName);
    
    // copy of Input Original Data
    sCopyOrig=(!(ssOurId))?sOrig.copyTo(ssOur).setName(originalShName):ssOur.getSheetByName(originalShName);
    if(!ssOurId){
      // registers import our data set in glossary
      var importOurParameters={
        label:'importOur',
        essType:'data',
        pCreator:'Dmitry Nesterov',
        pFirstDate:'27-09-2016',
        pLastDate:'',
        dataSrcType:'GOOGLE SHEETS',
        dataSrcTMark:'270916_',
        dataSrcId:ssOrig.getId(),
        dataShName:originalShName,
        dataShHeadInd:0,
        parentFolderId:ID_INPUTDATA_FOLDER
      };
      // registers clone of  our data set imported in glossary
      var importOurCloneParameters={
        label:'importOurClone',
        essType:'data',
        pCreator:Session.getActiveUser().getEmail(),
        pFirstDate:time,
        pLastDate:'',
        dataSrcType:'GOOGLE SHEETS',
        dataSrcTMark:tM,
        dataSrcId:ssOur.getId(),
        dataShName:'Copy of '+originalShName,
        dataShHeadInd:0,
        parentFolderId:ID_INPUTDATA_FOLDER
      }; 
      Glossary.addLines([importOurParameters,importOurCloneParameters]);
    }
    // исправление хэдера в Клоне
    if( !(sCopyOrig.getRange(1,1).getValue())||(sCopyOrig.getRange(1,1).getValue()==null)||(sCopyOrig.getRange(1,1).getValue()=='')||(sCopyOrig.getRange(1,1).getValue()==undefined)){
      sCopyOrig.getRange(1,1).setValue('место');
    }
    if( !(sCopyOrig.getRange(1,3).getValue())||(sCopyOrig.getRange(1,3).getValue()==null)||(sCopyOrig.getRange(1,3).getValue()=='')||(sCopyOrig.getRange(1,3).getValue()==undefined)){
      sCopyOrig.getRange(1,3).setValue('район');
    }
    if( !(sCopyOrig.getRange("p1").getValue())||(sCopyOrig.getRange("p1").getValue()==null)||(sCopyOrig.getRange("p1").getValue()=='')||(sCopyOrig.getRange("p1").getValue()==undefined)){
      sCopyOrig.getRange("p1").setValue('вЕжедневникНД');
    }
  } var sOur,sOur1,takeOur1,ourObj,ourData,our1Data;
  if((step=='init')&&(!ssOurId)){
    sOur1=sCopyOrig.copyTo(ssOur);    
    var our1DR=sOur1.getDataRange();
    our1Data=our1DR.getValues();    
    takeOur1=false;
    time=new Date();
    tMark=Utilities.formatDate(time, tZone,'ddMMYY_HHmmss');
    sOur=ssOur.insertSheet('ourList_'+tMark);
    scriptProperties.setProperty('tMark',tMark);
    var ourDR=sOur.getRange(1,1,our1Data.length,our1Data[0].length);
    var ourBgs=our1DR.getBackgrounds();
    var ourFlns=our1DR.getFontLines();
    var ourFclr=our1DR.getFontColors();
    var ourFwht=our1DR.getFontWeights();
    ourDR.setValues(our1Data);
    ourDR.setBackgrounds(ourBgs);
    ourDR.setFontLines(ourFlns);
    ourDR.setFontColors(ourFclr);
    ourDR.setFontWeights(ourFwht);
    ourData=our1DR.getValues();
    ourObj={ourDR:ourDR,
                Data:ourData,
                Bgs:ourBgs,
                Flns:ourFlns,
                Fclr:ourFclr,
                Fwht:ourFwht
               };
    // registers new instance of our data set in glossary
    var ourInstanceParameters={
      label:'our',
      essType:'data',
      pCreator:Session.getActiveUser().getEmail(),
      pFirstDate:time,
      dataSrcType:'GOOGLE SHEETS',
      dataSrcTMark:tM,
      dataSrcId:ssOur.getId(),
      dataShName:'ourList_'+tMark,
      dataShHeadInd:0,
      parentFolderId:ID_INPUTDATA_FOLDER
    }; 
    Glossary.addLines(ourInstanceParameters);
  }else{
    sOur=ssOur.getSheetByName('ourList_'+tM);
    sOur1=ssOur.getSheetByName('ourList_'+tM);
  }
  switch(step){
    case 'init':
      if( ssOur.getSheetByName('Sheet1') ){
        ssOur.deleteSheet(ssOur.getSheetByName('Sheet1'));
      }
      // separates turns
      step='separateTurns';
      scriptProperties.setProperty('step', 'separateTurns');
      if( mailToSwitchOffFilter){    
        var message='Processing of smsCikPostCallHandle_Scripts has been'+
          ' terminated.\nPlease switch off all fileters of sheet '+
            ((sOur)?sOur.getName():sOur1.getName())+
          'of spreadsheet named:'+ssOur.getName()+
            ' with Id='+ssOur.getId()+'\n Log content on the moment of termination was:\n'+
              txtReport+'\nTo reinitiate calculation run function postCallHandle'+
                ' in script file postCallHandle.gs\nCurrent time:'+new Date();
        MailApp.sendEmail('aquapowder@gmail.com','google spreadsheet handle notification',message);
        return;
      } break;
    case 'separateTurns':
      txtReport+='postCallHandle step:'+step+' time: '+t+'\n';
      // -- copying data and format for turns
      for (var it=turnIni ;it<turnMax+1;it++){
        iRowIni=(!takeOur1)?selectTrnO( ssOur,sOur,ourObj,it,iRowIni):selectTrn(ssOur,sOur1,our1Data,it,iRowIni);
        txtReport+='Data set for trun= '+it+' has been copied step= '+step+'/nCurrent Time:'+t+'\n';
        if( !tLimit.tLimitCheck){
          break;
        }
      }
        if( !tLimit.tLimitCheck){
          break;
        } break;
    case 'turnSheetFormating' :

      if( formatSeparately){
        var iROut=( scriptProperties.getProperty('iROut') )? scriptProperties.getProperty('iROut'):0;
        for (var itt=turnIni ;itt<turnMax+1;itt++){
          var iRIO=setTrnSheetsFormat( ssOur,itt,ourData,iRowIni,iROut);
          iRowIni=iRIO[0];
          iROut=iRIO[1];
          txtReport+='Data set for trun= '+turn+' has been copied step= '+step+'/nCurrent Time:'+t+'\n';
          if( !tLimit.tLimitCheck){
            break;
          }
        }
      }
      scriptProperties.setProperty('step', 'postCallDataHandling');
      // new run for final calculation
      // clear script properties
      var keys=scriptProperties.getKeys();
      for( var ik in keys){
        if( !(/(Id|step|tMark)/.test( keys[ik]))){
           scriptProperties.deleteProperty(keys[ik]);
        }
      }
      createNextTrigger(30000,'postCallHandle');
      return;
    case 'postCallDataHandling':
      txtReport+='We postCallHandle step:'+step+' time: '+t+'\n';
      txtReport+='Trigger has been launched!! step:'+step+' time: '+t+'\n';
      scriptProperties.setProperty('step','TimeToDebugPEleCom');
      Logger.log(txtReport); break;
    case 'TimeToDebugPEleCom':
      // -- setting input Data sets
      var pattDSets=[/^our$/,/^smsCik$/];
      var handle=PEleCom.handle;    
      var inpSets=PEleCom.inpData.sets;                                     // input Data Sets Object
      handle.setAnalysingGroups(pattDSets,inpSets);
     
      
      var pattDTMark=[tM,'220916_21300'];
      // output Data sets
      var Out=PEleCom.output;
      // -- previous versions consistency parameters
      Out.smsCikInpShName=smsCikListName;
      Out.smsCikInpSSId=ID_SMSCIK220916;
      Out.ourDataSSName=ssOurName;
      Out.ourDataSSID=ssOurId;
      Out.ourDataSheetName='ourList_'+tMark;
      Out.resultsFolderId=ID_FLD_RESULTS;
    // set analizing output groups
      // prepares array of patterns to specify groups' labels
      var pattPostCall=/pstC/;     // postCallND - Dima's post call groups
      var pattsGrps=[pattPostCall,/preCSelectdT12/,/preCSelectdT12CKD/,/preCSelectdT12NCKD/];
      pattsGrps=[pattPostCall,/preC/,/beSmsed/,/beMailed/];
      
      var outGroups=handle.setAnalysingGroups(pattsGrps);
      //output Data set
      createOutputTables();
  }
  // -- finishing ---
  if( tLimit.tLimitCheck){
    // -- no timeLimit expired
    // delete all scriptProperties and Triggers
    scriptProperties.deleteAllProperties();
    Logger.log('Calculations are finished at all');
    report=DocumentApp.create('postCallHanlingReport_'+tMark);
    report.getBody().appendParagraph(txtReport);
    if( destinationFolderParentId!=''){
      report.saveAndClose();
      DriveApp.getFileById(report.getId()).makeCopy(DriveApp.getFolderById(destinationFolderParentId)).setName('copy_'+'postCallHanlingReport_'+tMark);
      DriveApp.getRootFolder().removeFile( DriveApp.getFileById(report.getId()));
    }else{
      DriveApp.getRootFolder().addFile(DriveApp.getFileById(report.getId()));
    }
  }else{
    // time limit exceeded
    // create trigger for next run
    createNextTrigger(60000,'postCallHandle');
    Logger.log('Trigge has been created');
    report=DocumentApp.create('postCallHanlingReport_'+tMark);
    report.getBody().appendParagraph(txtReport);
    if( destinationFolderParentId!=''){
      report.saveAndClose();
      DriveApp.getFileById(report.getId()).makeCopy(DriveApp.getFolderById(destinationFolderParentId)).setName('copy_'+'postCallHanlingReport_'+tMark);
      DriveApp.getRootFolder().removeFile( DriveApp.getFileById(report.getId()));
    }else{
      DriveApp.getRootFolder().addFile(DriveApp.getFileById(report.getId()));
    }
  }
}
/*
 * Select turn
 * @param{object)ss - spreadsheet
 * @param{object sheet}sOur - sheet of our data
 * @param{integer}turn - the turn is seleting
 * @return {Integer} index of initial row for next scaning cycle
 */
function selectTrn(ss,sOur,ourData,turn,iRowIniOpt){
  var iRowIni=iRowIniOpt||1;
  
  var tName="turn"+turn;
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
  var nAddrUik=getColNumb(ourData[0],'Адрес УИК');
  var colLetter=shNew.getRange(1, nAddrUik).getA1Notation().replace(/\d/g,'');
  
  //shNew.appendRow(header);
  var inew=0;
  for( var i=iRowIni;i<ourData.length;i++){
     var currTurn=ourData[i][jColOfTurn];            // turn value
     if( currTurn==turn ){
       inew++;
       var rowR=sOur.getRange(i+1,1,1,sOur.getLastColumn());
       rowR.copyTo(shNew.getRange(inew+1,1,1)); 
              
         if( !tLimit.check() ){
           var nRow=parseInt(i,10)+1;
           var t=new Date();
           txtReport+='Time limit expired after copying data and format or rowr='+nRow+' and set of trun= '+turn+' at step= '+step+'/nCurrent Time:'+t+'\n';
           tLimitCheck=false;
           if( !fakeTimeLimit) {
             scriptProperties.setProperty('step', step);
             scriptProperties.setProperty('turn',turn);
             scriptProperties.setProperty('iRowIni',nRow);
             
             propertiesWritten=true;
           }
           return nRow;
         }
     }
   }
  shNew.getRange(colLetter+':'+colLetter).setWrap(false);
  return 1;
}
/*
 * Select turn
 * @param{object)ss - spreadsheet
 * @param{object sheet}sOur - sheet of our data
 * @param{object}ourObj - objetc of our data sheet parameters
 * @param{integer}turn - the turn is seleting
 * @return {Integer} index of initial row for next scaning cycle
 */
function selectTrnO(ss,sOur,ourObj,turn,iRowIniOpt){
  var iRowIni=iRowIniOpt||1;
  
  var tName="turn"+turn;
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
  var tData=[];
  var tBgs=[];
  var tFclr=[];
  var tFlns=[];
  var tFwht=[];
  if( iRowIni==1){
    //var headR=sOur.getRange(1,1,1,sOur.getLastColumn());
       tData.push(ourObj.Data[0]);
       tBgs.push(ourObj.Bgs[0]);
       tFclr.push(ourObj.Fclr[0]);       
       tFlns.push(ourObj.Flns[0]);
       tFwht.push(ourObj.Fwht[0]);
  
  }else{
       tData=shNew.getDataRange().getValues();
       tBgs=shNew.getDataRange().getBackgrounds();
       tFclr=shNew.getDataRange().getFontColors();
       tFlns=shNew.getDataRange().getFontLines();
       tFwht=shNew.getDataRange().getFontWeights();
  }
  
  var jColOfTurn=getColNumb(ourObj.Data[0],'очередь')-1;
  var nAddrUik=getColNumb(ourObj.Data[0],'Адрес УИК');
  var colLetter=shNew.getRange(1, nAddrUik).getA1Notation().replace(/\d/g,'');
  
  //shNew.appendRow(header);
  var inew=0;
  var shNewR;
  for( var i=iRowIni;i<ourObj.Data.length;i++){
     var currTurn=ourObj.Data[i][jColOfTurn];            // turn value
     if( currTurn==turn ){
       inew++;
       tData.push(ourObj.Data[i]);
       tBgs.push(ourObj.Bgs[i]);
       tFclr.push(ourObj.Fclr[i]);       
       tFlns.push(ourObj.Flns[i]);
       tFwht.push(ourObj.Fwht[i]);
              
		if( !tLimit.check() ){
		   var nRow=parseInt(i,10)+1;
           var t=new Date();
           txtReport+='Time limit expired after copying data and format or rowr='+nRow+' and set of trun= '+turn+' at step= '+step+'/nCurrent Time:'+t+'\n';
           tLimitCheck=false;
           if( !fakeTimeLimit) {
             scriptProperties.setProperty('step', step);
             scriptProperties.setProperty('turn',turn);
             scriptProperties.setProperty('iRowIni',nRow);
             
             shNewR=shNew.getRange(1,1,tData.length,ourObj.Data[0].length);
             shNewR.setValues(tData);
             shNewR.setBackgrounds(tBgs);
             shNewR.setFontLines(tFlns);
             shNewR.setFontColors(tFclr);
             shNewR.setFontWeights(tFwht);
             
             propertiesWritten=true;
           }
           return nRow;
         }
     }
   }
  shNewR=shNew.getRange(1,1,tData.length,ourObj.Data[0].length);
  shNewR.setValues(tData);
  shNewR.setBackgrounds(tBgs);
  shNewR.setFontLines(tFlns);
  shNewR.setFontColors(tFclr);
  shNewR.setFontWeights(tFwht);
  shNew.getRange(colLetter+':'+colLetter).setWrap(false);
  return 1;
}
/**
 * Sets format for turns sheets
 * @param{Spreadsheet}ss - spreadsheet contained our data
 * @param{Integer}turn - the number of turn
 * @param{string}ourLName - our list name 
 * @param{Integer}iRowIniOpt - index of initial row to be analized
 * @param{Integer}iROutOpt - index of row in output sheet indicating the initial row where
 *   data should be coppied
 * @return{Array Integer[]} array of two elements. 
 *   [0] - next row of input data wich format(markUp) data should be copied to output set
 *   [1] - next row of output data set which should be formatted in accordance with formatting
 *         data of approppriate input row
 */
function setTrnSheetsFormat(ss,turn,ourLName,iRowIniOpt,iROutOpt){
  var iROut=iROutOpt||0;
  var iRowIni=iRowIniOpt||0;
  //var ss=SpreadsheetApp.openById(ID_SS1909);
  
  var tName="turn"+turn;
  var shts=ss.getSheets();
  var exist=false; // checkmark to varify existence of sheet with name tName
  for( var is in shts ) {
    if( shts[is].getName() == tName ){
      exist=true;
    }
  }
  var shNew;
  if( !exist ){
    Logger.log("sheet "+tName+"is absent");
  }else{
    shNew=ss.getSheetByName(tName);
  }
  var sOur=ss.getSheetByName(ourLName);
  var ourData=sOur.getDataRange().getValues();
  //---
  var lastCol=sOur.getLastColumn();
  var lastRow=sOur.getLastRow();
  // forming format array
  var ir=iROut;    // correcting addition =1 if target range has no head
  var turnColNo=getColNumb(ourData[0],'очередь');
  for( var i=iRowIni;i<lastRow;i++){
     var currTurn=ourData[i][turnColNo-1];            // turn value
     
     //currTurn=currTurn.toString();   // in sheet 'ourList' turn parameter  has to have integer value
     if( currTurn==turn ){
       sOur.getRange(i+1,1, 1,lastCol).copyTo( shNew.getRange(iROut+1,1,1,lastCol),{formatOnly:true});  
       iROut++;
       if( !tLimit.check() ){
         iRowIni=i+1;
         var t=new Date();
         txtReport+='Time limit expired after copying data and format of input row='+iRowIni+
         ' to output row Number='+(iROut)+' for data set of trun= '+turn+
         ' at step= '+step+'/nCurrent Time:'+t+'\n';
         
         if( !fakeTimeLimit) {
           scriptProperties.setProperty('step', step);
           scriptProperties.setProperty('turn',turn);
           scriptProperties.setProperty('iRowIni',iRowIni);
           scriptProperties.setProperty('iROut',iROut);
           propertiesWritten=true;
         }
         
         return [iRowIni,iROut];
       }
     }
  }
  return [0,0];
}
function testGr(){
  var Out=output;

  //runSpecifics
  Out.runSpecs.specs.unMist.use=true;                  // no Mistchenko data used
  Out.runSpecs.specs.useSmsSite.use=false;            // not uses data from smsSite 
  // analizing groups
  var ssGloss=SpreadsheetApp.openById(ID_GLOSSARY);
  var sGroups=ssGloss.getSheetByName(shGloss);
  var dataGrR=sGroups.getDataRange();
  var dataGr=dataGrR.getValues();
  
  var pattGr=/pstC/;
  var jColLbl=getColNumb(dataGr[0],'label')-1;
  var jColBg=getColNumb(dataGr[0],'bgColor')-1;
  var jColPt=getColNumb(dataGr[0],'pattern')-1;
  var jColVal=getColNumb(dataGr[0],'value')-1;
  var jColDef=getColNumb(dataGr[0],'definition')-1;
  var jcolFStyle=getColNumb(dataGr[0],'fontStyle')-1;
  var jcolTurn=getColNumb(dataGr[0],'turn')-1;
  var j={};
  j.add=function(a,b){
    this[a]=b;
  };
  var grps=Out.dataGroups;
  grps.add=function(a,b){
    this[a]=b;
  };
  var o={};
  var headGloss=dataGr[1];
  for(var jc in headGloss){
    j.add(headGloss[jc],jc);
  }
  
  grps.number=0;
  grps.names.splice(0);
  grps.bg=[];
  grps.def=[];
  grps.fStl=[];
  grps.patt=[];
  grps.conds=[];
  grps.val=[];
  grps.turn=[];
  grps.filtr=[];
  grps.members=[];
  grps.addMember=function(a,b,c){
    this[a]={};
    this[a][b]=c;
    return this[a];
  };
  var ind={};
  ind.add=function(a,b){
    this[a]=b;
  };
  for(var i=1;i<dataGr.length;i++){
    if( pattGr.test( dataGr[i][j.label])){
      grps.number++;     
      grps.names.push(dataGr[i][j.label]);
      var name=grps.names[parseInt(grps.number,10)-1];
      ind.add(name,i);
      grps.bg.push(dataGr[i][j.bgColor]);
      grps.def.push(dataGr[i][j.definition]);
      grps.turn.push(dataGr[i][j.turn]);
      grps.fStl.push(dataGr[i][j.fontStyle]);
      grps.patt.push(dataGr[i][j.pattern]);
      grps.filtr.push(dataGr[i][j.filtersRule]);
    }
  }  
  for( var ig in grps.names){
    var name1=grps.names[ig];
    var ii=ind[name1];
    for( var il in headGloss){
        var jj=parseInt(j[headGloss[il]],10);
        grps.names.add( name1, headGloss[il], dataGr[ii][ jj ] );
    }
    var gr=grps.names[name1];   
    gr.data=[];   
  }
  Logger.log('fin');
}