var PEleCom={};
var Pel=PEleCom;
Pel.im="PEleCom";
Pel.oTemplate=function(im){
  return {
    im:im,
    number:0,
    names:[],
    groups:[],
    add:function(a,b){
      this[a]=b;
      return this[a];
    },
    addABC:function(a,b,c){
      this[a]={};
      this[a][b]=c;
      return this[a];
    }
  };
};
// - handle
PEleCom.handle={};


// - input
Pel.inpData={};
var Inp=Pel.inpData;
Inp.im='inpData';
Inp.sets={};
Inp.sets.number=0;
Inp.sets.names=[];
Inp.sets.groups=[];
var sets=Inp.sets;
sets.im='sets';
/** adds property a to rootObject vith value b */
sets.add=function(a,b){
  this[a]=b;
  return this[a];
};
sets.addABC=function(a,b,c){
  this[a]={};
  this[a][b]=c;
  return this[a];
};
/**
* sets index of each group's row(later)
*/
sets.ind={};
sets.ind.add=function(a,b){
  sets.ind[a]=b;
  return sets.ind[a];
};
sets.ind.addABC=function(a,b,c){
  sets.ind[a]={};
  sets.ind[a][b]=c;
  return sets.ind[a];
};

// - output
PEleCom.output={};
PEleCom.output.dataGroups={};

var output=PEleCom.output;
output.im='output';
var grps=output.dataGroups;
grps.im='dataGroups';

grps.number=0;
grps.names=[];
grps.groups=[];
/** adds property a to rootObject vith value b */
grps.add=function(a,b){
  grps[a]=b;
};
grps.addABC=function(a,b,c){
  grps[a]={};
  grps[a][b]=c;
  return grps[a];
};
grps.ind={};
/**
* ind-object sets row index of each group's row(later)
*/
grps.ind.add=function(a,b){
  grps.ind[a]=b;
  return grps.ind[a];
};
grps.ind.addABC=function(a,b,c){
  grps.ind[a]={};
  grps.ind[a][b]=c;
  return grps.ind[a];
};
/**
* creates object for goup named <label> and adds this group to root object
* @param {string}label - name of group indicated in glossary's 'label' column 
* @param {Object}rootObjOpt - root object to wich new member group is added
*   for ex. PEleCom.output.dataGroups or PEleCom.inpData.sets
* @return {Object} group's object
*/
PEleCom.addGroup=function(label,rootObjOpt){
  var grps=rootObjOpt||PEleCom.output.dataGroups;
  grps[label]={label:label};  
  var gr=grps[label];
  grps.groups=((grps.groups)&&(Array.isArray(grps.groups)))?grps.groups:[];  
  grps.groups.push(gr);
  // Sets properties of a group object  
  gr.properties={
    number:1,
    names:['label'],
    values:[label],
    /**
    * forms arrays of properties and values
    * @param {string}key - name/label of property
    * @param {string}value - string of value(s). While value might
    * has few values they pass through comas
    */
    add:function(key,value){
      gr.properties.number++;
      gr.properties.names.push(key);
      gr.properties.values.push(value);
      gr[key]=value;
    }
  };
  /**
  * forms arrays of properties and values
  * @param {string}key - name of property
  * @param {string}value - string of value(s). While value might has few values they pass through comas
  */
  gr.add=function(key,value){
    gr[key]=value;
    gr.properties.number++;
    gr.properties.names.push(key);
    gr.properties.values.push(value);
  };
  /** 
  * returns parameter value. If parameter is a set of multiple values in csv-format
  * (values separated by comas)
  * or few versions of parameter are rendered so
  * the last one should be taken unless  the rest
  * parameters of the methods are not indicated
  * @param {string}paramName - selector name(name of glossary column)
  * @param {Integer}indOpt - index - the serial number beginning with 0 of coma separated 
  *    parameters values beginning with left one.(The first left has number 0).Optional
  * @param {string}p2NameOpt - optional second parameter( parmeterName coinsides with glossary column name)
  *    which permits specify index value of primary parameter. 
  *    It is used when to specify index of parameter in the list is easier by selecting
  *    some other parameter param2)
  * @param {String|}p2ValueOpt - value of second parameter to determin it's index which is considered as 
  *    beingh  equal to idex of primary parameter to chose it
  * @return {string} value of parameter or ''
  */
  gr.getParamValue=function(paramName,indOpt,p2NameOpt,p2ValueOpt){
    var parStr=gr[paramName]; var values;
    if( (!(parStr)&&(parStr!==0))||(parStr=='')){
      return '';
    }
    if(/[,]/.test(parStr)){
      values=parStr.split(',');
    }else{
      return parStr;
    }
    if((indOpt)&&(typeof indOpt==='number')){
      return values[indOpt];
    }
    var ind=values.length-1;
    if(((p2NameOpt)&&(gr[p2NameOpt]))&&(p2ValueOpt)){
      var par2Str=gr[p2NameOpt];
      var p2Values=(/[,]/.test(par2Str))?par2Str.split(','):[par2Str];
      ind=( p2Values.indexOf(p2ValueOpt)>=0  )? p2Values.indexOf(p2ValueOpt):ind;
    }
    return values[ind];
  }; 
  return grps;
};
/**
* creates object for collections of objects named - name 
* and adds this family to root object
* @param {string}name - name of group
* @param {Object}rootObjOpt - root object to which new member group is added
*   Optional. Default is PEleCom
* @param {Objdect}donorOpt - an object being the donor of 
*    new family's member properties.
* @return {Object} family object
*/
PEleCom.addFamily=function(name,rootObjOpt,donorOpt){
  var donor=donorOpt||false;
  var root=rootObjOpt||PEleCom;
  root[name]=(donor)?PEleCom.handle.cloneObj(donor):{};  
  var fam=root[name];
  
  root.families=((root.families)&&(Array.isArray(root.families)))?root.families:[];  
  root.families.push(fam);
  
  // Sets properties of a group object  
  fam.properties={
    number:0,
    names:[],
    values:[],
    /**
    * forms arrays of properties and values
    * @param {string}key - label of property(name)
    * @param {string}value - string of value(s). While value might
    * has few values they pass through comas
    */
    add:function(key,value){
      this.number++;
      this.names.push(key);
      this.values.push(value);
    }
  };
  fam.number=0;
  fam.names=[];
  /**
  * forms arrays of properties and values
  * @param {string}key - label of property(name)
  * @param {string}value - string of value(s). While value might has few values they pass through comas
  */
  fam.add=function(key,value){
    this.number++;
    this.names.push(key);
    this[key]=value;
    return this[key];
  };
  fam.addABC=function(a,b,c){
    this[a]={};
    this[a][b]=c;
    return this[a];
  };
  fam.ind={};
  /**
  * ind-object sets row index of each group's row(later)
  */
  var ind=fam.ind;
  ind.add=function(a,b){
    this[a]=b;
  };
  ind.addABC=function(a,b,c){
    this[a]={};
    this[a][b]=c;
    return this[a];
  };
  fam.im=name;
  return fam;
};
/**
* tests this in family object methods
*/
function testFam(){
  var don={
    p1:'p1',
    f:function(){return "I'm a funciton";},
    o1:{op:'op',arr:[1,3]}
  };
  var pel=PEleCom;
  var fm=pel.addFamily('newFamily',pel,don);
  for(var p in fm){
    Logger.log("fm."+p+" is "+typeof fm[p]);
  }
  var fun=fm.add("neMethAdd",function(str){return str;});
  var ff=fun("new method acts");
  Logger.log(ff);
  Logger.log('fin of test');
  
}