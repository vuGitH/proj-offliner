//<script id="BildService">
var d = window.document;
var b = d.body;
/**
 * Object Bild (Block Bilder). Is Used to create( bild) block of html elements
 * with hierarchy, separate elements etc
 */
//var Bild={};
var Bild = {
  /** 
   * Servises names(types)
   */
  servTypes: ['FragmentServ', 'BlockServ', 'GroupServ', 'ElServ'],
  /**
   * Sets root of Bild object. By defaul it's global window.document
   * @param{object}wDoc - window document object
   */
  setRoot: function (wDoc) {
    var doc = wDoc || window.document;
    if (doc.nodeName == 'IFRAME') {
      doc = wDoc.contentWindow || wDoc.contentDocument;
      if (doc.document) {
        doc = doc.document;
      }
    }
    return doc;
  },
  root: undefined,
  docName: "",
  docUrl: "",
  eventTypes: [
    'click',
    'mouseenter',
    'mouseleave',
    'mousedown',
    'mouseup',
    'mouseover',
    'mouseout',
    'mousemove',
    'focus',
    'blur',
    'resize',
    'edit',
    'change',
    'load'
  ],
  addEventType: function (evType) {
    Bild.eventTypes.push(evType);
    return Bild.eventTypes.length;
  },
  removeEventType: function (evType) {
    var ind = indexOf(Bild.eventTypes, evType);
    if (ind !== -1) {
      Bild.eventTypes.splice(ind, 1);
    }
    return Bild.eventTypes.length;
  }
  /** 
   * Object of collection of document fragments
   */
  FragmentServ: {
    fragms: [],
    fragmNames: [],
    /**
     * Creates new doc fragment wich is DocumentFragment object.
     * Includes it in dFrags collection and sets properties and metohds
     * @param{string}frgName - name of fragment
     * @return{object} DocumentFragment object
     */
    setFragment: function (frgName) {
      Bild.FragmentServ[frgName] = {};
      var fragm = Bild.FragmentServ[frgName];
      Bild.FragmentServ.fragmNames.push(frgName);
      Bild.FragmentServ.fragms.push(fragm);
      fragm.name = frgName;
      var root = Bild.setRoot();
      fragm.DFObj = root.createDocumentFragment();
      /**
       * implants fragment into root document body
       * @param {object htmlElement} parentOpt - object of parent element to
       *   which DocumentFragment appended to or inserted before
       *   if id undefined it's considered to be document.body of root document
       * @param {object htmlElement} beforeElOpt - optional, if is set it's
       *   an element before which the fragment is inserted to
       */
      fragm.implantIn = function (parentOpt, beforeElOpt) {
        var d = Bild.setRoot();
        var parent = parentOpt || d.body;
        var fr = fragm.DFObj;
        if (!beforeElOpt) {
          parent.appendChild(fr);
        } else {
          parent.insertBefore(fr, beforeElOpt);
        }
      };
      return fragm;
    },
    getFragm: function (frgName) {
      return Bild.FragmentServ[frgName];
    },
    /**
     * returns name of fragment object
     * @param {object DocumentFragment} fragm - ducument fragment in consideration
     * @return {string} fragment name
     */
    getFragmName: function (fragm) {
      if (Bild.FragmentServ.fragms.indexOf(fragm)) {
        var ind = Bild.FragmentServ.fragms.indexOf(fragm);
        return Bild.FragmentServ.fragmNames[i];
      } else {
        for (var obNm in Bild.FragmentServ) {
          var frObj = Bild.FragmentServ[obNm];
          if (frObj.obj === fragm) {
            return frObj.name;
          }
        }
      }
    }
  },
  BlockServ: {
    blNames: [],
    // id could be generated while save block info on drive
    blIds: [],
    /**
     * Creates new empty block of elements and sets it name
     * @param {string} blockName - name of new block(ID)
     * @param {string} belIdsOpt - 
     * @param {string} belTypesOpt
     * @param {string} belParentsOpt
     * @param {string} belsAttsOpt
     */
    createBlock: function (blockName,
      belIdsOpt,
      belTypesOpt,
      belParentsOpt,
      belsAttsOpt) {
      var entityType = 'BlockServ';
      // id could be generated while save block info on drive
      var newId = Bild.generateEntityId(enType, blockName);
      Bild.BlockServ.blNames.push(blockName);
      Bild.BlockServ[blockName] = {};
      if (newId !== undefined) {
        Bild.BlockServ.blIds.push(newId);
      } else {
        Bild.BlockServ.blIds.push(blockName);
      }
      var bbs = Bild.BlockServ[blockName];
      bbs.name = blockName;
      bbs.belIds = [];
      bbs.belTypes = [];
      bbs.belParents = [];
      bbs.belsAtts = {};
      /**
       * Fills empty block by belements data of wich are transformed by arrays
       *  and atts-object
       * @param{Array.<string>} belIds Ids of Bild-elements
       * @param{Array.<string>} belTypes types of elements forming block 
       *   ('DIV', 'SCRIPT', ...)
       * @param{Array.<string>} belParents parents of block's elements
       * @param{Array.<objects>} }belsAtts - atts objects for each bel as 
       *   object property ( for el with id = belIds[i] atts = belsAtts[belIds[i]]
       * All arrays has equal length
       */
      bbs.setBels = function (belIds, belTypes, belParents, belsAtts) {
        var d = Bild.setRoot();
        var ln = ((belIds) && (belIds.length)) ? belIds.length : undefined;
        if (ln) {
          for (var i = 0; i < ln; i++) {
            bbs.belIds.push(belIds[i]);
            bbs.belTypes.push(belTypes[i]);
            bbs.belParents.push(belParents[i]);
            if (belsAtts) {
              var atts = (belsAtts[belIds[i]]) ? belsAtts[belIds[i]] : {
                id: (belTypes[i] != 'BR') ?
                  belIds[i] : 'br' + d.getElementsByTagName('BR').length
              };
            }
            bbs.belsAtts[belIds[i]] = atts;
            bbs[belIds[i]] = Bild.ElServ.newEl(belTypes[i], atts, belParents[i]);
          }
        }
        return bbs;
      };
      if ((belIdsOpt) && belIdsOpt.length > 0) {
        bbs.setBels(belIdsOpt, belTypesOpt, belParentsOpt, belsAttsOpt);
      }
      return bbs;
    },
    /**
     * Forms array of bels of the block's elements
     * @param {string} blockName - block's name
     * @param {Array.<strings>} belIds - 1d array of elements' ids
     * @param {Array.<strings>} belTypes 1dArray of elements types ('DIV','BR',...)
     * @param {Array.<strings>} belParentIds - array of parents' ids
     * @param {object} belAtts - object of block elements' attributes
     * @return {object} object of bilt-elements objects ( of elements' bel-objects)
     */
    fillBelsInBlock: function (blockName,
      belIds,
      belTypes,
      belParentIds,
      belAttsOpt) {
      var ind = (Bild.BlockServ.blockNames.indexOf(blockName)) ?
        Bild.BlockServ.blockNames.indexOf(blockName) :
        indexOf(Bild.BlockServ.blockNames, blockNames);
      if (ind < 0) {
        Bild.BlockServ.createBlock(blockName);
      }
      var bb = Bild.BlockServ[blockName];
      var d = Bild.setRoot();
      bb.setBels(belIds, belTypes, belParentIds, belAttsOpt);
      return bb;
    },
    /**
     * Asigns arrays of properties for the block
     */
    addBelsToBlock: function (blockName,
      addingBelIds,
      addingBelTypes,
      addingBelParents,
      addingBelsAtts) {
      var ind = (Bild.BlockServ.blockNames.indexOf(blockName)) ?
        Bild.BlockServ.blockNames.indexOf(blockName) :
        indexOf(Bild.BlockServ.blockNames, blockNames);
      if (ind < 0) {
        var bb = Bild.BlockServ.createBlock(blockName, addingBelIds,
          addingBelTypes, addingBelParents, addingBelsAtts);
      } else {
        var bb = Bild.BlockServ[blockName];
        var ln = bb.belIds[blockName].length;
        if ((addingBelIds) && addingBelIds.length > 0) {
          bb.setBels(addingBelIds,
            addingBelTypes, addingBelParents, addingBelsAtts);
        }
      }
      return bb;
    },
    /** 
     * Adds belement(element) to named block
     * @param {string} blockName - unick name of block
     * @param {string} belId - id of element or id of bel (bilt element)
     *   belId = id
     * @param {string} type - type of added element
     * @param {object} parent - object of parent element
     * @param {object} atts - attributes object for bel(bild-element)
     * @return {object} bild-element object bilt
     */
    addBelToBlock: function (blockName, belId, type, parent, atts) {
      var bb = Bild.BlockServ[blockName];
      bb.belIds.push(belId);
      bb.belTypes.push(type);
      bb.belParents.push(parent)
      bb.belsAtts[belId] = atts;
      bb[belId].setAtts(atts);
      bb.addBelsToBlock(blockName, [belId], [type], [parent], {
        belId: atts
      });
      return bb[belId];
    }
  },
  /**
    * GroupService works with groups of elements of bildElements( bels). 
    * 
  GroupServ:{
    groups:{},
    grNames:[]
    
  },
  /** Object Elements Service
   */
  ElServ: {
    els: [],
    ids: [],
    /**
     * creates html element, sets parent, inserts in appropriate place
     * @param {string} type - nodeName of created element
     * @param {object} atts - attributes 'object of named pairs 
     *   - attributeName : attributevalue
     *   atts.id = el.id , 
     *   atts.style=e"...style  data..",
     *   atts.name=name, 
     *   atts.clas='class1 class2...'
     *   !- id attribute is obligatory( or strictely recommened), if it is not
     *   set it's set, it's set to 'bildEl_n' where 
     *   n=Bild.ElServ.els.length (index of new element),
     *   after attributing element to specified fragment this id would be
     *   exchanged by id='fragmEl_n'
     *   if atts is not defined the element object is created
     *   without attributes excluding id.
     * @param {object HtmlElement} parentOpt - object of parent element.
     *   Optional. By defalut it's document.body( Bild.root.body)
     * @param {object HtmlElement} beforeElOpt - object of html element 
     *   before which new element should be inserted
     */
    newEl: function (type, attsOpt, parentOpt, beforeElOpt) {
      var d = Bild.setRoot();
      var el = d.createElement(type);
      var parent = parentOpt || d.body;
      if (!beforeElOpt) {
        parent.appendChild(el);
      } else {
        parent.insertBefore(el, beforeElOpt);
      }
      var atts = attsOpt || {
        id: undefined
      };
      if (type == 'BR') {
        id = 'br_' + (d.getElementsByTagName('BR').length - 1);
      }
      var id = atts.id;
      id = !id ? 'bildEl_' + Bild.ElServ.els.length : id;
      el.id = id;
      Bild.ElServ.ids.push(id);
      Bild.ElServ.els.push(el);
      Bild.ElServ[id] = {};
      var bel = Bild.ElServ[id];
      bel.el = el;
      bel.id = id;
      bel.atts = atts;
      /** 
       * Sets parent of the elelement
       * @param {object} parent - html element asigned to be parent
       *   of Bild element
       * @return{object}
       */
      bel.setParent = function (parent) {
        var chld = bel.el;
        var prnt = chld.parentElement;
        if (prnt !== null) {
          prnt.removeChild(chld);
          parent.appendChild(chld);
        }
      };
      if (type != 'BR') {
        bel.attNames = [];
        bel.attVals = [];
        /**
         * Sets attributes to elelement
         * @param{object}atts - object of attributes {attName:attValue}
         */
        bel.setAtts = function (atts) {

          var belType = bel.el.nodeName;
          for (var attName in atts) {
            bel.attNames.push(attName);
            bel.attVals.push(atts[attName]);
            switch (attName) {
              /* -- class ------------------------ */
              case 'class':
                var cls = atts['class'];
                if (el.classList) {
                  if (cls != '') {
                    el.classList.add(cls);
                  }
                } else if (el.className) {
                  if (cls != '') {
                    if (el.className.length > 0 && /\s*\w/.test(el.className)) {
                      el.className += " " + cls;
                    } else {
                      el.className = cls;
                    }
                  }
                } else {
                  el.setAttribute('class', cls);
                }
                break;
                /* -- style ------------------------ */
              case 'style':
                el.style.cssText = atts.style;
                break;
                /* -- name --------------------------- */
              case 'name':
                switch (belType) {
                  case 'FORM':
                    el.name = atts.name;
                    break;
                  case 'INPUT':
                    el.name = atts.name;
                    break;
                  case 'TEXTAREA':
                    el.name = atts.name;
                    break;
                  default:
                    el.setAttribute('name', atts.name);
                }
                break;
                /* --  innerHTML ---------------------*/
              case 'innerHTML':
                switch (belType) {
                  case 'SCRIPT':
                  case 'STYLE':
                    el.appendChild(d.createTextNode(atts.innerHTML));
                    break;
                  default:
                    el.innerHTML = atts.innerHTML;
                }
                break;
              default:
                /* --- events --------------------------*/
                if (indexOf(Bild.eventTypes, attName) !== parseInt(-1)) {
                  addEvent(attName, el, bel.atts[attName]);
                }
                /* -- other --------------------------- */
                // auto setting values of 'name' and 'class' attributes equal to 'id'
                if (belType != 'SCRIPT' && belType != 'LINK' && belType != 'STYLE') {
                  if (indexOf(bel.attNames, 'name') < 0) {
                    el.setAttribute('name', id);
                  }
                  if (indexOf(bel.attNames, 'class') < 0) {
                    el.setAttribute('class', id);
                  }
                }
                for (var anm in bel.atts) {
                  if (anm != 'class' &&
                    anm != 'style' &&
                    anm != 'name' &&
                    anm != 'id' && anm != 'innerHTML') {
                    el.setAttribute(anm, bel.atts[anm]);
                  }
                }
            }
          }
        };
        bel.setAtts(atts);
        /**
         * bel event Handlers object
         * { all: { evType0: [ handl0.toString(),handl1.toString(),handl2...]},
         *        { evType1: [ handl0Str,handl1Str,handl2Str...]},
         *          ...
         *        { evTypeN: [ handl0]}
         *   }
         */
        bel.handlers = {
          all: {}
        };
        bel.addEvent = function (eventType, handler) {
          if (indexOf(Bild.eventTypes, eventType) === (-1)) {
            alert('incorrect event type - ' + eventType);
            console.log('incorrect event type - ' + eventType);
            return;
          }
          addEvent(eventType, bel.el, handler);
          if (bel.handlers.all[eventType]) {
            bel.handlers.all[eventType].push(handler);
          } else {
            bel.handlers.all[eventType] = [];
            var evHandls = bel.handlers.all[eventType];
            evHandls.push(handler);
          }
        };
        bel.removeEvent = function (eventType, handler) {
          removeEvent(eventType, bel.el, handler);
          var evHandls = bel.handlers.all[eventType];
          evHandls.splice(indexOf(evHandls, handler), 1);
        };
      }
      return bel;
    },
    setElStyle: function (id, stlString) {
      var ind = indexOf(Bild.ElServ.ids, id);
      Bild.ElServ[id].el.setAttribute('style', stlString);
      Bild.ElServ[id].atts.style = stlString;
    },
    getElStyle: function (id) {
      return Bild.ElServ[id].atts.style;
    }
  }
};
Bild.root = Bild.setRoot();
// Elements 
/* --- MAILER panel created by means of Bild.ElServ.newEl ---*/
// Bilder of Elements(BE). 
var BE = Bild.ElServ;
// root
var d = Bild.setRoot(); //window.document
// Document Fragment for Mailer
var frMailer = Bild.FragmentServ.setFragment('frMailer');


// Object of All elements' attributes
var fm = frMailer.AllElems = {};
/*--external stylesheet google Fonts --*/
// <link id="head_link0" href='https://fonts.googleapis.com/css?family=' +
//  'Roboto|Open+Sans|Roboto+Condensed|Merriweather|Arimo&subset=latin,cyrillic'' +
//  ' rel='stylesheet' type='text/css'>
fm.linkGFont = {
  type: 'LINK',
  parent: d.head,
  atts: {
    id: 'linkGFont',
    href: href = 'https://fonts.googleapis.com/css?family=' +
      'Roboto|Open+Sans|Roboto+Condensed|Merriweather|Arimo' +
      '&subset=latin,cyrillic',
    rel: 'stylesheet',
    type: 'text/css'
  }
};
var o = fm.linkGFont;
BE.newEl(o.type, o.atts, o.parent);

/*-- mailer Panel --*/
//fm.mlPan={type:'DIV',parent:frMailer.DFObj,
fm.mlPan = {
  type: 'DIV',
  parent: d.body,
  atts: {
    id: 'mlPan',
    style: "width:95%;height:80%;min-width:300px;" +
      "min-height:200px,padding:10px;border:solid 1px #ccc;" +
      "background-color:whitesmoke;border-radius:30px;" +
      "box-shadow:0px 4px 8px #aaa;position:relative;",
    class: 'mlPan'
  }
};
var o = fm.mlPan;
var mlPan = BE.newEl(o.type, o.atts, o.parent).el;
// Fields
/* Any field are drawn as pair: lable : field.
 * Each - Lable and Field is included in pad-div-element.
 * any pad is inline-block, so that in the case of narrow screen
 * lable and fiels place in different lines
 * one after another. While space is enough:   
 * Right edge of lables pads are aligned. Left edge of 
 * fields' pads are aligned
 * So. after Each pair <br> should be placed.
 * elements identifiers: 
 * [elm] -  ids
 * [prnt] - ids of parent elements
 */
var contEl = 'frmPan';
var elm = ['frmPan', 'mlForm', 'padLN1', 'labN1', 'padIN1', 'inpN1', 'br',
  'padLN2', 'labN2', 'padIN2', 'inpN2', 'br',
  'padLN3', 'labN3', 'padIN3', 'inpN3', 'br',
  'padLFrom', 'labFrom', 'padSelFrom', 'selFrom', 'br',
  'padLTo', 'labTo', 'padITo', 'inpTo', 'br',
  'padLSubj', 'labSubj', 'padISubj', 'inpSubj', 'br',
  'padLAlarm', 'labAlarm', 'padAlarm', 'alarm', 'br',
  'padLMess', 'labMess', 'br', 'padTArMess', 'tArMess',
  'panButts', 'buttPreview', 'buttSend'
];
var type = ['DIV', 'FORM', 'DIV', 'SPAN', 'DIV', 'INPUT', 'BR',
  'DIV', 'SPAN', 'DIV', 'INPUT', 'BR',
  'DIV', 'SPAN', 'DIV', 'INPUT', 'BR',
  'DIV', 'SPAN', 'DIV', 'SELECT', 'BR',
  'DIV', 'SPAN', 'DIV', 'INPUT', 'BR',
  'DIV', 'SPAN', 'DIV', 'INPUT', 'BR',
  'DIV', 'SPAN', 'DIV', 'DIV', 'BR',
  'DIV', 'SPAN', 'BR', 'DIV', 'TEXTAREA',
  'DIV', 'BUTTON', 'BUTTON'
];
var innT = ['', '', '',
  'First Name:', '', '', '', '',
  'Surname:', '', '', '', '',
  'Family Name:', '', '', '', '',
  'From:', '', '', '', '',
  'To:', '', '', '', '',
  'Subject:', '', '', '', '',
  'Внимание!', '', '', '', '',
  'Message:', '', '', '', '',
  'Preview', 'Send'
];
var prnt = ['mlPan', contEl, contEl,
  'padLN1', contEl,
  'padIN1', contEl, contEl,
  'padLN2', contEl,
  'padIN2', contEl, contEl,
  'padLN3', contEl,
  'padIN3', contEl, contEl,
  'padLFrom', contEl,
  'padSelFrom', contEl, contEl,
  'padLTo', contEl,
  'padITo', contEl, contEl,
  'padLSubj', contEl,
  'padISubj', contEl, contEl,
  'padLAlarm', contEl,
  'padAlarm', contEl, contEl,
  'padLMess', contEl, contEl,
  'padTArMess', contEl,
  'panButts', 'panButts'
];
/**
 * Gets block data from server.
 * possible modes:
 * 1) js-code Library link and init-handler name
 * 2) html-code string
 * 3) self opening script
 *
 
var getBlockData=function(){
  var getBlockRunner=google.script.run.
              .withSuccessHandler()
              .withFailureHandler()
              .withUserElement();
  var blockName='frmPan';
  getBlockRunner.getBlock(blockName);
*/

/**
 * Creates elements of fragment without attributes data on the basis of of
 * arrays  elm,type,innT,prnt
 * @return {object} object of bilt-elements of elements from frmPan including it selr
 */
var initBlockOfElements = function () {
  var elsObjs = {};
  for (var i = 0; i < elm.length; i++) {
    elsObjs[elm[i]] = BE.newEl(type[i], {
        id: ((elm[i] != 'br') ? elm[i] : '')
      },
      Bild.root.getElementById(prnt[i]));
  }
  return elsObjs;
};
// Object of bel-objects of elements filling frmPan including it.
var formBels = initBlockOfElements();
// settign styles and attributes of block elements
/*-- form panel --*/
formBels.frmPan.atts = {
  id: 'frmPan',
  style: "width:95%;height:80%;min-width:300px;min-width:200px;" +
    "position:relative;padding:10px;border:solid 1px #afa;" +
    "background-color:whitesmoke;border-radius:30px;" +
    "box-shadow:0px 4px 8px #aaa;" +
    "margin-top:5px;margin-left:auto;margin-right:auto;"
};
/*-- mailer Form --*/
formBels.mlForm.atts = {
  id: 'mlForm',
  style: "width:100%;height:100%;display:none;"
};
/* -- Name block --*/

// creates new <style> in head and places class 'lable' there

var headChilds = d.head.children;
var nStyle = 0;
for (var iel in headChilds) {
  if (headChilds[iel].tagName == 'STYLE') {
    nStyle++;
  }
}
var style0 = BE.newEl('STYLE', {
  id: 'head_stl' + nStyle
}, d.head).el;
// CSS cLASSES 
var classes = "" +
  ".lable-pad{min-width:150px;min-height:20px;padding:2px;text-align:right;" +
  "display:inline-block;margin-right:10px;background-color:#fff;}" +
  ".lable{width:100%;height:100%;text-align:right;font-size:14px;" +
  "font-family:Arial,sans-serif;color:#666;display:inline-block;}" +
  ".inp-pad{min-width:300px;min-height:20px;margin-left:10px;" +
  "text-align:left;display:inline-block;background-color:wheat;}" +
  ".inp-txt{width:100%;height:100%;color:#444;font-family:Arial,sans-serif;" +
  "text-align:left;background-color:white;border:solid 0px #aaa;}" +
  ".tar-messpad{min-width:350px;min-height:200px;width:90%;overflow:visible;" +
  "margin:10px auto;padding:15px;border-radius:14px;text-align:left;" +
  "display:block;background-color:#FFECB8;}" +
  ".tar-mess{width:100%;min-height:180px;color:#444;" +
  "font-family:Arial,sans-serif;text-align:left;background-color:white;" +
  "border:solid 0px #aaa;border-radius:6px;margin:0 auto;}" +
  ".button{color:#044;font-size:12px;font-family:Arial,san-serif;" +
  "background-color:#fff;" +
  "width:60px;height:22px;text-align:center;border:solid 2px #5cafaf;" +
  "border-radius:10px;" +
  "margin:4px;padding:0px;}" +
  ".alarm,#alarm{width:100%;min-height:20px;color:red;" +
  "font-family:Arial,sans-serif;text-align:center;background-color:#ffa;" +
  "border:double 3px red;border-radius:6px;}" +
  ".alarm-pad{min-width:150px;min-height:20px;width:70%;margin-left:20px;" +
  "display:inline-block;background-color:white;text-align:left;}" +
  ".lable-alarm{width:100%;height:100%;text-align:right;font-size:14px;" +
  "font-family:Arial,sans-serif;color:#f00;display:inline-block;}";
//css classes:
style0.appendChild(d.createTextNode(classes));

// --- inputs 
var suffs = ['N1', 'N2', 'N3', 'From', 'To', 'Subj'];
/**
 * Fills a line of form consisted of lable inside pad and input inside pad
 * using suffix of elements' ids suffs
 *@param{string}suff - suffices of elements' ids 
 */
var fillLine = function (suff) {
  var prefx1 = (suff != 'From') ? 'I' : 'Sel';
  var prefx2 = (suff != 'From') ? 'inp' : 'sel';
  var sizePar = (suff != 'From') ? '26' : '1';
  /* -- lable pad -- */
  formBels['padL' + suff].atts = {
    id: 'padL' + suff,
    class: 'lable-pad'
  };
  formBels['lab' + suff].atts = {
    id: 'lab' + suff,
    class: 'lable',
    innerHTML: innT[indexOf(elm, 'lab' + suff)]
  };
  /* -- input pad -- */
  formBels['pad' + prefx1 + suff].atts = {
    id: 'pad' + prefx1 + suff,
    class: 'inp-pad'
  };
  formBels[prefx2 + suff].atts = {
    id: prefx2 + suff,
    class: 'inp-txt',
    required: true,
    form: 'mlForm',
    size: sizePar,
    onfocus: "return function(){" +
      "document.getElementById('" + prefx2 +
      suff + "').style.backgroundColor='#FFA261';" +
      "document.getElementById('" + prefx2 +
      suff + "').style.borderWidth='2px';}()",
    onblur: "return function(){" +
      "document.getElementById('" + prefx2 + suff +
      "').style.backgroundColor='#FFE59A';" +
      "document.getElementById('" + prefx2 + suff +
      "').style.borderWidth='0px';}()"
  };
};
// -- filling in
for (var il = 0; il < suffs.length; il++) {
  fillLine(suffs[il]);
}
// -- alarm --
var padLAlarm = formBels.padLAlarm;
var labAlarm = formBels.labAlarm;
var padAlarm = formBels.padAlarm;
var alarm = formBels.alarm;

padLAlarm.atts = {
  id: 'padLAlarm',
  class: 'lable-pad',
  style: 'display:none;'
};
labAlarm.atts = {
  id: 'labAlarm',
  class: 'lable-alarm',
  innerHTML: innT[indexOf(elm, 'labAlarm')]
};
padAlarm.atts = {
  id: 'alarm-pad',
  class: 'inp-pad',
  style: 'display:none;'
};
alarm.atts = {
  id: 'alarm',
  class: 'alarm'
};

// -- e-mail "from"
var selFrom = formBels.selFrom;
giveMeEMails(selFrom.el);

formBels.padLMess.atts = {
  id: 'padLMess',
  class: 'lable-pad',
};
formBels.labMess.atts = {
  id: 'labMess',
  class: 'lable',
  innerHTML: innT[indexOf(elm, 'labMess')]
};
formBels.padTArMess.atts = {
  id: 'padTArMess',
  class: 'tar-messpad'
};
formBels.tArMess.atts = {
  id: 'tArMess',
  class: 'tar-mess',
  required: true,
  maxLength: '3000',
  form: 'mlForm',
  placeholder: 'Write your greate thoughts here...',
  onfocus: "return function(){" +
    "document.getElementById('tArMess').style.backgroundColor='##FFA261';" +
    "document.getElementById('tArMess').style.borderWidth='1px';}()",
  onblur: "return function(){" +
    "document.getElementById('tArMess').style.backgroundColor='#eea';" +
    "document.getElementById('tArMess').style.borderWidth='1px';}()"
};
/* -- buttons  -- */
formBels.panButts.atts = {
  id: 'panButts',
  style: "position:relative;display:block;widhth:90%;text-align:center;" +
    "min-height:30px;background-color:white;"
};
formBels.buttPreview.atts = {
  id: 'buttPreview',
  class: 'button',
  onclick: "return function(){" +
    "alert('preView');" +
    "google.script.run.sendMailToMe(" +
    "'preView',document.getElementById('tArMess').value)}()",
  innerHTML: innT[indexOf(elm, 'buttPreview')]
};


formBels.buttSend.atts = {
  id: 'buttSend',
  class: 'button',
  onclick: "return function(){" +
    "alert('send');" +
    "google.script.run.sendMailToMe(" +
    "'mail',document.getElementById('tArMess').value)}()",
  innerHTML: innT[indexOf(elm, 'buttSend')]
};



// setting attributes for formBels
for (var belId in formBels) {
  if (belId != 'br') {
    formBels[belId].setAtts(formBels[belId].atts);
  }
}
// Appends document Fragment object to document.body
frMailer.implantIn(d.body);
/** Sends request to server for user email(from) value
 * @param {object} selFrom - html element object of <select> 
 * tag for arrays of user e-mails
 */
function giveMeEMails(selFrom) {
  console.log('inside giveMeEMail');
  var getEMailRunner = google.script.run
    .withSuccessHandler(getMyEMail)
    .withFailureHandler(handleError)
    .withUserObject(selFrom);
  getEMailRunner.getUserEMail('me');
}
/** Sends request to server for user email(from) value
 * @param{object e-mails[]}emailsGot - user e-mail
 * @return{string e-mail} if any returns user's e mail
 *      Used as success handler as well
 */
function getMyEMail(emailsGot, selFrom) {
  console.log('inside getMyEMail');
  if (selFrom) {
    for (var iel = 0; iel < emailsGot.length; iel++) {
      var opt = document.createElement('OPTION');
      opt.id = 'selFrom_opt' + iel;
      opt.value = emailsGot[iel];
      opt.innerHTML = emailsGot[iel];
      selFrom.appendChild(opt);
    }
  } else {
    document.getElementById('alarm').innerHTML =
      "incorrect <select> From email-element set";
  }
  return emailsGot;
}
/**
 * communication erro Handler
 * @param{object}error - error object
 * @param{object html element}elOpt - user object set (if any)
 */
function handleError(error, elOpt) {
  if (elOpt) {
    elOpt.innerHTML = 'error from getMyEMail: ' + error.message;
  } else {
    document.getElementById('alarm').innerHTML = 'error from getMyEMail: ' +
      error.message;
    alert('error from getMyEMail: ' + error.message);
  }
}
/**
 * Sends email with data inputed in mail form
 * @param{object form}formEl - dom document form element object
 */
function sendEmail(formEl) {
  var sendEMailRunner = google.script.run
    .withSuccessHandler()
    .withFailureHandler()
    .withUserObject();
  sendEMailRunner.sendEMailFormed(formEl);
}
//</script>