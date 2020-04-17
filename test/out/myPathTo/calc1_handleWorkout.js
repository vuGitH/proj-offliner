/**
 * ciked-notCiked analisys 
 * There are two separated samples
 *        1. smsCiked - contacts whose data has been received by sms-cik
 *        2. ours      - contacts considered by us
 *               ours are devided between
 *              2.0     - not considered   0-turn  White
 *              2.1     - selected for handling 1,2,3,4 - turns
 *                 which include
 *              2.1.0     - not were attempted(tried,estimated) (have not been covered by our activity due to time or forth shortage)
 *              
 *              2.1.1     - were tried(attempted)
 *                          Among selected & were attempted:
 *              2.1.1.0   - Red   ( disabled to participate due to some reason )
 *              2.1.1.1   - Yellow ( contact failed, not answered to us, not reached by us)
 *              
 *              2.1.1.2   - Green ( reached & promised to smsCik )
 *              2.1.1.3   - Blue  ( reached & asked to deliver them instruction or help
 *              
 *              2.3  ours ciked-notCiked are shared between groops:
 *              
 *              2.3.1 -     ourCiked      Magenta
 *              2.3.2 -     ourNotCiked   Orange
 *
 *              2.3.2.1 -     toBeSmsed   Pink
 *              2.3.2.2 -     toBeCalled  Brown
 *              2.3.2.3 -     toBeMailed  BrightBlue           smsCikMail
 *
 *
 *            Dima Nesterov fixing/confirmation
 */
// -- run's Specific terms
/*

var unMist=output.runSpecs.specs.unMist.use;
var useSmsSite=output.runSpecs.specs.useSmsSite;
*/

/**
 * Elaborates input sets
 * @param{Array Strings[]}inpSetsNames - array of input sets' names
 */
handle.workout=function(ID_OUR,ID_SMS_CIK,turnIni,turnMax){
  // -- run Specific
var unMist=output.runSpecs.specs.unMist.use;  var jMistCheck;
var useSmsSite=output.runSpecs.specs.useSmsSite;
  if(useSmsSite.use){
    useSmsSite.telColName='телефон';
    //useSmsSite.ini("19jPrzHPub6q2IsMcakc-VVwELKV0yGgn2ATRHmPL0UI","our_vs_smsSite_071016_202248");
    useSmsSite.ini("19jPrzHPub6q2IsMcakc-VVwELKV0yGgn2ATRHmPL0UI","sms_vs_smsSite_071016_202248");
  }
  var sets=PEleCom.inpData.sets;
  var idOurData=ID_OUR||sets.our.dataSrcId;
  var idSmsCik=ID_SMS_CIK||sets.smsCik.dataSrcId;
  var tIni=turnIni||1;
  var tMax=turnMax||4;
  var ss=SpreadsheetApp.openById(idOurData);
  var ssSmsCik=SpreadsheetApp.openById(idSmsCik);
  var sSmsCikNm=sets.smsCik.dataShName;              // global param
  var sSmsCik=ssSmsCik.getSheetByName(sSmsCikNm);
  var smsCikData=sSmsCik.getDataRange().getValues();
  var smsCikHead=smsCikData[0];
  var jSmsCikTelCol=(!useSmsSite.use)?2:(useSmsSite.telCol-1);
  var smsCikHeader=['name','uik','number'];  
  var resHead=['No','uik','turn','family','Name','tel','email','oik','place','comment'];
  var resHeadRu=['номер','уик','очередь','фамилия','имя','телефон','e-mail','оик','район', 'примечание'];
  /* 
   * Вообще говоря, по номру телефона и уику человек идентифицируется из нашей базы однозначно,
   * поэтому, возможно, для сокращения времени обработки, можно ограничить обрабатываемые поля до
   * ["номер-код человека"," телефон", "уик"]. 'номер-код' из нашей базы, это уже однозначная идентификация, но
   * для подстраховки будет двойной контроль. Остальные параметры - легко вычисляемые в off-line
   */
  var bgClRed="#ff0000";           // Red
  var bgClGrn="#6aa84f";         // Green
  var bgClBlu="#3c78d8";          // Blue
  var bgClYel="#ffd966";        // Yellow
  var bgClWht="#ffffff";         // White
  var bgClMgn="#ff00ff";       // Magenta
  var bgClOrn="#ff9900";        // Orange
  var bgClPnk="#ff0080";          // Pink
  var bgClBrn="##c77d30";        // Brown
  var bgClHasDubler="#f3f3f3";   //  grey   contact has dubler on the vote point
  // prepares workout parameters
  var grps=output.dataGroups;
  var groups=grps.groups;
  var grNames=grps.names;
  for(var ig=0;ig<grNames.length;ig++){
    var gr=grps[grNames[ig]];
    var group=groups[ig];
    gr.nMembs=0;
    group.nMembs=0;
    gr.data=[];
    group.data=[];
  }
  // -- form our selected sample turns 1-4
  var ourHeadStr='место|оик|район|№ УИК|очередь|Адрес помещения для голосования|u_votrs|Адрес УИК|фамилия|имя|телефон|e-mail|координатор|телефон координатора|Примечания';
  var ourHead=ourHeadStr.split('|');
  var jplace=getColNumb(ourHead,'место')-1;
  var joik=getColNumb(ourHead,'оик')-1;
  var juik=getColNumb(ourHead,'№ УИК')-1;
  var jturn=getColNumb(ourHead,'очередь')-1;
  var jfmly=getColNumb(ourHead,'фамилия')-1;
  var jname=getColNumb(ourHead,'имя')-1;
  var jtel=getColNumb(ourHead,'телефон')-1;
  var jmail=getColNumb(ourHead,'e-mail')-1;
  var jreg=getColNumb(ourHead,'район')-1;
  var jcmnt=getColNumb(ourHead,'Примечания')-1;
  var needHead=true;
  var itInit=1;
  var itFin=4;    
  for( var it=itInit;it<itFin+1;it++){
    var strnNm="turn"+it;
    var strn=ss.getSheetByName(strnNm);
    var strnDataR=strn.getDataRange();
    var strnDataV=strnDataR.getValues();
    var icInit=(it==itInit)?0:1;
    var bgtrn=strnDataR.getBackgrounds();
    // -- runSpecParams
    if( unMist ){
      jMistCheck=getColNumb ( strnDataV[0] ,'Примечания')-1;
    }
    for( var ic=icInit;ic<strnDataV.length;ic++){      
      if( (ic==0) && (needHead===true) ){
        needHead=false;
        /* headers:['номер','уик','очередь','фамилия','имя','телефон','e-mail','оик','район', 'примечание']*/
        for(var igr=0;igr<grps.names.length;igr++){
          grps[grps.names[igr]].data.push(resHeadRu);
        }
        /*
        selectd.push(resHeadRu);tried.push(resHeadRu);agreed.push(resHeadRu);needHlp.push(resHeadRu);notReachd.push(resHeadRu);disabld.push(resHeadRu);notTried.push(resHeadRu);
        selectdCKD.push(resHeadRu);triedCKD.push(resHeadRu);agreedCKD.push(resHeadRu);needHlpCKD.push(resHeadRu);notReachdCKD.push(resHeadRu);disabldCKD.push(resHeadRu);notTriedCKD.push(resHeadRu);
        selectdNCKD.push(resHeadRu);triedNCKD.push(resHeadRu);agreedNCKD.push(resHeadRu);needHlpNCKD.push(resHeadRu);notReachdNCKD.push(resHeadRu);disabldNCKD.push(resHeadRu);notTriedNCKD.push(resHeadRu);
        ciked.push(resHeadRu);notCiked.push(resHeadRu);beMailed.push(resHeadRu);beSmsed.push(resHeadRu);
        */
      }else{
        // -- runSpecifics takes into account here
        var specCut=false;
        if(unMist){
          specCut=( unMist&&(/мищенко/i.test(strnDataV[ic][jMistCheck])))?true:false;
        }
        if(!specCut){
          var toSms=(strnDataV[ic][jtel])?true:false;
          var toMail=(strnDataV[ic][jmail])?true:false;
          grps.preCSelectd.nMembs++;
          var arDRow=[ strnDataV[ic][juik],strnDataV[ic][jturn],strnDataV[ic][jfmly],strnDataV[ic][jname],strnDataV[ic][jtel],strnDataV[ic][jmail],strnDataV[ic][joik],strnDataV[ic][jreg],strnDataV[ic][jcmnt]];
          grps.preCSelectd.data.push( [grps.preCSelectd.nMembs].concat(arDRow) );
          // ciked or not ?
          var contCiked=false;
          for( var isc=1;isc<smsCikData.length;isc++){
            if( smsCikData[isc][jSmsCikTelCol]==strnDataV[ic][jtel]){
              contCiked=true;
            }
          }
          if(contCiked){
            grps.preCSelectdCKD.nMembs++;
            grps.preCSelectdCKD.data.push( [grps.preCSelectdCKD.nMembs].concat(arDRow));
          }else{
            grps.preCSelectdNCKD.nMembs++;
            grps.preCSelectdNCKD.data.push( [grps.preCSelectdNCKD.nMembs].concat(arDRow));
          }
          if( bgtrn[ic][jname]==bgClGrn ){
            // --  Green --
            grps.preCAgreed.nMembs++;
            grps.preCAgreed.data.push( [grps.preCAgreed.nMembs].concat(arDRow));
            grps.preCTried.nMembs++;
            grps.preCTried.data.push([grps.preCTried.nMembs].concat(arDRow));
            if(contCiked){
              grps.preCAgreedCKD.nMembs++;
              grps.preCAgreedCKD.data.push( [grps.preCAgreedCKD.nMembs].concat(arDRow));
              grps.preCTriedCKD.nMembs++;
              grps.preCTriedCKD.data.push([grps.preCTriedCKD.nMembs].concat(arDRow));
            }else{
              grps.preCAgreedNCKD.nMembs++;
              grps.preCAgreedNCKD.data.push( [grps.preCAgreedNCKD.nMembs].concat(arDRow));
              grps.preCTriedNCKD.nMembs++;
              grps.preCTriedNCKD.data.push([grps.preCTriedNCKD.nMembs].concat(arDRow));
            }
          }
          if( bgtrn[ic][jname]==bgClBlu ){
            // --  Blue --
            grps.preCNeedHlp.nMembs++;
            grps.preCNeedHlp.data.push( [grps.preCNeedHlp.nMembs].concat(arDRow));
            grps.preCTried.nMembs++;
            grps.preCTried.data.push([grps.preCTried.nMembs].concat(arDRow));
            if(contCiked){
              grps.preCNeedHlpCKD.nMembs++;
              grps.preCNeedHlpCKD.data.push( [grps.preCNeedHlpCKD.nMembs].concat(arDRow));
              grps.preCTriedCKD.nMembs++;
              grps.preCTriedCKD.data.push([grps.preCTriedCKD.nMembs].concat(arDRow));
            }else{
              grps.preCNeedHlpCKD.nMembs++;
              grps.preCNeedHlpCKD.data.push( [grps.preCNeedHlpCKD.nMembs].concat(arDRow));
              grps.preCTriedNCKD.nMembs++;
              grps.preCTriedNCKD.data.push([grps.preCTriedNCKD.nMembs].concat(arDRow));
            }
          }
          if( bgtrn[ic][jname]==bgClYel){
            // --  Yellow --
            grps.preCNotReachd.nMembs++;
            grps.preCNotReachd.data.push( [grps.preCNotReachd.nMembs].concat(arDRow));
            grps.preCTried.nMembs++;
            grps.preCTried.data.push([grps.preCTried.nMembs].concat(arDRow));
            if(contCiked){
              grps.preCNotReachdCKD.nMembs++;
              grps.preCNotReachdCKD.data.push( [grps.preCNotReachdCKD.nMembs].concat(arDRow));
              grps.preCTriedCKD.nMembs++;
              grps.preCTriedCKD.data.push([grps.preCTriedCKD.nMembs].concat(arDRow));
            }else{
              grps.preCNotReachdNCKD.nMembs++;
              grps.preCNotReachdNCKD.data.push( [grps.preCNotReachdNCKD.nMembs].concat(arDRow) );
              grps.preCTriedNCKD.nMembs++;
              grps.preCTriedNCKD.data.push([grps.preCTriedNCKD.nMembs].concat(arDRow));
            }
          }
          if( bgtrn[ic][jname]==bgClRed ){
            // --  Red --
            toSms=false;
            toMail=false;
            grps.preCDisabld.nMembs++;
            grps.preCDisabld.data.push( [grps.preCDisabld.nMembs].concat(arDRow));
            grps.preCTried.nMembs++;
            grps.preCTried.data.push([grps.preCTried.nMembs].concat(arDRow));
            if(contCiked){
              grps.preCDisabldCKD.nMembs++;
              grps.preCDisabldCKD.data.push( [grps.preCDisabldCKD.nMembs].concat(arDRow));
              grps.preCTriedCKD.nMembs++;
              grps.preCTriedCKD.data.push([grps.preCTriedCKD.nMembs].concat(arDRow));
            }else{
              grps.preCDisabldNCKD.nMembs++;
              grps.preCDisabldNCKD.data.push( [grps.preCDisabldNCKD.nMembs].concat(arDRow));
              grps.preCTriedNCKD.nMembs++;
              grps.preCTriedNCKD.data.push([grps.preCTriedNCKD.nMembs].concat(arDRow));
            }
          }
          if( (bgtrn[ic][jname]==bgClWht)||(bgtrn[ic][jname]==bgClHasDubler) ){
            // --  White and Dublers(grey) --
            grps.preCNotTried.nMembs++;
            grps.preCNotTried.data.push( [grps.preCNotTried.nMembs].concat(arDRow));
            if(contCiked){
              grps.preCNotTriedCKD.nMembs++;
              grps.preCNotTriedCKD.data.push( [grps.preCNotTriedCKD.nMembs].concat(arDRow) );
            }else{
              grps.preCNotTriedNCKD.nMembs++;
              grps.preCNotTriedNCKD.data.push( [grps.preCNotTriedNCKD.nMembs].concat(arDRow));
            }
          }
          if( toSms ){
            // --  toBeSmsed --
            grps.beSmsed.nMembs++;
            grps.beSmsed.data.push( [grps.beSmsed.nMembs].concat(arDRow));
          }
          if( toMail ){
            // --  toBeMailed --
            grps.beMailed.nMembs++;
            grps.beMailed.data.push( [grps.beMailed.nMembs].concat(arDRow));
          }
        }
      }
    }
  }
  var outp={grpoupsNumber:grps.number,
            groupsNames: grps.names,
            groupsData:[],
            fill:function(a,b,c){
               var grObj={};
               var bb=[b,c];
               grObj.add=function(a,bb){
                  this[a]=bb;
               };
               grObj.add(a,bb);
               return grObj;
            }
           };
   for( var i in grps.names){
     outp.groupsData.push(outp.fill(grps.names[i],grps[grps.names[i]].nMembs,grps[grps.names[i]].data));
   }
  /*
            groupsData:[
             {selectd:[nSelectd,selectd]},
             {tried:[nTried,tried]},
             {agreed:[nAgreed,agreed]},
             {needHlp:[nNeedHlp,needHlp]},
             {notReachd:[nNotReachd,notReachd]},
             {disabld:[nDisabld,disabld]},
             {notTried:[nNotTried,notTried]},             
             {selectdCKD:[nselectdCKD,selectdCKD]},
             {triedCKD:[nTriedCKD,triedCKD]},
             {agreedCKD:[nAgreedCKD,agreedCKD]},
             {needHlpCKD:[nNeedHlpCKD,needHlpCKD]},
             {notReachdCKD:[nNotReachdCKD,notReachdCKD]},
             {disabldCKD:[nDisabldCKD,disabldCKD]},
             {notTriedCKD:[nNotTriedCKD,notTriedCKD]},             
             {selectdNCKD:[nSelectdNCKD,selectdNCKD]},
             {triedNCKD:[nTriedNCKD,triedNCKD]},
             {agreedNCKD:[nAgreedNCKD,agreedNCKD]},
             {needHlpNCKD:[nNeedHlpNCKD,needHlpNCKD]},
             {notReachdNCKD:[nNotReachdNCKD,notReachdNCKD]},
             {disabldNCKD:[nDisabldNCKD,disabldNCKD]},
             {notTriedNCKD:[nNotTriedNCKD,notTriedNCKD]},             
             {ciked:[nCiked,ciked]},
             {notCiked:[nNotCiked,notCiked]},
             {beMailed:[nBeMailed,beMailed]},
             {beSmsed:[nBeSmsed,beSmsed]}
           ]
           };
   */        
  //Logger.log(outp); 
  return outp;           
};
/**
 * Handles Data handling arranges Results output
 * 
 */
function handlingRun(){
}
/* Data approptriated to tMark-run are put in appropriate folder
 * @return {object String[]}resSSIds - array of strings
 *                                    [nOfSprSheets, tmark, ResFoderID, [id1,id2, ...,idNofSprSheets]]
 *                                   
*/
function createOutputTables(){
  // -- run Specific
  var unMist=output.runSpecs.specs.unMist.use;
  var useSmsSite=output.runSpecs.specs.useSmsSite;
  //  
  // -- Result Spreadsheets Object Output
  var ssOut=output.setOneSpreadSheetForAll(tMark);
  
  var out=handle.workout();
  var grpNams=out.groupsNames;
  var grData=out.groupsData;
  
  var shs=ssOut.getSheets();
  var shNames=[];
  for(var ish=0;ish<shs.length;ish++){
    shNames.push(shs[ish].getName());
  }  
  
  for(var ig=0;ig<grpNams.length;ig++){
   var gn=grpNams[ig].trim();
   if(/electdCKD/.test(gn)){
     Logger.log(gn);
   }    
     
    var patt= new RegExp(gn);
    var sl=ssOut.getSheetByName('legend_'+tMark);
    var legR=sl.getRange(1,2,sl.getLastRow(),3);
        var legD=legR.getValues();
    for(var i=0;i<shNames.length;i++){
      if( patt.test(shNames[i] )){
        var s=ssOut.getSheetByName(gn+"_"+tMark);
        var data=grData[ig][gn][1];
        var nGr=grData[ig][gn][0];
        if(!(/iked/.test(s.getName()))){
          s.getRange(1,1,data.length,data[0].length).setValues(data);
        }        
        
        for(var il=11;il<legD.length;il++){
          if( patt.test(legD[il][0])){
             legD[il][1]=nGr;
            break;
          }
        }
        if(il==18){
          Logger.log(patt);
        }
        legR.setValues(legD); // input legend with 
      }
    }
  }
  // --- distributions by turns
  countTurnsAndUiks(ssOut.getId());  
}

function getInd(sheetsNames,grName){
  var patt=new ReExp(grName);
  for( var i=0;i<sheetsNames.length;i++){
    if( patt.test(sheetNames[i])) {
       return i;
    }
  }
}
/**
 * using data groups sheets obtained calculates contacts and uik distributions by turns
 * @param{string}ssId - the id of data spreadsheet
 */
function countTurnsAndUiks(ssId) {
  var unMist=output.runSpecs.specs.unMist.use;
  var useSmsSite=output.runSpecs.specs.useSmsSite;
  
  var ss=SpreadsheetApp.openById(ssId);
  var ssName=ss.getName();
  var patt=/\d{6}_\d{6}$/;
  var ini=ssName.search(patt);
  var timeMark=ssName.slice(ssName.search(patt));
  var tM="_"+timeMark;
  var odd=-1;
  // -- Legen sheet
  var sLegnd=ss.getSheetByName("legend"+tM);  
  // -- formating
  var nrow1gr=parseInt(output.lengengPartLength,10);
  sLegnd.getRange("c"+parseInt(nrow1gr-1,10)).setValue('очереди 1-4').setFontColor('#a61c00').setHorizontalAlignment('center');
  sLegnd.getRange("c"+parseInt(nrow1gr-2,10)).setValue("Контакты");
  sLegnd.getRange("h"+parseInt(nrow1gr-2,10)).setValue("УИКи");
  sLegnd.getRange("c"+parseInt(nrow1gr-2,10)+":g"+parseInt(nrow1gr-2,10)).mergeAcross().setHorizontalAlignment('center').setFontWeight('bold');
  sLegnd.getRange("h"+parseInt(nrow1gr-2,10)+":k"+parseInt(nrow1gr-2,10)).mergeAcross().setHorizontalAlignment('center').setFontWeight('bold');
  var values=[["очередь 1","очередь 2","очередь 3","очередь 4"]];
  sLegnd.getRange("D"+parseInt(nrow1gr-1,10)+":G"+parseInt(nrow1gr-1,10)).setValues(values).setFontColor('#a61c00').setHorizontalAlignment('center');
  sLegnd.getRange("H"+parseInt(nrow1gr-1,10)+":K"+parseInt(nrow1gr-1,10)).setValues(values).setFontColor('#a61c00').setHorizontalAlignment('center');
  var nRowOfFirstGr=nrow1gr;                                  // row number of first group presented ('selected')
  var sheets=ss.getSheets();                             // all sheets
  var grpsNames=output.dataGroups.names;           // names of analized data's groups 
  var sUiksCoveredByGrpsName='uiksCoveredByGroups'+tM;   // -- data: uiksCoveredByGroups
  var sUCBG;
  if(ss.getSheetByName(sUiksCoveredByGrpsName)){
    sUCBG=ss.getSheetByName(sUiksCoveredByGrpsName);
  }else{
    sUCBG=ss.insertSheet(sUiksCoveredByGrpsName,sheets.length);
  }
  var lrUCBG=sUCBG.getLastRow();
  var nextGrIniCol;
  if( !(lrUCBG) || lrUCBG<1){
    sUCBG.getRange('b1').setValue('Охваченность УИКов разными группами по результатам прогона'+( (unMist)?' (Без данных Мищенко)':'')+( (useSmsSite.use)?' /'+useSmsSite.noteRu+'/_':'') );
    sUCBG.getRange("b1:e1").mergeAcross().setWrap(true);
    sUCBG.getRange('f1').setValue(tM);
  }
  nextGrIniCol=2;   
  var contsByTurn=[];
  var uiksByTurn=[];
  for ( var ish=0;ish<sheets.length;ish++){
    
    var nm=sheets[ish].getName();                // sheet name contains group's Name and tMark
    if(nm=='Sheet1'){
      ss.deleteSheet(sheets[ish]);
      continue;
    }
    if( !(/(legend|uiksCoveredByGroups)/.test(nm)) ){
      // all but legend sheet
      
      var s=sheets[ish];
      var sName=s.getName();
      var data=s.getDataRange().getValues();    // resulting data are appropriate to resHeadRu header
      
      var unicUiks=[[],[],[],[]];             // accumulates unic uiks numbers (data of which is already accounted of), index along the row is appropriate to turn (0 for 1st turn)
      var ct=[0,0,0,0];                       // number of contacts of particular turn ( index 0 is appropriate to turn 1)
      var cu=[0,0,0,0];                       // number of uiks     of particular turn
      
      var jColUik=getColNumb(data[0],'уик')-1;
      var jColTurn=getColNumb(data[0],'очередь')-1;
      // -- separate by turns
      for(var it=1;it<5;it++){
        for(var i=1;i<data.length;i++){          
          var t=data[i][jColTurn];                     // turn number          
          var u=data[i][jColUik];                     // uik number
          
          if( t==it){
            ct[it-1]++;
            
            var isunic=true;                    
            for( var iu in unicUiks[it-1] ){
              if( u==unicUiks[it-1][iu] ){
                isunic=false;
                break;
              }
            }
            if(isunic){
              cu[it-1]++;
              unicUiks[it-1].push(u);
            }
          }
        }
      }
      var pt=new RegExp(tM);
      var grName=sName.replace(pt,'');
      var nmbOfRow;
      var rowSet;
      // -- UiksCoveredByGroups data filling
      sUCBG.getRange(3,nextGrIniCol).setValue(sName);
      var grLblR=sUCBG.getRange(3,nextGrIniCol,1, 4);
      grLblR.mergeAcross();
      grLblR.setHorizontalAlignment('center');
      var turnsLblsR=sUCBG.getRange(4,nextGrIniCol,1,4).setValues(values);
      turnsLblsR.setHorizontalAlignment('center');
      var color=(odd<0)?'#fff2cc':'#fff';    
      turnsLblsR.setBackground(color);
      odd=odd*(-1);
      
      var transpose=[];
      var trRow=[];
      var longest=unicUiks[0].length;
      for( var iii in unicUiks){
        longest=(longest>unicUiks[iii].length)?longest:unicUiks[iii].length;
      }      
      for( var ii in unicUiks){
        for( var jj=0;jj<longest;jj++){
          var val=(jj+1>unicUiks[ii].length)?'':unicUiks[ii][jj];
          if(ii==0){
            transpose.push( [val] );
          }else{
            transpose[jj].push(val); 
          }
        }
      }
      if( (transpose[0])&&(transpose[0].length==4)){
        sUCBG.getRange(5,nextGrIniCol,transpose.length,4).setValues(transpose);
      }
      nextGrIniCol=nextGrIniCol+4;
      /*
      var pt1=new RegExp(grName);
      var lgR=sLegnd.getRange(1,2,sLegnd.getLastRow());
      var lgDC2=lgR.getValues();
      rowSet=false;
      for (var il=10; il<lgDC2.length;il++){
      var cellCol2=lgDC2[il][0];
      var outoff= ((/ciked - контакты/.test(cellCol2)) || (/notCiked - не/.test(cellCol2)))?true:false;
      if(pt1.test(cellCol2)){
      nmbOfRow=il+1;
      rowSet=true;
      break;
      }
      }
      */
      nmbOfRow=nRowOfFirstGr+grpsNames.indexOf(grName);
      rowSet=( (grName!='ciked')&&(grName!='notCiked'))?true:false;   
      //rowSet=false;
      if(rowSet){  
        sLegnd.getRange(nmbOfRow, 4,1,4).setValues([ct]).setHorizontalAlignment('center');
        sLegnd.getRange(nmbOfRow, 8,1,4).setValues([cu]).setHorizontalAlignment('center');
      }
    }
  }    
  sLegnd.setColumnWidth(2,350);
  sLegnd.setColumnWidth(3,200);
  sLegnd.getRange(nRowOfFirstGr, 2,sLegnd.getLastRow()-nRowOfFirstGr+1).setFontSize(9).setWrap(true);
  sLegnd.getRange(nRowOfFirstGr, 3,sLegnd.getLastRow()-nRowOfFirstGr+1).setFontWeight('bold').setHorizontalAlignment('center');
  sLegnd.getRange('d19:g25').setBackground('#fff2cc');
  sLegnd.getRange('h19:k25').setBackground('#e3fffc');
  
  var idSmsCik=output.smsCikInpSSId;
  var ssSmsCik=SpreadsheetApp.openById(idSmsCik);
  
  sLegnd.getRange("C4").setValue(ssSmsCik.getName());
  sLegnd.getRange("E4").setValue(ssSmsCik.getUrl());
  sLegnd.getRange("C5").setValue(output.smsCikInpShName);
}

/**
 * Forms sheet 'uiksCoveredByGroups_tmark'
/**
 * debugs turns segregation
  */
function debugTurnsSegregation(){
  // @param{string}ssIs - id of data spreadsheet ( onSpreadsheetForAll mode=true)
  var ssId='12YXkEsWmbi2xO0oJwoEy0o8h5a951I_mFscSTdV5r5A';
  ssId='1PW9QFAFMvtD3rxW0mwJZP7M21SFH0ozOv77aYh4GVKQ';
  countTurnsAndUiks(ssId);
}
function testTMark(){
  var patt=/\d{6}_\d{6}$/;
  var str='msk-recieved-2016-09-22_21-30_БезМищенко_SmsCikDataFromSite__handleRun_091016_000452';
  Logger.log(str.slice(str.search(patt)));
}