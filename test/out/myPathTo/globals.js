// data of 19/09/2016
var ID_SS1909="1Sg1RTpg-TXdwbvej-TyY4Cku30w0TCHUUAH1RFawmhg";  // ID of spreadsheet "msk-recieved-2016-09-19_15-30.xlsx"
var ourListName1909="ourList_210916_170335";
// data of 18/09/2016
var ID_SS1809="1q59DuY26akB53Nw-p_1SZVvky4eItvNSZgeYAH16Ykc";  // id of spreadsheet "msk-recieved-1am.xlsx"
var ourListName="ourList";
var cikListName="msk-recieved-1am";
var cikCopyName="ciKListCopy";
var ID_SMSCIK220916='1OOcQrzA_8ZbbsH6RzmMxS6L0viPGZJ51K6Ztw0Tz6Fc';
var smsCikListName='msk-recieved-2016-09-22_21-30';

var ID_SS2709="1hxaM1mP7wt3GE4Zj9DtW2OiHSIUvsR8fAOUx6HWMDTw"; //  ID of spreadsheet "OurData_Копия_город_Москва-all-5pct_270916_010000"
var ourListName2709='ourList_270916_010000';
// -- results folder
var ID_FLD_RESULTS="0B9mOESHtO2LXdTQyS0VJM2xuNzA";  // id of folder smsCIK_Results
//--- time Management
var time=new Date();
var tStart=time.getTime();  // timestamp - time in milliseconds beginning with some common Start
var tLimitmSec=60*1000;
var tZone=Session.getScriptTimeZone();
var tMark=Utilities.formatDate(time, tZone,'ddMMYY_HHmmss');
var tMShort=Utilities.formatDate(time, tZone, 'ddMMYY');

var tLimit=new TimeLimit(tStart,tLimitmSec);

var fakeTLimitCheck=true;
var nVAL=0;
/**
* @global removeCreatedFolderFromRoot 'remove newFolder from root' parameter
* if true - the copy of newly created folder shown in root drive derectory
* should be remove. The original sample of the folder located in its original place ( for ex. in reuslts
* folder smsCik_Resulte will be kept untouched )*/
var removeCreatedFolderFromRoot=false;
// runs control spreadsheet ID
var ID_SS_RUNS='1LJ7IuFOTPKu5gjd2X6Hmrb8W-nzxqt_MAj_51xqnycA'; // in smsCik/runs folder