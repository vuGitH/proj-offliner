// --- MULTI - Object. Multi incdices. Gets quantative destribution of repeattance of 
//     parameter( or characteristics) values.
handle.multiIndex={
  markUpParams:{
    backgrounds:{label:'bgColor',defaultValue:'#ffffff',getSet:function(dR){return dR.getBackgrounds();}},
    fontColors:{label:'fontColor',defaultValue:'#000000',getSet:function(dR){return dR.getFontColors();}},
    fontLines:{label:'fontLine',defaultValue:'none',getSet:function(dR){return dR.getFontLines();}},
    fontWeights:{label:'fontWeight',defaultValue:'normal',getSet:function(dR){return dR.getFontWeights();}},
    fontStyles:{label:'fontStyle',defaultValue:'normal',getSet:function(dR){return dR.getFontStyles();}},
    values:{label:'value',defaultVal:'',getSet:function(dR){return dR.getValues();}}
  },
  // presumably the most popular values which could exclude from selection
  // which are not displaied in sheets rendering
  mUDefaults:{
    bgColor:'#ffffff',
    fontColor:'#000000',
    fontLine:'#none',
    fontStyle:'normal',
    fontweight:'normal',
    values:''
  },
  /**
  * Initiate Multi index object instance.Equivalent to new ObjInstance()
  * @param{(String}miIdOpt - multiIndex identifier
  * @param{(Variable|String)}vOpt - identifier of value-indices - object which will accumulate
  *    unique instances of unique values of analizing entity (optional); defaul is 'v'
  * @param{(Variable|String)}rOpt - identifier of repeatances-index object which will accumulate
  *    repeating values' analizing entity (Optional); default is 'r'
  * @param{(Variable|String)}nOpt - identifier of numbers-index object which will accumulate
  *     resulting total ammounts of each unic values of analizing entity (Optional) default is 'n'
  * @param{(Variable|String)}lOpt - label string used in header of grid table
  * @return{Object} instance of multi index object
  */
  init:function(miIdOpt,vOpt,rOpt,nOpt,lOpt){
    var mId=miIdOpt||'multi';
    var par=[vOpt,rOpt,nOpt,lOpt];
    var def=['v','r','n','l'];
    
    handle.multiIndex[mId]={};
    var miO=handle.multiIndex[mId];
    for(var i=0;i<def.length;i++){
      var lbl=(par[i])?par[i]:def[i];
      miO[ def[i] ]=(def[i]=='l')?'':{};
    }
    miO.csv={};
    miO.header=[];
    miO.grid=[];    
    /**
    * adds instance to index and accumulates repittances in separate property array
    * @param{}a - variable which value should be new property Name of multiIndex
    * @param{}b - new multiIndex instance value
    * @return{Object} - multiIndex object
    */
    miO.add=function(a,b){    
      if(a){        
        if(miO[a]){
          miO.r[a].push(b);        
        }else{
          miO[a]=b;
          //miO.v[a]=b;
          miO.v[a]=a;
          miO.r[a]=[b];
        }
      }
    };
    /**
    * Excludes Dominant.The same as add(a,b) but will not accumulate the most popular value 
    * of analizing entity (for test needs or to save time)
    * @param{}a - variable which value should be new property Name of multiIndex
    * @param{}b - new multiIndex instance value
    * @param{}d - dominant value wich is excluded from selection to decrease time and space
    *            ( for ex. if a - bacground d='#ffffff', a - fontColor d='#000000', see 
    *                 handle.multiIndex.markUpDefaults
    * @return{Object} - multiIndex object
    */
    miO.adD=function(a,b,d){    
      if((a)&&(a!=d)){
        if(miO[a]){
          miO.r[a].push(b);
        }else{
          miO[a]=b;
          miO.v[a]=a;
          miO.r[a]=[b];
        }
      }
    };
    /**
    * Returns object containid miO.r replica where each miO.r[v]=String of coma separated 
    * values of miO.r.vi array
    * @ param{Object String}  - if    'i10'=miO.v.v1  i20= miO.v.v2 ...
    *                                 miO.r[v1]=[i10,i11,i13, ...];
    *                                 miO.csv.v1='i10,i11,i12,...';
    */
    miO.getCsvs=function(){
      var o={};
      var r=miO.r;
      for(var ir in r){
        o[ir]=r[ir].toString();
      }
      miO.csv=o;
      return o;
    };
    /**
    * Returns object of summary amounts separated values of analizing entity
    * @ param{Object String}
    */
    miO.getNs=function(){
      var o={};
      var r=miO.r;
      for(var ir in r){
        o[ir]=r[ir].length;
      }
      miO.n=o;
      return o;
    };
    miO.getHeader=function(){
      var line=[];var lbl=(miO.l)?(miO.l+":"):("");
      var vs=miO.v;
      for(var iv in vs){
        line.push(lbl+vs[iv]);
      }
      miO.header=line;
      return line;
    };
    /**
    * @param{string}l - label string used in header of grid table
    */
    miO.setLabel=function(label){
      miO.l=label; 
    };
    /**
    * @param{Boolean}whithHeader - if true (default) the grid of values is rendered with header
    * @return{Array String[[]]} 2d-array of values
    */
    miO.getGrid=function(typeOpt,withHeader){
      var o={};
      var types=handle.multiIndex.markUpDefaults; 
      var type=typeOpt||'backgrounds';
      var revsDef=types[type].defaultValue;
      var withH=withHeader||true;
      var rs=miO.r;
      var v=miO.v;
      var header=miO.getHeader();
      var grid=[];
      var revers=[];
      var rmax=0;
      var ris={};
      for( var ir in rs ){
        ris[ir]=handle.jObj(rs[ir]);
        var ln= rs[ir].length;
        rmax=( ln>rmax)?ln:rmax;
      }
      for( var irow=0;irow<rmax;irow++){
        var row=[];
        var rowRevs=[];
        for( var icl in v){ 
          row.push( (rs[icl][irow])?rs[icl][irow]:'' );
          rowRevs.push((rs[icl][irow])?icl:revsDef);
        }
        grid.push(row);
        revers.push(rowRevs);
      }
      grid=(withH)?[header].concat(grid):grid;
      var revH=[];
      for(var ih in header){
        revH.push(revsDef);
      }
      revers=(withH)?[revH].concat(revers):revers;
      o.main=grid;
      o.revers=revers;
      miO.grid=o;
      return o;
    };
    return miO;
  }
};
/**
* Tests MultiInex
*/
function testMultiIndex(){
  var run={
    probes:[
      {
        inpSet:'our',
        range:'our!пост обзвон',
        selector:'bgColor'
      }
    ]
  };
  var minds=[];var prob;
  for(var ip in run.probes){
    prob=run.probes[ip];
    handle.setAnalysingGroups( new RegExp(prob.inpSet),PEleCom.inpData.sets);
    var our=PEleCom.inpData.sets[prob.inpSet];
    var ourJ={};
    ourJ=our.dataJ;
    var bgs=our.dataMarkUp [prob.selector];
    
    var mind=handle.multiIndex.init('bgColor');
    for(var i in bgs ){
      var cn=prob.range.slice(prob.range.search('!')+1);
      mind.adD( bgs[i][ ourJ[cn] ] ,i,'#ffffff');
    }
    minds.push(mind);
  }
  // results presentation
  for(var ipp in run.probes){
    
    //  spreadsheets
    var lbl='multiIndexTest';
    var tM=Utilities.formatDate(new Date(),'GMT+03:00','ddMMYY_HHmmss');
    
    var ssr=SpreadsheetApp.create('run_'+lbl+'_'+prob.selector+'_вариации'+tM);
    var s=ssr.insertSheet('summary_'+tM,0);
    var ssId=ssr.getId();
    var folder=DriveApp.getFolderById(ID_FLD_RESULTS);
    if( ssr.getSheetByName('Sheet1') ) {
    ssr.deleteSheet( ssr.getSheetByName('Sheet1'));
    }
    DriveApp.getFolderById(ID_FLD_RESULTS).addFile(DriveApp.getFileById(ssId));
    DriveApp.getRootFolder().removeFile(DriveApp.getFileById(ssId));
    // Glossary Registration
    var outputGrParameters={
    label:lbl,
    isInData:prob.inpSet,
    range:prob.range,
    essType:'data',
    pCreator:Session.getActiveUser().getEmail(),
    pFirstDate:new Date(),
    dataSrcType:'GOOGLE SHEETS',
    dataSrcTMark:tM,
    dataSrcId:ssId,
    dataShName:'summary_'+tM,
    dataShHeadInd:0,
    parentFolderId:ID_FLD_RESULTS
    };
    Glossary.addLines(outputGrParameters);
    // layout arrays preparation and sheets population
    
    var longStrings=false;
    if(longStrings){
	presentOutpuLongStrings(s,minds[ipp]);}else{ presentOutpuSetRows(s,minds[ipp]);}
  }
  Logger.log('fint');
}

function presentOutpuLongStrings(s,mind){
  var res=[];
  var resBg=[];
  var rmax=0;
  
  for( var ir in mind.repeat ){
    var ln= mind.repeat[ir].length;
    rmax=( ln>rmax)?ln:rmax;
  }
  
  for( var im in mind){
    // long strings
    if( typeof mind[im] !=='function'){
      if( typeof mind[im] ==='string' ){
        res.push([ 1, mind[im] ]);
        resBg.push([im,im]);
      }else{
        var repeat=mind.repeat;
        for(var ii in repeat){
          if(Array.isArray(repeat[ii])){res.push([ repeat[ii].length, repeat[ii].toString() ]);}else{res.push(['!!','Error!!']);}
          if(Array.isArray(repeat[ii])){resBg.push([ ii,ii ]);}else{res.push(['!!','Error!!']);}
        }
      }
    }
  }
  res=[['количество','индексы строк']].concat(res);
  resBg=[['#fff','#fff']].concat(resBg);
  s.getRange(1,1,res.length,res[0].length).setValues(res);
  s.getRange(1,1,res.length,res[0].length).setBackgrounds(resBg);
}

function presentOutpuSetRows(s,mind){
  var res=[];
  var resBg=[];
  mind.setLabel('фон');
  var grid=mind.getGrid();
  res=grid.main;
  resBg=grid.revers;
  
  Logger.log('end of Test');
  s.getRange(1,1,res.length,res[0].length).setValues(res);
  s.getRange(1,1,res.length,res[0].length).setBackgrounds(resBg);
} 
function tesGetNs(mind){
  var ns=mind.getNs();
  var str='';
  for(var iv in mind.v){
    str+=ns[mind.v[iv]]+',';
  }
  var strRes=str.replace(/[,]$/,'');
  return {nsObj:ns,nsSt:strRes};
}