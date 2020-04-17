// ----- Setters ------ Setters ------ Setters ------- Setters -------
var sessionBN={bnd:[],nRows:0};
/* Spread Sheets Setters class(collection of setters spreadsheets) object */
var setters={
  bid:'setters',
  uid:'setters',
  name:'settersObject',
  parentBid:'VU',
  parentUid:'VU',
  nMembs:15,
  bids:['bid','uid','name','parentBid','parentUid','nMembs','bids','names','bType','legend','us','uids','ufs','fuids','fmemos'],
  names:['blockIdentifier','uniqueId','blockDescriptiveName','parentBlockIdentifier','parentUniqueIdentifier',
    'nunmberOfMembers','membersBids','membersDescriptiveNames',
    'memberBType','memberLegend',
    'univeralSetObjectOfUniqueObjectsGeneralCollection','arrayOfUniqueIds',
    'universalFunctionsSetObject','functionUniqueIdentifiersArray','functionsDescriptionsMemosArray'
  ],
  bType:'st',
  legend:'Spreadsheets Setters class(collection of setters spreadsheets) object',  
  us:{'setters':this},
  uids:['setters'],
  ufs:{},
  fuids:[],
  fmemos:[]
};
/**
* creates array of object childs' objects
* @param {Object}client - objet into consideration
* @return {Array Objects[]} array of object properties as separate objects
*/
setters.getChilds=function(client){
  var membs=[];
  var bids=client.bids;
  for(var im in bids){
    var bid=bids[im];
    var o={};
    o[bid]=client[bid];
    membs.push(o);
    //membs.push({'"'+bid+'"':member[ bids[im] ]});
  }
   return membs;
};
/**
* return unique id of general collection member
* @param {string}parentUid - unique id of parent
* @param {string}bid - block's id
* @return {string} unique id of member of general collection
*                 object of member is membObj=setters.us[uid]
*                 parent object is parentObj=setters.us[parentUid]
*/
setters.getUid=function(parentUid,bid){
  return parentUid+'_'+bid;
};
/**
* Checks if member is stObject(settrs structure object) or not 
* @param {}member - member analyzing
* @param {string}bid - block identifier of memeber
* @return {Boolean} true or false
*/
setters.isStandardObj=function(member,memBid){    
  var go=( typeof member==='object')&&(!Array.isArray(member))?true:false;
  if(go){  
    var isGoogleObj=(memBid=='ss')||(memBid=='s')||(memBid=='sR')||(memBid=='sheets')?true:false;
    go=(isGoogleObj)?false:true;
  }
  return go;
};
/**
* Checks if member object is st-object
* Criteria: what is the facet of stObject?
* It is js-Object; is not Array-object; is not SpreadsheetApp-object;
* has prperty .bid, .bids, .stValue
* @param {Object}member - object
* @param {string}memBid - member block identifyer
* @return {Boolean} true if member is st-object otherwise false
*/
setters.isStObj=function(member,memBid){    
  var go= setters.isStandardObj(member,memBid);
  if(go){
    go=(member.bid)?go:false;
    go=((member.bids.indexOf('stValue')>=0))?go:false;
  }
  return go;
};
/**
* returns generic object model
*/
setters.getObjTemplate=function(){
  var obj= {
    bid:'objTemplate',
    uid:'setters_objTemplate',
    name:'objectTemplate',
    parentBid:'setters',
    parentUid:'setters',
    nMembs:16,
    bids:['bid','uid','name','parentBid','parentUid',
          'nMembs','bids','names','bType','legend','stValue',
          'iniRow','iBlRow','iniColName','nBlRows','stValueO'
         ],
    names:['bid','universalIdentifierOfBlock','blockName',
           'idOfParentBlock','uidOfParentBlock','nMembers','membersBids',
           'membersNames','bType','legend','stValue',
           'initialRowIndexOfBlockInSettersSheet','indexOfRowInParentBlock',
           'initialColumnName','numberOfBlockRows','elementSettersValueObject',
          ],
    bType:'objT',
    legend:'typical object',
    stValue:'',
    iniRow:'',
    iBlRow:'',
    iniColName:'',
    nBlRows:'',
    stValueO:{}
  };
  var basicBlockProps=['bid','uid','name','nMembs','bids','stValue',
           'parentBid','parentUid','iniRow','iBlRow','iniColName','nBlRows'];
  return obj;
};
/**
* Gets structure's names from StructureAndNames spreadsheet
* @return {Object} object with properties
*  .ssId - id of structureNames spreadsheet
*  .bnSheetName - sheetName containing basicNames data 
*  .bTypes - array of names' bTypes
*  .bTypesProps - bProps of bType object. It's array of
*     elemntary objects
*     [ {bType:[prop0,porp1,...propLast]} ]
*  .bTPropsStLabels -
*  .bTPropsAttributes -
*  .mindBT
*  .mindBTP
*  .basics
*/
setters.getBasicNames=function(bnSheetNameOpt,ssIdOpt){
  var basicNames=setters.getObjTemplate();
  basicNames.bid='basicNames';
  var ID_STRUCTURE_AND_NAMES='1F8kYXic9ATkBWOblo8a6tgJ_7g1hi88Cl-el9Hn5-XE';
  basicNames.ssId=ssIdOpt||ID_STRUCTURE_AND_NAMES;   //ss 'structureAndNames' in folder ' smsCIK_Analysis/
  basicNames.bnSheetName=bnSheetNameOpt||'namesOfStructure5';
  
  var d=SpreadsheetApp.openById(basicNames.ssId).getSheetByName(basicNames.bnSheetName).getDataRange().getValues();
  basicNames.data=d;
  var jsBN=handle.jObj(d[0]);  
  var mindBT=handle.multiIndex.init('bT');
  for(var i=1;i<d.length;i++){
    mindBT.add(d[i][parseInt(jsBN.bType,10)],i);
  }
  
  /** 
  * Refreshes index column
  * @return updating basicNames.data array
  */
  basicNames.refreshIndex=function(){
    var d=basicNames.data;
    for(var i in d){
      var j=parseInt(jsBN.index,10);
      d[i][j]=(i!=0)?i:d[i][j];
    }
    return d;
  };
  basicNames.refreshIndex();
  basicNames.mindBTP={};
  /**
  * Creates multiIndex object mBTP-s vs. row's indices
  * mBTP parameter -  bType_bProp for each structure elements
  * This particular method presumes that consequence of rows is so
  * That each row setting new group bType is followed by it's properties rows
  * It means that basicNames data sheet shoul be parepared in special way
  * excluding deviation from the order bType row first and properties rows are closest next
  * @return {Object} multiIndex object handle.multiIndex.bTP
  */
  basicNames.getMindBTP=function(){
    var d=basicNames.data;
    var jsBN=handle.jObj(d[0]);
    var mindBTP=handle.multiIndex.init('bTP');
    var bt, btp, bprnt;
    var jBType=parseInt(jsBN.bType,10);
    var jBProps=parseInt(jsBN.bProps,10);
    var jParent=parseInt(jsBN.parent,10);
    var jMBTP=parseInt(jsBN.mBTP,10);
    for(var i=1;i<d.length;i++){      
      bt=(d[i][jBType])?d[i][jBType]:bt;
      btp=(d[i][jBProps])?d[i][jBProps]:'';
      var prnt=d[i][jParent];
      bprnt=(prnt)?prnt:((btp)?bt:'vu');
      var mBTP=(btp)?bt+'_'+btp:bt;
      mindBTP.add( mBTP,i);
      d[i][jMBTP]=mBTP;
      d[i][jParent]=bprnt;
    }
    return mindBTP;
  };
  basicNames.mindBTP=basicNames.getMindBTP();
  /**
  * Creates multiIndex object and refills in basicNames.data array
  * Alternative method to determine mindBTP
  * (a row describing bType itself has bid=bType and '' in bProps column
  * which handle values bType_bProp (or only bType for bType-block)
  * of rows for each structure elements.
  * @return {Object} multiIndex object handle.multiIndex.bTP
  */
  basicNames.getMindBTPAlt=function(){
    var d=basicNames.data;
    var jsBN=handle.jObj(d[0]);
    var mindBTP=handle.multiIndex.init('bTP');
    var bt; var btp; var bid; var prnt; 
    for(var i=1;i<d.length;i++){
      // for each row
      prnt=d[i][parseInt(jsBN.parent,10)];
      bt=d[i][parseInt(jsBN.bType,10)];
      btp=d[i][parseInt(jsBN.bProps,10)];            
      var mBTP=(btp)?prnt+'_'+btp:bt;
      mindBTP.add( mBTP,i);
      d[i][parseInt(jsBN.mBTP,10)]=mBTP;
    }
    return mindBTP;
  };
  /**
  * @return object with bTypes parameters
  *        .bTypes
  *        .bTypesStLabels
  *        .bTypesAttribs
  *        .mindBT
  */
  basicNames.getTypesParams=function(){
    basicNames.data=basicNames.refreshIndex();
    var d=basicNames.data;
    var jsBN=handle.jObj(d[0]);  
    var mindBT=handle.multiIndex.init('bT');
    for(var i=1;i<d.length;i++){
      var bid=d[i][parseInt(jsBN.bid,10)];
      var bt=d[i][parseInt(jsBN.bType,10)];
      if(bt==bid){
        mindBT.add(bt,i);
      }
    }
    var btsStLabels={};
    var btsAttribs={};
    var bts=[];   // bTypes array
    for(var im in mindBT.v){
      var btv=mindBT.v[im];
      var ii=parseInt( mindBT[im],10);
      var stLabel=d[ii][parseInt(jsBN.stLabel,10)];
      if( stLabel||stLabel===0 ){
        btsStLabels[btv]=stLabel;
      }
      btsAttribs[btv]={};
      for( var j in d[0]){      
        var attr=d[0][j];
        var attrV=d[ii][j];
        if( attrV||attrV===0){
          btsAttribs[btv][attr]=attrV;
        }  
      }
      bts.push(btv); // bTypes []
    }
    
    return {bts:bts,
            stLabels:btsStLabels,
            attribs:btsAttribs,
            mindBT:mindBT
           };
  };
  var bts=basicNames.getTypesParams();
  basicNames.bTypes=bts.bts;
  basicNames.bTypesStLabels=bts.stLabels;
  basicNames.bTypesAttribs=bts.attribs;
  basicNames.mindBT=bts.mindBT;  
  /**
  * returns array of properties which obligatory should be set
  *@return {Array}
  */
  basicNames.getBasicsArr=function(){
    var bscs=[];
    var nextBsc=basicNames.bTypes[ basicNames.bTypes.indexOf('basics')+1];
    for(var ib=parseInt(mindBT.basics,10)+1;ib<parseInt(mindBT[nextBsc],10);ib++){
      bscs.push( d[ib][ parseInt( jsBN.bProps,10)]);
    }
    return bscs;
    //['bid','uid','name','nMembs','bids','stValue','parentBid','parentUid','iniRow','iBlRow','iniColName','nBlRows'];
  };
  basicNames.basics=basicNames.getBasicsArr();
  /**
  * forms propertie and attributes arrays for each bType 
  */
  basicNames.getBTypesPropsAttributes=function(){
    var d=basicNames.data;
    var mindBT=basicNames.mindBT;
    var jsBN=handle.jObj(d[0]);
    var bTypesProps={};
    var bTPAttributes={};
    var bTypes=basicNames.getTypesParams().bts;  //refresh index column value inside
    var mindBTPA={};
    var mindBTP=basicNames.getMindBTPAlt();
	var tst;
    // -- mindBTPa[bType]    
    for(var ibt=0;ibt<bTypes.length;ibt++){
      var bType=bTypes[ibt];
      var pttBTPs=new RegExp("^"+bType+"(\\b|[_])");
      mindBTPA[bType]=handle.multiIndex.init('mBTPA'+bType);
      tst=mindBTPA[bType];var attr,attrV;
      tst.psO={ps:[],psa:{}};       // bType props attributes
      tst.atts={};                     //bType attributes
      for(var i=1;i<d.length;i++){
        var mbtp=d[i][parseInt(jsBN.mBTP,10)];
        if(pttBTPs.test(mbtp)){
          tst.add(mbtp,i);  
          // tst.r.btv.length==1  for tst each bType value is unique       
          if(mbtp===bType){
            // bType part
            for(var j=0;j<d[0].length;j++){
              attr=d[0][j];
              attrV=d[i][j];
              tst.atts[attr]=attrV;
            }
          }else{
            var bp=mbtp.split('_')[1];
            //var bt=mbtp.split('_')[0];
            tst.psO.ps.push(bp);
            tst.psO.psa[bp]={};
            for(var j1=0;j1<d[0].length;j1++){
              attr=d[0][j1];
              attrV=d[i][j1];
              tst.psO.psa[bp][attr]=attrV;
            }
          }
        }
      } 
    } 
    for(ibt=0;ibt<bTypes.length;ibt++){
      var bt=bTypes[ibt];
      tst=mindBTPA[bt];
      bTypesProps[bt]=tst.psO.ps;
      bTPAttributes[bt]=tst.psO.psa;
    }
    return {
      mindBTPA:mindBTPA,
      bTypesProps:bTypesProps,
      bTPropsAttributes:bTPAttributes,
    };
  };
  // -- set props arrays for bTypes
  var bTPA=basicNames.getBTypesPropsAttributes();
  basicNames.bTypesProps=bTPA.bTypesProps;
  basicNames.bTPropsAttributes=bTPA.bTPropsAttributes;  

  /**
  * forms props arrays for each bType 
  */
  basicNames.setBTypesPropsAndLabelsAlt_Alt=function(){
    var d=basicNames.data;
    var mindBT=basicNames.mindBT;
    var jsBN=handle.jObj(d[0]);
    var bTypesProps={};
    var bTPAttributes={};
    var bTypes=basicNames.getTypesParams().bts;
    var mindBTP=basicNames.getMindBTPAlt();    
    // -- mindBTPAs
    var mindBTPAs={};
    var pttBTPs=new RegExp("^"+bType);
    mindBTPAs=handle.multiIndex.init('mBTPAs');
    mindBTPAs.bTs={};
	var bt,mbtp,bp;
    for(var i=1;i<d.length;i++){  
      mbtp=d[i][parseInt(jsBN.mBTP,10)];
      bt=mbtp.split('_')[0];  // bType
      bp=(/[_]/.test(mbtp))?mbtp.split('_')[1]:'';  // bProp
      var bid=d[i][parseInt(jsBN.bid,10)];  
      mindBTPAs.add(bt,i);
      if(bid==bt){
        // bType=bt
        mindBTPAs.bTs[bt]={};
        mindBTPAs.bTs[bt].props=[];
        mindBTPAs.bTs[bt].atts={};
        for(var j=0;j<d[0].length;j++){
          var attr=d[0][j];
          var attrV=d[i][j];
          if((attrV )||attrV===0){
            mindBTPAs.bTs[bt].atts[attr]=attrV;
          }
        }
      }
    }
    /**
    * Returns object properies names as array
    * @return {Array.<string>}  
    */
    var getObjPropsArr=function(o){
      var ps=[];for(var ip in o){ps.push(o[ip]);}return ps;
    };
    mindBTPAs.bTs.bTypes=getObjPropsArr(mindBTPAs.v);
    // calculating of attributes' data
    var bTps=mindBTPAs.bTs.bTypes;
	var prps=function(bt){ 
        var ps=[];
        var mindr=mindBTPAs.r[bt];
		var irr,pname;
        for(var ir in mindr){
          irr=mindr[ir];
          pname=d[irr][parseInt(jsBN.bProps,10)];
          if(pname){
            ps.push(pname);
          }
        }
        return ps;
    };
    for(var ibt in bTps){
      bt=bTps[ibt];
      var irbt=parseInt(mindBTPAs[bt],10); // bType row index
      var props=prps(bt);
      mindBTPAs.bTs[bt].props=props;
      var bPropsO={};var mptp,ibp;
      for(var ip in props){
        bp=props[ip];
        bPropsO[bp]={};
        mindBTPAs.bTs[bt][bp]={};
        mbtp=bt+'_'+bp;
        ibp=parseInt(mindBTPAs[bt],10)+parseInt(ip,10)+1;
        for(var j1=0;j1<d[0].length;j1++){
          var attr1=d[0][j1];
          var attrV1=d[ibp][j1];
          if((attrV1 )||attrV1===0){
            mindBTPAs.bTs[bt][bp][attr1]=attrV1;
            bPropsO[bp][attr1]=((typeof attrV1 ==='string') && (/^[{]/.test(attrV1)) )?
              JSON.parse(attrV1):attrV1;
          }
        }
      }
    mindBTPAs.bTs[bt].bProps=bPropsO;
    }
    var o={};
    for(ibt in bTypes){
      bt=bTypes[ibt];
      o[bt]={};
      o[bt].atts=mindBTPAs.bTs[bt].atts;
      o[bt].bProps=mindBTPAs.bProps;
      bTypesProps[bt]=mindBTPAs.bTs[bt].props;
      bTPAttributes[bt]=mindBTPAs.bTs[bt];
    }
    return {
      mindBTPAs:mindBTPAs,
      bTypes:bTypes,
      bTypesProps:bTypesProps,
      bTPAttributes:bTPAttributes
    };
  };
  /**
  * forms props arrays for each bType 
  */
  basicNames.setBTypesPropsAndLabelsAlt_Alt=function(){
    var d=basicNames.data;
    var jsBN=handle.jObj(d[0]);
    var mindBTP=basicNames.getMindBTPAlt();
    var bTypesProps={};
    var bTPAttributes={};
    var bTypes=basicNames.getTypesParams().bts;
	var btProps,bType,bt,btp,mBTP,ir;
    for(var ibt=0;ibt<bTypes.length;ibt++){
      bTProps=[];
      bType=bTypes[ibt];
      bTPAttributes[bType]={};
	  for( ir=1;ir<d.length;ir++){
        mBTP=d[ir][parseInt(jsBN.mBTP,10)];
        bt=(!(/[_]/.test(mBTP)))?mBTP:mBTP.split('_')[0];
        btp=(/[_]/.test(mBTP))?mBTP.split('_')[1]:'';
        if( bt==bType){
          if(btp){
            bTProps.push(btp);
            bTPAttributes[bType][btp]={};                      
          }
        }
      } 
      bTypesProps[bType]=bTProps;
    }
    // attributes part
	var attr;
    for(ibt=0;ibt<bTypes.length;ibt++){      
      bType=bTypes[ibt];
      for( var j=0;j<d[0].length;j++){
        attr=d[0][j];
        bTPAttributes[bType][attr]={};
        bTPAttributes[bType][attr].bTProps=[];
        bTPAttributes[bType][attr].attrValues=[];
      }
      for(ir=1;ir<d.length;ir++){
        mBTP=d[ir][parseInt(jsBN.mBTP,10)];
        bt=(!(/[_]/.test(mBTP)))?mBTP:mBTP.split('_')[0];
        btp=(/[_]/.test(mBTP))?mBTP.split('_')[1]:'';
        if( bt==bType){
          if(btp){
            bTPAttributes[bType][btp]={};
            for( j=0;j<d[0].length;j++){
              attr=d[0][j];
              var attrVal=d[ir][parseInt(jsBN[attr],10)];                        
              if((attrVal)||(attrVal===0)){
                if(bt!='bnHeader'&&bt!='objectTemplate'){
                  //??????????????
                  bTPAttributes[bt][attr].bTProps.push(btp);
                  bTPAttributes[bt][attr].attrValues.push(attrVal);
                }
                 bTPAttributes[bt][btp][attr]=attrVal;
              }
            }
          }
        }
      }
    }    
    return {
      bTypesProps:bTypesProps,
      bTPropsAttributes:bTPAttributes
    };
  };
  //var testO=basicNames.setBTypesPropsAndLabelsAlt_Alt();
   /**
  * forms props arrays for each bType 
  */
  basicNames.setBTypesPropsAndLabels=function(){
    var d=basicNames.data;
    var mindBT=basicNames.mindBT;
    var jsBN=handle.jObj(d[0]);
    var bTypesProps={};
    var bTPStLabels={};
    var bTPAttributes={};
    var bTypes=basicNames.bTypes;
	var bType,indRIni,indRLast,bTProp,j,ir;
    for(var ibt=0;ibt<bTypes.length;ibt++){
      bType=bTypes[ibt];
      indRIni=parseInt(mindBT[bType],10)+1;
      indRLast=(ibt==(bTypes.length-1))? d.length : parseInt( mindBT[bTypes[ibt+1]],10);
      var bTProps=[];
      var bTPStLbls={};
      var stLbls=[];
      bTPStLabels[bType]=[];
      bTPAttributes[bType]={};
      for( j=0;j<d[0].length;j++){
          bTPAttributes[bType][d[0][j]]={};
          bTPAttributes[bType][d[0][j]].bTProps=[];
          bTPAttributes[bType][d[0][j]].attrValues=[];
      }            
      indRIni=parseInt(mindBT[bType],10)+1;
      indRLast=(ibt==(bTypes.length-1))? d.length : parseInt( mindBT[bTypes[ibt+1]],10);
      // -- cycle by properties of current bType
      for( ir=indRIni;ir<indRLast;ir++){
        bTProp=d[ir][parseInt(jsBN.bProps,10)];
        bTProps.push(bTProp);
        bTPAttributes[bType][bTProp]={};
        var stLblVal=d[ir][parseInt(jsBN.stLabel,10)];
        if(stLblVal||stLblVal===0){
          bTPStLbls[bTProp]=stLblVal;
          stLbls.push(stLblVal); 
        }
      }
      bTypesProps[bType]=bTProps;
      bTPStLabels[bType].bTPvsSTLblsO=bTPStLbls;
      bTPStLabels[bType].stLbls=stLbls;
    }
    for(ibt=0;ibt<bTypes.length;ibt++){      
      bType=bTypes[ibt];      
      indRIni=parseInt(mindBT[bType],10)+1;
      indRLast=(ibt==(bTypes.length-1))? d.length : parseInt( mindBT[basicNames.bTypes[ibt+1]],10);
      for( j=0;j<d[0]<length;j++){
        bTPAttributes[bType][d[0][j]]={};
        bTPAttributes[bType][d[0][j]].bTProps=[];
        bTPAttributes[bType][d[0][j]].attrValues=[];
      }
      // -- cycle by properties of current bType
      for( ir=indRIni;ir<indRLast;ir++){
        bTProp=d[ir][parseInt(jsBN.bProps,10)];
        for(j=0;j<d[0]<length;j++){
          var attr=d[0][j];
          var attrVal=d[ir][parseInt(jsBN[attr],10)];
          // object of pairs attribute:value for bProperty fo speified bType
          bTPAttributes[bType][bTProp][attr]=attrVal;
          if(attrVal||attrVal===0){
            // array of attribute's values
            bTPAttributes[bType][attr].attrValues.push(attrVal);
            // array of block Type's properties associated to .attrValues array
            bTPAttributes[bType][attr].bTProps.push(bTProp);
          }
        }            
      }     
    }    
    return {
      bTypesProps:bTypesProps,
      bTPropsStLabels:bTPStLabels,
      bTPropsAttributes:bTPAttributes,
    };
  };
  /**
  * inserts(replacing existing one) nameSpace entity by setting it's paramters:
  * bName, mBTP, bType, bid, parent, bProps .. and their values in columns of basicNames.data array and
  * if it's neccessary creates new line at the end of this array 
  * @param {Object}member - st-Object of memeber who's name is set
  * @param {string}bName
  * @param {string}bType
  * @param {string}bProp
  */
  basicNames.addBName=function(member,bName,bType,bProp){
    /* важно- обращение к addBName происходит из addMembTo()
    поэтому первым присоединением члена addMembTo должно быть включение
    объекта basicNames d текущий setters. В этом случае используемая ниже 
    операция var basicNames=setters.basicNames и последующее обращение 
    к объекту basicNames будет корректным, т.е. будет обращением к setters.basicNames
    */
    var dbn=basicNames.data;
    var mindBTP=basicNames.mindBTP;
    var js=handle.jObj(dbn[0]);
    
    var mBTP=(!bProp)?bType:((!bType)?member.parentBid+'_'+bProp:bType+'_'+bProp);
    
    if(member.bid){
      if( member.bid===bType){
        if(js[bProp]){
          if( member.parentBid=='bProps'){
            var prnt=setters.us[member.parentUid];
            var grandPaBid=prnt.parentBid;
            mBTP=grandPaBid+'_'+member.bid;            
          }else{
            mBTP=bType;
          }
        }
      }
    }
        
    if(mindBTP[mBTP]){      
      var i= parseInt(mindBTP[mBTP],10);
      var jnm=parseInt(js.bName,10);
      var jbp=(js[bProp])?parseInt(js[bProp],10):'';
      var nm=dbn[i][jnm];
    
      if((jbp) && (member[bProp])){
        var v=member[bProp];
        dbn[i][jbp]=v;
      }else{
    
        if((nm)&&(nm!==bName)){
          dbn[i][jnm]=bName; // attention! renews parameter
        }
    
      }
      //======= */
    }else{
      
      var iL=dbn.length;
      var jBid=parseInt(js.bid,10);
      var jT=parseInt(js.bType,10);
      var jTP=parseInt(js.bProps,10);
      var jMBTP=parseInt(js.mBTP,10);
      var jParent=parseInt(js.parent,10);
      var jBName=parseInt(js.bName,10);
      var jMUid=parseInt(js.membUid,10);
      var jCase=parseInt(js.caseopt,10);
      //     var parent=(member.parentUid=='setters')?setters:((grandPrnt)?grandPrnt:setters.us[member.parentUid]);
      var bid=member.bid;      
      var caseopt='ordinary';
      var parentV=(member.parentBid=='setters')?'setters':member.parentBid;
      var ptt=new RegExp(bType+'\\d+'); var bTypeV, bPropsV;
      if(!bid){
        if(!bType){
          // simple object property of ordinary object
          caseopt='simpleProperty';
          bid='';
          bType='';
        }else{
          caseopt='simplePropertyOfGroupObj';
          bid='';
        }
      }else{
        if(bid==bProp){
          // new member-obj of group obj
          if(ptt.test(bid)){
            // next bType member without ownBid - btypeN 'bid style' (bid= bType0,bType1...)
            var showOnlyNAsBProps=false;
            bPropsV=(showOnlyNAsBProps)?
                bid.replace(new RegExp(bType),''):bid;
            bTypeV=bType;
            parentV=member.parentBid;
            mBTP=member.parentBid+'_'+bid;
            caseopt='bTypeN_bid memberObj';
          }else{
            if(member.bType=='bProp'){
              bTypeV='bProp';
              parentV=bType;
              mBTP=bType+'_'+bProp;
              caseopt="bid=bProp && bType='bProp'";
            }else{
              caseopt='bid=bProp';
            }
          }
        }else if( member.parentBid=='bProps'){
          bType='';
          bid='';
          parentV=bType;   // grandPa.bType
          caseopt='member.parentBid=bProps';
        }else if(bid==bType){
          if(bid=='bProps'){
            caseopt='bPropsObjCase';
          }else{
            caseopt='newMmembObjWithUniqeBid or newBTypeGroup';  
          }
          mBTP=bid;            
        }else{
          // non bidN bid
          if(!bProp){
            if(bid!=bType){
              var parent=setters.us[member.parentUid];
              bPropsV=parent[bType+'Bids'].indexOf(member.bid);
              parentV=member.parentBid;
              mBTP=parentV+'_'+bid;
              caseopt='nonBidN '+bType+' groupMemberObj';
            }
          }
        }
      }
      
      mindBTP.add(mBTP,iL);
      var line=[];
      for(var j in dbn[0]){
        line.push('');
      }
      line[jBid]=bid;
      line[jT]=(bTypeV)?bTypeV:((bProp)?'':bType);
      line[jTP]=(bProp)?((bPropsV)?bPropsV:bProp):'';
      line[jMBTP]=mBTP;
      line[jParent]=parentV;
      line[jBName]=(bName)?bName:'';
      line[jCase]=caseopt;
      line[jMUid]=member.uid;
      
      dbn.push(line);
              
      var bndS=sessionBN.bnd;
      var str=JSON.stringify(line);
      bndS.push(function(str){return JSON.parse(str);}(str));
      sessionBN.nRows++;           
    }      
    return dbn;
  };
  /**
  * returns multiIndices which determins bType values
  * dpending of  stLable column value of appropriate row of basicNames.data array
  * by now it's presumed that blocks whith determined bType have unique
  * stLabel/ it means that they are collections
  */
  basicNames.bTypesOfStLabels=function(){
    var bnData=basicNames.data;
    var jsBN=handel.jObj(bnData[0]);
    var mindBTVsStLbl=handle.multiIndex.init('bTypeVsStLbl');
    for(var i=1;i<bnData.length;i++){
      var stLbl=bnData[i][parseInt(jsBn.stLabel,10)];
      var bT=bnData[i][parseInt(jsBn.bType,10)];
      if(stLbl){
        if(bT){
          mindBTVsStLbl.add(stLbl,bT);
        }
      }
    }
    return mindBTVsStLbl;
  };
  /**
  * returns structure entities who are childs of parent with specified bType
  * @param {string}bType - of parent st-object
  * @return {Object} object of childs attributes
  *              .nChsTs - number of childs
  *               .childsTs - array of childs' objects
  *               [ { ibnRow:'',bType:''} ] in the same order as in .childs array
  *               .ibnRows - array of childs ibnRows (row index in bn.data)
  *               .bTypes - array of childs' bTypes
  */
  basicNames.getChildsTypes=function(bType){
    
    var basicNames=setters.basicNames;
    var bnD=basicNames.data;
    var jsBN=handle.jObj(bnD[0]);
    var mindBNParents=handle.multiIndex.init('parents');
    for(var ibn in bnD){
      mindBNParents.add( bnD[ibn][parseInt(jsBN.parent,10)],ibn);
    }
    var childs=[];
    var iChildsRows=mindBNParents.r[bType];
    if(iChildsRows){      
      for(var ich in iChildsRows){
        var irCh=parseInt(iChildsRows[ich],10);
        childs.push({
          ibnRow:irCh,
          bType:bnD[irCh][parseInt(jsBN.bType,10)],          
        });
      }
    }
    var getChildsAttrs=function(){
      var chs={};        
      chs.bTypes=[];
      chs.ibnRows=[];
      for(var ich in childs){
        chs.bTypes.push(childs[ich].bType);
        chs.ibnRows.push(childs[ich].ibnRow);
      }
      chs.nChsTs=childs.length;
      chs.chsTsOs=childs;       
      return chs;
    };
    return getChildsAttrs();
  };
  /**
  * @param {string}bType - type of Block whose childs ar looking for  
  * @return {Object} of childs attributes
  *              .nChsTs - number of childs
  *               .childsTs - array of childs' objects
  *               [ { irow:'',bType:''} ] in the same order as in .childs array
  *               .ibnRows - array of childs ibnRows
  *               .bTypes - array of childs' bTypes
  */
  basicNames.getChildsTypes1=function(bType){
    
    //var basicNames=setters.basicNames;
    var dBN=basicNames.data;
    var isBN=handle.iObj(dBN);
    var js=handle.jObj(dBN[0]);
    var chsIRows=(isBN.parent.r[bType])?isBN.parent.r[bType]:[];
    chsIRows=chsIRows.map(function(el){return parseInt(el,10);});
    
    var chsBTs=function(){
      var bts=[];for(var ich in chsIRows){bts.push(dBN[parseInt(chsIRows[ich],10)][parseInt(js.bType,10)]);}
      return bts;}();
    var chs={
      nChsTs:chsBTs.length,
      ibnRows:chsIRows,
      bTypes:chsBTs,
      chsTsOs:function(chsBTs,chsIRows){
        var chsTs=[];
        for(var ich in chsBTs){
          chsTs.push({ibnRow:chsIRows[ich],bType:chsBTs[ich]});
        }
        return chsTs;
      }(chsBTs,chsIRows)
    };
    return chs;
  };
  /**
  * using basicNames.data array updates basic names sheet
  * adding new lines accumulating during calculation
  * and correcting and renweing values if any has taken place
  * return {Sheet} sheet of structureAndNames sheet
  */
  basicNames.updateBNSheet=function(bnSheetNameOpt,bnSsIdOpt){
    var bnSsId=bnSsIdOpt||basicNames.ssId;
    var ss=SpreadsheetApp.openById(bnSsId);
    var s;
    if(bnSheetNameOpt){
      if(bnSheetNameOpt!=basicNames.bnSheetName){
        basicNames.bnSheetName=bnSheetNameOpt;
        var sheets=ss.getSheets();
        var hasSheet=false;
        for(var ish in sheets){
          if(sheets[ish].getName()==basicNames.bnSheetName){
            hasSheet=true;
            break;
          }
        }
        s=(hasSheet)?ss.getSheetByName(basicNames.bnSheetName):ss.insertSheet(basicNames.bnSheetName);        
      }
    }else{
      s=SpreadsheetApp.openById(basicNames.ssId).getSheetByName(basicNames.bnSheetName);
    }
    basicNames.data=basicNames.refreshIndex();
    var d=basicNames.data;
    s.getRange(1,1,d.length,d[0].length).setValues(d);
    return s;
  };
  /**
  * updates basicNames bTypes- and bProps-attributes and parameters
  * Remark:
  * mindBTP should be corrected only if the oreder of rows or insertion
  * have been made .Or additional data array indicatin as parameter should 
  * be used as basicNames.data array;
  * To include newly created  extra row added to the end of bn.data array -
  * use basicnNames.mindBTP.add(mBTP,i) - method !!!
  * To get mindBTP use getMindBTP(); to set index column - refreshIndex() )
  * @param {Array[][]}bnD - 2d array of basicNames data
  * @return {Object} basicNames object  
  */
  basicNames.refresh=function(bnD){
    var basicNames=setters.basicNames;
    basicNames.data=(bnD)?bnD:basicNames.data;
    // bTypesAttribs	
    var bts=basicNames.getTypesParams(); // refreshInedex inside
    basicNames.bTypes=bts.bts;
    basicNames.bTypesStLabels=bts.stLabels;
    basicNames.bTypesAttribs=bts.attribs;
    basicNames.mindBT=bts.mindBT;
    // types and props attribs
    basicNames.mindBTP=basicNames.getMindBTP();
    var bTPL=basicNames.setBTypesPropsAndLabels();
    basicNames.bTypesProps=bTPL.bTypesProps;
    basicNames.bTPropsStLabels=bTPL.bTPStLabels;
    basicNames.bTPropsAttributes=bTPL.bTPropsAttributes;
    return basicNames;
  };
  /**
  * updates basicNames bTypes- and bProps-attributes and parameters
   * Remark:
  * mindBTP should be corrected only if the oreder of rows or insertion
  * have been made .Or additional data array indicatin as parameter should 
  * be used as basicNames.data array;
  * To include newly created  extra row added to the end of bn.data array -
  * use basicnNames.mindBTP.add(mBTP,i) - method !!!
  * To get mindBTP use getMindBTP(); to set index column - refreshIndex() )
  * @param {Array[][]}bnD - 2d array of basicNames data
  * @return {Object} basicNames object  
  */
  basicNames.refreshMe=function(bnD){
    var basicNames=setters.basicNames;
    basicNames.data=(bnD)?bnD:basicNames.data;
    // bTypesAttribs	
    var bts=basicNames.getTypesParams(); // refreshInedex inside
    
    basicNames.bTypes=bts.bts;
    basicNames.bTypesStLabels=bts.stLabels;
    basicNames.bTypesAttribs=bts.attribs;
    basicNames.mindBT=bts.mindBT;
    // types and props attribs
    basicNames.mindBTP=basicNames.getMindBTPAlt();
    
    var bTPA=basicNames.getBTypesPropsAttributes();
    basicNames.bTypesProps=bTPA.bTypesProps;
    basicNames.bTPropsAttributes=bTPA.bTPropsAttributes;  
    
    return basicNames;
  };
  
  /**
  * Inserts new column into basicNames data and sheet
  * @param {string}newColName - name of new column
  * @return {Array[][]} 2d array of bn.data
  */
  basicNames.addNewBNColumn=function(newColName){
    var basicNames=setters.basicNames;
    // by changing bn.data
    var bnD=basicNames.data;
    for(var i=0;i<bnD.length;i++){
      bnD[i].push((i==0)?newColName:'');
    }
    //basicNames properties to be updated after bn.data change
    /* adds property to bnHeader block object after appending a column
    1. insert new property to basicNames.bnHeader block of bType='bnHeader'
    this shoul be done with addBName (?)
    */
    var bnHeadQuaziObj={bid:newColName,parentUid:'setters_basicNames_bnHeader',parentBid:'bnHeader'};
    basicNames.data=basicNames.addBName(bnHeadQuaziObj,newColName,'bnHeader',newColName);
    basicNames=setters.basicNames.refreshMe();
    // modifies bn-sheet
    var sBN=SpreadsheetApp.openById(basicNames.ssId)
    .getSheetByName(basicNames.bnSheetName);
    sBN.getRange(1,1,bnD.length,bnD[0].length).setValues(bnD);
    return bnD;
  };
  return basicNames;
};                     // --- END of .getBasicNames() method ---
/**
* inserts(replacing existing one) bName into bName column of basicNames.data array and
* if it's neccessary creates new line at the end ofthis array 
* @param {Object}member - st-Object of memeber who's name is set
* @param {string}bName 
* @param {string}bType
* @param {string}bProp
* важно обращение к addBName происходит из addMembTo()
  поэтому объект basicNames должен быть присоединен к setters
  в самом начале вычислений. После этого используется setters.basicNames
  @return {Array [[]]} updated 2d-array of basicNames.data
*/
setters.addBName=function(member,bName,bType,bProp){
  var dbn=basicNames.data;
  var mindBTP=basicNames.mindBTP;
  var js=handle.jObj(dbn[0]);
  var mBTP=(!bProp)?bType:((!bType)?member.parentBid+'_'+bProp:bType+'_'+bProp);
  
  if(mindBTP[mBTP]){      
    var i= parseInt(mindBTP[mBTP],10);
    var j=parseInt(js.bName,10);
    var nm=dbn[i][j];
    if(nm!==bName){
      dbn[i][j]=bName; // attention! renews parameter
    }
  }else{
    
    var iL=dbn.length;
    var jBid=parseInt(js.bid,10);
    var jT=parseInt(js.bType,10);
    var jTP=parseInt(js.bProps,10);
    var jMBTP=parseInt(js.mBTP,10);
    var jParent=parseInt(js.parent,10);
    var jBName=parseInt(js.bName,10);
    var jMUid=parseInt(js.membUid,10);
    var jCase=parseInt(js.caseopt,10);
    //     var parent=(member.parentUid=='setters')?setters:((grandPrnt)?grandPrnt:setters.us[member.parentUid]);
    var bid=member.bid;      
    var caseopt='ordinary';
    var parentV=(member.parentBid=='setters')?'setters':member.parentBid;
    var ptt=new RegExp(bType+'\\d+');var bTypeV,bPropsV;
    if(!bid){
      if(!bType){
        // simple object property of ordinary object
        caseopt='simplePropertyOfObj';
        bid='';
        bType='';
      }else{
        caseopt='simplePropertyOfGroupObj';
        bid='';
      }
    }else{
      if(bid==bProp){
        // new member-obj of group obj
        if(ptt.test(bid)){
          // next bType member without ownBid (bid= bType0,bType1...)
          bPropsV=bid.replace(new RegExp(bType),'');
          bTypeV=bType;
          parentV=member.parentBid;
          mBTP=member.parentBid+'_'+bid;
          caseopt='bTypeN_bid memberObj';
        }else{
          bid=(bid=='bProps')?'':bid;
          if(member.bType=='bProp'){
            bTypeV='bProp';
            parentV=bType;
            mBTP=bType+'_'+bProp;
            caseopt=(bid=='bProps')?'bPropsObjCase':"bid=bProp && bType='bProp'";
          }else{
            caseopt=(bid=='bProps')?'bPropsObjCase':'bid=bProp';
          }
        }
      }else if( member.parentBid=='bProps'){
        bType='';
        bid='';
        parentV=bType;   // grandPa.bType
        caseopt='member.parentBid=bProps';
      }else if(bid==bType){
        mBTP=bid;
        caseopt='newMmembObjWithUniqeBid or newBTypeGroup';
        
      }else{
        // non bidN bid
        if(!bProp){
          if(bid!=bType){
            var parent=setters.us[member.parentUid];
            bPropsV=parent[bType+'Bids'].indexOf(member.bid);
            parentV=member.parentBid;
            mBTP=parentV+'_'+bid;
            caseopt='nonBidN '+bType+' groupMemberObj';
          }
        }
      }
    }
    mindBTP.add(mBTP,iL);
    var line=[];
    for(var j1=0;j1<d[0]<length;j1++){
      line.push('');
    }
    line[jBid]=bid;
    line[jT]=(bTypeV)?bTypeV:((bProp)?'':bType);
    line[jTP]=(bProp)?((bPropsV)?bPropsV:bProp):'';
    line[jMBTP]=mBTP;
    
    line[jParent]=parentV;
    line[jBName]=(bName)?bName:'';
    line[jCase]=caseopt;
    line[jMUid]=member.uid;
    
    dbn.push(line);
    
    var bndS=sessionBN.bnd;
    var str=JSON.stringify(line);
    bndS.push(function(str){return JSON.parse(str);}(str));
    sessionBN.nRows++;           
    
  }
  return dbn;
};
/**
* gets closest sprSht object
* @param {Object}client - st-object of for which the parent sprSht object is looking for
* @return {Opbject} st-object of bType SprSht
*/
setters.getSprShtParent=function(client){
  var prnt;
  if(client.bType!='sprSht'){
    while( (!prnt)||(prnt.bType!='sprSht')){
      prnt=(!prnt)?setters.us[client.parentUid]:setters.us[prnt.parentUid];
    }
  }else{
    return client;
  }
  return prnt;
};
/**
* gets closest ancestor object of specified bType
* @param {Object}client - st-object of for which the parent sprSht object is looking for
* @param {string}bType - bType of ancestor is looking for. Optional if undefined parent of block 
*                       will be returned
* @return {Opbject} st-object ancestor of bType 
*/
setters.getAncestor=function(client,bType){
  if(client){
  if(!bType){
    if(client.parentUid){
      return setters.us[client.parentUid];
    }else{
      return undefined;
    }
  }
  var prnt;
  if(client.bType!=bType){
    while( (!prnt)||(prnt.bType!=bType)){
      prnt=(!prnt)?setters.us[client.parentUid]:setters.us[prnt.parentUid];
    }
  }else{
    return client;
  }
  return prnt;
  }else{
    return undefined;
  }
};
/**
* corrects of nBlRows of predecessors
* Works correctly in process of growing setters only. Because if the correction after insertion of a block
* is considered, it's necessary to correct not only predecessors but sibling followed after as well
* algorithm: the length of all preparents of extended block have been extended as well
* @param {Object}block - st Object of a block having been extended
* @param {Integer}nOfInsertedRows - number of inserted rows into block( in t.data array)
* @param {string}topBtype - the bType of  upperst structure stObject 
*/
setters.parentsLengthCorrection=function(block,nOfInsertedRows,topBTypeOpt){
  var topBType=topBTypeOpt||'sprShts';    //  now it's considered the upper one
  var ancestor;
  while( !(ancestor)||ancestor.bType!=topBType){
    ancestor=(!ancestor)?setters.us[block.parentUid]:setters.us[ancestor.parentUid];
    ancestor.nBlRows=parseInt(ancestor.nBlRows,10)+nOfInsertedRows;
  }
};
/**
* Determines if object containes property indicated
* and transforms it into 'capitalized' or 'underscored' or 'nextNumbered'
* @param {string}pName - property's name as string beginning with lowercase letter
* @param {Object}obj - object
* @param {string}mode - mode sting.Optional
*                       'capitalized' is Default means 'capitalized' mode. Set first letter capital
*                       'underscored' - trail underscore
*                       'numbered' - trail by number beginning with 0. If there is alredy number
*                           at the end of name increases it by 1;
*                       'has' - returns Boolean true or false depending on presence pName in obj
*/
setters.pNameCheck=function(pName,obj,modeOpt){
  var mode=modeOpt||'capitalized';
  var exist=function(o,pN){ 
    var yes=false;
    for(var nm in o){
      if(nm==pN){yes=true;break;}
    }return yes;}(obj,pName);
  if(mode=='has'){return exist;}
  if(!exist){
    return pName;
  }else{
    switch (mode){
      case 'capitalized':
        // capitalize
        return pName.charAt(0).toUpperCase()+pName.slice(1);
        
      case 'underscored':
        // trail underscore
        return pName+'_';
        
      case 'numbered':
        // trail by ordered number
        var ptt=/\d+$/;
        return (ptt.test(pName))?pName.replace(ptt,parseInt(pName.match(ptt),10)+1):pName+0;
    }
  }
};
/** memBid assigning algorithm:
*  generally memBidOpt has priority above other bidding
*  - if memBidOpt coinsides with already existing property name
*  it's changed to someone with first Letter capitalized
*  - If capitazed bid already exists as well than original memBid is trailed by number 
*  beginning with zero depending on if digitalized would exist as well. If so the
*  number is increased by one until unique bid would not have occured
*  - if capitalized bid is existed already as well as lowcasedBeginning one
*  bTypeN variant for bidding is used. Usually bType coinsides with lowcasedBeginning
*  bid variant
* @param {string}memBid - bid identifier of group member
* @param {Object}group - st-Object of group
* @param {string}addSign - string adding to the and of memBid if is set
*                         as many time as neccessary to get memBid value wich is not
*                         presentamong obj properties' names
* @return {string} new value of bid depending of it's presence among properties of group
*                 it's presumed that member=group[member.bid]
*/
setters.getNewBid=function(memBid,group,addSignOpt){
  var add=addSignOpt||'';
  if(!add){
    // default behaviour
    var mBid=(setters.pNameCheck(memBid,group)===memBid)?memBid:setters.pNameCheck(memBid,group);
    if(mBid!==memBid){
      // check capitalized
      if( mBid===setters.pNameCheck(mBid,group)){
        // capitalized is ok
        memBid=mBid;
      }else{
        // try trail number
        var mBidN=setters.pNameCheck(memBid,group,'numbered');
        while( mBidN!==setters.pNameCheck(mBidN,group,'numbered')){
          mBidN=setters.pNameCheck(mBidN,group,'numbered');
        }
        memBid=mBidN;
      }
    }
    
  }else{
    while(setter.pNameCheck(memBid,group)!==memBid){
      memBid+=add;
    }
  }
  return memBid;   
};

/**
* Adds property to existing member object 
* it differs from addMembTo by not creating new st-object for the property
* @param {Object}member - object to which the property is added
* @param {string}propBid - property block identifyer
* @param {Object|variable}propValue - the actual value of adding property.
*    Could be,or object, or array, or any other bType depending of the context
* @param {string}propNameOpt Optional. Property descriptive name
* @returm{Object} member object with extending set of bProps
*/
setters.addPropTo=function(member,propBid,propValue,propNameOpt){
  // v.1 capitalized of numbered
  //propBid=setters.getNewBid(propBid,member);
  // v.2 underscored
  var basicNames=setters.basicNames;
  var bnH=basicNames.data[0];
  var jsBN=handle.jObj(bnH);
  /*
  if( propBid!==setters.pNameCheck(propBid,member)){
      var mBidUn=setters.pNameCheck(propBid,member,'underscored');
      while( mBidUn!==setters.pNameCheck(mBidUn,member,'underscored')){
        mBidUn=setters.pNameCheck(mBidUn,member,'underscored');
      }
      propBid=mBidUn;
    }
  */  
  //
  var propName=propNameOpt||propBid;
  member[propBid]=propValue;
  if( typeof propValue!=='function'){
    member.bids.push(propBid);
    member.names.push(propName);
    member.nMembs++;
    var uid=setters.getUid(member.uid,propBid);
    setters.us[uid]=member[propBid];
    setters.uids.push(uid);
    
    if(jsBN[propBid]){
      // the propBid is some bn.data column property
      // this case presumes that it's not necessart to add new row to basicName.data or session.data
      setters.basicNames.addBName(member,propName,member.bid,propBid);
    }else{
      // real new name is propBid. So we introduce quziMemberObject - {bid:propBid}
      var tempO={
        uid:member.uid+'_'+propBid,
        parentBid:member.bid,
        parentUid:member.uid
      };
      setters.basicNames.addBName(tempO,propName,member.bid,propBid);
    }
  }else{
    var fuid=setters.getUid(member.uid,propBid);
    setters.ufs[fuid]=propValue;
    setters.fuids.push(fuid);
    setters.fmemos.push(propName);
  }
  return member;
};
/**
* Adds new member(property) to group(object) or new bType
* @param {Object}group - parent object.Object to whome member is added
* @param {string}bType - bType determining bType of object and bType in objectName 
*     like in shBl0,shBl1,shBl2  where  'shBl' -is bType in bids of sheetBlocks
* @param {Object}memBidOpt member block identifier id.Optional.
* @param {Object}memberValueOpt member's object adding to group
      присваиваемое руками значение нового члена memberValOpt может быть
      1 - негрупповым st-обектом
      2 - st-объектом, входящим в какую-то группу( bType )
      3 - стандартным объектои
      4 - не обектом, т.е. строкой, числом, массивом...
      
      1 - nonGrouped st-object (separate st-object not contained in standard st-collections
      2 - group st-object, st-object having standard bType
      3 - stancard object
      4 - non object, i.e. string, number, array ...
      If optional assigning value (memberValOpt) is st-object than it is assigned to 
      newly creted st-object itself, otherwise it's assigned to stVlalue property of
      creating new object(? needs to justify ?).
      Above stValue concrete st-object could have rendering value stValueRender - it's the 
      manner how stValue is rendering in setters sheet. It could be jsOn, or string, or number, or csv, or array
      and it's specific manner which have to be defined for each st-object
      asigning directly(by hands) value of new member could be
      * @param {string}memberNameOpt - short linguistique mem describing the member adding to group
* @return {Object} st-object
*/
setters.addMembTo=function(group,bType,memBidOpt,memberValOpt,memberNameOpt){
  if(!group){
    return false;
  }
  var member,memBid,membName;
  if(memberValOpt){
    //is or not stObjsect    
    if( setters.isStObj(memberValOpt,memBidOpt) || (typeof memberValOpt==='function' )){
      member=memberValOpt;
    }else{
      member=setters.getObjTemplate();
      member.stValue=memberValOpt;
    }
  }else{
    member=setters.getObjTemplate();
  }
  var fuid;
  if(bType){
    var nBTypeStr='n'+bType.charAt(0).toUpperCase() + bType.slice(1)+'s';
    var bTypeBidsStr=bType+'Bids';
    var bTypeNamesStr=bType+'Names';
    var bTypeObjsStr=bType+'Objs';
    
    if(group[nBTypeStr]){
      // bType collection object already exists
      /* memBid assigning algorithm:
      *  generally memBidOpt has priority above other bidding
      *  - if memBidOpt coinsides with already existing property name
      *  it's name is changed to first Letter capitalizing
      *  - If capitazed bid already exists than original memBid is trailed by number 
      *  beginning with zero depending on if digitalized bid exists as well. If so the
      *  number is increased by one until unique bid would not have occured
      *  - if capitalized bid is existed already as well as lowcasedBeginning one
      *  bTypeN variant for bidding is used. Usually bType coinsides with lowcasedBeginning
      *  bid variant
      */
      memBid=memBidOpt||bType+group[nBTypeStr];    // in this expression new member bid number is equal to not yet increased value of group[nBTypeStr] 
      membName=memberNameOpt||memBid;
      if(memBid===memBidOpt){
        // case when memBidOpt is set
        memBid=setters.getNewBid(memBid,group);
      }
      // -- update member and group
      if(typeof member!=='function'){
        
        member.bid=memBid;
        member.name=membName;
        member.bType=(bType)?bType:memBidOpt;
        member.uid=setters.getUid(group.uid,memBid);
        member.parentBid=group.bid;
        member.parentUid=group.uid;
        setters.us[member.uid]=member;
        setters.uids.push(member.uid);    
      }else{
        fuid=setters.getUid(group.uid,memBid);
        setters.ufs[fuid]=member;
        setters.fuids.push(fuid);
        setters.fmemos.push((memberNameOpt)?memberNameOpt:'function_'+fuid);
      }
      group[nBTypeStr]++;
      group[bTypeBidsStr].push(memBid);
      group[bTypeNamesStr].push(membName);
      group[bTypeObjsStr].push( member);
    }else{
      memBid=memBidOpt||bType+0;
      if(memBid===memBidOpt){
        // case when memBidOpt is set
        memBid=setters.getNewBid(memBid,group);
      }
      membName=memberNameOpt||memBid;
      // -- update member and group
      if(typeof member!=='function'){      
        member.bid=memBid;
        member.name=membName;
        member.bType=(bType)?bType:memBidOpt;
        member.uid=setters.getUid(group.uid,memBid);
        member.parentBid=group.bid;
        member.parentUid=group.uid;
        setters.us[member.uid]=member;
        setters.uids.push(member.uid);
      }else{
        fuid=setters.getUid(group.uid,memBid);
        setters.ufs[fuid]=member;
        setters.fuids.push(fuid);
        setters.fmemos.push((memberNameOpt)?memberNameOpt:'function_'+fuid);
      }
      group=setters.addPropTo(group,nBTypeStr,1,'numberOfMembersOfCollection'+bType);
      group=setters.addPropTo(group,bTypeBidsStr,[memBid],bType+'Bids');
      group=setters.addPropTo(group,bTypeNamesStr,[membName],bType+'Names');
      group=setters.addPropTo(group,bTypeObjsStr,[member],bType+'Objs');
    }
  }else{
    memBid=memBidOpt;
    if( memBid!==setters.pNameCheck(memBid,group)){
      var mBidUn=setters.pNameCheck(memBid,group,'underscored');
      while( mBidUn!==setters.pNameCheck(mBidUn,group,'underscored')){
        mBidUn=setters.pNameCheck(mBidUn,group,'underscored');
      }
      memBid=mBidUn;
    }
     membName=memberNameOpt||memBid;
     // -- update member and group
     if(typeof member!=='function'){      
       member.bid=memBid;
       member.name=membName;
       member.bType=memBidOpt;
       member.uid=setters.getUid(group.uid,memBid);
       member.parentBid=group.bid;
       member.parentUid=group.uid;
       setters.us[member.uid]=member;
       setters.uids.push(member.uid);
     }else{
       fuid=setters.getUid(group.uid,memBid);
       setters.ufs[fuid]=member;
       setters.fuids.push(fuid);
       setters.fmemos.push((memberNameOpt)?memberNameOpt:'function_'+fuid);
     }
   }
  group[member.bid]=member;
  var pttBid=new RegExp(member.bType+"\\d+");
  
  if(typeof member!=='function'){
    group.bids.push(member.bid);
    group.names.push(member.name);
    group.nMembs++;
    if(member.bType==member.bid){
      setters.basicNames.addBName(member,member.name,member.bType);
    }else if(pttBid.test(member.bid)){
      setters.basicNames.addBName(member,member.name,member.bType,member.bid);
    }else{
      if(group.bid=='bProps'){
        //var grandPa=(group.parentUid=='setters')?setters:setters.us[group.parentUid];
        setters.basicNames.addBName(member,member.name,group.parentBid,member.bid);
        //setters.basicNames.addBName(member,member.name,'bProp',member.bid);
      }else{
        setters.basicNames.addBName(member,member.name,group.bid,member.bid);
      }
    }
  }
  return group;  
};
/**
* Returns number of group-childs blocks with specified bType 
* for which client is parent block
* @param {Object}client - object of a block in consideration
* @param {string}chBType - bType of group's childs
* @return {Integer} - number of group members.
* number of childs of specified bType for parent st-object
*/
setters.getNChildsOfType=function(client,chBType){
  var prnt;
  switch (chBType){
    case 'sh':
      prnt=setters.getAncestor(client,'shsBl');
      return (prnt)?prnt.sheetsNames.split(',').length:0;
      
    case 'shBl':
      prnt=setters.getAncestor(client,'sprSht');
      return (prnt)?prnt.ss.getSheets().length:0;
      
    case 'colBl':
      prnt=setters.getAncestor(client,'shBl');
      return (prnt)?prnt.nColumns:0;
      
      
    default:
      if(/T$/.test(chBType)){
        return 0;
      }
      return 1;
  }
};

setters=setters.addMembTo(setters,'','basicNames',setters.getBasicNames(),'basicNamesObject');

sessionBN.bnd.push(setters.basicNames.data[0]);

setters.addMembTo(setters.basicNames,'','fillPropsInEmptyCollection',
                  /**
                  * Presuming that each collection has it's unique name collectionName (bid)
                  * in column collectionNameColumnName in structureAndName sheet
                  * and that collection is empty , fills in bProps names for this empty collection
                  * @param {Sheet}s - structureAndNames sheet object
                  * @param {Array [[]]}d 2d-array of sheet data
                  * @param {Object}js j-Object of sheet header
                  * @param {string}collectionName - collection name used(bid - block's identifier - is used usually as collection name
                  * @param {string}collectionNameColumnName - name of column in header where collection name is stored(name not bProps)
                  * @param {Array []}propsNamesArr - array of bProps names
                  * @param {string}propsColumnName - name of column where bProps names have to be input in
                  * @param {Boolean}fillSheetOpt - to fill or not to fill sheet.Boolean, optional. Default is true;
                  * @return {Object [][] | Boolean false} false if sOmething is wrong or 2d-array of sheet's data 
                  */
                  function(s,d,js,collectionName,collectionNameColumnName,propsNamesArr,propsColumnName,fillSheetOpt){
                    
                    var fill=fillSheetOpt||true;
                    var header=d[0];
                    // check of Uniqueness
                    var isObj=is.setIndsOfRowsWithValueInColName(d,collectionNameColumnName,collectionName,js);
                    js=js||handle.jObj(d[0]);
                    var isUnique=(isObj.r[collectionName].length)&&(isObj.r[collectionName].length>1);
                    if( isUnique ){
                      Logger.log('sOmething is wrong');
                      return false;
                    }else{
                      // empty - meanes that there are no space(filled rows) between closest collection setting rows(first row of collection)
                      var emptyControl=d[parseInt(isObj[collectionName],10)+1][parseInt(js[collectionNameColumnName],10)];
                      // for emptynessControl next rule is used: 
                      // if next row after one which has value collectionName in collectionNameColumnName column is not empty? -
                      // it means that propsNamesArr array has not yet been filled in into sheet. Therefore collectionis empty and
                      // it's neccesary to fill it
                      if(emptyControl){
                        
                        var d1=d.slice(0,parseInt(isObj[collectionName],10)+1);
                        var d2=d.slice(parseInt(isObj[collectionName],10)+1);
                        var insert=[];
                        for( var ib in propsNamesArr ){
                          var row=[];
                          for(var j=0;j<header.length;j++){ row.push('');}
                          row[ parseInt(js[propsColumnName],10) ]=propsNamesArr[ib];
                          insert.push(row);
                        }
                        var dWithInsert=d1.concat(insert).concat(d2);
                        for(var i in dWithInsert){
                          // resetting indices 
                          dWithInsert[i][parseInt(js.index,10)]=(i!=0)?i:dWithInsert[i][parseInt(js.index,10)];
                        }
                        if(fill){
                          s.getRange(1,1,dWithInsert.length, header.length).setValues(dWithInsert);
                        }
                        basicNames.data=dWithInsert;
                        return dWithInsert;
                      }
                    }
                  },'functionFillPropsInEmptyCollection');

// --- Setters Template
/** 
* SETTERS ( derived from word 'set' ) by definition is a sheet and appropriate to it object (image)
* where generalized information and parameters of some data set are presented. As a usual such data set 
* is a set of data contained in some spreadsheet or few spreadsheets. Therefore
* Setter could present information describing some spreadsheet or/and seet(s) of this spreadsheet
* as well as the same kind of data for few spreadsheets
* united in structure( combining in structure) or data base by other words. These data are hierarchical:
* Returns Setters Template object for a tipycal Setters-sheet for single spreadsheet( sprSht)
* this object will be used as prototype of final visualisation sheet to render data of a set in sprSht
*
* @param {Object}clientOpt - st-object of sprShts or sprSht for which Setters Object is created
*    and who containes appropriate setters-sheet data. 
*    t-object for sprShts-object is used created from t-objs of separate sprSht's t-objects
* Setters template for sprShts-object could be used when similar settersTemplate is used for all sprSht-s
* of sprShts ( preliminary but not so actual remark/ Initially one Setters per one spreadsheet could be fine)
*
* @param {string}stSprShColNameOpt - name of column where spreadsheets' parameters are declared.Default-'sprShSetters'
* @param {Strung}stShColNameOpt  - name of column where sheets' blocks  parameters are declared.Default-'shSetters'
* @param {Boolean}useClientOpt - Optional. true when clientOpt has already it's own Setter and this
*   Setters is used. Convention: clientOpt own Setters sheet has name 'Setters'
*  SettersTemplate sheet has name 'settersTemplate'
* @return {Object} returns stTemplate object / or Setters object for clientOpt
*/
setters.getSettersTemplate=function(clientOpt,stSprShColNameOpt,stShColNameOpt,useClientOpt){
  var use=useClientOpt||false;
  var ssStIdDefault='13zc5Xaid7crD3MxqSexKvtHODZh02f9tbCjDzqs2ZU8';
  // --- id of spreadsheet containing settersTemplates object
  var ssStId=( (use)&&(clientOpt))?clientOpt.ssId:ssStIdDefault;  // id of spreadsheet having setters-template
  var stSprShColName=stSprShColNameOpt||'sprShSetters';
  var stShColName=stShColNameOpt||'shSetters';
  var ssSt=SpreadsheetApp.openById(ssStId); var stSheet;
  if( !use ){
    stSheet=ssSt.getSheetByName('settersTemplate');  // default
  }else{
    stSheet=(!(ssSt.getSheetByName('Setters')))?
        ssSt.getSheetByName('settersTemplate'):
    ssSt.getSheetByName('Setters');
  }
  var stR=stSheet.getDataRange();
  var stData=stR.getValues();
  var stHeader=stData[0];
  var stJs=handle.jObj(stHeader);
  // Indices of Rows of Setters
  // ssIs - connects Setters sheet rows indices and spreadsheet's parameters
  // shIs - connects Setters sheet rows indices and sheets' parameters
  // colNameForInd - columns' names for indices. Assigns index for column name
  //                 ssIs for column 'sprShSetters'
  //                 shIs for column 'shSetters'
  var colNameForInd={ssIs:stSprShColName,shIs:stShColName}; 
  var isObj=handle.getIsInds (stData,colNameForInd,stJs);
  var stSsIs=isObj.ssIs;
  var stShIs=isObj.shIs;
  
  // Setters Template Object creation
  var st=setters.getObjTemplate();
  st.bid='stT';
  st.name='settersTemplate';
  
  st=setters.addPropTo(st,'ss',ssSt,'settersTempateSpreadsheet');
  st=setters.addPropTo(st,'s',stSheet,'settersTempateSheet');
  st=setters.addPropTo(st,'sR',stR,'settersTempateDataRange');
  st=setters.addPropTo(st,'data',stData,'settersTempateData');
  st=setters.addPropTo(st,'header',stHeader,'settersTempateHeader');
  st=setters.addPropTo(st,'js',stJs,'settersTempateJObject');
  st=setters.addPropTo(st,'ssIs',stSsIs,'settersTempateSprShColIndex');
  st=setters.addPropTo(st,'shIs',stShIs,'settersTempateShColIndex');
  st=setters.addPropTo(st,'lastLineRowInd',parseInt( st.ssIs.lastLine,10),'indexOfSettersLastLineRow');

  var renewTData=function(dNew,colNamesForIndsOpt){
    var colNameForInd=colNamesForIndsOpt||{ssIs:'sprShSetters',shIs:'shSetters'};
    st.data.splice(0,st.data.length); // nullifying data
    for(var i=0;i<dNew.length;i++){
      st.data.push( dNew[i]);
    }
    var isObj=handle.getIsInds(dNew,colNameForInd,st.js);
    st.ssIs=isObj.ssIs;
    st.shIs=isObj.ssIs;
  };  
  st=setters.addMembTo(st,'','renewTData',renewTData,'functionReNewTemplateData');
  /**
  * Sets stValue for parameter in Setters sheet and fills in t.data appropriate cells and 
  * dependent cells
  * @param {Object}client - st-object of Block whose stValue is assigning
  * @param {Integer}iniRow - index of initial row of block
  * @param {string}stColName - name of column specifying block parameters
  * @param {String|RegExp}paramName - name of parameter( value of cell in specified column
  *                                  or regular expression object to identify paramName being searched
  * @param {Object}inputOpt - optional object to transfer data for calculation stValue if necessary
  * @return {Object} - object stVO which value object is to be assigned as current assigned stValue of client
  *             outside this method should be executed   client.stValue=stVO.value
  *             other porperties of stVO could be varied depending of paramName and client
  */
  var setStValue=function(client,iniRow,stColName,paramName,inputOpt){
    var t;/* -- gets t-object of predatory(ancestor) sprSht object */
    if(client.bType=='sprSht'){
      t=client.t;
    }else{
      var prnt;
      while( (!prnt)||(prnt.bType!='sprSht')){
        prnt=(!prnt)?setters.us[client.parentUid]:setters.us[prnt.parentUid];
        t=(prnt.bType=='sprSht')?prnt.t:false;
      }
    }    
    var bTProps=setters.basicNames.bTypesProps[client.bType];
    var bTStLabels=setters.basicNames.bTStLabels[client.bType];    
    var stVal=t.data[iniRow][parseInt(t.js.stValue,10)];
    var stVO={};
    switch (stColName){
      case 'sprShSetters':
        if(paramName=='blockLines'){
          if(stVal){
            if(/^[{].*[}]$/.test(stVal)){
              // stVal is already object 
              stVO=JSON.parse(stVal);
              stVO.value=(parseInt(t.lastLineRowInd,10)-iniRow);
              stVO.blocks.uids+=','+client.uid;
              stVO.blocks.values+=','+(parseInt(t.lastLineRowInd,10)-iniRow);
            }else{
              stVO={
                value:(parseInt(t.lastLineRowInd,10)-iniRow),
                blocks:{
                  uids:client.uid,
                  values:(parseInt(t.lastLineRowInd,10)-iniRow)
                }
              };
            }
            // -- Rendering 
            t.data[iniRow][parseInt(t.js.stValue,10)]=JSON.stringify(stVO);
            t.data[iniRow][parseInt(t.js.iRowUids,10)]=stVO.blocks.uids;
          }
        }else if(paramName=='origins'){  
          t.data[iniRow][parseInt(t.js.stValue,10)]=(inputOpt)?iputOpt.stValue:stVal;
          stVO.value=t.data[iniRow][parseInt(t.js.stValue,10)];
        }else if(/origin/.test(paramName)){
          t.data[iniRow][parseInt(t.js.stValue,10)]=(inputOpt)?iputOpt.stValue:stVal;
          stVO.value=t.data[iniRow][parseInt(t.js.stValue,10)];
        }else if(paramName=='documents'){
          t.data[iniRow][parseInt(t.js.stValue,10)]=(inputOpt)?iputOpt.stValue:stVal;
          stVO.value=t.data[iniRow][parseInt(t.js.stValue,10)];
        }else if(/doc[A-Z]/.test(paramName)){
          t.data[iniRow][parseInt(t.js.stValue,10)]=(inputOpt)?iputOpt.stValue:stVal;
          stVO.value=t.data[iniRow][parseInt(t.js.stValue,10)];
        }else if(paramName=='spreadsheet'){
          t.data[iniRow][parseInt(t.js.stValue,10)]=JSON.stringify(stVO);
        }else if(paramName=='sheets'){
          t.data[iniRow][parseInt(t.js.stValue,10)]=JSON.stringify(stVO);
        }else if(paramName=='extraLines'){
          t.data[iniRow][parseInt(t.js.stValue,10)]=JSON.stringify(stVO);
        }else{
          stVal=t.data[iniRow][parseInt(t.js.stValue,10)];
          stVO={
            value:stVal,
            blocks:{
              uids:client.uid,
              values:stVal
            }
          };
          // --- Rendering
          // leaves what there were 
        }
        break;
      case 'shSetters':
        break;
      default:
    }
    return stVO;
  };
  st=setters.addMembTo(st,'','setStValue',setStValue,'functionSetStVlalue');
  /**
  * returns block's iniRow in t.data of setters for existing spreadsheet st-object - preparent of client
  * @param {Object}client - block st-object
  * @param {string}stColName - column name of Setters sheet header. In this column client parameter is searched
  * @param {string}stColValue - value of client's parameter which is value of row in column stColName of Setters sheet
  * @return {Number}iniRow index of row in Setters sheet where client block begins 
  */
  var getBlockIniRow=function(client,stColName,stColValue){
    var iniRow;
    var indVsCol=handle.is.indsForColNamesDefault;
    var prnt=setters.getSprShtParent(client);
    var t=prnt.t;
    var parent=setters.us[client.parentUid];
    
    /*алгоритм отбора из r-массива: 
    так как анализируется параметр существующего родителя, этот родитель 
    должен быть последним в списке родителей и сам параметр должен быть последним
    в списке параметров родителя. следовательно iniRow параметра
    должен быть первый из тек, который не меньше (>=) iniRow родителя
    */                   
    if( t[indVsCol[stColName]].r[stColValue].length==1 ){
      // the case when only one block with stColValue in column named stColName exists
      iniRow=parseInt(t[indVsCol[stColName]][stColValue],10);
    }else{
      /*if(stColValue=='blockLines1'){
        var childJs=handle.jObj(parent.bids);
        var iChild=parseInt( childJs[client.bid],10);
        iniRow=parseInt( t[indVsCol[stColName]].r[stColValue][iChild],10);
      }else{*/
      
        var childJs=handle.jObj(parent.bids);
        var siblingPatt=new RegExp(client.bid.replace(/\d+$/,''));
        var siblings=[];
        for(var ib in parent.bids){
          if( siblingPatt.test( parent.bids[ib])){
          siblings.push(parent[parent.bids[ib]]);
          }
        }
        var irs=t[indVsCol[stColName]].r[stColValue];
		var ir;
        if( !siblings.length){
          // first sibling  
          for( ir in irs){
            if(parseInt(irs[ir],10)>=parent.iniRow){
              iniRow=parseInt(irs[ir],10);
              break;
            }
          }
        }else{
		  var check;
          for( ir in irs){
            check=false;
            for(var isbl in siblings){
              if(parseInt(irs[ir],10)>=siblings[isbl].iniRow){
                iniRow=parseInt(irs[ir],10);
                check=true;
              break;
              }
            }
            if(check){
              break;
            }
          }
          if(!check){
            Logger.log('sOmething is going wrong!!!');
          }
        }
      //}
    }  
    return iniRow;
  };
  st=setters.addMembTo(st,'','getBlockIniRow',getBlockIniRow,'functionGetBlockIniRow');
  st.parentBid=(clientOpt)?clientOpt.bid:'setters';
  st.paretnUid=(clientOpt)?clientOpt.uid:'setters';
  st.uid=setters.getUid( st.parentUid,st.bid);
  // -- iniRow of setters Template
  var iniRow;
  if( st.ssIs.r.blockLines.length==1 ){
    iniRow=parseInt(st.ssIs.blockLines,10);
  }else{
    if(clientOpt){
      var parent=setters.us[clientOpt.parentUid];
      var childJs=handle.jObj(parent.bids);
      var iChild=parseInt( childJs[clientOpt.bid],10);
      iniRow=parseInt( st.ssIs.r.blockLines[iChild],10);
    }else{
      iniRow=false; // incorrect logic!
      Logger.log('getSettersTemplate  Error! multiple blockLines in sprShSetters while clientOpt is not set');
    } 
  }
  st.iniRow=iniRow;
  st.iBlRow=0;
  return st;
};

// -- Initiates structure object  --- NEW STRUCTURE -- NEW STRUCTURE --- New Structure --- New Structure ---

setters=setters.addMembTo(setters,'structure');
var structure=setters[ setters.bids[ setters.bids.length-1] ];  //structure0;           

structure=setters.addMembTo(structure,'sprShts');
var sprShts=structure[ structure.bids[ structure.bids.length-1] ]; //sprShts0;
sprShts=setters.addMembTo(sprShts,'','t',setters.getSettersTemplate(sprShts),'tObjectForSprShts');

// --- Setters Template ---

// -- sets setters sheet template object sprShts.stTemplate
sprShts=setters.addMembTo(sprShts,'','stTemplate',setters.getSettersTemplate(sprShts),'setterTemplateObject');
// -- here is a place to insert specified properties and method for concreet sprShts collection
// --
sprShts=setters.addMembTo(sprShts,'','getStTemplateExemplar',
                  function(parentSprShts,sprShtOpt,useSprShtSettersOpt){
                     var use=useSprShtSettersOpt||false;
                     return (!(sprShtOpt))?
                       parentSprShts.stTemplate:
                     setters.getSettersTemplate(sprShtOpt,undefined,undefined,use);
                  },'functionGetSettersTemplateExemplar');
/* sprShts.stTemplate=setters.getSettersTemplate(); */


/**
* Makes temporary copy of Setters sheet
* @param {string}sheetNameOpt - name of Sheet. Optional. While it's not set 
*    default name - preSetters_TimeMark is setting
* @return {Sheet} sheet object
*/
sprShts.saveSettersInSheet=function(client,sheetNameOpt){ 
  var defName='_'+'preSetters_'+Utilities.formatDate(new Date(),'GMT+03:00','ddMMYY_HHmmss');
  var shName=(sheetNameOpt)?sheetNameOpt+defName:defName;
  var sPre=client.ss.insertSheet(shName);
  var t=client.t;
  sPre.getRange(1,1,t.data.length,t.data[0].length).setValues(t.data);
  t.sPre=sPre;
  return sPre;
};
/**
* Determins iniColName depending of bType
* @param {string}bType block type string identifier
*/
setters.getIniColName=function(bType){
  var pattsForInds={
    ssIs:'sprShts,sprSht,/^orig/,/^doc/,blsGrps,ssBls,ssCombBl,ssBls,shsBl,sheets,extraL,LL',
    shIs:'shBls,shBl'
  };
  var indsForColNames=handle.is.indsForColNamesDefault;
  var colNamesForInds=handle.is.colNamesForIndsDefault();
  for(var ind in pattsForInds){
    var patts=pattsForInds[ind].split(',');
    for(var ip in patts){
      var ptt=( patts[ip] instanceof RegExp)? patts[ip]: new RegExp(patts[ip]);
      if( ptt.test(bType)){
        return colNamesForInds[ind];          
      }
    }
  }
  return false;
};
/**
* Sets specification object ( returns parameters of block depending of bType and bTProp )
* @param {string}bType - block Type
* @param {string}bTProp - btype property bProp(value of bProps column of structureAndName sheet)
* @return {Object}specsObj - object of specifying parameters
*   {bType:'',            - block type
*   iniColName:'',        - column name in setters-sheet (t.data) where block's data rendering initiates
*   stLabel:'',           - cell's value in iniColName column of row in setters sheet(stLabel) 
*   endMarkColNm:'',      - column name wich value is used in determination lastRow of block
*   endMarkCellValue:'',    - cell's value (stLabel) in appropriate colName of row in setters seet 
*   name:'',              -
*   legend:'',            - 
*   bTProps:{
*             stLabels:[],    - array of slLabels (labels in live setters-sheet) using to announce-mark
*                               properties(bProps look bellow) of specified bType 
*             bProps:[]       - array of appropriate bProps for which stLabels are set for bType in consideration
*            },
*   crv:{
*           cN:
*           nR:
*           nC:
*           n:
*         ptc:
*           n:
*       },
*   btPsCrvs:{
*           crvs::true,   - default column for rendering stValue is 'stVlaue'
*           stValColNames:[],  - name of setters columns where stValues should be rendered(displayed)
*           bProps:[]          - bType's properties names for which stValueColNames are not defaults
*          }
*   }
*/
setters.getSpecsObj=function(bType,bTPropOpt){
  var basicNames=setters.basicNames;
  var bTProp=bTPropOpt||'';
  var mBTP=(bTProp)?bType+'_'+bTProp:bType;
  var specsOb={};
  var dbn=basicNames.data;
  var js=handle.jObj(dbn[0]);
  var mindBTP=basicNames.mindBTP;
  var i=parseInt(mindBTP[mBTP],10);
  var endMarkColName=(dbn[i][paseInt(js.endMarkColNm,10)])?
      dbn[i][paseInt(js.endMarkColNm,10)]:setters.getIniColName(bType);
  
  /* stLabel getting algorithm. stLabel - it's the cell value of t.data array in initial column(iniColName) of initial row(iniRow) of block
  *  which has value assigned( set). This value is considered as name of row.
  *  crv-object (Columns-Rows-Values) contains data regarding initial columns and values for block and subBlocks of block properties
  *  (see description in https://docs.google.com/document/d/1Fi0kHVrI54qqPAxg3i_YPti-2KUbzfzyHQell5CI5iA/edit -
  *    setters_and_BasicNames.doc) 
  */
  // crv-object of bType or bProp
  var crv;
  if(dbn[i][parseInt(js.crv,10)]){
    crv=JSON.parse(dbn[i][parseInt(js.crv,10)]);
  }else if(dbn[i][parseInt(js.nR,10)]){
      crv={cN:dbn[parseInt(mindBTP[bType],10)][parseInt(js.iniColName,10)],nR:dbn[i][parseInt(js.nR,10)]};
  }else{
      crv=undefined;              // bType crv
  }
  // ptc (propertyNameToColumnName - object) in which column the property is rendering
  if(crv){
    var pname= (bTProp)?bTProp:bType;
    crv.ptc=(!crv.ptc)?
      JSON.parse("{"+'"'+pname+'":stValue"'+"}"):crv.ptc;
  }
  var crvs=basicNames.bTPropsAttributes[bType].crv.attrValues;
  // get bTProperies' crv-s
  crv.n=0;
  if(crvs){
    if(crvs.length){
      crv.n=(crvs.length>0)?crvs.length:crv.n;
    }
  }
  var crvBTProps;
  if(crv.n>0){
    crvBTProps=basicNames.bTPropsAttributes[bType].crv.bTProps;    
    crv.ps='';
    for(var ic in crvs){
      crv.ps=(crv.ps)? crv.ps+','+crvBTProps[ic]:crvBTProps[ic];  //csv string of properties names
      
      crvs[ic]=(crvs[ic])?JSON.parse(crvs[ic]):undefined;
      if(crvs[ic]){
        var propName=crvBTProps[ic];
        crvs[ic].ptc=(crvs[ic].ptc)?
          crvs[ic].ptc :
        ( (crvs[ic].cN)?  JSON.parse("{"+'"'+propName+'":'+crvs[ic].cN+"}" ) :JSON.parse("{"+'"'+propName+'":"stValue"'+"}"));
        if(!crv.ptc[propName]){
          crv.ptc[propName]=(crvs[ic].cN)?crvs[ic].cN:'stValue';
        } 
      }      
    }    
  }
  var iniColName=(dbn[i][parseInt(js.iniColName,10)])?
      dbn[i][parseInt(js.iniColName,10)]
  : setters.getIniColName(bType);
  var stLabel=(dbn[i][parseInt(js.stLabel,10)])?
      dbn[i][parseInt(js.stLabel,10)]
  : (crv.value)?crv.value
  : '';      
  return {
    bType:bType,
    mBTP:mBTP,
    iniColName:iniColName,
    stLabel:stLabel,
    endMarkColName:endMarkColName,
    endMarkCellValue:dbn[i][paseInt(js.endMarkStLabel,10)],
    name:dbn[i][parseInt(js.bName,10)],
    legend:dbn[i][parseInt(js.legend,10)],
    bTProps:{
      stLabels:basicNames.bTPropsAttributes[bType].stLabel.attrValues,
      bProps:basicNames.bTPropsAttributes[bType].stLabel.bTProps,
    },
    crv:crv,
    bTPsCrvs:(crv.n>0)?{
                         crvs:crvs,
                         bProps:crvBTProps
                        }:undefined,
    /** returns column name of t.data where to fill in param value(stValue)
    * @param {string}param bType or BProp
    * @return {string} - column name of Setters sheet (t.data) where to place stValue parameter
    */
    getParamColName:function(param){
       if(sO.crv){
        if(sO.crv.ptc){
          return (sO.crv.ptc[param])?sO.crv.ptc[param]:'stValue';
        }else{
          return 'stValue';
        }
      }else{
        return 'stValue';
      }
    }
  };
};

/** function assignment
* @param {string}parentUid
* @param {string}memBid
* @param {Object}funcObj - NOT Used yet. Object with properties:
*                  .funcBody {Function} - function object
*                  .preFuncComment{string} in script file "\/** *\/"
*                  .legend{string} short description
*/
setters.addFunction=function(parentUid,memBid,funcObj){
  var funcBody=(typeof funcObj === 'function')?funcObj:funcObj.funcBody;
  var fuid=setters.getUid(parentUid,memBid);
  setters.ufs[fuid]=funcBody;
  setters.fuids.push(fuid);
  return fuid;
};
/** ***********************  TEMPLATES  *************************
/**
*  Explanations:
*    templates=basicNames.templates - object of set of st-objects templates
*     methods=tempates.methods - object,containing all blocks methods
*     
*     mBTP - unambigously selects bn.data parameter. Therefore it could be used as uid
*     bType is unique; mBTP=bType_bProp||btype, bProp is unique for specified bType
*     
*     template=templates[mBTP] - single prototype object for block of mBTP     
*                                     
*     How are connected templates uid and mbtp :
*       uid=parent.uid_member.bid -> 
*       member.bid=bType||bProp + 'T'     
*     
*     To construct structureTree of templates we can use 
*     addBlockTo method for each group-bType in a way when childsTypes part would not be executed
*     (would not evalueated)                                    
*                                     
*     Common or general methods object is introduced for blocks templates
*     templates.methods , which containes methods for each mBTP blocks
*     template.methods - for all obj
*     templates.methods[mBTP] - for scpecified mBTP
*     
*     to call method m0 for block-template whith specified mBTP (this is mBTP of template not block (?) )
*     use          template.methods[mBTP][m0]
*          
*     at the same time all functions are stored in objects setters.fus and setters.fuids
*     function of method with identifier 'fuid' is called by
*     setters.fus[fuid]
*     
*/
/** 
* methods determination Object: 
*          
* methods[mBTP]={
*             methodsNames:[m0Name,m1Name,...],
*             m0Name:function(){},
*             m1Name:function(){},
*             ...
*           legends:[legendM0,legendM1,...],
*           };
*/

/**
* Variants for determination of concrete block's object Template :
* 1. template from setters t.data (by stLabels rows) - method - setters.getBlockTemplate(t,bType,specsObjOpt)
* 2. template calculated  for specified block types.
*    Special method per blockType(bTypes: sh,shBl, ssBl,ssComBlock ) for ex. .addComBlock()
* 3  recurent calculation using data in bn.data table and method addBlock(parent,bType)
* 4. quazi manually templates setting by means of objects prototypes (  colsBls, colBl, mULs, mUL, mUps, mUp ...
*    in combination with calculation
*/

/**
* Special role and meaning of t-object.
* t-object is 
*/

setters.basicNames=setters.addMembTo(setters.basicNames,'','templates',undefined,'templatesObjects');
var templates=setters.basicNames.templates;
templates.methods={};
templates.methods.legends={};
/**
* tFies property value, i.e. adds 'T' to property value
* to mark relation to Template
* @param {string}prop - property identifyer. Fro ex.: 'mBTP' or 'parent' or 'bid'
* @param {string}v - original value of parameter
* @return {string} value changed 
*/
templates.tFy=function(prop,v){
  var vnew='';
  switch (prop) {
    case 'mBTP':      
      var ps=v.split('_');
      for(var iv=0;iv<ps.length;iv++){
        vnew+=(iv==0)?ps[iv]+'T':'_'+ps[iv]+'T';
      }
      break;
    default:
      vnew=v+'T';
  }
  return vnew;
};
/**
* Unites property value, i.e. reduces 'T' from property value added by .TFy method
* to mark relation to Template
* @param {string}prop - property identifyer. Fro ex.: 'mBTP' or 'parent' or 'bid'
* @param {string}v - original value of parameter
* @return {string} value changed 
*/
templates.unT=function(prop,v){
  var vnew='';
  switch (prop) {
    case 'mBTP':      
      var ps=v.split('_');
      for(var iv=0;iv<ps.length;iv++){
        vnew+=(iv==0)?ps[iv].replace(/T$/,''):'_'+ps[iv].replace(/T$/,'');
      }
	  
      break;      
    default:
	
  }
  return vnew;
};
/**
* Adds 'T' to first or both parts of mBTP value - a_b -> aT_bT
* @param {string}v - value of mBTP
* @return {string} new value of mBTP for template
*/
templates.mBTPTfy=function (v){
  var vnew='';
  var ps=v.split('_');
  for(var iv=0;iv<ps.length;iv++){
    vnew+=(iv==0)?ps[iv]+'T':'_'+ps[iv]+'T';
  }
  return vnew;
};
/**
* Discards 'T' from first or both parts of mBTP value - a_b -> aT_bT
* @param {string}v - value of template mBTP
* @return {string} new value of mBTP without terminated 'T's
*/
templates.mBTPUnT=function (v){
  var vnew='';
  var ps=v.split('_');
  for(var iv=0;iv<ps.length;iv++){
    vnew+=(iv==0)?ps[iv].replace(/T$/,''):'_'+ps[iv].replace(/T$/,'');
  }
  return vnew;
};




/**
* Adds method to setters.basicNames.methods object
* @param {string}mBTP - of a block or property to whome methods is assigned to
* @param {string}methodName - method's name
* @param {Function}f - methods function
* @param {string}legend - short descrioption of method action
* @return {Object} - methods object
*/
setters.basicNames.templates.methods.addMethod=function(mBTP,methodName,legend,f){
  var uidMethods='setters_basicNames_templates_methods';
  var methods=setters.basicNames.templates.methods;
  var methodsBTP=(methods[mBTP])?methods[mBTP]:
  {
    methodsNames:[],
    legends:[]
  };
  setters.addFunction(uidMethods+mBTP,methodName,f);  
  methodsBTP.methodsNames.push(methodName);
  methodsBTP.legends.push(legend);  
  methodsBTP[methodName]=f;  
  return methods;
};  
/**
* assigns typical methods to a template
* @param {Object}templ - template object
* @param {string}mBTP - mBTP parameter of block object for wich template is creating
* @param {Object}fsObjOpt - object of functions determining method for specified method names
*                             {getNChildOfType:funcion(){},stvOCalc:function(){},getChildsTypes:function(){}}
* @return {Object} - template object
*/
setters.basicNames.templates.addTypicalMethodsToTemplate=function(templ,mBTP,fsObjOpt){
  var basicNames=setters.basicNames; 
  var templates=basicNames.templates;
  var methods=templates.methods;
  var legends=setters.basicNames.protos.setMethodsLegends();
  //var legends=methods.legends;
  var uidMethods='setters_basicNames_templates_methods';  
  var methodsNames=['getNChildsOfType','stvOCalc','getChildsTypes'];
  setters.getChildsTypes=setters.basicNames.getChildsTypes;
  
  // adding standard methods to template
  for(var im in methodsNames){
    var methodName=methodsNames[im];
    templ[methodName]=setters[methodName];                   // templates.methods.mPTP[methodName];
    
    var legend=(!(legends[mBTP]) || !(legends[mBTP][methodName]))?'method '+methodName+' for '+mBTP:legends[mBTP][methodName];
    var f=((fsObjOpt)&&(fsObjOpt[methodName]))?fsObjOpt[methodName]:setters[methodName];
    var fuid=uidMethods+'_'+mBTP+'_'+methodName;
    var parameters={mBTP:mBTP,
                    methodName:methodName,
                    fuid:fuid,
                    legend:legend,
                    f:f};
    //methods=methods.addMethod(parameters);
    methods=methods.addMethod(mBTP,methodName,legend,f);
  }
  return templ;
};
/**
* Creates block's template object for specified block type using t.data and stLabels
* could be used for those block whose data are taken from t.data
* @param {Object}t - t-object
* @param {string}bType - block type
* @param {Object}specsObjOpt - Optional.block specification object (look at description in setters.getSpecsObj-method)
* @return {Object} template of st-object for block
*/
setters.getBlockTemplate=function(t,bType,specsObjOpt){
  var basicNames=setters.basicNames;
  var bnData=basicNames.data;                                        // basic Names shhet data
  var jsBN=handel.jObj(bnData[0]);
  var mindBTP=basicNames.mindBTP;
  var indsForColNames=handle.is.indsForColNamesDefault;
  var mind=handle.getIsInds(t.data);
  /**
  * checks if object has properties
  * @param {Object}o - object testing
  * @return {Boolean} true if yes
  */
  var oHasPs=function(o){for(var i in o){return true;}return false;};
  
  // --- specification object
  var sO=specsObjOpt||setters.getSpecsObj(bType);
  var jsStLabels=handle.jObj(sO.bTProps.stLabels);
  
  //  block data
  
  var blT=setters.getObjTemplate();
  blT.name=sO.name;
  
  var stLabels=basicNames.bTPropsAttributes[bType].stLabel.attrValues;
  var nStLabels=((stLabels)&&(Array.isArray(stLabels)))?stLabels.length:0;  

  var iIni=parseInt( mind[ indsForColNames[ sO.iniColName]][sO.stLabel],10);
  var iLimit=(sO.endMarkCellValue)?
      parseInt( mind[ indsForColNames[ sO.endMarkColName]][sO.endMarkCellValue],10) : nStLabels+1;
  blT.iniRow=iIni;
  blT.nblRows=iLimit-iIni;
  blT.legend='templateOf:'+sO.legend;  
  
  // block properties data
  var iSubBl=0;
  for( var i=iIni;i<iLimit;i++){
    var parName=t.data[i][parseInt(t.js[sO.iniColName],10)];
    if(!jsStLabels[parName]){
      Logger.log("parameter's name "+parName+"in settersHeet is not present in basic names bProps list \n"+
                'for bType '+bType) ;
    }
    
    var mBTP=(parName)?bType+'_'+parName:bType;                                 // multiIndex   
    var iRowOfParName=parseInt( mindBTP[mBTP],10);                     // irow in bn.data
    
    var nameStr=bnData[iRowOfParName][parseInt(jsBN.bName,10)];    // bName from basicNames sheet
    blT=setters.addMembTo(blT,'',parName,setters.getObjTemplate(),(nameStr)?nameStr:parName+'Parameter');
    var parObj=blT[ blT.bids[ blT.bids.length-1 ]];
    
    parObj.iniRow=i;
    parObj.nBlRows=1;
    parObj.iBlRow=iSubBl;
    parObj.iniColName=sO.iniColName;
    parObj.legend='templateOf:'+setters.getSpecsObj(bType,parName).legend;
    iSubBl++;
  }    
  return blT;
};
/** 
* Returns template for ssCombBl block
* @return {Object}
*/
sprShts.getSsCombBlTemplate=function(t){
 
  //  initiates ssCombBlock  ---
  var ssCombBlTName='ssCombBlTemlplate';
  var ssCombBlT=setters.getObjTemplate();
  
  ssCombBlT.name=ssCombBlTName;
  
  var iIni=parseInt(t.ssIs.blockLines,10);
  var iLimit=parseInt(t.ssIs.lastLine,10);
  ssCombBlT.iniRow=iIni;
  ssCombBlT.nBlRows=iLimit-iIni;
   
  var iBl=0;
  for( var i=iIni;i<iLimit;i++){
    var parName=t.data[i][parseInt(t.js.sprShSetters,10)];
    ssCombBlT=setters.addMembTo(ssCombBlT,'',parName,setters.getObjTemplate(),parName+'Parameter');
    var parObj=ssCombBlT[ ssCombBlT.bids[ ssCombBlT.bids.length-1 ]];
    parObj.iniRow=i;
    parObj.nBlRows=1;
    parObj.iBlRow=iBl;
    parObj.iniColName='sprShSetters';   
    iBl++;
  }  
  return ssCombBlT;
};
sprShts.addSsCombBlock=function(t,prent){
  var ssCombBl=setters.getObjTemplate();
  ssCombBl.parentBid=prent.bid;
  ssCombBl.parentUid=prent.uid;
  // -- gets closest sprSht object
  var prnt=function(){
	var prnt;
    if(prent.bType!='sprSht'){      
      while( (!prnt)||(prnt.bType!='sprSht')){
        prnt=(!prnt)?setters.us[prent.parentUid]:setters.us[prnt.parentUid];
      }
    }else{
      return prent;
    }
    return prnt;
  }();  
  var sheets=prnt.sheets;
  var shNames=prnt.shNames;
  // filling spreadsheet stValues  
  var iIni=parseInt(t.ssIs.blockLines,10);
  var iLimit=parseInt(t.ssIs.lastLine,10);
  ssCombBl.iniRow=iIni;
  ssCombBl.nBlRows=iLimit-iIni;
  var iBl=0;
  for( var i=iIni;i<iLimit;i++){
    var parName=t.data[i][parseInt(t.js.sprShSetters,10)];
    ssCombBl=setters.addMembTo(ssCombBl,'',parName,setters.getObjTemplate(),parName+'Parameter');
    var parObj=ssCombBl[ ssCombBl.bids[ ssCombBl.bids.length-1 ]];
    var par=parObj[parName];
    switch (parName){
      case 'id':
        par.stValue=prnt.ssId;
        par.name='spreadsheetId';
        break;
      case 'url':
        par.stValue=prnt.url;
        par.name='spreadsheetUrl';
        break;
      case 'name':
        par.stValue=prnt.ssName;
        par.name='spreadsheetName';
        break;
      case 'parentFolderId':
        par.stValue=DriveApp.getFileById(prnt.ssId).getParents().next().getId();
        par.name='sprsheetFileFolderId';
        break;
      case 'nSheets':
        par.stValue=shNames.length;
        par.name='numberOfSheets';
        break;
      case 'sheetsNames:':
        par.stValue=shNames[0];
        par.name='sheetsNames';break;
      default :  
    }
    parObj.iniRow=i;
    parObj.nBlRows=1;
    parObj.iBlRow=iBl;
    parObj.iniColName='sprShSetters';
    parObj.stValue=t.setStValue(ssCombBl,i,'sprShSetters',parName);
    iBl++;
  }  
  var ib=parseInt(handle.jObj(setters.us[prnt.parentUid][prnt.bType+'Bids'])[prnt.bid],10);
  var irSh0=parseInt(t.ssIs.r['sheetsNames:'][ib],10); // parseInt(ssCombBl['sheetsNames:'].iniRow,10)
  var d1=t.data.slice(0,irSh0+1);
  var d2=t.data.slice(parseInt(ssCombBl.extraLines.iniRow,10));
  // header row index for sheets[0]
  d1[ irSh0 ][parseInt(t.js.ind,10)]=(ssCombBl.name=='dataGlossaryAndGroups')?1:0;     // header row index
  ssCombBl=setters.addMembTo(ssCombBl,'','shsHeadRowInd',setters.getObjTemplate(),'sheetsHeadersIndices');
  ssCombBl=setters.addMembTo(ssCombBl.shsHeadRowInd,'',shNames[0],d1[irSh0 ][parseInt(t.js.ind,10)],'sheetHeaderInd');
  // sheets part in ssCombBl
  var insert=[];
  for(var ish in shNames){
    if( ish!=0){
      var insRow=[];
      for(var j in t.header){
        insRow.push('');
      }
      insRow[ parseInt( t.js.stValue,10)]=shNames[ish];
      //  indOfHeaderRow is inserted in cells of column named 'ind'
      insRow[ parseInt(t.js.ind,10)]=((prnt.ssName=='dataGlossaryAdnGroups')&&(shNames[ish]=='dataGroups'))?1:0; 
      ssCombBl=setters.addMembTo(ssCombBl.shsHeadRowInd,'',shNames[ish],insRow[ parseInt(t.js.ind,10)],'sheetHeaderInd');
      insert.push(insRow);
    }
  }
  var nOfInsertedRows=insert.length;
  if((nOfInsertedRows)&&(nOfInsertedRows>0)){
    prnt.dNew=d1.concat(insert).concat(d2);
    t.renewTData(prnt.dNew);
  }else{
    prnt.dNew=t.data;
  }
  // correction of values after rows insertion
  for(var ir in t.ssIs){
    if((parseInt(t.ssIs[ir],10)>irSh0)&&(ir!='lastLine')){
      ssCombBl[ir].iniRow=parseInt(ssCombBl[ir].iniRow,10)+nOfInsertedRows;
    }
  }
  return ssCombBl;
};
/**
* Creates and returns object of sheet Block Template
* @param {Object}sprSht - sprSht object whose t-object is used to create shBlTemplate
* @rerturn{Object} - shBlTemplate st-object
*/
sprShts.createShBlTemplate=function(sprSht){
  
  var t=sprSht.t; 
  // -- sheet Block Template shBlT
  var shBlT={};
  var shBlTData=[];
  var iniRowInd=0;
  for( var ir in t.shIs){
    var iadd=parseInt( t.shIs[ir],10);
    shBlTData.push( t.data[iadd]);      
    var op=sprShts.setBlProp(parseInt(t.shIs[ir],10),'shSetters');
    op.iniRow=iniRowInd;
    shBlT[op.label]=op;
    iniRowInd++;
    op.iBlRow=iniRowInd;
  }
  var shBlTIs=handle.getIs('shSetters',shBlTData,t.header);
  
  shBlT.data=shBlTData;
  shBlT.shBlTIs=shBlTIs;
  /** 
  * set value for label key parameter in sheet block
  * and returns shBl[key] object
  */
  shBlT.setValue=function(key,val){
    shBlT[key].stValue=val;
    shBlT.data[ parseInt(shBlTIs[key],10) ][parseInt( t.js.stValue,10)]=val;
    return shBlT[key];
  };
  /**
  * gets value
  */
  shBlT.getValue=function(key){
    var value= shBlT[key].stValue;
    return value;
  };
  return shBlT;
};
/**
*  Creates combined spreadsheet's block and adds it to parent block 
* @param {Object}parent - ssBls st-object
* @param {Object}t t-object of spreadsheet's setters 
* @return {Object} st-object of combined spreadsheet block  
*/
setters.addCombBlock=function(parent,t){    
  parent=setters.addMembTo(parent,'ssCombBl',undefined,parent.ssCombBlTemplate);
  var ssCombBl= parent.ssCombBlObjs[ parent.nSsCombBls-1 ];
  ssCombBl.bType='ssCombBl';
  ssCombBl.parentBid=parent.bid;
  ssCombBl.parentUid=parent.uid;
  // -- gets closest sprSht object
  var prnt=setters.getSprShtParent(parent);  
  var sheets=prnt.sheets;
  var shNames=prnt.shNames;
  var iIni=parseInt(t.ssIs.blockLines,10);
  var iLimit=parseInt(t.ssIs.lastLine,10);
  ssCombBl.iniRow=iIni;
  ssCombBl.nBlRows=iLimit-iIni;
  var iBl=0;
  for( var i=iIni;i<iLimit;i++){
    var parName=t.data[i][parseInt(t.js.sprShSetters,10)];
    ssCombBl=setters.addMembTo(ssCombBl,'',parName,setters.getObjTemplate(),parName+'StParameter');
    //var parObj=ssCombBl[ ssCombBl.objs[ ssCombBl.bids.length-1 ]];
    var parObj= ssCombBl[ssCombBl.bids[ssCombBl.bids.length-1] ];
    //var par=parObj[parName];
    switch (parName){
      case 'id':
        parObj.stValue=prnt.ssId;
        parObj.name='spreadsheetId';
        break;
      case 'url':
        parObj.stValue=prnt.url;
        parObj.name='spreadsheetUrl';
        break;
      case 'name':
        parObj.stValue=prnt.ssName;
        parObj.name='spreadsheetName';
        break;
      case 'parentFolderId':
        parObj.stValue=DriveApp.getFileById(prnt.ssId).getParents().next().getId();
        parObj.name='sprsheetFileFolderId';
        break;
      case 'nSheets':
        parObj.stValue=shNames.length;
        parObj.name='numberOfSheets';
        break;
      case 'sheetsNames:':
        parObj.stValue=shNames[0];
        parObj.name='sheetsNames';
		break;
      default :  
        parObj.stValue=t.setStValue(ssCombBl,i,'sprShSetters',parName);
    }
    parObj.iniRow=i;
    parObj.nBlRows=1;
    parObj.iBlRow=iBl;
    parObj.iniColName='sprShSetters';
    iBl++;
  }    
  var ib=parseInt(handle.jObj(setters.us[parent.uid][ssCombBl.bType+'Bids'])[ssCombBl.bid],10);
  var irSh0=parseInt(t.ssIs.r['sheetsNames:'][ib],10);
  var d1=t.data.slice(0,irSh0+1);
  var d2=t.data.slice(parseInt(ssCombBl.extraLines.iniRow,10));
  // header row index for sheets[0]
  ssCombBl=setters.addMembTo(ssCombBl,'','shsHeadRowInd',setters.getObjTemplate(),'sheetsHeadersIndices');
  d1[ irSh0 ][parseInt(t.js.stValue,10)]=shNames[0];
  d1[ irSh0 ][parseInt(t.js.ind,10)]=(ssCombBl.name=='dataGlossaryAndGroups')?1:0;     // header row index    
  ssCombBl=setters.addPropTo(ssCombBl.shsHeadRowInd,shNames[0],d1[irSh0 ][parseInt(t.js.ind,10)],'sheetHeaderInd');
  // sheets part in ssCombBl
  var insert=[];
  for(var ish in shNames){
    if( ish!=0){
      var insRow=[];
      for(var j in t.header){
        insRow.push('');
      }
      insRow[ parseInt( t.js.stValue,10)]=shNames[ish];
      //  indOfHeaderRow is inserted in cells of column named 'ind'
      insRow[ parseInt(t.js.ind,10)]=((prnt.ssName=='dataGlossaryAdnGroups')&&(shNames[ish]=='dataGroups'))?1:0; 
      ssCombBl=setters.addPropTo(ssCombBl.shsHeadRowInd,shNames[ish],insRow[ parseInt(t.js.ind,10)],'sheetHeaderInd');
      insert.push(insRow);
    }
  }
  var nOfInsertedRows=insert.length;
  if((nOfInsertedRows)&&(nOfInsertedRows>0)){
    prnt.dNew=d1.concat(insert).concat(d2);
    t.renewTData(prnt.dNew);
  }else{
    prnt.dNew=t.data;
  }
  // correction of values after rows insertion
  // -- correction of iniRow
  for(var ir in t.ssIs){
    if((parseInt(t.ssIs[ir],10)>irSh0)&&(ir!='lastLine')){
      ssCombBl[ir].iniRow=parseInt(ssCombBl[ir].iniRow,10)+nOfInsertedRows;
    }
  }
  t.lastLineRowInd=parseInt(t.lastLineRowInd,10)+nOfInsertedRows;
  // --- corrects of nBlRows of predecessOrs
  setters.parentsLengthCorrection(ssCombBl,nOfInsertedRows);    
  return ssCombBl;
};

/**
* assembles murkUp data for all columns of current sheet and collects them in one object
* @param {Object}shBl - st-object of sheet analyzing
* @param {Boolean}excludeDefaultsOpt - Optional Boolean parameter. Determines is or not to take into
*  account the most populated values of markUp parameters 
*  (use .add or .adD methods of multiindex analisys)
* @return {Object} -
*                   shMUpS={
*                           shName:s.getName(),      {string}sheet Name
*                           shHeader:shHeader,       {Array []}sheet's header
*                           mULs:mULs,               {Array []}array of mark up labels which will be assigned as properties for each column
*                           mUpSets:mUpSets,         object of sheet's dataRange mark up Sets appropriated to mULs
*                           mindMarks:mindMarks      array of multiIndex mark up marks each in format:
*                                                    sheetName_colName_mUL
*                           };
*                    shMUpS[mindMark].mind- handle.multiIndex[mindMark] - object - multiindex of markUp data appropriate
*                          to each mindMark, where mindMark=shName_colName_mUL
*/
setters.getMarkUps=function(shBl,excludeDefaultsOpt){
  var excludeDefaults=excludeDefaultsOpt||false;
  var s=shBl.s;
  var dR=s.getDataRange();
  var shData=dR.getValues();
  var shHeader=shData[ parseInt(shBl.shHeadRowInd.stValue,10)];
  // markUps Labels
  var mULs=[];
  var mUpSets={};
  for(var mm in handle.multiIndex.markUpParams){
    var lbl=handle.multiIndex.markUpParams[mm].label;
    if(lbl!='value'){
      mULs.push();
      mUpSets[lbl]=handle.multiIndex.markUpParams[mm].getSet(dR);
    }
  }
  var shMUpS={
    shName:s.getName(),
    mUpSets:mUpSets,
    mULs:mULs,
    shHeader:shHeader
  };
  var mindMarks=[];
  
  // multiIndex objects
  var minds={};
  for(var il in mULs){
    for(var icl in shHeader){
      var mindMark=shMUpS.shName+'_'+shHeader[icl]+'_'+mULs[il];
      mindMarks.push(mindMark);
      shMUpS[mindMark]={};
      var tst=shMUpS[mindMark];
      tst.mind=handle.multiIndex.init(mindMark);
      tst.v={};
      tst.r={};
      tst.n={};
      tst.icl=icl;
      tst.il=il;
      for(var i=parseInt(shBl.shHeadRowInd.stValue,10)+1;i<shData.length;i++){
        if( !excludeDefaults){
          tst.mind.add( shMUpS.mUpSets[ mULs[il]][i][icl],i); 
        }else{
          tst.mind.adD( shMUpS.mUpSets[ mULs[il]][i][icl],i,handle.multiIndex.mUDefaults[mULs[il]]); 
        }
      }
    }
  }
  shMUpS.mindMarks=mindMarks;
  return shMUpS;
};
/**
* assembles murkUp data for all columns of the current sheet
* forms  columns block rows for setters sheet.data lines
* @param {Object}shBl - st-object of sheet block
* @return {Object} of markUp data for sheet see bellow
*/
setters.getColumnsBlocks=function(shBl){
  var shMUpS=setters.getMarkUps(shBl);
  var shHeader=shMUpS.shHeader;
  var mULs=shMUpS.mULs;
  var mindMarks=shMUpS.mindMarks;
  var t=setters.getAncestor(shBl,'sprSht').t;
  var iBlRow=0;
  var stvos={};
  // stvos - object  used to calculate and store
  //   stValues for different columns data Blocks'
  // stvos object of block is a stovos object property named as block uid stvos[blockUid]
  // stvos[ colsBlsUid ] - json of stValue for colsBls block with uid=colsBlsUid
  // stvos[ colBlUid ] - json of stValue for colBl block with uid=colBlUid
  // ... such format would be usefull in reconstruction of appropriate blocks objects of structure
  var uids=[];
  var bids=[];
  // place to add new block obj of type 'colsBls'
  var bid=(!shBl.nColsBlss)?'colsBls0':'colsBls'+parseInt(shBl.nColsBlss,10);
  var uid=setters.getUid(shBl.uid,bid);
  uids.push(uid);
  bids.push(bid);
  
  stvos[uid]={};
  stvos[uid].bid=bid;
  stvos[uid].uid=uid;
  stvos[uid].shName=shMUpS.shName;
  stvos[uid].nMULs=shMUpS.mULs.length;
  stvos[uid].mULs=shMUpS.mULs;
  stvos[uid].stvO={};
  stvos[uid].stv='';
  stvos[uid].stLabel='columns:';
  stvos[uid].bType='colsBls';
  stvos[uid].nColumns=shHeader.length;
  var sO=setters.getSpecsObj('colsBls');
  stvos[uid].basics={
    bid:stvos[uid].bid,
    uid:stvos[uid].uid,
    name:sO.bName,
    stValue:stvos[uid].stv,
    parentBid:shBl.bid,
    parentUid:shBl.uid,
    iniRow:iBlRow,   // relative index is used
    iBlRow:0,
    iniColName:'shSetters',
    nBlRows:undefined,
    stLabel:stvos[uid].stLabel,
    stValueO:stvos[uid].stvO,
    bType:stvos[uid].bType
  };  
  var columnsLines=[];
  var jH=t.js;
  
  for(var icl=0;icl<shHeader.length;icl++){
    var row=[];
    for(var ic in t.header){
      row.push('');
    }
    var colName=shHeader[icl];
    
    if(icl==0){
      // incerting stLabel for colsBls block(conventional)
      row[ parseInt(t.js.shSetters,10)]=stvos[uid].stLabel;
      row[ parseInt(t.js.legend,10)]=t.data[ parseInt(t.shIs[ stvos[uid].stLabel ],10)][parseInt(t.js.legend,10)];
      row[ parseInt(t.js.uid,10)]=uid;
    }
    // place to add new block obj of type 'colBl'
    var bidClBl='colBl'+icl;
    var uidClBl=setters.getUid(uid,bidClBl);
    uids.push(uidClBl);
    bids.push(bidClBl);
    
    stvos[uidClBl]={};
    stvos[uidClBl].bid=bidClBl;
    stvos[uidClBl].uid=uidClBl;
    stvos[uidClBl].colName=colName;
    stvos[uidClBl].ind=icl;
    stvos[uidClBl].nMULsBls=1;
    stvos[uidClBl].stv='';     //   stvColBl;
    stvos[uidClBl].stvO={};
    sO=setters.getSpecsObj('colBl');
    stvos[uidClBl].basics={
      bid:stvos[uidClBl].bid,
      uid:stvos[uidClBl].uid,
      name:sO.bName,
      stValue:stvos[uidClBl].stv,
      parentBid:stvos[uid].bid,
      parentUid:stvos[uid].uid,
      iniRow:iBlRow,   // relative index is used
      iBlRow:0,
      iniColName:sO.iniCoName,
      nBlRows:1,
      stLabel:(stvos[uidClBl].stLabel)?stvos[uidClBl].stLabel:'',
      stValueO:stvos[uidClBl].stvO,
      bType:'colBl'
    };    
    stvos[uid][colName]=stvos[uidClBl];    
    
    row[ parseInt(t.js.ind,10)]=icl+'';                                 // index ind
    row[parseInt(t.js.colName,10)]=shHeader[icl];
    row[ parseInt(t.js.firstDate,10)]=new Date();                       //first Date
    row[ parseInt(t.js.who,10)]=Session.getEffectiveUser().getEmail();  //who
    row[ parseInt(t.js.uid,10)]=uids.toString(); //list of uids ( in csv string format) of all blocks described in this row
    
    // place to add new block mUps of column
    var bidMULs='mULs'+0;
    var uidMULs=setters.getUid(uidClBl,bidMULs);    
    uids.push(uidMULs);
    bids.push(bidMULs);
    
    stvos[uidMULs]={};
    stvos[uidMULs].bid=bidMULs;
    stvos[uidMULs].uid=uidMULs;
    stvos[uidMULs].nMULs=stvos[uid].nMULs;
    stvos[uidMULs].stv='';  // stvMULs;
    stvos[uidMULs].stvO={};
    sO=setters.getSpecsObj('mULs');
    stvos[uidMULs].basics={
      bid:stvos[uidMULs].bid,
      uid:stvos[uidMULs].uid,
      name:sO.bName,
      stValue:stvos[uidMULs].stv,
      parentBid:stvos[uidClBl].bid,
      parentUid:stvos[uidClBl].uid,
      iniRow:iBlRow,   // relative index is used
      iBlRow:0,
      iniColName:sO.iniCoName,
      nBlRows:1,
      stLabel:(stvos[uidMULs].stLabel)?stvos[uidMULs].stLabel:'',
      stValueO:stvos[uidMULs].stvO,
      bType:'mULs'
    };    
    stvos[uid][colName].mULs=stvos[uidMULs];
    stvos[uidClBl].mULs=stvos[uidMULs];    
    
    for(var il=0;il<mULs.length;il++){
      var mindMark=shMUpS.shName+'_'+shHeader[icl]+'_'+mULs[il];      
      // mUL block
      var mUL=mULs[il];
      var bidMUL='mUL'+il;
      var uidMUL=setters.getUid(uidMULs,bidMUL);
      uids.push(uidMUL);
      bids.push(bidMUL);
      
      stvos[uidMUL]={};
      stvos[uidMUL].bid=bidMUL;
      stvos[uidMUL].uid=uidMUL;
      stvos[uidMUL].mindMark=mindMark;
      stvos[uidMUL].stv='';
      stvos[uidMUL].stvO={};
      stvos[uidMUL].nMUpss=1;  // number of mUps blocks. only 1 with bid='mUps0'
      
      sO=setters.getSpecsObj('mUL');
      stvos[uidMUL].basics={
        bid:stvos[uidMUL].bid,
        uid:stvos[uidMUL].uid,
        name:sO.bName,
        stValue:stvos[uidMUL].stv,
        parentBid:stvos[uidMULs].bid,
        parentUid:stvos[uidMULs].uid,
        iniRow:iBlRow,   // relative index is used
        iBlRow:0,
        iniColName:mUL,
        nBlRows:1,
        stLabel:(stvos[uidMUL].stLabel)?stvos[uidMUL].stLabel:'',
        stValueO:stvos[uidMUL].stvO,
        bType:'mUL'
      };
      stvos[uidMULs][mUL]=stvos[uidMUL];          
      
      var tst=shMUpS[mindMark];
      var mind=tst.mind;
      tst.v=mind.v;
      tst.r=mind.r;
      tst.n=mind.getNs();
      tst.icl=icl;
      tst.mUL=mUL;
      
      // mUL-s columns
      // block mUps;
      var bidMUps='mUps'+0;
      var uidMUps=setters.getUid(uidMUL,bidMUps);
      bids.push(bidMUps);
      uids.push(uidMUps);
      
      stvos[uidMUps]={};
      stvos[uidMUps].bid=bidMUps;
      stvos[uidMUps].uid=uidMUps;
      stvos[uidMUps].mindMark=mindMark;
      stvos[uidMUps].stv='';
      stvos[uidMUps].stvO={};
      stvos[uidMUps].bType='mUps';
      stvos[uidMUps].nMUps=function(mindV){var nvs=0;for(var v in mindV){nvs++;}return nvs;}(mind.v);
      
      stvos[uidMUL].mUps=stvos[uidMUps];
      stvos[uid][colName].mULs[mUL].mUps=stvos[uidMUps];
      
      stvos[uidMULs].stvO[mUL]={};
      stvos[uidMULs].stvO[mUL].mUps={};
      
      var iiv=0;
      for(var iv in mind.v){
        // -- different mUp-s for each mUL  
        var bidMUp='mUp'+iiv;
        var uidMUp=setters.getUid(uidMUps,bidMUp);
        var bidMUpAlt=mUL+'_'+iv;
        uids.push(uidMUp);
        bids.push(bidMUp);
        
        stvos[uidMUp]={}; 
        stvos[uidMUp].bid=bidMUp;
        stvos[uidMUp].uid=uidMUp;
        stvos[uidMUp].bidMUpAlt=bidMUpAlt;
        stvos[uidMUp].nRs=tst.n[iv];
        stvos[uidMUp].iRows=tst.r[iv].toString();
        stvos[uidMUp].mUL=mUL;
        stvos[uidMUp].colName=colName;
        stvos[uidMUp].ind=icl;
        stvos[uidMUp].stv=iv;
        stvos[uidMUp].stvO={};
        stvos[uidMUp].stvO.mUL=mUL;
        stvos[uidMUp].stvO.value=iv;
        stvos[uidMUp].stvO[iv]={
          nRs:tst.n[iv],
          iRows:tst.r[iv].toString()
        };
        stvos[uidMUp].iiv=iiv;
        
        stvos[uidMUps][bidMUpAlt]=stvos[uidMUp];  // alternative bidMUpAlt
        stvos[uidMUps][bidMUp]=stvos[uidMUp];
        stvos[uidMUL].stv+=(iiv==0)?stvos[uidMUp].stv:','+stvos[uidMUp].stv;
        stvos[uidMULs].stvO[bidMUpAlt]=stvos[uidMUp].stvO;
        stvos[uidMULs].stvO[mUL].mUps[iv]=stvos[uidMUp].stvO;
        
        iiv++;
      }
      sO=setters.getSpecsObj('mUps');
      stvos[uidMUps].basics={
        bid:stvos[uidMUps].bid,
        uid:stvos[uidMUps].uid,
        name:sO.bName,
        stValue:stvos[uidMUps].stv,
        parentBid:stvos[uidMULs].bid,
        parentUid:stvos[uidMULs].uid,
        iniRow:iBlRow,   // relative index is used
        iBlRow:0,
        iniColName:mUL,
        nBlRows:1,
        stLabel:(stvos[uidMUps].stLabel)?stvos[uidMUL].stLabel:'',
        stValueO:stvos[uidMUps].stvO,
        bType:'mUps'
      };      
      row[parseInt(t.js[mULs[il]],10)]=stvos[uidMUL].stv;      
    }
    
    row[parseInt(t.js.stValue,10)]=stvos[uidMULs].stv;
    row[parseInt(t.js.uid,10)]=(icl==0)?uids.toString():uids.slice(uids.indexOf(uidClBl)).toString();
    row[parseInt(t.js.stValueO,10)]=JSON.stringify(stvos[uidMULs].stvO);
    
    columnsLines.push(row);
    iBlRow++;
  }  
  var colsBlsO={
    columnsLines:columnsLines,
    uids:uids,
    bids:bids,
    stvos:stvos,
    mindMarks:mindMarks
  };
  return colsBlsO;
};
/**
* returns uid value assosiated with mindMark and iv (some concrete markUp value among all of specified mindMark(shName_colName_mUL)
* @param {string}mindMark - mark Up mark in format 'ShName_ColName_mUL'
* @param {String|Array}iv - concrete value of markUpLabel value of array of values
*                          appropriate to mUps block. Important : for the purpose 
*                          of this method only parameter's type matters. It means
*                          that to return mUps block uid it's sufficient assign only [],
*                          as a parameter
* @return {string} - uid of block appropriate of parameters values
*
* замечание о Cоответствии mindMarks  и uids         
1)раз mindMark уже содержит один из mUL, то он должен соответствовать 
uids-ам уровня "ниже" mULs, не включая его. Т.е. имеющие "оконечный" bid 
типа:
описываемый RegEpx: (mUL\d+|mUp\d+) 

важно - bid 'mUps0' соответствует всем mind[mindMarks].r mind[mindMarks].v
для данной колонки. Поэтому его ст-Значениями(stValue) являются интегральные величины
{csvStr}- .stv = "iv0,iv1,.."  , хотя это же значение можно отнести и к блоку
соответствующего mUL . Получается mUps - чисто формальный пустой групповой тип-блок.
или чисто условно можно разделить
"iv0,iv1,.."  является stv значеним для mUL - mUL.stv="iv0,iv1,.."
а {iv0:{nRs:'',iRows:""},iv1:{nRs:'',iRows:""},...} для mUps, хотя это все-таки формат mUL.stvO
Видимо, надо чтобы mUL и mUPs имели одинаковые значения. для mUps по конвенции требуется знать,
сколько у него детей группы mUp. 
Каждый mUp-block соответствует одному iv
каждый mUL-блок соответствует одному маркАп лейблу mUL (или 'bgColor', или 'fontColor',или... )
поэтому условно можно считать 
mUps.stv=nVs  - количество разных значений лейбла разметки.
или же иметь отдельное свойство mUps.nVs,  а в mUps.stv='shName_colName_mUL'=mindMark
а mUps.stvO={mUL:mUL,nVs:'',iv0:{nRs:'',iRows:""},iv1:{nRs:'',iRows:""},...} , где nVs - количество различных 
значений разметки данного типа( разные bgColors или fontLines ...), а nRs -количество строк с данной разметкой колонки;
iRows - csv строка индексов строк с данной разметкой в колонке
или, учитывая 1), 
в качестве mUps.stvO можно взять mind[mindMark], где mindMark=shName_colName_mUL
mind[mindMark] - более мощный объект из него можно получить все остальные.
{nVs:'',iv0:{},iv1:{},...ivNVs:{}} - более наглядный для представления.(что подходит для stvO)

обобщение: один mindMark соответствует объекту mUL, с uid=shBl.uid+'_colBl'+iCl+'_mULs0_mUL'+iL
включающий в себя все mUps и mUP-s
значение mindMark - соответствует одному mUL
величины (mindMark,iv,nRs, iRows) - соответствует одному mUp    {iv:iv,nRs:nRs,iRows:''}
величины (mindMark,[ivs]) - mindMark и массив [ivs] (или объект) соответствует одному mUps
nVs и [ivs] должны быть параметрами(свойствами) mUps блока

в функции getUidByMindMark должна быть опция параметра iv - массива
если массив значит uid для mUps
*/
setters.getColumnsMUps=function(shBl){
  var shMUpS=setters.getMarkUps(shBl);
  var shHeader=shMUpS.shHeader;
  var mULs=shMUpS.mULs;
  var mindMarks=shMUpS.mindMarks;
  var t=setters.getAncestor(shBl,'sprSht').t;
  var colsBlsO=setters.getColumnsBlocks(shBl);
  var stvos=colsBlsO.stvos;
  // stvos - object  used to calculate and store
  //   stValues for different columns data Blocks'
  // stvos object of block is a stovos object property named as block uid stvos[blockUid]
  // stvos[ colsBlsUid ] - json of stValue for colsBls block with uid=colsBlsUid
  // stvos[ colBlUid ] - json of stValue for colBl block with uid=colBlUid
  // ... such format would be usefull in reconstruction of appropriate blocks objects of structure
  var uids=colsBlsO.uids;
  var bids=colsBlsO.bids;

  var iniMUpsRows=function(){
    var row=[];    
    for(var ic in setters.t.header){
      if(ic=='shSetters'){row.push('mUps');}else{row.push('');}
    }
    return [row];
  };
  var mUpsRows=iniMUpsRows();
  var iBlRow=colsBlsO.columnsLines.length;  
     
  var bid=(!shBl.nColsBlss)?'colsBls0':'colsBls'+parseInt(shBl.nColsBlss,10);
  var uid=setters.getUid(shBl.uid,bid);
  
  // -- All mUps part of presentation
  for(var icl in shHeader){
    var row=[];
    for(var ic in t.header){
      row.push('');
    }
    var colName=shHeader[icl];
    
    var bidClBl='colBl'+icl;
    var uidClBl=setters.getUid(uid,bidClBl);
    var bidMULs='mULs'+0;
    var uidMULs=setters.getUid(uidClBl,bidMULs);
    var bidMUps='mUps'+0;
    var uidMUps=setters.getUid(uidMULs,bidMUps);
    
    // mUL-s for columns
    for(var il in mULs){
      var mUL=mULs[il];
      var bidMUL='mUL'+il;
      var uidMUL=setters.getUid(uidMULs,bidMUL);
      var mindMark=shMUpS.shName+'_'+shHeader[icl]+'_'+mULs[il];
      var tst=shMUpS[mindMark];
      var mind=tst.mind;
      tst.v=mind.v;
      tst.r=mind.r;
      tst.n=mind.getNs();
      tst.icl=icl;
      tst.mUL=mUL;
      
      // mUp-s of each mUL for each column
      var iiv=0;
      for(var iv in mind.v){
        
        var bidMUp='mUp'+iiv;
        var uidMUp=setters.getUid(uidMUps,bidMUp);
        var bidMUpAlt=mUL+'_'+iv;
        
        row[parseInt(t.js.ind,10)]=icl;
        row[parseInt(t.js.colName,10)]=colName;
        row[parseInt(t.js[mULs[il]],10)]=stvos[uidMUp].stv;
        row[parseInt(t.js.uid,10)]=stvos[uidMUp].uid;
        row[parseInt(t.js.shSetters,10)]=stvos[uidMUp].bidMUpAlt;
        row[parseInt(t.js.stValue,10)]=JSON.stringify(stvos[uidMUp].stvO[iv]);
        row[parseInt(t.js.stValueO,10)]=JSON.stringify(stvos[uidMUp].stvO);
        
        var sO=setters.getSpecsObj('mUp');
        stvos[uidMUp].basics={
          bid:stvos[uidMUps].bid,
          uid:stvos[uidMUps].uid,
          name:sO.bName,
          stValue:stvos[uidMUp].stv,
          parentBid:stvos[uidMUps].bid,
          parentUid:stvos[uidMUps].uid,
          iniRow:iBlRow,   // relative index of colsBls block rows is used
          iBlRow:iiv,
          iniColName:'shSetters',
          nBlRows:1,
          stLabel:(stvos[uidMUp].bidMUpAlt),
          stValueO:stvos[uidMUp].stvO,
          bType:'mUps'
        };
        
        mUpsRows.push(row);
        iBlRow++;
        iiv++;
      }
    }
  }
  return {
    columnsLines:colsBlsO.columnsLines,
    mUpsRows:mUpsRows,
    colsBlsRowsAll:columnsLines.concat(mUpsRows),
    uids:uids,
    bids:bids,
    stvos:stvos,
    mindMarks:mindMarks
  };
};
setters.colsBlsMethods={  
  getUidByMindMark:function(mindMark,iv){
    var jMM=handle.jObj(mindMarks);
    var jmm=parseInt(jMM[mindMark],10);
    var mmSplit=mindMark.split('_');
    var shNm=mmSplit[0];
    var clNm=mmSplit[1];
    var mUL=mmSplit[2];
    var iSh=setters.getAncestor(shBl,'sprSht').shtsNames.split(',').indexOf(shNm);   // !!!! shBl is not defined HERE   !!!!!!!!!!!!
    var iCl=shBl.shHeader.indexOf(clNm);
    var iMUL=mUls.indexOf(mUL);var uid;
    if(!iv){
      uid=shBl.uid+'_colsBls0_'+'colBl'+iCl+'_mULs0_mUL'+iMUL;
    }else if(Array.isArray(iv)){
      uid=shBl.uid+'_colsBls0_'+'colBl'+iCl+'_mULs0_mUL'+iMUL+'mUps0';
    }else{
      var iiv=function(tstV,iv){
        var iiV=0;
        for(var iV in tstV){
          if(iV==iv){
            return iiV;
          }
          iiV++;
        }
      }(tst.v,iv);
      uid=shBl.uid+'_colsBls0_'+'colBl'+iCl+'_mULs0_mUL'+iMUL+'_mUps0_mUp'+iiv;
    }
    
    return uid;
  },
  /**
  * Returns array of uids indices matched to selection criteria
  * алгоритм отбора из массивов uids and bids:
  * selection condition for mUp-blocks of specified column(column with colName of icl index):
  *
  * for mUps block -
  *  (new RegExp("colBl"+icl).test(uid)) && ( /mUps0/.test(uid) ) && !(/mUp\d+/.test(uid)) 
  * 
  * for mUp blocks for column with colName of icl index and all possible mULs -
  *  (/mUp\d+/.test( uid)) && (new RegExp("colBl"+icl).test(uid))
  *   
  * for specified mUL -
  *   (/mUp\d+/.test( uid)) && (new RegExp("colBl"+icl+'_mULs0_mUL'+mULs.indexOf(mUL) ).test(uid))
  *    
  * if columns or mULs or mUps are not indicated all ones are implied
  * @param {Object}shBl st sheet block object
  * @param {Array String[]}uids - array of uids of all set
  * @param {Array String[]}bids - array of bids of all set
  * @param {Object}criteria selection criteria object
  *                     { columns:[],
  *                       mULs:[],
  *                       mUps:[]
  *                     }
  * @return {Object} object of selected arrays as properties
  *                        { uids:[],bids[] }                           
  */
  getUidsByCriteria:function(shBl,uids,bids,criteria){
	var shMUpS=setters.getMarkUps(shBl);
    var js=handle.jObj(shHeader);
    var selection={uids:[],bids:[]};
    var colNames=criteria.columns;
    var markULs=criteria.mULs;
    var markUps=criteria.mUps; 
	var pttClNm,pttMUL,pttMup,pttMUp,imm,mindMark,mind,allCols,allMULs,allMUps,
	  icl,mup,iml;
	/**
	* returns RegExp pattern pttMUp
	* @param {}
	* @return {Object RegExp} regular expression pattern
	* request - getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
	*/
	var getPttMUp=function(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps){
	  var vs=function(mind){
        var ivs=[];
        for(var iv in mind.v){
          ivs.push(iv);
        }
        return ivs;
      };	
	  if( markUps[mup]=='mUps0'){
        return /mUps0$/;
      }else{
        mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
        mind=shMUpS[mindMark];
        imp=vs(mind).indexOf(markUps[mup]);
        return RegExp('mUp'+imp);
      }
	};
    if( (colNames===undefined) || (Array.isArray(colNames)===false) || (colNames.length<1)){
      allCols=true;
    }
    if( (markULs===undefined) || (Array.isArray(markULs)===false) || (markULs.length<1) ){
      allMULs=true;
    }
    if( (markUps===undefined) || (Array.isArray(markUps)===false) || (markUps.length<1)){
      allMUps=true;
    }
    for(var iu=0;iu<uids.length;iu++){
      if(!allCols){
        for(var icn=0;icn<colNames.length;icn++){
          icl=parseInt(js[colNames[icn]],10);
          pttClNm=new RegExp('colBl'+icl);
          if(!allMULs){
            for(iml=0;iml<markULs.length;iml++){
              if( markULs[iml]=='mULs0'){
                pttMUL=/mULs0$/;
              }else{
                imm=mULs.indexOf(markULs[iml]);
                pttMUL=new RegExp('mUL'+imm);
              }
              if(!allMUps){
                for( mup=0;mup<markUps.length;mup++){
                  pttMUp=getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
                  // arrays selection
                  if( pttClNm.test(uids[iu])){
                    if( pttMUL.test(uids[iu])){
                      if(pttMUp.test(uids[iu])){
                        selection.uids.push(uids[iu]);
                        selection.bids.push(bids[iu]);
                      }
                    }
                  }
                }
              }else{
                // all mUps
                if( pttClNm.test(uids[iu])){
                  if( pttMUL.test(uids[iu])){
                    selection.uids.push(uids[iu]);
                    selection.bids.push(bids[iu]);
                  }
                }
              }
            }
          }else{
            // all mULs              
            if(!allMUps){
              // but not all mUps
              for( mup=0;mup<markUps.length;mup++){
                pttMUp=getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
                // arrays selection
                if( pttClNm.test(uids[iu])){
                  if(pttMUp.test(uids[iu])){
                    selection.uids.push(uids[iu]);
                    selection.bids.push(bids[iu]);
                  }
                }
              }
            }else{
              // all mUps
              if( pttClNm.test(uids[iu])){
                selection.uids.push(uids[iu]);
                selection.bids.push(bids[iu]);
              }
            }            
          }
        }
      }else{
        //all columns          
        if(!allMULs){
          // but not all mULs
          for(var iml1=0;iml1<markULs.length;iml1++){
            if( markULs[iml1]=='mULs0'){
              pttMUL=/mULs0$/;
            }else{                
              imm=mULs.indexOf(markULs[iml1]);
              pttMUL=new RegExp('mUL'+imm);                
            }
            if(!allMUps){
              // not all mULs and not all mUPs
              for( mup=0;mup<markUps.length;mup++){
                pttMUp=getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
                // arrays selection                  
                if( pttMUL.test(uids[iu])){
                  if(pttMUp.test(uids[iu])){
                    selection.uids.push(uids[iu]);
                    selection.bids.push(bids[iu]);
                  }
                }                  
              }
            }else{
              // all mUps, all columns
              if( pttMUL.test(uids[iu])){
                selection.uids.push(uids[iu]);
                selection.bids.push(bids[iu]);
              }              
            }
          }
        }else{
          // all mULs and all columns           
          if(!allMUps){
            // but not all mUps
            for( mup=0;mup<markUps.length;mup++){
              pttMUp=getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
              // arrays selection                
              if(pttMUp.test(uids[iu])){
                selection.uids.push(uids[iu]);
                selection.bids.push(bids[iu]);
              }
            }
          }else{
            // all mUps, all columns, all mULs        
            selection.uids.push(uids[iu]);
            selection.bids.push(bids[iu]);              
          }
        }      
      }
    }
    return selection;
  },
  /** 
  * The same as getUidsByCriteria
  */
  getUidsByConds:function(shBl,uids,bids,criteria){
	var shMUpS=setters.getMarkUps(shBl);
    var js=handle.jObj(shHeader);
    var selection={
      uids:[],
      bids:[],
      check:function(uid,bid,pt1,pt2,pt3){
        var mode;
        if(pt1){
          if(pt2){
            if(pt3){
              mode='123';
            }else{
              mode='12';
            }
          }else{
            mode='1';
          }
        }else{
          if(pt2){
            if(pt3){
              mode='23';
            }else{
              mode='2';
            }
          }else{
            if(pt3){
              mode='3';
            }else{
              mode='0';
            }              
          }
        }
        switch (mode){
          case '123':
            if( pt1.test(uid)){
              if( pt2.test(uid)){
                if(pt3.test(uid)){
                  selection.uids.push(uid);
                  selection.bids.push(bid);
                }
              }
            }
            break;
          case '12':
            if( pt1.test(uid)){
              if( pt2.test(uid)){               
                selection.uids.push(uid);
                selection.bids.push(bid);
              }
            }
            break;
          case '23':
            if( pt2.test(uid)){
              if(pt3.test(uid)){
                selection.uids.push(uid);
                selection.bids.push(bid);
              }
            }
            break;
          case '1':
            if( pt1.test(uid)){
              selection.uids.push(uid);
              selection.bids.push(bid);
            }
            break;
          case '2':              
            if( pt2.test(uid)){
              selection.uids.push(uid);
              selection.bids.push(bid);
            }
            break;
          case '3':
            if(pt3.test(uid)){
              selection.uids.push(uid);
              selection.bids.push(bid);
            }
            break;
          case '0':
            selection.uids.push(uid);
            selection.bids.push(bid);
            break;
        }
        return selection;
      }
    };
    var colNames=criteria.columns;
    var markULs=criteria.mULs;
    var markUps=criteria.mUps;
	var pttClNm,pttMUL,pttMup,pttMUp,imm,mindMark,mind,allCols,allMULs,allMUps,
	icl,mup,iml,imp;
	
	/**
	* returns RegExp pattern pttMUp
	* @param {}
	* @return {Object RegExp} regular expression pattern
	* request - getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
	*/
	var getPttMUp=function(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps){
	  var vs=function(mind){
        var ivs=[];
        for(var iv in mind.v){
          ivs.push(iv);
        }
        return ivs;
      };	
	  if( markUps[mup]=='mUps0'){
        return /mUps0$/;
      }else{
        mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
        mind=shMUpS[mindMark];
        imp=vs(mind).indexOf(markUps[mup]);
        return RegExp('mUp'+imp);
      }
	};
	if( (colNames===undefined) || (Array.isArray(colNames)===false) || (colNames.length<1)){
      allCols=true;
    }
    if( (markULs===undefined) || (Array.isArray(markULs)===false) || (markULs.length<1) ){
      allMULs=true;
    }
    if( (markUps===undefined) || (Array.isArray(markUps)===false) || (markUps.length<1)){
      allMUps=true;
    }	
    for(var iu=0;iu<uids.length;iu++){
      if(!allCols){
        for(var icn=0;icn<colNames.length;icn++){
          icl=parseInt(js[colNames[icn]],10);
          pttClNm=new RegExp('colBl'+icl);
          if(!allMULs){
            for( iml=0;iml<markULs.length;iml++){
              if( markULs[iml]=='mULs0'){
                pttMUL=/mULs0$/;
              }else{
                imm=mULs.indexOf(markULs[iml]);
                pttMUL=new RegExp('mUL'+imm);
              }
              if(!allMUps){
                for( mup=0;mup<markUps.length;mup++){
                  pttMUp=getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
                  // arrays selection
                  selection=selection.check(uids[iu],bids[iu],pttClNm,pttMUL,pttMUp);
                }
              }else{
                // all mUps
                selection=selection.check(uids[iu],bids[iu],pttClNm,pttMUL,undefined);                  
              }
            }
          }else{
            // all mULs              
            if(!allMUps){
              // but not all mUps
              for( mup=0;mup<markUps.length;mup++){
                pttMUp=getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
                // arrays selection
                selection=selection.check(uids[iu],bids[iu],pttClNm,undefined,pttMUp);
              }
            }else{
              // all mUps
              selection=selection.check(uids[iu],bids[iu],pttClNm,undefined,undefined);
            }            
          }
        }
      }else{
        //all columns          
        if(!allMULs){
          // but not all mULs
          for( iml=0;iml<markULs.length;iml++){
            if( markULs[iml]=='mULs0'){
              pttMUL=/mULs0$/;
            }else{
              imm=mULs.indexOf(markULs[iml]);
              pttMUL=new RegExp('mUL'+imm);
            }
            if(!allMUps){
              // not all mULs and not all mUPs
              for( mup=0;mup<markUps.length;mup++){
                pttMUp=getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
                // arrays selection                  
                selection=selection.check(uids[iu],bids[iu],undefined,pttMUL,pttMUp);                  
              }
            }else{
              // all mUps, all columns
              selection=selection.check(uids[iu],bids[iu],undefined,pttMUL,undefined);              
            }
          }
        }else{
          // all mULs and all columns           
          if(!allMUps){
            // but not all mUps
            for( mup=0;mup<markUps.length;mup++){
              pttMUp=getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
              // arrays selection                
              selection=selection.check(uids[iu],bids[iu],undefined,undefined,pttMUp);
            }
          }else{
            // all mUps, all columns, all mULs        
            selection=selection.check(uids[iu],bids[iu]);
          }
        }      
      }
    }
    return selection;
  },
  /**
  * Returns array of uids indices matched to selection criteria
  * алгоритм отбора из массивов uids and bids:
  * selection condition for mUp-blocks of specified column(column with colName of icl index):
  *
  * for mUps block -
  *  (new RegExp("colBl"+icl).test(uid)) && ( /mUps0/.test(uid) ) && !(/mUp\d+/.test(uid)) 
  * 
  * for mUp blocks for column with colName of icl index and all possible mULs -
  *  (/mUp\d+/.test( uid)) && (new RegExp("colBl"+icl).test(uid))
  *   
  * for specified mUL -
  *   (/mUp\d+/.test( uid)) && (new RegExp("colBl"+icl+'_mULs0_mUL'+mULs.indexOf(mUL) ).test(uid))
  *    
  * if columns or mULs or mUps are not indicated all ones are implied
  * @param {Object}shBl st sheet block object
  * @param {Array String[]}uids - array of uids of all set
  * @param {Array String[]}bids - array of bids of all set
  * @param {Object}criteria selection criteria object
  *                     { columns:[],
  *                       mULs:[],
  *                       mUps:[]
  *                     }
  * @return {Object} object of selected arrays as properties
  *                        { uids:[],bids[] }                           
  */
  getUidsByCriteriaClone:function(shBl,uids,bids,criteria){
	var shMUpS=setters.getMarkUps(shBl);
    var js=handle.jObj(shHeader);
    var selection={uids:[],bids:[]};
    var colNames=criteria.columns;
    var markULs=criteria.mULs;
    var markUps=criteria.mUps; 
	var pttClNm,pttMUL,pttMup,pttMUp,imm,mindMark,mind,allCols,allMULs,allMUps,
	  icl,mup,iml;
	var vs=function(mind){
      var ivs=[];
      for(var iv in mind.v){
        ivs.push(iv);
      }
      return ivs;
    };
    if( (colNames===undefined) || (Array.isArray(colNames)===false) || (colNames.length<1)){
      allCols=true;
    }
    if( (markULs===undefined) || (Array.isArray(markULs)===false) || (markULs.length<1) ){
      allMULs=true;
    }
    if( (markUps===undefined) || (Array.isArray(markUps)===false) || (markUps.length<1)){
      allMUps=true;
    }
    for(var iu=0;iu<uids.length;iu++){
      if(!allCols){
        for(var icn=0;icn<colNames.length;icn++){
          icl=parseInt(js[colNames[icn]],10);
          pttClNm=new RegExp('colBl'+icl);
          if(!allMULs){
            for(iml=0;iml<markULs.length;iml++){
              if( markULs[iml]=='mULs0'){
                pttMUL=/mULs0$/;
              }else{
                imm=mULs.indexOf(markULs[iml]);
                pttMUL=new RegExp('mUL'+imm);
              }
              if(!allMUps){
                for( mup=0;mup<markUps.length;mup++){
                  if( markUps[mup]=='mUps0'){
                    pttMup=/mUps0$/;
                  }else{
                    mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
                    mind=shMUpS[mindMark];
                    var imp=vs(mind).indexOf(markUps[mup]);
                    pttMUp=new RegExp('mUp'+imp);
                  }
                  // arrays selection
                  
                  if( pttClNm.test(uids[iu])){
                    if( pttMUL.test(uids[iu])){
                      if(pttMUp.test(uids[iu])){
                        selection.uids.push(uids[iu]);
                        selection.bids.push(bids[iu]);
                      }
                    }
                  }
                }
              }else{
                // all mUps
                if( pttClNm.test(uids[iu])){
                  if( pttMUL.test(uids[iu])){
                    selection.uids.push(uids[iu]);
                    selection.bids.push(bids[iu]);
                  }
                }
              }
            }
          }else{
            // all mULs              
            if(!allMUps){
              // but not all mUps
              for( mup=0;mup<markUps.length;mup++){
                if( markUps[mup]=='mUps0'){
                  pttMup=/mUps0$/;
                }else{
                  mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
                  mind=shMUpS[mindMark];
                  var imp1=vs(mind).indexOf(markUps[mup]);
                  pttMUp=new RegExp('mUp'+imp1);
                }
                // arrays selection
                if( pttClNm.test(uids[iu])){
                  if(pttMUp.test(uids[iu])){
                    selection.uids.push(uids[iu]);
                    selection.bids.push(bids[iu]);
                  }
                }
              }
            }else{
              // all mUps
              if( pttClNm.test(uids[iu])){
                selection.uids.push(uids[iu]);
                selection.bids.push(bids[iu]);
              }
            }            
          }
        }
      }else{
        //all columns          
        if(!allMULs){
          // but not all mULs
          for(var iml1=0;iml1<markULs.length;iml1++){
            if( markULs[iml1]=='mULs0'){
              pttMUL=/mULs0$/;
            }else{                
              imm=mULs.indexOf(markULs[iml1]);
              pttMUL=new RegExp('mUL'+imm);                
            }
            if(!allMUps){
              // not all mULs and not all mUPs
              for( mup=0;mup<markUps.length;mup++){
                if( markUps[mup]=='mUps0'){
                  pttMup=/mUps0$/;
                }else{
                  mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
                  mind=shMUpS[mindMark];
                  var imp2=vs.indexOf(markUps[mup]);
                  pttMUp=new RegExp('mUp'+imp2);
                }
                // arrays selection                  
                if( pttMUL.test(uids[iu])){
                  if(pttMUp.test(uids[iu])){
                    selection.uids.push(uids[iu]);
                    selection.bids.push(bids[iu]);
                  }
                }                  
              }
            }else{
              // all mUps, all columns
              if( pttMUL.test(uids[iu])){
                selection.uids.push(uids[iu]);
                selection.bids.push(bids[iu]);
              }              
            }
          }
        }else{
          // all mULs and all columns           
          if(!allMUps){
            // but not all mUps
            for( mup=0;mup<markUps.length;mup++){
              if( markUps[mup]=='mUps0'){
                pttMup=/mUps0$/;
              }else{
                mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
                mind=shMUpS[mindMark];
                var imp3=vs(mind).indexOf(markUps[mup]);
                pttMUp=new RegExp('mUp'+imp3);
              }
              // arrays selection                
              if(pttMUp.test(uids[iu])){
                selection.uids.push(uids[iu]);
                selection.bids.push(bids[iu]);
              }
            }
          }else{
            // all mUps, all columns, all mULs        
            selection.uids.push(uids[iu]);
            selection.bids.push(bids[iu]);              
          }
        }      
      }
    }
    return selection;
  },
  /** 
  * The same as getUidsByCriteria
  */
  getUidsByCondsClone:function(shBl,uids,bids,criteria){
	var shMUpS=setters.getMarkUps(shBl);
    var js=handle.jObj(shHeader);
    var selection={
      uids:[],
      bids:[],
      check:function(uid,bid,pt1,pt2,pt3){
        var mode;
        if(pt1){
          if(pt2){
            if(pt3){
              mode='123';
            }else{
              mode='12';
            }
          }else{
            mode='1';
          }
        }else{
          if(pt2){
            if(pt3){
              mode='23';
            }else{
              mode='2';
            }
          }else{
            if(pt3){
              mode='3';
            }else{
              mode='0';
            }              
          }
        }
        switch (mode){
          case '123':
            if( pt1.test(uid)){
              if( pt2.test(uid)){
                if(pt3.test(uid)){
                  selection.uids.push(uid);
                  selection.bids.push(bid);
                }
              }
            }
            break;
          case '12':
            if( pt1.test(uid)){
              if( pt2.test(uid)){               
                selection.uids.push(uid);
                selection.bids.push(bid);
              }
            }
            break;
          case '23':
            if( pt2.test(uid)){
              if(pt3.test(uid)){
                selection.uids.push(uid);
                selection.bids.push(bid);
              }
            }
            break;
          case '1':
            if( pt1.test(uid)){
              selection.uids.push(uid);
              selection.bids.push(bid);
            }
            break;
          case '2':              
            if( pt2.test(uid)){
              selection.uids.push(uid);
              selection.bids.push(bid);
            }
            break;
          case '3':
            if(pt3.test(uid)){
              selection.uids.push(uid);
              selection.bids.push(bid);
            }
            break;
          case '0':
            selection.uids.push(uid);
            selection.bids.push(bid);
            break;
        }
        return selection;
      }
    };
    var colNames=criteria.columns;
    var markULs=criteria.mULs;
    var markUps=criteria.mUps;
	var pttClNm,pttMUL,pttMup,pttMUp,imm,mindMark,mind,allCols,allMULs,allMUps,
	icl,mup,iml,imp;
	
	/**
	* returns RegExp pattern pttMUp
	* @param {}
	* @return {Object RegExp} regular expression pattern
	* request - getPttMUp(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps);
	*/
	var getPttMUp=function(markUps,mup,shBl,shHeader,icl,mULs,imm,shMUps){
	  var vs=function(mind){
        var ivs=[];
        for(var iv in mind.v){
          ivs.push(iv);
        }
        return ivs;
      };	
	  if( markUps[mup]=='mUps0'){
        return /mUps0$/;
      }else{
        mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
        mind=shMUpS[mindMark];
        imp=vs(mind).indexOf(markUps[mup]);
        return RegExp('mUp'+imp);
      }
	};
	if( (colNames===undefined) || (Array.isArray(colNames)===false) || (colNames.length<1)){
      allCols=true;
    }
    if( (markULs===undefined) || (Array.isArray(markULs)===false) || (markULs.length<1) ){
      allMULs=true;
    }
    if( (markUps===undefined) || (Array.isArray(markUps)===false) || (markUps.length<1)){
      allMUps=true;
    }	
    for(var iu=0;iu<uids.length;iu++){
      if(!allCols){
        for(var icn=0;icn<colNames.length;icn++){
          icl=parseInt(js[colNames[icn]],10);
          pttClNm=new RegExp('colBl'+icl);
          if(!allMULs){
            for( iml=0;iml<markULs.length;iml++){
              if( markULs[iml]=='mULs0'){
                pttMUL=/mULs0$/;
              }else{
                imm=mULs.indexOf(markULs[iml]);
                pttMUL=new RegExp('mUL'+imm);
              }
              if(!allMUps){
                for( mup=0;mup<markUps.length;mup++){
                  if( markUps[mup]=='mUps0'){
                    pttMup=/mUps0$/;
                  }else{
                    mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
                    mind=shMUpS[mindMark];                    
                    imp=vs(mind).indexOf(markUps[mup]);
                    pttMUp=new RegExp('mUp'+imp);
                  }
                  // arrays selection
                  selection=selection.check(uids[iu],bids[iu],pttClNm,pttMUL,pttMUp);
                }
              }else{
                // all mUps
                selection=selection.check(uids[iu],bids[iu],pttClNm,pttMUL,undefined);                  
              }
            }
          }else{
            // all mULs              
            if(!allMUps){
              // but not all mUps
              for( mup=0;mup<markUps.length;mup++){
                if( markUps[mup]=='mUps0'){
                  pttMup=/mUps0$/;
                }else{
                  mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
                  mind=shMUpS[mindMark];
                  imp=vs(mind).indexOf(markUps[mup]);
                  pttMUp=new RegExp('mUp'+imp);
                }
                // arrays selection
                selection=selection.check(uids[iu],bids[iu],pttClNm,undefined,pttMUp);
              }
            }else{
              // all mUps
              selection=selection.check(uids[iu],bids[iu],pttClNm,undefined,undefined);
            }            
          }
        }
      }else{
        //all columns          
        if(!allMULs){
          // but not all mULs
          for( iml=0;iml<markULs.length;iml++){
            if( markULs[iml]=='mULs0'){
              pttMUL=/mULs0$/;
            }else{
              imm=mULs.indexOf(markULs[iml]);
              pttMUL=new RegExp('mUL'+imm);
            }
            if(!allMUps){
              // not all mULs and not all mUPs
              for( mup=0;mup<markUps.length;mup++){
                if( markUps[mup]=='mUps0'){
                  pttMup=/mUps0$/;
                }else{
                  mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
                  mind=shMUpS[mindMark];
                  imp=vs(mind).indexOf(markUps[mup]);
                  pttMUp=new RegExp('mUp'+imp);
                }
                // arrays selection                  
                selection=selection.check(uids[iu],bids[iu],undefined,pttMUL,pttMUp);                  
              }
            }else{
              // all mUps, all columns
              selection=selection.check(uids[iu],bids[iu],undefined,pttMUL,undefined);              
            }
          }
        }else{
          // all mULs and all columns           
          if(!allMUps){
            // but not all mUps
            for( mup=0;mup<markUps.length;mup++){
              if( markUps[mup]=='mUps0'){
                pttMup=/mUps0$/;
              }else{
                mindMark=shBl.shName+'_'+shHeader[icl]+'_'+mULs[imm];
                mind=shMUpS[mindMark];
                imp=vs(mind).indexOf(markUps[mup]);
                pttMUp=new RegExp('mUp'+imp);
              }
              // arrays selection                
              selection=selection.check(uids[iu],bids[iu],undefined,undefined,pttMUp);
            }
          }else{
            // all mUps, all columns, all mULs        
            selection=selection.check(uids[iu],bids[iu]);
          }
        }      
      }
    }
    return selection;
  }
};
/**
* assembles murkUp data for all columns of the current sheet
* forms  markUps-columns block rows for setters sheett.data lines 
* and combines them with columns block lines
* @param {Object}shBl - st-object of sheet analyzing
* @param {Array [][]} 2d- array with data rows for columns and columns-markUps data for sheet
*/  
setters.getMarkUpsLinesFor=function(shBl){
  var shMUpS=setters.getMarkUps(shBl);
  var colsBlsO=setters.getColumnsBlocks(shBl);
  var stvos=colsBlsO.stvos;
  var columnsLines=colsBlsO.columnsLines;
  var uids=colsBlsO.uids;
  var bids=colsBlsO.bids;
  var shHeader=shMUpS.shHeader;
  var mULs=shMUpS.mULs;
  var t=setters.getAncestor(shBl,'sprSht').t;
  
  // MarkUpsIndices Block
  var mUpsLines=[];
  // header block line
  var row=[];
  for(var ic=0;ic<t.header.length;ic++){
    if(ic==parseInt(t.js.shSetters,10)){
      row.push('markUpsLines');
    }
    row.push('');
  }
  // mUps0 blocks row
  // this mUps blocks are appropriate to each colName and mULs
  // They all are located in the same row
  var criteria={mUps:['mUps0']};
  var selection=colsBlsO.getUidsByConds(shBl,uids,bids,criteria);
  var uidsSelect=selection.uids;
  var bidsSelect=selection.bids;
  row[ parseInt(t.js.uid,10) ]=uidsSelect.toString();
  
  mUpsLines.push(row);
 
  for(var icl=0;icl<shHeader.length;icl++){
    for(var il=0;il<mULs.length;il++){
      var mindMark=shMUpS.shName+'_'+shHeader[icl]+'_'+mULs[il];
      var mUL=mULs[il];
      var tst=shMUpS[mindMark];
      var mind=tst.mind;
      var vs=mind.v;
      var ns=mind.n;
      for(var iv in vs){
        var uid=colsBlsO.getUidByMindMark(mindMark,iv);
        var rrow=[];
        for(var ic1 in t.header){
          rrow.push('');
        }
        rrow[parseInt(t.js.ind,10)]=icl+'';
        rrow[parseInt(t.js.colName,10)]=shHeader[icl];
        rrow[parseInt(t.js.stValue,10)]=stvos[uid].stvo[iv].n;             // '{"'+mUL+'":{"'+iv+'":{"n":'+mind.getNs()[iv]+',"iRows":"'+mind.r[iv].toString()+'"}}}';
        rrow[parseInt(t.js.stValueO,10)]=JSON.stringify(stvos[uid].stvo);  //'{"'+mUL+'":{"'+iv+'":{"n":'+mind.getNs()[iv]+',"iRows":"'+mind.r[iv].toString()+'"}}}';
        rrow[parseInt(t.js[mULs[il]],10)]=mind.v[iv];
        rrow[parseInt(t.js.shSetters,10)]=mUL+'_'+iv;
        rrow[parseInt(t.js.uid,10)]=uid;
        mUpsLines.push(rrow);
      }
    }
  }
  var nMUpLines=mUpsLines.length;
  mUpsLines[0][parsInt(t.js.stValue,10)]=nMUpLines;
  //return mUpsLines;
  return columnsLines.concat(mUpsLines);  
};
/**
* quazi-manual setting of st-objects prototypes
*   ------------ PROTOS ---------------
*/
setters.basicNames.protos={};
var protos=setters.basicNames.protos;
// -- colsBls --
protos.colsBls={
  index:'',
  bName:'columnsBlocksObj',
  bid:'colsBls',
  bProps:{
    colsNames:{
      bName:'columnsNamesArray',parent:'colsBls',type:'[]',
      iniColName:'ind',stLabel:'',crv:{cN:'ind',nR:0},
      legend:'Array of columns names',mBTP:'colsBls_colsNames'},      
    colsObjs:{
      bName:'spreadsheetAppColumnsRanges',parent:'colsBls',type:'',
      iniColName:'',stLabel:'',crv:'',nR:'',
      legend:"sheet's columns' Range objectsWhole Column Range object of spreadsheetApp",mBTP:'colsBls_colsObjs'},      
    shMUpS:{
      bName:'',parent:'colsBls',type:'{}',
      iniColName:'',stLabel:'',crv:'',nR:'',
      legend:"sheet's markUp Sets combined object. markUps data for all columns of curent sheet",mBTP:'colsBls_shMUpS'},
    uid:{
      bName:'blockUid',parent:'colsBls',type:'{}',
      iniColName:'uid',stLabel:'',crv:{cN:'uid',nR:0,ptc:{uid:'uid'}},nR:'',
      legend:'block uid',mBTP:'colsBls_uid'}      
  },
  type:'{}',
  parent:'shBl',
  bType:'colsBls',
  iniColName:'shSetters',
  stLabel:'columns:',
  crv:{cN:'shSetters',
       nR:1,
       value:'columns:'
      },         
  nR:1,
  legend:'Columns Block. Common columns data',
  endMarkColNm:'',
  endMarkStLabel:'',
  mBTP:'colsBls'    
};
// -- colBl --
protos.colBl={
  index:'',
  bName:'columnBlockObj',
  bid:'colBl',
  bProps:{
    ind:{
      bName:'columnIndex',parent:'colBl',
      iniColName:'ind',stLabel:'',crv:{cN:'ind',nR:0,ptc:{ind:"ind"}},
      legend:"Column's index",mBTP:'colBl_ind'},
    colName:{
      bName:'columnName',parent:'colBl',
      iniColName:'colName',stLabel:'',crv:{cN:'colName',nR:0,ptc:{colName:"colName"}},
      legend:'Column name',mBTP:'colBl_colName'},
    firstDate:{
      bName:'columnfirstDate',parent:'colBl',
      iniColName:'firstDate',stLabel:'',crv:{cN:'firstDate',nR:0},
      legend:'Date of column data creation',mBTP:'colBl_firstDate'},
    lastDate:{
      bName:'columnlastDate',parent:'colBl',
      iniColName:'lastDate',stLabel:'',crv:{cN:'lastDate',nR:0},
      legend:'Date of column data creation',mBTP:'colBl_lastDate'},
    who:{
      bName:'whoInitiatsPropData',parent:'colBl',type:'EMAIL',
      iniColName:'who',stLabel:'',crv:{cN:'who',nR:0},
      legend:'Who got the column data',mBTP:'colBl_who'},
    bgColors:{
      bName:'backGroundColorsOfColumnCells',parent:'colBl',type:'crvString',
      iniColName:'bgColor',stLabel:'',crv:{cN:'bgColor',nR:0},
      legend:'all backgrounds of cells encounting for actual column',mBTP:'colBl_bgColors'},
    fontWeights:{
      bName:'fontWeightsOfColumnCells',parent:'colBl',type:'crvString',
      iniColName:'fontWeight',stLabel:'',crv:{cN:'fontWeight',nR:0},nR:0,legend:'',mBTP:'colsBls_fontWeights'},
    fontColors:{
      bName:'fontColorsOfColumnCells',parent:'colBl',type:'crvString',
      iniColName:'fontColor',stLabel:'',crv:{cN:'fontColor',nR:0},nR:0,legend:'',mBTP:'colsBls_fontColors'},      
    fontLines:{
      bName:'fontLinesOfColumnCells',parent:'colBl',type:'crvString',
      iniColName:'fontLine',stLabel:'',crv:{cN:'fontLine',nR:0},nR:0,legend:'',mBTP:'colsBls_fontLines'},
    fontStyles:{
      bName:'fontStylesOfColumnCells',parent:'colBl',type:'crvString',
      iniColName:'fontStyle',stLabel:'',crv:{cN:'fontStyle',nR:0},nR:0,legend:'',mBTP:'colsBls_fontStyles'},
  },
  type:'',
  parent:'colsBls',
  bType:'colBl',
  iniColName:'shSetters',
  stLabel:'',
  crv:{cN:'shSetters',nR:1,shift:{type:'first',value:-1},dL:1},         
  nR:1,
  legend:"Column Block Object. Describes columns' names,indices and markUps charachteristics",
  endMarkColNm:'',
  endMarkStLabel:'',
  mBTP:'colBl'
};
// -- mULs --
protos.mULs={
  index:'',
  bName:'markUpsLabelsOfСolumns',
  bid:'mULs',
  bProps:'',
  type:'',
  parent:'colBl',
  bType:'mULs',
  iniColName:'shSetters',
  stLabel:'',
  crv:{cN:'shSetters',nR:1,value:'markUps:'},         
  nR:1,
  legend:'mark ups for Columns Block ',
  endMarkColNm:'',
  endMarkStLabel:'',
  mBTP:'mULs'
};
// -- mUL  --
protos.mUL={
  index:'',
  bName:'markUpsLabelOfСolumn',
  bid:'mUL',
  bProps:{
    ind:{
      bName:'columnIndex',parent:'mUL',
      iniColName:'ind',stLabel:'',crv:{cN:'ind',nR:0,ptc:{ind:"ind"}},
      legend:"Column's index",mBTP:'mUL_ind'},
    colName:{
      bName:'columnName',parent:'mUL',
      iniColName:'colName',stLabel:'',crv:{cN:'colName',nR:0,ptc:{colName:"colName"}},
      legend:'Column name',mBTP:'mUL_colName'},
    mindMark:{
      bName:'multiIndexMUpMark',parent:'mUL',
      iniColName:'',stLabel:'',crv:{cN:'',nR:0,ptc:{mindMark:'shSetters'}},
      legend:'mindMUp mark shName_colName_mUL of column',mBTP:'mUL_mindMark'},
    mUL:{
      bName:'markUpLabel',parent:'mUL',
      iniColName:'',stLabel:'',crv:{cN:'',nR:0,ptc:{}},
      legend:'mark up label',mBTP:'mUL_mUL'},
    nMUpRows:{
      bName:'numberOfRowsWithMarkUp',parent:'mUL',type:'Integer',
      iniColName:'',stLabel:'',crv:{cN:'bgColor',nR:0},
      legend:'number of rows with current murkUp',mBTP:'mUL_nMUpRows'},
    mUpRowsInds:{
      bName:'indicesOfRowsWhithCurrentMarkUp',parent:'mUL',type:'crvString',
      iniColName:'',stLabel:'',crv:{cN:'fontWeight',nR:0},nR:0,
      legend:'indices of rows whith actual markUps',mBTP:'mUL_mUpRowsInds'}
  },
  type:'',
  parent:'mULs',
  bType:'mUL',
  iniColName:'shSetters',
  stLabel:'',
  crv:{
    cN:'shSetters',
    nR:1,
    shift:{type:'first',value:-1},
    dL:1
  },         
  nR:1,
  legend:"block for column's mark up Label",
  endMarkColNm:'',
  endMarkStLabel:'',
  mBTP:'mUL'
};
// -- mUps --
protos.mUps={
  index:'',
  bName:'markUpsLabelsOfСolumns',
  bid:'mUps',
  bProps:'',
  type:'',
  parent:'mUL',
  bType:'mUps',
  iniColName:'shSetters',
  stLabel:'',
  crv:{cN:'shSetters',nR:1,value:'markUps:'},         
  nR:1,
  legend:'mark ups for Columns Block ',
  endMarkColNm:'',
  endMarkStLabel:'',
  mBTP:'mUps'
};
// -- mUp --
protos.mUp={
  index:'',
  bName:'columnMarkUpLabelObj',
  bid:'mUp',
  bProps:{
    ind:{
      bName:'columnIndex',parent:'mUp',
      iniColName:'ind',stLabel:'',crv:{cN:'ind',nR:0,ptc:{ind:"ind"}},
      legend:"Column's index",mBTP:'mUp_ind'},
    colName:{
      bName:'columnName',parent:'mUp',
      iniColName:'colName',stLabel:'',crv:{cN:'colName',nR:0,ptc:{colName:"colName"}},
      legend:'Column name',mBTP:'mUp_colName'},
    mindMark:{
      bName:'multiIndexMUpMark',parent:'mUp',
      iniColName:'',stLabel:'',crv:{cN:'',nR:0,ptc:{mindMark:'shSetters'}},
      legend:'mindMUp mark shName_colName_mUp of column',mBTP:'mUp_mindMark'},
    mUL:{
      bName:'markUpLabel',parent:'mUp',
      iniColName:'',stLabel:'',crv:{cN:'',nR:0,ptc:{}},
      legend:'mark up label',mBTP:'mUp_mUL'},
    nMUpRows:{
      bName:'numberOfRowsWithMarkUp',parent:'mUp',type:'Integer',
      iniColName:'',stLabel:'',crv:{cN:'bgColor',nR:0},
      legend:'number of rows with current murkUp',mBTP:'mUp_nMUpRows'},
    mUpRowsInds:{
      bName:'indicesOfRowsWhithCurrentMarkUp',parent:'mUp',type:'crvString',
      iniColName:'',stLabel:'',crv:{cN:'fontWeight',nR:0},nR:0,
      legend:'indices of rows whith actual markUps',mBTP:'mUp_mUpRowsInds'}
  },
  type:'',
  parent:'mUps',
  bType:'mUp',
  iniColName:'shSetters',
  stLabel:'',
  crv:{
    cN:'shSetters',
    nR:1,
    shift:{type:'first',value:-1},
    dL:1
  },         
  nR:1,
  legend:"block for column's mark up",
  endMarkColNm:'',
  endMarkStLabel:'',
  mBTP:'mUp'
};
/**
* modify actual basicNames.data by new blocks' object
* @param {Array [][]}bnD actual basicNames.data array
* @param {Object}bnAddO - object of sequence of pairs newBType:newBTypeData }
* @return {Array [][]} - updated data arrty
*/
setters.modifyBNData=function(bnD,bnAddO,bnSheetNameOpt){
  var basicNames=setters.basicNames;
  var jsBN=handle.jObj(bnD[0]);
  var lastRow=bnD.length;
  var ssTest=SpreadsheetApp.create('testBNRenew'+Utilities.formatDate(new Date(),'GMT+03:00','_ddMMYY_HHmmss'));
  var bnSSId=basicNames.ssId;
  var bnShNm=basicNames.bnSheetName;    
  
  var sAddBN1=SpreadsheetApp.openById(bnSSId).getSheetByName(bnShNm).copyTo(ssTest);
  var sAddBN=ssTest.insertSheet('renewedBasicNames',0);
  ssTest.deleteSheet(ssTest.getSheetByName('Sheet1'));
  
  for(var bt in bnAddO){
    var dPart=bnAddO[bt];
    bnD=bnD.concat(dPart);
    lastRow+=dPart.length;
  }
  basicNames=basicNames.refreshMe(bnD);
  bnD=basicNames.data;
  sAddBN.getRange(1,1,bnD.length,bnD[0].length).setValues(bnD);
  // formatting
  sAddBN.getRange("1:1").setBackground('#fff2cc').setFontWeight('bold').setHorizontalAlignment('center');
  var indexCol=parseInt(jsBN.index,10)+1;
  var legendCol=parseInt(jsBN.legend,10)+1;
  var lettIndex=sAddBN.getRange(1,indexCol).getA1Notation().replace(/\d+/,'');
  var lettLegend=sAddBN.getRange(1,legendCol).getA1Notation().replace(/\d+/,'');
  sAddBN.setColumnWidth(indexCol,30);
  sAddBN.setColumnWidth(legendCol,100);
  sAddBN.setFrozenRows(1);
  // --
  // -- session data
  sessionBN.sss=ssTest.insertSheet('sessionBNData');
  var sess=sessionBN.sss;
  var bnDS=sessionBN.bnd;
  sess.getRange(1,1,bnDS.length,bnDS[0].length).setValues(bnDS);
  // formatting
  sess.getRange("1:1").setBackground('#fff2cc').setFontWeight('bold').setHorizontalAlignment('center');
  /*var indexCol=parseInt(jsBN.index,10)+1;
  var legendCol=parseInt(jsBN.legend,10)+1;
  var lettIndex=sAddBN.getRange(1,indexCol).getA1Notation().replace(/\d+/,'');
  var lettLegend=sAddBN.getRange(1,legendCol).getA1Notation().replace(/\d+/,'');*/
  sess.setColumnWidth(indexCol,30);
  sess.setColumnWidth(legendCol,100);
  sess.setFrozenRows(1);
  //--
  return bnD;
};
/**
* forms basicNameData of newly created parts of basicNames.data
* and create a seet with this data for checking, etc.
* @param {Object}bnAddO - object with property { newBType:newBTypeData} for each new part
* @return {Array [][]} array of new parts basicNames.data
*/
setters.getNewPartsBNData=function(bnAddO,bnSheetNameOpt){
  var basicNames=setters.basicNames;
  var bnSheetName=bnSheetNameOpt||
    'namesOfStructure_'+
  Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'_ddMMYY_HHmmss');
  
  var s=SpreadsheetApp.openById(basicNames.ssId).insertSheet(bnSheetName,0);
  
  var bnHeader=basicNames.data[0];
  var jsBN=handle.jObj(bnHeader);
  var dPart=[bnHeader];
  
  var ssTest=SpreadsheetApp.create('testBNRenew'+new Date());
  var bnSSId=basicNames.ssId;
  var bnShNm=basicNames.bnSheetName;    
  
  var sAddBN1=SpreadsheetApp.openById(bnSSId).getSheetByName(bnShNm).copyTo(ssTest);
  var sAddBN=ssTest.insertSheet('renewedBasicNames',0);
  ssTest.deleteSheet(ssTest.getSheetByName('Sheet1'));
  for(var bt in bnAddO){
    dPart=dPart.concat(bnAddO[bt]);
  }
  
  sAddBN.getRange(1,1,dPart.length, dPart[0].length).setValues(dPart);
  // formatting
  var format=function(sAddBN){
    sAddBN.getRange("1:1").setBackground('#fff2cc').setFontWeight('bold').setHorizontalAlignment('center');
    var indexCol=parseInt(jsBN.index,10)+1;
    var legendCol=parseInt(jsBN.legend,10)+1;
    var lettIndex=sAddBN.getRange(1,indexCol).getA1Notation().replace(/\d+/,'');
    var lettLegend=sAddBN.getRange(1,legendCol).getA1Notation().replace(/\d+/,'');
    sAddBN.setColumnWidth(indexCol,30);
    sAddBN.setColumnWidth(legendCol,100);
    sAddBN.setFrozenRows(1);
  };
  format(sAddBN);
  s.getRange(1,1,dPart.length, dPart[0].length).setValues(dPart);
  format(s);
 
  return dPart;
};
/**
* gets manually set group bTypes from object setters.basicNames.protos
* and their properties and
* adds bType and bTProps parameters to bn.data array 
* or creates new bn.data array and sheet for the depending of mode parameter value. 
* @param {Boolean}modifyBN - Optional. Default is false. Set true if it's necessary to add 
*                           new part in basicNames.data
* @param {string}modeOpt - mode string. 'modify' - means to modify existing bn.data
*                                   'new' - create new bn.data and basicNames sheet
*                                   'none' - Default.only calculate parsArrays Object
* @param {string}bnSheetNameOpt - optional. Name of basicNamesStructure new sheet.
*                                if not set is equal to 'namesOfStructure_'+tMark
* @return {} - object with 2d-array parts for bn.data dedicated to each new blocks
*/
setters.basicNames.getBNDataFromProtos=function(protos,modeOpt,bnSheetNameOpt){ //parentBType,proptoTypeObj){
  var mode=modeOpt||'none';
  var modify=(mode=='modify')?true:false;
  var newBN=(mode=='new')?true:false;
  var basicNames=setters.basicNames;
  var bnD=basicNames.data;
  var jsBN=handle.jObj(bnD[0]);
  var mindBTP=basicNames.mindBTP;
  var bnHeader=setters.basicNames.data[0];
  var bnAddO={};  
  //var templates=setters.basicNames.templates;
  /**
  * Transforms proto's property values to bn.data form
  * @param {string}bnColName - column name value in basicNames.data
  * @param {String|Number|Object|Array}val - proprety's value
  * return{String|Array|Number} modified sheet cell value associated with property
  */
  var valFromProtoToBND=function(bnColName,val){
    if((typeof val !== 'object')|| (Array.isArray(val))){      
      return val;
    }else{
      return JSON.stringify(val);
    }
  };  
  //var protos=setters.basicNames.protos;
  var rowTempl=function(){var r=[];for(var j in bnD[0]){r.push('');}return r;};
  var jbn,val;
  for(var pr in protos){
    if(typeof protos[pr] !=='function'){
      var newblsRows=[];
      
      var prot=protos[pr];
      var row=rowTempl();
      // all but bProps
      for( jbn in jsBN){        
        if(jbn!='bProps'){
          if(setters.pNameCheck(jbn,prot,'has')===true){
            if(typeof prot[jbn] !=='function'){
              val=prot[jbn];
              row[parseInt(jsBN[jbn],10)]=valFromProtoToBND(jbn,val);        
            }
          }
        }
      }      
      newblsRows.push(row);
      // bProps
      var bPropsO=prot.bProps;
      if(bPropsO){
        for(var ip in bPropsO){
          if(typeof bPropsO[ip] !=='function'){
            var bps=bPropsO[ip];
            if(setters.pNameCheck('parent',bps,'has')===false){
              bps.parent=pr;
            }
            var rowBPs=rowTempl();
            for( jbn in jsBN){        
              if(jbn!='bProps'){
                if(setters.pNameCheck(jbn,bps)!==jbn){
                  val=bps[jbn];
                  rowBPs[parseInt(jsBN[jbn],10)]=valFromProtoToBND(jbn,val);
                }
              }else{
                if(jbn=='bProps'){ 
                  rowBPs[parseInt(jsBN[jbn],10)]=ip;
                }
              }
            }
            newblsRows.push(rowBPs);
          }
        }
      }
      bnAddO[pr]=newblsRows;
    }
  }
  // adding new bTypes to basicNames
  if(modify){
    bnD=setters.modifyBNData(bnD,bnAddO);
  }
  if(newBN){
   setters.getNewPartsBNData(bnAddO);    
  }
  return bnAddO;
};
/**
* forms bn.data array combining parts associated with blocks' templates
* objecs of bType-group blocks theit properties and bProps-obj
* and  adds bType and bTProps parameters to bn.data array 
* or creates new bn.data array and sheet in dependance of mode parameter value. 
* @param {Object}templates object of templates as properties with keys bTypeT
*                 { bType0T:temlObjBT0,bType1T:templObjBT1,..). Each teplObj
*              has .bid=bTypeiT .uid='setters_basicNames_template_bTypeiT
* @param {string}modeOpt - mode string. 'modify' - means to modify existing bn.data
*                                   'new' - create new bn.data and basicNames sheet
*                                   'none' - Default.only calculate parsArrays Object
* @param {string}bnSheetNameOpt - optional. Name of basicNamesStructure new sheet.
*                                if not set is equal to 'namesOfStructure_'+tMark
* @return {} - object with 2d-array parts for bn.data dedicated to each new blocks
*/
setters.basicNames.getBNDataFromTemplates=function(templates,modeOpt,bnSheetNameOpt){ //parentBType,proptoTypeObj){
  var mode=modeOpt||'none';
  var modify=(mode=='modify')?true:false;
  var newBN=(mode=='new')?true:false;
  var basicNames=setters.basicNames;
  var bnD=basicNames.data;
  var jsBN=handle.jObj(bnD[0]);
  var mindBTP=basicNames.mindBTP;
  var bnHeader=basicNames.data[0]; 
  var bnAddO={};  
  //var templates=setters.basicNames.templates;
  /**
  * Transforms template's property values to bn.data form
  * @param {string}bnColName - column name value in basicNames.data
  * @param {String|Number|Object|Array}val - proprety's value
  * return{String|Array|Number} modified sheet cell value associated to property
  */
  var valFromTemplateToBND=function(jbn,val){
    if((typeof val !== 'object')|| (Array.isArray(val))){            
      if(jbn=='bid'){
        //val=(/T$/.test(val))?val.replace(/T$/,''):val;
        val=val.charAt(0).toLowerCase()+val.slice(1).replace(/T$/,'');
      }else if(jbn=='bProps'){
        val=val.charAt(0).toLowerCase()+val.slice(1).replace(/T$/,'');
      }else if(jbn=='bName'){
        val=val.replace(/[Tt]emplate/,'');
      }else if(jbn=='bType'){
        val=(val=='bProp')?'':val;
        val=val.replace(/T$/,'');
      }else if(jbn=='parent'){
        val=val.replace(/T$/,'');
      }else if(jbn=='legend'){
        val=(val=='typical object')?'':val;
      }
      return val;
    }else{
      return JSON.stringify(val);
    }    
  };
  var rowTempl=function(){var r=[];for(var j in bnD[0]){r.push('');}return r;};
  var jbn,val;
  // from Template to new bn.data array. Bid of template object is terminatee by "T"  
  for(var pr in templates){
    if(/T$/.test(pr)){
      // only Template object are considered
      if(typeof templates[pr] !=='function'){        
        var newblsRows=[];        
        var templ=templates[pr];
        var row=rowTemp();
        // all but bProps
        for( jbn in jsBN){
          if(jbn!='bProps'){
            if(setters.pNameCheck(jbn,templ,'has')===true){
              val=templ[jbn];
              if(typeof val !=='function'){
                row[parseInt(jsBN[jbn],10)]=valFromTemplateToBND(jbn,val);
              }
            }
          }
        }
        newblsRows.push(row);
        // bProps
        var bPropsO=templ.bProps.bPropObjs;
        for(var ip in bPropsO){
          if(typeof bPropsO[ip] !=='function'){
            var bps=bPropsO[ip];            
              // only 'bProp' bType objects are included in bn.data
              var rowBPs=rowTempl();
              for( jbn in jsBN){
                if(jbn!='bProps'){
                  if(setters.pNameCheck(jbn,bps)!==jbn){
                    if(jbn!='bid'){
                      val=bps[jbn];
                      rowBPs[parseInt(jsBN[jbn],10)]=valFromTemplateToBND(jbn,val);
                    }
                  }
                }else{
                  if(jbn=='bProps'){
                    val=bps.bid;
                    rowBPs[parseInt(jsBN[jbn],10)]=valFromTemplateToBND(jbn,val);
                  }
                }
              }
              newblsRows.push(rowBPs);
          }
        }
        var prCorrect=pr.charAt(0).toLowerCase()+pr.slice(1).replace(/T$/,'');
        bnAddO[prCorrect]=newblsRows;
      }
    }
  }
  // adding new bTypes to basicNames
  if(modify){
    bnD=setters.modifyBNData(bnD,bnAddO);
  }
  if(newBN){
    setters.getNewPartsBNData(bnAddO);
  }
  return bnAddO;
};
/**  Need to be corrected!!!!!!! Not works adequately yet!!!!!!!
* forms bn.data array combining parts associated with blocks' got from templates or protos
* objecs of bType-group blocks theit properties and bProps-obj
* and  adds bType and bTProps parameters to bn.data array 
* or creates new bn.data array and sheet in dependance of mode parameter value. 
* @param {Object}sources object of templates or protos as properties with keys bTypeT
*                 { bType0T:temlObjBT0,bType1T:templObjBT1,..). Each teplObj
*              has .bid=bTypeiT .uid='setters_basicNames_template_bTypeiT
* @param {string}modeOpt - mode string. 'modify' - means to modify existing bn.data
*                                   'new' - create new bn.data and basicNames sheet
*                                   'none' - Default.only calculate parsArrays Object
* @param {string}bnSheetNameOpt - optional. Name of basicNamesStructure new sheet.
*                                if not set is equal to 'namesOfStructure_'+tMark
* @return {} - object with 2d-array parts for bn.data dedicated to each new blocks
*/
setters.basicNames.getBNDataFromTemplatesOrProtos=function(sources,modeOpt,bnSheetNameOpt){ //parentBType,proptoTypeObj){
  var mode=modeOpt||'none';
  var modify=(mode=='modify')?true:false;
  var newBN=(mode=='new')?true:false;
  var basicNames=setters.basicNames;
  var bnD=basicNames.data;
  var jsBN=handle.jObj(bnD[0]);
  var mindBTP=basicNames.mindBTP;
  var bnHeader=setters.basicNames.data[0];  
  var bnAddO={};  
  /**
  * Transforms proto's property values to bn.data form
  * @param {string}bnColName - column name value in basicNames.data
  * @param {String|Number|Object|Array}val - proprety's value
  * return{String|Array|Number} modified sheet cell value associated to property
  */
  var valFromProtoToBND=function(bnColName,val){
    if((typeof val !== 'object')|| (Array.isArray(val))){      
      return val;
    }else{
      return JSON.stringify(val);
    }
  };
  /**
  * Transforms template's property values to bn.data form
  * @param {string}bnColName - column name value in basicNames.data
  * @param {String|Number|Object|Array}val - proprety's value
  * return{String|Array|Number} modified sheet cell value associated to property
  */
  var valFromTemplateToBND=function(jbn,val){
    if((typeof val !== 'object')|| (Array.isArray(val))){            
      if(jbn=='bid'){
        val=val.charAt(0).toLowerCase()+val.slice(1).replace(/T$/,'');
      }else if(jbn=='bProps'){
        val=val.charAt(0).toLowerCase()+val.slice(1).replace(/T$/,'');
      }else if(jbn=='bName'){
        val=(/[tT]emplate/.test(val))?val.replace(/[Tt]emplate/,''):val;
      }else if(jbn=='bType'){
        val=(val=='bProp')?'':val;
        val=(/T$/.test(val))?val.replace(/T$/,''):val;
      }else if(jbn=='legend'){
        val=(val=='typical object')?'':val;
      }
      return val;
    }else{
      return JSON.stringify(val);
    }
  };
  // from Template to new bn.data array. Bid of template object is terminatee by "T"
  
  // remark: proptos object have no uid property
  //         templates objects have 'T' at the end of bid    
  /**
  * Checks if object has bilds terminating on 'T'
  * @param {Object}obj
  * @return {Boolean} true or false
  */
  var isTemplate=function(obj){
    for(var ib in obj.bids){
      if(/T$/.test(obj.bids[ib])){
        return true;
      }
    }
    return false;
  };
  var srcProto=false;
  var srcTempl=false;
  var getVal;
  if( setters.pNameCheck('uid',sources,'has')===false){
    srcProto=true;
    getVal=valFromProtoToBND;
  }
  /** row template */
  var rowTempl=function(){var r=[];for(var j in bnD[0]){r.push('');}return r;};
  var jbn,val;
  for(var pr in sources){
    
    srcTempl=(/T$/.test(pr))?true:false;
    getVal=(srcTempl)?valFromTemplateToBND:((srcProto)?valFromProtoToBND:undefined);
    if(srcProto||srcTempl){
      if(typeof sources[pr] !=='function'){
        var newblsRows=[];
        var source=sources[pr];
        var row=rowTemp();
        // all but bProps
        for( jbn in jsBN){
          if(jbn!='bProps'){
            if(setters.pNameCheck(jbn,source,'has')===true){
              if(typeof source[jbn] !=='function'){
                val=source[jbn];
                row[parseInt(jsBN[jbn],10)]=getVal(jbn,val);
              }
            }
          }
        }
        newblsRows.push(row);
        // bProps
        var bPropsO=(srcTempl)?source.bProps.bPropObjs:source.bProps;
        for(var ip in bPropsO){
          if(typeof bPropsO[ip] !=='function'){
            var bps=bPropsO[ip];
            if(srcProto){
              if(setters.pNameCheck('parent',bps,'has')===false){
                bps.parent=pr;
              } 
            }
            var rowBPs=rowTemp();
            for(jbn in jsBN){              
              if(jbn!='bProps'){                
                if(setters.pNameCheck(jbn,bps)!==jbn){
                  if(jbn!='bid'){
                    val=bps[jbn];                    
                    rowBPs[parseInt(jsBN[jbn],10)]=getVal(jbn,val);
                  }
                }                
              }else{
                if(jbn=='bProps'){
                  val=(srcTempl)?bPropsO[ip].bid:ip;
                  rowBPs[parseInt(jsBN[jbn],10)]=getVal(jbn,val);
                }
              }
            }
            newblsRows.push(rowBPs);
          }
        }
        pr=(srcTempl)?pr.charAt(0).toLowerCase()+pr.slice(1).replace(/T$/,''):pr;
        bnAddO[pr]=newblsRows;
      }
    }
  }
  // adding new bTypes to basicNames
  if(modify){
    bnD=setters.modifyBNData(bnD,bnAddO);
  }
  if(newBN){
    setters.getNewPartsBNData(bnAddO);
  }
  return bnAddO;
};
/**
* Creates blocks' templates for blocks described in basicNames sheet 
* @return {Object} object with properties as blocks' st-objects templates
*/
setters.basicNames.getTemplatesFromBNData=function(){
  //var basicNames=setters.basicNames;
  var basicNames=setters.basicNames;
  var bndS=sessionBN.bnd;
  var bnD=basicNames.data;
  var bTypes=basicNames.bTypes;
  var bnH=basicNames.data[0];
  basicNames=setters.addMembTo(basicNames,'','blocksTemplates',undefined,'basicNamesBlocksTemplatesObject');
  var temps=setters.basicNames.blocksTemplates;
  var ic,cn;
  for(var bt in bTypes){
    var bT=bTypes[bt];
    var bTT=bT+'T';
    // creates bType-template object
    var bTAttrs=basicNames.bTypesAttribs[bT];
    temps=setters.addMembTo(temps,'',bTT,undefined,
                            (bTAttrs.bName)?bTAttrs.bName:bT+'TemplateObject');
    var bTTO=temps[temps.bids[temps.bids.length-1]];
    var bPropsO; // bn.data properties
    for( ic=0;ic<bnH.length;ic++){
      cn=bnH[ic];
      if(cn!='bProps'){      
        // properties of bType template object
        // Template object has all properties the same as bType-object but with names to which 'T' is added
        // including mBTP. Uid in any case is to be setting for any element at site of bType object creation.
          
           if( setters.pNameCheck(cn,bTTO,'has')===true){
             // bTTO already has property cn
             if(cn!=='bid'){
               if(bTAttrs[cn]||bTAttrs[cn]===0){
                 bTTO[cn]=bTAttrs[cn];
               }
             }
           }else{
             if(bTAttrs[cn]||bTAttrs[cn]===0){
               bTTO=setters.addPropTo(bTTO,cn,bTAttrs[cn],cn+'PropertyOfBType_'+bT+'Template');
             }
           }
      }else{
        // по смыслу bProps - объект содержащий все свойства объекта типа 
        // т.е. фактически это набор индивидуальных обектов по одному на каждое 
        // из свойств. {bProp0:{}, bProp1:{}, ... bPropIndLastProp:{}}.
        bTTO=setters.addMembTo(bTTO,'','bProps',undefined,'bPropsPropertyObjectFor'+bT+'Template');
        bPropsO=bTTO.bProps;
      }
    }
    
    // methods
    
    // block properties array
    var bProps=basicNames.bTypesProps[bT];
    
    for(var bp in bProps){
      var bTP=bProps[bp];
      var bTPT=bTP+'T';
      var bTPAttrs=basicNames.bTPropsAttributes[bT][bTP];
      // по смыслу bProps - объект содержащий все свойства объекта
      // т.е. фактически это набор индивидуальных обектов по одному на каждое 
      // из свойств. {bProp0:{}, bProp1:{}, ... bPropIndLastProp:{}}.
      // Следовательно логично его сделать Типом - групповым свойством, а, следовательно,
      //  и определять каждое свойства через .addMembTo() как элемент группы-набора типа 'bProp', i.e.
      bPropsO=setters.addMembTo(bPropsO,'bProp',bTPT,undefined,bTPT+'PropertyObject');
      var bTPTO=bPropsO.bPropObjs[parseInt( bPropsO.nBProps,10)-1];
      // setting of bn.data attributes for each property object
      for(ic=0;ic<bnH.length;ic++){
        cn=bnH[ic];        
        
        if( setters.pNameCheck(cn,bTPTO,'has') === true){
          // bTPTO already has property cn
          if(cn!='bid'){
            if(bTPAttrs[cn]||bTPAttrs[cn]===0){
              bTPTO[cn]=bTPAttrs[cn];
            }
          }
        }else{
          if(bTPAttrs[cn]||bTPAttrs[cn]===0||cn=='parent'){
            if(cn=='parent'){
              bTPTO=setters.addPropTo(bTPTO,cn,bTT,cn+'PropertyOf_'+bTP+'Template');
            }else{  
              bTPTO=setters.addPropTo(bTPTO,cn,bTPAttrs[cn],cn+'PropertyOf_'+bTP+'Template');
            }
          }
        }
      }
      // methods:      
    }
  }
  return temps;
}; 
/**
* Setting templates and methods for properties and childs of blocks
* determined by basicNames.protos object (handMadeable)
*/
setters.basicNames.getTemplatesFromProtos=function(protos){
  var basicNames=setters.basicNames;
  var bnD=basicNames.data;
  var bnH=bnD[0];
  var jsBN=handle.jObj(bnH);
  var templates=basicNames.templates;
  //var protos=setters.basicNames.protos;  
  // setting of new blocks templates 
  for( var bT in protos){
    var proto=protos[bT];
    if(typeof proto !=='function'){
      // initiates blocks' temlate objects and properties    
      var bTT=bT+'T';
      templates=setters.addMembTo(templates,'',bTT,undefined,(proto.bName)?proto.bName:bT+'BlockTemplateObj');      
      var bTTO=templates[bTT];
      // add methods 
      bTTO=templates.addTypicalMethodsToTemplate(bTTO,bT);
      var bPropsO;
      for( var pr in proto){
        if(pr!='bProps'){
          if( (setters.pNameCheck(pr,bTTO,'has')) && (!jsBN[pr])){
            // bTTO already has property pr
            if(pr!=='bid'){
              if(proto[pr]||proto[pr]===0){
                bTTO[pr]=proto[pr];
              }
            }
          }else{
            if(pr!=='bid'){
              bTTO=setters.addPropTo(bTTO,pr,proto[pr],(proto[pr].bName)?proto[pr].bName:pr+'PropertyOfBType_'+bT+'Template');  
            }
          }
        }else{
          bTTO=setters.addMembTo(bTTO,'','bProps',undefined,'bPropsPropertyObjectFor'+bT+'Template');
          bPropsO=bTTO[bTTO.bids[bTTO.bids.length-1]];
        }
      }
      if(!proto.bProps){
        continue;
      }
      // block Properties array
      var bPropsArr=function(obj){var ps=[];for(var ip in obj){ps.push(ip);} return ps;}(proto.bProps);
      
      for(var bp in bPropsArr){
        var bTP=bPropsArr[bp];
        var bTPT=bTP+'T';
        // по смыслу bProps - объект содержащий все свойства объекта
        // т.е. фактически это набор индивидуальных обектов по одному на каждое 
        // из свойств. {bProp0:{}, bProp1:{}, ... bPropIndLastProp:{}}.
        // Следовательно логично его сделать Типом - групповым свойством, а, следовательно,
        //  и определять каждое свойства через .addMembTo() как элемент группы-набора типа 'bProp', i.e.
        bPropsO=setters.addMembTo(bPropsO,'bProp',bTPT,undefined,bTP+'PropertyObjectTemplate');
        var bTPTO=bPropsO.bPropObjs[parseInt( bPropsO.nBProps,10)-1];
        
        var pBTP=proto.bProps[bTP];
        for(var pp in pBTP){
          var v='';
          if( (setters.pNameCheck(pp,bTPTO,'has'))&& (!jsBN[pp]) ){
            // bTPTO already has property pp (objT -case)
            if(pp!='bid'){  
              bTPTO[pp]=pBTP[pp];              
            }
          }else if(!jsBN[pp]){
            // new bd.data column setting           
            // assigning of bProps object properties as separate object per property
            // with it's own properties in correspondance with bn.data columns names(this is the rule)
            // !!!! If some property has name incompatable with bn.data columns name it's or wrong or 
            // new column should be inserted in bn.data whith next updating of basicNames properties like
            // .bTypes, bTypesAttributes, bTPopsAttributes, ... including bn.data itself
            // !!!!            
            basicNames.addNewBNColumn(pp);
            bTPTO=setters.addPropTo(bTPTO,pp,pBTP[pp],pp+'PropertyOf_'+bTP+'Template');            
          }else{
            // bn.data props case
            if(pp!=='bid'){
              if(pp=='parent'){
                v=bTT;
              }else if((pp=='mBTP')&&(pBTP[pp])){
                v=pBTP[pp];
                // adds T-s. tFies value. (from 'verb' tFy)
                v=templates.mBTPTfy(v);
              }else if(pBTP[pp]||pBTP[pp]===0){
                v=pBTP[pp];
              }
              bTPTO=setters.addPropTo(bTPTO,pp,v,pp+'PropertyOf_'+bTP+'Template');
            }
          } 
          // methods
          // adding standard methods to template
          var mBTP=bT+'_'+bTP;
          templates.addTypicalMethodsToTemplate(bTPTO,mBTP);
        }
      }
    }
  }
  return templates;
};  
/**
* setting methods' legends
*/
protos.setMethodsLegends=function (){  
  var uidMethods='setters_basicNames_templates_methods'; 
  var onlyLegends=true;
  var legends=setters.basicNames.templates.methods.legends;  
  var mBTP='colsBls';
  legends[mBTP]={
    getNChildsOfType:'number of blocks having '+mBTP+' one as parent',
    stvOCalc:'calculated stValue, stValueO and other parameters of block',
    getChildsTypes:"current block's childs object"
  };
  mBTP='colsBls_colsNames';
  legends[mBTP]={
    getNChildsOfType:'number of blocks having '+mBTP+' one as parent',
    stvOCalc:'calculated columns names of sheet in csv-format for colsBls-block',
    getChildsTypes:"current block's childs object"
  };
  mBTP='colsBls_colsObjs';
  legends[mBTP]={
    getNChildsOfType:'number of blocks having '+mBTP+' one as parent',
    stvOCalc:'array of Range objects for all column of sheet',
    getChildsTypes:"current block's childs object"
  };
  mBTP='colsBls_shMUpS';  // shMUpS - sheet MarkUp Sets
  legends[mBTP]={
    getNChildsOfType:'number of blocks having '+mBTP+' one as parent',
    stvOCalc:'calculates object contained markUps Sets arrays and mUps multiIndices for all columns of sheet',
    getChildsTypes:"current block's childs object"
  };
  mBTP='colsBls_uid';  // shMUpS - sheet MarkUp Sets
  legends[mBTP]={
    getNChildsOfType:'number of blocks having '+mBTP+' one as parent',
    stvOCalc:'calculates object contained markUps Sets arrays and mUps multiIndices for all columns of sheet',
    getChildsTypes:"current block's childs object"
  };
  if(onlyLegends){ return legends; }
  var funs={};
  //-- f - mULs // mULs -  MarkUp Labels
  var f_stVOmULs=function(client){
    var mULs=f_stVOshMUpS(client).mULs;
    var stVO={stvoCalc:mULs,param:'mULs',paramValue:mULs};
    return stVO;
  };
  funs.mULs={fuid:setters.addFunction('basicNames_'+parentBType,'mULs',f_stVOmULs),
             f:f_stVOmULs};
  // -- f - mUpSets
  var f_stVOmUpSets=function(client){
    var mUpSets=f_stVOshMUpS(client).mUpSets;
    var stVO={
      stvoCalc:mUpSets,
      param:'mULs',
      paramValue:mUpSets
    };
    return stVO;
  };
  funs.mUpSets={
    fuid:setters.addFunction('basicNames_'+parentBType,'mUpSets',f_stVOmUpSets),
    f:f_stVOmUpSets
  };
  //-- f - nChildsOfType
  var f_nChildsOfType=function(parent,chBType){
    var v;
  };
};
/*
* Algorithm of on fixedLevelDepthScan of blocks with group-childs.
* Each group-child could have properties which are group-childs themselves.
* So let's consider that first encounted gorup-childs are of levelDepth 1
* and their properties who are group-childs as well  are group-childs of levelDepth 2, etcetera.
* 
* Algorithm for properties' blocks assignment(determination) 
* in a sequence which includes at first only grChilds 
* with fixed levelDepth. Not deeper then specified levelDepth.
* 
* and just after childs with levelDepth indicated would have been accounted for 
* (their blocks have been assigned(described) and t.data 
* insertion has been made ) process goes on to dipper levelDepth group-childs.
* Scan procedure presumes assigning blocks and data ( stValueO,stvoCalc, tInserter)  for
* 1.
* root
* root.props
* root.chsGroups of level0  (level0 means properties with levelDepth=1)
* 
* 2.remember childs of level0 in array grChsL0
* 
* now each chsGrsL0[ig] is root and has
*                           chsGrsL0[ig].props
*                           chsGrsL0[ig].chsGrsL1 
* For each chsGrs..[ig] arrays rest[ig] is introduced where rest is object
*  rest[ig]=chGRL0[ig].chsGrsL1.slice(0) where rest[ig] is array of bTypes(bTProps)  rest[ig]=[btp0,btp1...]
*                            
* 3.We begin with recursive sycle by chsGrsL0 assigning  their props and
* if rest.length>0 only first type in rest. 
* After scanning first rest it would spliceed by first element rest.splice(0,1) 
* (scanning includes only props reading not next level childs)
* an go to next chGr L0 until all rest would be empty.
* 
* 4.while finishing this step we will take each chGrL0[ig] again .
* 
* After this we sill combine all chGrL0.chsL1.chsL2 in common array and and will pass each element of it
* through the same procedure beginning with step 2.
* 
* 
* Scanning should be done by addBlock method with two parameters:
* leveDepthMax >=0 or undefined 0 means only properties are scanned
*                          1 means max deep for cycle is 1
*                            onlyProps {Boolean} true - scan only props not groupChilds) for step 3 for rest-elements 
*                            {levelDepth:levelDepthMax'',onlyProps:true|false}
* 
* after one cycle over chsGrsL0 levelDepth is decreased by 1,
* after sycle with levelDepth=0 levelDepth is set to levelDepthMax 
* 
rest is created and new cycle begins 
*/

/*
* Calculates or sets stValue and stValueO for element(Block) client
* stValue,stValueO - values in table 'Setters' ( in t.data array) columns
* @param {Object}client - block's st-object
* @param {Object}t - t-object
* @param {string}mBTP - mBTP of calculated property
* @param {Integer}iniRow - index of initial row of block in t.data
* @param {string}iniColName - column name of block initial in t.data

* @param {Object|Array|Variable}inputOtp - manually assigning value if any
*/
setters.stvOCalc=function(client,t,iniRow,mBTP,uid,inputOpt){
  
  t=t||setters.getAncestor(client,'sprSht').t;
  iniRow=iniRow||client.iniRow;
  mBTP=mBTP||client.mBTP;
  uid=uid||client.uid;
  
  var js=handle.jObj(t.data[0]);  
  var prnt=setters.getSprShtParent(client);                       // preparent 'sprSht'
  var param=(/[_]/.test(mBTP))?mBTP.split('_').slice(-1)[0]:mBTP; // bType or BTProp of calculated property
  var basicNames=setters.basicNames;
  var bND=basicNames.data;
  var jsBN=handle.jObj(bND[0]);
  var mindBTP=basicNames.mindBTP;
  var isProp=(/[_]/.test(mBTP))?ture:false;
  var sO=(!isProp)?setters.getSpecsObj(mBTP):setters.getSpecsObj(mBTP.split('_')[0],mBTP.split('_')[1]);
  var iniColName=sO.iniColName;
  var stValCalc,paramValue;                      // stValue should be calculated
  var warning=param+' calculated is not coinside with '+param+' in Setters sheet data!';
  var sheets,shtsNames,sprSht,shBl,s,d,shHeadRow,shHeader,shMUps,shName,sD,i;
  // What is the difference between stValCalc and paramValue ??????
  
  switch (param){
    case 'spreadsheetsIds':
      stValCalc='';
      paramValue=(setters.spreadsheetsIds)?setters.spreadsheetsIds:"18oDYBCvfTbXKxp8xFi0zc5VB-Uu3Nb_PgSGJPOn3-Os";
	  break;
    case 'id':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=(prnt.ssId)?prnt.ssId:setters.ssId;
      paramValue=(prnt.ssId)?prnt.ssId:setters.ssId;
      break;
    case 'url':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=prnt.url;
      paramValue=prnt.url;
      break;
    case 'name':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=prnt.ssName;
      paramValue=stValCalc;
      break;
    case 'parentFolderId':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=DriveApp.getFileById(prnt.ssId).getParents().next().getId();
      paramValue=stValCalc;
      break;
    case 'nSheets':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=prnt.ss.getSheets().length;
      paramValue=stValCalc;
      break;
    case 'blockLines': 
      stValCalc=(parseInt(t.lastLineRowInd,10)-iniRow);
      break;
    case 'shHeadRowInd':
      // 'shHeadRowInd' prop have sh shBl objects
      
      if(prnt.ssName!='dataGlossaryAndGroups'){
        stValCalc=0;
      }else{
        
        if(client.shName!="dataGroups"){
          stValCalc=0;
        }else{
          stValCalc=1;
        }
      }
      break;
    case 'sheetsNames:':
      sheets=prnt.ss.getSheets();
      shtsNames='';
      for( i=0;i<sheets.length;i++){
        shtsNames+=(!shtsNames)?sheets[i].getName:','+sheets[i].getNames();
      }
      stValCalc=shtsNames;
      
      break;
    case 'sheetsNames':
      sheets=prnt.ss.getSheets();
      shtsNames='';
      for( i=0;i<sheets.length;i++){
        shtsNames+=(!shtsNames)?sheets[i].getName:','+sheets[i].getNames();
      }
      stValCalc=shtsNames;
      paramValue=shtsNames;
      break;
    case 'shtsNames':
      sheets=prnt.ss.getSheets();
      shtsNames='';
      for( i=0;i<sheets.length;i++){
        shtsNames+=(!shtsNames)?sheets[i].getName:','+sheets[i].getNames();
      }
      stValCalc=shtsNames;
      paramValue=shtsNames;
      break;
    case 'shsNames':
      sheets=prnt.ss.getSheets();
      shtsNames='';
      for( i=0;i<sheets.length;i++){
        shtsNames+=(!shtsNames)?sheets[i].getName:','+sheets[i].getNames();
      }
      stValCalc=shtsNames;
      paramValue=shtsNames;
      break;
      // earlier were described ot those of column shSetters
    
    case 'shName':
      stValCalc=client.shName;
      paramValue=stValCalc;
      break;
    case 'shHeadRowInd':
      if(prnt.ssName!='dataGlossaryAndGroups'){
        stValCalc=0;
      }else{
        if(client.shName!="dataGroups"){
          stValCalc=0;
        }else{
          stValCalc=1;
        }
      }
      paramValue=stValCalc;
      break;
    case 'shMembs':
      shName=client.shName;
      s=prnt.ss.getSheetByName(shName);
      sD=s.getDataRange().getValues();
      stValCalc=sD.length-(parseInt(client.shHeadRowInd,10)+1);
      break;
    case 'shHeader':
      prnt=setters.getAncestor(client,'sprSht');
      shName=client.shName;
      s=prnt.ss.getSheetByName(shName);
      sD=s.getDataRange().getValues();
      var iH=function(client){
        if(client.shHeadRowInd){
          return client.shHeadRowInd;
        }else{
          if(prnt.ssName!='dataGlossaryAndGroups'){
            return 0;
          }else{
            if(client.shName!="dataGroups"){
              return 0;
            }else{
              return 1;
            }
          }
        }
      }(client);
      stValCalc=sD[iH]; //.toString();
      paramValue=stValCalc;
      break;
    case 'shsBl':
      shNames=prnt.shtsNames;
      var iBl=0;
      // ib -block index among bids of current bType as parent property parent[client.bType+'Bids']
      var membBid=uid.split('_').slice(-1)[0];
      var ib=parseInt(handle.jObj(parent[param+'Bids'])[membBid],10);
      
      // index of parent's row
      var stLabel=basicNames.bTPropsAttributes [client.bType][param].stLabel; //'sheetsNames:'
      
      // for block already existed in t.data
      var itdBlRow=parseInt(t.ssIs.r[stLabel][ib],10);
      break;
    case 's':
      // shName - name of a sheet is considered to be index( or identifier) of a sheet
      // in consideration. So this parameter is to be set at the moment
      sprSht=setters.getAncestor(client,'sprSht');
      shBl=setters.getAncestor(client,'shBl');
      s=sprSht.ss.getSheetByName(shBl.shName);
      stValCalc='';
      paramValue=s;
      break;
    case 'shId':
      break;
    case 'nMembers':
      shBl=setters.getAncestor(client,'shBl');
      s=shBl.s;
      d=s.getDataRange().getValues();
      shHeadRow=parseInt(shBl.shHeadRowInd,10)+1;
      stValCalc=d.length-shHeadRow;
      paramValue=stValCalc;
      break;
    case 'nColumns':
      shBl=setters.getAncestor(client,'shBl');
      s=shBl.s;
      d=s.getDataRange().getValues();
      shHeader=d[parseInt(shBl.shHeadRowInd,10)];
      stValCalc=shHeader.length;
      paramValue=stValCalc;
      break;
    case 'colsBls':
      break;
    case 'colsNames':
      shBl=setters.getAncestor(client,'shBl');
      s=shBl.s;
      d=s.getDataRange().getValues();
      shHeader=d[parseInt(shBl.shHeadRowInd,10)];
      stValCalc=shHeader.toString();
      paramValue=stValCalc;
      break;        
    case 'colsObjs':
      shBl=setters.getAncestor(client,'shBl');
      s=shBl.s;
      d=s.getDataRange().getValues();
      var iHead=parseInt(shBl.shHeadRowInd,10);
      var shH=d[iHead];
      
      var colsOs=[];
      for(var j=0;j<shH.length;j++){
        var lttr=s.getRange(iHead,j).getA1Notation().replace(/\d+/g,'');
        colsOs.push( s.getRange(lttr+':'+lttr));
      }
      stValCalc=colsOs;
      paramValue=stValCalc;
      break;
    case 'shMUpS':      
      shBl=setters.getAncestor(client,'shBl');
      shMUpS=setters.getMarkUps(shBl);
      shName=shMUpS.shName;
      var mUmSets=shMUpS.mUpSets;
      var mULs=shMUpS.mULs;
      shHeader=shMUpS.shHeader;
      stValCalc='';
      paramValue=shMUpS;
      break;
    default:
      // members
      if(/(origin[A-Z]|owder)/.test(param)){
        stValCalc=t.data[iniRow][parseInt(js.stValue,10)];
        paramValue=stValCalc;
      }else if(/doc[A-Z]/.test(param)){
        stValCalc=t.data[iniRow][parseInt(js.stValue,10)];
        paramValue=stValCalc;
      }else if(/(sprShts|stT|sprSht|blsGrps|blsGrT|ssBls|ssBlT)/.test(param)){
        stValCalc='';
      }else{
        // collections
        var pattCollection=/(origsBls|docsBls|ssBls|shsBl|extraSsBl)/;
        if( pattCollection.test(param)){
          stValCalc='';
        }
      }
  }
  return {
    uid:uid,
    mBTP:mBTP,
    value:stValCalc,
    param:param,
    paramValue:paramValue
  };
};
/**
* Object variant of stvOCalc
* properties of this object are functions calculating specific parameters
* depending of param value( bType or bTProp )
*/
setters.stvOCalc=function(client,t,iniRow,mBTP,uid,inputOpt){
  var js=handle.jObj(t.data[0]);  
  var prnt=setters.getSprShtParent(parent);                       // preparent 'sprSht'
  var param=(/[_]/.test(mBTP))?mBTP.split('_').slice(-1)[0]:mBTP; // bType or BTProp of calculated property
  var basicNames=setters.basicNames;
  var bND=basicNames.data;
  var jsBN=handle.jObj(bND[0]);
  var mindBTP=basicNames.mindBTP;
  var isProp=(/[_]/.test(mBTP))?ture:false;
  var sO=(!isProp)?setters.getSpecsObj(mBTP):setters.getSpecsObj(mBTP.split('_')[0],mBTP.split('_')[1]);
  var iniColName=sO.iniColName;
  var stValCalc,paramValue,shName,s,sD;                      // stValue should be calculated
  var warning=param+' calculated is not coinside with '+param+' in Setters sheet data!';
  switch (param){
    case 'spreadsheetsIds':
      stValCalc='';
      paramValue=(setters.spreadsheetsIds)?setters.spreadsheetsIds:"18oDYBCvfTbXKxp8xFi0zc5VB-Uu3Nb_PgSGJPOn3-Os";
	  break;
    case 'id':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=(prnt.ssId)?prnt.ssId:setters.ssId;
      paramValue=(prnt.ssId)?prnt.ssId:setters.ssId;
      break;
    case 'url':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=prnt.url;
      paramValue=prnt.url;
      break;
    case 'name':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=prnt.ssName;
      paramValue=stValCalc;
      break;
    case 'parentFolderId':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=DriveApp.getFileById(prnt.ssId).getParents().next().getId();
      paramValue=stValCalc;
      break;
    case 'nSheets':
      prnt=setters.getAncestor(client,'sprSht');
      stValCalc=prnt.shNames.length;
      paramValue=stValCalc;
      break;
    case 'blockLines': 
      stValCalc=(parseInt(t.lastLineRowInd,10)-iniRow);
      break;
    case 'shHeadRowInd':
      // 'shHeadRowInd' prop have sh shBl objects
      
      if(prnt.ssName!='dataGlossaryAndGroups'){
        stValCalc=0;
      }else{
        
        if(client.shName!="dataGroups"){
          stValCalc=0;
        }else{
          stValCalc=1;
        }
      }
      break;
    case 'sheetsNames:':
      stValCalc=prnt.shNames.toString();
      
      break;
      // earlier were described ot those of column shSetters
      
    case 'shName':
      stValCalc=client.shName;
      
      break;
    case 'shHeadRowInd':
      if(prnt.ssName!='dataGlossaryAndGroups'){
        stValCalc=0;
      }else{
        if(client.shName!="dataGroups"){
          stValCalc=0;
        }else{
          stValCalc=1;
        }
      }
      break;
    case 'shMembs':
      shName=client.shName;
      s=prnt.ss.getSheetByName(shName);
      sD=s.getDataRange().getValues();
      stValCalc=sD.length-(parseInt(client.shHeadRowInd,10)+1);
      break;
    case 'shHeader':
      prnt=setters.getAncestor(client,'sprSht');
      shName=client.shName;
      s=prnt.ss.getSheetByName(shName);
      sD=s.getDataRange().getValues();
      stValCalc=sD[0]; //.toString();
      paramValue=stValCalc;
      break;
    case 'shsBl':
      var shNames=prnt.shNames;
      var iBl=0;
      // ib -block index among bids of current bType as parent property parent[client.bType+'Bids']
      var membBid=uid.split('_').slice(-1)[0];
      var ib=parseInt(handle.jObj(parent[param+'Bids'])[membBid],10);
      
      // index of parent's row
      var stLabel=basicNames.bTPropsAttributes [client.bType][param].stLabel; //'sheetsNames:'
      
      // for block already existed in t.data
      var itdBlRow=parseInt(t.ssIs.r[stLabel][ib],10);
      break;
    case 's':
      break;
    case 'shId':
      break;
    case 'nMembers':
      break;
    case 'nColumns':
      break;
    case 'cols':
      break;
    case 'colsNames':
      break;
    default:
      // members
      if(/(origin[A-Z]|owder)/.test(param)){
        stValCalc=t.data[iniRow][parseInt(js.stValue,10)];
        paramValue=stValCalc;
      }else if(/doc[A-Z]/.test(param)){
        stValCalc=t.data[iniRow][parseInt(js.stValue,10)];
        paramValue=stValCalc;
      }else if(/(sprShts|stT|sprSht|blsGrps|blsGrT|ssBls|ssBlT)/.test(param)){
        stValCalc='';
      }else{
        // collections
        var pattCollection=/(origsBls|docsBls|ssBls|shsBl|extraSsBl)/;
        if( pattCollection.test(param)){
          stValCalc='';
        }
      }
  }
  return {
    uid:uid,
    mBTP:mBTP,
    value:stValCalc,
    param:param,
    paramValue:paramValue
  };
};
/*
for( var ish in shNames){       
          var bTProp=shNames[ish]
          i=iIni+1;
          
          // add New shObj to shsBlock.
          shsObj=setters.addBlock(shsObj,'sh',shNames[ish]);
          var shObj=newBl[ newBl.bids[ newBl.bids.length-1]]; // for debugging
          shObj.iBlRow=iBl;
          shObj=setters.addPropTo(shObj.shsHeadRowInd,shNames[ish],insRow[ parseInt(t.js.ind,10)],'sheetHeaderInd');
          
          iBl++;
        }
        // correction of values after rows insertion
        // -- correction of iniRow
        var isObj=mind[ indsForColNames[ sO.iniColName]];
        for(var ir in isObj){
          if((parseInt(isObj[ir],10)>irSh0)&&(ir!='lastLine')){
            newBl[ir].iniRow=parseInt(newBl[ir].iniRow,10)+nOfInsertedRows;
          }
        }
        t.lastLineRowInd=parseInt(t.lastLineRowInd,10)+nOfInsertedRows;          
        // --- corrects of nBlRows of predecessOrs
        setters.parentsLengthCorrection(newBl,nOfInsertedRows); 


*/
// -----------------------

/** 
* Inserts row in t.data if it's necessary by values of block in consideration(current client)
* @param {Object}client - st-object of block in consideration
* @param {Object [][]}tData - actual t.data
* @param {Integer}iPrevRow index of previous block's last row
* @param {Object}sO - specs object of current client 
* @param {string}param - bType or bProp of client
* @param {string}mBTP  - of client
* @param {string}uid of current client object

* @return {Object} object of resulting data
*                 { data: {Object [][]} - renewed t.data
*                   iniRow: {Integer}- index of initial filling row
*                   iLastInsertedRow: {Integer} - idex of last row being inserted
*                   inser: {Object [][]} - array inserted into t.data baginning whith and including iniRow and iLastInsertedRow
*                 }
*/
setters.tInserter=function(client,t,iPrevRow,sO,param,mBTP,uid,colsToFillOpt){
  
  var paramColName=(sO.crv)?((sO.crv.ptc)?((sO.crv.ptc[param])?(sO.crv.ptc[param]):'stValue'):'stValue'):'stValue';
  //var paramColName=sO.getParamColName(param);
  var colsToFill=colsToFillOpt||['uid',paramColName,'stValueO','iniColName'];  
    // basics
  var tData=t.data;
  var bnD=setters.basicNames.data;
  var jsBN=handle.jObj(bnD[0]);
  var mindBTP=setters.basicNames.mindBTP;
  // client data
  var irowBN=parseInt(mindBTP[mBTP],10);
  var stLabel=bnD[irowBN][parseInt(jsBN.stLabel,10)];
  var iniRow=iPrevRow+sO.crv.nR;
  var iniColName=sO.iniColName;
  var type,shift,stvCalc,stvO,stVOJsonNew;
  var oti={};
  if(sO.crv){
    // taking shift into account if any
    if(sO.crv.shift){
      type=(!sO.crv.shift.type)?'first':sO.crv.shift.type;
      shift=(!sO.crv.shift.value)?0:sO.crv.shift.value;
    }
    var nR=sO.crv.nR;
    if(parseInt(shift,10)!=0){
      var indChild=parseInt( client.bid.replace(client.bType,''),10);
      indChild=(indChild)?indChild:0;
      if(( type=='first')&&(indChild==0)){
        nR=nR+shift;
      }else if(type=='all'){
        nR=nR+shift;
      }else{
        Logger.log('something is going wrong with sO.crv.shift for client.uid='+client.uid);
      }
    }
    if( (!nR)||(nR<1) ){
      // element whose row in this case is containing client's data will be named 'host'
      // добавление данных в последней строке предыдущего блока
      // строки в t.data не добавляются 
      // adding data into the last row of previous block. It means that no new rows are added to t.data array.
      iniRow=iPrevRow;
      var uidHost=tData[iniRow][parseInt(t.js.uid,10)];
      var uidReNew=(uidHost)?uidHost+','+uid:uid;
      
      // if the same t-row contains few blocks' data 
      // the uids in t-column 'uid' are to be written in csv-format (uidHost,uidNext0,uidNext1..')
      var stVal=tData[iniRow][parseInt(t.js[paramColName],10)];     // yet if sO.crv.nR==0 it's parent's stValue
      var stVOJson=tData[iniRow][parseInt(t.js.stValueO,10)];
      stVO=(stVOJson)?JSON.parse(stVOJson):{value:'',uid:uid,blocks:{uids:uid,values:''}};
      
      // calculates value                             
      stvCalc=setters.stvOCalc(client,t,iniRow,mBTP,uid);
      
      stVO.param=stvCalc.param;
      stVO.paramValue=stvCalc.paramValue;
      stVO.valBefore=stVal;
      stVO.valCalc=stvCalc.value;
      stVO.value=stVal+','+stvCalc.value;
      stVO.stvOCalcRes=stvCalc;
      
      // Actual  rule: when few objects' parameters are shown in the same cell, they are rendered in csv-format in order 
      // of following in correspondance of their following in stValueO.blocks.bids property
      // Alternative rule: when few objects' parameter are shown in the same cell, the last one is rendered 
      
      stVO.uid=uidReNew;
      stVO.blocks.uids=stVO.blocks.uids+','+uid;
      stVO.blocks.values=stVO.blocks.values+','+stVO.valCalc;
      stVOJsonNew=JSON.stringify(stVO);
      // t.data edition
      tData[iniRow][ parseInt(t.js.uid,10)]=uidReNew;
      tData[iniRow][parseInt(t.js[paramColName],10)]=stVO.value; 
      tData[iniRow][parseInt(t.js.stValueO,10)]=stVOJsonNew;
      tData[iniRow][parseInt(t.js[iniColName],10)]=(sO.crv.value)?sO.crv.value:stLabel;
      stVO.jsonStr=stVOJsonNew;
      stVO.lastInsertedRow=iPrevRow;
      return {
        data:tData,
        iniRow:iniRow,
        iLastInsertedRow:iPrevRow,
        insert:undefined,
        stVO:stVO
      };
    }else{
      
      var d1=tData.slice(0,iPrevRow);
      var d2=tData.slice(iPrevRow);
      var insert=[];
      // inserts new empty row(s)
      
      for(var i=0;i<sO.crv.nR;i++){
        var row=[];
        for(var j in tData[0]){
          row.push('');
        }
        if((!sO.crv.ptr)||(!sO.crv.ptr[param])||(sO.crv.ptr[param]==i)){
        
          var iRow=iPrevRow+i+1;
          stvCalc=setters.stvOCalc(client,t,iRow,mBTP,uid);          //stVOCalc(t,iniRow,mBTP,uid,parentStVO,inputOpt)
          
          stVO=(stVO)?stVO:{};
          stVO.value=stvCalc.value;
          stVO.uid=uid;
          stVO.blocks=(stVO.blocks)?stVO.blocks:{};
          stVO.blocks.uids=(stVO.blocks.uids)?stVO.blocks.uids+','+uid:uid;
          stVO.blocks.values=(stVO.blocks.values)?
            stVO.blocks.values+','+stvCalc.value:
          stvCalc.vlaue;
          stVO={value:stvCalc.value,uid:uid,blocks:{uids:uid,values:stvCalc.value}};
          stVOJsonNew=JSON.stringify(stVO);
          
          
          row[ parseInt(t.js.uid,10) ]=uid;
          row[ parseInt(t.js[paramColName],10)]=stvCalc.value;
          row[ parseInt(t.js.stValueO,10)]=stVOJsonNew;              
          row[ parseInt(t.js[sO[iniColName]],10) ]=(sO.crv.value)?sO.crv.value:stLabel;
          
        }
        
        insert.push(row);
      }
      stVO.jsonStr=stVOJsonNew;
      stVO.iLastInsertedRow=iPrevRow+insert.length;
      return {
        data:d1.concat(insert).concat(d2),
        iniRow:iniRow,
        iLastInsertedRow:iPrevRow+insert.length,
        insert:insert,
        stVO:stVO
      }; 
    }
  }else{
    stVO={};
    stVO.lastInsertedRow=iPrevRow;
    return {
      data:t.data,
      iniRow:iPrevRow,
      iLastInsertedRow:iPrevRow,
      insert:undefined,
      stVO:stVO
    };
  }
};
/**
* Sets stValue for parameter in setters sheet and fills in t.data appropriate cells and 
* dependent cells
* 
* 
* @param {Object}client - st-object of Block which stValue is to be assigned
* @param {Object}inputOpt - optional object to transfer data for calculation stValue if necessary.
*                          Should have property .stValue wich could be '' or null...
* @return {Object} - objct stVO which value object is to be assigned as current assigned stValue of client
*             outside this method should be executed   client.stValue=stVO.value
*             other porperties of stVO could be varied depending of paramName and client
*/ 
setters.setStValueO=function(client,inputOpt){
  // basics
  var basicNames=setters.basicNames;
  var bnD=basicNames.data;
  var jsBN=handle.jObj(bnD[0]);
  var mindBTP=basicNames.mindBTP;
  // client data
  var parent=setters.us[client.parentUid];
  var parentBType=parent.bType;
  var mBTP=(mindBTP[client.bType])?client.bType:((mindBTP[parent.bType+'_'+client.bType])?(parent.bType+'_'+client.bType):undefined);
  var irowBN=parseInt(mindBTP[mBTP],10);
  var param=(/[_]/.test(mBTP))?mBTP.split('_').slice(-1)[0]:mBTP;
  var sO=(client.bType==mBTP)?setters.getSpecsObj(client.bType):setters.getSpecsObj(parent.bType,client.bType);
  
  // t.data rows params
  var iPrntPrevRow=parent.iniRow+parent.nBlRows-1;
  var iniColName=sO.iniColName; 
  // t and parent sprSht
  var prnt=setters.getSprShtParent(client);
  var t=prnt.t;
  var tData=t.data;
  
  var insert=[];
  var iPrevRow=iPrntPrevRow;   
  var uid=client.uid;
    
  //  t.data rows  insertion for Client
    
  var oti=setters.tInserter(client,t,iPrntPrevRow,sO,param,mBTP,uid); // exessive parameters. only client is sufficient,others could be calculated inside funciton
  t.data=oti.data;
  insert.concat(oti.insert);
  iPrevRow=oti.iLastInsertedRow;
  var iniRow=oti.iniRow;
  
  var stVO=(oti.stVO)?oti.stVO:{value:'',uid:client.uid,blocks:{uids:client.uid,values:''}};
  var stVal=stVO.value;
  // if for client sO.crv.nR==0 last row of previous(parent) object is used 
  // therefore if sO.crv.nR==0 it's yet parent's stValue cell of sheet
  
  if(client.bType!=mBTP){
    // exit for bTProp block
    return stVO;
  }
  
  //    ------- PROPERTIES BLOCK  
  
  // preparing for properties( members of bType group)
  // -- number of properties of current block object set by those props who have stLables

  var bTPropsWithStLbls=basicNames.bTPropsAttributes[client.bType].stLabel.bProps;
  var bTProps=basicNames.bTypesProps[client.bType];
  // combines two previous arrays
  var psAll=combineElementsOfArrays(bTProps,bTPropsWithStLbls); // client's props to insert  
  stVO.psAll=psAll;
   
  //   ------- CHILDS BLOCK 
  
  /**
  * looks for childs in nameAndStructure sheet ( in bn.data) - blocks who
  * have this client block as the parent ( contain this client's bType in 'parent' column of bn.data)
  */
  var chsTypesO=setters.basicNames.getChildsTypes(client.bType);
  /* object of childs attributes
  *              .nChsTs - number of childs
  *               .chsTsOs - array of childs' objects
  *               [ { irow:'',bType:''} ] in the same order as in .childs array
  *               .ibnRows - array of childs ibnRows
  *               .bTypes - array of childs' bTypes
  */
  var chsBTypes=chsTypesO.bTypes;
  
  var chsTs=[];
  for(var ibt in chsBTypes){
    if( psAll.indexOf(chsBTypes[ibt])>=0){
      continue;
    }else{
      chsTs.push(chsBTypes[ibt]);
    }
  }
  if( (!chsTs.length)||(chsTs.length==0)){
    stVOJson=JSON.stringify(stVO);
    stVO.jsonStr=stVOJson;
  }else{
    stVO.chsTs=chsTs;
    stVOJson=JSON.stringify(stVO);
    stVO.jsonStr=stVOJson;
  }
  t.data[iniRow][parseInt(t.js.stValueO,10)]=stVO.jsonStr;

  return stVO;
};
/**
* Adds block of bType to Parent where bType could be group's type
* as well as individual property block type
* @param {Object}parent - paretn st-object (for ex. ssBls)
* @param {string}bType - bType of newly creating block object. 
*                       It could be bType as well as bProp which is determined inside method.
* @return {Object} st-object of combined spreadsheet block  
*/
setters.addBlock=function(parent,bType){
  var basicNames=setters.basicNames;
  var prnt=setters.getSprShtParent(parent); // parent sprSheet
  var t=prnt.t;
  var indsForColNames=handle.is.indsForColNamesDefault;
  var mind=handle.getIsInds(t.data);
  var bnData=basicNames.data; // basic Names sheet data
  var jsBN=handel.jObj(bnData[0]);
  var iPrntPrevRow=parent.iniRow+parent.nBlRows-1;
  var mBTP,iRowBN,sO,newBl,stVO,nExtraLines;
  if( basicNames.mindBTP[bType]){
    /* -- group-member object of bType
    * особенности заполнения данных в setters (t.data) (visualisation data):
    * это объект Членa группы типа( bType) Ему предшествует,
    * - либо родительский,
    * - либо последняя строка sibling одного из детей. В любом случае его начальная строка будет
    * либо следующая после брата, либо следующая или совпадающая с предшествующей родительской( если sO.crv.rN=0 -
    * условие размещения в предшествующей родительской строке)
    * индекс строки этой 'предшествующей'(существующей) родительской строки будет parent.iniRow+parent.nBlRows-1
    * It's important to control that parent.nBlRows property would have been being updated adequately
    */
    mBTP=bType;           // multiIndex bn.data
    iRowBN=parseInt( basicNames.mindBTP[bType],10);
    sO= setters.getSpecsObj(bType);
    var nBTypeStr='n'+bType.charAt(0).toUpperCase() + bType.slice(1)+'s';
    
    // add member to collection(parent)
    parent=setters.addMembTo(parent,bType,undefined,(parent[bType+'Template'])?parent[bType+'Template']:undefined,(sO.name)?sO.name:bType+'sCollection');
    
    newBl= parent[bType+'Objs'][ parseInt(parent[ nBTypeStr],10)-1 ];
    
    // check depthLevel for bType
    if(sO.dL){
      if(sO.dL==1){
        newBl.dL=1;
      }
    }
    // --------- basic( obligatory ) properties setting for newBl
    var bid=newBl.bType+(parseInt(parent[nBTypeStr],10)-1);
    var uid=parent.uid+bid;
    iPrntPrevRow=parent.iniRow+parent.nBlRows-1;
    newBl.iniRow=iPrntPrevRow+sO.crv.nR;
    newBl.iniColName=sO.iniColName;
    // calculates stValueO and inserts data of newBl into t.data
    stVO=setStValueO(newBl);
    
    newBl.stValueO=stVO;                       //JSON - stVO.jsonStr
    newBl.stValue=stVO.stValue;
    t.data=stVO.tData;
    var psAll=stVO.psAll;                     // array of propperties
    var chsTs=stVO.chsTs;                     // array of childrens' group bTypes (who have newBl.bType as parentBType)
    
    //на сколько "удлиннился" parent-Block  это фактически длинна суммарного массива insert
    nExtraLines=parseInt(stVO.iLastInsertedRow,10)-iPrntPrevRow;
    // коррекция всех прородителей в зависимости от полного числа добавленных строк внутри 
    if(nExtraLines>0){
      setters.parentsLengthCorrection(newBl,nExtraLines);                   
    }    
    //    ------- PROPERTIES BLOCK  
    if(!parent.onlyChilds){
      for( var ipa in psAll){
        var param=psAll[ipa];
        
        setters.addBlock(newBl,param);
        
        // forming of combined stVO     
        var pObj=newBl[param];
        var pstVO=pObj.stValueO;
        // place to include pObj's pstVO in client's stVO 
        
        stVO.blocks.uids+=','+pObj.uid;
        stVO.blocks.values+=','+pObj.stValue;        
      }
    }
    // updates stValueO of newBl
    t.data[newBl.iniRow][parseInt(t.js.stValueO,10)]=JSON.stringify(stVO);
    
  //   ------- CHILDS BLOCK 
    // begin handle whith childs' Types
    var nChsOfTs={};
    if((!parent.dL)||parent.dL!=0){
      for(var icht in chsTs){
        // per each child's bType group
        var chBType=chsTs[icht];
        nChsOfTs[chBType]=setters.getNChildsOfType(newBl,chBType);
        
        for(var ichT=0;ichT<parseInt(nChsOfTs[chBType],10);ichT++){          
          if(!newBl.dL){
            // group members
            setters.addBlock(newBl,chBType);
          }else if(newBl.dL==1){
            newBl.dL=0;
            setters.addBlock(newBl,chBType);
            newBl.dL=1;
          }else{
            if(newBl.rest){
              newBl.rest.push(chBType);
            }else{
              newBl.rest=[chBType];
            }
          }
        }
      }      
      if(newBl.rest){
        delete newBl.dL;
        newBl.onlyChilds=true;
        while( newBl.rest.length>0){
          var rchT=newBl.rest.slice(0,1);
          setters.addBlock(newBl,rchT);
          newBl.rest.splice(0,1);
        }
        delete newBl.onlyChilds;
      }
    }
    // expand list of props
    // !! check before use !!
    /*
    var expandedBTypes=combineElementsOfArrays(psAllBTypes,childs.bTypes);
    var nPropsAll=expandedBTypes.length;
    stVO.nChilds=chlds.length;
    */
  }else{
    // -- bProp- object
    // это объект одиночного или нового свойства. 
    // Если он визуализируется в t.data - Ему предшествует,
    // - либо последняя строка предыдущего свойства
    // - либо предшествующая строка родительского объекта. Если у этого свойства sO.crv.rN=0
    // то оно записывается в эту родительскую строку.
    // индекс этой родительской строки будет parent.iniRow+parent.nBlRows-1
    var isProp=true;
    mBTP=parent.bType+'_'+bType;
    iRowBN=parseInt( basicNames.mindBTP[mBTP],10);
    sO=setters.getSpecsObj(parent.bType,bType);
    // adds st-object for for
    //                      - new separate property or
    //                     - not previously described collection or
    //                     - block template jbject(?)
    var btTemplateObj=(parent[bType+'Template'])?parent[bType+'Template']:undefined;
    var bName=(sO.name)?sO.name:bType+'Collection';
    
    parent=setters.addMembTo(parent,'',bType,btTemplateObj,bName);
        
    newBl=parent[bType];
    
    //  newBl.bid=bType, newBl.bType=bType  newBl.uid=parent.uid+'_'+newBl.bid
    newBl.parentBid=parent.bid;
    newBl.parentUid=parent.uid;
    newBl.iniColName=sO.iniColName;
    
    // calculates stValueO and inserts data of newBl into t.data
    stVO=setStValueO(newBl);
    newBl.iniRow=stVO.iniRow;
    newBl.nBlRows=parseInt(stVO.iLastInsertedRow,10)-parseInt(stVO.iniRow,10)+1;
    if(stVO.paramValue){
      if(stVO.param){
        newBl[stVO.param]=stVO.paramValue;
      }
    }
    newBl.stValueO=stVO;
    newBl.stValue=stVO.stValue;
    newBl.legend=sO.legend;
    t.data=stVO.tData;
    //то, на сколько "удлиннился" parent-Block, - это фактически длинна суммарного массива insert
    nExtraLines=parseInt(stVO.iLastInsertedRow,10)-iPrntPrevRow;
    // коррекция всех прородителей в зависимости от полного числа добавленных строк внутри 
    if(nExtraLines>0){
      setters.parentsLengthCorrection(newBl,nExtraLines);                   
    }    
  }
  return newBl;
};
/** instanciates Setters object for spreadsheet, including
*   t-object 
* @param {Object}parent - parent sprShts setters-object of parent spreadsheets Collection
* @param {string}ssIdOpt - optional. id of spreadsheet. By default the Glossary 
*                         spreadsheet is taken
* @return {Object} returns st-object for the spreadsheet
 */
sprShts.initSprSht=function(parent,ssIdOpt){
  var bType='sprSht';
  var ssId=ssIdOpt||PEleColm.glossary.ssId;
  
  parent=setters.addMembTo(parent,'sprSht');
  var sprSht=parent[ parent.bids[ parent.bids.length-1]];  // new sprSht object
  
  // --- non basic bProps setting
  var ss=SpreadsheetApp.openById(ssId);
  var ssName=ss.getName();
  var url=ss.getUrl();
  var sheets=ss.getSheets();
  var nSheets=sheets.length;
  var shNames=[];
  var shtsMembs=[];    // means number of elements described in each sheet
  for(var ish in sheets){
    shNames.push( sheets[ish].getName());
    shtsMembs.push( sheets[ish].getLastRow()-1);  // preliminary should be overdetermined later taking into account real sheet details
  }
  sprSht=setters.addPropTo(sprSht,'ssId',ssId,'spreadsheetId');
  sprSht=setters.addPropTo(sprSht,'ss',ss,'googleSpreadsheetObject');
  sprSht=setters.addPropTo(sprSht,'url',url,'urlOfSpreadsheet');
  sprSht=setters.addPropTo(sprSht,'sheets',sheets,'spreadsheetSheetsCollection');
  sprSht=setters.addPropTo(sprSht,'nSheets',nSheets,'numberOfSheetsInSpreadsheet');
  sprSht=setters.addPropTo(sprSht,'shtsMembs',shtsMembs,'nOfMembersTypicallyRowsBellowHeaderForSheets');                 
  sprSht=setters.addPropTo(sprSht,'shNames',shNames,'sheetsNames');
  sprSht=setters.addPropTo(sprSht,'shtsIds',[],'sheetsIdsInUrls');
  sprSht=setters.addPropTo(sprSht,'dNew',[],'sheetsIdsInUrls');

  var dNew=sprSht.dNew;                      // newly formating data greed for setters sheet
  /**
  * t-object 
  * is used to create setters Template 
  * and to create real Setters from settersTemplate and information 
  * got from actual spreadsheet and it's sheets
  * It will progarammatically assemble Setters prototype for ss.
  * After assembling it will be compared with existing one (if any) and
  * will make appropriate changes and comparings
  // t-object bProps
  */  
  var stSprShColName='sprShSetters';
  var stShColName='shSetters';
  if((!sprSht.t)||(sprSht.t==null)||(sprSht.t===undefined)){
    sprSht=setters.addMembTo(sprSht,'','t',setters.getSettersTemplate(sprSht,stSprShColName,stShColName),'tObject');
  }
  var t=sprSht.t; 
  var shJs=handle.jObj(sprSht.shNames);
  var hasSetters=(shJs.Setters)?true:false; 
  var ts=(hasSetters)?t.s:t.s.copyTo(sprSht.ss).setName('Setters');
  t.s=ts;  
  // --- basic bProps setting
  sprSht.iniColName='sprShSetters';
  sprSht.iniRow=t.getBlockIniRow(sprSht,stSprShColName,'blockLines');
  sprSht.stValue=JSON.stringify(t.setStValue(sprSht,parseInt(sprSht.iniRow,10),sprSht.iniColName,'blockLines'));
  sprSht.iBlRow=0;
  // spreadsheet blocks' Groups.
  // Setters Sheet consists of different blocks of information representing
  // data, data groupping and selection(selectors). Such blocks could be
  // combined in groups. 
  // For example info regarding spreadsheet could contain spreadsheet's blocks( ssBls) 
  // as an example block of actual spreadsheet ssBl, and block of info of its origin(source) ssOrig
  // Blocks of info of sheets - shsBls, consisting of block for each sheet shBl,
  // Sheet's block contains block for columns, column's of rows or cells, or/and it's formatting
  // multiple ssBlocks (for ocasion)
  
  sprSht=setters.addMembTo(sprSht,'blsGrps');
  var blsGrps=sprSht[ sprSht.bids[ sprSht.bids.length-1]];  // new blsGrps object
  // --- basic bProps setting
  blsGrps.iniColName='sprShSetters';
  blsGrps.iniRow=t.getBlockIniRow(blsGrps,stSprShColName,'blockLines'); 
  blsGrps.stValue=JSON.stringify(t.setStValue(blsGrps,parseInt(blsGrps.iniRow,10),blsGrps.iniColName,'blockLines'));
  blsGrps.iBlRow=0;
  
  // spreadsheet part of blocks// multiple ssBlocks for occasion
  blsGrps=setters.addMembTo(blsGrps,'ssBls');
  var ssBls=blsGrps[ blsGrps.bids[ blsGrps.bids.length-1]];  // new ssBls object
  ssBls.iniColName='sprShSetters';
  ssBls.iniRow=t.getBlockIniRow(ssBls,stSprShColName,'blockLines'); 
  ssBls.stValue=JSON.stringify(t.setStValue(ssBls,parseInt(ssBls.iniRow,10),ssBls.iniColName,'blockLines'));
  ssBls.iBlRow=0;
  
  // creates and save ssBlTemplate
  if((!ssBls.ssCombBlTemplate)||(ssBls.ssCombBlTemplate==null)||(ssBls.ssCombBlTemplate===undefined)){
    ssBls=setters.addMembTo(ssBls,'','ssCombBlTemplate',sprShts.getSsCombBlTemplate(t),'ssCombBlockTemplate');
  }  
  // -- creates ssCombBlock to ssBls group
  ssBls=setters.addMembTo(ssBls,'','addCombBlock',setters.addCombBlock,'functionCreateSsCombBlock');
  var ssCombBl=ssBls.addCombBlock(ssBls,t);
  ssCombBl.iniColName='sprShSettres';
  
  if( (!ssBls.origsBlsTemplate)||(ssBls.origsBlsTemplate==null)||(ssBls.origsBlsTemplate===undefined)){
    ssBls=setters.addMembTo(ssBls,'','origsBlsTemplate',setters.getBlockTemplate(t,'origsBls'),'originsBlocksTemplate');
    ssBls=setters.addMembTo(ssBls,'','origBlTemplate',setters.getBlockTemplate(t,'origBl','originBlockTemplate'));
    ssBls=setters.addMembTo(ssBls,'','docsBlsTemplate',setters.getBlockTemplate(t,'docsBls','documentationsBlocksTemplate'));
    ssBls=setters.addMembTo(ssBls,'','docBlTemplate',setters.getBlockTemplate(t,'docBl','documentBlockTemplate'));
    ssBls=setters.addMembTo(ssBls,'','spreadsheetTemplate',setters.getBlockTemplate(t,'spreadsheetBlocksTemplate'));
    ssBls=setters.addMembTo(ssBls,'','ssBlTemplate',setters.getBlockTemplate(t,'ssBlTemplate'));
  }
  // sheets Blocks    ------------------------------------------    
  var shsBls={
    bid:'shsBls',
    name:'sheetBlocks',
    nBlocks:0,
    blsNames:[],
    bids:[],
    bls:[],
    shBlTemplate:{},
    // methods
    getShBlock:function(ish){
      return shBls['shBl'+ish];
    },
    /** 
    * returns all sheets blocks for specified spreadsheet
    * @param {string}ssId - id of spreadsheet
    * @return {Object} object of sheets blocks collection
    */
    getShBlocksById:function(ssId){
      return shsBls[ssId];
    }
  };
  
  shsBls.shBlT=sprShts.createShBlTemplate(sprSht);  
  //  typical Sheet Block  shBl  ---  
  sprShts.GetSheetsBlocks();
return sprSht;
};

function testInitSetters1(){
  //switches
  var bnDFromProtos,bnDFromTemplates,bnDFromProtosOrTemplatesProtos,templatesFromBND;
  // from bnD to Templates  
  if(false){
    templatesFromBND=setters.basicNames.getTemplatesFromBNData();
  }
  
  // get Protos
  var protos=setters.basicNames.protos;
  
  // from Protos to Templates
  var templatesFromProtos=setters.basicNames.getTemplatesFromProtos(protos);
  bnDFromTemplates=setters.basicNames.getBNDataFromTemplates(templatesFromProtos,'modify');
  if(true){
  return;
  }
  if(false){
    bnDFromTemplates=setters.basicNames.getBNDataFromTemplates(templatesFromBND,'modify');
    
    // from Protos to bnD  
    bnDFromProtos=setters.basicNames.getBNDataFromProtos(protos,'modify');
  }
  if(false){
  bnDFromProtosOrTemplatesProtos=setters.basicNames.getBNDataFromTemplatesOrProtos(protos,'modify');
  bnDFromProtos=setters.basicNames.getBNDataFromProtos(protos,'new');
  bnDFromProtosOrTemplatesProtos=setters.basicNames.getBNDataFromTemplatesOrProtos(protos,'new');
  }
  
  
  // from Templates to bnD
  
  var bnDFromTemplatesOrProtosTemplates=setters.basicNames.getBNDataFromTemplatesOrProtos(templatesFromBND,'new');
  Logger.log('fin');
  if(true){
  return;
  }
  sprShts.initSprSht( sprShts,"18oDYBCvfTbXKxp8xFi0zc5VB-Uu3Nb_PgSGJPOn3-Os"); 
}
/**
* tests colsBls block creation
*/
function testColsBlsMake(){
  
  var shBl={
    ssId:'',
    shName:'',
    s:SpreadsheetApp.openById(shBl.ssId).getSheetByName(shBl.shName)
  };
  var colsBlsO=setters.getColumnsBlocks(shBl);
  
}