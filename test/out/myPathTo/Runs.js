function t(){
  Pel=(function(pel) {
    var handle=pel.handle;
    var sets=pel.inpData.sets;
    var grps=pel.output.dataGroups;
    var glossary=pel.glossary;
    var pGNew={};
    pel.globals=
      ((pel.globals)&&(pel.globals.ID_SS_RUNS))?
        pel.globals:
        {
          add:function(key,val){
            this[key]=val;
            return this[key];
          }
        };
    // global variables space
    var glob=pel.globals;        
    var tZone,tMark,tMShort,ID_SS_RUNS,ID_FOLDER_RUNS,ss,s;
    // in smsCik/runs folder
    ID_SS_RUNS=(glob.ID_SS_RUNS)?glob.ID_SS_RUNS:
    glob.add('ID_SS_RUNS','1LJ7IuFOTPKu5gjd2X6Hmrb8W-nzxqt_MAj_51xqnycA');
    
    ID_FOLDER_RUNS=(glob.ID_FOLDER_RUNS)?glob.ID_FOLDER_RUNS:
    glob.add('ID_FOLDER_RUNS','0B9mOESHtO2LXUHBtUnRnQmVqdG8');
    
    tZone=(glob.tZone)?glob.tZone:
    glob.add('tZone',Session.getScriptTimeZone());
    
    tMark=(glob.tMark)?glob.tMark:
    glob.add('tMark',Utilities.formatDate(time, tZone,'ddMMYY_HHmmss'));
    
    tMShort=(glob.tMShort)?glob.tMShort:
    glob.add('tMShort',Utilities.formatDate(time, tZone, 'ddMMYY'));
    
    var runsParameters={
      label:'runs',
      definition:'Система управления расчетами.',
      essType:'ess',
      pCreator:Session.getActiveUser().getEmail(),
      pFirstDate:new Date(),
      dataSrcType:'GOOGLE SHEETS',
      dataSrcTMark:tMark,
      dataSrcId:ID_SS_RUNS,
      dataShName:'runs',
      dataShHeadInd:0,
      parentFolderId:ID_FOLDER_RUNS,
      docId:'',
      docFolderId:ID_DOCS_FOLDER,
      isInSet:'runs',
      dTStamp:new Date().getTime()
    };
    
    var Runs=PEleCom.addFamily('runs');
    Runs.im='runs';        // I'm - "I am"
    Runs.ssId=ID_SS_RUNS;     //ID_SS_RUNS  runs
    Runs.shName= 'runs';
    Runs.parentFolderId=ID_FOLDER_RUNS;           // smsCIK/runs
    Runs.runsInitParameters=runsParameters; //
    ss=SpreadsheetApp.openById(ID_SS_RUNS);
    try{
      s=ss.getSheetByName(Runs.shName);
      if(s===null){
        throw(" Error: 'runs' sheet does not exist yet");
      }
    }catch(e){
      s=ss.insertSheet(Runs.shName,0);
      s.getRange(1,1,1, 3).setValues([['index','run','state']]);
    }
    Runs.data=s.getDataRange().getValues();
    
    throw('Test Throw: we are inside');

    /**
    * registers Glossary is it's not registered yet
    */
    
    glossary.addLines(runsParameters);
    
    return pel;
  })(Pel);
}
 

