/**
* Clones object. Creates instance of an object as clone or pass object
* properties to beneficiary object
* @param {Object}donor - original object (donor)
* @param {Object}beneficiary - beneficiary object who heirs properties of donor.
*   Optional. If not set new clone of donor{Object} is created
* @param {Boolean}donorPrivilege_opt - while true: if donor and benneficiary have 
*   same some property's name donor's value prevails and are assinged 
*   to returned object. Optional. Default == true
* @param {Boolean}donorPropsFirst_opt - optional parameter determining order of 
*   properties sequential appearance(sequence). Default = true presumes that 
*   donor's properties go first and then unique
*   benbeficiary's properties. If false means opposit order
* @return {Object} - new instance of obj object
*/
handle.cloneObj=function(donor,beneficiary,donorPrivilege_opt,donorPropsFirst_opt){
  var donorPropsFirst=((donorPropsFirst_opt!=undefined)&&(donorPropsFirst_opt===false))?false:true;
  var donorPrivilege=((donorPrivilege_opt!=undefined)&&(donorPrivilege_opt===false))?false:true;
  var clone=beneficiary||{};
  /**
  * transforms par value depending of it's type and instance meaning
  * and returns this transformation
  * @param {}par
  * @return {} trnasformed value
  */
  var assignProp=function(par){
    var ass;
    if( typeof par === 'function'){
      ass=par;
    }else{
      if(typeof par ==='object'){
        if(!Array.isArray(par)){
          // not array
          if(par instanceof RegExp === true){
            ass=function(o){              
              var s=o.toString();var s1=s.replace(/^\//,'');
              var s2=s1.replace( /\/(i|g|m)*$/,'');
              var mig=s1.replace( new RegExp(s2),'').replace(/^\//,'');
              var newRe=new RegExp(s2,mig);
              return newRe;
            }(par);
          }else if( par instanceof Date){
            ass=function(d){return new Date(d.getTime());}(par);
          }else{
            ass=handle.cloneObj(par);
          }
        }else{
          //is array
          ass=JSON.parse( JSON.stringify( par ) );
        }
      }else{            
        ass=JSON.parse( JSON.stringify( par ) );
      }
    }
    return ass;
  };
  /**
  * checks if object containes specified property
  * @param {Object}o - object testing
  * @param {string}pNm property name as string
  * @return {Boolean} true when such property name is available among object properties
  */
  var hasPropName=function(o,pNm){
    for(var pr in o){
      if(pr===pNm){
        return true;
      }
    }
    return false;
  };
  
  var ben={};
  for( var ipr in donor){
    var par=donor[ipr];
    if( !donorPrivilege){
      par=(hasPropName(clone,ipr))?clone[ipr]:par;
    }    
    ben[ipr]=assignProp(par);    
  }
  for(var iprc in clone){
    if(!hasPropName(donor,iprc)){
      ben[iprc]=assignProp(clone[iprc]);
    }
  }
  if(donorPropsFirst){
    return ben;
  }else{
    var ben1={};
    for( var iprCl in clone){
      ben1[iprCl]=ben[iprCl];
    }
    for(var iprDn in donor){
      var hpr=hasPropName(clone,iprDn);
      if(!hpr){
        ben1[iprDn]=ben[iprDn];
      }
    }
    return ben1;
  }
};
/** j-object Method determins j-index of each column
   *   js.columnName=jIndex   in data [i][j]  or index of column 
   * @param {Array.<strings>}header  array of header of sheet
   * @param {string}shNameOpt - sheet Name (optional)
   * @param {string}ssId - Id of spreadsheet
   * @return {Object} objects with properties named by columns names preceded(if any) by ssId+shName and contained j-indices of appropriate column
   */
handle.jObj=function(header,shNameOpt,ssIdOpt){
  if( !Array.isArray(header)){
    return false;
  }
  var js={};
  js.add=function(a,b){
    this[a]=b;
  };
  var jProp=((!(shNameOpt)||(shNameOpt==''))&&(!(ssIdOpt)||(ssIdOpt=='')))?'':
    (
      ((shNameOpt)&&(shNameOpt!='')&&(!(ssIdOpt)||(ssIdOpt=='')))?shNameOpt:ssIdOpt+shNameOpt
    );  
  for(var jj in header){
      js.add(jProp+header[jj],jj);
  }
  return js;
};
function jTest(){
  var data=[[1,2,3,4],[4,5,6,7]];
  var head=[4,5,6,7];
  var ssId='143k5jkj2k6k26k62_lk_lk';
  var shName='Sheet';
  var jO=handle.jObj;
  
  var j1=jO(data);
  var j2=jO(head);
  var j3=jO(head,shName);
  var j4=jO(data[0],shName,ssId);
  Logger.log(jO(head,0,shName,ssId));  
}
/**
* return is object presuming possibility of repeating cells' values
*@param {string}colName - column name
*@param {Array [][]}data - 2d array
*@param {Array []}header - header of table
*@param {Boolean}couldRepeat - if true it's presumed that cells of columng could have the same
*    vslues in different rows. In this case multiIndex object is used.
*@return {Object} object of string pairs {cellValue:rowIndex } or multiIndex object
*   in the case of multiIndex returned object has .r property and this fact could
*   be used to destinct one case from another. 
* Where content does premit (searching values are unique) it's not neccesary 
* to make correction of code(in old codes) taking this fact into account
*/
handle.getIs=function(colName,d,header,couldRepeat){
  var repmode=couldRepeat||false;
  var js=handle.jObj(header);
  if( !(js[colName]) ){
    return false;
  }
  var j=parseInt(js[colName],10);
  var isO=(repmode)? handle.multiIndex.init(colName):{};
  for(var i=0;i<d.length;i++){
    var dv=d[i][j];
    if( (dv)&&(dv!=='undefined') ){
      if(repmode){
        isO.add(dv,i);
      }else{
        isO[dv]=i;
      }        
    }
  }
  return isO;  
};

// -- vertical
handle.is={};
var is=handle.is;
/**
* short indices for columns' names
*/
is.indsForColNamesDefault={
  "sprShSetters":"ssIs",
  "shSetters":"shIs",
  "stValue":"stvIs",
  "stValueO":"stvoIs",
  "ind":"indIs",
  "colName":"clNIs"
};

/**
* returns object of pairs ind:colName for reverse oCVI -"object Columns vs. Indices"
* @param {Object}oCVIOpt - object C(columns) vs. I(indices). Optional
*                          { ind1:colName1, ind2:colName2,..}
*                      if is not set is.indsForColNamesDefault object is used
* @return  object I(indices) vs. C(columns)
*                          {colName1:ind1,colName2:ind2,...}
*/
is.colNamesForIndsDefault=function(oCVIOpt){
  var oCVI=oCVIOpt||handle.is.indsForColNamesDefaults;
  var oIVC={};
  for(var col in oCVI){
    var ind=oCVI[col];
    oIVC[ind]=col;
  }
  return oIVC;
};
/**
* Returns multiIndices for different column of Setters sheet
* @param {Array [[]]}data -  sheet data range array
* @param {Object}colNamesForIndsOpt - optional. object of pairs index:colName
*               by default: {'ssIs':'sprShSetters','shIs':'shSetters'}
* @param {Object}stJs - setters sheet header j-object 
* @return {Object} multiIndex object
*/  
handle.getIsInds=function(data,colNamesForIndsOpt,jsOpt){
  var js=jsOpt||handle.jObj(data[0]);
  var colNameForInd=colNamesForIndsOpt||handle.is.colNamesForIndsDefault();
  var mind={};
  for(var ind in colNameForInd){
    mind[ind]=handle.multiIndex.init(ind);
  }
  for(var i in data){
    var int=parseInt(i,10);
    for( var ind1 in colNameForInd){
      var colName= colNameForInd[ind1];
      mind[ind1].add( data[int][parseInt( js[colName],10)],int);
    }
  }
  return mind;
};
/** 
* Sets reverseIndex - revIndex - is a concept determining row index
* using cell's value on crossection of row in colName. This
* value is used as row's index to determine row index in data array d
* sets index of row to a row which containes specified value == value
* @param {Object [][]}d - 2darray of data
* @param {Integer}iRow - row index in d array
* @param {String}colName - name of column
* @param {Object}js - jObject of data header.Optional
*/
is.setIndexOfRowAsValueInColName=function(d,irow,colName,js){
  js=js||handle.jObj(d[0]);
  var j=parseInt(js[colName],10);
  var cellValue=d[irow][j];
  if( !is[colName][ cellValue ] ){
    is[colName][cellValue]=irow;
    is[colName].v[ cellValue ]=cellValue;
    is[colName].r[cellValue]=[irow];  
  }else{
    is[colName].v[cellValue]=cellValue;
    is[colName].r[cellValue].push(irow);
  }  
};
/** 
* Returns indices of rows which contain specified value == value in column named colName
* @param {Object [][]}d - 2darray of data
* @param {Integer}iRow - row index in d array
* @param {String}colName - name of column
* @param {Object}js - jObject of data header.Optional
* @return { Arrayy} array of indices of rows 
*/
is.setIndsOfRowsWithValueInColName=function(d,colName,value,js){
  js=js||handle.jObj(d[0]);
  is.index={};
  is[colName]={};
  is[colName].r={};
  is[colName].v={};
  for(var i in d){
    d[i][parseInt( js.index,10)]=(i!=0)?i:d[i][parseInt(js.index,10)];
    is.index[i]=i;
    
    is.setIndexOfRowAsValueInColName(d,i,colName,js);
  }
  return is[colName];
};
/**
* returns array with rows names of existing block
* while names are determined as value in column colName
*@param {Integer}ib - block index (index beginning with 0 in set(sequence) of
*                    similar type blocks - Typical blocks. Typical blocks 
*                    could be located in different parts of data array d, so
*                    location of each one is determined by and beginning with it's iniRow index
*                    ini row indeces of tipical blocks are accumulated in is[colName].r[cellValue] array
*                    cellValue: it's considered that row has name cellValue which 
*                             is the value of the row's cell in the column with colName
*@param {Object [][]}d - data of sheett
*@param {String}cellValue - value or data row in column colName
*@param {String}colName - name of column in header of sheet data
*@return {Array} arrays of rows' names
*
*/
is.getNamesOfExistingBlock=function(ib,d,cellValue,colName,js){
  js=js||handle.jObj(d[0]);
  ib=parseInt(ib,10);
  var rNames=[];
  if( (is[colName].r[cellValue])&&(is[colName].r[cellValue].length)&&(is[colName].r[cellValue].length>0)){
    
    // names between adjacent marks ( cellValues of existing Block)
    var ir1=parseInt(is[colName].r[cellValue][ib],10);
    var ir2;
    if(!is[colName].r[cellValue][ib+1]){
      ir2=d.length;    
    }else{
      ir2=parseInt(is[colName].r[cellValue][ib+1],10)-1;
    }
    for(var ir=ir1;ir<ir2;ir++){
      rNames.push(d[ir][parseInt(js[colName],10)]);
    }
  }  
  return rNames;
};


/**
* return iObject for 2d-array 
* wich is multiIndex object for each column of data
* additionally it contains properties:
*                       .indsForColNames object of pairs { colName: 'is'+ColName}
*                       .colNamesForInds                { 'is'+ColName:colName }
*/
handle.iObj=function(data){
  var iObj={};
  var indsForColNames={};
  var colNamesForInds={};
  var mindData={};
  var header=data[0];
  for(var j in header){
    var isInd='is'+header[j].charAt(0).toUpperCase()+header[j].slice(1);
    indsForColNames[header[j]]=isInd;
    mindData[header[j]]=handle.multiIndex.init(header[j]);
    for(var i in data){
      var val=data[i][j];
      mindData[header[j]].add(val,i);
    }
    mindData[header[j]].getNs();
    mindData[header[j]].getCsvs();
    mindData[header[j]].getHeader();         
    iObj[header[j]]=mindData[header[j]];
  }
  colNamesForInds=handle.is.colNamesForIndsDefault(indsForColNames);
  iObj.indsForColNames=indsForColNames;
  iObj.colNamesForInds=colNamesForInds;
  return iObj;
};
/**
* Method of converting csv-string of sequential coma separated entities (tuple) into
*  seria  of logical OR conditions (logical summm)
 * @param {string}bStr - string of variables separated( or not) by coma
 * @return {string} logical summ
 */
handle.csvToORs=function(bStr){
  var b=(/[,]/.test(bStr))?bStr.split(','):bStr;
  if( Array.isArray(b) ){
    var r='';
    for( var i in b){
      r+=((i==0)||(i==b.length))?'('+b[i]+')':'||('+b[i]+')';
    }
    return r;
  }else{
    return '('+b+')';
  }
};
/**
* tests value for patterns from array or a single pattern
* @param {RegExp | Array RegExp[]} patts - array of patterns or single
*   regular expression specifiyng groups names to select
* @return {Boolean} true if any of pattern is true
*/
handle.testValueByPatts=function(patts,value){ 
  if( Array.isArray(patts) ){
    for(var i=0;i<patts.length;i++){
      if( patts[i].test(value) ){
        return true;
      }
    }
  }else{
    if( patts.test(value)){
      return true;
    }
  }
  return false;
};
/**
* tests value for patterns from array or a single pattern
* @param {RegExp | Array RegExp[]} patts - array of patterns or single
*   regular expression specifiyng groups names to select
* @return {Boolean|Number} true if any of pattern is true
*   it's worthshile to use Number.isInteger(returnValue) with return value
*   if Integer - is the index of element of patts array to whome
*   value matches in patts[i].test(value) checking
*/
handle.checkValueByPatts=function(patts,value){ 
  if( Array.isArray(patts) ){
    for(var i=0;i<patts.length;i++){
      if( patts[i].test(value) ){
        return i;
      }
    }
  }else{
    return patts.test(value);
  }
  return false;
};
/**
* Determines
* Patterns Selection  modes/cases:
* 1.pttArrVSOArr - pattGrs and vSOArr are arrays with equal length
* 2.pttArrVSOArrShort - like 1. but vSOArr.length<pattGrs.length
* 3.pttArrVSO - pattGrs is array but vSOArr single object
* 4.pttArr - pattGrs is array , vSOArr is undefined
* 5.pttVSO - single pattern and single vSOArr object
* 6.ptt - single pattern
* 7. forbidden
* @param {RegExp|Array RegExp[]}pattGrs - pattern to specify all groups of selection in Glossary
* @param {Object| Array Object[]}versSpecO  - version specification object.
* $return{string} - mode string value
*/
handle.getPattGrsSelectMode=function(pattGrs,versSpecO){
  var vSOIsArr=Array.isArray(versSpecO);
  var pattGrsIsArr=Array.isArray(pattGrs);
  var mode='';
  if( pattGrsIsArr ){
    if(!versSpecO){
      mode='pttArr';  // 4.
    }else{
      if(vSOIsArr){
        if(pattGrs.length<versSpecO.length){
          mode='forbidden';
          throw 'vSOArr.length could not be greater than pattGrs.length '; // 7.
        }
        mode=(pattGrs.length==versSpecO.length)?'pttArrVSOArr':'pttArrVSOArrShort'; //1.,2.
      }else{
        mode='pttArrVSO'; // 3.
      }
    }    
    // index of pattGrs beginning with which 'last value' rule for evoking values from csv acts
    // abbreviation: lastValueRuleActingFirstInd -> lvrActFirstInd
    var lvrActFirstInd=(!versSpecO)?0:
    (
      (!vSOIsArr)?1:
      (( (pattGrs.length!=versSpecO.length)&&(pattGrs.length>versSpecO.length) )? versSpecO.length:pattGrs.length)
    );
    if(lvrActFirstInd>pattGrs.length){
      mode='forbidden';
      throw 'vSOArr array lenth should not be greater than pattGrs.length';
    }    
  }else{
    if(vSOIsArr){
      mode='bad';
      throw 'vSOArr should not be array if pattGrs is not'; // 7.
    }else{
      mode=(versSpecO)?'pttVSO':'ptt'; // 5.,6.
    }    
  }  
  return mode;
};
/**
* collects members of root family and forms their objects.
* Works with sets (inpData) and groups (output) preliminary described in 
* Glossary and having dataSrcId and dataShName properties determined 
* (spreadsheet and sheet) or few versions of them from which woking version 
* is select by means of versionsSpecificObjectArrOpt parameter (vSOArr)
*
* @param {RegExp|Array RegExps[]}pattGrs - pattern to specify all groups to be 
*   selected in Glossary
* @param {Object}rootFamily - root groups object 
*   (PEleCom.inpData.sets or PEleCom.output.dataGroups )
* @param {Object| Array Object[]}versionsSpecifObjArrOpt - version specification 
*   object. Explanation:
*   In the case when data set parameters has few versions
*   and therefore could have few values for approprite selectors
*   in Glossary rendered by means of csv-string, 
*   vSO object permits to selelct certain version's selector's value. 
*   abbreviation:
*   vSO - selector version specifying object
*   vSOArr - array of selectors versions specifying objects ( tied to 
*            selectors of a group specified by pattern in pattGrs)
*   vSOAG  - dedicated to concrete group 
*            object of version specifying arrays and objects              
*   vSOAGs - array of version specifying objects for patterns' groups 
*   in correspondency with each group or partGrps.
*   if pattGrs is array, vSOArr , if it has beenset, should be array as well
*    with the same number of elements as pattGrs.
*    While only some or one of pattGrs elements need vSOArr, appropriates 
*    vSOArr-s for other element should be set (for ex. they could be 
*    set = undefined if they are not determined)
*    Otherwise : if vSOArr is not array but separate object
*    or it's array length is less than pattGrps array length
*    the exising values of vSOArr array element are applied to
*    appropriate elements of pattGrs array elements 
*    For the rest elements vSOArr is considered absent and 'last value' rule is
*    applied. Therefore if vSOArr is separate object( not array) but pattGrps is 
*    array, existing vSOArr is applied only to the first element of pattGrs
*    vSOAG Object format (or each separate element of vSOArr array of objects):
* @expample
* vSOAG={
*   getAll:false,   // Boolean variable indicating that whole csv string should be used as it is
*   selectorsNames:[], // array of selectors' names( Glossary) for which vSOs object should be applied
*   vSOArr: //  array of vSO - objects per each selector's name element in selectorsNames
      [            
*      { ind:'', p2Name:'' ,p2Value:''},
*      { ind:'', p2Name:'' ,p2Value:''} 
*     ]
*  };
*  where:
* @typedef
* @property {Number}ind - index of value from coma separated values (after transforming in array
*       by means of split(',') beginning with 0. The left has index 0;
* @property {string}p2Name - additional selector name wich value is used to determine
*       index of getting main paramteter 
*  @property {value}p2Value - the value which 2nd parameter has to have for determining it's 
*       position in csv(ind) for some purposes.
*  -if versSpecificObj is not defined but group parameters (like dataSrc... parameters) 
*  are csv strings the last value ( after last coma) is taken
*  -if parameter name is not mentioned in selectorsNames array but
*  parameter value in glossary data has csv format, the value after last coma is taken
*  presuming that getAll default value is false
*  - if parameter name is mentioned in selectorsNames, the appropriate vSO object is used
*  basing on fact that the index of this obj in vSOs array coinsides with 
*  index of selector Name in selectorsNames array
*
* @return { Objects Groups[]} - array of objects of all groups of selection
*/
handle.getGroups=function(pattGrs,rootFamily,vSOAGsOpt){
  Logger.log('inside getGroups');
  var vSOAGs=vSOAGsOpt||undefined;  
  var mode=handle.getPattGrsSelectMode(pattGrs,vSOAGs);  
  var gloss=PEleCom.inpData.sets.glossary;
  var dataGlossR, vSOAG;
  if((!gloss)||(!gloss.label)||(gloss.label!=='glossary')){
    var ssGloss=SpreadsheetApp.openById(Glossary.ssId);
    var sGloss=ssGloss.getSheetByName(Glossary.shName);
    dataGlossR=sGloss.getDataRange();
  }
  var dataGloss=((gloss)&&(gloss.label==='glossary'))?gloss.data:dataGlossR.getValues();
  var glShHeadInd=parseInt(Glossary.glossaryInitParameters.dataShHeadInd,10); // Glossary header row index =1
  var headGloss=dataGloss[glShHeadInd];
  var js=handle.jObj(headGloss);
  var jLbl=parseInt(js.label,10);
  
  //var ind=rootFamily.ind;
  // Explanation: ind[groupLabel]==ir  row index in data[ir][j]  or 
  // returns a row index of glossary for specified group named grpoupName
  
  // forms individual groups' objects and ind-object 
  var irIni=glShHeadInd+1;
  for(var ir=irIni;ir<dataGloss.length;ir++){
    var grLabel=dataGloss[ir][jLbl];
    var checkRes=PEleCom.handle.checkValueByPatts(pattGrs,grLabel);
    if( checkRes||checkRes===0){
      // grLabel compliant with pattGRs
      rootFamily.number++;
      rootFamily.names.push(grLabel);
      var name=grLabel;
      rootFamily.ind.add(name,ir);
      rootFamily=PEleCom.addGroup(name,rootFamily);
      var gr=rootFamily[name];
      // gets selectors values from Glossary
      for(var ic=0;ic<headGloss.length;ic++ ){
        var selector=headGloss[ic];
        var value;
         // gets values depending on selecting modes and selectors types
        if((/^data/.test(selector))||(/^doc/.test(selector))||(/folder/i.test(selector))){
          //special selectors with possible csv-string
          var cellValue;
          
          if(!/VSO/.test(mode)){
            // vSO is not defined (without possible csv-string format)
            cellValue=(dataGloss[ir][ic]===0)?0:dataGloss[ir][ic];
            if(typeof cellValue!=='number'){
              var u=new Unmask(cellValue);
              value=u.last();
            }else{
              value=cellValue;
            }
            gr[selector]=value;
            gr.properties.add( selector,value);
          }else{
            // vSO is set
            if( Number.isInteger(checkRes) ){
              vSOAG=vSOAGs[checkRes];
            }else{
              vSOAG=vSOAGs;
            }
            if( vSOAG.getAll===true ){
              cellValue=dataGloss[ir][ic];
              gr[selector]=cellValue;
              gr.properties.add( selector,cellValue);
            }else{
              // getAll==false case
              var iname=vSOAG.names.indexOf(selector);
              if( iname>=0 ){
                // current selector is mentioned in vSOAG object
                var vSO=vSOAG.vSOArr[iname];
                if( vSO.ind ){
                  cellValue=dataGloss[ir][ic];
                  var unm=new Unmask(cellValue);
                  value=unm.v( parseInt(vSO.ind,10) );
                }else{
                  value=PEleCom.handle.getParamUnique(
                  gr.label,selector,{lbls:vSO.p2Name,vals:vSO.p2Value});
                }
                  gr[selector]=value;
                  gr.properties.add( selector,value);
              }
            }
          }
        }else{
          // selectors without possible csv-string format
          value=dataGloss[ir][ic];
          gr[selector]=value;
          gr.properties.add( selector,value);
        }
      }
      var dSrcId=gr.dataSrcId;
      var dShName=gr.dataShName;
      //var dSrcTMark=gr.dataSrcTMark;
      var ssGr=SpreadsheetApp.openById(dSrcId);
      var sGr=ssGr.getSheetByName(dShName);
      var sGrDRange=sGr.getDataRange();
      gr.data=sGrDRange.getValues();
      // indices values for columns of data set sheet
      var dSHInd=(gr.dataShHeadInd)?parseInt(gr.dataShHeadInd,10):0;
      if( (gr.data.length)&&(gr.data.length>dSHInd+1)){
        var dataShHeader= gr.data[dSHInd];
        gr.dataShHeader=dataShHeader;
        gr.jsData=(gr.data.length)? handle.jObj(dataShHeader):null;
        // objects of data set columns datas ( data array of cells values excluding header cell)
        gr.dataSetClmns={};
        var dataSetClmns=gr.dataSetClmns;
        dataSetClmns.add=function(a,b){
          dataSetClmns[a]=b;
        };
        if( (gr.data.length)&&(gr.data.length>dSHInd+1)){
          // data set sheet murkUp datas
          gr.dataMarkUp={};
          for(var icl=0;icl<dataShHeader.length;icl++){
            var dataOfClmn=[];
            for( var i=dSHInd+1;i<gr.data.length;i++){
              dataOfClmn.push( [ gr.data[i][icl] ]  );
            }
            dataSetClmns.add( dataShHeader[icl],dataOfClmn);
          }
          gr.dataMarkUp.bgColor=((sGrDRange)&&(gr.bgColor))?sGrDRange.getBackgrounds():[];
          gr.dataMarkUp.fontLine=((sGrDRange)&&(gr.fontLine))?sGrDRange.getFontLines():[];
          gr.dataMarkUp.fontColor=((sGrDRange)&&(gr.fontColor))?sGrDRange.getFontColors():[];
          gr.dataMarkUp.fontWeight=((sGrDRange)&&(gr.fontWheight))?sGrDRange.getFontWeights():[];
          gr.dataMarkUp.fontStyle=((sGrDRange)&&(gr.fontWheight))?sGrDRange.getFontStyles():[];
        }
      }
    }
  }
  return rootFamily;
};
/**
* varifies type of pattsGroups parameter to specify setAnalysingGroupsMode:
* 1.if pattGroups is RegExp or array of RegExp - groups have been already
* declared in Glossary are set for analizing
* 2.if pattGroups is Object of Array of objects - new groups are
* introduced by these objects, are added to output.dataGroups and
* spreadsheets and sheets are created for for those groups
*
* @param {RegExp|Array RegExp[]|Object|Object[]}pG - abbr. of pattsGroups - RegExp patterns or 
*   array of RegExp patterns or object or array of objects determining new output
*   group(s). The type of this parameter determines calculation mode followed
* @return {string|Boolean} pattern type str indicator or Boolean false in bad cases
*   variants: 'existedArr'|'existed'|'newObj'|false
*   mnemonic type mark tp:'RE'|'ArrRE'|'Obj'|'ArrObj'      
*/
handle.checkGrExistence=function(pG){
  var tp='';
  if(Array.isArray(pG)){
    if((pG.length)&&(pG.length>0)){
      if(pG[0] instanceof RegExp){
        tp='ArrRE';
        return 'existedArr';
      }else if((typeof pG[0]==='object')&&(pG[0].lables)){
        tp='ArrObj';
        return 'newObjArr';
      }
    }else{
      tp='emptyArr';
      return false;
    }
  }else if((typeof pG ==='object')&&(!( pG instanceof RegExp))){
    if( pG.labels){
      if((pG.labels.length)&&(pG.labels.length>0)){
        tp='Obj';
        return 'newObj';
      }else{
        tp='emptyLabelsArr';
        throw 'pattsGroups.labels array could not be empty! ';
        //return false;
      }
    }
  }else if(pG instanceof RegExp){
        tp='RE';
        return 'existed';
  }else{
    tp='undefined';
    return false;
  }
};
/**
  * additional method to make codes compact
  * Final Collection of groups data and getting groups (see setAnalysingGroups bellow)
  * @param {RegExp|Array RegExp[]}pattsGroups object of patterns to specify groups
  * @param {}rootFamily - family object to which groups determined 
  * @param {}vSOAGsOpt - versions specification objects array 
  *   see description in 
  * @return {Object} root Family object
  */  
PEleCom.handle.groupping=function(pattsGroups,rootFamily,vSOAGsOpt){
  
  var vSOAGs=vSOAGsOpt||undefined;  // versions Specification Objs Array
  var vSOAG;
  if( Array.isArray(pattsGroups) ){
    // patterns array case
    for(var iptt=0;iptt<pattsGroups.length;iptt++){
      var pttGroup=pattsGroups[iptt];
      if(vSOAGs){      
        vSOAG=vSOAGs[parseInt(iptt,10)];  // vSO - versionsSpecificObj 
        rootFamily=handle.getGroups(pttGroup,rootFamily,vSOAG);
      }else{
            rootFamily=handle.getGroups(pttGroup,rootFamily);
      }
    }
  }else{
    // single pattern case
    vSOAG=vSOAGs;
    if(vSOAG){
      try{
        if(Array.isArray(vSOAG)){
          throw 'vSOArr should not be array while pattGrs is not';
        }else{
          rootFamily=handle.getGroups(pattsGroups,rootFamily,vSOAG);
        }
      }catch(e){
        Logger.log(
          "Error occured:"+e+"\nvSOAG discarded");
      }      
    }else{
      rootFamily=handle.getGroups(pattsGroups,rootFamily);
    }
  }
  return rootFamily;
};
/**
 * 1. Sets analizing Groups and parameters. 
 * Each group will be a property-object of rootObject. 
 * For input data rootObject is inpData.sets; for output - output.dataGroups
 * By default rootObj=Output.dataGroups object
 *             .nubmer
 *             .names  [strings]
 *             .groups [{},..{}]
 *             .group0
 *             .group1
 *             ....
 *             .groupLast
 *       and fills in root object
* @param {Array RegExps[]}pattsGroups - patterns of groups' names being selected
* @param {object}rootOpt - Optional. Root object which is to be filled in. 
*
* 2.In addition to actions on existing groups setAnalysingGroups permits to handle with newly 
* creating groups. This takes place while pattsGroups parameter is an object or
* array of objects setting attributes of newly creating output groups and their
* spreadsheets and sheets. In this case the concept 'setterns' in contrast( or analogy) to 'patterns'
* is introduced.
* @param {RegExp|Array RegExp[]|Object{string:value}|Object[{string:value}]}pattsGroups - 
*   pattern(s) or settern(s) of new group(s)
* @param {Array Object[]}vSOAGsOpt -versionSpecificObjArrOpt - see description of this parameter upper 
*   in explanations to method .getGroups ( somewhere abbriviation vSO or vSOArr is used)
* @ return{Object} rootFamiy object
*/
PEleCom.handle.setAnalysingGroups=function(pattsGroups,rootOpt,vSOAGsOpt){
  Logger.log('inside sAG');
  var chk=handle.checkGrExistence(pattsGroups);
  if(!chk){ throw 'pattsGroups is not set adquately!'; }  
  var rootFamily=rootOpt||PEleCom.output.dataGroups;
  var isOutFamily=(rootFamily.im!=='sets')?true:false;
  // analizing groups 
  rootFamily.number=(!(rootFamily.number))?0:rootFamily.number;
  if( (rootFamily.number==0)&&(rootFamily.names.length)&&(rootFamily.names.length>0)){
    rootFamily.names.splice(0);
  }
  
  // creates sheets for output groups if they are absent
  var newGSO;
  if(isOutFamily){
    
    if( /existed/.test(chk) ){
      Logger.log('existing group case');
      PEleCom.output.createSheetsForPatternsGroups(pattsGroups);
    }else if(/new/.test(chk)){
      // setting new group(s) objects and sheets 
      // -- newGS - newGroupsSetting Object      
      
      newGSO=(chk==='newObj')?[pattsGroups]:pattsGroups;      
      for(var ngs=0;ngs<newGSO.length;ngs++){
        var newGS=newGSO[ngs];       
        var mode=newGS.mode;
        //var oneSsForAll=PEleCom.output.oneSsForAllMode;
        var tM=(newGS.tMark)?newGS.tMark:PEleCom.output.timeMark;
        
        // difference between 'oneSsForAll' and 'allNewInOne':
        //  'oneSsForAllMode' - all output sheets for output groups should be contained in one common spreadsheet
        //     including those new oned wha are set by newGS object
        //  'allNewInOne' if =true  -  all sheets for new groups' labels should be placed in 
        //  common separate  spreadsheet. This spreadsheet should not obligatorily coinside with 
        //  spreadsheet presumed by oneSsForAllMode. It's id is set by newGS.ssIdAllNewInOne {string}
        //  in new logic insted of allNewInOne mode parameter with value 'newBatch' is used
        //  as well as ssIdNewBatch insted of oneSsForAllInOne
        var keyWords;
        if(mode==='newBatch'){
          // allNewInOne=true new  spreadsheet for all new groups determined by newGS.labels array
          var ssIdNewBatch=newGS.ssIdNewBatch;
          
          if(ssIdNewBatch){
            keyWords=(newGS.keyWords)?newGS.keyWords:'newBatch_ssIdIsSet';            
            PEleCom.output.createSheetsForPatternsGroups(newGS,keyWords,tM,mode,ssIdNewBatch);
          }else{
            keyWords=(newGS.keyWords)?newGS.keyWords:'newBatch_ssIdNotSet';
            PEleCom.output.createSheetsForPatternsGroups(newGS,keyWords,tM,mode);
          }
            //throw 'id for allNewInOne spreadsheet id should be set at this mode by property newGS.ssIdAllNewInOne';
        }else if(mode==='eachAlone'){
              PEleCom.output.createSheetsForPatternsGroups(newGS,keyWords,tM,mode);
        }else{
          // new spreadsheet and sheet per each new group or all groups sheets in oneSsFroAll
          keyWords=(newGS.keyWords)?newGS.keyWords:'newOutputGroups';
          PEleCom.output.createSheetsForPatternsGroups(newGS,keyWords,tM);
        }
      }
    }else{
      throw 'pattsGroups is set badly!';
    }
  }
  Logger.log('before Groupping');
  // -- GrouppinG --
  if(/new/.test(chk)){
    for(var ngrs=0;ngrs<newGSO.length;ngrs++){
      var newGS1=newGSO[ngrs];
      var labels=newGS1.labels;
      // creates array of RegExp patterns 
      var pGRE=[];
      for(var il=0;il<labels.length;il++){
        // transforms label into RegExp
        pGRE.push(new RegExp(labels[il]));
      }
      rootFamily=(vSOAGsOpt)?
        PEleCom.handle.groupping(pGRE,rootFamily,vSOAGsOpt):
      PEleCom.handle.groupping(pGRE,rootFamily);
    }
  }else{
    // existed
    Logger.log('9 groupping existed mode');
    rootFamily=(vSOAGsOpt)?
      PEleCom.handle.groupping(pattsGroups,rootFamily,vSOAGsOpt):
    PEleCom.handle.groupping(pattsGroups,rootFamily);
  }
  
  
  Logger.log('after groupping rootFamily.im=%s',rootFamily.im); 
  return rootFamily;
};
/**
 * initiates Glossary in inpData.sets object
 */
Glossary.ini=function(){
  handle.setAnalysingGroups(/glossary/,PEleCom.inpData.sets);
};
Glossary.ini();
/**
* glossary.gRowInd - object
* returns multiInex object of reverse rows indices 
* i.e.  gRowInd[ groupLabel ]=index of row rendering group data as a string, hence
* parseInt( glossary.gRowInd[grLabel],10) is equal to row index for specified group
* where grLabel - group label
* .gRowInd is index of row containing group data (2d array of glossary data)
* !!!Important:  each line in glossary has valid index property( indicated in column 'index')
* beginning with 1.This property could be use to determine sheet row's index
* rowIndex= gr.index+gr.dataShHeadInd !!! gr.index parameter is correctly setting when new
* lines are added to glossary, therefore all indices are actual
* (Also look at family.ind property in iniPEleComIOGlossary
* @param {Object}glossary - input group's object. Object of glossary group, preliminary registered
*   in inpData.sets family
*/
PEleCom.handle.getGroupsRowsIndices=function(glossary){
  //var glossary=PEleCom.inpData.sets.glossary;
  var glossR=SpreadsheetApp.openById(glossary.dataSrcId).getSheetByName(glossary.dataShName).getDataRange();
  var d=glossR.getValues();
  var hind=glossary.dataShHeadInd;
  var js=PEleCom.handle.jObj(d[hind]);
  var j=parseInt(js.label,10);
  var mindGloss=PEleCom.handle.multiIndex.init(glossary.im+'Mind');
  for(var ir=hind+1;ir<d.length;ir++){
    mindGloss.add( d[ir][j],ir);
  }
  return mindGloss;
};
// see comment over two lines bellow
PEleCom.handle.getGroupsRowsIndices(PEleCom.inpData.sets.glossary);
PEleCom.inpData.sets.glossary.gRowInd=PEleCom.handle.multiIndex[PEleCom.inpData.sets.glossary.im+'Mind'];
// another way of assignment:
// PEleCom.inpData.sets.glossary.gRowInd=PEleCom.handle.getGroupsRowsIndices();
    
/**
* searches Glossary data and returns parentFolderId of spreadsheet with id=ssId
* @param {String}ssId - id of spreadsheet
* @return {String} id of parent folder
*/
handle.getParentFolderIdFromGloss=function(ssId){
  var glossary=PEleCom.inpData.sets.glossary;
  var d=glossary.data;
  var pattId=new RegExp(ssId);
  var glHInd=parseInt(glossary.dataShHeadInd,10);
  var is=handle.getIs('dataSrcId',d,d[glHInd]);
  var js=handle.jObj(d[glHInd]);
  var jPFldId=parseInt(js.parentFolderId,10);
  //at first -short test: presumes only one value version of dataSrcId and parentFloder 
  // appropriate  glossary sheet' cell contains string being value itself, not csv-string containing few
  if(is[ssId]){
    return d[parseInt(is[ssId],10)][jPFldId];
  }
  var j=parseInt(js.dataSrcId,10);
  var parFolder;
  for(var ir in is){
    var i=parseInt(is[ir],10);
    // following using logic d[i][j] = ir
    if( (d[i][j].search(pattId)>=0)&&(/[,]/.test(d[i][j]))){
      // few ssId-s in one csv-string
      var ivs=d[i][j].split(',');
      var iv=ivs.indexOf(ssId);
      var parFolders=d[i][jPFldId].split(',');
      parFolder=parFolders[iv];
      // important!! - concrete spreadshet having specified ssId could be located in
      // few different folders and rootFolder 'MyDrive'. Nevertheless it's the same spreadsheet
      // (see testSSheetInFewFolders in test.gs file on left sidebar). 
      // But these folders not coinside one another. In the case when exect identification is 
      // requied use method getParamFromGolssUnique with appropriate detailed data
      break;
    }else{
      throw( 'handle.getParentFolderIdFromGloss: Here cell value should be csv-string. Something is going wrong');
    }
  }
  return parFolder;
};

/**
* searches Glossary data and returns parameter's value using the value
* of another parameter instance
* !!!This method presumes assumption that selectors values' versions
* have no repeatting vaues!!! Or it only could select the first one among versions
* having value which is looked for and others are masked by '=' signs
* @param {string}paramLabel - label of searching parameter
* @param {string}param2Name - label of parameter the instance value
*   of wich the searching is carried out
* @param {string}param2Value - value of base parameter
* @param {Integer}headerRowIndOpt - index of Glossary header's row
* @return {string} parameter value
*/
handle.getParamFromGloss=function(paramLabel,param2Name,param2Value,headerRowIndOpt){
  var hind=headerRowIndOpt||1;
  var d=PEleCom.inpData.sets.glossary.data;
  
  var is=handle.getIs(param2Name,d,d[hind]);
  var js=handle.jObj(d[hind]);
  var j=parseInt(js[paramLabel],10);
  // short search
  if(is[param2Value]){
    return d[ parseInt(is[param2Value],10)][j];
  }
  var pattId=new RegExp(param2Value);
 //var j2=parseInt(js[param2Name],10);
  var paramValue;
  for(var ir in is){
    var i=parseInt(is[ir],10);    
    if( pattId.test(ir)){
      var ivs=ir.split(',');
      var iv=ivs.indexOf(param2Value);
      
      
       var val=d[i][j];
      var u=new Unmask(val);
      //var paramValues=d[i][j].split(',');
      //var paramValue=paramValues[iv];
       paramValue=u.v(iv);      
      break;
    }
  }
  return paramValue;
};
/**
* searches Glossary data and returns parameter's value 
* for a group with label groupLabel using the value(s) of anchor
* parameters to determine neccessary parameters version or
* directly using number of version determining by versionOrderIndOpt
* parameter
* Searching parameter by value of another one permits to determine
* the appropriate parameter's version number but contains uncertainty:
* "horizontal" one - the uncertainty originating from the possibility that
* parameter's value of different virsion could be equal one another
* To avoid this ambiguity few 'anchor' parameters could be used.
* their labels and specified version values  are determined by 
* anchorParamLabels and anchorParamValues method's parameters

* single string case:
*   param2Name - label of second selector used to determine 
*     appropriate version of searching parameter
*   param2Value - value of additional second parameter 
*     searching to determine version
*     if the param2 has few versions with same values param2Value
*     the parameter versionOrder is used to specify wich one to use.
*     Optional :
*       if versionOrder == -1 the last version with value param2Value is taken
*       or versionOrder is the sequential index of version beginning with 0 determining
*       which one is to be taken
*     
* array of strings case
* While few parameters(colums of sheet) is neccesary for uniqe row selection
*   param2Name = [horizontalAnchorSelector,verticalAnchorSelector0,verticalAnchorSelector1,...selectorN]     
*   param2Value= [horAnchorValue,vertAValue0,vAValue1,...valueN]     
*
* @param {string}paramLabel - label of searching parameter
* @param {string|Array string[]}param2Name - label of parameter whose instance value
*   searching is carried out
* @param {string|Array string[]}param2Value - value of base parameter
* @param {Number}versionOrderIndOpt - ordering index of version in csv-string beginnning with 0
*     Optional. By default it's equal -1 which means that last version of parameter shoul be taken
*     this parameter is critical for searching when param2Anchor and param2Anchorvalues === undefined 
*     In this case this method takes determined version of parameter with label paramLabel as value of versionOrderIndOpt
*     Exapmle handle.getParamUnique('someSelector',[undefined,groupLabel],undefined,1) will evoke
* @param {Integer}headerRowIndOpt - index of Glossary header's row. Optional. default=1
* @return {string} parameter value
*/
handle.getParamFromGlossU=function(paramSelector,anchorSelectors,anchorSelectorsValues,groupLabelOpt,versionOrderIndOpt,headerRowIndOpt){
  var grLabel=groupLabelOpt||'';
  var versInd=versionOrderIndOpt||-1;
  var anchr={
    lbls:anchorSelectors,
    vals:anchorSelectorsValues,
    versInd: versInd
  };
  var hind=headerRowIndOpt||1;
  var glossary=PEleCom.inpData.sets.glossary;
  var d=glossary.data;
  var js=handle.jObj(d[hind]);
  if(!grLabel){
    // part using for compatability with old codes
    if(!Array.isArray(anchorSelectors)){
      //param2Anchor is not array   
      var pattId=new RegExp(anchorSelectorsValues);
      var is=handle.getIs(anchorSelectors,d,d[hind]);
      var j=parseInt(js[anchorSelectors],10);
      var jPar=parseInt(js[paramSelector],10);
      // short search
      if(is[anchorSelectorsValues]){
        return [d[ parseInt(is[anchorSelectorsValues],10)][jPar],0];
      }
      var paramValue,iv;
      for(var ir in is){
        var i=parseInt(is[ir],10);    
        if( pattId.test(d[i][j])){
          var ivs=d[i][j].split(',');
          iv=ivs.indexOf(anchorSelectorsValues);            
          var paramValues=d[i][jPar].split(',');
          paramValue=paramValues[iv];
          break;
        }
      }
      return [paramValue,iv];
    }else{
        //param2Anchor is array
      Logger.log('multi column anchor selectors handling shoould be determined here');
    }
    
  }else{    
    var result=handle.getParamUnique(grLabel,paramSelector,anchr,headerRowIndOpt);
    return result;
  }
};
/**
*
* @param {string}grLabel - group's label
* @param {strtin}paramSelector - property selector name for group
* @param {Object}anchorOpt if es set it's anchor-object using to specify paramSelector version using
* another or other selectors values anchor={lbls:[],vals:[],versInd:}
*     .lbls - selectors' labels  {Array string[]| string}
*     .vals - appropriate selector' values
*     .versInd - index of version
* @param {number}headerRowIndOpt - index of header row.Default =1
* @return {} value of selector for specified version or for the last one or the only one
*
*/
handle.getParamUnique=function(grLabel,paramSelector,anchorOpt,headerRowIndOpt){
  
  var anchr=anchorOpt||undefined;
  var versInd=(anchr)?((anchr.versInd)?anchr.versInd:undefined):-1;
  var glossary=PEleCom.inpData.sets.glossary;
  var d=glossary.data;
  var hind=headerRowIndOpt||1;
  var js=handle.jObj(d[hind]);
  var i=parseInt(glossary.gRowInd[grLabel],10);
  var jPar=parseInt(js[paramSelector],10);
  var val=d[i][jPar];
  //----  funcs  ----
  /**
  * returns value appropriate to equal sign
  * @param {Array string[]}vs - array of string values contained '=' sign to mask equalig to some 
  *    element value preceeded
  * @param {number Integer}iv - index of actual element in consideration which is equal to '='
  * @return {string} appropriate value of unmasked '=' string
  */
  var unEqual=function(vs,iv){
    for(var ivn=iv-1;ivn>=0;ivn--){
      if(vs[ivn]!=='='){
        return vs[ivn];
      }
    }
  };
  /**
  * replaces equal signs by its' values
  * @param {Array string[]}vs - array of string elements obtained after arraying csv-string
  * @return {Array string[]} array filled in after exchanging all '=' by their values
  */
  var reEquals=function(vs){
    var vsNew=[];
    for(var i=0;i<vs.length;i++){
      if(vs[i]==='='){
        vsNew.push(unEqual(vs,i));
      }else{
        vsNew.push(vs[i]);
      }
      //vs[i]=(vs[i]==='=')?unEqual(vs,i):vs[i];
    }
    return vsNew;
  };
  //----   funcs  ----
  var vs,v;
  if( (anchr===undefined)||(!anchr.lbls)||(!anchr.vals)){
    // additional selectors are not used
    if(/[,]/.test(val)){
      vs=val.split(',');
      v=((versInd===-1)||(versInd===undefined))? vs.slice(-1)[0]:vs[versInd];
      if(v!=='='){
        if((versInd===-1)||(versInd===undefined)){
          return [v,(vs.length-1)];
        }else{
          return [v,versInd];
        }
      }else{
        var ivnIni=((versInd===-1)||(versInd===undefined))?
          vs.length-2:versInd-1;
        // last version
        for(var ivn=ivnIni;ivn>=0;ivn--){
          if(vs[ivn]!=='='){
            return [vs[ivn],(ivnIni+1)];
          }
        }
        throw('logic does not permit to come here.Something wrongs us');
      }        
    }else{      
      return [val,0];
    }
  }else{
    // additional anchor selector(s) is(are) used for select value version
    var aSels=anchr.lbls;
    var aSVals=anchr.vals;
    if((!Array.isArray(aSels))||(aSels.length==1)){
      // single additionl selector
      var j=(js[aSels])?parseInt(js[aSels],10):undefined;
      if(!j){
        throw( 'getParamUnique: probably secondory selector label is incorrect!');
      }else{
        var valSel=d[i][j];
               
        if(/[,]/.test(valSel)){
          var vas=valSel.split(',');
          var vasF=reEquals(vas);
          var mindVs=PEleCom.handle.multiIndex.init('vas');
          for(var ii=0;ii<vasF.length;ii++){
            mindVs.add(vasF[ii],ii);
          }
          if(!mindVs.r[aSVals]){
            // no repeating element equal to aSVals
            var iv=vas.indexOf(aSVals);
            var vsa=d[i][jPar].split(',');
            v=vsa[iv];
            if(v!=='='){
              return [v,iv];
            }else{
              for(var iivn=iv-1;iivn>=0;iivn--){
                if(vsa[iivn]!=='='){
                  return [vsa[iivn],iv];
                }
              }
              throw('logic does not permit to come here.Something wrongs us');
            }
          }else{
            throw('.getParamUnique: anchor selector used can not to exclude ambiguity. Check it or Assign another one!');
          }
        }else{          
          v=d[i][jPar];
          return [v,0];
        }      
      }    
    }else{
      // multiple secondary selector (is not used)
      
      
      for(var ias=0;ias<aSels.length;ias++){
        var asl=aSels[ias];
        var asv=aSVals[ias];
        // single secondary selector
        var jj=(js[asl])?parseInt(js[asl],10):undefined;
        if(!jj){
          throw( 'getParamUnique: Multiple selectors.Probably achor selector label '+asl+' is incorrect!');
        }else{
          var valSelec=d[i][jj];               
          if(/[,]/.test(valSelec)){
            var vass=valSelec.split(',');
            var vassF=reEquals(vass);  // equal signs were being exchanged by values
            var mindVss=PEleCom.handle.multiIndex.init('vass');
            for(var i1=0;i1<vassF.length;i1++){
              mindVss.add(vassF[i1],i1);
            }
            if((mindVss.r[asv].length)&&(mindVss.r[asv].length==1)){
              // no repeating element equal to aSVals
              var iv1=vassF.indexOf(asv);
              var vsm=d[i][jPar].split(',');
              var v1=vsm[iv1];
              if(v1!=='='){
                return [v1,iv1];
              }else{
                for(var ivn1=iv1-1;ivn1>=0;ivn1--){
                  if(vsm[ivn1]!=='='){
                    return [vsm[ivn1],iv1];
                  }
                }
                throw('logic does not permit to come here.Something wrongs us');
              }
            }else{
              // additional selector value is ambiguous. Let's try another one
              if(ias!=(aSels.length-1)){
                continue;
              }else{
                throw('.getParamUnique: anchors selectors used can not to exclude ambiguity. Check it or Assign another one!');
              }
            }
          }else{          
            v=d[i][jPar];
            return [v,0];
          }      
        }
      }
    }    
  }  
};
/**
*
* @param {string}grLabel - group's label
* @param {strtin}paramSelector - property selector name for group
* @param {Object}anchorOpt if is set it's anchor-object using 
*   to specify paramSelector version using another or other
*   selectors values 
*   @example
*   anchor={lbls:[],vals:[],versInd:}
*     .lbls - selectors' labels  {Array string[]| string}
*     .vals - appropriate selector' value(s) {value|Array value[]}
*     .versInd - index of version
* @param {number}headerRowIndOpt - index of header row.Default =1
* @return {} value of selector for specified version or for the last one or the only one
*
*/
handle.getParamUniqueUnmask=function(grLabel,paramSelector,anchorOpt,headerRowIndOpt){  
  var anchr=anchorOpt||undefined;
  var versInd=(anchr)?((anchr.versInd)?anchr.versInd:undefined):-1;
  var glossary=PEleCom.inpData.sets.glossary;
  var d=glossary.data;
  var hind=headerRowIndOpt||1;
  var js=handle.jObj(d[hind]);
  var i=parseInt(glossary.gRowInd[grLabel],10);
  var jPar=parseInt(js[paramSelector],10);
  var val=d[i][jPar];
  var u=new Unmask(val);
  var n=u.n;
  if(n==1){
    return [val,0];
  }  
  if( (anchr===undefined)||(!anchr.lbls)||(!anchr.vals)){
    // additional selectors are not used
    if(n>1){
      if((versInd===-1)||(versInd===undefined)){
        return [u.last(),n-1];
      }else{
        return [u.v(versInd),versInd];
      }      
    }    
  }else{
    // additional anchor selector(s) is(are) used for select value version
    var aSels=anchr.lbls;
    var aSVals=anchr.vals;
    if((!Array.isArray(aSels))||(aSels.length==1)){
      // single additionl selector
      var j=(js[aSels])?parseInt(js[aSels],10):undefined;
      if(!j){
        throw( 'getParamUnique: probably secondory selector label is incorrect!');
      }else{
        var valSel=d[i][j];
        var uSel=new Unmask(valSel);
        if(uSel.n>1){
          var vas=uSel.arr;
          var vasF=uSel.vs();
          var mindVs=PEleCom.handle.multiIndex.init('vas');
          for(var ii=0;ii<vasF.length;ii++){
            mindVs.add(vasF[ii],ii);
          }
          if((mindVs.r[aSVals].length)&&(mindVs.r[aSVals].length==1)){
            // no repeating element equal to aSVals
            var iv=vas.indexOf(aSVals);
            return [u.v(iv),iv];
          }else{
            throw('.getParamUnique: anchor selector used can not to exclude ambiguity. Check it or Assign another one!');
          }
        }else{          
          return [val,0];
        }      
      }    
    }else{
      // multiple secondary selector (is not used)
      for(var ias=0;ias<aSels.length;ias++){
        var asl=aSels[ias];
        var asv=aSVals[ias];
        // single secondary selector
        var jj=(js[asl])?parseInt(js[asl],10):undefined;
        if(!jj){
          throw( 'getParamUnique: Multiple selectors.Probably achor selector label '+asl+' is incorrect!');
        }else{
          var valSelec=d[i][jj];
          var uSelec=new Unmask(valSelec);
          if(uSelec.n>1){
            var vass=uSelec.arr;
            var vassF=uSelec.vs();
            var mindVss=PEleCom.handle.multiIndex.init('vass');
            for(var i2=0;i2<vassF.length;i2++){
              mindVss.add(vassF[i2],i2);
            }
            if((mindVss.r[asv].length)&&(mindVss.r[asv].length==1)){
              // no repeating element equal to aSVals
              var ivv=vass.indexOf(asv);
              return [u.v(ivv),ivv];
            }else{
              // additional selector value is ambiguous. Let's try another one
              if(ias!=(aSels.length-1)){
                continue;
              }else{
                throw('.getParamUnique: anchors selectors used can not to exclude ambiguity. Check it or Assign another one!');
              }
            }
          }else{          
            return [val,0];
          }   
        }
      }
    }    
  }  
};
/**
* searches Glossary data and returns parameter's value using the value
* of another parameter instance
* !!!This method presumes assumption that selectors values' versions
* have no repeatting values!!! Or it only could select the first one among versions
* having value which is looking for and others are masked by '=' signs
* @param {string}paramLabel - label of searching parameter
* @param {string}param2Name - label of parameter the instance value
*   of wich the searching is carried out
* @param {string}param2Value - value of base parameter
* @param {Integer}headerRowIndOpt - index of Glossary header's row
* @return {Array [string,number]} array of [parameter value string, order index of parameter value in csv string]
*/
handle.getParamDepthFromGloss=function(paramLabel,param2Name,param2Value,headerRowIndOpt){
  var hind=headerRowIndOpt||1;
  var d=PEleCom.inpData.sets.glossary.data;
  var pattId=new RegExp(param2Value);
  var is=handle.getIs(param2Name,d,d[hind]);
  var js=handle.jObj(d[hind]);
  var j=parseInt(js[param2Name],10);
  var jPar=parseInt(js[paramLabel],10);
  // short search
  if(is[param2Value]){
    return [d[ parseInt(is[param2Value],10)][j],0];
  }
  var iv,paramValue;
  for(var ir in is){
    var i=parseInt(is[ir],10);    
    if( pattId.test(d[i][j])){
      var ivs=d[i][j].split(',');
      iv=ivs.indexOf(param2Value);
      var val=d[i][jPar];
      var u=new Unmask(val);
      //var paramValues=val.split(',');
      //var paramValue=paramValues[iv];
      paramValue=u.v(iv);
      break;
    }
  }
  return [paramValue,iv];
};
/**
* Selects groups' names and rows indices using RegExp patterns
* from Glossary
* @param {Array RegExp[]}pattGrs - array of regExp patterns to select groups
*@return {Object} { names:[]
*                  iRows:[]
*                  r:{ names[i]: [iRows[i]]   - r-property of mind
*                }
*/
handle.selectGroupsInGloss=function(pattGrs){
  Logger.log('inside selectGroupsInGloss');
  // creates multiindex for lable matching patterns
  var mindPattGrs=handle.multiIndex.init('matchPattGrs');
  var glossary=PEleCom.inpData.sets.glossary;
  var d=glossary.data;
  var glHInd=parseInt(glossary.dataShHeadInd,10);
  var glHeader=d[glHInd];
  var js=handle.jObj(glHeader);
  var jLbl=parseInt(js.label,10);
  for(var i=glHInd+1;i<d.length;i++){
    var grLabel=d[i][jLbl];
    if( handle.testValueByPatts(pattGrs,grLabel)){
      mindPattGrs.add(grLabel,i);
    }
  }
  var o={names:[],iRows:[]};
  for(var ir in mindPattGrs.r){
    o.names.push(ir);
    o.iRows.push(mindPattGrs.r[ir].toString());
  }
  o.r=mindPattGrs.r;
  return o;
};
/**
* Unmask-class
* Evokes values from csvString (now under csv-string is presumed only one line
* without ;) used to combine different versions values in one string
* example: ',asd,a,=,b,=,124,=' or 'adc,=' or 'a'
* equal signs are used to render value if it's equal to previous one
* call: var u=new Unmask(csvStr)
* properties:
*   u.str - csvStr itself
*   u.nv - number of versions masked(dimension)
* methods
*   u.last() - last version valuew
*   u.eqs() - array presentation of csvStr by means of split(',')
*   u.vs() - array of values where all equals sign are changed by their values
*   u.v() - last value
*   u.v(i Number), where i-{Integer} is index of version. The first version has index 0
*   u.v(anchor Object) , where anchor -{Object} anchor object with three properties
*                        anchor={
*                                 lbls:string|Array[] ,  //label or labels of additional selector(s) which
*                                                        // permit(s) to determine index of searching version
*                                 vals:string|Array[] ,  // value or values of selector set by .lbls property
*                                 
*                                 iv: number  // version index for version in search
*                                }
*  important!!: anchor object using here is analogue to vSO -object versionSpecificObject in
* getGroups method
*/
function Unmask(csv){
  this.str=csv;
  
  var csvArr=csv.split(',');
  var n=csvArr.length;
  this.arr=csvArr;
  this.n=n;
  
    /**
  * returns value appropriate to equal sign
  * @param {Array string[]}vs - array of string values contained '=' sign to mask equalig to some 
  *    element value preceeded
  * @param {number Integer}iv - index of actual element in consideration which is equal to '='
  * @return {string} appropriate value of unmasked '=' string
  */
  this.unEqual=function(vs,iv){
    for(var ivn=iv-1;ivn>=0;ivn--){
      if(vs[ivn]!=='='){
        return vs[ivn];
      }
    }
  };
  /**
  * replaces equal signs by its' values
  * @param {Array string[]}vs - array of string elements obtained after arraying csv-string
  * @return {Array string[]} array filled in after exchanging all '=' by their values
  */
  this.reEquals=function(vs){
    var vsNew=[];
    for(var i=0;i<vs.length;i++){
      if(vs[i]==='='){
        vsNew.push(this.unEqual(vs,i));
      }else{
        vsNew.push(vs[i]);
      }
      //vs[i]=(vs[i]==='=')?this.unEqual(vs,i):vs[i];
    }
    return vsNew; // vs;
  };
  /**
  * returns last version's value
  */
  this.last=function(){
     var vTrim=csv.replace(/([,][=])+$/,'');
     var lastVerV=vTrim.split(',').slice(-1)[0];
     return lastVerV;
  };
  /** 
  * return value of version i while it's rendered as equal sign or
  * value of previous version
  * @param {undefined|number}iv - index of version and the index of equal string in csvArr array
  * @return {} version value
  */
  this.eq=function(ivOpt){
    var iv=(ivOpt!==undefined)?ivOpt:undefined;
    if(iv===undefined){
      return this.last();
    }else if(typeof iv!=='number'){
      throw('version index should be a number');
    }else{
      if((iv>=this.arr.length)||(iv==0)){
        try{
          throw('unmask.eq:index number '+iv+' is too large or is equal to 0!');
        }
        catch(e){
          Logger.log(e);
        }
      }
      if(this.arr[iv]!=='='){
        return this.v(iv);
      }
      return this.unEqual(this.arr,iv);
    }
  };
  /**
  * return array of values for all version where every '=' sign is change by it's value
  */
  this.vs=function(){return this.reEquals(csvArr);};
  /**
  * returns version value depending of specific version parameter
  * @param {undefined|number|Object}svpOpt - parameter specifying version. There are three variant
  *   1. svpOpt is undefined - this means that last version is evoked
  *   2. svpOpt is integer number determining index of version
  *   3. svpOpt is Object determining anchor-Object - permits to determin version index on the basis of value of some selector
  *                                                 of specified group
  *              anchor={
  *                      grLabel:{string},    // label of group for which version value is determined by means of anchorObject
  *                      lbls:{string|Array string[]},
  *                      vals:{string|Array string[]}
  *                     }
  *                      
  *   In this variant initial csv is presumed of being some selector value of a group indicating in anchor.graLabel
  */
  this.v=function(svpOpt){
    var svp=(svpOpt!==undefined)?svpOpt:undefined;
    if(svp===undefined){
      return this.last();
    }else if(typeof svp==='number'){
      var iv=svp;
      var vls=this.vs();
      if(iv>=vls.length){
        try{
        throw('index number '+iv+' is too large!');
        }
        catch(e){
          Logger.log(e);
        }
      }
      return vls[iv];
    }else{
      if(svp.grLabel){
        return 'NOT PREPARED YET';
      }
    }
  };
        
}
function testUnmask(){
  
  var csv='abc,d,d,=,s,g,e,a,t,=,=,t';
  //var vLast=new Unmask(csv).last();
  var u=new Unmask(csv);
  
  var n=u.n;
  var arr=u.arr;
  var csvStr=u.str;
  var last=u.last();
  var vLast=u.v();
  var eq2=u.eq(2);
  var eq4=u.eq(8);
  var vs=u.vs();
  var v2=u.v(2);
  var v4=u.v(7);
  
  var eqNotEq=u.eq(3);  
  var eqNotEq1=u.eq(5);
  
  Logger.log('finishMaskTest1');
  Logger.log('finishMaskTest 2');
}
function testGetParam(){
  var paramSelector='dataSrcId';
  var grLabel='testWriting';
  //var iVers;
  var anchr,anchorSelectors,anchorSelectorsValues,versInd;
  if(1){
  	anchr={
    	lbls:['dataSrcTMark','dTStamp'],
    	vals:['170517_235830','1495054718594'],  // dataSrcId -> [id54,3] //'1495054716500'], // dataSrcId -> [id54,1] 1495054717965  // dataSrcId -> [id54,2]
    	versInd:2
  	};
   	anchorSelectors=anchr.lbls;
  	anchorSelectorsValues=anchr.vals;
  	versInd=anchr.versInd;
  }
  
  var parrU=PEleCom.handle.getParamUnique(grLabel,paramSelector,anchr); //,headerRowIndOpt);
  Logger.log(parrU);
  var parrUU=PEleCom.handle.getParamUniqueUnmask(grLabel,paramSelector,anchr); //,headerRowIndOpt);
  Logger.log(parrUU);
  
  /*
  var parrUUU=handle.getParamFromGlossU(paramSelector,anchorSelectors,anchorSelectorsValues,grLabel,versInd);//,headerRowIndOpt);
  Logger.log(parrUUU);
  var parrUUUU=handle.getParamFromGloss(paramSelector,anchorSelectors[1],anchorSelectorsValues[1]);
  var parrUUUUU=handle.getParamDepthFromGloss(paramSelector,anchorSelectors[1],anchorSelectorsValues[1]);
  */
  Logger.log('finishGetParamTest');
}
  