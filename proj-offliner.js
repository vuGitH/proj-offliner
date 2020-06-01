/**
 * @fileoverview
 * module proj-offlener - splits single AppsScript project's json file
 * donloaded from Google Drive into few files from which the project
 * consists of for modifying and editing these files locally
 * This banch of files will be named bellow as 'asp-filess' or 'asp-filess'
 * derived from the assignment Apps Script project files
 * independently of their real extention which could be .js|.html|.json
 */
var fs = require('fs');
var cp = require('child_process');
var path = require('path');

module.exports = (function(){

  var polO = {};
  /**
   * gets event's emitter object instance
   * @return {object} events emitter instance object
   */
  polO.getEventsEmInstance = function (){
    var Events = require('events');
    class EE extends Events{}
    return new EE();
  };
  polO.paramsNames = [
    'act','fromFile','prefixTo', 'pathTo','pathFrom','assFileName',
    'outputFile','label'];
  /* ---------------- LOG  -------------------------------*/
  /**
   * log object to register procedure steps of files' handling
   * by statuses: 'beforeWrite','written', 'error',...
   * @property {Array.<object>}polO.log.assFile - full path to assembling
   *     json file
   * @property {Array.<object>}polO.log.files
   * @property {string} polO.log.files[i].path
   * @property {string} polO.log.files[i].status
   */
  polO.log = {};
  polO.log.nFilesAlreadyRead = 0;
  polO.log.nFilesToRead = 0;
  polO.log.filesStatus = {};
  polO.log.nOutFilesFixed = 0;
  /**
   * @property {Object} polO.log.point object of test printing with detailes
   *     each print point inside any method has array of switches which
   *     on or off console.log print dependent on value 1 or 0 of appropriate
   *     Array's element value.
   */
  polO.log.point = {
    off: function(group){
      var pp = polO.log.point;
      var vs = Object.values(pp),
          ks = Object.keys(pp),
          g = pp[group];
      if(!group || group === 'all'){
        vs.forEach((el,j)=>{
          if(Array.isArray(el)){
            el.forEach((e,i) => {polO.log.point[ks[j]][i]= 0;});
          }
        });
      }else{
        if(Array.isArray(g)){
          g.forEach((e,i) => {polO.log.point[group][i] = 0;});
        }else{
          throw "incorrect callee method name!";
        }
      }
    },
    on: function(group){
      var pp = polO.log.point;
      var vs = Object.values(pp),
          ks = Object.keys(pp),
          g = pp[group];
      if(!group || group === 'all'){
        vs.forEach((el,j)=>{
          if(Array.isArray(el)){
            el.forEach((e,i) => {polO.log.point[ks[j]][i]= 1;});
          }
        });
      }else{
        if(Array.isArray(g)){
          g.forEach((e,i) => {polO.log.point[group][i] = 1;});
        }else{
          throw "incorrect callee method name!";
        }
      }
    },
    /**
     * switch off all log prints excluding few ones for method
     * 'group' specified. parameter member set indicis of group's
     * prins members to switch on.
     * @param {string} group method name whos lop prints to switch on
     * @param {number|Array.<number>} member number of print or array
     *   of numbers of log prints to switch on
     */
    offExept(group,member){
      var pp = polO.log.point;
      pp.off('all');
      if(Array.isArray(member)){
        member.forEach((im)=>{pp[group][im] = 1;});
      }else{
        if( typeof( member) !== 'number'){
          console.log('print member should be a number but is %s' +
          '0 is used' ,member);
          member = 0;
        }
        pp[group][member] = 1;
      }
    },
    /**
     * Changes log print setting for method specified
     * For test reason polO.log.point object has print points array
     * polO.log.point.methodName with elements 1 or 0 mean printOn or Off.
     * @param {number|Boolean} onoff switch flag. 1 or 0 or any other type's
     *   values provide  equivalent value of (onoff) ? 1 : 0;
     * @param {string} gr group name(method name)
     * @param {string} inds string of indices of polO.log.point[gr] array
     *   elements which values should be set to onoff param value
     * @example .setlp(1,'workTest','0,5,6') sets polO.log.point.workTest 
     *   array's elements with indices 0,5 and 6 to 1 - means 'print on'.
     */
    setlp(onoff,gr,inds){
      var vs = polO.log.point[gr],
          v = inds.split(',');
      vs.forEach((e,i) => {    
      if( v.indexOf(''+i) >= 0){   
        polO.log.point[gr][i] = (onoff)? 1:0;      
      }});
    },
    ppp: [1],
    getOutputFile: [1,0],
    getPathFrom: [1,1,1],
    evokeAspFiles: [1],
    workTest: [1,0,0,0,0,0,0,0,0,0,0,0],
    runLauncher: [1],
    run: [1,1,1],
    runGetOptionsObj: [1,1,1,1],
    runArg_0_1_obj_or_file: [1,1,1],
    runArg_1_2_obj_or_file: [1,1],
    runArg_2_fromFile_gear: [1],
    runArgsToOptions:[1,1],
    work: [1,1,1,1],
    evokeScriptsFromObj: [1,1,1],
    writeParamsFile: [1,1,1],
    eEndpoint: [1,1],
    aEndpoint: [1],
    assembleProjFile: [1,1],
    preUploadFile: [1,1,1],
    preUploadFileAsync: [1,1,1],
    writeAssFile: [1,1],
    getAssFileName: [1],
    mems: {
      workTest: []
    }
  };
  polO.log.point.evokeAspFiles.print = [
    function(fromFile, opt_prefixTo, opt_act, label){
      console.log('\n\ninside evokeAspFiles begins with parameters:' +
                  '\n  >----------<\n' +
                  'fromFile=\n' +fromFile+ '\n' +
                  'opt_prefixTo=\n' + opt_prefixTo +'\n' +
                  'polO.fromFile= \n' + polO.fromFile + '\n' +
                  'opt_act= ' + opt_act +'\n' +
                  'polO.act= ' + polO.act + '\n' +
                  'label = ' + label +
                  '\n  >----------<\n');
    }
  ];
  polO.log.point.work.print = [
    "",
    function(act,prefixTo,pathTo,fromFile){
      console.log('\n\nInside work:\n  >-------vvvvv-------<\n'+
                'polO.pathTo=\n%s\n' +
                'polO.pathFrom=\n%s\n' +
                'act=%s\n' +
                'pathTo = \n%s\n'+
                '__dirname = \n%s\n' +
                'prefixTo = \n%s\n' +
                'fromFile = \n%s' +
                '\n  >------^^^^^^--------<\n',
                polO.pathTo,
                polO.pathFrom,act,
                pathTo,
                __dirname,
                prefixTo,
                fromFile);
    },
    function(act,mode){
        console.log(
          'in work: after evokeAspFiles with \'%s\' action parameter\n' +
          'polO.pathTo=\n%s and mode=%s', act, polO.pathTo, mode);
    }
  ];
  polO.log.point.run.print = [
    "",
    "",
    function(options){       // .print[2]()
      console.log('before work call \n' +
        'options object properties and equivalents polO.params:\n%s \n',
        (function(){
          var str='';
          for( var i in options){
            str += 'opts.' + i + '=' + options[i] + '\npolO.' + i + '=' +
                  polO[i] + '\n';
          }
          return str;
        }()));
    }
  ];
  polO.log.point.evokeScriptsFromObj.print = [
    function (pathTo,dObj){  // [0]
      console.log(
        '\n\nInside polO.evokeScriptsFromObj: Temporary folder is ready:' +
        '\n%s\n'+
        'Data object received. String length= %s',
        pathTo,
        JSON.stringify(dObj).length );
    },
    function(iti){           // [1]
              console.log('\n\nin placeScriptsTo: timeInterval cleared at' +
                         ' attempt number(iti) =%s',iti);
    },
    function(pathTo){        // [2]
      // last file handled
      console.log('AppsScript\'s-proj Files are evoked into folder:\n' +
        pathTo +'\n');
    }
  ];
  polO.log.point.assembleProjFile.print = [
    function(
      opt_fromFile, opt_pathFrom, opt_assFileName,  opt_outputFile, label){
      // print[0]
        console.log(
        '\n\nInside assembleProjFile\n'+
        '\n------vvvvvv------\n' +
        'opt_fromFile =\n%s\n' +
        'opt_pathFrom =\n%s\n' +
        'opt_assFileName =\n%s\n' +
        'opt_outputFile =\n%s\n' +
        'label = %s' +
        '\n------^^^^^^------\n',
        opt_fromFile,
        opt_pathFrom,
        opt_assFileName,
        opt_outputFile,
        label);
    },
    function(pathFrom, fromFileCopy){  // print[1]
      console.log('in assembleProjFile: Before assembleFileReady event emit \n' +
        'pathFrom=\n%s\n' +
        'fromFileCopy=\n%s',
        pathFrom,
        fromFileCopy);
    }
  ];
  polO.myEE = polO.getEventsEmInstance();

  /** @property {number} polO.timeLag lag in milliseconds used in runLancher
   * to delay next test run inside polO.workTest() method */
  polO.timeLag = 0;

  // path parts separator
  polO.sep = (function(){
    return path.sep === '\\' ? '\\' : '/';
  }());

  /** @property {string}polO.label unique identifier of project or run */
  /** @property {string}polO.act  action specification parameter  */
  /** @property {string}polO.fromFile  full path to source json file */

  polO.label = '';
  polO.act='';
  polO.fromFile = "";
  polO.pathTo = "";
  polO.pathFrom = "";
  polO.assFileName = "";
  polO.prefixTo = "";
  polO.no6 = false;

  //  --- UTILITIES  ------
  /**
   * separates json file name from path
   * @param {string}fPath
   * @return {Object|boolean} false if file is not json-file
   *   @property {string} o.fnm file name
   *   @property {string} o.dir file path
   *   @property {string} o.ext file extension
   */
  polO.separatePathAndFileName = function(fpath){
    if((typeof fpath !== 'string') ||
       (path.extname(fpath) !== '.json')){
         return false;
       }
    return {
      fnm: path.basename(fpath),
      dir: path.dirname(fpath),
      ext: path.extname(fpath)
    };
  };
  /**
   * On the bases of full file path creates prefixTo path
   * comprising of path to file's host folder and file name without extension
   * which could be used or as pathTo directory during asp-files extraction
   * from json file or for new file path at assembling new json file
   * @param {string} fp - full path to json file including the file name
   * @return {string} path to subdirectory named as fileName without
   *   extension or empty string ''
   */
  polO.fileNameToPath = function (fp){
    var o, prfx;
    var sp = polO.sep;
    o = polO.separatePathAndFileName(fp);
    prfx = o.fnm ? o.fnm.replace(/\.json$/,''):"";
    if(/\//.test(o.dir)){
      return prfx? o.dir + '/' + prfx : "";
    }else if(/\\/.test(o.dir)){
      return prfx? o.dir+sp + prfx : "";
    }else{
      if(prfx){
        return (o.dir)? o.dir + sp + prfx :"";
      }
      return "";
    }
  };
  /**
   * creates new subdirectory(-ies) if path contains nonexistent ones
   * @param {string}pth of directory (probably nonexistent)
   * @return {void}
   */
  polO.preparePath = function(pth){
    var sub, dnm;
    if( !fs.existsSync(pth) ){
      sub = pth.split(path.sep);
      sub.forEach( function(el,j,su){
        dnm = su.slice(0,j+1).join(path.sep);
        if( !fs.existsSync( dnm ) ){
          fs.mkdirSync( dnm );
        }
      });
    }
  };
  // ------------------- EVOKE ASP-FILES --------------------
  /**
   * 'toFolderReady' event emitter
   * Sets temporary folder where to write evoking asp-files.
   * Folder path is determined by adding six random characters to prefixTo path
   * or sets destination path as polO.pathTo if it's set.
   * !!It is possible to set fixed path of destination folder on user choice
   * but this should be done by setting property polO.pathTo DIRECTLY!!.
   * @param {string}label - identifier of project being handled
   * @param {string}fromFile - full path to json file from which sources data
   *   are extracted
   * @param {string}opt_prefixTo - string representing a part of a full path
   *   to which six random characters will be added to form path to new
   *   directory to be created. This path is passed to callback function
   *   of fs.mkdtemp() as second parameter and appropriate directory
   *   will be created.
   * @param {string} opt_act actual value of action parameter. Optional
   * @param {string} opt_mode
   * @return {string} path to destination folder
   *   if full path to newly created directory would have been determined
   *   the polO.pathTo will have been set and event 'toFolderReady' will be
   *   fired,  otherwise
   *   polO.pathTo === undefined without appropriate event emitting
   */
  polO.evokeAspFiles = function(label, fromFile, opt_prefixTo, opt_act, opt_mode){
    var act = opt_act || polO.act;
    var mode = opt_mode||'req';
    var lp = polO.log.point.evokeAspFiles;
    var pathTo, prefixTo;

    if(lp[0]){    // log print
      lp.print[0](fromFile, opt_prefixTo, act, label);
    }
    // output folders
    /**
     * @description
     * - if opt_prefixTo is not set checks polO.prefixTo
     * - if polO.prefixTo is not set, file name of fromFile without
     * extension is used as prefixTo and the directory with name
     * <prefixTo>XXXXXX will be created inside fromFile's host folder and
     * will be assigned as pathTo for asp-filess being going to be extracted
     * will have been placed there.
     * XXXXXX - 6 random alphanumerical characters
     *
     * - in the case when it's necessary to use some path specified as -pathTo-
     * parameter without appending six random characters to the name of folder
     * the following Rules should be followed by:
     * 1. property polO.no6 should be set true and
     * 2. polO.prefixTo as well as opt_prefixTo should be empty string ''.
     * 3. The value of pathTo is taken from polO.pathTo property  when
     *    opt_act parameter ='eto'
     * 4. if the folder with path -pathTo- does not exist it will be created.
     */
    /*    prefixTo = opt_prefixTo || polO.prefixTo ||
        ( !polO.no6 && !polO.pathTo ? polO.fileNameToPath(fromFile)+'_' : '') ;*/
    polO.prefixTo = prefixTo = polO.getPrefixTo (act, fromFile, opt_prefixTo);
    if(polO.no6){
      if(polO.pathTo){
        pathTo = polO.pathTo;
        polO.no6 = false; // resets to default value
        if( !fs.existsSync(pathTo) ){
          fs.mkdir(pathTo,function(err){
            if(err){
              console.log(err+'\n' +
                  'failed to create new directory\n%s',pathTo);
            }
            polO.myEE.emit('toFolderReady', label, fromFile, pathTo, act, mode);
          });
          return;
         }
        polO.myEE.emit('toFolderReady', label, fromFile,pathTo,act,mode);
        return;
      }else{
        throw "Attention! no6 parameter is true but pathTo is not set";
      }
    }
    if( !prefixTo){
      throw 'Logical error. polO.prefixTo should be determined here.';
    }
    // prefixTo is set
    fs.mkdtemp(prefixTo,function(err, pathTo){
      if(err){
        console.log(
        "Error while creating temporary folder by means of fs.mkdtemp "+
        err);
        polO.pathTo = undefined;
      }
      polO.pathTo = pathTo;
      polO.myEE.emit('toFolderReady', label, fromFile, pathTo, act, mode);
    });
  };
  /**
   * 'toFolderReady' event listener
   * reads input json-file from drive by means of node.js fs module and
   * transforms  it's content into an object, then
   * emits custom event 'objReady' to chain next calculation
   * with parameters for callback function:
   * @param {string} label identifier of the project being handled
   * @param {string} fromFile absolute path to json - file including name
   * @param {string} pathTo absolute path to folder where to place results
   * @param {string} act- actual value of action parameter
   * @param {string}opt_mode - method's mode:
   *   "req" default - gets json file with Google appScript project codes
   *      and returns appropriate object by means of node require() function
   *   "rf" - gets object by parsing data preliminary read by
   *          fs.readFile object
   * @return {Object|void} JSON.parse(json-data) object or void in the case
   *   of js-project scripts
   */
  polO.evokeObjFromFile = function (label, fromFile, pathTo, act, opt_mode){
    var mode = opt_mode || 'req';
    var dObj, d_out;
    if( mode === 'rf') {
      fs.readFile(fromFile, function(err,data){
        if(err){
          console.log('Error %s\nhas occurred in evokeObjFromFile listener\n' +
          ' while reading file %s' +
          '\nmode=%s:', err, fromFile, mode);
        }else{
          dObj = JSON.parse(data);
          polO.dObjOut = JSON.parse(data);
          polO.myEE.emit('objReady', label, dObj, fromFile, pathTo, act);
        }
      });
    }else if(mode === 'req'){
      dObj = require(fromFile);

      if( /a/.test(act)) {
        d_out = JSON.stringify(dObj);
        polO.dObjOut = JSON.parse(d_out);
      }
      polO.myEE.emit('objReady',label,dObj,fromFile,pathTo,act);

    }else{
      console.log('bad mode value = %', mode);
      throw 'bad mode value';
    }
  };
    /**
   * "objReady" event's listener
   * Checks if dObj has property dObj.files if 'yes' -
   * copy files scripts' - files[i].source - content into
   * separate files and writes them into pathTo directory
   * evokes scripts from .source properties of dObj.files array
   * elements and writes them in appropriate files within pathTo
   * @param {string} label identifier of project being handled
   * @param {Object} dObj - object got from require(fromFile json-file)
   * @param {string} fromFile absolute path to json - file including name
   * @param {string} pathTo - folder path where to place scripts' asp-filess
   * @param {string} act - actual value of action parameter
   * @return {void} creates or rewrites file on drive
   */
  polO.evokeScriptsFromObj = function (label, dObj, fromFile, pathTo, act){
    var lp = polO.log.point.evokeScriptsFromObj;

    if(!dObj){
      throw( 'dObj parameter is undefined or null');
    }else if(!(dObj.hasOwnProperty('files') || !Array.isArray(dObj.files))){
      console.log('object has no dObj.files property or this\n' +
                  'property is not an Array!');
      return;
    }
    if(lp[0]){
      lp.print[0](pathTo,dObj);
    }

    var sep = polO.sep;
    var files = (dObj.hasOwnProperty('files')) ? dObj.files:[];
    var file,fName,fScript,fw,
        fExt; // file's extension
    /**
     * logs error. Callback function for fs.writeFile(...) method.
     * This will get called when write operation completes.
     * @param {Error} err  JavaScript Error object
     * @return {string}
     */
    function fWriteError(err){
      if(err){
        console.log(err +
            "\noccurred while trying to write a file" +
            " for i=%s and file.name=%s",
          i,fName);
      }
    }
    if(files && Array.isArray(files) && files.length > 0){
      for(var i = 0; i < files.length;i++){
        file = files[i];           // each file is an object
        fName = file.name;
        fExt = file.type ? polO.setFileExtention(file.type) : 'unknown';
        fScript = file.source;    // javaScript codes
        fw = pathTo + sep + fName + "." + fExt;

        fs.writeFile(fw, fScript, fWriteError);
      }
      var iti=0;
      var ti = setInterval(function(){
          var lp = polO.log.point.evokeScriptsFromObj;
          if( fs.readdirSync(pathTo).length === files.length ){
            clearInterval(ti);
            if(lp[1]){
              lp.print[1](iti);
            }
            if(lp[2]){
              lp.print[2](pathTo);
            }  // last file handled

            // opens Windows files Explorer for folder with asp-filess written.
            var childProc = cp.execSync(
                'start explorer.exe ' +
                '"' +
                pathTo+
                '" & exit');

            /* writes parameters file into ./params folder (synchronously)
             * (or asynchronously) */
            polO.writeParamsFile(label, fromFile, pathTo, act);
            //return;
          }else{
            iti++;
          }
        }, 1);
     }else{
      console.log('dObj.files property is not set or is empty');
    }
  };
  /**
   * sets file extention value depending on
   * fileType parameter. Known file.type parameter's
   * values are: 'server_js'|'html'|'json'
   * @param {string} fileType
   * @return {string} "js"|"html"|"json"
   */
  polO.setFileExtention = function (fileType){
    return /js\b/.test(fileType) ? 'js' : fileType;
  };
  /**
   * writes params - json file into ./params folder
   * @param {string}label identifier of project being handled
   * @param {string}fromFile - folder with asp-filess. Should be renamed as pathFrom
   * @param {string}pathTo - directory path
   * @param {string}opt_pathFrom - path of directory from which asp-filess should
   *     be taken for assembling output json file
   * @param {string}opt_act - actual value of action parameter
   * @param {string}opt_prefixTo - prefix used to create pathTo if any
   * @param {string}opt_assFileName
   * @param {string}opt_outputFile
   * @return {string} params-file path
   */
  polO.writeParamsFile = function(label,fromFile, pathTo, opt_act,
                                  opt_prefixTo, opt_pathFrom, opt_assFileName,
                                   opt_outputFile){
    var act = opt_act || polO.act || '';
    var prefixTo = opt_prefixTo || '';
    var pathFrom = opt_pathFrom || '';
    var assFileName = opt_assFileName || '';
    var outputFile = opt_outputFile || '';
    var o = {
      act: act,
      fromFile: fromFile,
      prefixTo: pathTo.replace(/\w{6}$/,''),  // does not need here (?)
      pathTo: pathTo,                         // does not need here (?)
      pathFrom: pathTo,
      assFileName: assFileName,
      outputFile: outputFile,
      label: label
    };

    var sep = polO.sep,
        lp = polO.log.point.writeParamsFile;
    var fnm = path.basename(fromFile,'.json'); // file name without extension
    var fpth = __dirname + sep + 'params' + sep + fnm + '_0_params.json';
    fpth = polO.checkParamsFileName(fpth);
    polO.paramsFile = fpth;

    var data = JSON.stringify(o);
    if( act === 'ea'){
      fs.writeFileSync(fpth, data);
      if(lp[0]){
        console.log('params json file \n%s\n has been written',
          fpth);
      }
      polO.myEE.emit('endpoint-e',label, fromFile,pathTo,act);
    }else{
      if(lp[1]){
        console.log(
          '\n\nin writeParamsFile: writes params-file asynchronously\n\n');
      }
      fs.writeFile(fpth, data,'utf-8',function(err){
        if(err){
          console.log('error occured while writitng params-file :\n%s',err);
        }
        if(lp[2]){
          console.log('\nParamsFile has been written, it\'s path =\n%s',fpth);
        }
        polO.myEE.emit('endpoint-e',label, fromFile,pathTo, act);
      });
    }
    if(0){
      // ToDo: writes using streams objects
    }
    return fpth;
  };
  /**
   * increases by one digital part of pathname
   * if the part of file name before extention and
   * after last underscore is not digital
   * nothing is changed and original file name will be returned
   * @param {string} pth path tested
   * @param {string} strPartFollows string part before wich digit
   *   is checked and increased by one if any
   */
  polO.increaseDigitInPath = function(pth, strPartFollows){
    var nm, a, lastPrt, i, iplus;
    var digsPtt = /[0-9]+/;
    var patt = new RegExp(strPartFollows);
    nm = pth.replace(patt,'');
    a = nm.split('_');
    lastPrt = a[a.length - 1];
    if(!digsPtt.test(lastPrt)){
      return pth;
    }
    i = parseInt(lastPrt);
    iplus = i + 1;
    return nm.replace(/\_\d+$/,'') + "_" + iplus + strPartFollows;
  };
  /**
   * 'endpoint-e' event listener (evoke)
   * @param{string} label identifier of project being handled
   * @param {string} pathTo path to the directory where asp-filess have been
   *     located.
   * @param {string} fromFile - original json-file
   * @param {string} act - actual value of act parameter
   */
  polO.eEndpoint = function (label,fromFile,pathTo, act){
    var pathFrom,
        lp = polO.log.point.eEndpoint;
    if(lp[0]){
      console.log('\n\nEndpoint of Evoke-mode has been reached.'+
                ' Event \'endopoint-e\'\n'+
                'label = '+ label +
                '\npathTo =\n' + pathTo );
    }
    if( act === 'ea'){
      pathFrom =  pathTo;
      polO.pathFrom = pathFrom;
      polO.pathTo = '';
      polO.work(label,'a',fromFile,'',pathFrom);
    }
    if(lp[1]){
      console.log('Exit from eEndpoint without chaining for\n' +
        'fromFile=\n%s\n' +
        'label = %s\n'+
        'and act= %s',
        polO.fromFile,
        label,
        act);
    }
  };
  //  ----------------------  ASSEMBLE -----------------

  /**
   * 'assembleFileRedy' event emitter
   * Assembles scripts content of asp-files modified into json file
   * prepared to uploading it to Google Drive AppsScript project.
   * @param {string} label identifier of project being handled
   * @param {string} opt_fromFile  (originalJsonFileDownloaded) full file path of
   *    original Google project json file downloaded from GoogleDrive
   * @param {string} opt_pathFrom path to the destination folder for output
   *     json file. This is the same folder where asp-files modified,
   *     obtained from original json-file, were placed earlier and appropriately
   *     are taken from.
   * @param {string} opt_assFileName output json file name to be written.
   *    Optional. By default name is
   *    <originalJsonFileDownloadedWithoutExtention> + "_modified_N.json"
   *    where N after 'modified_' is string number showing the version of
   *    assembled file provided in sequential calculation run. N is increased
   *    each time by one, to guaranty that outputFile's version do not overwrite
   *    one another.
   *    and whose destination folder path is opt_pathFrom
   *    (rule for outputFile location and name).
   *
   * @param {string}opt_outputFile - full path of final output json file including
   *     file name and extension (.json)
   * @returns{string} json string being the content of json file prepared for
   *    uploading
   *   and writes new file named originalJsonFileDownloaded + "_modified.json" to
   *   opt_pathFrom directory.
   *   output file name and place:
   *   opt_assFileName if it's set or
   *   originalJsonFileDownloaded + "_modified_N.json" to opt_pathFrom folder.
   *   ( opt_assFileName, opt_pathFrom etc. here are string
   *   variables.)
   */
  polO.assembleProjFile = function(
      label, opt_fromFile, opt_pathFrom, opt_assFileName, opt_outputFile){
    var lp = polO.log.point.assembleProjFile;

    if(lp[0]){
      lp.print[0](
        opt_fromFile, opt_pathFrom, opt_assFileName,  opt_outputFile, label);
    }

    /** @proprety {string} outputFile user predefined full path of output file*/
    var outputFile;
    var ouF, fromFile, fF, pathFrom, pF, fromFileCopy;

    outputFile = ouF = opt_outputFile || polO.outputFile;
    fromFile = fF = opt_fromFile || polO.fromFile;
    pathFrom = pF = (opt_pathFrom ? opt_pathFrom :
                          ((polO.pathFrom) ? polO.pathFrom : 'unKnown'));

    polO.fromFile = fromFile;

    if(!fromFile){
      throw 'in assembleProjFile: original json file has not been set';
    }
    polO.assemble = true;

    fromFileCopy = polO.assfile(opt_fromFile, opt_pathFrom, opt_assFileName,
                                opt_outputFile);
    if(!fromFileCopy){
      throw "assemble file predecessor can't be set";
    }
    fs.copyFile(fromFile, fromFileCopy, function(err){
      if(err){
        throw(err);
      }
      if(lp[1]){
        lp.print[1](pathFrom, fromFileCopy);
      }
      // emits assembleFileReady event
      polO.myEE.emit('assembleFileReady',label, fromFileCopy,
                     pathFrom, outputFile,'req');
    });
  };
  /**
   * determines out assemble file's full path, file name and
   * file parent directory using actual parameters and
   * project rules used.
   * if necessary copies fromFile into assFile
   * directory assigned
   * @param {string} opt_fromFile
   * @param {string} opt_pathFrom
   * @param {string} opt_assFileName
   * @param {string} opt_outputFile
   * @return {string} presumed output assemble file full path
   */
  polO.assfile = function(opt_fromFile, opt_pathFrom, opt_assFileName,
                          opt_outputFile){
    var oFP,
        outFileName,
        outPath,
        sp = polO.sep,
        fromFile,
        outputFile,
        af;

    /* @proprety {string} outputFile user defined full path of ass file */
    outputFile = opt_outputFile || polO.outputFile;
    if(outputFile){
      return outputFile;
    }

    // original input file full path
    fromFile =  opt_fromFile || polO.fromFile || undefined;
    oFP = (fromFile) ? polO.separatePathAndFileName(fromFile) : null;

    // path of output file derived from algorithm used
    outPath = opt_pathFrom ?
              opt_pathFrom :
              (polO.pathFrom ? polO.pathFrom : undefined);
                             // ((oFP)? oFP.dir : undefined));
    if(outPath){
      // creates outPath directory if it not exists
      polO.preparePath(outPath);
    }else{
      throw "can't to determine assemble file directory!";
      //return null;
    }
    // opt_assFileName,
    var oaFN = opt_assFileName,
        paFN = polO.assFileName;

    outFileName  = ( function(){
        if(oaFN){
          return (!/\.json$/.test(oaFN)) ? oaFN + '.json' : oaFN;
        }else if(paFN){
          return (/\.json$/.test(paFN)) ? paFN : paFN + '.json';
        }else if(oFP){
          return oFP.fnm.replace(oFP.ext,'') + '_modified_0.json'; // file name
        }else{
          return undefined;
        }
    }());
    if(!outFileName){
      return false;
    }
    af = outPath + sp + outFileName;  // full path
    // check availabilty and increases digital part if any
    return polO.checkAssFileName(af);
  };
  /**
   * 'assembleFileReady' event listener
   * by means of fs module reads input json-file from drive and
   * transforms  it's content into an object then
   * emits custom event 'preUploadAssembleFile' to chain next calculations:
   * the content of dObj.files[i].source properties will be exchanged by
   * scripts of asp-filess preliminary modified locating in pathFrom directory.
   * @param {string} label identifier of project being handled
   * @param {string} fromFile absolute path to json - file including name
   * @param {string} pathFrom absolute path to where asp-filess already
   *     modified are stored.
   * @param {string} opt_outputFile -
   * @param {string} opt_mode - method's mode:
   *   "req" default - gets json file with Google appScript project codes
   *    and returns appropriate object by means of node require() function
   *   "rf" - gets object by parsing data preliminary read by fs.readFile
   *    object
   */
  polO.evokeObjFromAssFile = function (label,fromFile,
                                       pathFrom,opt_outputFile,opt_mode){
    var mode = opt_mode || "req";
    var dObj;

    if( mode === 'rf') {
      fs.readFile(fromFile,function(err,data){
        if(err){
          console.log('Error %s\nhas occurred in evokeObjFromAssFile\n' +
          ' while reading file\n%s\n' +
          'mode=%s:', err, fromFile, mode);
        }else{
          dObj = JSON.parse(data);
          polO.myEE.emit('preUploadAssembleFile', label, dObj,
                         fromFile, pathFrom, opt_outputFile);
        }
      });
    }else if(mode === 'req'){
      dObj = require(fromFile);
      polO.myEE.emit('preUploadAssembleFile', label, dObj,
                     fromFile, pathFrom, opt_outputFile);
    }else{
      console.log('bad mode value');
      throw 'evokeObjFromAssFile: bad mode value';
    }
  };
  /**
   * "preUploadAssembleFile" event's listener
   * Collects data from modified appsScript-files and includes it into output
   * assemble object then stringifies object and writes json string into output
   * json-file.
   * Procegure: Checks if dObj has property dObj.files if 'yes' and
   * this is an Array handles consecutively it's elements-files data  -
   * in the pathFrom folder reads file data (one by one) and writes it
   * into appropriate dObj.files[i].source property of dObj.
   * After that writes dObj stringified by JSON.stringify string
   * into a copy of original fromFile modifying it's name
   * @param {string} label identifier of project being handled with
   * @param {Object} dObj - object got from parsed json fromFile
   * @param {string} fromFile - full path to json file being assembled
   * @param {string} pathFrom - path to folder where modified files of
   *     appsScript project reside
   * @param {string} opt_outputFile - customer output file path.
   *     Full path including file name with extension.
   *     Optional. If it's not set available fromFile is modified and used
   *     for output writing.
   */
  polO.preUploadFile = function (label, dObj, fromFile, pathFrom,
                                 opt_outputFile){
    var lp = polO.log.point.preUploadFile;
    if(!dObj.hasOwnProperty('files')){
      throw 'data object has no property dObj.files';
    }
    var sp = polO.sep;  // path string separator used
    var file,
        fname,
        fpath,
        fExt; // file extention
    var outputFile =
        opt_outputFile ||
        polO.checkAssFileName( fromFile);

    var files = dObj.files;
    if( !Array.isArray(files) || files.length <= 0){
      console.log( 'files property of dObj is not Array or has no elements');
      return;
    }
    polO.assFN = files.length;
    if(lp[0]){
      console.log('\n\nBefore cycling over dObj.files[i] properies\n'+
        'pathFrom:\n%s\n',pathFrom);
    }
    for(var i = 0;i < files.length;i++){
      file = files[i];
      fname = file.name;
      fExt = file.type ? polO.setFileExtention(file.type) : 'unknown';
      fpath = pathFrom + sp + fname + '.' + fExt;
      if(lp[1]){
        console.log( 'fname=\n%s,\nfpath=\n%s\n',fname,fpath);
      }
      if(fs.existsSync(fpath)){
        polO.log.nFilesToRead ++;
        polO.log.filesStatus[fpath] = 'beforeRead';
        file.source = fs.readFileSync(fpath,'utf8');
        polO.log.filesStatus[fpath]='written';

        polO.log.nFilesAlreadyRead++;
      }else{
        console.log('\nAttention!! File \n%s\n does not exist.',fpath);
      }
    }
    if(lp[2]){
      console.log( '\n\nBefore \'readyWriteOutputFile\' event emit\n'+
                 'outputFile =\n%s\n' +
                 'label = %s\n',outputFile, label);
    }
    polO.myEE.emit('readyWriteOutputFile',label, dObj, outputFile);
  };
    /**
   * "preUploadAssembleFileAsync" event's listener
   * Collects data from modified appsScript-files and includes it into output
   * assemble object then stringifies object and writes json string into output
   * json-file.
   * Procegure:
   * Checks if dObj has property dObj.files
   * if 'yes' and this is an Array
   * handles consecutively it's elements-files data:
   * in the pathFrom folder reads file data (one by one)
   * asyncronously and writes it
   * into appropriate dObj.files[i].source property of dObj.
   * After that writes dObj stringified by JSON.stringify string
   * into a copy of original fromFile modifying it's name
   * @param {string} label identifier of project being handled with
   * @param {Object} dObj - object got from parsed json fromFile
   * @param {string} fromFile - full path to json file being assembled
   * @param {string} pathFrom - path to folder where modified files of
   *     appsScript project reside
   * @param {string} opt_outputFile - customer output file path.
   *     Full path including file name with extension.
   *     Optional. If it's not set available fromFile is modified and used
   *     for output writing.
   * @param {boolean} opt_assync - true if asynchronous mode of files handling
   *     should be used. Default is false.

   */
  polO.preUploadFileAsync = function (label, dObj, fromFile, pathFrom,
                         opt_outputFile){

    if(!dObj.hasOwnProperty('files')){
      throw 'data object has no property dObj.files';
    }

    var sp = polO.sep;  // path string separator used
        lp = polO.log.point.preUploadFileAsync;
    var file,
        fname,
        fpath,
        fExt; // file extention
    var outputFile =
        opt_outputFile ||
        polO.checkAssFileName( fromFile.replace(/\.json/,'_0.json'));

    var files = dObj.files;
    if( !Array.isArray(files) || files.length <= 0){
      console.log( 'files property of dObj is not Array or has no elements');
      throw 'files property of dObj is not Array or has no elements';
    }

    polO.assFN = files.length;
    if(lp[0]){
      console.log('\n\nBefore cycling over dObj.files[i] properies\n'+
        'pathFrom:\n%s\n',pathFrom);
    }
    /**
     * first parameter of setInterval() function
     * stops loop over files when files count has reached to total number
     *  of files to be read and than
     * emits 'readyWritOutputFile' event transferring paramenters
     * to event listener
     */
    function testLoop(){
      if(polO.log.nFilesAlreadyRead === polO.log.nFilesToRead){
        clearInterval(polO.loop);
        polO.myEE.emit('readyWriteOutputFile',
                       label,
                       dObj,
                       outputFile);
      }
    }

    for(var i = 0;i < files.length;i++){
      file = files[i];
      fname = file.name;
      fExt = file.type ? polO.setFileExtention(file.type) : 'unknown';
      fpath = pathFrom + sp + fname + '.' + fExt;
      if(lp[1]){
        console.log( 'fname=\n%s,\nfpath=\n%s\n',fname,fpath);
      }
      if(fs.existsSync(fpath)){
        polO.log.nFilesToRead ++;
        polO.log.filesStatus[fpath] = 'beforeRead';

        if(async){
          /* NEED TO BE done !!!! Not works yet!
          fs.readFile(fpath,'utf8',function(err,data){
            if(err){
              console.log('error %s reading file \n%s ',err.message,fpath);
              polO.log.filesStatus[fpath]='error';
            }else{
              //'',dObj.files[i].name);
              file.source = data;
              polO.log.filesStatus[fpath]='written';
            }
          });*/
        }else{
          // Synchronous mode working WELL. Tested.
          file.source = fs.readFileSync(fpath,'utf8');
          polO.log.filesStatus[fpath]='written';
        }
        polO.log.nFilesAlreadyRead++;
      }else{
        console.log('\nAttention!! File \n%s\n does not exist.',fpath);
      }
      if(i === files.length - 1){
        if(async){
          // launches read integrity checking procedure
          // the necessity of this is rational only for async - mode
          polO.loop = setInterval(testLoop,1000);

        }else{
          if(lp[2]){
            console.log( '\n\nBefore \'readyWriteOutputFile\' event emit\n'+
              'outputFile =\n%s\n' +
              'label = %s\n',outputFile, label);
          }
          polO.myEE.emit('readyWriteOutputFile',label, dObj, outputFile);
        }
      }
    }
  };
  /**
  * @description of the procedure of all files involvement in assembling
  *   procedure control.
  * 1. At the beginning of assembling
  * polO.assemble = true
  * 2. cycle is realized through dObj.files array elements.
  *   for each i - file the appropriate file named dObj.files[i].name+'.js'
  *   is looking for in the pathFrom folder. It's content is reading and
  *   is used to reassign dObj.files[i].source
  * 3. the reading of file may be successful or not. If file content would
  *   - at the beginning of reading file polO.log.files[i].status is set
  *     to 'readBegan'
  *   - if error would have occurred at reading this parameter would be set
  *      'error'
  *   - at successful read this would be set 'written';
  * 4. Files are read asynchronously. So to check reading integrity while
  *    last files[last] file read has begun the checking loop procedure is
  *    launched monitoring polO.log.nFilesAlreadyRead and
  *    polO.nFilesToRead global parameters. The procedure periodically
  *    checks does the number of files read and written is equal to
  *    files.length. The implementation of procedure uses
  *
  *  polO.loop = setInteval( function(){
  *      if(polO.log.nFilesAlreadyRead === polO.log.nFilesToRead){
  *        clearInterval(polO.loop);
  *        polO.myEE.emit('readyWriteOutputFile',label,...);
  *      }
  *    },1000);
  */
  /**
   * 'readyWriteOutputFile' event listener
   * writes outputFile json file ready for uploading to Google Drive
   * @param {object} dObj - final json file data as an object
   *     (prepared for serializing )
   * @param {string} outputFile - full path to final json file
   *     including file name with extension.
   */
  polO.writeAssFile = function (label, dObj, outputFile){
    var lp = polO.log.point.writeAssFile;
    if(lp[0]){
      console.log('\n\nInside writeAssFile ');
    }
    var outPth;
    var data = JSON.stringify(dObj);
    fs.writeFile(outputFile,data,function(err){
        if(err){
          console.log(
            err+'\nwhile attempting to write finally assembled json - file');
        }else{
          // output file is written successfully
          outPth = path.dirname(outputFile);
          if(lp[1]){
            console.log('Assembly has finished\noutput file:\n%s\n' +
            'json-file has been written into folder outPth =\n%s\n' +
            'label = %s\n',
            outputFile, outPth, label);
          }
          // opens window of file explorer and launches explorer showing folder
          // where json-file has been written
          var childProc = cp.execSync(
              'start explorer.exe '+'"' +
               outPth +'" & exit');
          polO.myEE.emit('endpoint-a',label,outputFile);
        }
    });
  };
  /**
   * 'endpoint-a' event listener (assemble finished)
   * continues processing after outputFile has been written
   * @param {string}label unique identifier of project run
   * @param {string}outputFile  - full path to final json file
   *     including file name with extension.
   */
  polO.aEndpoint = function (label,outputFile){
    var lp = polO.log.point.aEndpoint;
    polO.lastAEndpoint = new Date().getTime();
    if(lp[0]){
      console.log('\n\nEndpoint of Assemble-mode has been reached.'+
                ' Event \'endopoint-a\'\n'+
                'outputFile =\n%s\n' +
                'label = %s',
                outputFile,
                label);
    }
  };
  /**
   * Checks availability of assemble file name specified on drive
   * If presumed one is already available
   * last digit of the name string is increased by one.
   * It's cosidered the digit betwin extention and last underscore sign.
   * Nothing is changed if file name has no digital part before .json
   * extension
   * @param {string} pathTesting
   * @return {string} name chosen
   */
  polO.checkAssFileName = function(pathTesting){
    return polO.checkFileName(pathTesting,'.json');
  };
    /**
   * Checks availability of assemble file name specified on drive
   * If presumed one is already available
   * last digit of the name string is increased by one.
   * It's cosidered the digit betwin extention and last underscore sign.
   * Nothing is changed if file name has no digital part before .json
   * extension
   * @param {string} pathTesting
   * @param {string} trail ending part of file name used to specify file type
   * @return {string} name chosen
   */
  polO.checkFileName = function(pathTesting, trail){
    var tempNm = pathTesting;
    while( fs.existsSync(pathTesting)){
      pathTesting = polO.increaseDigitInPath(pathTesting,trail);
      if(tempNm === pathTesting){
        break;
      }
    }
    return pathTesting;
  };
    /**
   * Checks availability of final params file name.
   * If the one being presummed is already available
   * the digit preceded '_params.json' part will be increased by one
   * @param {string} pathTesting - full path of params-file testing including
   *     file name and extension
   * @return {string} name chosen
   */
  polO.checkParamsFileName = function(pathTesting){
      return polO.checkFileName(pathTesting,'_params.json');
  };
   /**
    * 'endpoint-e' event listener (evoke)
    * @param{string} label identifier of project being handled
    * @param {string} pathTo path to the directory where asp-filess have been
    *     located.
    * @param {string} fromFile - original json-file
    * @param {string} act - actual value of act parameter
    */
  /**
   * writes read me - text into console output
   */
  polO.readme = function(){
    var read = require('./readme.js');
    read.readme();
  };
  /**
   * returns prefixTo value as absolute path using fromFile and optPrefixTo
   *  parameters
   * @description prefixTo setting
   * - if opt_prefixTo is not set checks polO.prefixTo
   * - if polO.prefixTo is not set, file name of fromFile without
   * extension is used as prefixTo and the directory with name
   * <prefixTo>XXXXXX will be created inside host folder of fromFile and
   * will be assigned as pathTo for asp-filess are going to be extracted .
   * XXXXXX - 6 random alphanumerical characters
   * - in the case when it's necessary to use some specified path as pathTo
   * parameter without appending six random characters to the name of folder
   * the following rules should be followed by:
   * 1. property polO.no6 should be set true and
   * 2. polO.prefixTo as well as opt_prefixTo should be empty string ''.
   * 3. The value of pathTo is taken from polO.pathTo property
   * 4. if the folder with path pathTo does not exist it will be created.
   * @param {string}act - action parameter
   * @param {string}fromFile - original json file from which scripts of
   *     asp-filess are extracted
   * @param {string}opt_prefixTo - prefixTo parameter set which is opt_prefixTo
   *     inside calling function
   * @return {string} prefixTo value string as absolute path
   */
  polO.getPrefixTo = function(act, fromFile, opt_prefixTo){

    var fF, dFF,
        sep = this.sep;
    if(act === 'eto' || polO.no6){
      return '';
    }else{
      if(opt_prefixTo){
        return  polO.absPath(opt_prefixTo)  ;
      }else if(polO.prefixTo){
        return polO.absPath(polO.prefixTo);
      }else if( fromFile || polO.fromFile ){
        fF = fromFile ? polO.absPath(fromFile) :
            ( polO.fromFile ? polO.absPath(polO.fromFile) : '' );
        if(fF && !/testProjFile[.]json$/.test(fF)){
          // derives prefixTo from fromFile path and fromFileName
          dFF = !polO.no6 && !polO.pathTo ?
                    polO.fileNameToPath(fF)+'_' :
                    '';
          return  dFF;
        }else{
          // default value of prefix for test
          return __dirname + sep + 'test' + sep + 'out' + sep +'pathTo_';
        }
      }
    }
  };
  /**
   * !!! if pathTo is predetermined it should be set in advance
   * before polO.work call by assigning polO.pathTo property !!!
   * This case is appropriate to 'eto' action parameter mode for which
   * opt_prefixTo argument contains the value of pathTo parameter
   * @param {string} act action parameter
   * @param {string} opt_prefixTo - opt_prefixTo value in calling function
   * @return {string}  pathTo value
   */
  polO.getPathTo = function(act, opt_prefixTo){
    if(act === 'eto' && opt_prefixTo ){
      polO.no6 = true;
      polO.prefixTo = '';
      return polO.absPath(opt_prefixTo);
    }else{
      return polO.pathTo ?
             polO.absPath(polO.pathTo) :
             '';
    }
  };
  /**
   * @description
   * of input parameters procedure
   * steps:
   *
   * 1. polO.reset();
   *
   * 2.1                  set manually if any --------->  polO.properties
   *                            or                          :
   * 2.2   options <----------- set manually if any         :
   *         |                  or                          :
   * 2.3     |                  write file PARAMS.json      :
   * 3.      v                                  |           :
   *  run(arguments*)                           |           :
   *         |        .......................   |           :
   *         |        :                     :   V           :
   * 4.      |        ....options <-------from PARAMS-file   :
   *         v        :     |                               :
   *       PARSE------^     |                               :
   *    (arguments*)        |                               :
   * 5.      |              v                               :
   *         |  +-workWith(options)                         :
   *         |  |                                           :
   * 6.      v  v                                           :
   * work(arguments)                                        :
   *         |                                              :
   *         + <------------------------ polO.properties..../
   *         v
   *       workout
   * another form of polO.work() method but with one argument as object
   * named 'options' - object with parameters' propoerties
   * @param {object} o see bellow
   */
  polO.workWith = function(o){
    var label = o.label? o.label : undefined,
        act = o.act? o.act : undefined,
        fromFile = o.fromFile? o.fromFile : undefined,
        prefixTo = (o.prefixTo)? o.prefixTo :
                   (((act === 'eto' || (act === 'a' && !(o.pathFrom))) && (o.pathTo)) ?
                     o.pathTo : undefined),
        pathFrom = o.pathFrom? o.pathFrom : undefined,
        assFileName = o.assFileName ? o.assFileName : undefined,
        outputFile = o.outputFile ? o.outputFile : undefined;

    polO.work(label, act,
              fromFile,
              prefixTo,  // it's pathTo if act= 'eto'
                         // and pathTo if  act === 'a' && !opt_pathFrom
              pathFrom,
              assFileName,
              outputFile
              );
  };
  /**
   * working engine
   * fulfills: or extraction(evoking) of asp-files from json-file
   * or assembly of final json-file using asp-files already modified
   * depending on the act - parameter value
   * @param {string} label - the label of project being handled
   * @param {string}opt_act - action parameter indicating
   *     working mode: 'e' | 'a' |'ea' | 'eto' | 'ato' ...
   * @param {string} opt_fromFile - source json file
   * @param {string} opt_prefixTo - prefix of pathTo directory name.
   *     Six random alphanumerical characters are appended to prefix
   *     to form pathTo - path of folder where to place asp-filess extracting.
   *     If action parameter opt_act has value 'eto' prefixTo has
   *     meaning and value of pathTo and no characters appending will be
   *     taken place.
   * @param {string} opt_pathFrom - where to take js file for assembling json-file
   * @param {string} opt_assFileNems - name of json file assembled
   * @param {string} opt_outputFile - full path to user defined assembly file
   *     including file name and extension
   */
  polO.work = function(label,
                      opt_act,
                      opt_fromFile,
                      opt_prefixTo,   // it's pathTo if act= 'eto'
                                      // and pathTo if  act == 'a' &&
                                      //                !opt_pathFrom
                      opt_pathFrom,
                      opt_assFileName,
                      opt_outputFile
                      ){
    var act, fromFile, pathTo, prefixTo, pathFrom, assFileName, outputFile,
        mode,
        sep = polO.sep,       //  path separator
        lp = polO.log.point.work,
        a;

    if(lp[0]){
      a = Object.values(arguments);
      polO.anvl('work',...a);    // log printing
    }

    label = label ?
            (polO.label && (label !== polO.label) ?
                label + "--" + polO.label :
                label) :
            polO.label;
    polO.label = label;

    polO.act =
      act = opt_act ? opt_act :
                    (polO.act ? polO.act : (opt_fromFile || polO.fromFile ?
                              'e' : 'ea'));   // 'ea' is allDefaults for test mode

    //  absolute path and filename
    polO.fromFile =
      fromFile = polO.absPath(opt_fromFile) ||
                 polO.absPath(polO.fromFile) ||
                __dirname + sep + 'test' + sep + 'testProjFile.json';
    polO.prefixTo =
      prefixTo =  polO.getPrefixTo(act, fromFile, opt_prefixTo);
    polO.pathTo =
      pathTo = polO.getPathTo(act, opt_prefixTo, polO);

    if(lp[1]){
      polO.log.point.work.print[1](act,prefixTo,pathTo,fromFile); // log print
    }

    if( act === 'erf' || act === 'e' || act === 'ea' || act === 'eto'){
      if(act === 'erf'){
        mode = 'rf';
      }else if(act === 'e' || act === 'ea' ){
        mode = 'req';
      }else if( act === 'eto'){
        polO.no6 = true;
        prefixTo = '';
        polO.pathTo = pathTo;
      }
      polO.evokeAspFiles(label, fromFile, prefixTo, act, mode);
      if(lp[2]){
        polO.log.point.work.print[2](act, mode);  //log print
      }
    }else if(act === 'a' || act === 'ato'){
      /** assembly work
      * location of asp-filess edited
       * while act === 'a' prefixTo is useless, so to shorten the length
       * of argument in polO.run call it's worthwhile to use it's place for
       * pathFrom parameter. When parameters are returned from params file or
       * from object options the probability exists that pathTo === pathFrom
       * and prefixTo is set and yet RegExp(prefixTo).test( pathTo ) === true
       * at this case at polO.run call is rational to assign pathFrom value to
       * prefixTo method's argument (pathFrom occupies the sit of prefixTo).
       */
      polO.pathFrom =
        pathFrom = opt_pathFrom || opt_prefixTo || polO.pathFrom ;

      outputFile = opt_outputFile || polO.outputFile;
      outputFile = polO.checkAssFileName(outputFile);
      polO.outputFile = outputFile;
      /**
       * @description
       * final assembly json file is located
       * 1. or in the same directory where original fromFile lives
       * and has modified name fromFile_modified_n where n=0,1,...
       * depending on the number of saving files in work-flow.
       * 2. or this file could have fixed user defined NAME
       * determined by opt_assFileName parameter. This does not change
       * the location directory of the file only the name.
       * 3. By user preference it's possible to specify fixed name and
       * location directory by assigning full file path( including file name
       * and .json extension) by opt_outputFile parameter. The value of this
       * parameter should be monitored inside polO.assembleProjFile method
       * and is transferred there by polO.outputFile property or
       * as function parameter or (options objects - not yet)
       * To realize last option act parameter value 'ato' is the best.
       */
      if( act === 'a'){
        polO.assFileName = opt_assFileName || polO.assFileName;
        assFileName = polO.assFileName;
      }
      if(lp[3]){
        console.log('inside work before polO.assemblProjFile: \noutputFile = ' +
             outputFile + '\nassFileName = ' + assFileName );
      }
      polO.assembleProjFile(
          label, fromFile, pathFrom, assFileName, outputFile);

    }else{
      console.log('bad act value %s ',act);
    }
  };
  /**
   * @description
   * Requirements to and characteristics of params-json-file
   * - file in which calculating parameters are values of appropriate
   * properties.
   * Criteria:
   * a) last part of json-file name is '_params.json'
   * b) file with such name is located in the folder ./params
   * c) depending on the e or a -action mode it's possible
   * to control presence of prefixTo or pathFrom being set additionally
   *
   * Such criteria permit to create params json-file automatically
   * after evoking procedure and to store it into the ./params folder.
   * The name of such file should look like
   * fromFileName_params.json, were fromFileName is
   * path.basebame(fromFile,'.json') file name without extension of fromFile.
   *
   * @param {string} arg3 - params file name without end part '_params.json'
   *     historically it has been introduced for nmp polO command fourth
   *     argument (index 3) of CLI command. So it was named arg3
   * @return {string} file path if a file with initial part of name indicated
   *     does exist and present in the ./params  folder, '' otherwise
   */
  polO.hasParamsJson = function(arg3){
    var sep = polO.sep;
    var fpth = __dirname + sep + 'params' + sep + arg3 + '_params.json';
    return  fs.existsSync(fpth) ? fpth : '';
  };
  /**
   * borrows calculation parameters outside into external scope
   * assigns options.property to ro.property if the first exists
   * @param {Object} ro receiver object
   * @param {Object} options donor object
   */
  polO.setCalcParams = function(ro,options){
    var pn = polO.paramsNames,
        o = options;
    pn.forEach((el) => {ro[el] = o[el] ? o[el].toString() : ro[el];});
  };
  /**
   * Prints managing Parameters' Properties of an Object
   * @param {Object} options
   */
  polO.ppp = function(options){
    var prnms = polO.paramsNames;
    var o = options;
    var lp = polO.log.point.ppp;
    if(lp[0]){
      prnms.forEach((el)=>{
          console.log('opts.' + el + '=' + (o[el] ? o[el] : 'empty') + '\n'+
                    'polO.' + el + '=' + (polO[el] ? polO[el] :'empty'));});
    }
  };
  /**
   * Prints Object 'options' Properties -
   * if !opt_list use polO.paramsNames keys
   * if opt_list is empty array [] uses Object.keys(options)
   * otherwise uses specified [...keys] values
   * @param {string} title comment's title on preceeded line
   * @param {Object} options
   * @param {Array.<string>}opt_list list of properties names to print
   */
  polO.pop = function(opt_title,options,opt_list){
    var list = opt_list && opt_list.length ===0 ? Object.keys(options) : opt_list;
    var prnms = !opt_list ? polO.paramsNames : list;

    var o = options;
    var lp = polO.log.point.ppp_;
    if(lp[0]){
      console.log(opt_title ? opt_title: 'properties:');
      if(options){
        prnms.forEach((el)=>{
            console.log('opts.' + el + '=' + (o[el] ? o[el] : 'empty') + '\n'+
                      'polO.' + el + '=' + (polO[el] ? polO[el] :'empty'));});
      }else{console.log('---------');}
    }
  };
  /**
   * polO.run - method
   * executes evoking or assembly in dependence on the number, the types and
   * the values of method's arguments.
   *
   * Variables used in context and their meaning:
   * act - action type parameter
   * fromFile - full path of json file of appScript project downloaded
   * pathTo - path of the folder wherein asp-filess extracted form fromFile
   *          will be stored to. (Could be assigned by user manually by
   *          setting polO.pathTo property)
   * prefixTo - part of pathTo path to which six random alphanumerical characters
   *            will be appended to get new pathTo value (absolute full path)
   * pathFrom - path of folder being location of extracted files will being taken
   *            for assembly new project's json file modified off-line
   * assFileName - name of resulting project's json file without .json extension
   *               specified by user if any. Optional parameter. If not set the
   *               name of resulting json-file is assigned automatically
   *               following the rule described bellow or in methods' description
   * Arguments options:
   * No Arguments - all arguments and parameters will have Default values.
   * is used while testing; call example: polO.run(); // (0)
   *
   * First argument's values vs meaning & functionality (act - action parameter):
   *     'e' - evoke
   *     'a' - assemble
   *     'o' - object properties as managing parameters
   *     'f' - same as 'o' but object will be get from json file locating into
   *           __dirname + sep +'params' folder; where sep is OS paths separator
   *     'ea' - 'e'voke and then 'a'ssemble (default) using in test run and
   *              at chaining processes like auto lint of asp-filess codes
   *     'eto' - evoking asp-filess extracted from fromFile and write them into
   *           pathTo path of folder specified by user
   *      'ato' - assembles project's data into specified json file
   *
   * Calling examples:
   * 'o' -
   *      call ex.: polO.run('o',options); // (1) or
   *                polO.run('',options);  // (2) or
   *                polO.run(options);     // (3)
   *      where typeof options === 'object' is boolean true
   *      options = {
   *        act: '...',
   *        fromFile: '...',
   *        prefixTo: '...',
   *        pathTo: '...',
   *        pathFrom: '...',
   *        assFileName: '...',
   *        outputFile: '...'
   *      };
   * 'f' - is used with second parameter(method's argument) as
   *       params-json-fileName  without ending string '_params.json'
   *      (see example bellow). Params-json-file itself should be located in the
   *       folder with path: __dirname + sep +'params' ('./params' relative to
   *       proj-offliner package root directory)
   *       call samples:
   *           polO.run('f',paramsFileNamePart); // (4) or
   *           polO.run('',paramsFileNamePart);  // (5) or
   *           polO.run(paramsFileNamePart);     // (6)
   *
   *        typeof paramsFileNamePart === 'string' &&
   *        !/\.json$/.test(paramsFileNamePart) &&
   *        !/_params\.json$/.test(paramsFileNamePart)
   *        is boolean true,
   *        where paramsFileNamePart is presumed to be string presenting
   *        file name without '_params.json' of params-json-file located in
   *         __dirname+sep+'params' directory (sep='\\' in the case of Windows)
   *          and containing json string with properties:
   *         paramsJsonFileContent =
   *           {"act": "...","fromFile": "..." ,"prefixTo": "...",
   *           "pathTo": "...","pathFrom": "...","assFileName": "...",
   *           "outputFile: "..."}
   *         Attention remark! - content of json-file json string must not
   *         contain line breakes special characters.
   *
   * 'e'- evokes asp-filess from fromFile into new prefixToXXXXX -directory
   *      call ex.: polO.run('e',fromFile,prefixTo) (7)
   * 'eto'- evokes asp-filess from fromFile into user defined pathTo directory
   *        call ex.:
   *            polO.run('eto',fromFile,pathTo);  (8)
   *
   * 'a' - assembles final project's json file
   *       call samples:
   *       polO.run('a',fromFile,pathFrom,opt_assembleFileName); // (9) or
   *
   * 'ato' - assembles final project's json file specified. The final json-file
   *       and it's location are strictly determined by user
   *       call samples:
   *       polO.run('ato',fromFile,pathFrom,outputFile); // (10)
   *       where outputFile is a full path including file name and
   *       extension .json where to write final json assembly file
   *
   * 'erf' - technical evoking mode using algorithm of direct content
   *         synchronous or asynchronous reading of AppsScript project
   *         json file downloaded
   *         (only for information. Details see in code description)
   *         to get the object whose properties contain asp-filess data
   * Defaults:
   * For NON TESTING RUNS Default act = 'e'
   * if fromFile is not set the default value of
   * act = 'ea'   (when non 'o' and non 'f' cases is run) testing evoking
   *                and then assembling results
   * fromFile = __dirname + '\\test\\testProjFile.json';
   * prefixTo = __dirname + '\\test\\out\\pathTo_';
   * pathFrom = __dirname + '\\test\\pathFrom';
   *
   *
   * @param {string}label - the label of project being handled
   * @param {string|Object=}opt_act Action parameter.Optional.
   *     Default value is a) 'ea' if frmoFile is not set and will have
   *     default value, or b) 'e' if fromFile is determined value of
   *     full path of initial project json file
   *    it's a {string} or it is absent at all.
   *     In other cases or {string} action parameter - possible values 'e', 'a',
   *     'ea', 'eto', 'o', 'f'
   *     or is an object specifying all parameters as {string} properties
   *      options = {
   *        act: '...',
   *        fromFile: '...',
   *        prefixTo: '...',
   *        pathTo: '...',
   *        pathFrom: '...',
   *        assFileName: '...',
   *        outputFile: '...'
   *      };
   *     or is a string being param json file name without trailing '_params.json'
   * @param {string|Object}opt_fromFile (or paramsObj or parmsFileNamePart)
   * @param {string}opt_prefixTo ( could have meaning of pathTo (eto) or pathFrom (a) )
   * @param {string}opt_pathFrom
   * @param {string}opt_assFileName
   * @param {string}opt_outputFile

   */
  polO.run = function(opt_label,
                      opt_act,
                      opt_fromFile,
                      opt_prefixTo,
                      opt_pathFrom,
                      opt_assFileName,
                      opt_outputFile){
    var lp = polO.log.point.run,
    options;
    if(lp[0]){ console.log('run-method begins -----------------> \n');}

    if( arguments.length <= 3){
      options = polO.runGetOptionsObj(opt_label, opt_act, opt_fromFile);
    }
    if(!options){
      // creates options from string arguments only
      options = polO.runArgsToOptions(opt_label,
                                        opt_act,
                                        opt_fromFile,
                                        opt_prefixTo,
                                        opt_pathFrom,
                                        opt_assFileName,
                                        opt_outputFile);
    }
    polO.setCalcParams(polO, options);

    if(lp[1]){
      polO.ppp(options);
    }
    if(lp[2]){
      lp.print[2](options);
    }

    polO.workWith(options);
  };
  /**
   * Creates options object for shifted run arguments
   * @param {string}label - the label of project being handled
   * @param {string|Object=}opt_act Action parameter.Optional.
   *     Default value is a) 'ea' if frmoFile is not set and will have
   *     default value, or b) 'e' if fromFile is determined value of
   *     full path of initial project json file
   *    it's a {string} or it is absent at all.
   *     In other cases or {string} action parameter - possible values 'e', 'a',
   *     'ea', 'eto', 'o', 'f'
   *     or is an object specifying all parameters as {string} properties
   *      options = {
   *        act: '...',
   *        fromFile: '...',
   *        prefixTo: '...',
   *        pathTo: '...',
   *        pathFrom: '...',
   *        assFileName: '...',
   *        outputFile: '...'
   *      };
   *     or is a string being param json file name without trailing '_params.json'
   * @param {string|Object}opt_fromFile (or paramsObj or parmsFileNamePart)
   * @return {Object} parameters object
   */
  polO.runGetOptionsObj = function(opt_label, opt_act, opt_fromFile){

    var options, // params object
        lp = polO.log.point.runGetOptionsObj,
        ol;
    if(lp[0]){ console.log('typeof opt_label = %s',typeof opt_label );}
    var label = opt_label || polO.label;
    if(lp[1]){ console.log('label has been assigned to %s',label);}


    // arg-0-gear
    options = polO.runArg_0_1_obj_or_file(label, opt_act);
    if(!options){
      // arg-1-gear
      options = polO.runArg_1_2_obj_or_file(label, opt_act, opt_fromFile);
    }

    if( typeof options === 'object'){
      if(lp[2]){ console.log( 'in runGetOptionsObj: options is an object');}  // log

      if(typeof(label) === 'string' && !polO.hasParamsJson(label)){
        if(lp[3]){
          console.log('init: options.label = %s\nlabel = %s',
                      options.label, label);
        }  // log print
      }
      if(label){
        ol = options.label;
        options.label = (ol && ol !== label) ? label + "--" + ol : label;
      }
    }

    return options;
  };
  /**
   * creates options from arguments only
   * It means that magic disappeared and arguments have their litteral
   * meaning or default values if are absent
   * without possible shifting
   * @param {string}label - the label of project being handled
   * @param {string|Object=}opt_act Action parameter.Optional.
   *     Default value is a) 'ea' if frmoFile is not set and will have
   *     default value, or b) 'e' if fromFile is determined value of
   *     full path of initial project json file
   *    it's a {string} or it is absent at all.
   *     In other cases or {string} action parameter - possible values 'e', 'a',
   *     'ea', 'eto', 'o', 'f'
   *     or is an object specifying all parameters as {string} properties
   *      options = {
   *        act: '...',
   *        fromFile: '...',
   *        prefixTo: '...',
   *        pathTo: '...',
   *        pathFrom: '...',
   *        assFileName: '...',
   *        outputFile: '...'
   *      };
   *     or is a string being param json file name without trailing '_params.json'
   * @param {string|Object}opt_fromFile (or paramsObj or parmsFileNamePart)
   * @param {string}opt_prefixTo ( could have meaning of pathTo (eto) or pathFrom (a) )
   * @param {string}opt_pathFrom
   * @param {string}opt_assFileName
   * @param {string}opt_outputFile
   * @return {Object} input parameters' object
   */
  polO.runArgsToOptions = function(opt_label,
                                            opt_act,
                                            opt_fromFile,
                                            opt_prefixTo,
                                            opt_pathFrom,
                                            opt_assFileName,
                                            opt_outputFile){
   var act, fromFile, fF,
       ofF = opt_fromFile,
       options,
       lp = polO.log.point.runArgsToOptions;

    act = opt_act || polO.act;
    fF = ofF || polO.fromFile;

    fF = (!fF) ? polO.getDefaultFromFile(act) :
                       polO.absPath(fF);

    var fFN = path.basename(fF);

    if(polO.isFileGoodJson(fF, fFN)) {
      polO.fromFile = fF;
    }else{
      throw "fromFile should be good Apps Script Project json file downloaded";
    }

    if(act && ['e','ea','eto','erf','a','ato'].indexOf(act) < 0){
      if(lp[0]){
        console.log( 'incorrect value of opt_act parameter = %s!', opt_act);
      }
    }

    act = !act || act === 'ea' || act === 'allDefaults' || act === 'all' ?
          'ea' :
          ((act && ['e','eto','erf','a','ato'].indexOf(act) < 0) ? 'e' : act);


    options = {
      label: opt_label || polO.label,
      act: act,
      fromFile: fF,
      prefixTo: (act === 'a' || act=== 'ato') ?
          '' : (act === 'eto' ? '' : polO.absPath(opt_prefixTo)),
      pathTo: (act === 'eto') ?
          polO.absPath(opt_prefixTo) : polO.absPath(polO.pathTo),
      pathFrom: polO.getPathFrom( act, fF, opt_prefixTo, opt_pathFrom),
      assFileName: polO.getAssFileName(act, fF, opt_prefixTo,
                      opt_pathFrom ,opt_assFileName, opt_outputFile),
      outputFile: polO.getOutputFile(act, fF, opt_prefixTo,
                      opt_pathFrom, opt_assFileName, opt_outputFile)
    };
    if(lp[1]){
      console.log('new options object created from arguments');
    }
    return options;
  };
  /**
   * tests if a file is good json ASProject file -
   * origine of asp-files sources
   *
   * Requirements to json file
   * checks
   * 1. if json file exists on drive
   * 2. does data of json file is json by means of
   * try{
   *    var ob=JSON.parse( fs.readFileSync( opt_fromFile);
   * }catch(e){
   *  console.log(e);
   *  return;
   * }
   * var check = Array.isArray(ob.files)&& ob.files.length>0;
   * if(check){
   *  // check passed good
   * }
   *
   * @param {string} abs  absolute file path
   * @param {string} rel relative file path
   * @return {Boolean} true if Yes or throw Error
   */
  polO.isFileGoodJson = function(abs,rel){
    var ob;
    if(/\.json$/.test(rel)){

      if( !fs.existsSync(abs) ){
        throw 'file ' + abs +' does not exists on PC';
      }else{
        try {
          ob = JSON.parse( fs.readFileSync (abs) );
        }catch(e){
          console.log(e);
          console.log('Bad json-string in file fromFile =\n%s', abs);
          throw 'Bad json-string in file fromFile = ' + abs;
        }
      }
    }else{

      throw 'opt_fromFile is not json-file or has bad name: "' +
            rel + '" or bad data';
    }
    return true;
  };
  /**
  * pre-sets options object depending on values of
   * polO.run method's arguments:
   * @param {Object|string|undefined} label first argument of method polO.run
   * @param {Object|string|undefined}
   * @return {Object|void} options object
   */
  polO.runArg_0_1_obj_or_file = function(label,opt_act){
    var options,
        lp = polO.log.point.runArg_0_1_obj_or_file; // log points

    if(typeof label === 'object'){
      if(lp[0]){ console.log('label has been identified as an object');}
      options = label;
    }else if( polO.hasParamsJson(label)){
      // label as paramsFileName without '_params.json'. case (6)
      if(lp[1]){
        console.log('Data from params json file %s run Case identified',
                    './params/' + label + '_params.json');
      }
      options = require( './params/' + label + '_params.json');

      // clean cache
      delete require.cache[require.resolve(
        './params/' + label + '_params.json')];
    }else if( label === 'o'){
      if( typeof opt_act === 'object'){
        options = opt_act;
        if(!options.label){
            console.log('\'label\'-property is not set in options object' +
             'file while \'o\' is at label sit. To indicate run label is' +
             ' recommended');
        }
      }else{
        throw 'options object is not set while act === \'o\'';
      }
    }else if( label === 'f'){
      if( polO.hasParamsJson(opt_act)){
        options = require( './params/' + opt_act + '_params.json');
        //clear cache
        delete require.cache[
            require.resolve( './params/' + opt_act + '_params.json')];
        if(!options.label){
          console.log('label parameter is not set inside params' +
          'file while \'f\' is at label sit');
        }
      }else{
        throw 'params file does not exist while action parameter' +
              ' at label sit is equal to  \'f\' ';
      }
    }else{
      return;
    }
    return options;
  };
  /**
   * pre-sets options object depending on values of
   * polO.run method's arguments:
   * @param {string} label first argument of method polO.run
   * @param {Object|string|undefined} opt_act second argument of method polO.run
   * @param {Object|string|undefined} opt_fromFile third argument of method polO.run
   * @return {Object|void} options object or void
   */
  polO.runArg_1_2_obj_or_file = function(label, opt_act, opt_fromFile){
    var options,
        lp = polO.log.point.runArg_1_2_obj_or_file;  // log point array
    if(lp[0]){
      console.log('in runArg_1_2_obj_or_file: \nlabel=%s \nopt_act=%s',
                label, opt_act );
    }
    //  --=== opt_ACT-Ggear options --====

    if( typeof opt_act === 'object' ){
       options = opt_act;   // paramsObject case (1)

    }else if( polO.hasParamsJson(opt_act)){

      if(lp[1]){
        console.log('Data from params json file %s identified',
                  '\\params\\' + opt_act + '_params.json');
      }
      options = require( './params/' + opt_act + '_params.json');

      // cleans cache
      delete require.
          cache[require.resolve('./params/' + opt_act + '_params.json')];

      if((label || options.label) && lp[2]){
        console.log('oprions.label from file = '+ options.label);
      }else{
        if(!label || !options.label){
          console.log('label parameter is recomended to be set');
        }
      }

      if(opt_fromFile && /\.json$/.test(opt_fromFile)){
        // ===- opt_fromFile supliment to ACT-Gear-options -====
        options.fromFile =  polO.absPath(opt_fromFile);
      }
    }else if(!opt_act){
      //  ---==== fromFILE-Gear options ====---

      options = polO.runArg_2_obj_or_file (label, opt_fromFile);
      if(!options){
        options = polO.runArg_2_fromFile_gear(label, opt_fromFile);
      }
    //  ---  ACT special Cases  ---
    }else if(opt_act === 'o'){
      if( typeof opt_fromFile !== 'object'){
        throw 'Something is wrong! Action parameter = \'o\' but\n'+
            'second argument of method polO is not an Object!';
      }
      //  paramsObject case (3)
      options = opt_fromFile;
    }else if(opt_act === 'f'){
      if( polO.hasParamsJson(opt_fromFile)){
        // correct params-json-file exists (4)
        options = require( './params/' + opt_fromFile + '_params.json');
        delete require.cache[
          require.resolve( './params/' + opt_fromFile + '_params.json')];
      }else{
        throw 'act=\'f\' but bad or incorrect params-json-file --> "' +
               opt_fromFile +'"';
      }
    }
    return options;
  };
  /**
   * cases if opt_fromFile object or file
   * @ return {Object|void}
   */
  polO.runArg_2_obj_or_file = function(label, opt_fromFile){
    var options;

    if(typeof opt_fromFile === 'object'){
      // paramsObject as second argument case (2)
      options = opt_fromFile;
    }else if( polO.hasParamsJson(opt_fromFile)){
      // correct params-json-file exists (5)
      options = require( './params/' + opt_fromFile + '_params.json');
      delete require.cache[
        require.resolve( './params/' + opt_fromFile + '_params.json')];
    }else{
      return;
    }
    return options;
  };
  /**
   * handles cases when it's already known that
   * opt_fromeFile is not a parameters' object 'options'
   * as well as it's not a path to parameters json file.
   * Three possible cases exist:
   *
   * 1. opt_fromFile is input json file of asp-project
   * and other parameters like act and others are got
   * from parameters' object file who
   * could exist in /params/ directory with name fromFile_params.json
   * So checks existance of /_params$/.test(path.basename(fromFile,.json) and
   * availability of path.basename(fromFile) inside __dirname/params/ irectory
   *
   * 2. opt_fromFile is input json file of asp-project
   * Takes other parameters from appropriate polO object properties or
   * are Defaults.
   *
   * 3. opt_fromFile is NOT SET and all parameters are set in appropriate
   * polO object properties or are Defaults.
   *
   * When opt_fromFile is asp-project's fromFile, Default act is 'e' .
   *
   *
   * calculating parameters are passed to .run call through
   * polO object - for.ex. -    polO.act, polO.fromFile, ...
  *
  * The verification that this is the case presumes that
  * before any call of polO.run method parameters being
  * polO's properties should have been reset by
  * polO.resetPars(polO) - method.
  * After that user may use polO.run() call without parameters passing necessary
  * ones through polO object properties set preliminarily.
  *
  * Different action parameter values demand different parameters being set:
  * 'act', 'label' and 'fromFile' - are set obligatorily for any nonDefault
  * runs.
  * 'label' may be omitted but this is not recommended.
  * 'act' may have default value 'e' or 'ea' for test  run.
  *
  * Not empty polO.fromFile indicates that 'polO object is used
  * to pass parameters to run method
  *
  * Critical parameters for determined action:
  * act='e'     : fromFile, prefixTo, pathTo.
  * others could have default values
  * act = 'eto' : fromFile, pathTo
  * act = 'a'   : fromFile, pathFrom, assFileName, outputFile
  * act = 'ato' : fromFile, pathFrom, assFileName, outputFile
  *
  * fromFile - gear. Possible scenarios:
  * - pass parameters through polO object's properties
  * - all default case or
  * - standard case with testing act 'e' and parameters preset
  * @param {string} label
  * @param {Object|string|undefined} opt_fromFile
  * @ return {Object|void}
   */
  polO.runArg_2_fromFile_gear = function(label, opt_fromFile){
    var options, parsf,
        sp = polO.sep,
        lp = polO.log.point.runArg_2_fromFile_gear;

    if(opt_fromFile){
      if(/\.json$/.test(opt_fromFile)){
        // presumingy AppsScript project's json file
        // Checks existance of _PARAMS.json co-partner file in params-directory

        parsf = __dirname + sp + path.basename(opt_fromFile,'.json') +
                '_params.json';

        if(polO.hasParamsJson(path.basename(opt_fromFile,'.json'))){
          options = require(parsf);  // get object from .json file

          options.act = options.act ? options.act :
                        (polO.act ? polO.act :
                                   (options.fromFile ?
                                    'e' :    // default for fromFile existed
                                    'ea'));  // all default
          options.fromFile = options.fromFile ? options.fromFile :
                             polO.getDefaultFromFile(options.act); //defaults
        }else{
          /* fromFile has NO PARAMS co-file (params' file not exists)
          * act and other parameters are taken from polO obj properties.
          * few parameters are set here and the rest if any in .work -method
          *  lataer form polO object' properties like polO.pathFrom, ... etc */
          options = {
            act: polO.act ? polO.act : 'e',
            fromFile: opt_fromFile,
            label: label
          };
        }
      }
    }else if(!opt_fromFile ){
      if(lp[0]){
        console.log('fromFile is not set or has bad name --> "' +
            opt_fromFile + '" works allDefault');
      }

      return;  // run without parameters
    }
    return options;
  };

  /**
 * returns default fromFile absolute full path value
 * dependent on act-parameter value
 * @param {string} act action parameter
 * @return {string} absolute full path of default from file.
 */
polO.getDefaultFromFile =  function(act){
  var f = {
    all: ".\\test\\testProjFile.json",
    e: ".\\test\\testProjFile.json",
    a: ".\\test\\testProjFile.json",
    ea: ".\\test\\testProjFile.json"
  };
  var pth = !act ? f.all :
                  (act === 'e' ? f.e :
                  (act === 'a' ? f.a : f.ea));
  return polO.absPath(pth);
};
  /**
   * returns outputFile value depends on the values of other parameters
   * @param {string}opt_act
   * @param {string}opt_fromFile
   * @param {string}opt_prefixTo
   * @param {string}opt_pathFrom
   * @return {string} value of outputFile
   */
  polO.getPathFrom = function(opt_act, opt_fromFile, opt_prefixTo, opt_pathFrom){
    var act = opt_act,
        fF = opt_fromFile, // fromFile
        pxT = opt_prefixTo, // prefixTo
        pF = opt_pathFrom; // pathFrom
    if( act === 'a' || act === 'ato'){
      if(!pxT){
        // prefix's sit is filled by empty string (opt_prefixTo = '')
        // no 'hiding arguments' in calling method
        if(pF){
          if(/\.json$/.test(pF)){
            throw 'Something is wrong:there is path of json file \n' +
                'on pathFrom sit.';
          }else if(!polO.isArgPathFrom(fF,pF)){
            throw 'in getPathFrom: incorrect value of pathFrom';
          }else{
            return polO.absPath(pF);
          }
        }else{
          throw 'pathFrom is not set for \'a\' or \'ato\' action';
        }
      }else{
        // checks if pathFrom sits on prefixTo place?
        if( polO.isArgPathFrom(fF,pxT)){
          console.log('in getPathFrom: pathFrom is sitting on opt_Prefix place');
          return polO.absPath(pxT);
        }else if(/\.json$/.test(pF)){
          throw 'in getPathFrom: json file path instead of pathFrom';
        }else{
          throw 'getPathFrom: incorrect value of pathFrom';
        }
      }
    }else{
      console.log( 'pathFrom parameter is set for Non \'a\' cases?!');
      return pF ? pF : polO.pathFrom;
    }
  };
  /**
   * returns outputFile value dependent on the values of other
   * parameters
   * @param {string}opt_act
   * @param {string}opt_fromFile
   * @param {string}opt_prefixTo
   * @param {string}opt_pathFrom
   * @param {string}opt_assFileName
   * @param {string}opt_outputFile
   * @return {string} value of outputFile
   */
  polO.getOutputFile = function(
      opt_act, opt_fromFile, opt_prefixTo, opt_pathFrom,
      opt_assFileName, opt_outputFile){
    var act = opt_act,
        fF = opt_fromFile,  // fromFile
        pxT = opt_prefixTo,  // prefixTo
        pF = opt_pathFrom,  // pathFrom
        aFN = opt_assFileName,  // assFileName
        ouF = opt_outputFile; //outputFile
    var aF, a;  // assemble full path, arguments

    /** @property {Array.<>} method's input parameters */
    a = Object.values(arguments);
    polO.anv('getAssFileName',...a);

    if( act === 'a' || act === 'ato'){
      if(!pxT){
        // prefixTo's sit is filled by empty string (opt_prefixTo = '')
        // no 'hiding arguments' in calling method
        if(pF){
          if(/\.json$/.test(pF)){
            throw 'Something is wrong:there is path of json file \n' +
                'on pathFrom sit. pathFrom is directory and ' +
                'should be set obligatorily';
          }else if(!ouF && !aFN){
            // default assfile
            return polO.assfile(fF, pF);
          }else if(aFN &&
                   /\.json$/.test(aFN) &&
                   !ouF ){
            console.log('outputFile on assFileName sit');
            aF = aFN;
            return aF;
          }else if(aFN && ouF){
            if(path.basename(ouF).replace(path.extname(ouF),'') === aFN){
              return ouF;
            }else{
              throw "assFileName doesn't match outputFile";
            }
          }else if(aFN && !ouF){
            return polO.assfile(fF,pF,aFN);
          }
        }else{
          // both prefixTo and pathFrom are empty or undefined
          throw 'pathFrom is not set for \'a\' or \'ato\' action';
        }
      }else{
        // checks if pathFrom sits on prefixTo place?
        if( polO.isArgPathFrom(fF, pxT)){
          console.log('in getAssFileName: pathFrom is sat on opt_Prefix place');
          if( pF){
            if(/\.json$/.test(pF)){
              console.log('outputFile on pathFrom sit presumably');
              aF = pF;
              return aF;
            }else{
              //!!! assFileName is on place of pathFrom.
                            aFN = pF;
                            pF = pxT;
              return polO.assfile(fF,pF,aFN);
            }
          }else{
            // case: pathFrom on prefixTo sit, pathFrom sit is empty,
            // checking of sits: assFileName and outputFileis
            pF = pxT;
            if(!aFN && ouF){
              return ouF;
            }else if( aFN && !ouF){
              if(/.json$/.test(aFN)){
                // ouptuFile on assFileName sit
                return aFN;
              }else{
                return polO.assfile(fF,pF,aFN);
              }
            }else if(aFN && ouF){
              if(path.basename(outputFile).replace(path.extname(ouF),'') ===
                 aFN){
                return ouF;
              }else{
                console.log("in getAssFileName:" +
                "value of outputFile parameter doesn't match " +
                "value of assFileName while both are set. outputFile" +
                " is preferred");
                return ouF;
              }
            }else{
              // default ass File while parhFrom on prefixTo sit and
              // (!assFileName && !outputFile)
              pF = pxT;
              return polO.assfile(fF,pF );
            }
          }
        }else if(!polO.isArgPathFrom(fF,pF)){
          throw 'in getAssFileName: incorrect value of pathFrom';
        }else{
          // pathFrom is good. Looks at assFileName
          if(aFN){
            if(/\.json$/.test(aFN)){
              console.log('presumably outputFile on assFileName sit');
              aF = aFN; //full path
              return aF;
            }else if(ouF){
              return ouF;
            }else{
              return polO.assfile(fF,pF,aFN);
            }
          }
        }
      }
     }else{
      console.log( 'outputFile parameter is asked from not \'a\'' +
                   'or not \'ato\' cases; act = %s ?!',act);
      return ouF ? ouF : polO.outputFile;
    }
  };
  /**
   * returns outputFile value depending on the presence and values of
   * method's arguments and values of other managing parameters inside calling
   * function or method
   * @param {string}opt_act
   * @param {string}opt_fromFile
   * @param {string}opt_prefixTo
   * @param {string}opt_pathFrom
   * @param {string}opt_assFileName
   * @param {string}opt_outputFile
   * @return {string} value of assemble File Name
   */
  polO.getAssFileName = function(
      opt_act, opt_fromFile, opt_prefixTo, opt_pathFrom,
      opt_assFileName, opt_outputFile){

    var lp = polO.log.point.getAssFileName, a;
    if(lp[0]){
      a = Object.values(arguments);
      polO.anv('getAssFileName',...a);      // test print
    }
    var act = opt_act,
        fF = opt_fromFile, // fromFile
        pxT = opt_prefixTo, // prefixTo
        pF = opt_pathFrom, // pathFrom
        aFN = opt_assFileName, // assFileName
        ouF = opt_outputFile;  //outputFile

    if( act === 'a' || act === 'ato'){
      ouF = polO.getOutputFile(act, fF, pxT, pF, aFN, ouF);
      return path.basename(ouF,'.json');
    }else{
      // outputFile when act !=='a' or !=='ato'
      console.log('assFileName is asked while act is not \'a no \'ato\n' +
                  'input parameter value is returned');
      return aFN ? aFN : polO.assFileName;
    }
  };
  /**
   * prints callee method name and standard arguments' names and values
   *  into console
   * @example of call inside some function:
   *    var a = Object.values(arguments);
   *    polO.anv('<yourCalleeName>',...a);
   */
  polO.anv = function(callee, opt_act, opt_fromFile, opt_prefixTo,
                      opt_pathFrom, opt_assFileName, opt_outputFile){
    var ptt = /,?\s*opt_/;
    var ns = `${callee}, opt_act, opt_fromFile, opt_prefixTo, opt_pathFrom,
      opt_assFileName, opt_outputFile`.split(ptt).slice(1);
    Object.values(arguments).forEach(
        (el,i)=>{console.log((i===0) ? `in ${el}:` : `${ns[i-1]} -> ${el}`);}
    );
  };
  /**
   * the same as .anv -method but opt_label arguments is included
   * @example of call inside some calle method or function:
   *   var a = Object.values(arguments);
   *   polO.anvl('<yourCalleeName>',...a);
   */
  polO.anvl = function(callee, opt_label, opt_act, opt_fromFile, opt_prefixTo,
                      opt_pathFrom, opt_assFileName, opt_outputFile){
    var ptt = /,?\s*opt_/;
    var ns = `${callee}, opt_label, opt_act, opt_fromFile, opt_prefixTo, opt_pathFrom,
      opt_assFileName, opt_outputFile`.split(ptt).slice(1);
    Object.values(arguments).forEach(
        (el,i)=>{console.log((i===0) ? `in ${el}:` : `${ns[i-1]} -> ${el}`);}
    );
  };
  /**
   * checks if prefixTo sit is occupied by pathFrom parameter
   * @description
   * relations and interdependence of fromFile and pathFrom:
   * 1) fromFile - json file who is parsed into object with
   *     array property files - obj=JSON.parse(fromFileContent)
   *     Array.isArray( obj.files ) === true
   * 2) pathFrom folder should contain all files, described by
   *     dObj.files
   * 3) pathFrom directory can't be not set in a-actions.
   *    but pathFrom could take prefixTo sit among functions' arguments.
   *    To verify that this is the case rule 2) may be used.
   * 4) assFileName - assembly file name without extension presumes
   *    that assFile will be located or inside pathFrom or will have
   *    strict full path outputFile anywhere else.
   *
   * @param {string}fromFile fullPath of input json file
   * @param {string}arg value of opt_prefixTo argument in
   *    calling function
   * @return {boolean} true if arg value has value of
   *    pathFrom folder path
   */
  polO.isArgPathFrom =  function( fromFile,arg){
    var fList, obj, files;
    console.log('in isArgPathFrom:\nfromFile=\n%s\narg=\n%s\n' +
    'fs.existsSync(arg) = %s',
        fromFile, arg, fs.existsSync(arg));
    if( !fs.existsSync(arg) ){
      return false;
    }
    fnms = require(fromFile).files.
        map( function(fl){return fl.name;} );
    try{
      fList = fs.readdirSync( arg).
        map( function(el){ return el.replace(/\..+$/,'');}); // no f.extention
    }catch(e){
      console.log('entity considering as directory is not that one!');
      return false;
    }
    console.log('arrays:\nfnms=\n%s\nfList=\n%s',fnms,fList);
    var testV= (function(){
      for( var i=0; i<fnms.length; i++){
        if( fList.indexOf(fnms[i])<0){
          return false;
        }
      }
      return true;
    }());
    console.log(testV ? 'This is pathFrom' : 'it is NOT pathFrom');
    return testV;

  };
  /**
   * resets renewable (using in calculation) calculating parameters' properties
   * of exporter object
   * @param {Object}exp exporter object
   */
  polO.resetPars = function(exp){
    var ps = [
      'label',
      'act',
      'fromFile',
      'prefixTo',
      'pathTo',
      'pathFrom',
      'assFileName',
      'outputFile'];
    for(var i=0;i<ps.length;i++){
      exp[ps[i]] ='';
    }
    exp.no6 = false;
  };
  /**
   * launches polO-methods with different parameters values over
   * specified timeout period to exclude traffic jam
   * @param {string}opt_label - the label or id of project being handled
   * @param {number}opt_t timeout delay in millisecond. Default=10000
   * @param {}opt_first - is used as opt_act parameter in methods of module
   * @param {}opt_second - equivalent to opt_fromFile parameter in module's
   *     methods.
   * @param {}opt_third - is used as ... parameter in methods of module
   * @param {}opt_fourth - is used as ... parameter in methods of module
   * @param {}opt_fifth - is used as ... parameter in methods of module
   * @param {}opt_sixth - is used as ... parameter in methods of module
   * @param {}opt_seventh - is used as ... parameter in methods of module
   */
  polO.runLauncher_ = function(opt_label,opt_t, opt_first, opt_second, opt_third,
      opt_fourth, opt_fifth, opt_sixth, opt_seventh){
    var label = opt_label || 'absence of label is bad practice' ;
    if( opt_t &&
        (typeof opt_t !== 'number' )){
      throw 'being set first parameter should be a number of milliseconds';
    }
    var t = (polO.timeLag === 0) ? 0 : polO.timeLag;
    polO.timeLag +=  ((opt_t )? opt_t : 10000 );

    var arg = [1,2,3,4,5,6,7];

    arg[0] = opt_first || '';
    arg[1] = opt_second || '';
    arg[2] = opt_third || '';
    arg[3] = opt_fourth || '';
    arg[4] = opt_fifth || '';
    arg[5] = opt_sixth || '';
    arg[6] = opt_seventh || '';
    arg.forEach((e,i)=>{console.log(i+' -> ' + e);});
    console.log('t=%s',t);

    setTimeout( function(){
                  polO.resetPars(polO);
                  polO.label = label;
                  polO.run(label,
                           arg[0],  // act
                           arg[1],  // fromFile
                           arg[2],arg[3],arg[4],arg[5],arg[6]);
                }, t);
  };
  polO.runLauncher = function(opt_label, opt_t, opt_first, opt_second, opt_third,
      opt_fourth, opt_fifth, opt_sixth, opt_seventh){
    var label = opt_label || 'absence of label is bad practice',
        lp = polO.log.point.runLauncher, arg;

    if( opt_t &&
        (typeof opt_t !== 'number' )){
      throw 'being set first parameter should be a number of milliseconds';
    }
    var t = (polO.timeLag === 0) ? 0 : polO.timeLag;
    polO.timeLag +=  ((opt_t )? opt_t : 10000 );
    arg = Object.values(arguments).slice(2);

    if(lp[0]){
      arg.forEach((e,i)=>{console.log(i+' -> ' + e);});
      console.log('t=%s',t);
    }
    setTimeout( function(){
                polO.resetPars(polO);
                polO.label = label;
                polO.run(label,arg[0],arg[1],arg[2],arg[3],arg[4],arg[5],arg[6]);
               },t);
  };
  /**
   * tests polO.run method
   * or presents the prototype of consecutive projects data handling
   * Each project determined by it's label or id. In the example bellow
   * this is a descriptive comment.
   */
  polO.workTest = function(){
    var o, label,
        tau = 5000, act,
        fFString,
        fF, assFN, outF,
        lp = polO.log.point.workTest;

    if(lp[0]){
      //  test (0)
      label = 'TEST all defaults Case (0)';
      console.log(label);
      polO.runLauncher(label,0);
    }
    if(lp[1]){
      o = {
        act: '',
      };

      // test (1-0)
      label ='TEST all default parameters case (1)';
      console.log(label);
      polO.runLauncher( label,tau,'o',o);

      //  test (2-0)
      label ='TEST all default parameters case (2)';
      console.log(label);
      polO.runLauncher(  label, tau,'',o);

      // test (3-0)
      label = 'TEST all default parameters case (3)';
      console.log(label);
      polO.runLauncher( label,tau,o); //polO.run(o);
    }
    if(lp[2]){
      o = {
        act: 'e',
        fromFile:'j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codes\\'+
            'smsCikPostCallHandle_Scripts.json',
       prefixTo:''
      };

      //  test (1-e) fF - set pxT - default
      label = 'TEST (1-e) fF - set pxT - default';
      console.log(label);
      polO.runLauncher( label,tau,'o',o); //polO.run('o',o);

      // test (2-e) fF - set pxT - default
      label = 'TEST (2-e) fF - set pxT - default';
      console.log(label);
      polO.runLauncher( label,tau,'',o); //polO.run('',o);

      // test (3-e) fF - set pxT - default
      label = 'TEST (3-e) fF - set pxT - default';
      console.log(label);
      polO.runLauncher( label,tau,o); //polO.run(o);
    }
    if(lp[3]){
      o = {
        act: 'e',
        fromFile:'j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codes\\'+
            'smsCikPostCallHandle_Scripts.json',
        prefixTo:'j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codesRf_'
      };

      //  test (1-e) fF - set pxT - set
      label = 'TEST (1-e) fF - set pxT - set';
      console.log(label);
      polO.runLauncher( label,tau,'o',o);             //polO.run('o',o);

      // test (2-e) fF - set pxT - set
      label = 'TEST (2-e) fF - set pxT - set';
      console.log(label);
      polO.runLauncher( label,tau,'',o);              //polO.run('',o);

      // test (3-e) fF - set pxT - set
      label = 'TEST (3-e) fF - set pxT - set';
      console.log(label);
      polO.runLauncher( label,tau,o);                 // polO.run(o);
    }
  //------------------ f --------------


    if(lp[4]){
      // test (4-0 f->e)
      label = 'TEST all default parameters case (4-0 f->e)';
      console.log(label);
      polO.runLauncher( label,tau,'f','allDefaults'); //polO.run(label,
                                                      //  'f','allDefaults');
      //  test (5-0 f->e)
      label = 'TEST all default parameters case (5-0 f->e)';
      console.log(label);
      polO.runLauncher( label,tau,'','allDefaults');  //polO.run(labe,'','allDefaults');

      // test (6-0 f->e)
      label = 'TEST all default parameters case (6-0 f->e)';
      console.log(label);
      polO.runLauncher( label,tau,'allDefaults');    //polO.run(labe,'allDefaults');
    }
    if(lp[5]){
      //  test (4-e) fF - set pxT - default
      label = 'TEST fromFile is set and prefixTo - default (4- f->e)';
      console.log(label);
      polO.runLauncher( label,tau,'f','0'); //polO.run(labe,'f','0');

      // test (5-e) fF - set pxT - default
      label = 'TEST fromFile is set and prefixTo - default (5- f->e)';
      console.log(label);
      polO.runLauncher( label,tau,'','0'); //polO.run('','0');

      // test (6-e) fF - set pxT - default
      label = 'TEST-> fromFile is set and prefixTo - default (6- f->e)';
      console.log(label);
      polO.runLauncher( label,tau,'0'); //polO.run('0');
    }
    if(lp[6]){
      //  test (4-e) fF - set pxT - set
      label = 'TEST fromFile set and prefixTo set case (4- f->e)';
      console.log(label);
      polO.runLauncher( label,tau,'f','1'); //polO.run('f','1');

      // test (5-e) fF - set pxT - set
      label = 'TEST fromFile set and prefixTo set case (5- f->e)';
      console.log(label);
      polO.runLauncher( label,tau,'','1'); //polO.run('','1');

      // test (6-e) fF - set pxT - set
      label = 'TEST fromFile set and prefixTo set case (6- f->e)';
      console.log(label);
      polO.runLauncher( label,tau,'1'); //polO.run('1');
    }

    fFString = path.join( process.cwd(),
                         '/params/' + fs.readdirSync(
                                          path.join(process.cwd(),'./params')).
                                      filter((fl)=>{return /43/.test(fl);})[0]);
    if(lp[7]){
      //  test a fF pthFr(pxTo) assFN  - set
      label = '1_a_fromFile_set_pathFrom_on_prefixTo_sit';
      //fromFile
      act='a';
      fF = require(fFString).fromFile;
      /*
          path.join(process.cwd(),
                    '/params/' + fs.readdirSync(
                                     path.join(process.cwd(),'./params')).
                                 filter((fl)=>{return /43/.test(fl);})[0]
          )*/ /*).fromFile;*/
      assFN = '1-test_a_fF_pthFrm(pxTo)_assFNm';
      pthFrm = require(fFString).pathFrom;

      console.log(label);
      polO.runLauncher( label,tau,act,fF,pthFrm,assFN);
    }
    if(lp[8]){
      //  test a fF pthFr(pxTo) assFN  - set
      label = '2_TEST_fromFile_outF_set_pathFrom_on_prefixTo_sit';
      //fromFile
      act='a';
      fF = require(fFString).fromFile;
      assFN = '2-Test_a_fF_pthFrm(pxTo)_outF';

      pthFrm = require(fFString).pathFrom;
      outF = path.join( pthFrm, '/'+assFN+'.json');
      console.log(label);
      polO.runLauncher( label,tau,act,fF,pthFrm,outF);

    }
    if(lp[9]){
      //  test a fF pthFr assFN  - set
      label = '3_a_TEST_fromFile_assFN_set_pathFrom_atSite';
      //fromFile
      act='a';
      fF = require(fFString).fromFile;
      assFN = '3-test_a_fF_pthFrm_assFNm';
      pthFrm = require(fFString).pathFrom;

      console.log(label);
      polO.runLauncher( label,tau,act,fF,'',pthFrm,assFN);
    }
    if(lp[10]){
      //  test a fF pthFr(pxTo) outF  - set
      label = '4_TEST_fromFile_outF_set_pathFrom_at_site';
      //fromFile
      act='a';
      fF = require(fFString).fromFile;
      assFN = '4-Test_a_fF_pthFrm_outF';

      pthFrm = require(fFString).pathFrom;
      outF = path.join( pthFrm, '/'+assFN+'.json');
      console.log(label);
      polO.runLauncher( label,tau,act,fF,'',pthFrm,outF);

    }
    if(lp[11]){
      //  test a fF pthFr(pxTo) outF  - set
      label = '5_ato_TEST_fromFile_outF_set_pathFrom_at_site';
      //fromFile
      act='ato';
      fF = require(fFString).fromFile;
      assFN = '5-Test_ato_fF_pthFrm_outF';

      pthFrm = require(fFString).pathFrom;
      outF = path.join( pthFrm, '/'+assFN+'.json');

      console.log(label);
      polO.runLauncher( label,tau,act,fF,'',pthFrm,outF);

    }
    if(lp[12]){
      //  test a fF pthFr(pxTo) outF  - set
      label = '6_ato_TEST_fromFile_outF_set_pathFrom_at_pxTo sit';
      //fromFile
      act='ato';
      fF = require(fFString).fromFile;
      assFN = '6-Test_ato_fF_pthFrm(pxTo)_outF';

      pthFrm = require(fFString).pathFrom;
      outF = path.join( pthFrm, '/'+assFN+'.json');
      console.log(label);
      polO.runLauncher( label,tau,act,fF,pthFrm,outF);

    }

    // finish
    console.log('WorkTest has ended.');
  };
  /**
   * tests current module
   */
  polO.test = function(){
    var fromFile, mode, path, prefixTo, label;
    path = "j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codes";
    // output directory prefix
    prefixTo = ""+
      "j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codesRf_";
    // absolute path and filename
    fromFile = path + "\\" + "smsCikPostCallHandle_Scripts.json";
    label = 'Tests proj-offliner polO.test()';
    if(0){
    // -- evoking js files from json testing modes --
    // rf - mode
    mode = 'rf';
    console.log('%s - mode - "read file" - reads googleScript json - file',mode);
    polO.evokeAspFiles(label, fromFile, prefixTo,'', mode);
    console.log('Thats All with %s testing',mode);
    }
    if(0){
    // req - mode
    mode = 'req';
    console.log('%s - mode ',mode);
    polO.evokeAspFiles(label, fromFile, prefixTo,'',mode);
    console.log('Thats All with %s testing',mode);
    }
    // assembling tests
    if(0){
      // location of asp-filess edited
      var pathFromSuffix = "46SkrH"; // need to write actual one
      var pathFrom = prefixTo + pathFromSuffix;
      polO.assembleProjFile(label,fromFile,pathFrom);
    }
  };
  /**
   * sets event listeners
   * 'objReady' - is fired when object got from json file is ready
   * 'toFolderReady' - is fired when destination folder has become
   * determined
   */
  polO.setEvents = function(myEE){
    myEE.on('toFolderReady',polO.evokeObjFromFile);
    myEE.on('assembleFileReady',polO.evokeObjFromAssFile);
    myEE.on('objReady',polO.evokeScriptsFromObj);
    myEE.on('preUploadAssembleFile',polO.preUploadFile);
    myEE.on('preUploadAssembleFileAsync',polO.preUploadFileAsync);
    myEE.on('readyWriteOutputFile',polO.writeAssFile);
    myEE.on('endpoint-e',polO.eEndpoint);
    myEE.on('endpoint-a',polO.aEndpoint);
  }(polO.myEE);  //  or polO.setEvents(polO.myEE);
  /**
   * instantiates proj-offliner object
   * @param {string}label unique identifier of project run
   * @return {object} instance of porj-offliner object
   */
  polO.clone = function(label){
    return require('./polOClone.js').clone(label);
  };
  /** @property {string} __dirname */
   polO.dirname = __dirname;
  /** @property {string} __filename*/
   polO.filename = __filename;
  /**
   * makes path absolute if it's not yet
   * @param {string} pth - some path value
   * @return {string} absolute value of input path
   */
  polO.absPath = function(pth){
    if (!pth){return '';}
    return  path.isAbsolute(pth) ?
            pth :
            path.join(polO.dirname, pth);
  };

    return polO;
}());
/**
 * 
 * @param {number|Boolean} onoff equivalent of 1 or 0 in equation (onoff)?1:0;
 * @param {string} gr method(group) name
 * @param {string} inds string of indices of polO.log.point[gr] which value
 *   should be set to onoff
 */
var setlp = (onoff,gr,inds) => {
  var vs = polO.log.point[gr],
      v = inds.split(',');
  vs.forEach((e,i) => {    
    if( v.indexOf(''+i) >= 0){   
      polO.log.point[gr][i] = (onoff)? 1:0;      
    }});
  };