//================ OUTPUT ===========================
/**
* Separate sheet or spreadsheet is created for each ouptput groups 
* Output spreadsheet(s) files are placed into folder smsCik_Results
* Separate folder for each handle-run named tMark is created inside results folder
* where output spreadsheets are created with name:
* `${outputGroupName}_${tMark}` (multiple result-spreadsheets mode)
* or in the case of 'single spreadsheet for all'- mode
* which is set by .oneSsForAllMode===true appropriate sheet is created
* for each ouput group with name in format'dataGroupName_tMark' per group
*/
var outputO = {
  number: 0,
  timeMark: tMark,
  // global parameter tMark -time mark used in actual calc
  /** our and smsCik data sets description (for old version) */
  smsCikInpShName: smsCikListName,
  smsCikInpSSId: ID_SMSCIK220916,
  ourDataSSName: '',
  ourDataSSID: ID_SS1909,
  ourDataSheetName: ourListName1909,
  //
  oneSsForAllMode: true,
  legendName: 'legend',
  legendDocId: '',
  legendPartLength: undefined,
  resultsFolderId: ID_FLD_RESULTS, // global constant
  // run Specification. Sets calculation procedure details
  runSpecs: {
    /** run specific parameters determine calculation option and setting*/
    nSpecs: 2, // number of speicifications
    specIds: [
      'unMist',
      'useSmsSite'
    ],
    // run specification attributes
    specs: {
      unMist: {
        use: true, // whether to use/apply or not this run specification feature
        id: 'unMist',
        note: 'Mistchenko data discarded',
        noteRu: 'Без данных Мищенко',
        shNameRunSpecPart: '_БезМищенко_'
      },
      useSmsSite: {
        use: true,
        id: 'useSmsSite',
        note: 'smsCik data from site are used',
        noteRu: 'Используются данные с сайта sms-cik.org',
        shNameRunSpecPart: '_SmsCikDataFromSite_',
        shHeader: [],
        telColName: 'nabludatel',
        telCol: '',
        /**
        * Returns sheet object of smsSite data
        * @param {string}id - id of spreadsheet whith sms-site data
        * @param {string}shName - sheet name
        * @return {Sheet} sheet with sms site's data
        */
        ini: function (id, shName) {
          var ss = SpreadsheetApp.openById(id);
          PEleCom.output.smsCikInpSSId = ss.getId();
          PEleCom.output.smsCikInpShName = shName;
          var useSmsSite = PEleCom.output.runSpecs.specs.useSmsSite;
          var s = ss.getSheetByName(shName);
          useSmsSite.shHeader = s.getDataRange().getValues()[0];
          useSmsSite.telCol = getColNumb(useSmsSite.shHeader, useSmsSite.telColName);
          useSmsSite.id = id;
          return s;
        }
      }
    },
    //
    shNamesRunSpecsPart: '',
    /**
    * constructs output spreadsheet's name part containing
    * different handle specification details. By Default includes all
    * specsIds have been set in object output.runSpecs or uses specsIdsOpt optional
    * parameter
    * @param {Array string[]}specsIdsOpt - array of run specifications ids
    * @return {string} string describing calculating procedure specifications used
    *   in run
    */
    getShNamesRunSpecsPart: function (specsIdsOpt) {
      var runSpecsO = PEleCom.output.runSpecs.specs;
      var str = '';
      var specIds = specsIdsOpt || PEleCom.output.runSpecs.specIds;
      for (var irs=0;irs<specIds.length;irs++) {
        str += runSpecsO[specIds[irs]].use ? runSpecsO[specIds[irs]].shNameRunSpecPart : '';
      }
      return str;
    },
    /**
    * adds new specification object for run
    * @param {string}specId - specification identifyer
    * @param {Object}specProperties - object of property of new run specification
    *   spec object properties excluding .id and obligatoryly containing:
    * @expample
    *   specProperties={
    *      id:{string}'spec identifyer',
    *      use:{Boolean}(true|false),  // is it used in actual run
    *      note:{string}'description',
    *      noteRu:{string local}'описание...по-русски...',
    *      shNameRunSpecPart:{string}'descriptive part of shName explaining current run spec...',
    *      "and others depending of spec":{}
    *    };
    * @return {Object}spec object which could be used as one of property-object of
    *        output.runSpecs.specs object: as property -
    *        spec=output.runSpecs.specs[spec.id]
    */
    addRunSpec: function (specId, specProperties) {
      PEleCom.output.runSpecs.nSpecs++;
      PEleCom.output.runSpecs.specIds.push(specId);
      PEleCom.output.runSpecs.specs[specId] = {};
      var spec = PEleCom.output.runSpecs[specId];
      spec.id = specId;
      for (var ipar in specProperties) {
        var par = specProperties[ipar];
        if (typeof par === 'function') {
          spec[ipar] = par;
        } else {
          spec[ipar] = JSON.parse(JSON.stringify(par)); //?
        }
      }
      return spec;
    }
  },
  /** @property */
  grpsSsNames: [],
  /**
  * is used while separate spreadsheet for each output data set is used (not actual)
  * Initial version treatment. Is equivalent ot mode 'eachAlone' (see bellow)
  * Sets names of output spreadsheets each per every output data set determined
  * by Output.dataGroups object
  * @param {string}tMark_opt - time mark.Optional
  * @return {Object string[]} array of ouput groups spreadsheets' names
  */
  makeGrpsSsNames: function (tMark_opt) {
    var tM = tMark_opt || PEleCom.output.timeMark;
    var sets = PEleCom.inpData.sets;
    var runSpecs = PEleCom.output.runSpecs;
    var inpNames = sets.names;
    var inpStr = inpNames.join('-');
    var ssNames = [],ssName;
    var shNamesRunSpecsPart = runSpecs.shNamesRunSpecsPart;
    for (var iss = 0; iss < output.dataGroups.names.length; iss++) {
      ssName = 
        'RunFor_inputSets_' +
          inpStr +
            '_runSpecs_' +
              shNamesRunSpecsPart +
                '_outputGr_' +
                  output.dataGroups.names[iss] + '_' + tM;
      ssNames.push(ssName);
    }
    PEleCom.output.grpsSsNames = ssNames;
    return ssNames;
  },
  /** actual array of sheets' names of output groups data */
  grpsSheetsNames: [],
  /**
  * Creates array of sheets' names of output groups data
  * @param {string}tMark_opt time mark. Optional. Defaul output.timeMark
  * @return {Array string[]} array of names in format: <outGroupName>_<timeMark>
  *   <..> - placeholder
  */
  makeGrpsSheetsNames: function (tMark_opt) {
    var timeMark = tMark_opt || PEleCom.output.timeMark;
    var tM = timeMark ? timeMark : tMark;
    // tMark - global parameter set in vuScripts.gs file
    var shNames = [];
    for (var ish = 0; ish < output.dataGroups.names.length; ish++) {
      var grName = output.dataGroups.names[ish];
      shNames.push(grName + '_' + tM);
    }
    PEleCom.output.grpsSheetsNames = shNames;
    return shNames;
  },
  grpsSprSheets: [],
  grpsSprSheetsIds: [],
  /**
  * creates and fills in Setters sheet using SettersTemplate
  * Sets Setters object for output data group.
  * @param {Spreadsheet}ssOut - output spreadsheet
  * @return {Sheet} setters sheet object
  */
  initSettersSheet: function (ssOut) {
    var glossId=PEleCom.inpData.sets.glossary.dataSrcId;
    var sSt = SpreadsheetApp.openById(glossId).
    getSheetByName('SettersTemplate').
    copyTo(ssOut).setName('Setters');
    // ----------------  !!!!!!!!!!!!!  --------------------
    // Place to connect with new SETTERS-Object engine to make
    // initial filling of setters sheet
    // related with this particulart output set spreadsheet
    return sSt;
  },
  /**
  * Forms array will be used to form handling Run Legend
  * "What?-content description" column
  * @return {Arrray string[]} - array of strings
  */
  getLegendWhatColumn: function () {
    var tM = PEleCom.output.timeMark;
    var sets = PEleCom.inpData.sets;
    var grps = output.dataGroups;
    var runSpecs = PEleCom.output.runSpecs;
    var inpNames = sets.names;
    var inpStr = inpNames.join('-');
    var shNamesRunSpecsPart = runSpecs.shNamesRunSpecsPart;
    var length = output.dataGroups.names.length;
    var grpsNames = output.dataGroups.names||[];
    var grpsNamesJoint=(
      function(grpsNames){
        return (Array.isArray(grpsNames))?
          (function () {
            var jointNames = '';
            for (var i = 0; i < grpsNames.length; i++) {
              jointNames += i != 0 ? '-' + grpsNames[i] : grpsNames[i];
            }
            return jointNames;
          }()):'';
      }(grpsNames));
    
    var vs = [
      'Результаты обработки данных смсЦик:',
      'RunFor_inputSets:' +
      inpStr +
      '_runSpecs_' +
      shNamesRunSpecsPart +
      '_outputGroups:' +
      grpsNamesJoint + '_timeMark:' + tM,
      '',
      'Имя файла результатов: '
    ];
    for (var is = 0; is < inpNames.length; is++) {
      var set = sets[inpNames[is]];
      vs.push('Имя файла входного набора данных:'+
              SpreadsheetApp.openById( set.dataSrcId ).getName());
      vs.push('Имя листа входного набора данных:'+set.dataShName);
    }
    vs.concat([
      '',
      '',
      'Результаты.',
      'Множества, группы контактов'
    ]);
    var sNms = grps.names;
    // output groups' names array
    for (var iNm=0;iNm<sNms.length;iNm++) {
      var sNm = sNms[iNm];
      var gr = grps[sNm];
      vs.push(gr.definition);
    }
    var column = [];
    for (var i = 0; i < vs.length; i++) {
      column.push([vs[i]]);
    }
    PEleCom.output.legendPartLength = vs.length;
    //4+(inpNames.length*2)+4; // final vs.length = 4+ (inpNames.length*2)+4+sNms.length
    return column;
  },
  /**
  * Initiates Legend sheet
  * @param {Spreadsheet}ssOut - output spreadsheet object
  * @param {string}legendName
  * @param {string}tM
  * @return {Sheet} object
  */
  initLegendSheet: function (ssOut, legendName, tM) {
    var legNm = legendName + '_' + tM || PEleCom.output.legendName + '_' + tM;
    var sLegnd = ssOut.insertSheet(legNm, 0);
    var whatColumnArr = outputO.getLegendWhatColumn();
    sLegnd.getRange(1, 2, whatColumnArr.length).setValues(whatColumnArr);
    // Legend filling. input data sets description part begining
    sLegnd.getRange('C3:e3').setValue([[
        ssOut.getName(),
        '',
        'ссылки(url):'
      ]]);
    // output file Name
    return sLegnd;
  },
  /**
  * checks if folder named tM (timeMark)  exists in root folder
  *    (resultFolder smsCik_Results)
  * @param {string}tM - searching folder name (timeMark)
  * @param {string}rootId
  * @return {string|Boolean} false if folder does not exist or folder Id
  */
  tMFolderExistence: function (tM, rootId) {
	var root = DriveApp.getFolderById(rootId);
	var folders = root.getFolders();
	while (folders.hasNext()) {
	  var folder = folders.next();
	  if (folder.getName() == tM) {
		return folder.getId();
	  }
	}
	return false;
  },
  /**
  * Creates and returns array of output spreadsheets' objects
  * and creates appropriate sheets for each output group
  * One separate spreadsheet per each output dataGroup data set
  * Creating spreadsheets are written into results folder named 'timeMark'
  * @param {Object}sheetsHeadersObj_opt - 'sheets headers' object
  *   containing properties named as sheetNames for each sheet. 
  *   Each such prperty is object itself with two props {ind,head}
  *   {...,sheetName:{ind: headerRowIndex, head:header1dArray }
  *   head - determines header's row array values and 
  *   ind - header's row index for each sheet.
  *   if sheetHeaderObj is not determned for some sheet the .proto
  *   property object sample is used by default
  *   If necessary  the header of sheet could be changed later/
  * @param {string}tMark_opt - time makrk used for naming run output results.
  *   Optional. Default is Output.timeMark
  * @return {Object}
  */
  createOutGrpsSprSheets: function (sheetsHeadersObj_opt, tMark_opt) {
    var shHOs = sheetsHeadersObj_opt || {
      proto: {
        ind: 0,
        head: ['index']
      }
    };
    // sheets headers object
    var tM = tMark_opt || PEleCom.output.timeMark;
    // creates sheets and/or spreadsheets' names arrays
    var ssNames = PEleCom.output.makeGrpsSsNames(tM);
    var shNames = PEleCom.output.makeGrpsSheetsNames(tM);
    if (!ssNames) {
      try{
        Logger.log('output.grpsSsNames array is not set');
        throw('output.grpsSsNames array is not set');
      }
      catch(e){
        return false;
      }
    }
    var sss = [];
    var ssIds = [];
    var rootFolder = DriveApp.getFolderById(output.resultsFolderId);
    var ss,id,ssFile,tMr,tMFolderId,folder,s,shHInd,shHArr,shHO,shName;
    for (var iss=0;iss<ssNames.length;iss++) {
      ss = SpreadsheetApp.create(ssNames[iss]);
      sss.push(ss);
      id = ss.getId();
      ssIds.push(id);
      ssFile = DriveApp.getFileById(id);      
      tMr = ssNames[iss].match(/(\d{6}_\d{6}|\d{6})$/)[0];
      tMFolderId = PEleCom.output.tMFolderExistence(tMr, output.resultsFolderId);
      folder = tMFolderId ?
        DriveApp.getFolderById(tMFolderId) :
      rootFolder.createFolder(tMr);
      
      if (!tMFolderId) {
        folder.addFile(ssFile);
      }
      shName=shNames[iss];
      s = ss.insertSheet(shName, 0);
      shHO = shHOs[shName];
      //sets sheets header
      shHInd = shHO ? parseInt(shHO.ind, 10) : parseInt(shHOs.proto.ind, 10);
      shHArr = shHO ? shHO.head : shHOs.proto.head;
      s.getRange(shHInd+1, 1, 1, shHArr.length).setValues([shHArr]);
      // deletes Sheet1
      if (ss.getSheetByName('Sheet1')) {
        ss.deleteSheet(ss.getSheetByName('Sheet1'));
      }
      // Setters sheet
      PEleCom.output.initSettersSheet(ss);
      // registers new instance of our data set in glossary
      var outputGrParameters = {
        labels: [output.dataGroups.names[iss]],
        essType: 'data',
        pCreator: Session.getActiveUser().getEmail(),
        pFirstDate: new Date(),
        dataSrcType: 'GOOGLE SHEETS',
        dataSrcTMark: tMr,
        dataSrcId: id,
        dataShName: shName,
        dataShHeadInd: shHInd,
        parentFolderId: folder.getId()
      };
      Glossary.addLines(outputGrParameters);
    }
    PEleCom.output.grpsSprSheetsIds = ssIds;
    PEleCom.output.grpsSprSheets = sss;
    var o = {
      nSss: ssIds.length,
      ssIds: ssIds,
      sss: sss
    };
    return o;
  },
  /**
  * Returns existing folder object named as tM parameter value
  * or creates new one with such name if it's absent in Result
  * folder( smsCik_Result)
  * @param {string}tM - name of folder (time mark string not wraped by underscores)
  * @return {Folder} folder object
  */
  getResultFolder: function (tM) {
    // results folder
    var resFolderId = PEleCom.output.resultsFolderId;
    var resFolder = DriveApp.getFolderById(resFolderId);
    var folders = resFolder.getFolders();
    var isExistedFolder = false;
    var folderOut;
    while (folders.hasNext()) {
      var folder = folders.next();
      if (folder.getName() == tM) {
        return folder;
      }
    }
    //folder where spreadsheets are stored in
    var newfld = DriveApp.createFolder(tM);
    resFolder.addFolder(newfld);
    return newfld;
  },
  /**
  * adding selectors from donor
  * @param {string}grName group name
  * @param {Object}newGs - setterns object for setting new groups
  *   (regarding"setterns" see description in createSheetsForPatternsGroups method)
  * @param {Object}lPs - line parameters object using in Glossary.addLines(lPs)
  * @return {Object} line parameter object modified if any
  */
  addSelectorsIfAny: function (grName, newGS, lPs) {
    if (newGS.selectors && newGS.selectors[grName]) {
      var selectORS = newGS.selectors[grName];
      return PEleCom.handle.cloneObj(selectORS, lPs);
    } else {
      return lPs;
    }
  },  
  oneSsForAllName: '',
  oneSsForAllId: '',
  /**
  * sets single output spreadsheet for All or
  * gets it if spreadsheet with name outSSName(see below) already exists
  * (including sheets with all output data groups'data)
  * @param {string}timeMark - handle time mark string
  * @param {string}keyWords_opt - title for combined spreadsheet (oneForAll-mode)
  * @return -
  */
  setOneSpreadsheetForAll: function (timeMark, keyWords_opt) {
    var keyWs = keyWords_opt || '';
    var tM = timeMark || PEleCom.output.timeMark;
    var sets = PEleCom.inpData.sets;
    var output = PElecom.output;
    var glossary = sets.glossary;
    // title parts
    var inpNames = sets.names;
    var inpStr = inpNames.join('-');
    var runSpecs = PEleCom.output.runSpecs;
    var shNamesRunSpecsPart = runSpecs.getShNamesRunSpecsPart();
    runSpecs.shNamesRunSpecsPart = shNamesRunSpecsPart;
    var ssName = 'Run_inpSets_' + inpStr +
      '_runSpecs_' + shNamesRunSpecsPart +
        '_' + keyWs + 'OneForAll_' + tM;
    var ss = SpreadsheetApp.create(ssName);
    var ssId = ss.getId();
    PEleCom.output.oneSsForAllId = ssId;
    PEleCom.output.oneSsForAllName = ssName;
    var ssFile = DriveApp.getFileById(ssId);
    var folder = PEleCom.output.getResultFolder(tM);
    folder.addFile(ssFile);
    PEleCom.output.oneSsForAll = ss;
    // sheets' names
    var sNms = output.dataGroups.names;
    // Legend
    var sLegnd = PEleCom.output.initLegendSheet(ss, '', tM);
    // continues legend filling
    var partV = [];
    for (var iNm = 0; iNm < inpNames.length; iNm++) {
      var set = sets[inpNames[iNm]];
      var usrcId = new Unmask(set.dataSrcId);
      var setSrcId = usrcId.last();
      partV.push([
        SpreadsheetApp.openById(setSrcId).getName(),
        '',
        SpreadsheetApp.openById(setSrcId).getUrl()
      ]);
      var uShNm = new Unmask(set.dataShName);
      var setShNm = uShNm.last();
      partV.push([
        setShNm,
        '',
        ''
      ]);
    }
    // filling legend Block
    sLegnd.getRange('C4:E' + parseInt(4 + inpNames.length * 2 - 1, 10)).setValues(partV);
    // creates output groups sheets and registers new groups sheet in glossary
    for (var inm = 0; inm < sNms.length; inm++) {
      var shName = sNms[inm] + '_' + tM;
      var s = ss.insertSheet(shName);
      //  register sheet in Glossary
      var outputGrParameters = {
        label: sNms[inm],
        essType: 'data',
        pCreator: Session.getActiveUser().getEmail(),
        pFirstDate: new Date(),
        dataSrcType: 'GOOGLE SHEETS',
        dataSrcTMark: tM,
        dataSrcId: ssId,
        dataSrcUrl: ss.getUrl(),
        dataShName: shName,
        dataShHeadInd: 0,
        parentFolderId: folder.getId()
      };
      Glossary.addLines(outputGrParameters);
    }
    // init Setters-sheet
    var sSt = PEleCom.output.initSettersSheet(ss);
    // deletes Sheet1
    if (ss.getSheetByName('Sheet1') && ss.getSheets().length > 1) {
      ss.deleteSheet(ss.getSheetByName('Sheet1'));
    }
    return ss;
  },
  /**
  * Отбирает группы, уже определенные в глоссарии,
  * используя регулярные выражения или массивы регулярных выражений.
  * Проверяет, созданы ли для них таблицы и листы, если нет,-
  * создает таблицы и листы для новых групп.
  *
  * ( отнесение к "существующим" или "новым" происходит не на основании поиска в
  * Глоссарии, а по типу первого параметра( pattGrs ) в зависимости от того,
  * является ли он "пэттерном" или "сетерном" .
  * "пэттерн" - RegExp или массив RegExp-ов
  * "сеттерн" - объект, имеющий свойство .labels )
  *  в разных режимах(модах) modes:
  * а) oneSsForAll - одна таблица(spreadsheet) для всех групп
  * b) eachAlone - на каждую группу отдельная таблица и соответсвтующий лист
  * c) newBatch - "новый пакет" - отдельная вновь создаваемая таблица для
  *               групп,задаваемых pattGrs объектом
  *
  * Если группа не занесена в глоссарий (задается с помощью "сеттерна"),
  * то она регистрируется с помощью метода Glossary.addLines(params).
  * с последующим включением в output.dataGroups family с помощью
  * метода setAnalysingGroups(pattsOfNewGroups), 
  * где pattsOfNewGroups уже массив "пэттернов" RegExp
  *
  * Имена таблиц и листов состоят из имени выходного набора и временной метки.
  * 'RunFor_inputSets_'+inpStr+'_runSpecs_'+shNamesRunSpecsPart+'_outputGr_'+grLabel+'_'+tM;
  * Однако, если расчет происходит в режиме одна таблица на все группы, то для каждой группы
  * создаются отдельные листы(вкладки) с именами grName+'_'+timeMark
  * Каждая из вкладок считается главным листом таблицы набора входных данных данной группы,
  * указываемым в селекторе глоссария dataShName.
  * Имя единой таблицы:
  * 'RunFor_inputSets_'+inpStr+'_runSpecs_'+shNamesRunSpecsPart+'_oneForAll_'+keyWords+'_'+tM;
  * Если необходимо в название таблицы вставить дополнительные ключевые слова, они задаются через
  * параметр keyWords_opt
  *
  * Searches groups describing by patterns(RegExp) and  
  * if they have no appropriate spreadsheets or sheets
  * creates them ( spreadsheets and/or sheet) 
  * (for groups whose names complied with patterns)
  * depending on mode parameter:
  * 'eachAlone' - One separate spreadsheet with appropriate sheet per each output dataGroup
  * 'oneSsForAll' - default; single spreadsheet with separate sheets for
  *    all groups while in oneSsForAllMode==true
  * 'newBatch' - separate spreadsheet with sheets(sheet per a group)
  *  for groups determining by current pattGrs parameter
  *
  * Important! Before using this method glossary should already
  * have been included in inpData.sets (by means of setAnalysingGroups() ).
  * This method only creates sheets and makes changes in Glossary sheet but not
  * modifies output/input PEleCom structure objects ( use setAnalysingGroups for this)
  *  
  * @param {Array RegExps[]|Object }pattGrs - patterns of groups' names being selected
  *    or 'settern' -Object specifying new groups and their parameters
  * @param {string}keyWords_opt - name of new combined group (if necessary)
  *    for output results presumably presented as single common spreadsheet.
  *    If this paramenter is set, For this new group
  *    new line is created in glossary.
  * @param {string}tMark_opt - time makrk used for naming output run results.
  *   Optional. Default is Output.timeMark
  * @param {string}mode_opt - 'newBatch' or 'eachAlone' see description above
  *    sets mode of sheet creation independently of output.oneSsForAllMode
  *    even if oneSsForAllMode =true while mode=='newBatch' separate ss is
  *    created for batch of groups defined by pattGrs;
  *    as well as mode='eachAlone' for each group pair spreadsheet&sheet is created
  * @param {string}ssIdNewBatch_opt id of spreadsheet where sheets should be placed
  * @return {Array string[]} array of names of modified or new groups
  */
  createSheetsForPatternsGroups: function (pattGrs, keyWords_opt, tMark_opt, mode_opt, ssIdNewBatch_opt) {
    var keyWords = keyWords_opt || '';
    var mode = mode_opt || '';
    var newBatch = mode === 'newBatch' ? true : false;
    var eachAlone = mode === 'eachAlone' ? true : false;
    var ssIdNewBatch = ssIdNewBatch_opt || '';
    var tM = tMark_opt || PEleCom.output.timeMark;
    // -- glossary
    var glossary = PEleCom.inpData.sets.glossary;
    var d = glossary.data;
    var glossHeader = d[parseInt(glossary.dataShHeadInd, 10)];
    var js = handle.jObj(glossHeader);
    var jDSrcId = parseInt(js.dataSrcId, 10);
    var jDShName = parseInt(js.dataShName, 10);
    var jLbl = parseInt(js.label, 10);
    // -- output Groups object
    var output = PEleCom.output;
    // result folder
    var folder = output.getResultFolder(tM);
    // checks if pattGrs is patterns or "setterns"
    var chk = handle.checkGrExistence(pattGrs);
    if (!chk) {
      throw 'pattGrs is not set adequately!';
    }
	var groupsNames,newGS,newg,existed;
    if (/existed/.test(chk)) {
      return PEleCom.output.createSheetsForPatternsGroups_Existed(
        pattGrs, keyWords, tM, mode, ssIdNewBatch);
    } else if (/new/.test(chk)) {
      newg = true;
      // new groups (absent in Glossary) are handled
      newGS = pattGrs;
      groupsNames = newGS.labels;
    } else {
      throw 'pattGrs is set badly!';
    }
	var ss,ssId,ssName,shName,grName,sGr,lPs,inpGrpsNames,
	    inpStr,shNamesRunSpecsPart,pFolderId,ir;
    switch (mode) {
    case 'newBatch':
      // spreadsheet
      if (!ssIdNewBatch) {
        // creates new spreadsheet in which all new groups sheets will be input
        ssName = !keyWords ? 'allNewInOneSs_' + tM : keyWords + 'AllNewInOne' + tM;
        ss = SpreadsheetApp.create(ssName);
        ssId=ss.getId();
        folder.addFile(DriveApp.getFileById(ssId));
        pFolderId=folder.getId();
      } else {
        ss = SpreadsheetApp.openById(ssIdNewBatch);
        ssId = ssIdNewBatch;
        pFolderId=DriveApp.getFileById(ssId).getParents().next().getId();
      }
      // sheets
      for (var ig = 0; ig < groupsNames.length; ig++) {
        grName = groupsNames[ig];
        shName = grName + '_' + tM;
        ss.insertSheet(shName);
        // adds lines to Glossary sheet with group parameters        
        lPs = {
          label: grName,
          dataShName: shName,
          dataShHeadInd: 0,
          pCreator: Session.getActiveUser().getEmail(),
          pFirstDate: new Date(),
          dataSrcId: ssId,
          dataSrcType: 'GOOGLE_SHEETS',
          dataSrcTMark: tM,
          dataSrcUrl: ss.getUrl(),
          parentFolderId: pFolderId
        };
        // adds selectors if any
        lPs = PEleCom.output.addSelectorsIfAny(grName, newGS, lPs);
        Glossary.addLines(lPs);
      }
      break;
    case 'eachAlone':
      inpGrpsNames = PEleCom.inpData.sets.names;
      inpStr = inpGrpsNames.join('-');
      shNamesRunSpecsPart = PEleCom.output.runSpecs.getShNamesRunSpecsPart();
      for (var igr = 0; igr < groupsNames.length; igr++) {
        grName = groupsNames[igr];
        shName = grName + '_' + tM;
        // new spreadsheet for new groups
        // one spreadsheet and one sheet per each group
        ssName = 'RunFor_inputSets_' + inpStr +
          '_runSpecs_' + shNamesRunSpecsPart +
            '_outputGr_' + grName +
              '_' + keyWords + '_' + tM;
        ss = SpreadsheetApp.create(ssName);
        ssId = ss.getId();
        folder.addFile(DriveApp.getFileById(ssId));
        sGr = ss.insertSheet(shName);
        lPs = {
          label: grName,
          essType: 'data',
          pCreator: Session.getActiveUser().getEmail(),
          pFirstDate: new Date(),
          dataSrcType: 'GOOGLE_SHEETS',
          dataSrcId: ssId,
          dataSrcTMark: tM,
          dataShName: shName,
          dataShHeadInd: 0,
          dataSrcUrl: ss.getUrl(),
          parentFolderId: folder.getId()
        };
        lPs = PEleCom.output.addSelectorsIfAny(grName, newGS, lPs);
        Glossary.addLines(lPs);
      }
      break;
    default:
      // checks if selected groups have dataSrcIds and dataShNames and
      // if some one has not then creates them
      inpGrpsNames = PEleCom.inpData.sets.names;
      inpStr = inpGrpsNames.join('-');
      shNamesRunSpecsPart = PEleCom.output.runSpecs.getShNamesRunSpecsPart();
      for (var igrp = 0; igrp < groupsNames.length; igrp++) {
        grName = groupsNames[igrp];
        shName = grName + '_' + tM;
        // new spreadsheet for new groups
        if (PEleCom.output.oneSsForAllMode) {
          if (PEleCom.output.oneSsForAllId) {
            ssId = PEleCom.output.oneSsForAllId;
            ss = SpreadsheetApp.openById(ssId);            
          } else {
            // 'single spreadsheet for all'- mode
            ssName = 'RunFor_inputSets_' + inpStr + '_runSpecs_' + shNamesRunSpecsPart + '_oneForAll_' + keyWords + '_' + tM;
            ss = SpreadsheetApp.create(ssName);
            ssId = ss.getId();
            folder.addFile(DriveApp.getFileById(ssId));
            PEleCom.output.oneSsForAllId = ssId;
            PEleCom.output.oneSsForAllName = ssName;
          }
        } else {
          // one spreadsheet and one sheet per each group
          ssName = 'RunFor_inputSets_' + inpStr + '_runSpecs_' + shNamesRunSpecsPart + '_outputGr_' + grName + '_' + keyWords + '_' + tM;
          ss = SpreadsheetApp.create(ssName);
          ssId = ss.getId();
          folder.addFile(DriveApp.getFileById(ssId));
        }
        sGr = ss.insertSheet(shName);
        lPs = {
          label: grName,
          essType: 'data',
          pCreator: Session.getActiveUser().getEmail(),
          pFirstDate: new Date(),
          dataSrcType: 'GOOGLE_SHEETS',
          dataSrcId: ssId,
          dataSrcTMark: tM,
          dataShName: shName,
          dataShHeadInd: 0,
          dataSrcUrl: ss.getUrl(),
          parentFolderId: folder.getId()
        };
        lPs = PEleCom.output.addSelectorsIfAny(grName, newGS, lPs);
        Glossary.addLines(lPs);
      }
    }
    return groupsNames;
  },
  /**
  * see explaination of createSheetsForPatternsGroups() method earlyer above
  */
  createSheetsForPatternsGroups_Existed: function (pattGrs, keyWords_opt, tMark_opt, mode_opt, ssIdNewBatch_opt) {
    var keyWords = keyWords_opt || '';
    var mode = mode_opt || '';
    var newBatch = mode === 'newBatch' ? true : false;
    var eachAlone = mode === 'eachAlone' ? true : false;
    var ssIdNewBatch = ssIdNewBatch_opt || '';
    var tM = tMark_opt || PEleCom.output.timeMark;
    // -- glossary
    var glossary = PEleCom.inpData.sets.glossary;
    var d = glossary.data;
    var glossHeader = d[parseInt(glossary.dataShHeadInd, 10)];
    var js = handle.jObj(glossHeader);
    var jDSrcId = parseInt(js.dataSrcId, 10);
    var jDShName = parseInt(js.dataShName, 10);
    var jLbl = parseInt(js.label, 10);
    // -- output Groups object
    var output = PEleCom.output;
    var grps = PEleCom.output.dataGroups;
    // result folder
    var folder = PEleCom.output.getResultFolder(tM);
    // labels and rows' indices
    var o = PEleCom.handle.selectGroupsInGloss(pattGrs);
    var groupsNames = o.names;
    // groups' labels
    var groupsIRows = o.iRows;
    var modifiedGroupsNames = [];
    var ss,ssName,shName,ssId,grName,sGr,lPs,inpGrpsNames,
	    inpStr,shNamesRunSpecsPart,pFolderId,ir;
	switch (mode) {
    case 'newBatch':
      // создание листов для групп в отдельно стоящей таблице (отдельный пакет)
      // creates separate spreadsheet for all groups determined by pattGrs
      if (!ssIdNewBatch) {
        // new spreadsheet is created in which all new groups sheet will be input
        ssName = keyWords == '' ? 'newBatch_' + tM : keyWords + 'NewBatch' + tM;
        ss = SpreadsheetApp.create(ssName);
        ssId = ss.getId();
        folder.addFile(DriveApp.getFileById(ssId));
      } else {
        ss = SpreadsheetApp.openById(ssIdNewBatch);
        ssId = ssIdNewBatch;
      }
      // Groups's sheets
      for (var ig = 0; ig < groupsNames.length; ig++) {
        grName = groupsNames[ig];
        shName = grName + '_' + tM;
        ir = parseInt(groupsIRows[ig], 10);
        if (!d[ir][jDShName] || /^[ ]+/.test(d[ir][jDShName])) {
          ss.insertSheet(shName);
          // add parameters to Glossary sheet
          pFolderId = ssIdNewBatch ? DriveApp.getFileById(ss.getId()).getParents().next().getId() : folder.getId();
          lPs = {
            label: grName,
            essType: 'data',
            pCreator: Session.getActiveUser().getEmail(),
            pFirstDate: new Date(),
            dataSrcType: 'GOOGLE_SHEETS',
            dataSrcId: ssId,
            dataSrcTMark: tM,
            dataShName: grName + '_' + tM,
            dataShHeadInd: 0,
            dataSrcUrl: ss.getUrl(),
            parentFolderId: ssIdNewBatch ? pFolderId : folder.getId()
          };
          Glossary.addLines(lPs);
          modifiedGroupsNames.push(grName);
        }
      }
      break;
    case 'eachAlone':
      // checks if selected groups have dataSrcIds and dataShNames and
      // if it has not then creates them
      for (var igr = 0; igr < groupsNames.length; igr++) {
        grName = groupsNames[igr];
        ir = parseInt(groupsIRows[igr], 10);
        // has no spreadsheet
        inpGrpsNames = PEleCom.inpData.sets.names;
        inpStr = inpGrpsNames.join('-');
        shNamesRunSpecsPart = PEleCom.output.runSpecs.getShNamesRunSpecsPart();
        // one spreadsheet and sheet per group
        ssName = 'RunFor_inputSets_' + inpStr +
          '_runSpecs_' + shNamesRunSpecsPart +
            '_outputGr_' + grName + '_' + keyWords + '_' + tM;
        ss = SpreadsheetApp.create(ssName);
        ssId = ss.getId;
        sGr = ss.insertSheet(grName + '_' + tM);
        folder.addFile(DriveApp.getFileById(ssId));
        lPs = {
          label: grName,
          essType: 'data',
          pCreator: Session.getActiveUser().getEmail(),
          pFirstDate: new Date(),
          dataSrcType: 'GOOGLE_SHEETS',
          dataSrcId: ssId,
          dataSrcTMark: tM,
          dataShName: shName,
          dataShHeadInd: 0,
          dataSrcUrl: ss.getUrl(),
          parentFolderId: folder.getId()
        };
        Glossary.addLines(lPs);
        modifiedGroupsNames.push(grName);
      }
      break;
    default:
      // check if each group has data source data.
      // and initiates groups in accordance with output.oneSsForAll parameter
      // Groups
      for (var igrp = 0; igrp < groupsNames.length; igrp++) {
        grName = groupsNames[igrp];
        shName = grName + '_' + tM;
        ir = parseInt(groupsIRows[igrp], 10);
        lPs = {};
        var hasAdding = false;
        // check srcId
        if (!d[ir][jDSrcId] || /^[ ]+/.test(d[ir][jDSrcId])) {
          hasAdding = true;
          // has no SrcId. -- title parts :
          inpGrpsNames = PEleCom.inpData.sets.names;
          inpStr = inpGrpsNames.join('-');
          shNamesRunSpecsPart = PEleCom.output.runSpecs.getShNamesRunSpecsPart();
          if (PEleCom.output.oneSsForAllMode) {
            if (!PEleCom.output.oneSsForAllId) {
              ssName = 'RunFor_inputSets_' + inpStr +
                '_runSpecs_' + shNamesRunSpecsPart +
                  '_oneForAll_' + keyWords + '_' + tM;
              ss = SpreadsheetApp.create(ssName);
              ssId = ss.getId();
              folder.addFile(DriveApp.getFileById(ssId));
              PEleCom.output.oneSsForAllId = ssId;
              PEleCom.output.oneSsForAllName = ssName;
            } else {
              ssId = PEleCom.output.oneSsForAllId;
              ss = SpreadsheetApp.openById(ssId);
              
            }
          } else {
            // creates spreadsheet & sheet pairs fro each group
            ssName = 'RunFor_inputSets_' + inpStr +
              '_runSpecs_' + shNamesRunSpecsPart +
                '_outputGr_' + grName + '_' + keyWords + '_' + tM;
            ss = SpreadsheetApp.create(ssName);
            ssId = ss.getId();
            sGr = ss.insertSheet(shName);
            folder.addFile(DriveApp.getFileById(ssId));
          }
          lPs.label = grName;
          lPs.essType ='data';
          lPs.pCreator = Session.getActiveUser().getEmail();
          lPs.pFirstDate = new Date();
          lPs.dataSrcType = 'GOOGLE_SHEETS';
          lPs.dataSrcId = ssId;
          lPs.dataSrcTMark = tM;
          lPs.dataSrcUrl = ss.getUrl();
          lPs.parentFolderId = folder.getId();
        }
        // check shName
        if (!d[ir][jDShName] || /^[ ]+/.test(d[ir][jDShName])) {
          hasAdding = true;
          if (!lPs.dataSrcId) {
            // dataSrcId cell is not empty
            ssId = new Unmask(d[ir][jDSrcId]).last();
            ss = SpreadsheetApp.openById(ssId);
          }
          ss.insertSheet(shName);
        }
        if (hasAdding) {
          if (!lPs.label) {
            // only dataShName has been set
            lPs.label = grName;
            lPs.dataSrcTMark = tM;
            lPs.dataShName = shName;
            lPs.dataShHeadInd = 0;
          } else {
            lPs.dataShName = shName;
            lPs.dataShHeadInd = 0;
          }
        }
        // add parameters to Glossary sheet
        Glossary.addLines(lPs);
        modifiedGroupsNames.push(grName);
      }
    }
    //end of switch
    return modifiedGroupsNames;
  },
  /**
  * returns spreadsheet object of specified name
  * @param {string}ssName - name of spredsheet without timeMark part
  * @param {string}tMark_opt - optional time mark
  * @return {Spreadsheet} spreadsheet object or false
  */
  getSpreadsheetByName: function (ssName, tMark_opt) {
    var tM = tMark_opt || PEleCom.output.timeMark;
    if (!tM) {
      Logger.log('Time Mark is not set.');
      return false;
    }
    var fullName = ssName + '_' + tM;
    var grpsSsNames = PEleCom.output.grpsSsNames;
    if (grpsSsNames.length > 0) {
      var sSs = PEleCom.output.grpsSprSheets;
      var sSNames = PEleCom.output.grpsSsNames;
      var ind = getColNumb(sSNames, fullName) - 1;
      return sSs[ind];
    } else {
      Logger.log('spreadsheets set is not defined!');
      return false;
    }
  },
  /**
  * Opens spreadsheets of output groups containing in reuslt folder
  * having timeMark as name (smsCik_Results-> <timeMark>)
  * from folders named timeMark in smsCik_Results folder
  * @param {string}timeMark - time mark
  * @return {Object} object with selected spreadsheets data
  *   object's properties:
  *   .nSss{Integer} - number of ss have searched
  *   .ssIds{Array string[]} -  array of spreadsheets' ids
  *   .sss{Array Spreadshet[]}                     array of spreadsheet objects
  */
  getOutputSpeadsheetsFromTimeMarkFolder: function (timeMark, spreadsheetNameOpt) {
    var rootFolder = DriveApp.getFolderById(ID_FLD_RESULTS);
    var flds = rootFolder.getFolders();
    var folder;
    while (flds.hasNext()) {
      var f = flds.next();
      if (f.getName() == timeMark) {
        folder = f;
        break;
      }
    }
    /**
    * Checks if a name is one of output groups
    * @param {string}name name testing
    * @return {Boolean} true at positive check
    */
    function isOutputGroupName(name) {
      var nms = PEleCom.output.dataGroups.names;
      for (var i in nms) {
        if (name == nms[i]) {
          return true;
        }
        return false;
      }
    }
    var files = folder.getFiles();
    var selectedFilesIds = [];
    while (files.hasNext()) {
      var fl = files.next();
      var fn = fl.getName();
      var nameInit = fn.replace(new RegExp('_' + timeMark), '');
      if (isOutputGroupName(nameInit)) {
        // is spreadsheet ?
        selectedFilesIds.push(fl.getId());
      }
    }
    var sss = [];
    for (var ifl in selectedFilesIds) {
      sss.push(SpreadsheetApp.openById(selectedFilesIds[ifl]));
    }
    var o = {
      nSss: selectedFilesIds.length,
      ssIds: selectedFilesIdsssIds,
      sss: sss
    };
    return o;
  }
};
/**
* appends properties and methods of outputO to output
* @param {Object} output object of output data handling results
* @return {Object} output object
*/
handle.appendOutputProto = function () {
  for (var ip in outputO) {
    output[ip] = outputO[ip];
  }
  return output;
};
output = handle.appendOutputProto();
function iniSS() {
  var outO = PEleCom.output;
  var ss = output.setOneSpreadsheetForAll(tMark);
  Logger.log(ss.getId());
}
//================ OUTPUT ===========================
/**
*  tests createSheetsForPatternsGroups methods
*/
function testCreatesShtsPttGr() {
  var pttGrs = {
    labels: [
      'mama',
      'papa'
    ],
    selectors: {
      'mama': { definition: 'It is sheet description' },
      'papa': { essType: 'test' }
    }
  };
}