// =============== time limit =================
/**
 * Calculates a kind of a timeStamp
 * function uses Global string timeZone 
 * It doesnt takes into account difference in days of ordinary and leap (высокосный) year/ the year's length is considered to be 365 days
 */
        //var timeZone='GMT+03:00';
//************
function timeStamp(date) {
//*********
var timeStamp=date.getTime();
return timeStamp;
}
/**
* Constructor Object to check time Limit quota
* @param {integer} timeStartInMilliSec Starting time in milliseconds calculated by timeStamp() function
* @param {integer} limitInMilliSeconds Limit for processing time in milliseconds
*/
function TimeLimit(timeStartInMilliSec,limitInMilliSeconds){
  var time=Date.now();
  this.start=timeStartInMilliSec;
  this.quota=limitInMilliSeconds;
  this.tLimitCheck=true;
  /**
  * @return {integer} time lefet - number of millisecond avalable for processing
  */
  this.left=function(){
    var timeNow=Date.now();
    var left=limitInMilliSeconds-(timeNow-timeStartInMilliSec);
    return left;
  };
  /** 
  * @return {boolean} check True if time limit is not expired yet, false - otherwise 
  */
  this.check=function(){
    var left=this.left();
    // Logger.log('left= '+left);
    var check=( left > 0 )? true: false;
    this.tLimitCheck=check;
    return check;
  };
}
/** 
* Example of timeLimit object usage
*/
function testTimeLimit(){
  var tLimit=1*60*1000;
  var time=new Date();
  var timeInMls=Date.now();
  timeInMls=time.getTime();
  var tLim=new TimeLimit(timeInMls,tLimit);
  for(var i=0;i<10;i++){
    Logger.log( tLim.left());
    Logger.log( tLim.check());
    Logger.log( tLim.start);
    Logger.log(tLim.quota);
    Utilities.sleep(30);
  }
}
// ============  Triggers functions =================
/**
* Deletes all triggers but permanent one
*@param {string} permanentTriggerID Permanent trigger ID
*/
function deleteAllTriggersButPermanent (permanentTriggerID){
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    // If the current trigger is the correct one, delete it.
    if( allTriggers[i].getUniqueId() != permanentTriggerID ){
      ScriptApp.deleteTrigger(allTriggers[i]);
    }
  }
}
/**
* creates new trigger to be started over toLaunchOverTime milliseconds
* @param {Time} toLaunchOverTime - period in milliseconds over wich the trigger creating has to be launched
* @param {string}triggerFunction function to be triggered over toLanchOverTime milliseconds
*/
function createNextTrigger(toLaunchOverTime,triggerFunction) {
  
  var now=new Date().getTime();
  var triggerNext=ScriptApp.newTrigger(triggerFunction)
  .timeBased()
  .after(toLaunchOverTime)
  .create();                        
  
  /*var startAt=new Date.now(now+toLaunchOverTime);
  var triggerNext=ScriptApp.newTrigger(triggerFunction)
  .timeBased().at(startAt).inTimezone('GMT+03:00')
  .create();
  */
  ID_TRIGGER=triggerNext.getUniqueId();
  try{
    writeIntoLog("Creating Trigger for next Launch. Step:"+((step)?step:'')+" Current time: "+Utilities.formatDate(now,tZone,tMark));
  }catch(e){}
  return ID_TRIGGER;
}
function test1(){
  var t=new Date();
  var tStart=timeStamp(t);
  Logger.log(tStart);
  Logger.log(DriveApp.getFolderById('0B2B03FlHNQ8DakloX2Z3VnI5SlU').getName());
}

/* Time Limit condition sample:
* // instanciating
* var tLimit=new TimeLimit(strt,limit);
* // check
* if( !tLimit.check() ){
*   txtReport+='Time limit expired while copy-rename of files.filesCount='+filesCount+'\n';
*   tLimit.tLimitCheck=false;
*   // usage of file continuation token
*   if( !propertiesWritten && !fakeTimeLimit) {
*     var fileContinueToken=files.getContinuationToken();
*     scriptProperties.setProperty('fileContinueToken', fileContinueToken);
*     scriptProperties.setProperty('terminationFolderId', sourceFolderId);
*     scriptProperties.setProperty('terminationFolderName', DriveApp.getFolderById(sourceFolderId).getName());
*     scriptProperties.setProperty('dFolderAtTerminationId', destinationFolderId);
*     propertiesWritten=true;
*   }
*   return;
* }
*/