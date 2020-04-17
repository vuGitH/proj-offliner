var legend={
  legendShNamePart:'legend',
  sheet:undefined,
  parts:{number:0,
         ids:['titile','date','spokesperson','inpDataInfo','outputDataInfo','codesInfo','resultsSummary'],
         lables:[],
         lablesRanges:[],
         valuesRanges:[],
         values:[],
         partsArr:[]         
        },
  date:{lable:'дата:',
        lableRange:'D1',
        value:new Date(),
        range:"D2"},
  spokesperson:{ lable:'вопросы к:',
               lableRange:'E1',
               value:'v.u.',
               range:'E2'
               },
  /**
  * Initiates Legend object and sheet object( front sheet of spreadseet with handle run results)
  * @param{ Date}dateOpt - optional, the date of run indicated
  * @param{ String}responsableOpt - spokesperson of calculation has been carried out
  * @param{String}legendSheetNameOpt - optional; the name of legend sheet   
  * @return{Object} Legend object
  */
  initLegend:function(ssID,dateOpt,spokespersonOpt,legndSheetNameOpt){
    var legendSheetName=legendSheetNameOpt||'legend_'+tMark;
    var ss=SpreadsheetApp.openById(ssID);
    var sheets=ss.getSheets();
    var notExists=true;var sLegnd;
    for(var is in sheets){
      var s=sheets[is];
      if( s.getName()==legendSheetName ){
        sLegnd=s;
        notExists=false;
        break;
      }
    }
    if(notExists){
      sLegnd=ss.insertSheet(legendSheetName,0);
    }
    legend.sheet=sLegnd;
    legend.date.value=dateOpt||new Date();
    legend.spokesPerson=responsableOpt||legend.responsable.value;
    var prts=legend.parts;
    prts.numbers=legend.parts.ids.length;
	var ids=legend.parts.ids;
    for(var i=0;i<ids.length;i++){
      prts.labels.push( ids[i] );
      prts.lablesRanges.push('');
      prts.valuesRanges.push('');
      prts.values.push('');
      prts.partsArr.push('');
      prts.partsObjs.push(undefined);
    }
    return sLegnd;
  },
  /*
  * Sets part of legend sheet
  * @param{string}partId - part's identfier
  * @param{string}partNameOpt - part's name.Optional
  * @param{string}partDescriptionOpt - description.Optional
  * @param{}partValueOtp -
  * @param{object Range}partVRangeOpt
  * @param{string}partLabelOpt - label
  * @param{Range}partLRangeOpt - range of label location
  * @return{object part} object of legend part
  */
  initPart:function(partId,partNameOpt,partDescriptionOpt,partValueOpt,partVRangeOpt,partLabelOpt,partLRangeOpt){
    var partName=partNameOpt||partId;
    var partDescription=partDescriptionOpt||'Описание поля листа легенды '+partId;
    var partLabel=partLabelOpt||partId;
    var partLRange=partLRangeOpt||undefined;
    var partValue=partValueOpt||'';
    var partVRange=partVRangeOpt||undefined;
    var prts=legend.parts;
    var ind=prts.ids.indexOf(partId);
    if( ind<0 ){
      prts.numbers++;
      prts.ids.push(partId);
      prts.descriptions.push(partDescription);
      prts.labels.push(partLabel);
      prts.labelsRanges.push(partLRange);
      prts.values.push(partValue);
      prts.valuesRanges.push(partVRange);
      prts[partId]={};
      prts.partsArr.push(prts[partId]);
    }
    var prt=legend.parts[partId];
    prt.propsIds=['id','label','labelRange','description','range','value'];
    prt.nProps=6;
    prt.id=partId;
    prt.name=partName;
    prt.label=partLabel;
    prt.labelRange=partLRange;
    prt.description=partDescription||"значение поля "+partId;
    prt.range=partRangeOpt||'';
    prt.value=partValueOtp||'';
    prt.props=[];
    for( var ip in propsIds){
      prt.props.push(prt[propsIds[ip]]);
    }
    /**
    * Returns SpreadsheetApp range of a part in legend sheet
    * @param{String||Array Integer[]}range - representation of range 
    *   as array [r,c] || [r,c,nR] || [r,c,nR,nC] 
    *   as A1Notation string:  "a1" || "a:a" ||...
    * @return {Range} - specified range object
    */
    prt.setRange=function( range){
      var s=legend.sheet;
      var sR;
      if( Array.isArray(range)) {
         switch( range.length ){
           case 2:
             sR=s.getRange(range[0],range[1]);  // single cell 
             break;
           case 3:
             sR=s.getRange(range[0],range[1],range[2]);  // range is a column of range[2] rows
             break;
           case 4:
             sR=s.getRange(range[0],range[1],range[2],range[3]);   // matrix
         }
      }else{
       // range has a1-Notation 
        sR=s.getRange(range);
      }
      return sR;
    };
    /**
    * Sets values for legend range
    * @param{(string|number)|Array [][]}value - 
    * @param{String||Array Integer[]}range - representation of range 
    *   as array [r,c] || [r,c,nR] || [r,c,nR,nC] 
    *   as A1Notation string:  "a1" || "a:a" ||...
    * @return{Range} 
    */
    prt.setValue=function(value,range){
      var s=legend.sheet;
      var sR=prt.setRange(range);
      if( Array.isArray(range)) {
         switch( range.length ){
           case 2:
             sR.setv(value);  // single cell value - single variable
             break;
           case 3:
             sR.setValues(value);  // range is a column value is 2d array for one column and multyple rows
             break;
           case 4:
             sR.setValues(value);
         }
      }else{
       // range has a1-Notation 
        if( /[:]/.test(range) ){
          // matrix range anda values
          sR.setValues(value);      // value should be apropriate to range matrix
        }else{
          // single cell
          sR.setValue(value);
        }
      }
      return sR;
    };
    prt.setValue( prt.value,prt.range);
    /**
    * Transforms different ranges into one cell-block
    * if range was not defined return undefined
    * @param{String|Array Strings[]}labelRange - legend range format 
    * @return {Range} a range of like one cell
    */
    prt.setLabelRange=function(labelRange){
      if( !(labelRange) || labelRange=='' ){
        return undefined;
      }
      
      var s=legend.sheet;
      s=SpreadsheetApp.getActiveSheet();
      var sR;
      if( Array.isArray(labelRange) ){
        switch( lableRange.length ){
          case 2:
            sR=s.getRange(range[0],range[1]);  // single cell 
            break;
          case 3:
            sR=s.getRange(range[0],range[1],range[2]).mergeVertically();  //  column merged into one cell-block
            break;
          case 4:
            sR=s.getRange(range[0],range[1],range[2],range[3]).merge();   // matrix merged into one cell-block
        }
      }else if( labelRange.length<1){
        return undefined;
      }else{
        // a1Notation 
        if( /[:]/.test(labelRange)){
          if( /([a-zA-Z]+)\d*[:]\1/.test(labelRange) ){
            // vertical range
            sR=s.getRange(labelRange).mergeVertically();
          }else if(/[a-zA-Z]*(\d+)[:][a-zA-Z]*\1/.test(labelRange)) {
            // horizontal
            sR=s.getRange(labelRange).mergeAcross();
          }else{
            //matrix block
            sR=s.getRange(labelRange).merge();
          }
        }
        if( /[a-zA-Z]+\d+/.test(labelRange)){
          sR=s.getRange(labelRange);
        }else{
          return undefined;
        }
      }
      return sR;
      
    };
    prt.setLable=function(label,labelRange){
      var sR=prt.setLabelRange(labelRange);
      sR.setValue(label);
      return label;
    }; 
    return prt;
  },  
  
    /**
  * set legend part with few parameters (see description of initPart method)
  */
  setPart:function(partId,partValue,partVRange,partDescriptionOpt,partLabelOpt,partLRangeOpt,partNameOpt){
    var partName=partNameOpt||partId;
    var partDescription=partDescriptionOpt||'Описание поля листа легенды '+partId;
    var partLabel=partLabelOpt||partId;
    var partLRange=partLRangeOpt||undefined;
    var prt=initPart(partId,partName,partDescription,partValue,partVRange,partLabel,partLRange);
    return prt;
  },
  /**
   * Sets Title of the Legend sheet
   * @param{String}titleStr - string content of Title
   * @param{String|Array []}titleRange range for Title;
   */   
  setTitle:function(titleStrOpt,titleRangeOpt){
    var value=titleStrOpt||'Результаты обработки данных смсЦик прогон '+tMark;
    var range=titleRangeOpt||"A2";
    var title= legend.initPart('title','legendTitle','Title of Legend(representation sheet of run results)',value,range);
    return title;
  },
  /**
   * Gets legend part with specified id;
   * @param{String}partId - part's id
   * @return{object} part object
   */
  getPart:function(partId){ var prt;
    if( this.parts.ids.indexOf(partId)<0 ){
      prt=this.parts.setPart(partId);
    }else{
      prt=this.parts[partId]; 
    }
    return prt;
  },  
  //'inpDataInfo','outputDataInfo','codesInfo','resultsSummary'
  outputFile:{ name:"",
              id:""},
  inputSmsCik:{label:'Имя файла результатов прогона',
               fileName:'',
               fileId:'',
               sheetName:''
              },
  input:{}, 
  varsToStr:function(){    
    var strR1_2='Результаты обработки данных смсЦик прогон '+tMark;
    var strR2_2='';
    var strR3_2='Имя файла результатов прогона';
    var strR4_2='Имя таблицы входного набора данных смсЦИК( имя файла)';
    var strR5_2='Имя листа входного набора данных смсЦИК';
    var strR6_2='Имя таблицы нашего набора данных (имя файла):';
    var strR7_2='Имя(имена) листов нашего набора данных (несколько имен, если используются данные в разных листах)';
    var strR8_2='';
    var strR9_2='';
    var strR10_2='Результаты.';
    var strR11_2='Множества, группы контактов';
    var strR12_2='selectd - выборанные нами для связи(обзвона), анализа (1-4 очереди)';
    var strR13_2='tried - делались попытки связаться. Все имеющие цвет, кроме Белого.';
    var strR14_2='agreed - связь сосотоялась и контактом выражены возможность и согласие отправить смсЦИК. Зеленые.';
    var strR15_2='needHlp - связь состоялась, но человек нуждался в доп. инструкциях для совершения действий. Синие.';
    var strR16_2='notReachd - попытки делались, но с контактом не удалось связаться. Желтые';
    var strR17_2='disabld - выбывшие, отказавшиеся от наблюдения. Красные';
    var strR18_2='notTried - до контакта не дошли руки, не хватило времени или не охватывался из-за наличия дублера на участке. Белые или Серые';
    var strR19_2='selectdCKD - выбранные для связи, чьи смсЦИК получены( есть в данных смсЦИК). CKD - аббревиатура CIKED';
    var strR20_2='triedCKD - контакты, с которыми пытались связаться и чьи смсЦИК пришли';
    var strR21_2='agreedCKD - контакты, выразившие готовность и чьи смсЦИК пришли';
    var strR22_2='needHlpCKD - контакты, нуждавшиеся в доп.инструкциях, чьи смсЦИК пришли';                    
    var strR23_2='notReachdCKD - контакт, с которым связаться не удалось, но его смсЦИК получено (сделали другие)';
    var strR24_2='disabldCKD - выбывшие, но от которых пришли смсЦИК( если это происходит, это странно)';
    var strR25_2='notTriedCKD - контакт, оставшийся без нашего внимания';
    var strR26_2='selectdNCKD - выбранные для связи, чьи смсЦИК НЕ получены( нет в данных смсЦИК). NCKD - аббревиатура Not CIKED';
    var strR27_2='triedNCKD - контакты, с которыми пытались связаться, но чьи смсЦИК не пришли';
    var strR28_2='agreedNCKD - контакты, согласившиеся отправить, но так и не отправившие или отсутствующие в данных смсЦИК';
    var strR29_2='needHlpNCKD - нуждавшиеся в помощи и не отправившие смсЦИК';
    var strR30_2='notReachdNCKD - с кем не связывались и кто не отправил смсЦИК';
    var strR31_2='disabldNCKD - выбывшие, не цикнутые Not CIKED (что естественно, их не было на участках)';
    var strR32_2='notTriedNCKD - на кого, не хватило времени для контакта и кто так и не прислал смсЦИК( нет в данных смсЦИК)';
    var strR33_2='ciked - контакты, от кого полученны смсЦИК';
    var strR34_2='notCiked - не цикнутые';
    var strR35_2='beMailed - контакты,  кому можно отправить КОНТРОЛЬНЫЙ-mai ( не красные и есть e-mail)';
    var strR36_2='beSmsed - контакты, кому можно послать КОНТРОЛЬНЫЙ смс (не красные и есть телефон)';  
    var vnp='strR';
    var vv=[];
    for( var i=1;i<37;i++){
      var vn=vnp+i+"_2";
      var vs=eval(vn);
      vv.push( [vs] );
      
    }
    return vv;
  }
};
PEleCom.legend=legend;
/**
 * Transfers set of similar named variables to array
 * used to form hanling run legend
 * @return{Arrray Strings[]} - array of strings
 */
function transferVarsToStrArr(){
  // -- run Specific

var unMist=output.runSpecs.specs.unMist.use;
var useSmsSite=output.runSpecs.specs.useSmsSite;
  //
  
  var strR1_2='Результаты обработки данных смсЦик прогон '+tMark+( (unMist)?' (Без данных Мищенко)':'')+( (useSmsSite.use)?' /'+useSmsSite.noteRu+'/_':'') ;
  var strR2_2='';
  var strR3_2='Имя файла результатов прогона';
  var strR4_2='Имя таблицы входного набора данных смсЦИК( имя файла)';
  var strR5_2='Имя листа входного набора данных смсЦИК';
  var strR6_2='Имя таблицы нашего набора данных (имя файла):';
  var strR7_2='Имя(имена) листов нашего набора данных (несколько имен, если используются данные в разных листах)';
  var strR8_2='';
  var strR9_2='';
  var strR10_2='Результаты.';
  var strR11_2='Множества, группы контактов';
  var strR12_2='selectd - выборанные нами для связи(обзвона), анализа (1-4 очереди)';
  var strR13_2='tried - делались попытки связаться. Все имеющие цвет, кроме Белого.';
  var strR14_2='agreed - связь сосотоялась и контактом выражены возможность и согласие отправить смсЦИК. Зеленые.';
  var strR15_2='needHlp - связь состоялась, но человек нуждался в доп. инструкциях для совершения действий. Синие.';
  var strR16_2='notReachd - попытки делались, но с контактом не удалось связаться. Желтые';
  var strR17_2='disabld - выбывшие, отказавшиеся от наблюдения. Красные';
  var strR18_2='notTried - до контакта не дошли руки, не хватило времени или не охватывался из-за наличия дублера на участке. Белые или Серые';
  var strR19_2='selectdCKD - выбранные для связи, чьи смсЦИК получены( есть в данных смсЦИК). CKD - аббревиатура CIKED';
  var strR20_2='triedCKD - контакты, с которыми пытались связаться и чьи смсЦИК пришли';
  var strR21_2='agreedCKD - контакты, выразившие готовность и чьи смсЦИК пришли';
  var strR22_2='needHlpCKD - контакты, нуждавшиеся в доп.инструкциях, чьи смсЦИК пришли';                    
  var strR23_2='notReachdCKD - контакт, с которым связаться не удалось, но его смсЦИК получено (сделали другие)';
  var strR24_2='disabldCKD - выбывшие, но от которых пришли смсЦИК( если это происходит, это странно)';
  var strR25_2='notTriedCKD - контакт, оставшийся без нашего внимания';
  var strR26_2='selectdNCKD - выбранные для связи, чьи смсЦИК НЕ получены( нет в данных смсЦИК). NCKD - аббревиатура Not CIKED';
  var strR27_2='triedNCKD - контакты, с которыми пытались связаться, но чьи смсЦИК не пришли';
  var strR28_2='agreedNCKD - контакты, согласившиеся отправить, но так и не отправившие или отсутствующие в данных смсЦИК';
  var strR29_2='needHlpNCKD - нуждавшиеся в помощи и не отправившие смсЦИК';
  var strR30_2='notReachdNCKD - с кем не связывались и кто не отправил смсЦИК';
  var strR31_2='disabldNCKD - выбывшие, не цикнутые Not CIKED (что естественно, их не было на участках)';
  var strR32_2='notTriedNCKD - на кого, не хватило времени для контакта и кто так и не прислал смсЦИК( нет в данных смсЦИК)';
  var strR33_2='ciked - контакты, от кого полученны смсЦИК';
  var strR34_2='notCiked - не цикнутые';
  var strR35_2='beMailed - контакты,  кому можно отправить КОНТРОЛЬНЫЙ-mai ( не красные и есть e-mail)';
  var strR36_2='beSmsed - контакты, кому можно послать КОНТРОЛЬНЫЙ смс (не красные и есть телефон)';

  var vnp='strR';
  var vv=[];
  for( var i=1;i<37;i++){
    var vn=vnp+i+"_2";
    var vs=eval(vn);
    vv.push( [vs] );    
  }
  return vv;
}
function test(){
  // test
  var v=transferVarsToStrArr();
  for(var iv in v){
    Logger.log("line: "+iv+" "+v[iv])    ;
  }
}