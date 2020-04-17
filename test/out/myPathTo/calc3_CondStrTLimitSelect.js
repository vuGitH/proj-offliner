
/**
* Preliminaty Normalizes phones numbers in specified column
* of input data set sheet
*/
function preNormalizePhones(){
  handle.setAnalysingGroups( [/our/,/smsCik/],PEleCom.inpData.sets);
  var inpData=PEleCom.inpData;
  var sets=inpData.sets;
  var our=sets.our;  
  // -- normalizes phone numbers format for data set with label 'our'
  var id=our.dataSrcId;
  var shNm=our.dataShName;
  var telColNm='телефон';
  normalizePhones(id,shNm,telColNm,'7',false);  
}
function testDatePropertyOfClonedObject(){
  var o={
    t:new Date().getTime(),
    tM:function(){
      var tMM=Utilities.formatDate(new Date(this.t),Session.getScriptTimeZone(),'ddMMYY_HHmmss');
      return tMM;
    },
    tM1:function(){
      var dt= this.t;
      var tMM=Utilities.formatDate(new Date(dt),Session.getScriptTimeZone(),'ddMMYY_HHmmss');
      return tMM;
    }};
  
  Logger.log('tM='+o.tM());
  Logger.log('tM1='+o.tM1());
  
  var timeMark=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'ddMMYY_HHmmss');
  Logger.log('timeMark='+timeMark);
  
  var o1=handle.cloneObj(o);
  
  Logger.log('time: %s \n timeMark: %s ',o1.t,o1.tM());
  Logger.log('o1.tM1= %s',o1.tM1());
}