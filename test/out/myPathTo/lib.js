/**
 * determins the number of a column in header with specified name
 * @param {Array} header - 1d array of header's row content
 * @param {string} cName - the name of a column is searched
 * @return {integer} - the number of column with name specidied or -1 if there are no column with name indicated
 */
function getColNumb( header,cName){
  var hLength=header.length;
  for (var j=0;j<hLength;j++){
    if( header[j]==cName){
      return j+1;
    }
  }
  return -1;
}
/**
 * Determins the number of row containing the value in a cell of specified column,
 * which has been specified by name in header
 * @param {Object Array}data 2d-array of sheet's data
 * @param {integer} headerRowNumber - the number of header's row
 * @param {string} colName Name of column in the header
 * @param {string} cellValue the value(for ex. name of page in consideration) which is looking for
 * @return {integer} - number of row for which value in the col colName hase value cellValue
 */
function getNOfRowWithCellValueInColNamed(data,headerRowNumb,colName,cellValue ){
  var row=-1;
  var header=data[headerRowNumb-1];
  var colNumb=getColNumb(header,colName);
  for(var i=headerRowNumb-1;i<data.length;i++){
    if (data[i][colNumb-1]==cellValue){
      row=i+1;
      return row;
    }
  }
  return row;
}
/**
 * Includes html content from file
 * @param {String}fileName - name of file (without extention) written and attached to this project with html coldes,
 * @return {String} html content string
 */
function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
/**
 * creates string with html codes from template file attached to this project
 * @param {string} filename - name of html template file written and attached to this project
 */
function includeTempl(filename) {
  var templ=HtmlService.createTemplateFromFile(filename);
  // transfered properties
  templ.webAppUrl=ScriptApp.getService().getUrl();
  templ.data=data;
  return templ.evaluate().getContent();
}
/**
 *Capitalize first letter
 */
function titleCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function copySomeSheets() {
  var fld=DriveApp.getFoldersByName('smsCIK_OurData').next();
 
  var idNew1='1ZVDTZKmJ9zFf6nKEkIujCq0FMVG9IF5ChQiSzOnVXcw';
  var ssNew1=SpreadsheetApp.openById(idNew1);
  
  var ss=SpreadsheetApp.getActive();
  var shNms=['turn1','turn2','turn3','turn4'];
  var shts=ss.getSheets();
  for(var j=0;j<shts.length;j++){
    Logger.log( shts[j].getName());
  }
  for( var i in shNms){
    var s=ss.getSheetByName(shNms[i]);
    s.copyTo(ssNew1).setName(shNms[i]);
  }
}
/**
 * Copys tab sheet to new one with newName
 * if spreadsheet contain some sheet with newShName, time mark(global parameter) is added to name
 * to indicate the moment of copying 
 * @param {String}ss - spreadsheet object
 * @param {String}shName - the name of sheet is to be copied
 * @param {String}newShName - new name of copying sheet
 * @return {Object Sheet} - newly created sheet object
 */
function copySheetWithNewName(ss,shName,newShName) {

  var sheets=ss.getSheets();
  for(var i in sheets){
    if(sheets[i].getName()==newShName){
      newShName+='_'+tMark;       // add time mark is added to newShName if spreadsheet already contains a sheet with such name
    }
  }
  var s=ss.getSheetByName(shName);
  var sNew=s.copyTo(ss).setName(newShName);
  return sNew;
}
function act(){
  var ss=SpreadsheetApp.getActive();
  var shName='город Москва-all-5pct выборка';
  var newShName='ourList_270916_010000';
  var sOurData=copySheetWithNewName(ss, shName,newShName);
}
function testScriptUrl(){
 Logger.log(ScriptApp.getService().getUrl());
}
/**
* Combines not equal elements of two arrays
* including empty elements
* @param {Array String[]}sFirst - First array
* @param {Array String[]}sSecond - Second array
@ return{Array String[]} combined array of non equal elements
*/
function combineElementsOfArrays(sFirst,sSecond) {
  var common=[];
  var notCommon=[];
  for(var il=0;il<sFirst.length;il++){
    for(var is=0;is<sSecond.length;is++){
      if(sFirst[il]==sSecond[is]){
        common.push(sSecond[is]);
        
      }
    }
  }  
  for(var is2=0;is2<sSecond.length;is2++){
    if( common.indexOf(sSecond[is2])<0){
      notCommon.push(sSecond[is2]);
    }
  }
  return sFirst.concat(notCommon);
}
/**
* Combines not equal elements of two arrays
* excluding empty elements
* @param {Array String[]}sFirst - First array
* @param {Array String[]}sSecond - Second array
@ return{Array String[]} combined array of non equal elements
*/
function combineElementsOfArraysWithoutEmpty(sFirst,sSecond) {
  var common=[];
  var notCommon=[];
  var s1NoEmpty=[];
  for(var il=0;il<sFirst.length;il++){
    for(var is=0;is<sSecond.length;is++){
      var s1=sFirst[il];
      var s2=sSecond[is];
      if(s1==s2){
        if(s1){
          common.push(s2);
        }        
      }
    }
  }  
  for(var is2=0;is2<sSecond.length;is2++){
    var ss2=sSecond[is2];
    if( common.indexOf(ss2)<0){
      if(ss2){
        notCommon.push(ss2);
      }
    }
  }
  for(var il1=0;il1<sFirst.length;il1++){
    if(sFirst[il1]){
      s1NoEmpty.push(sFirst[il1]);
    }
  }
      
  return s1NoEmpty.concat(notCommon);
}
/**
 * Excludes repeatted elements of the array
 * @param {Array []}arr - array of strings
 * @return {Array []} - cleared off repeatting elements
 */
function clearRepeat(arr){
  if(arr.length<2){
    return arr;
  }
  // does array has empty elements?
  var hasEmpty=false;
  var fake='';
  for( var i=0;i<arr.length;i++){
    if(!(arr[i])||(arr[i]===undefined)||arr[i]===''){
      hasEmpty=true;
      break;
    }
  }
  if( hasEmpty ){
    for(var ii=0;ii<arr.length;ii++){
     fake=fake.concat(arr[ii]);
    }
    for(var i1=0;i1<arr.length;i1++){
      if(!(arr[i1])||(arr[i1]===undefined)||arr[i1]==='') {
         arr[i1]=fake;
      }
    }
  }
  var norepeat=true;var shoot;
  while( norepeat){
    for(var i2=0;i2<arr.length;i2++){
      shoot=false;
      var par=arr[i2];
      for( var j=parseInt(i2,10)+1;j<arr.length;j++){
        if( arr[j]==par ){
          arr.splice(j,1);
          shoot=true;
          break;
        }
      }
      if(shoot){
        break;
      }    
    }
    if(!shoot){
      norepeat=false;
    }
  }
  if( hasEmpty ){
  
    for(var iii=0;iii<arr.length;iii++){
      if( arr[iii]==fake){
         arr[iii]='';
      }
    }
  }
  
  return arr;
}
/**
 * normalizes phone number string
 * @param {string}phone - phone number as a string
 * @param {string}prefixOptional - prefix value ( "country" code )
 *   on default prefix is '7'
 * @param {boolean}plusOtional - if true plus sign is set before country code
 *   optional - default is false
 * @return {String|Boolean} - normalized value of phone number string 
 *   or Boolean false if phone is '' or too short for being normal
 */
function telNorm(phone,prefixOptional,plusOptional){
  phone=phone.toString();
  var pre=prefixOptional||"7";
  pre=pre.toString();
  var plus=plusOptional=plusOptional||false;
  var patt=/\D/g;
  var p8=/^8/;
  var p7=/^7/;
  phone=phone.replace(patt,'');
  if( p8.test(phone) ){
     if( pre !="8" ){
        phone=(phone.length==11)?phone.replace(p8,pre): ( (phone.length!=10)?false: pre+phone);
     }else{
        phone=(phone.length==11)? phone: ((phone.length!=10)?false: pre+phone);
     }
  }else if( p7.test(phone)){
     if( pre !="7" ){
        phone=(phone.length==11)?phone.replace(p7,pre): ( (phone.length!=10)?false: pre+phone);
     }else{ 
        phone=(phone.length==11)? phone: ((phone.length!=10)?false: pre+phone);
    }
  }else{
    phone=(phone.length==10)?pre+phone:false;
  }
return  (plus) ? (( (pre!="8")&&(phone) )? "+"+phone:phone):phone;  
}
/**
* normalizes phone numbers in input data set 
* normalizes phones in sheet named shNameSource in spreadsheet with ssIdSourse
* and inputs results into
* specified outColumnTarget of specified sheetNameTarget of ssIdTarget or
* into the same column of the inp sheet
* @param {String}ssIdSource - id of source spreadheet 
* @param {String}sheetNameSource - sheet's name of input sheet
* @param {String|Number}columnSourse - number of column contained phones or 
*   it's name if parameter is String
* @parma{String}prefixOpt - country code prefix. Optional default is 7.
* @param {Boolean}testOpt - defalut=true - test probe: writes results in new column 'phoneNormalizedTest'
*                          in target sheet; false - writes results in real columnn indicated
* @param {String|Number}columnTargetOpt - the column to put result in.Optional. Default is the source column
* @param {String}sheetNameTargetOpt - the name of target sheet. Optional. Default is sheetNameSource
* @param {String}ssIdTargetOpt - id of target spreadsheet.Optional default is ssIdSourse
*
*/
function normalizePhones(ssIdSource,sheetNameSource,columnSource,prefixOpt,testOpt,columnTargetOpt,sheetNameTargetOpt,ssIdTargetOpt){
  var ssIdS=ssIdSource;
  var shNS=sheetNameSource;
  var clS=columnSource;
  var pref=prefixOpt;
  var prefix=prefixOpt.toString()||7;
  var clT=columnTargetOpt||columnSource;
  var sheetNameTarget=sheetNameTargetOpt||sheetNameSource;
  var ssIdTarget=ssIdTargetOpt||ssIdSource;
  var test=(testOpt!==false)?true:false;
  // -- source sheet
  
  var ssS=SpreadsheetApp.openById(ssIdSource);
  var sS=ssS.getSheetByName(shNS);
  var nlastS=sS.getLastRow();
  var headerS=sS.getRange(1,1,1,sS.getLastColumn()).getValues()[0];
  
  // -- target sheet
  var shNT=sheetNameTarget;
  var ssT=SpreadsheetApp.openById(ssIdTarget);
  var sT=ssT.getSheetByName(shNT);
  var nlastT=sT.getLastRow();
  var headerT=sT.getRange(1,1,1,sT.getLastColumn()).getValues()[0];
  
  var nColPhS=( typeof(clS)==='string')?getColNumb(headerS,clS):clS;
  var phColSR=sS.getRange(1,nColPhS,nlastS);             // source phone column
  
  var phonesS=phColSR.getValues();   // incluning header cell
  var phnsNorm=[];var phStr;
  for( var i=1;i<nlastS;i++){
    var phone=phonesS[i][0];
    if( /[,]/.test(phone) ){
      // if cell containes few coma separated phones
      phStr='';
      var phns=phone.split(",");
      for( var ip in phns){
        phStr+= (ip>0)? ","+telNorm(phns[ip],pref) : telNorm(phns[ip],pref) ;
      }
    }else{
       phStr=telNorm(phone,pref);
    }
    phStr=(phStr)?phStr:'';
    phnsNorm.push([phStr]);
  }
  if(!test){
    // place to insert normalized phones numbers
    var nColPhT=( typeof(clT)==='string')?getColNumb(headerT,clT):clT;
    sT.getRange(2,nColPhT,nlastS-1).setValues(phnsNorm);
  }else{
    // Test mode To exclude unexpected data damage  creates new column after the most right column of target sheet
    var lastC=sT.getLastColumn();
    sT.insertColumnAfter(lastC);
    sT.getRange(1,lastC+1).setValue([["phoneNormalizedTest"]]);    // Header
    var phColTestRange=sT.getRange(2,lastC+1,nlastS-1);   // Column range
    phColTestRange.setValues(phnsNorm);
  }
}
/**
* replacement of array.joint method wich occasionally does not work
* @param {Array.<string>|string}arr - array
* @param {string}connector - connector string to insirt between array's elements' strings
* @return {string} array's elements jointed into a string separated by connector
*/
function jointArr(arr,connector){
  if( typeof arr ==='string'){return arr;}
  var str='';
  for(var i=0;i<arr.length;i++){
    if(arr[i]){
      str+=(i==0)?arr[i]:connector+arr[i];
    }
  }
  return str;
}
/**
* flip-flops first letter's case of name string and adds suffix
* in camel like format
* @param {string}name - name to transform
* @param {string}suffix  optional suffix
* @return {string} transformed name + suffix string in camel-like format
*/
var flipFlop=function(name,suffixOpt){
  var suffix=suffixOpt||'';
  var pttUppCh = /(^[A-Z]|[А-Я]){1}/;
  var pttLowCh = /(^[a-z]|[а-я]){1}/;    
  if (pttUppCh.test(name)) {
    name = name.charAt(0).toLowerCase() + name.slice(1);
  } else if (pttLowCh.test(name)) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  } 
  if(suffix){
    suffix=(pttLowCh.test(suffix))? (suffix.charAt(0).toUpperCase() + suffix.slice(1)):suffix;
  }
  return name+suffix;
};
function test6(){
 var a=[1,'',3,9,1,6,'',6,6,6,'',6,9];
 
  var c=[];
  c=c.concat(a);
 var b=clearRepeat(c);
  Logger.log('finish');
}
function test5(){  
  
  var a1=[1,2,3,4,5,'s6','f7',1,2];
  a1=[1,2,'',3,4];
  var a2=[3,2,1,101,12,23,'ff','e'];
  a2=[7,4,6,5];
  
  var res= combineElementsOfArrays(a1,a2);
  var res1=combineElementsOfArraysWithoutEmpty(a1,a2);
  Logger.log('finish');
}
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx80