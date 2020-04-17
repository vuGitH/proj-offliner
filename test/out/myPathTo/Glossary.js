ID_ANALYSIS_FOLDER='0B9mOESHtO2LXM1BGeGZhQ1VOVkU';
ID_DOCS_FOLDER='0B9mOESHtO2LXSmlYQzlsRV92LUk';
ID_GLOSSARY='13zc5Xaid7crD3MxqSexKvtHODZh02f9tbCjDzqs2ZU8';     //  dataGlossaryAndGroups in smsCID_Analysis folder
var glossaryParameters={
  label:'glossaryTest',
  definition:'Тестирование доступа к Глоссарию.',
  essType:'ess',
  pCreator:Session.getActiveUser().getEmail(),
  pFirstDate:'04/10/2016',
  dataSrcType:'GOOGLE SHEETS',
  dataSrcTMark:'041016_',
  dataSrcId:ID_GLOSSARY,
  dataShName:'dataGroups',
  dataShHeadInd:1,
  parentFolderId:ID_ANALYSIS_FOLDER,
  docId:'',
  docFolderId:ID_DOCS_FOLDER,
  isInSet:'glossary'
};
// Glossary object
//Pel.glossary={};
var Glossary=PEleCom.addFamily('glossary');
Glossary.im='glossary';        // I'm - "I am"
Glossary.ssId=ID_GLOSSARY;     //ID_GLOSSARY  dataGlossaryAndGroups
Glossary.shName= 'dataGroups';
Glossary.parentFolderId=ID_ANALYSIS_FOLDER;           // smsCIK_Analysis
Glossary.glossaryInitParameters=glossaryParameters; //
Glossary.data=SpreadsheetApp.openById(ID_GLOSSARY).getSheetByName(Glossary.shName).getDataRange().getValues();
// data source selectors block
// data selectors
// !!! dataSrcTypes and dataShHeadId are excluded from dataSrc properties convention.
//     so they would not have multiple csv-string format values. Only one and fixed.(see bellow commented line)
var dSrcSels=
    ['dataSrcTMark','dataSrcId','dataShName','dataSrcUrl','parentFolderId','dTStamp'];
//['dataSrcType','dataSrcTMark','dataSrcId','dataShName','dataShHeadInd','dataSrcUrl','parentFolderId','dTStamp'];
// some accessorial object used in calculaiton for initial filling
// data source selector objects' objects, see for loop bellow
var dSrcEmpts={};
var dSrcPrevs={};
var dSrcSelPttStr="";    // pattern of all data selectors
for(var isel=0;isel<dSrcSels.length;isel++){
  dSrcEmpts[dSrcSels[isel]]='""';
  dSrcPrevs[dSrcSels[isel]]="=";
  dSrcSelPttStr+=(isel==0)?"("+dSrcSels[isel]:
  ((isel==(dSrcSels.length-1))?"|"+dSrcSels[isel]+")":"|"+dSrcSels[isel]);
}
var dSrcPtts=new RegExp(dSrcSelPttStr);
Glossary.dSrcSels=dSrcSels;
Glossary.dSrcEmpts=dSrcEmpts;
Glossary.dSrcPrevs=dSrcPrevs;
Glossary.dSrcPtts=dSrcPtts;
var hasSrc={}; // "has-dataSrc-properties-check" for each individual group mentioned in params objects array
/**
* checks if param object has data source properties
* @param {Object}param - object with properties containing selectors values to input
* @param {Boolean} true if among adding properties dataSrc-properties are available
*/
Glossary.availSrcProp=function(param){
  for(var ip in param){
    if(dSrcPtts.test(ip)){
      return true;
    }
  }
  return false;
};
/**
 * registers Glossary
 */
function registerGlossary(){
Glossary.addLines(glossaryParameters);
}
/**
* modifies ('masking') format of data Source's properties for a group's 
* cells data of Glossary and param-object in accordance with
* 'masking' convention (see description for addLines method)
* @param {Object}param - object of setting values for a group that are
*   going to be written into Glossary be means of Glossary.addLines() method
* @param {Object}param - object of assigning properties for a group whose 
*   data are input into Glossary data sheet
* @param {Array}grData - actual group's property as array of values containing in
*   row contained group's data in Glossary sheet.
*   If group's data are located in a row with index ir and dataGloss is 2d-array
*   of glossary data, than grData=dataGloss[ir]
* @return {Object} afterFormatting 'masked' object {param,grData}
*/
Glossary.maskGrDSrcProps=function(param,grData){
  var iHeader=parseInt(PEleCom.inpData.sets.glossary.dataShHeadInd,10);
  var headGloss=PEleCom.inpData.sets.glossary.data[iHeader];
  var jsH=PEleCom.handle.jObj(headGloss);
  var jdTM=parseInt(jsH.dataSrcTMark,10);
  // data selectors
  var dSrcSels=Glossary.dSrcSels;
  var v,sel,jdsel;
  if(!param.dataSrcTMark){
    param.dataSrcTMark=PEleCom.output.timeMark;
  }
  // adds data source time Stamp
  // a trick to exclude coinsidence of tStamp values of
  // consecutive records
  Utilities.sleep(1);
  param.dTStamp=new Date().getTime().toString();
  // data source's selector cells formatting
  for(var ids=0;ids<dSrcSels.length;ids++){
    sel=dSrcSels[ids];
    jdsel=parseInt( jsH[sel],10);
    v=grData[jdsel];
    v=(typeof v!=='string')?v.toString():v;
    if(!v){
      if(param[sel]){
        // filling yet empty  data selector
        if(grData[jdTM]){
          var fewVersions=/[,]/.test(grData[jdTM]);
          //  number of dataSrc selectors existing versions
          var nVPrev=(fewVersions)? grData[jdTM].match(/[,]/g).length+1:1;
          var strTemp='';
          for(var itm=1;itm<nVPrev;itm++){
            strTemp+=",=";
          }
          grData[jdsel]=strTemp;
          if(nVPrev==1){
            param[sel]=','+param[sel];
          }
        }else{
          // first version of data source' selectors for group
          if(!param.dataSrcTMark){
            param.dataSrcTMark=PEleCom.output.timeMark;
          }
        }
      }
    }else{
      if(param[sel]){
        //
        var vTrim=v.replace(/([,][=])+$/,'');
        var lastVerV=vTrim.split(',').slice(-1)[0];
        if((typeof param[sel]==='string')&&(param[sel]===lastVerV)){
          param[sel]='=';
        }
      }else{
        // par[sel] is not set
        param[sel]='=';
      }
    }
  }
  return {
    param:param,
    grData:grData};
};
/**
* Modifies values of existing lines in accordance with
* values of addingToExisting array
* @param {Array.<Array>}dataGloss - actual data of Glossary sheet
* @param {Array.<Object>}addingToExisting - array of arrays appropriate 
*   to modifying dataGloss rows. Each modifying row array containes 
*    has lendth of dataGloss header and values 
*   appropriate ot columns cells values or empty. If cell value
*   is not empty it's new value for appropriate selector column of 
*   dataGloss
* @example 
*   addingToExisting=[
		[index0,..,grLabel0,...,selectorNValue'],
		[...]
	]
* @param {Object}hasSrc - object showing if group with specified grLabel
*   has not empty data sources properties. Names of this object properties
*   coinside with grLabels. Each such groups has appropeiate alias in 
*   addingToExisting and Boolean value {grLabel:<Boolean>}
* @return {Array.<Array>} modified dataGloss array
*/
Glossary.modifyDataGloss=function(dataGloss,addingToExisting,hasSrc){
  var iHeader=parseInt(PEleCom.inpData.sets.glossary.dataShHeadInd,10);
  var ilIni=iHeader+1;
  var headGloss=dataGloss[iHeader];
  var jsH=PEleCom.handle.jObj(headGloss);
  var jIndex=parseInt(jsH.index,10);
  var jdStmp=parseInt(jsH.dTStamp,10);
  var jLabel=parseInt(jsH.label,10);
  var dSrcPtts=Glossary.dSrcPtts;
  // adds to existing groups
  var cellVal,irow,v;
  for( var ie=0;ie<addingToExisting.length;ie++){
	// inputs in existed lines. Modifies dataGloss array
	irow=addingToExisting[ie][jIndex]+iHeader;
	// horizontal filling by header indices
	
	for( var jv=0;jv<addingToExisting[ie].length;jv++ ){
	  v=dataGloss[irow][jv];

	  v=(typeof v!=='string')?v.toString():v;
	  if( (jv!=jIndex)&&(jv!=jLabel)&&(jv!=parseInt(jsH.essType,10))){
		if( !(v)&&(v!=='0')&&(v!==0)){
		  // fills yet empty
		  if( (addingToExisting[ie][jv])&&(addingToExisting[ie][jv]!=='0')&&(addingToExisting[ie][jv]!==0) ){
			cellVal=addingToExisting[ie][jv];
			if( headGloss[jv]=='dataSrcType'){
			  Logger.log('test');
			}
			dataGloss[irow][jv]=addingToExisting[ie][jv];
		  }
		}else{
		  var existedAsArr=( /[,]/.test(v))?v.split(','):[v];
		  var addingAsArr=( /[,]/.test(addingToExisting[ie][jv]))?addingToExisting[ie][jv].split(','):[addingToExisting[ie][jv]];
		  var glossColName=headGloss[jv];
		  var newValAsArr;
		  if( (!dSrcPtts.test(headGloss[jv]))&&(jv!=jdStmp) ){
			// not data source parameters (includes only unique values; first array's elements first)
			newValAsArr=combineElementsOfArraysWithoutEmpty(existedAsArr,addingAsArr);
			cellVal=newValAsArr.toString();
			dataGloss[irow][jv]=cellVal;
		  }else{
			if(hasSrc[addingToExisting[ie][jLabel]]){
			// data source parameters(selectors) input
			  newValAsArr=existedAsArr.concat(addingAsArr);
			  cellVal=newValAsArr.toString();
			  dataGloss[irow][jv]=cellVal;
			}
		  }
		}
	  }
	}
  }
  return dataGloss;
};
/**
 * adds line into GlossaryData spreadsheet
 * @param {Object}parameters - object contained parameters to fill in Glossary list in format
 * @example
 *   parameters={param1Name:value1,param2Name:value2, ..., paramNName:valueN};
 *   // or
 *   parameters=[{param1Name:value1,param2Name:value2, ..., paramNName:valueN},
 *               {param1Name:value1,param2Name:value2, ..., paramNName:valueN};];
 *  each object should contain lable:grLabelValue (label of a group) among parameters for
 *  appropriate line identification
 * @return {Array Array[]} resultin g2d array of glossary data
 *
 * Конвенция для Версий селекторов источников данных
 * к Селекторам источников данных относятся:
 * dataSrcType	dataSrcTMark	dataSrcId	dataShName	dataShHeadInd	dataSrcUrl	parentFolderId dTStamp
 * исключены: dataSrcType and dataShHeadInd.
 * dataSrcType не может иметь версий, т.е определяется равным значению первой версии
 * dataShHeadInd традиционно неизменен
 * Каждый селектор может быть, либо единственным, либо множественным значением,
 * синхронизированным с dataSrcTMark и/или dTStamp, и записывается в виде csv-string 
 * (tuple - строковые значения версий, разделенные запятыми)
 * Синхронизация означает, что каждый селектор содержит столько версий, сколько 
 * свойство dataSrcTMark, dTStamp. Каждая версия селектора источника данных может:
 * - либо иметь значение,
 * - либо быть неопределенным (пустая ячейка в таблице),
 * - либо иметь значение "=" что означает, что значение равно первому 
 8   предшествующему(левому), не равному '='
 * т.е., либо имеющему значение, либо пустому
 * Количество версий имеющих значение селекторов источника одинаково и они представлены в таблице
 * в виде csv-строки. Т.е. строка значений версий,разделенных запятыми.
 * Если какой-то селектор ни разу не заполнялся( имел пустое значение), но при этом другие
 * селекторы имеют несколько версий, то при первом присваивании ему значения,
 * это значение считается значением последней определенной версии и при этом  должны быть
 * определены и предыдущие пустые значения в виде - превая порядковая версия - пустая строка "",
 * оставльные знаки равно '='
 * Пример: было -
 *  dataSrcId:"id0,id1,id2"; dataSrcTMark:"tM0,tM1,tM2"; dataShName: ;
 * Вводится значение dataShName=dSN2,которое было не определено. Тогда теперь будем иметь:
 *  dataSrcId   :"id0,id1,id2";
 *  dataSrcTMark:"tM0,tM1,tM2";
 *  dataShName  :" '', = ,dSN2;
 * Если же вводится не единственное значение dSN, но при этом и
 * добавляется версия уже имющегося dataSrcId( т.е. четвертого), тогда имеем
 *  dataSrcId   :"id0,id1,id2,id3";
 *  dataSrcTMark:"tM0,tM1,tM2,=";
 *  dataShName  :"'' , = , = ,dSN3"
 * т.е. для dataSrcId добавили новую версию, для dataSrcTMark новая версия равна предыдущей т.е. =
 * а для dataShName введено первое определенное значение, оно присваивается последней версии,
 * с индексом 3, все предыдущие версии вставляются перед ним через запятые равные =,
 * кроме самой первой( с индексом 0) являющимся пустой строкой ''. Соответственно полная csv строка
 * выглядит "'',=,=,dSN3"
 *
 * Explanation:
 * The goal is te get correct format of dataSrc - selectors (data source selectors),
 * in compliance with convention described above. By other words - we need
 * to have appropriate amounts of comas and equal marks, in accordance with
 * the situation. This compliance is caried out by means of appropriate
 * correction of param properties:
 * -- if some selector is not mentioned in param parameter (property param.selector is absent)
 * it's value is presumed to be equal to previous version's one. Therefore here
 * it's set to '=' and should be added over coma ',' to this parameter's csv-string
 * -- if some parameter has not been entered yet ever ( it's cell in the
 * glossary table is empty '',
 * The rule of how new dataSrc-selector value is formed  by addLine after adding new version value
 * is as follows:
 * newParamVersionsString=previousSelectorCSVString +','+param.selector
 */
Glossary.addLines=function(parameters){
  var isArr=( Array.isArray(parameters))?true:false;
  var params=(isArr)?parameters:[parameters];
  var ssGloss=SpreadsheetApp.openById(Glossary.ssId);
  var sGloss=ssGloss.getSheetByName(Glossary.shName);
  var dataGlossR=sGloss.getDataRange();
  var dataGloss=dataGlossR.getValues();
  var iHeader=parseInt(PEleCom.inpData.sets.glossary.dataShHeadInd,10);
  var ilIni=iHeader+1;
  var headGloss=dataGloss[iHeader];
  var jsH=PEleCom.handle.jObj(headGloss);
  var jIndex=parseInt(jsH.index,10);
  var jLabel=parseInt(jsH.label,10);
  var jdTM=parseInt(jsH.dataSrcTMark,10);
  var jdStmp=parseInt(jsH.dTStamp,10);
  var jdType=parseInt(jsH.dataSrcType,10);
   //sorts glossary by index-column
  var lastRow=sGloss.getLastRow();
  var lastCol=sGloss.getLastColumn();
  sGloss.getRange(iHeader+2,1,lastRow-(iHeader+1),lastCol).sort(jIndex+1);
  // max value of index existed  (number of groups' lines)
  var nextIndex=lastRow-(iHeader+1);
  // "has-dataSrc-properties-check" for each individual group mentioned in params objects array
  var hasSrc={};

  var range=[]; // array of appending rows to add to dataGloss if new groups are added
  var addingToExisting=[];  // modified existing rows in one array
  var groupExists,hasSrcProps,v,pLabel,iL;
  
  for( var i=0;i<params.length;i++){
    var param=params[i];
    pLabel=param.label;
	if(!pLabel){
      throw 'inputting data have no .label property but has to !';
    }
    hasSrcProps=Glossary.availSrcProp(param);
    // Checks if a group already exists
    groupExists=false;
    var lineValues=[];
    for(var jpl in headGloss){
      lineValues.push('');
    }
	// checks group's existance    
    for(var il=ilIni; il<dataGloss.length;il++){      
      if( pLabel==dataGloss[il][jLabel]){
		groupExists=true;
        iL=il;        // index of existed line
        break;
      }
	}	
	if( !groupExists ){
	  // new group
      // prepares of extra range array for new lines.
      // increases last index by one taking into account that header has 2 lines
      // and group ordered index begins with 1
      nextIndex++;
      if( hasSrcProps ){
        if(!param.dataSrcTMark){
          param.dataSrcTMark=PEleCom.output.timeMark;
        }
        param.dTStamp=new Date().getTime().toString();
      }
      for( var iprm in param){
        if( jsH[iprm]){
          lineValues[ parseInt(jsH[iprm],10) ]=param[iprm];
        }
      }
      lineValues[ jIndex ]=nextIndex;
      range.push( lineValues );
    }else{
	  // -- EXISTING group already exists
      if( hasSrcProps ){			
		var o=Glossary.maskGrDSrcProps(param,dataGloss[iL]);
		// after conventional formatting data source's properties 
		param=o.param;
		dataGloss[iL]=o.grData;
		hasSrc[pLabel]=true;  // param has dataSrcSelectors
	  }
      for( var ip in param){
        if( jsH[ip]){
          lineValues[ parseInt(jsH[ip],10) ]= param[ip];
        }
      }        
      lineValues[ jIndex ]=iL-iHeader;
      addingToExisting.push(lineValues);
    }
  }  
  // changes glossary sheet data
  if( addingToExisting.length>0){
	dataGloss=Glossary.modifyDataGloss(dataGloss,addingToExisting,hasSrc);
    dataGlossR.setValues(dataGloss);
  }
  // adds new  block of lines if range array is not empty
  if((range.length)&&(range.length>0)){
    //changes data array in cash memory by  adding new rows
    dataGloss=dataGloss.concat(range);
    var d=PEleCom.inpData.sets.glossary.data;
    PEleCom.inpData.sets.glossary.data=d.concat(range);   
    if(range.length==1){
      sGloss.appendRow(range[0]);
    }else{
      sGloss.insertRowsAfter(lastRow,range.length);
      sGloss.getRange(lastRow+1,1,range.length,lastCol).setValues(range);
    }
  }
  //setting of column format
  sGloss.getRange(iHeader+2,parseInt(jsH.dTStamp,10)+1,sGloss.getMaxRows()-iHeader-1).setNumberFormat('@');
  //sGloss.getDataRange().setNumberFormat('@');
  return addingToExisting.concat(range);
};
// -- TESTS --
function testGlossaryAddLineD(){
  /*
  var glossaryParameters={
    label:'glossaryTestSet',
    definition:'Тестирование доступа к Глоссарию.',
    essType:'ess',
    pCreator:Session.getActiveUser().getEmail(),
    pFirstDate:'04/10/2016',
    dataSrcType:'GOOGLE SHEETS',
    dataSrcTMark:'041016_',
    dataSrcId:'13zc5Xaid7crD3MxqSexKvtHODZh02f9tbCjDzqs2ZU8',
    dataShName:'dataGroups',
    dataShHeadInd:1,
    parentFolderId:ID_ANALYSIS_FOLDER,
    docId:'',
    docFolderId:ID_DOCS_FOLDER,
    isInSet:'glossary'
  };

  Glossary.addLines(glossaryParameters);
  glossaryParameters.label='glossTestSetD';
  Glossary.addLines(glossaryParameters);

  return;
  */
  var gl=Glossary;
  var params=[{bgColor:"#fff,#ff0,#f06",label:'testWriting',name:'test1',inpSrcId:'id',essType:'test'},
              {bgColor:"#fff,#ff0,#f05",label:'testWriting1',name:'test2',dataSrcId:'id1',essType:'test'},  //test2 dsrc-call
              {bgColor:"#fff,#ff0,#f00",label:'testWriting2',name:'test3',dataSrcId:'id2',essType:'test'}];
 // params=[];params=[{bgColor:"#fff,#ff0,#f00",label:'testWriting',name:'test1',inpSrcId:'id',essType:'test'}];

  Glossary.addLines(params);
  if(1){
    params=[];params=[{label:'testWriting',name:'test1',dataSrcType:'GOOGLE_SHEETS'},
              {label:'testWriting1',name:'test2',dataSrcType:'GOOGLE_SHEETS'},
              {label:'testWriting2',name:'test3',dataSrcType:'GOOGLE_SHEETS'}];
  Glossary.addLines(params);

  }
  params=[];
  params={bgColor:"#fff,#ff1,#f01",label:'testWriting',name:'test1',dataSrcId:'id54',essType:'test'};  //test1 dsrc-call
  Glossary.addLines(params);
  params=[];params={bgColor:"#fff,#ff1,#f01",label:'testWriting',name:'test1',dataSrcId:'id654',essType:'test'};  //test1 dsrc-call
  Glossary.addLines(params);
    params=[];params={bgColor:"#fff,#ff1,#f01",label:'testWriting1',name:'test2',dataSrcId:'id654',essType:'test'};  //test2 dsrc-call
  Glossary.addLines(params);

  params=[];params={bgColor:"#fff,#ff1,#f01",label:'testWriting',name:'test1',dataSrcId:'id54',essType:'test'};  //test1 dsrc-call
  Glossary.addLines(params);

  params=[];params={bgColor:"#fff,#ff1,#f01",label:'testWriting',name:'test1',dataSrcId:'id54',essType:'test'};  //test1 dsrc-call
  Glossary.addLines(params);

  params=[{bgColor:"#fff,#ff0,#f06",label:'testWriting',name:'test1',dataShName:'testSheet',essType:'test'},  //test1 dsrc-call
          {bgColor:"#fff,#ff0,#f05",label:'testWriting1',name:'test2',dataShName:'testSheet1',essType:'test'},   //test2 dsrc-call
          {bgColor:"#fff,#ff0,#f00",label:'testWriting2',name:'test3',dataShName:'testSheet2',essType:'test'}];
  gl.addLines(params);
  if(1){
  params=[{label:'testWriting',name:'test1',dataSrcType:'GOOGLE_SHEETS'},
         {label:'testWriting1',name:'test2',dataSrcType:'GOOGLE_SHEETS'},
         {label:'testWriting2',name:'test3',dataSrcType:'GOOGLE_SHEETS'}];
  Glossary.addLines(params);
  }
  Logger.log('after addLineTest');
}
function testRE(){
  var dSrcSels=
      ['dataSrcType','dataSrcTMark','dataSrcId','dataShName','dataShHeadInd','dataSrcUrl','parentFolderId'];
  var dSrcEmpts={};
  var dSrcPrevs={};
  var dSrcSelPttStr="";
  for(var isel=0;isel<dSrcSels.length;isel++){
    dSrcEmpts[dSrcSels[isel]]='""';
    dSrcPrevs[dSrcSels[isel]]="=";
    dSrcSelPttStr+=(isel==0)?"("+dSrcSels[isel]:
    ((isel==(dSrcSels.length-1))?"|"+dSrcSels[isel]+")":"|"+dSrcSels[isel]);
  }
  var dSrcPtts=new RegExp(dSrcSelPttStr);
  for(var i=0;i<dSrcSels.length;i++){
    Logger.log('str %s test=%s',dSrcSels[i],dSrcPtts.test(dSrcSels[i]));
  }
  Logger.log(dSrcPtts);
}
/**
* Test different empty cells
*/
function testEmpties(){

  var ss=SpreadsheetApp.create('testEmpties');
  var s=ss.insertSheet('emptyCells');
  var shs=ss.getSheets();
  for(var i=0;i<shs.length;i++){
    if( shs[i].getName()!='emptyCells'){
      ss.deleteSheet(shs[i]);
    }
  }
  var data=[["",'"="',0],[',=,=',",=,4",'a,=,b'],[1,undefined,null],[1,2,3]];
  s.getRange(1,1,data.length,data[0].length).setValues(data);

  var folderId='0B9mOESHtO2LXM1BGeGZhQ1VOVkU'; // smsCIK_Analysis
  var rootfld=DriveApp.getRootFolder();
  var fld=DriveApp.getFolderById(folderId);
  fld.addFile(DriveApp.getFileById(ss.getId()));
  rootfld.removeFile(DriveApp.getFileById(ss.getId()));

  var d=s.getDataRange().getValues();
  var inst=function(v){
    return (v instanceof Number)?
      'number':(( v instanceof String)?
                ((v==='')?'emptyString':'string'):((v===null)?
      'null':((v===undefined)?
      'undefined':'v='+v)));
  };
 /*
  for(var i=0;i<d.length;i++){
    for(var j=0;j<d[i].length;j++){
      var v=d[i][j];
      Logger.log('i= %s j= %s value= %s\ncell data has typeof= %s \nis instanceof= %s'
               ,i,j,v,typeof v, inst(v));
    }
  }
  */

  var d1=new Array(5);
  Logger.log( 'is d1 Array ? - '+Array.isArray(d1));
  for(var i1=0;i1<d1.length;i1++){
    var line;
	if( i1==0 || i1==d1.length-1){
      line=[1,1,1,1,1];
    }else{
      line=new Array(5);
    }
    d1[i1]=line;
    for(var j1=0;j1<d1[i1].length;j1++){
      if( d1[i1][j1]===undefined){
        Logger.log('undefined');
        d1[i1][j1]='';
      }else if(d1[i1][j1]===null){
        Logger.log('null');

      }else if( d1[i1][j1]===''){
        Logger.log('empty string');
      }else{
        Logger.log('other');
      }
    }

  }

  Logger.log( 'is d1 Array ? - '+Array.isArray(d1));
  Logger.log('length of arr d1=%s, length of d1[0]=%s',d1.length,d1[0].length);
  s.getRange(10,1,d1.length,d1[0].length).setValues(d1);
  Logger.log('fin');



}
function testGloss(){
  var gl=Glossary;
  var id=gl.ssId;
  var pel=PEleCom;
  var glossary=pel.glossary;
  
  
  Logger.log(id);
  Logger.log('fin');
}