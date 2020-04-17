/** 
* on the basis of gr.isInData parameter selects input data sets 
* names as declaring analyzing groups
* @param {string}isInDataStr - value of isInData parameter for considering group
* @return {Array Strings[]} array of data sets names available in Glossary which will be
*     input sets for analysis
*/
handle.getInpSetsNames = function (isInDataStr) {
  if (!isInDataStr) {
    try{
      throw 'isInDataStr could not be empty here';
    }catch(e){
      return [];
    }
  }
  var condPatt = /(\w+)/g;
  // for scecified group
  var inputSetsNames = isInDataStr.match(condPatt);
  // array
  return inputSetsNames;
};
/**
* returns array of input data set groups' names mentioned in isInData selector
* and Includes their objects of input data sets, 
* and their attributes into PEleCom.inpData.sets object
* @param {string}isInData - string of input data content got from group's row  value of isInData column of Glossary sheet
* @return {Object string[]} array of input sets names mentioned in isInData parameter
*/
handle.setInpSets = function (gr, isInData) {
  var testingSetsNames;
  if (!isInData) {
    // if isInData is not set the group itself is considered as testingSet
    testingSetsNames = [gr.label];
  } else {
    testingSetsNames = handle.getInpSetsNames(isInData);
  }
  // prepares patterns for groups
  var pattsGroups = [];
  for (var isn = 0; isn < testingSetsNames.length; isn++) {
    pattsGroups.push(new RegExp(testingSetsNames[isn]));
  }
  var sets = PEleCom.inpData.sets;
  sets = handle.setAnalysingGroups(pattsGroups, sets);
  return testingSetsNames;
};
//
/** 
* forms Select object for group or adds properties for existing select object
* Comment:
* Exchanges set's properties mentioned in conditionStr by actual values of sets' data arrays
* @param {Object|string}gr - output group object or output group-set label as string
* @return {Object} object of analysing output group
*/
handle.setConditionStrForSelect = function (group) {
  var inpSets = PEleCom.inpData.sets;
  var grps = PEleCom.output.dataGroups;
  var gr = typeof group == 'string' ? grps[group] : group;
  var grLabel = typeof group == 'string' ? group : group.label;
  var testingSetsNames = handle.setInpSets(gr, gr.isInData);
  // input data Sets for analyzing group considered  
  var cSFS = gr.conditionStr;
  // cSFS - abbreviation condStrForSelect
  var jsOfSets = {};
  // jObjects of each set 
  var condStrParts = {};
  var testingSetsProps = {}; var pttDot, pttPrnth, checkPttPrnth;
  for (var is = 0; is < testingSetsNames.length; is++) {
    var sNm = testingSetsNames[is];
    //set name
    var set = inpSets[sNm];
    var dataOfSet = set.data;
    jsOfSets[sNm] = handle.jObj(dataOfSet[parseInt(set.dataShHeadInd, 10)]);
    // j-object for data of specified data Set;          
    var jsOfSet = jsOfSets[sNm];
    set.js = jsOfSet;
    condStrParts[sNm] = {
      colsNames: [],
      js: [],
      data: []
    };
    // inserts sets objects in expression
    pttDot = new RegExp(sNm + '\\.', 'g');
    pttPrnth = new RegExp(sNm + '\\[', 'g');
    cSFS = cSFS.replace(pttDot, 'PEleCom.inpData.sets.' + sNm + '.').replace(pttPrnth, 'PEleCom.inpData.sets.' + sNm + '[');
    // identifies columns mentioned in expression of 
    // including properties with style - obj['some property']    
    var pattCol = new RegExp(sNm + '([.]\\w+|\\[(\'' + '|").+?])', 'g');
    var testingSetProps = gr.conditionStr.match(pattCol);
    var colsNms = [];
    var colsJs = [];
    for (var it = 0; it < testingSetProps.length; it++) {
      var sProp = testingSetProps[it];
      var inSquareParenthis;
      if (!/\[/.test(sProp)) {
        colsNms.push(sProp.replace(new RegExp(sNm + '.'), ''));
        inSquareParenthis = false;
      } else {
        var sp = sProp.split('[\'')[1];
        sp = sp.replace(/'\]/, '');
        colsNms.push(sp);
        inSquareParenthis = true;
      }
      var colNm = colsNms[it];
      colsJs.push(parseInt(jsOfSet[colNm], 10));
      var colJ = colsJs[it];
      if (!inSquareParenthis) {
        pttDot = new RegExp(sNm + '[.]' + colNm, 'g');
        pttPrnth = new RegExp(sNm + '[\'' + colNm + '\']', 'g');
        checkPttPrnth = pttPrnth.test(cSFS);
        cSFS = cSFS.replace(pttDot, sNm + '.data[iRow][' + colJ + ']').replace(pttPrnth, sNm + '.data[iRow][' + colJ + ']');
      } else {
        pttPrnth = new RegExp(sNm + '\\[\'' + colNm + '\']', 'g');
        checkPttPrnth = pttPrnth.test(cSFS);
        cSFS = cSFS.replace(pttPrnth, sNm + '.data[iRow][' + colJ + ']');
      }
    }
    testingSetsProps[sNm] = testingSetProps;
    condStrParts[sNm].colsNames = colsNms;
    // series of columns names mentioned on condition string in order in wich they are encounted in expression
    condStrParts[sNm].js = colsJs;  // series of j-s for columns names above
  }
  // -- gr.select setting
  // group Selection object gr.select.Varifiys multidimentional conditionString and selects outPut sets 
  var selectProto = {
    add: function (a, b) {
      this[a] = b;
    },
    testingSetsNames: [],
    testingSetsProps: {},
    number: 0,
    membSetRowsInds: [],
    // indices of rows of appropriate data sets complied with selection criteria 2d-array
    condStrForSelect: gr.conditionStr,
    condStrParts: {},
    multipleMatch: false,
    // default value. element of specified row could match with few elements of other input sets
    excludeSelected: false
  };
  if (!gr.select) {
    gr.select = selectProto;
  } else {
    gr.select = handle.cloneObj(selectProto, gr.select, false);
  }
  gr.select.testingSetsNames = testingSetsNames;
  gr.select.jsTSNs = handle.jObj(testingSetsNames);
  // index of set in testingSetsNames array
  gr.select.testingSetsProps = testingSetsProps;
  gr.select.condStrParts = condStrParts;
  gr.select.condStrForSelect = cSFS;
  return gr;
};
/**
* Checks logical expression for current input data sets, and current rows
* creates condition String for row(s) for testingSet(s) of group object
* @param {Object}gr - output group's object
* @param {Array.<Integer>[]}testingSetsIRows - array of testing sets' actual rows indices
*   Simultaniously few different input set could be included in condition string
*   and algotirth tests the value of logical expression of ConitionStr for different combinations
*   of rows of different sets checked. this parameter indicate actual comination of rows indices'
*   values, for ex. [1,3,5] means that three sets are included in ConditionString
*     and actually row with index=1 of first set 
*                  row with index=5 of second set
*              and row with index=5 of third set are taken into account for evaluating
*   logical expression of conditionStr 
*   testingSetsIRows array values are assigned in handle.sinkRightAndCheck method
* @return {Object} output group object with few new properties added: 
*   gr.select.condStrForRows= {
*     testSetsNames:[],
*     testingSetsIRows:[],
*     string:'',  - value of condition string after inserting actual values of appropriate data of sets
*     value:'' - results of evaluation( by eval() ) of final condStrForRows string 
*    }
*    gr.select.bingos - [] array of arrays of indices values for testing sets giving eval(condStr)=true
*    gr.select.bStrings -  array of condStrings appropriate to bingo testing sets' irows combinations
*
* OR false if gr.select does not exist or is undefined
*/
handle.setConditionStrForRows = function (gr, testingSetsIRows) {
  PEleCom.output.nCondStrCheckings++;
  var inpSets = PEleCom.inpData.sets;
  var testingSetsNames = gr.select.testingSetsNames;
  // condition String for rows
  // abcense of conditionStrForRows means that this method never being used for this group
  gr.select.conditionStrForRows = {
    string: gr.select.condStrForSelect,
    value: undefined
  };
  var cSFR = gr.select.conditionStrForRows;
  for (var is = 0; is < testingSetsNames.length; is++) {
    var sNm = testingSetsNames[is];
    //set name
    var set = inpSets[sNm];
    var dataOfSet = set.data;
    var jsOfSet = set.jsData;
    var condStrParts = gr.select.condStrParts[sNm];
    // identifies columns mentioned in expression of
    var colsNms = condStrParts.colsNames;
    var colsJs = condStrParts.js;
    // for Rows of testing set
    var iRow = testingSetsIRows[is];
    for (var icm in colsNms) {
      var colM = colsNms[icm];
      var jcm = colsJs[icm];
      var ptt = new RegExp(sNm + '\\.data\\[iRow\\]\\[' + jcm + '\\]', 'g');
      cSFR.string = cSFR.string.replace(ptt, sNm + '.data[' + iRow + '][' + jcm + ']');
    }
  }
  var expression = cSFR.string;
  cSFR.value = eval(expression);
  cSFR.testingSetsNames = gr.select.testingSetsNames;
  if (cSFR.value) {
    // selection criteria is matched    
    gr.select.bingos = gr.select.bingos ? gr.select.bingos : [];
    // match to selection criteria of conditionStr
    gr.select.bStrings = gr.select.bStrings ? gr.select.bStrings : [];
    gr.select.number++;
    gr.select.bStrings.push(cSFR.string);
    gr.select.bingos.push([gr.select.number].concat(testingSetsIRows.slice(0)).concat([cSFR.string]));
    //----??????????????????????????????????????????????????????    
    nVAL++;
    var nnVAL = nVAL;
    var VAL = cSFR.value;
    if (gr.select.excludeSelected) {
      // option for exclusion of already matched input sets' rows(elements) from 
      // initial data sets clones( CLONEs not original data sets)
      handle.excludeMembersSelected(gr);
    }
    if (!gr.select.multipleMatch) {
    }  //----??????????????????????????????????????????????????????
  }
  var n = PEleCom.output.nCondStrCheckings;
  return n;
};
/**
* Excludes mRIcase rows from clones data Array for group
* @param {Object}gr - output group object
* @return { Object Arrays[][]} object of dataClones arrays. 
*   Only data related to columns mentioned in select condition 
*   expression are implied
*/
handle.excludeMembersSelected = function (gr) {
  var setsNames = gr.select.testingSetsNames;
  var testingSetsIRows = gr.select.testingSetsIRows;
  var dataSetClones = {};
  dataSetClones.add = function (a, b) {
    this[a] = b;
  };
  var dataOfCondStrPartsClones = {};
  dataOfCondStrPartsClones.add = function (a, b) {
    this[a] = b;
  };
  for (var is in setsNames) {
    var sNm = setsNames[is];
    //dataSetClones.add( sNm,inpSets[sNm].dataClone );
    dataOfCondStrPartsClones.add(sNm, inpSets[sNm].dataOfCondStrPartsClone);
    dataOfCondStrPartsClones[sNm].splice(testingSetsIRows[is], 1);
  }
  return dataOfCondStrPartsClones;
};
/** 
* Chooses the most right testing set if it exists and test conditionStr 
* @param {string}sNm - input data set name
* @param {Object}gr - output group object analyzing
* @return {Object} object of ouput group  
*/
handle.sinkRightAndCheck = function (sNm, gr) {
  if (gr.select.step && gr.select.step == 'timeExpired') {
    return;
  }
  var set = PEleCom.inpData.sets[sNm];
  var data = set.data;
  var rLast = data.length;
  var tSNs = gr.select.testingSetsNames.slice(0);
  var testingSetsIRows = gr.select.testingSetsIRows.slice(0);
  var jsTSNs = handle.jObj(tSNs);
  // index of set in testingSetsNames array
  var jTSN = parseInt(jsTSNs[sNm], 10);
  var irowIni;
  if (testingSetsIRows[jTSN] === undefined) {
    irowIni = parseInt(set.dataShHeadInd, 10) + 1;
  } else if (testingSetsIRows[jTSN] == rLast - 1 && gr.select.step !== 'continueInit') {
    irowIni = parseInt(set.dataShHeadInd, 10) + 1;
  } else {
    if (gr.select.step === 'continueInit') {
      irowIni = testingSetsIRows[jTSN];
    } else {
      throw 'algotithm logics problem in SinkRigthAndCheck()';
    }
  }
  //var irowIni=(testingSetsIRows[jTSN])?testingSetsIRows[jTSN]:parseInt(set.dataShHeadInd,10)+1;
  for (var i = irowIni; i < rLast; i++) {
    testingSetsIRows[jTSN] = i;
    gr.select.testingSetsIRows[jTSN] = i;
    if (tSNs.indexOf(sNm) < tSNs.length - 1) {
      // the current data set is not the rightest
      var jTSNext = jTSN + 1;
      var sNmNext = tSNs[jTSNext];
      handle.sinkRightAndCheck(sNmNext, gr);
      if (gr.select.step == 'timeExpired') {
        break;
      }
    } else {
      // current data set is the rightest ( last input data set in testingSetsNames list)
      if (!tLimit.check() || !fakeTLimitCheck) {
        // time limit exceeded
        gr.select.step = 'timeExpired';
        break;
      }
      gr.select.step = gr.select.step === 'continueInit' ? 'continueCalc' : gr.select.step;
      // discards step parameter while has reached rightest testing set
      // goes down trhough data set rows
      handle.setConditionStrForRows(gr, testingSetsIRows);
    }
  }  //gr.select.getNextRowOfLeftSet=true;
};
/**
* Описание алгоритма:
* Перебираются входные наборы (слева-направо. 0-й самый левый)
* затем перебираются элементы входного набора (сверху вниз.0-й ряд самый верхний)
* процедура:
* П0.Начинаем с самого левого набора.
* Берется элемент(ряд) текущего набора.Записываем индекс текущего ряда набора
* П1.Если набор не самый правый, переходим к следующему набору.
* Берется элемент текущего набора. Записываем индекс текущего ряда набора.проверяем П1
* Пришли в самый правый набор. Сформированы для каждого набора объекты 
* значений текущего индекса элемента(ряда) select.testinSetsIRows
* Начинаем Перебор самого правого набора сверху вниз.
* При переходе на следующий элемент: 
* фиксируем текущий индекс ряда. 
* Проверяем условие отбора
* Если условие выполняется создаем обект индексов выходного набора 
* П2. После анализа последнего элемента  правого набора, выбирается следующий
* (нижний)элемент ближайшего левого набора
* П3. Если ищутся уникальные совпадения, то из всех наборов,
* после обнаружения выполнения условий отбора,
* выкидываются вошедшие в выборку элементы(строки, ряды).
* Тем самым сокращается время последующиего анализа из-за сокращение длины наборов.
*/
/**
* Checks condition string for input data Sets of a group analyzing
* Varifies if analyzed input data sets conform with expression set in glossary column 'conditionStr'
* @param {Object}gr - analyzed output group object
* @return {Boolean|void} - true if logical expression determined by condition parameter of a group is true 
*                          if condition parameter is not specified
*                     false otherwise
*/
handle.selectByConditionStr = function (gr) {
  // identifies testing sets names(input data Sets's names for analyzed group considered)
  var tSNs;
  if (!gr.conditionStr) {
    // If a group has no conditionStr( value of column 'conditionStr' is not set)
    // selection is not needed. It's considered that all datas conforms to selection rules
    return 'all';
  } else {
    if (!gr.select || gr.select.step !== 'continueInit') {
      gr = handle.setConditionStrForSelect(gr);
      gr.select.testingSetsIRows = [];
      tSNs = gr.select.testingSetsNames.slice(0);
      for (var its = 0; its < tSNs.length; its++) {
        // array of testing sets rows' indices for each testingSets data
        gr.select.testingSetsIRows.push(undefined);
      }
    } else {
      tSNs = gr.select.testingSetsNames.slice(0);
    }
    // place to change .multipleMatch and .excludeSelected property for select obj
    // begins to browse around rows of testing sets data
    var sNm = tSNs[0];
    // begins with 'leftest' testing set named testingSetsNames[0]
    var nCondStrCheckings = handle.sinkRightAndCheck(sNm, gr);
    return gr.select.number;  // number of condition string criteria matches
  }
};
/** 
 * Tests specified group data set by selector( selector is preset value of 
 * glossary column).
 * The goal of test is to select rows of group data complying with selector value
 * @param {string|Object}group - group or group's label
 * @param {string}selectors - string of coma separated selectors' labels
 * @return {Object} test results object contained (among others) the arrays 
 *   of rows indices saticfied test for specified selector
 * @example
 *         testObj={groupLable:grLable,
 *                  numberOfSelectors:n,
 *                  selectorsNames:[selectors],
 *                  testsRes:[                      
 *                            {selector:'selectorLabel',dataRowsIndices:[]},
 *                            {selector:'selectorLabe2',dataRowsIndices:[]},
 *                                  ...
 *                            {selector:'selectorLabeLast',dataRowsIndices:[]}
 *                           ]
 *                 };           
 */
handle.testGroupBySelector = function (group, selectors) {
  var sels = selectors.split(',');
  var grps = PEleCom.output.dataGroups;
  var sets = PEleCom.inpData.sets;
  var gr = typeof group == 'string' ? grps[group] : group;
  var grLabel = typeof group == 'string' ? group : group.label;
  var testObj = {
    groupLable: grLabel,
    numberOfSelectors: sels.length,
    selectorsNames: sels,
    testRes: []
  };
  var gloss = sets.glossary;
  var glData = gloss.data;
  var selectorsColumnsD = gloss.dataSetClmns;
  // object of pairs: { colName:valArray[]
  var jGl = gloss.jsData;
  var data = gr.data;
  // for each selector
  for (var is in sels) {
    var sel = sels[is];
    var resO = {
      selector: sel,
      dataRowsIndices: []
    };
    var dRI = resO.dataRowsIndices;
    var sVals = selectorsColumnsD[sel][parseInt(gloss.ind[grLabel], 10)].split(',');
    var sRanges = handle.rangeParts(glData[parseInt(gloss.ind[grLabel], 10)][parseInt(jGl.range, 10)]);
    var notMarkUp = sel != 'bgColor' && sel != 'fontWeight' && sel != 'fontColor' && sel != 'fontLine' && sel != 'fontStyle';
    var checkData, iIni;
    if (notMarkUp) {
      checkData = sRanges.set != gr.label ? sets[sRanges.set].data : data;
      iIni = 1;
    } else {
      checkData = sRanges.set != gr.label ? sets[sRanges.set].dataMarkUp[sel] : dataMarkUp[sel];
      iIni = 0;
    }
    var jData = sRanges.set != gr.label ? sets[sRanges.set].jsData : gr.jsData;
    var colNms = sRanges.colNames;
    for (var i = iIni; i < checkData.length; i++) {
      for (var jc in colNms) {
        for (var iv in sVals) {
          if (sel == 'pattern') { var re;
            if (/^\//.test(sVals[iv])) {
              //str.slice( str.search(/[/]\w*$/))
              var pattStr = sVals[iv].replace(/^\//, '');
              var pattPar = pattStr.slice(pattStr.search(/\/\w*$/));
              pattStr = pattStr.replace(/\/\w*$/, '');
              pattPar = pattPar.split('/')[1];
              re = new RegExp(pattStr, pattPar);
            } else {
              re = new RegExp(sVals[iv]);
            }
            if (re.test(checkData[i][jData[colNms[jc]]])) {
              dRI.push(i);
            }
          } else {
            if (checkData[i][jData[colNms[jc]]] == sVals[iv]) {
              dRI.push(i);
            }
          }
        }
      }
    }
    testObj.testRes.push(resO);
  }
};
/**
 * gets 'range' selector parts. Determins which columns are included in analysis
 * @param {string}rangeStr - elementary(after coma separating) string of range in Glosary column 'range'
 * @return {object} object with parts of range
 *   rO={set:'setName',
 *       colNames:['col0Nm','col1Nm',..'colNmLast']}
 *   .range-value common samples(typical representation of range in SpreadsheetApp): 
 *      set! c1:c2 ,c3:c4, c5,c6,..,c7:c8, ...cLast ; 
 *  where set - data sheet name; cN - columns including  
 *        c1:c2 means from c1 to c2 all are included
 *        c5,c6,c9 sequential inclusion
 */
handle.rangeParts = function (rangeStr) {
  var rO = {};
  var rsign = rangeStr.split('!');
  rO.set = rsign[0] == '' ? 'our' : rsign[0];
  var iHeader = parseInt(PEleCom.inpData.sets[rO.set].dataShHeadInd);
  var header = PEleCom.inpData.sets[rO.set].data[iHeader];
  rO.colNames = [];
  var cols = rsign[1];
  var subCols = cols.split(',');
  for (var i in subCols) {
    if (/[:]/.test(subCols)) {
      var colIni = cols.split(':')[0];
      var colLast = cols.split(':')[1];
      var js = PEleColm.inpData.sets.glossary.jsData;
      for (var j = parseInt(js[colIni], 10); j < parseInt(js[colLast], 10) + 1; j++) {
        rO.colNames.push(header[j]);
      }
    } else {
      rO.colNames.push(subcols[i]);
    }
  }
  return rO;
};
/**
* Sets index of initial group's name to analyse and
* if there is not the first calculation run but the proplongation after time 
* limit termination - updates this group .select objects parameters using 
* scriptProperties data or Temporary files on drive
* @param {Object}grps - object of output data group PEleCom.output.dataGroups
* @return {Number} integer index in array grps.names 
*   of analysing group need to be analised 
*/
handle.condStrSelectionRunInit = function (grps) {
  var outGrNames = grps.names;
  //runs Register Spreadsheet(is stored in smsCIK/runs folder and named 'runs')
  var firstRun = false;
  var runs = SpreadsheetApp.openById(ID_SS_RUNS).getSheetByName('runX'); // ID_SS_RUNS
  var runsD = runs.getDataRange().getValues(); 
  var fName;
  if (runsD.length > 1) {
    var js = handle.jObj(runsD[0]);
    var is = handle.iObj(runsD);
    var iRLast = runsD.length - 1;
    var jTLR = parseInt(js.time, 10);
    // j index of time of last run column(named 'time')
    var jTM = parseInt(js.tMark, 10);
    // j index of last run time mark
    var lastTM = runsD[iRLast][jTM];
    var tlastRun = runsD[iRLast][jTLR];
    var lastRMCalc = Utilities.formatDate(new Date(tlastRun), 'GMT+03:00', 'ddMMYY_HHmmss');
    fName = 'tempData_' + lastTM;  // last run temporary data file
                                       /*                  
    var lastR=runs.getLastRow();
    var tlastRunRow=runs.getRange(lastR,1,1,runsD[0].length).getValues()[0];
    var tlastRun=tlastRunRow[0];
    var lastTM=tlastRunRow[1];
    var lastTMCalc=Utilities.formatDate(new Date(tlastRun),'GMT+03:00','ddMMYY_HHmmss');
    fName='tempData_'+lastTM; // last run temporary data file
    */
  } else {
    firstRun = true;
  }
  var igrIni;
  if (!firstRun) {
    var f = DriveApp.getFilesByName(fName).next();
    var str = f.getBlob().getDataAsString();
    var temps = JSON.parse(str);
    var step = temps.step;
    igrIni = step == 'timeExpiered' ? temps.outputGrInd : 0;
    var gr = grps[outGrNames[parseInt(igrIni, 10)]];
    gr.select = gr.select ? gr.select : {};
    gr.select.testingSetsNames = temps.tSNs.split(',');
    gr.select.testingSetsIRows = temps.tSIRs.split(',');
    gr.select.lastRunTMark = temps.tM;
    gr.select.lastRunNumber = temps.number;
    gr.select.lastRunNCondStrCheckings = temps.nCondStrCheckings;
    gr.select.jsTSNs = JSON.parse(temps.jsTSN);
    gr.select.condStrForSelect = temps.cSFS;
    gr.select.testingSetsProps = JSON.parse(temps.tSProps);
    gr.select.condStrParts = JSON.parse(temps.condStrParts);
    gr.select.number = parseInt(JSON.parse(JSON.stringify(temps.number)), 10);
    gr.select.run=temps.run;
    PEleCom.output.nCondStrCheckings = parseInt(JSON.parse(JSON.stringify(temps.nCondStrCheckings)), 10);
    // select.testingSetsIRows - {Array}  array of current row indices of each testing Sets 
    // reset before run
    gr.select.step = 'continueInit';  // deletes temporary scriptProperties parameters
  } else {
    igrIni = 0;
  }
  return igrIni;
};
/**
* saves intermediaries data into scriptProperties and creates new trigger
* !!! ScriptProperties doesn't work. Data obtained are saved into
* intermediary file( named 'tempData_'+tM ) and spreadsheet 'runs'
* selected bingos are accumulated in appropriate sheet - 
* to launch next run of selection by condition string
* @param {Object}gr - last handled output group object
* @param {string}grNm - group label
* @param {Number}ig - index of current group mentioned above 
*   in output.dataGroups.names array
* @param {Number}toLaunchOverTime - number of milliseconds over which 
*   next run should be launched
* @param {string}funcName - name of trigger function which will run over time
* @return {Object} object with properties {bingosShName,triggerId} :
*   .bingosShName - string of sheet name with bingos results
*   .triggerId - id of trigger
*/
handle.prepareNextCondStrSelectRun = function (gr, grNm, ig, toLaunchOverTime, funcName) {
  // time limit termination  handling  
  // next run trigger
  ID_TRIGGER = 'NO TRIGGER';
  //ID_TRIGGER=createNextTrigger(toLaunchOverTime,funcName);//'testSelect'); 
  // temporary parameters for next run :
  // gr.select.testingSetsIRows - {Array} current row index for each testing Sets
  // -- register run time
  var grps = PEleCom.output.dataGroups;
  var t = time.getTime();
  var tM = PEleCom.output.timeMark;
  var step = gr.select.step;
  // carried out run registration spreadsheet
  var runs = SpreadsheetApp.openById(ID_SS_RUNS);
  // 'runs' spreadsheet in folder 'smsCIK->runs'
  /** 
  * format of run's sheet name: `run_${user}_${gr.label}_${t}`
  * where: t - variable time in milliseconds
  * The t value in run's sheet name is coinsides with time mark in 
  * milliseconds for first run. runName is set at run initiation and 
  * during next runs is gotten from template_time file json object
  * property temps.run : tini=temp.run.replace(/run_/,'') typeof tini='string'
  */
  var runsD = runs.getSheetByName('runX').getDataRange().getValues();
  var rD;
  if (runsD.length) {
    rD = runsD.concat([[t,tM,step]]);
  } else {
    rD = [[ t,tM,step]];
  }
  runs.getSheetByName('runX').getRange(1, 1, rD.length, rD[0].length).setValues(rD);
  // --
  // creates plain txt file for temporary data named `temps_${timeMark}`
  var temps = {
    step: gr.select.step,
    outputGrInd: ig,
    outputGroupName: grNm,
    tSNs: gr.select.testingSetsNames.toString(),
    jsTSN: JSON.stringify(gr.select.jsTSNs),
    tSIRs: gr.select.testingSetsIRows.toString(),
    tSProps: JSON.stringify(gr.select.testingSetsProps),
    condStrParts: JSON.stringify(gr.select.condStrParts),
    cSFS: gr.select.condStrForSelect,
    tM: PEleCom.output.timeMark,
    number: gr.select.number,
    nCondStrCheckings: PEleCom.output.nCondStrCheckings,
    triggerId: ID_TRIGGER,
    run:'runX'
  };
  var str = JSON.stringify(temps);  // file content
  var fld = DriveApp.getFolderById(ID_FLD_RESULTS);
  var f = DriveApp.createFile('tempData_' + tM, str, MimeType.PLAIN_TEXT);
  var fldNew = PEleCom.output.getResultFolder(tM);
  fldNew.addFile(f);
  fld.addFolder(fldNew);
  var root = DriveApp.getRootFolder();
  if (removeCreatedFolderFromRoot) {
    root.removeFolder(fldNew);
  }
  // temporary intermediary bingos group
  var bingosLabel=flipFlop(gr.label,'_bingos');
  var lastRunTMark = gr.select.lastRunTMark;
  var outputGrps, bingos, pGNew, sB, dB, shName ;
  if (!gr.select.lastRunTMark) {
    // for first run only
    var uSsId = new Unmask(gr.dataSrcId);
    pGNew = {
      labels: [bingosLabel],
      tMark: tM,
      allNewInOne: true,
      mode: 'newBatch',
      ssIdNewBatch: uSsId.last()
    };
    // bingos group selectors
    pGNew.selectors = {};
    pGNew.selectors[bingosLabel] = {
      definition: 'temporaryly stored data of selection by conditionStr for oupput group ' + gr.label,
      dataSrcTMark: tM
    };
    // creates new sheet and specifies or creates new spreadsheet( for temporary 
    // output group labled pGNew.labels[i]=<grLabel>_bingos 
    // the name of main sheet should be <grLabel>_bingos_tM
    // setAnalysingGroups will work in mode when pGNew is single object(not array 
    // of objects), which means
    // that new spreadsheet for specifying group should be created or assigned
    outputGrps = PEleCom.handle.setAnalysingGroups(pGNew);    
    // temporary group - Bingos
    bingos = outputGrps[bingosLabel];
    bingos.dataShHeader = ['index'].concat(gr.select.testingSetsNames).concat(['conditionStrVal']);
    var bingoSrcId = new Unmask(bingos.dataSrcId).v();
    shName = bingosLabel + '_' + tM;
    sB = SpreadsheetApp.openById(bingoSrcId).getSheetByName(shName);
    dB = gr.select.bingos && Array.isArray(gr.select.bingos[0]) ?
      [bingos.dataShHeader].concat(gr.select.bingos) : [bingos.dataShHeader];
    sB.getRange(1, 1, dB.length, dB[0].length).setValues(dB);
  } else {
    // uses lastRun bingos sheet while at next runs but first
    var tMLastRun = gr.select.lastRunTMark;
    var pG = [new RegExp(bingosLabel)];
    outputGrps = PEleCom.handle.setAnalysingGroups(pG);
    bingos = outputGrps[bingosLabel];
    /**
    * alternative methods (to .getParamFromGloss) need to be created:
    * which excludes the necessity to determine groups row number(?)
    * remark: It seams impossible in the case when csv-string format is used to store
    *   group's data in glossary because of different groups could have the same ssId,
    *   the same tmarks and therefore row abiguity pesisits. At this situation it's 
    *   neccesary or to complicate row selection criteria including values of few columns
    *   or directly select group row by group name,which is unique. The last is 
    *   prefferable because is simpler
    var groupLabel='groupLabel';
    var dShName=handle.getParamForGroupFromGloss(groupLabel,'dataShName','dataSrcTMark',tMLastRun);
    var bingosSsId=handle.getParamFromGloss(groupLabel,'dataSrcId','dataSrcTMark',tMLastRun);
    */
    var dShName = PEleCom.handle.getParamFromGloss('dataShName', 'dataSrcTMark', tMLastRun);
    dShName = new Unmask(dShName).v();
    var bingosSsId = PEleCom.handle.getParamFromGloss('dataSrcId', 'dataSrcTMark', tMLastRun);
    bingosSsId = new Unmask(bingosSsId).v();
    var sBingosLast = SpreadsheetApp.openById(bingosSsId).getSheetByName(dShName);
    var dBingosLast = sBingosLast.getDataRange().getValues();
    // combines previous bingos data array from last run sheet with newly selected ones
    var dBingos = gr.select.bingos && Array.isArray(gr.select.bingos[0]) ? dBingosLast.concat(gr.select.bingos) : dBingosLast;
    //new bingos sheet   
    shName = bingosLabel + '_' + tM;
    pGNew = {
      labels: [bingosLabel],
      tMark: tM,
      mode: 'newBatch',
      ssIdNewBatch: new Unmask(gr.dataSrcId).last()
    };
    pGNew.selectors = {};
    pGNew.selectors[pGNew.labels[0]] = {
      dataSrcTMark: tM,
      dataShName: shName
    };
    var outputGrpsNew = PEleCom.handle.setAnalysingGroups(pGNew);
    var bingosNew = outputGrpsNew[bingosLabel];
    bingosNew.dataShHeader = dBingosLast[0];
    var bingosNewSsId = new Unmask(bingosNew.dataSrcId).last();
    sB = SpreadsheetApp.openById(bingosNewSsId).getSheetByName(shName);
    // only new bingos in data array
    dB = gr.select.bingos && Array.isArray(gr.select.bingos[0]) ?
	[bingosNew.dataShHeader].concat(gr.select.bingos) : [bingosNew.dataShHeader];
    sB.getRange(1, 1, dB.length, dB[0].length).setValues(dB);
  }  
  return {
    bingosSheetName: sB.getName(),
    triggerId: ID_TRIGGER
  };
};
/**
* saves final data into spreadsheet on drive
* as separate group
* @param {Object}gr - last handled output group's object
* @param {string}grNm - group label
* @param {Integer}ig - index of current group men tioned above in output.dataGroups.names array
*/
handle.finalizeCondStrRun = function (gr, grNm, ig) {
  /**
  * завершение отбора, формирование строки итоговых даннх в glossary
  * удаление( если нет необходимости хранить)временных данных, 
  * исользовавшихся при поэтапном расчете.
  1.можно из папки тМ удалить файл temps_TM , или для начала добавить к названию _Archive
  Так как поиск временных файлов происходит по названию, то он не будет находиться при поиске
  Если временные файлы не создавались, в случае когда все посчитано за один прогон и не было 
  прерываний расчетов по лимиту времени, то ничего и нет для удаления. 
  Если были промежуточные скидывания данных во временные файлы, то временный файл имеет 
  имя temps_tM, где tM - временная метка, значение которой запомнено в свойстве
  gr.select.lastRunTMark
  2. в папке smsCik есть папка runs с таблицей и листом runs. В листе есть строка 
  со временем сессии и тМ временного файла. Из этой таблицы берется всегда последний файл,
  поэтому если эти записи останутся то он не будут мешать.
   
   описание формата
   
   если времени счета(time limit) одного прогона не достаточно, 
   формируются листы промежуточных результатов (бингос) в таблице, имеющей
   id = output.dataGroups.outGroupName.dataSrcId
   
   Сведения о каждом промежуточном наборе сохраняются в системной таблице runs,
   Таблица runs хранится в системной папке runs - smsCIK/runs,
   
   для каждого выполненного промежуточного прогона формируется строка данных
   необходимых для учета и запуска следующего прогона, а также формируется файл отчета прогона
   json - данные в текстовом формате. Имя временного файла temp_TM,
   где TM - временная метка текущего прогона
   
   В таблице runs создаются отдельные листы для каждой серии прогонов отбора.
   имя листа, накапливающего сведения о прогонах отборов данных конкретной
   выходной группы, содержит следующие мнемонические части  о
   run_<пользователь>_<outGrName>_<firstRunTM>
   Например: u0_preSelectedCKD_010710_231509
   - пользователь
     либо указывается email или его часть или для компактности номер пользователя
     uN, N начинается с 0, 0, 1, 2...
     Для данных пользователй существует системная таблица users.
     Каждому пользователю присваивается индекс и в строке для данного индекса, 
     хранятся данные пользователя этого номера.
     Таблица users хранится в системной папке sys/users/
   - выходная группа - имя(label) выходной группы
   - временная метка первого прогона
   
   Контроль: так как в название листа серии отборов включена метка первого прогона, 
   а на каждый прогон отводится одна строка, то можно контролировать условие
   временная метка в строке данных первого отбора совпадает с меткой, используемой
   в названии листа таблицы runs.
   
   сборка результатов
   бингос каждого промежуточного прогона сохранены в соответствующем бингос

  */
  // var scriptProperties=PropertiesService.getScriptProperties();
  // scriptProperties.deleteAllProperties();
  var grps = PEleCom.output.dataGroups;
  var tM = PEleCom.output.timeMark;
  var bingosLabel,bingos,pGNew,sB,dB,shName;
  
  bingosLabel=flipFlop(gr.Label,'_bingos');
  
  // fills in sheet of results - output data selected
  if (!gr.select.lastRunTMark) {
    // finish during fist run
    // creates output bingos group
    shName=bingosLabel + '_' + tM;
    pGNew = {
      labels: [bingosLabel],
      tMark: tM,
      mode: 'newBatch',
      ssIdNewBatch: gr.dataSrcId
    };
    pGNew.selectors = {};
    pGNew.selectors[bingosLabel] = {
      definition: 'Final results  of selection run using conditionStr for oupput group ' + gr.label,
      dataSrcTMark: tM,
      dataShName: shName
    };
    grps = handle.setAnalysingGroups(pGNew);
    bingos = grps[bingosLabel];
    bingos.dataShHeader = ['index'].concat(gr.select.testingSetsNames).concat(['conditionStrVal']);
    sB = SpreadsheetApp.openById(bingos.dataSrcId).getSheetByName(shName);
    dB = gr.select.bingos && Array.isArray(gr.select.bingos[0]) ?
      [bingos.dataShHeader].concat(gr.select.bingos) : [bingos.dataShHeader];
    sB.getRange(1, 1, dB.length, dB[0].length).setValues(dB);
  } else {
    //
    /** 
    * Combines all bingos saved in previous runs
    * 
    * - gets list of previous runs tM-marks from sheet 'runX' of spreadsheet 'runs'
    *
    * !!! spreadsheet 'runs' MUST be registered in Glossary so that it could be called
    * simply analogously like other groups and lik glossary
    * 
    */
    
    var ssRuns=SpreadsheetApp.openById(id)
    
    var tMLastRun = gr.select.lastRunTMark; // uses lastRun bingos sheet
    
    
    //
    
    
    
    // deletes or archived temps -file
    var f = DriveApp.getFilesByName('tempData_' + tMLastRun).next();
    f.setName(f.getName() + '_Archived');
    // ---
    var pG = [new RegExp(bingosLabel)];
    grps = handle.setAnalysingGroups(pG);
    bingos = grps[bingosLabel];
    var dShName = handle.getParamFromGloss('dataShName', 'dataSrcTMark', tMLastRun);
    var bingosSsId = handle.getParamFromGloss('dataSrcId', 'dataSrcTMark', tMLastRun);
    var dBingosLast = SpreadsheetApp.openById(bingosSsId).getSheetByName(dShName).getDataRange().getValues();
    var dBingos = gr.select.bingos && Array.isArray(gr.select.bingos[0]) ? dBingosLast.concat(gr.select.bingos) : dBingosLast;
    //new bingos sheet
    //var tM = PEleCom.output.timeMark;
    pGNew = {
      labels: [bingosLabel],
      tMark: tM,
      allNewInOne: true,
      ssIdAllNewInOne: gr.dataSrcId
    };
    pGNew.selectors = {};
    pGNew.selectors[pGNew.labels[0]] = {
      dataSrcTMark: tM,
      dataShName: bingosLabel + '_' + tM
    };
    grps = handle.setAnalysingGroups(pGNew);
    var bingosNew = grps[pGNew.labels[0]];
    bingos.dataShHeader = dBingosLast[0];
    sB = SpreadsheetApp.openById(bingosNew.dataSrcId).getSheetByName(bingosLabel + '_' + tM);
    dB = gr.select.bingos && Array.isArray(gr.select.bingos[0]) ? [bingos.dataShHeader].concat(gr.select.bingos) : [bingos.dataShHeader];
    sB.getRange(1, 1, dBingos.length, dBingos[0].length).setValues(dBingos);
  }
  return sB.getName();
};
/**
* 1.Separates input data sets indicated in isInData-selector of output group
* in consideration 
* ( isInData selector - is the value of cell in column 'isInData' of row containing
* this output group data)
* 2. Varifies these groups' elements for complying with logical expression written in 
* 'conditionStr' column and selects combinations (rows;elements of selected input groups)
* of input sets indicated resulting to (giving)  true value of this logical expression.
*
* Handles input data sets of output Groups
* procedure:
* makes initial preparations for:  
* - or first time run, 
* - or prolongation of calculation after getting previous run (terminated 
* earlier by time limit and saved) data from temporary file (analog of scriptProperties)
* The Selection is carried out in group by group manner. For each group already having been
* handled data are stored in approppriate output group spreadsheets/sheets
* @return {string|Object [][]}  
*   each row is array 
*   [indexOfMatching, iRowOfTestingSet0, iRowOfTestingSet1.., valueOfCondStrActualExpression]
*   valueOfCondStrActualExpression - is logical expression mentioning 
*   actual input sets data elemnts for actual combination of sets rows 
*   indices and properties names
*/
handle.varifyConditionString = function () {
  var inp = PEleCom.inpData;
  var out = PEleCom.output;
  var sets = inp.sets;
  var grps = out.dataGroups;
  var outGrNames = grps.names;
  var gr;
  var igrIni = handle.condStrSelectionRunInit(grps);
  for (var ig = igrIni; ig < outGrNames.length; ig++) {
    var grNm = outGrNames[ig];
    // sequencial choosing of analyzing group
    gr = grps[grNm];
    // -- SELECT --
    var chckCStr = handle.selectByConditionStr(gr);
    // == SELECT ==
    // results
    if (typeof chckCStr === 'string') {
      if (chckCStr === 'all') {
        gr.select = gr.select ? gr.select : {};
        gr.select.condStrRes = 'all';
        // every element(row) of analised group complies with selection criteria
        // go to next group
        continue;
      }
    } else if (typeof chckCStr === 'number') {
      var nBingos = chckCStr;
      gr.select.condStrRes = nBingos;
      Logger.log(
        'number of positive conditionStr results for current group ' + 
        gr.label + ' = ' + nBingos +
        '\n' + 'полное количество проверок условия отбора= ' +
        PEleCom.output.nCondStrCheckings);
    }
    if (gr.select.step && gr.select.step == 'timeExpired') {
      // prepares next selection run
      var toLaunchOverTime = 90 * 1000;
      handle.prepareNextCondStrSelectRun(gr, grNm, ig, toLaunchOverTime, 'testSelect');
      break;
    } else {
      // regular process termination (timeLimitCheck= ok )
      handle.finalizeCondStrRun(gr, grNm, ig);
    }
  }
  // end of output groups loop
  var tFinish = new Date().getTime();
  var nCondStrCheckings = PEleCom.output.nCondStrCheckings;
  // need to be reset
  Logger.log('number= %s,\ntFininish= %s,\ntStart= %s,\ntime= %s secs,\nmilliSecsPerCycle= %s\n', gr.select.number,
             tFinish, tStart, (tFinish - tStart) / 1000, (tFinish - tStart) / nCondStrCheckings);
};
/**
* uses multiIndex to select elements from
* input Setes 'our' and 'smsCik' by tel number and UIK
* for 'our' :
*          phoneNumbers are in column named 
*               - 'телефон' witn column index [10]
*          UIK  - '№ УИК'             [2] appropriately
* for 'smsCik' :
*         phoneNumber - 'number' [2]
*         UIK         - 'uik' [1]

* for 'smsCikSite':
*      phone-  'nabludatel' 
*/
function selectByMultiIndex() {
  // uses multiIndices
  var sets = PEleCom.inpData.sets;
  var mind = handle.multiIndex.init('sets');
  var setsNms = PEleCom.inpData.sets.names;
  for (var ist = 1; ist < setsNms.length; ist++) {
    var sNm = setsNms[ist];
    if (!/(our|smsCik)$/.test(sNm)) {
      continue;
    }
    var data = sets[sNm].data;
    var ind,miss;
    for (var i = 1; i < data.length; i++) {
      miss=false;
      if (sNm == 'our') {
        ind = data[i][10] + '_' + data[i][3];
      //} else {
      }else if(sNm=='smsCik'){
        ind = data[i][2] + '_' + data[i][1];
      }else{
        miss=true;
        throw("incorrect group's name. Bad logic.");
      }
      if(!miss){
        mind.add(ind, sNm + '_' + i);
      }
    }
  }
  var mindR = mind.r;
  var notUnique = 0;
  var res = [[
    'N',
    'our/smsCik',
    'smsCik',
    'our_тел',
    'our_УИК',
    'smsCik_tel',
    'smsCik_UIK']
  ];
  var details,irOur,irSms,mP0,mP1;
  for (var r in mindR) {    
    if (mindR[r].length > 1){
      // controls used to exlude occasional r-values ['our_x','our_y']
      mP0=mindR[r][0].split('_')[0];
      mP1=mindR[r][1].split('_')[0];
      if(mP0 != mP1){
        notUnique++;
        Logger.log(notUnique + '. ' + mindR[r].toString());
        irOur=parseInt(mindR[r][0].replace(/^our_/,''),10);
        irSms=parseInt(mindR[r][1].replace(/^smsCik_/,''),10);
        details= [sets.our.data[irOur][10],
                  sets.our.data[irOur][3],
                  sets.smsCik.data[irSms][2],
                  sets.smsCik.data[irSms][1]
                 ];
        res.push([notUnique].concat(mindR[r],details));
      }
    }
  }
  Logger.log(notUnique);
  var tFinish = new Date().getTime();
  Logger.log('number= %s\n, tFininish= %s\n, tStart= %s\n, time= %s\n secs, milliSecsPerCycle= %s\n',
             notUnique, tFinish, tStart, (tFinish - tStart) / 1000,
             (tFinish - tStart) / ((sets.our.data.length - 1) * (sets.smsCik.data.length - 1)));  
  var ss=SpreadsheetApp.create('multiIndexTest_'+PEleCom.output.timeMark);
  var s=ss.insertSheet('mindTestResults',0);
  s.getRange(1,1,res.length,res[0].length).setValues(res);
  
  Logger.log('end of selectByMultiIndex');
  return res;
  
}
/**
* Runs Selection procedure with time limit control
* and two different selection algorithms(mode)
* @param {string}mode - mode of algorithm used 
* 1. selection criteria rules testing in cycles (conventional) - 'condStringMatch'
* 2. by means of using multiIndex engine - 'multiIndex'
*/
function testRun(){
  var mode;
  mode = 'multiIndex';
  //mode='condStringMatch';
  runSelect(mode);
}  
function runSelect(mode) {
  var handle = PEleCom.handle;
  var sets = PEleCom.inpData.sets;
  var tStart = new Date().getTime();
  sets = handle.setAnalysingGroups([
    /our/,
    /smsCik/
  ], sets);
  // input sets
  var out = PEleCom.output.dataGroups;
  //  // output groups
  //output.oneSsForAllMode=true; // it's default value. and is shown here only for reminding
  //var resFldId=ID_FLD_RESULTS;// default value="0B9mOESHtO2LXdTQyS0VJM2xuNzA";  // id of folder smsCIK_Results
  out = handle.setAnalysingGroups(/preCSelectdCKD/);
  PEleCom.output.nCondStrCheckings = 0;
  // total number of conditionStr checkings fulfilled during the run
  switch (mode) {
  case 'condStringMatch':
    handle.varifyConditionString();
    break;
  case 'multiIndex':
    selectByMultiIndex();
    break;
  }
  Logger.log('Finish Selection');
}