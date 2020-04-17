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
    return new EE;
  };
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
  polO.myEE = polO.getEventsEmInstance();    
    
  //  polO modification
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
 
  // ----- EVOKE JS - FILES ---------
  /**
   * separates json file name from path
   * @param {string}fPath
   * @return {object|boolean=false} false if file is not json-file
   *   @property{string} o.fnm file name
   *   @property{string} o.path file path
   */
  polO.separatePathAndFileName = function(fpath){
    var pth, fnm;
    //RegExp to select file name in full path
    var pattFnm = /\b\w+[.]json$/;
    pth = pattFnm.test(fpath) ?
      fpath.replace(pattFnm,'') : undefined;
    if(pth === undefined){
      return false;
    }
    fnm = fpath.replace(pth,'');
    pth = (pth === '' || pth === '/' || pth ==='\\') ? '.' : pth;
    return {
      fnm: fnm,
      path: pth.replace(/(\/|\\)+$/,'')
    };
  };
  /**
   * On the bases of full file path creates prefixTo path
   * comprising of path to file's host folder and file name without extension
   * which could be used or as pathTo directory during js - files extraction
   * from json file or for new file path at assembling new json file
   * @param {string}fp - full path to json file including file name
   * @return {string} path to subdirectory named as fileName without
   * extension
   */
  polO.fileNameToPath = function (fp){
    var o, prfx;
    var sp = polO.sep;
    o = polO.separatePathAndFileName(fp);
    prfx = o.fnm ? o.fnm.replace(/\.json$/,''):"";
    if(/\//.test(o.path)){
      return prfx? o.path+'/' + prfx : "";
    }else if(/\\/.test(o.path)){
      return prfx? o.path+'\\' + prfx : "";
    }else{
      if(prfx){
        return (o.path)? o.path + sp + prfx :"";
      }
      return "";
    }
  };
  /**
   * 'toFolderReady' event emitter/
   * Sets temporary folder where to place temporary data.
   * Folder path is determined by adding six random characters to prefixTo path.
   * !!It is possible to set fixed path of destination folder on user choice
   * but this should be done by setting property polO.pathTo DIRECTLY!!.
   * @param {string}label - identifier of project being handled
   * @param {string}fromFile - full path to json file from which sources data
   *   are extracted
   * @param {string}prefixTo - string representing a part of a full path
   *   to which six random characters will be added to form path to new
   *   directory to be created. This path is passed to callback function
   *   of fs.mkdtemp() as second parameter and appropriate directory
   *   will be created.
   * @return {string} path to destination folder
   *   if full path to newly created directory would have been determined
   *   the polO.pathTo will have been set and event 'toFolderReady' will be
   *   fired,  otherwise
   *   polO.pathTo === undefined without appropriate event emitting
   */
  polO.evokeJsFiles = function(label,fromFile,opt_prefixTo,opt_act,opt_mode){
    var act = opt_act || polO.act || 'unknown act';
    var mode = opt_mode||'req';
    // output folders
    console.log('\n\ninside evokeJsFiles begins with parameters:' +
                '\n  >----------<\n' +
                'fromFile=\n' +fromFile+ '\n' +
                'opt_prefixTo=\n' + opt_prefixTo +'\n' +
                'polO.fromFile= \n' + polO.fromFile + '\n' +
                'opt_act= ' + opt_act +'\n' +
                'polO.act= ' + polO.act + '\n' +
                'label = ' + label +
                '\n  >----------<\n');

    /**
     * @description
     * - if opt_prefixTo is not set checks polO.prefixTo
     * - if polO.prefixTo is not set, file name of fromFile without
     * extension is used as prefixTo and the directory with name
     * <prefixTo>XXXXXX will be created inside host folder of fromFile and
     * will be assigned as pathTo for js-files being going to be extracted
     * will have been placed there.
     * XXXXXX - 6 random alphanumerical characters
     * - in the case when it's necessary to use some path specified as pathTo
     * parameter without appending six random characters to the name of folder
     * the following rules should be followed by:
     * 1. property polO.no6 should be set true and
     * 2. polO.prefixTo as well as opt_prefixTo should be empty string ''.
     * 3. The value of pathTo is taken from polO.pathTo property
     * 4. if the folder with path pathTo does not exist it will be created.
     *
     */
    var prefixTo = opt_prefixTo ||
        polO.prefixTo ||
        ( !polO.no6 && !polO.pathTo ? polO.fileNameToPath(fromFile)+'_' : '') ;
    polO.prefixTo = prefixTo;

    if(polO.no6){
      if(polO.pathTo){
        var pathTo = polO.pathTo;
        polO.pathTo = '';
        polO.no6 = false; // resets to default value
        if( !fs.existsSync(pathTo) ){
          fs.mkdir(pathTo,function(err){
            if(err){
              console.log(err+'\n' +
                  'failed to create new directory\n%s',pathTo);
            }
            polO.pathTo = '';
            polO.myEE.emit('toFolderReady', label, fromFile,pathTo,act,mode);
          });
          return;
        }
        polO.pathTo = '';
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
    polO.pathTo=''; // from this point this parameter is not needed
    fs.mkdtemp(prefixTo,function(err,pathTo){
      if(err){
        console.log(
        "Error while creating temporary folder by means of fs.mkdtemp "+
        err);
        polO.pathTo = undefined;
      }
      polO.pathTo = '';
      polO.myEE.emit('toFolderReady', label, fromFile,pathTo,act,mode);
    });
  };
  /**
   * 'toFolderReady' event listener
   * by means of node.js fs module reads input json - file from drive and
   * transforms  it's content into an object then
   * emits custom event 'objReady' to chain next calculation
   * with parameters for callback function: dObj,pathTo
   * @param {string}label identifier of the project being handled
   * @param {string}fromFile absolute path to json - file including name
   * @param {string}pathTo absolute path to folder where to place results
   * @param {string}opt_mode - method's mode:
   *   "req" default - gets json file with Google appScript project codes
   *      and returns appropriate object by means of node require() function
   *   "rf" - gets object by parsing data preliminary read by fs.readFile object
   * @return {Object|void} JSON.parse(json - data)object or void in the case
   *   of js - project scripts
   */
  polO.evokeObjFromFile = function (label, fromFile,pathTo,act, opt_mode){
    var mode = opt_mode || 'req';
    var dObj;
    if( mode === 'rf') {
      fs.readFile(fromFile,function(err,data){
        if(err){
          console.log('Error %s\nhas occurred in evokeObjFromFile listener\n'
          +' while reading file %s'
          +'\nmode=%s:',err,fromFile,mode);
        }else{
          dObj = JSON.parse(data);
        }
      });
    }else if(mode === 'req'){
      dObj = require(fromFile);
    }else{
      console.log('bad mode value');
    }
    polO.myEE.emit('objReady',label,dObj,fromFile,pathTo,act);
  }
    /**
   * "objReady" event's listener
   * Checks if dObj has property dObj.files if 'yes' -
   * copy files scripts(files[i].source) content into
   * separate files and writes them into pathTo directory
   * evokes scripts from .source properties of dObj.files array
   * elements and writes them in appropriate files within pathTo
   * @param {string}label identifier of project being handled
   * @param {Object}dObj - object got from require(fromFile json-file)
   * @param {string}fromFile absolute path to json - file including name
   * @param {string}pathTo - folder path where to place scripts' js-files
   * @param {string}act - actual value of action parameter
   * @return {void)} creates or rewrites file on drive
   */
  polO.evokeScriptsFromObj = function (label,dObj,fromFile,pathTo,act){
    if(!dObj.hasOwnProperty('files')){
      throw 'object has no property dObj.files';
    }else if(!dObj){
      throw( 'dObj parameter is undefined or null');
    }
    console.log(
        '\n\nInside polO.evokeScriptsFromObj: Temporary folder is ready:' +
        '\n%s\n'+
        'Data object received. String length= %s',
        pathTo,
        JSON.stringify(dObj).length );
    if(!(dObj.hasOwnProperty('files') && Array.isArray(dObj.files))){
      console.log('object has no dObj.files property or this\n' +
                  'property is not an Array!');
      return;
    }

    var sep = polO.sep;
    var files = (dObj.hasOwnProperty('files')) ? dObj.files:[];
    var file,fName,fScripts,fw;
    if(files && Array.isArray(files) && files.length > 0){
      for(var i = 0; i < files.length;i++){
        file = files[i];           // each file is an object
        fName = file.name;
        fScripts = file.source;    // javaScript codes
        fw = pathTo + sep + fName + ".js";
        fs.writeFile(fw,fScripts,function(err){
          if(err){
            console.log(err +
               "\noccurred while trying to write a file" +
               " for i=%s and file.name=%s",
              i,fName);
          }
        });
      }
      var iti=0;
      var ti=setInterval(function(){
        if( fs.readdirSync(pathTo).length === files.length ){
          clearInterval(ti);
          console.log('\n\nin placeScriptsTo: timeInterval cleared at' +
                       ' attempt number(iti) =%s',iti);
          // last file handled
          console.log( 'js-Files Evoked into folder:\n' +  pathTo +'\n');

          // opens Windows files Explorer for folder with js-files written.
          var childProc = cp.execSync(
              'start explorer.exe ' +
              '"' +
              pathTo+
              '" & exit');

          // writes parameters file into ./params folder (synchronously)
          polO.writeParamsFile(label,fromFile,pathTo,act);
          //return;
        }else{
          iti++;
        }
      },1);
    }else{
      console.log('dObj.files is not set or is empty');
    }
  };
  /**
   * writes params - json file into ./params folder
   * @param {string}label identifier of project being handled
   * @param {string}fromFile - folder with js-files. Should be renamed as pathFrom
   * @param {string}pathTo - directory path
   * @param {string}opt_pathFrom - path of directory from which js-files should
   *     be taken for assembling output json file
   * @param {string}opt_act - actual value of action parameter
   * @param {string}opt_prefixTo - prefix used to create pathTo if any
   * @param {string}opt_assFileName
   * @param {string}opt_outputFile
   * @return {string} params-file path
   */
  polO.writeParamsFile=function(label,fromFile, pathTo, opt_act, opt_pathFrom,
                                    opt_prefixTo, opt_assFileName,
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
    var sep = polO.sep;
    var fnm = path.basename(fromFile,'.json'); // file name without extension
    var fpth = __dirname + sep + 'params' + sep + fnm + '_params.json';
    fpth = polO.checkParamsFileName(
        fpth.replace(/_params\.json/,'_0_params.json'));
    polO.paramsFile = fpth;

    var data = JSON.stringify(o);
    if( act === 'ea'){
      fs.writeFileSync(fpth, data);
      console.log( 'params json file \n%s\n has been written',
              fpth);
      polO.myEE.emit('endpoint-e',label, fromFile,pathTo,act);
    }else{
      console.log('\n\nin writeParamsFile writes params-file asynchronously\n\n');
      fs.writeFile(fpth, data,'utf-8',function(err){
        if(err){
          console.log('error occured while writitng params-file :\n%s',err);
        }
        console.log('\n\nParamsFile has been written, it\'s path =\n%s',fpth);
        polO.myEE.emit('endpoint-e',label, fromFile,pathTo, act);
      });
    }
    if(0){
      // ToDo: writes using streams objects
    }
    return fpth;
  };
   /**
    * 'endpoint-e' event listener (evoke)
    * @param{string}label identifier of project being handled
    * @param {string}pathTo path to the directory where js-files have been
    *     located.
    * @param {string}fromFile - original json-file
    * @param {string}act - actual value of act parameter
    */
  polO.eEndpoint = function (label,fromFile,pathTo, act){
    var pathFrom;
    console.log('\n\nEndpoint of Evoke-mode has been reached.'+
                ' Event \'endopoint-e\'\n'+
                'label = '+ label +
                '\npathTo =\n' + pathTo );

    if( act === 'ea'){
      pathFrom =  pathTo;
      polO.pathFrom = pathFrom;
      polO.pathTo = '';
      polO.work(label,'a',fromFile,'',pathFrom);
    }
    console.log('Exit from eEndpoint without chaining for\n' +
       'fromFile=\n%s\n' +
       'label = %s\n'+
       'and act= %s',
       polO.fromFile,
       label,
       act);
  }
  //  -----  ASSEMBLE ---------
  /**
   * 'assembleFileRedy' event emitter
   * Assembles scripts content of js-files modified into json file
   * prepared to uploading it to Google appScript project.
   * @param {string}label identifier of project being handled
   * @param {string}opt_fromFile  (originalJsonFileDownloaded) full file path of
   *    original Google project json file downloaded from GoogleDrive
   * @param {string}opt_pathFrom path to the destination folder for output
   *     json file. This is the same folder where js-files modified,
   *     obtain from original json file, are placed earlier and appropriately
   *     are taken from.
   * @param {string}opt_assFileName output json file name to be written.
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
      label,opt_fromFile, opt_pathFrom, opt_assFileName, opt_outputFile){
    console.log( '\n\nInside assembleProjFile\n'+
        '\n------vvvvvv------\n' +
        'opt_fromFile =\n%s\n'+
        'opt_pathFrom =\n%s\n' +
        'opt_assFileName =\n%s\n'+
        'opt_ouputFile =\n%s\n' +
        'label = %s' +
        '\n------^^^^^^------\n',
        opt_fromFile,
        opt_pathFrom,
        opt_assFileName,
        opt_outputFile,
        label);

    var outputFile = opt_outputFile || polO.outputFile;
    var fromFile =  opt_fromFile || polO.fromFile || "";
    polO.fromFile = fromFile;
    if(!fromFile){
      throw 'assembleProjFile: original json file has not been set';
    }
    polO.assemble = true;

    var oFP, outFileName, outPath,
        sp = polO.sep;
    if( !outputFile){
      oFP = polO.separatePathAndFileName(fromFile);

      outFileName  = opt_assFileName ?
                     opt_assFileName :
                     (
                      polO.assFileName ?
                      polO.assFileName :
                      oFP.fnm.replace(/\.json$/,'')+'_modified.json'
                     );
      outPath = opt_pathFrom ?
                opt_pathFrom :
                (polO.pathFrom ? polO.pathFrom : oFP.path);
      outputFile = outPath + sp + outFileName;
    }else{
      outPath = path.dirname(outputFile);
    }
    fs.copyFile(fromFile, outputFile, function(err){
      if(err){
        throw(err);
      }
      // emits assembleFileReady event
      console.log('\n\nBefore assembleFileReady event emit \n' +
          'outPath=\n%s\n'+
          'outputFile=\n%s',
          outPath,
          outputFile);
      polO.myEE.emit('assembleFileReady',label,outputFile,outPath,'req');
    });
  };
  /**
   * 'assembleFileReady' event listener
   * by means of fs module reads input json-file from drive and
   * transforms  it's content into an object then
   * emits custom event 'preUploadAssembleFile' to chain next calculations:
   * the content of dObj.files[i].script properties will be exchanged by scripts
   * of modified js-files locating in pathFrom directory.
   * parameters for callback function: dObj,fromFile,pathFrom
   * @param {string}label identifier of project being handled
   * @param {string}fromFile absolute path to json - file including name
   * @param {string}pathFrom absolute path to where js-files already modified
   *     are stored.
   * @param {string}opt_mode - method's mode:
   *   "req" default - gets json file with Google appScript project codes
   *      and returns appropriate object by means of node require() function
   *   "rf" - gets object by parsing data preliminary read by fs.readFile object
   *
   */
  polO.evokeObjFromAssFile = function (label,fromFile,pathFrom,opt_mode){
    var mode = opt_mode || "req";
    var dObj;
    if( mode === 'rf') {
      fs.readFile(fromFile,function(err,data){
        if(err){
          console.log('Error %s\nhas occurred in evokeObjFromFile\n'
          +' while reading file\n%s\n'
          +'mode=%s:',err,fromFile,mode);
        }else{
          dObj = JSON.parse(data);
          polO.myEE.emit('preUploadAssembleFile',label,dObj,fromFile,pathFrom);
        }
      });
    }else if(mode === 'req'){
      dObj = require(fromFile);
      polO.myEE.emit('preUploadAssembleFile',label,dObj, fromFile, pathFrom);
    }else{
      console.log('bad mode value');
    }
  };
  /**
   * "preUploadAssembleFile" event's listener
   * Checks if dObj has property dObj.files if 'yes' -
   * in the pathFrom folder reads js-file content and writes it
   * into appropriate dObj.files[i].script property of dObj
   * after that writes dObj stringified by JSON.stringify string
   * into a copy of original fromFile modifying it's name
   * collects data from modified js-files and includes it into output assemble
   * object then stringifies object and writes json string into output file.

   * @param {string}label identifier of project being handled with
   * @param {Object}dObj - object got from json data
   * @param {string}fromFile - full path to json file being assembled
   * @param {string}pathFrom - path to folder where to get data js-files from
   * @param {string}opt_outputFile - customer output file path.
   *     Full path including file name with extension.
   *     Optional. If it's not set available fromFile is modified and used
   *     for output writing.
   * @param {boolean}opt_assync - true if asynchronous mode of file handling
   *     should be used. Default is false.

   */
  polO.preUploadFile = function (label, dObj, fromFile, pathFrom,
                         opt_outputFile, opt_assync){

    if(!dObj.hasOwnProperty('files')){
      throw 'data object has no property dObj.files';
    }
    var async = opt_assync || false;
    var sp = polO.sep;

    var outputFile =
        opt_outputFile ||
        polO.checkAssFileName( fromFile.replace(/\.json/,'_0.json'));

    var files = dObj.files;
    if( !Array.isArray(files) || files.length <= 1){
      console.log( 'files property of dObj is not Array or has no elements');
      return;
    }
    polO.assFN = files.length;
    var file, fname, fpath;
    console.log('\n\nBefore cycling over dObj.files[i] properies\n'+
        'pathFrom:\n%s\n',pathFrom);

    for(var i = 0;i < files.length;i++){
      file = files[i];
      fname = file.name;
      fpath = pathFrom + sp + fname+'.js';
      console.log( 'fname=\n%s,\nfpath=\n%s\n',fname,fpath);
      if(fs.existsSync(fpath)){
        polO.log.nFilesToRead++;
        polO.log.filesStatus[fpath]='beforeRead';
        if(async){
          /* NEED TO BE INVENTED !!!! Not works yet!
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
          polO.loop = setInterval( function(){
            if(polO.log.nFilesAlreadyRead === polO.log.nFilesToRead){
              clearInterval(polO.loop);
              polO.myEE.emit('readyWriteOutputFile',label,
                                dObj, outputFile);
            }
          },1000);
        }else{
          console.log( '\n\nBefore \'readyWriteOutputFile\' event emit\n'+
              'outputFile =\n%s\n',outputFile);
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
   * @param {object}dObj - final json file data as an object
   *     (prepared for serializing )
   * @param {string}outputFile - full path to final json file
   *     including file name with extension.
   */
  polO.writeAssFile = function (label, dObj,outputFile){
    console.log('\n\nInside writeAssFile ');
    var outPth;
    var data = JSON.stringify(dObj);
    fs.writeFile(outputFile,data,function(err){
        if(err){
          console.log(
            err+'\nwhile attempting to write finally assembled json - file');
        }else{
          outPth = polO.separatePathAndFileName(outputFile).path;
          console.log('Assembly has finished\noutput file:\n%s\n' +
          'json-file has been written into folder outPth =\n%s\n',
          outputFile, outPth);
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
   * 'endpoint-a' event listener (assemble)
   * @param {string}pathTo path to the directory where js-files have been
   *     located.
   */
  polO.aEndpoint = function (label,outputFile){
    polO.lastAEndpoint = new Date().getTime();
    console.log('\n\nEndpoint of Assemble-mode has been reached.'+
                ' Event \'endopoint-a\'\n'+
                'outputFile =\n%s\n' +
                'label = %s',
                outputFile,
                label);

  };
  /**
   * Checks availability of final assemble file name.
   * If presumed one is already  available
   * last digit of the name string increased by one
   * @param {string}pathTesting
   * @return {string} name chosen
   */
  polO.checkAssFileName = function(pathTesting){
    while( fs.existsSync(pathTesting)){
      pathTesting  = (function (){
        var nm, a, i, iplus;
        nm = pathTesting.replace(/\.json/,'');
        a = nm.split('_');
        i = parseInt(a[a.length - 1]);
        iplus = i + 1;
        return nm.replace(/\_\d+$/,'') + "_" + iplus + ".json";}());
    }
    return pathTesting;
  };
  /**
   * Checks availability of final params file name.
   * If the one being presumed is already  available
   * the digit preceded '_params.json' part will be increased by one
   * @param {string}pathTesting - full path of params-file testing including
   *     file name and extension
   * @return {string} name chosen
   */
  polO.checkParamsFileName = function(pathTesting){
    while( fs.existsSync(pathTesting)){
      pathTesting  = (function (){
        var nm, a, i, iplus;
        nm = pathTesting.replace(/_params\.json/,'');
        a = nm.split('_');
        i = parseInt(a[a.length - 1]);
        iplus = i + 1;
        return nm.replace(/\_\d+$/,'') + "_" + iplus + "_params.json";}());
    }
    return pathTesting;
  };
  /**
   * writes read me - text into console output
   */
  polO.readme = function(){
    var read = require('./readme.js');
    read.readme();
  };
  /**
   * tests current module
   */
  polO.test = function(){
    var fromFile, mode, path, prefixTo;
    path = "j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codes";
    // output directory prefix
    prefixTo = ""+
      "j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codesRf_";
    // absolute path and filename
    fromFile = path + "\\" + "smsCikPostCallHandle_Scripts.json";
    if(0){
    // -- evoking js files from json testing modes --
    // rf - mode
    mode = 'rf';
    console.log('%s - mode - "read file" - reads googleScript json - file',mode);
    polO.evokeJsFiles(label,fromFile,prefixTo,mode);
    console.log('Thats All with %s testing',mode);
    }
    if(0){
    // req - mode
    mode = 'req';
    console.log('%s - mode ',mode);
    polO.evokeJsFiles(label,fromFile,prefixTo,mode);
    console.log('Thats All with %s testing',mode);
    }
    // assembling tests
    if(1){
      // location of js-files edited
      var pathFromSuffix = "ChxS0s";
      var pathFrom = prefixTo + pathFromSuffix;
      polO.assembleProjFile(label,fromFile,pathFrom);
    }
  };
  /**
   * @description prefixTo setting
   * - if opt_prefixTo is not set checks polO.prefixTo
   * - if polO.prefixTo is not set, file name of fromFile without
   * extension is used as prefixTo and the directory with name
   * <prefixTo>XXXXXX will be created inside host folder of fromFile and
   * will be assigned as pathTo for are going to be extracted js-files.
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
   *     js-files are extracted
   * @param {object}exports - module.exports object
   * @param {string}optPrefixTo - prefixTo parameter set whicj is opt_prefixTo
   *     inside calling function
   * @return {string} prefixTo value string
   */
  polO.getPrefixTo = function(act,fromFile,exports,optPrefixTo){

    var fF, dFF, sep = polO.sep;
    if(act === 'eto'){
      return '';
    }else{
      if(optPrefixTo){
        return  optPrefixTo  ;
      }else if(polO.prefixTo){
        return polO.prefixTo;
      }else if( fromFile || polO.fromFile ){
        fF = fromFile ? fromFile :
            ( polO.fromFile ? polO.fromFile : '' );
        if(fF && !/testProjFile[.]json$/.test(fF)){
          // derives prefixTo from fromFile path and fromFileName
          dFF = !polO.no6 && !polO.pathTo ?
                    polO.fileNameToPath(fF)+'_' :
                    '';
          return  dFF;
        }else{
          // default value of prefix for test
          return __dirname + sep + 'test' + sep +'pathTo_';
        }
      }
    }
  };
  /**
   * !!! if pathTo is predetermined it should be set in advance
   * before polO.work call by assigning polO.pathTo property !!!
   * This case is appropriate to 'eto' action parameter mode for which
   * opt_prefixTo argument contains the value of pathTo parameter
   * @param {string}act action parameter
   * @param {string}optPrefixTo - opt_prefixTo value in calling function
   * @param {object}exports - module.exports object
   * @return {string}  pathTo value
   */
  polO.getPathTo =  function(act,optPrefixTo,exports){
    if(act === 'eto' && opt_prefixTo ){
      polO.no6 = true;
      polO.prefixTo = '';
      return opt_prefixTo;
    }else{
      return polO.pathTo ?
             polO.pathTo :
             '';
    }
  };
  /**
   * working engine
   * fulfills or extraction(evoking) of js-files from json-file
   * or assembly of final json-file using js-files already modified
   * depending on the act - parameter value
   * @param {string}label - the label of project being handled
   * @param {string}opt_act - action parameter indicating
   *       working mode: 'e' | 'a' |'ea' | 'eto' | 'ato' ...
   * @param {string}opt_fromFile - source json file
   * @param {string}opt_prefixTo - prefix of pathTo directory name.
   *     Six random alphanumerical characters are appended to prefix
   *     to form pathTo - path of folder where to place js-files extracting.
   *     If action parameter opt_act has value 'eto' prefixTo has
   *     meaning and value of pathTo and no characters appending will be
   *     taken place.
   * @param {string}opt_pathFrom - where to take js file for assembling json-file
   * @param {string}opt_assFileNems - name of json file assembled
   * @param {string}opt_outputFile - full path to user defined assembly file
   *     including file name and extension
   */
  polO.work = function(label,
                          opt_act,
                          opt_fromFile,
                          opt_prefixTo,   // it's pathTo if act= 'eto'
                          opt_pathFrom,
                          opt_assFileName,
                          opt_outputFile
                          ){
    var fromFile, mode, pathTo, prefixTo, pathFrom, outputFile;
    var act = opt_act ||
              (opt_fromFile || polO.fromFile ?
               'e' :
               'ea'     // 'ea' is default for test mode
              );
    polO.act = act;

    var sep = polO.sep;       //  path separator
    //  absolute path and filename
    fromFile = opt_fromFile ||
               polO.fromFile ||
               __dirname + sep + 'test' + sep + 'testProjFile.json';
    prefixTo =  polO.getPrefixTo(act,fromFile,exports,opt_prefixTo);
    polO.prefixTo = prefixTo;

    pathTo = polO.getPathTo(act,opt_prefixTo,exports);
    polO.pathTo = pathTo;

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
                fromFile
    );

    if(act === 'erf'){
      // rf - mode of evoking object
      mode = 'rf';
      polO.evokeJsFiles(label,fromFile,prefixTo,act,mode);
    }else if(act === 'e' || act === 'ea' ){
      mode = 'req';
      polO.evokeJsFiles(label,fromFile,prefixTo,act,mode);
      console.log('in work: after evokeJsFiles %s evoke test\n'+
          ' polO.pathTo=\n%s',
          mode,polO.pathTo);
    }else if( act === 'eto'){
      polO.no6 = true;
      prefixTo = '';
      polO.pathTo = pathTo;
      polO.evokeJsFiles(label,fromFile,prefixTo,act,mode);
      console.log('Thats All with \'%s\' - evoke testing\n polO.pathTo=\n%s',
          act,polO.pathTo);
    }else if(act === 'a' || act === 'ato'){
      // assembly work
      // location of js-files edited
      pathFrom = opt_pathFrom || polO.pathFrom ;
      polO.outputFile = opt_outputFile || polO.outputFile;
      /**
       * @descrition
       * final assembly json file is located
       * 1. or in the same directory where original fromFile lives
       * and has modified name fromFile_modified_n where n=0,1,...
       * depending on the number of saving files in work-flow.
       * 2. or this file could have fixed user defined NAME
       * determined by opt_assFileName parameter. This does not change
       * the location directory of the file only the name.
       * 3. By user preference it's possible to specify fixed name and
       * location directory assigning full file path( including file name
       * and .json extension) by opt_outputFile parameter. The value of this
       * parameter should be monitored inside polO.assembleProjFile method
       * and is transferred there by polO.outputFile property or
       * as function parameter or (options objects - not yet)
       * To realize last option act parameter value 'ato' is the best.
       */
      if( act === 'a'){
        polO.assFileName = opt_assFileName || polO.assFileName;
      }

      polO.assembleProjFile(
          label,fromFile,pathFrom,opt_assFileName,opt_outputFile);

    }else{
      console.log('not described act value %s',act);
    }
  };
  /**
   * @description
   * Requirements and characteristics of params-json-file
   * - file in which calculating parameters are values of appropriate
   * properties.
   * Criteria:
   * a) last part of json-file name is '_params.json'
   * b) file with such name is located in the folder ./params
   * c) depending on the e or a -mode it's possible
   * to control presence of prefixTo or pathFrom being set additionally
   *
   * Such criteria permit to create params json-file automatically after evoke
   * procedure and to store it in the ./params folder. The name of such file
   * could be (should be) fromFileName_params.json were fromFileName is
   * path.baseName(fromFile,'.json') file name without extension.
   * @param {string}arg3 - params file name without end part '_params.json'
   *     historically it has been introduced for nmp pol command fourth
   *     argument (index 3) of command line command. So it was named arg3
   * @return {boolean} true if a file with initial part of name indicated
   *     does exist and present in the ./params  folder
   */
  polO.hasParamsJson = function(arg3){
    var sep = polO.sep
    var fpth = __dirname + sep + 'params' + sep + arg3 + '_params.json';
    return  fs.existsSync(fpth) ? fpth : '';
  };
  /**
   * exports calculation parameters outside into external scope
   * @param {Object}receiver object
   * @param {Object}options donor object
   */
  polO.setCalcParams = function(receiver,options){
    receiver.act = options.act || '';
    receiver.fromFile = options.fromFile || '';
    receiver.prefixTo = options.prefixTo || '';
    receiver.pathTo = options.pathTo || '';
    receiver.pathFrom = options.pathFrom ||  '';
    receiver.assFileName = options.assFileName || '';
    receiver.outputFile = options.outputFile || '';
  };
  /**
   * prints parameters properties of
   * @param {object} options
   */
  polO.ppp = function(options){
    var prnms = ['act','fromFile','prefixTo','pathTo','pathFrom',
      'assFileName','outputFile','label'];
    var ipr;
    for( var i=0;i<prnms.length;i++){
      ipr = prnms[i];
      //console.log('ipr = '+ipr);
      console.log('options.'+ipr+'='+(function(options){if(options[ipr]){return options[ipr];}else{return 'empty';}}(options))+'\n'+
      'polO.'+ipr+'='+ (function(options){if(options[ipr]){return options[ipr];}else{return 'empty';}}(exports)));
    }
  };
  /**
   * polO.run - method
   * executes evoking or assembly in dependence of the number, the types and
   * the values of method's arguments.
   *
   * Variables used in context and their meaning:
   * act - action type parameter
   * fromFile - full path of json file of appScript project downloaded
   * pathTo - path of the folder wherein js-files extracted form fromFile
   *          will be stored to. (Could be assigned by user manually by
   *          setting polO.pathTo property)
   * prefixTo - part of pathTo path to which six random alphanumerical characters
   *            will be appended to get new pathTo value
   * pathFrom - path of folder being location of extracted files will being taken
   *            for assembly new project's json file modified off-line
   * assFileName - name of resulting project's json file without .json extension
   *               specified by user if any. Optional parameter. If not set the
   *               name of resulting json-file is assigned automatically
   *               following the rule described bellow or in methods' description
   * Arguments options:
   *     No Arguments - all arguments and parameters will have Default values.
   *         is used while testing
   *         call example: polO.run(); // (0)
   *
   * First argument's values vs meaning & functionality (act - action parameter):
   *     'e' - evoke
   *     'a' - assemble
   *     'o' - object properties as managing parameters
   *     'f' - same as 'o' but object will be get from json file locating into
   *           __dirname + sep +'params' folder; where sep is OS paths separator
   *     'ea' - 'e'voke and then 'a'ssemble (default) using in test run and
   *              at chaining processes like auto lint of js-files codes
   *     'eto' - evoking js-files extracted from fromFile and write them into
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
   *       package root directory)
   *       call samples:
   *           polO.run('f',paramsFileNamePart); // (4) or
   *           polO.run('',paramsFileNamePart);  // (5) or
   *           polO.run(paramsFileNamePart);     // (6)
   *
   *        typeof paramsFileNamePart === 'string' &&
   *        !/\.json$/.test(paramsFileNamePart) &&
   *        !/_params\.json$/.test(paramsFileNamePart)
   *        is boolean true,
   *        where paramsFileNamePart is string presenting
   *        file name without '_params.json' of params-json-file located in
   *         __dirname+sep+'params' directory (sep='\\' in the case of Windows)
   *          and containing json string with properties:
   *         paramsJsonFileContent =
   *           {"act": "...","fromFile": "..." ,"prefixTo": "...",
   *           "pathTo": "...","pathFrom": "...","assFileName": "...",
   *           "outputFile: "..."}
   *         Attention remark! - content of json-file json string must not
   *         contain line brakes special characters.
   *
   * 'e'- evokes js-files from fromFile into new prefixToXXXXX -directory
   *      call ex.: polO.run('e',fromFile,prefixTo) (7)
   * 'eto'- evokes js-files from fromFile into user defined pathTo directory
   *        call ex.:
   *            polO.run('eto',fromFile,pathTo);  (8)
   *
   * 'a' - assembling final project's json file
   *       call samples:
   *       polO.run('a',fromFile,pathFrom,opt_assembleFileName); // (9) or
   *
   * 'ato' - assembling final project's json file specified. The final json-file
   *       and it's location are strictly determined by user
   *       call samples:
   *       polO.run('ato',fromFile,pathFrom,outputFile); // (10)
   *       where outputFile is a full path including file name and
   *       extension .json where to write final json assembly file
   *
   * 'erf' - technical evoking mode using algorithm of direct content reading
   *         of json file (only for information. details see in code description)
   *         to get the object whose properties contain js-files data
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
   *     Default value is 'ea' if it's a {string} or it is absent at all.
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
   *      }; *
   * @param {string|Object}opt_fromFile (or_paramsObj or parmsFileNamePart)
   * @param {string}opt_prefixTo (_or_pathTo)
   * @param {string}opt_pathFrom
   * @param {string}opt_assFileName
   * @param {string}opt_outputFile

   */
  polO.run = function(label,
                      opt_act,
                      opt_fromFile,
                      opt_prefixTo,
                      opt_pathFrom,
                      opt_assFileName,
                      opt_outputFile){
    console.log('pol-method begins -----------------> \n');
    var params,
        paramsSet = false,
        act,
        options;  //  donor options object
    var sep = polO.sep;

    if( typeof opt_act === 'object' ){
      //  paramsObject case (1)
      options = opt_act;
    }else if(opt_act === 'o'){
      if( typeof opt_fromFile !== 'object'){
        throw 'Something is wrong! Action parameter = \'o\' but\n'+
            'second argument of method pol is not an Object!';
      }
      //  paramsObject case (3)
      options = opt_fromFile;
    }else if(!opt_act){
      if(typeof opt_fromFile === 'object'){
        // paramsObject as second argument case (2)
        options = opt_fromFile;
      }else if( polO.hasParamsJson(opt_fromFile)){
        // correct params-json-file exists (5)
        paramsSet = true;
        params = require( './params/' + opt_fromFile + '_params.json');
        options = params;
      }else{
        // possible all default case or standard case with testing act
        if(!opt_fromFile ){
          // default act and fromFile case (0)
          options = {act: 'ea'};
        }else if( typeof opt_fromFile === 'string' &&
                  /\.json$/.test(opt_fromFile)){
          // conventional fromFile parameter with default action
          act = 'e';
        }else{
          throw 'fromFile is not json file or has bad name:\n'+opt_fromFile;
        }
      }
    }else if(opt_act === 'f'){
      if( polO.hasParamsJson(opt_fromFile)){
        // correct params-json-file exists (4)
        paramsSet = true;
        params = require( './params/' + opt_fromFile + '_params.json');
        options = params;
      }else{
        throw '\'f\' action parameter but absent or incorrect'+
              ' params-json-file:\n'+ opt_fromFile;
      }
    }else if( polO.hasParamsJson( opt_act)){
      // single first argument as paramsFileName without ending '_params.json'
      // case (6)
      paramsSet = true;
        params = require( './params/' + opt_act + '_params.json');
        options = params;
    }
    console.log( params );
    if( typeof options === 'object'){
      options.label = label;
      polO.setCalcParams ( exports,options);
      polO.work(label, act);
      return;
    }
    polO.act = opt_act;
    act = opt_act;
    if(/\.json$/.test(opt_fromFile)){
      // source json file
      /**
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
       */
      if( !fs.existsSync(opt_fromFile) ){
        throw 'file '+opt_fromFile+' does not exists on PC';
      }else{
        var ob;
        try {
          ob=JSON.parse( fs.readFileSync (opt_fromFile) );
        }catch(e){
          console.log(e);
          console.log( 'Bad json-string in file opt_fromFile =\n%s',opt_fromFile);
          throw 'Bad json-string in file opt_fromFile =\n' + opt_fromFile;
        }
        polO.fromFile = opt_fromFile;
      }
    }else{
      throw 'opt_fromFile is not json-file or has bad name:\n' +
            opt_fromFile + '\n or bad data';
    }

    if(['e','ea','eto','erf','a','ato'].indexOf(opt_act) < 0 &&
        opt_act){
      console.log( 'incorrect value of opt_act parameter!');
      act = 'e';
    }

    options = {
      act: act,
      fromFile: opt_fromFile,
      prefixTo: opt_prefixTo,
      pathTo: polO.pathTo,
      pathFrom: opt_pathFrom,
      assFileName: opt_assFileName,
      ouputFile: opt_outputFile,
      label: label
    }
    polO.setCalcParams ( exports,options);
    polO.work(label,polO.act);
  };
  /**
   * resets renewable (using in calculation) calculating parameters' properties
   * of exports object
   * @param {Object}exp module's exports object
   */
  polO.reset = function(exp){
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
      exp[i]='';
    }
  }
  /**
   * launches pol-methods with different parameters values over
   * specified timeout period to exclude traffic jam
   * @param {string}label - the label or id of project being handled
   * @param {number}opt_t timeout delay in millisecond. Default=10000
   * @param {}opt_first - is used as opt_act parameter in methods of module
   * @param {}opt_second - equivalent to opt_fromFile parameter in module's
   *     methods.
   */
  polO.runLauncher = function(opt_label,opt_t, opt_first, opt_second, opt_third){
    var label = opt_label || 'absence of label is bad practice' ;
    if( opt_t &&
        (typeof opt_t !== 'number' )){
      throw 'being set first parameter should be a number of milliseconds';
    }
    var t= ( opt_t || opt_t === 0 )? opt_t : 10000 ;
    var f = opt_first || '';
    var s = opt_second || '';
    var th = opt_third || '';
    setTimeout( function(){
                polO.reset(exports);
                polO.label = label;
                polO.run(label,f,s);
               },t);
  };
  /**
   * tests polO.run method
   * or presents the prototype of consecutive projects data handling
   * Each project determined by it's label or id. In the example bellow
   * this is a descriptive comment.
   */
  polO.workTest = function(){
    var o, pFN, label;

    if(1){
      //  test (0)
      label = 'TEST all defaults Case (0)';
      console.log(label);
      polO.runLauncher(label,0)

      // oooooooooooooooooooooooooo
      o = {
        act: '',
      };
      //  oooooooooooooooooooooooooo
      // test (1-0)
      label ='TEST all default parameters case (1)';
      console.log(label);
      polO.runLauncher( label,2000,'o',o);

      //  test (2-0)
      label ='TEST all default parameters case (2)';
      console.log(label);
      polO.runLauncher(  label, 3000,'',o);

      // test (3-0)
      label = 'TEST all default parameters case (3)';
      console.log(label);
      polO.runLauncher( label,3000,o); //polO.run(o);
    }
    if(1){
      //  oooooooooooooooooooooooooo
      o = {
        act: 'e',
        fromFile:'j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codes\\'+
            'smsCikPostCallHandle_Scripts.json',
       prefixTo:''
      };
        //  oooooooooooooooooooooooooo

      //  test (1-e) fF - set pxT - default
      label = 'TEST (1-e) fF - set pxT - default';
      console.log(label);
      polO.runLauncher( label,3000,'o',o); //polO.run('o',o);

      // test (2-e) fF - set pxT - default
      label = 'TEST (2-e) fF - set pxT - default';
      console.log(label);
      polO.runLauncher( label,2000,'',o); //polO.run('',o);

      // test (3-e) fF - set pxT - default
      label = 'TEST (3-e) fF - set pxT - default';
      console.log(label);
      polO.runLauncher( label,3000,o); //polO.run(o);
    }
    if(1){
      //  oooooooooooooooooooooooooo
      o = {
        act: 'e',
        fromFile:'j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codes\\'+
            'smsCikPostCallHandle_Scripts.json',
        prefixTo:'j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codesRf_'
      };
      //  oooooooooooooooooooooooooo

      //  test (1-e) fF - set pxT - set
      label = 'TEST (1-e) fF - set pxT - set';
      console.log(label);
      polO.runLauncher( label,3000,'o',o);             //polO.run('o',o);

      // test (2-e) fF - set pxT - set
      label = 'TEST (2-e) fF - set pxT - set';
      console.log(label);
      polO.runLauncher( label,3000,'',o);              //polO.run('',o);

      // test (3-e) fF - set pxT - set
      label = 'TEST (3-e) fF - set pxT - set';
      console.log(label);
      polO.runLauncher( label,3000,o);                 // polO.run(o);
    }
  //------------------ f --------------


    if(1){
      // test (4-0 f->e)
      label = 'TEST all default parameters case (4-0 f->e)';
      console.log(label);
      polO.runLauncher( label,3000,'f','allDefaults'); //polO.run('f','allDefaults');

      //  test (5-0 f->e)
      label = 'TEST all default parameters case (5-0 f->e)';
      console.log(label);
      polO.runLauncher( label,3000,'','allDefaults');  //polO.run('','allDefaults');

      // test (6-0 f->e)
      label = 'TEST all default parameters case (6-0 f->e)';
      console.log(label);
      polO.runLauncher( label,3000,'allDefaults');    //polO.run('allDefaults');
    }
    if(1){
      //  test (4-e) fF - set pxT - default
      label = 'TEST fromFile is set and prefixTo - default (4- f->e)';
      console.log(label);
      polO.runLauncher( label,3000,'f','0'); //polO.run('f','0');

      // test (5-e) fF - set pxT - default
      label = 'TEST fromFile is set and prefixTo - default (5- f->e)';
      console.log(label);
      polO.runLauncher( label,3000,'','0'); //polO.run('','0');

      // test (6-e) fF - set pxT - default
      label = 'TEST-> fromFile is set and prefixTo - default (6- f->e)';
      console.log(label);
      polO.runLauncher( label,3000,'0'); //polO.run('0');
    }
    if(1){
      //  test (4-e) fF - set pxT - set
      label = 'TEST fromFile set and prefixTo set case (4- f->e)';
      console.log(label);
      polO.runLauncher( label,3000,'f','1'); //polO.run('f','1');

      // test (5-e) fF - set pxT - set
      label = 'TEST fromFile set and prefixTo set case (5- f->e)';
      console.log(label);
      polO.runLauncher( label,3000,'','1'); //polO.run('','1');

      // test (6-e) fF - set pxT - set
      label = 'TEST fromFile set and prefixTo set case (6- f->e)';
      console.log(label);
      polO.runLauncher( label,3000,'1'); //polO.run('1');
    }
    // finish
    console.log('WorkTest has ended.');
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
    myEE.on('readyWriteOutputFile',polO.writeAssFile);
    myEE.on('endpoint-e',polO.eEndpoint);
    myEE.on('endpoint-a',polO.aEndpoint);
  }(polO.myEE);  //  or polO.setEvents(polO.myEE);  
 



  /**
   * instantiates the object of project off-liner with unique identifier
   * whose role plays label parameter
   * @param {string}label - unique identifier of project off-liner object
   * @return {object} project off-liner object instance
   */
   polO.clone = function(label){
      if(!label){
        throw 'label parameter is used as project off-liner unique' +
              ' identifier, so should obligatorily be determined';        
      }
      
      var polO = {};
      polO.label = label || 'project off-liner label is not set. Attention!!' ;
      /**
       * gets event's emitter object instance
       * @return {object} events emitter instance object
       */
      polO.getEventsEmInstance = function (){
        var Events = require('events');
        class EE extends Events{}
        return new EE;
      };
      /**
       * log object to register procedure steps of files' handling
       * by statuses: 'beforeWrite','written', 'error',...
       * @property {Array.<object>}polO.log.assFile - full path to assembling
       *     json file
       * @property {Array.<object>}export.log.files
       * @property {string} polO.log.files[i].path
       * @property {string} polO.log.files[i].status
       */
      polO.log = {};
      polO.log.nFilesAlreadyRead = 0;
      polO.log.nFilesToRead = 0;
      polO.log.filesStatus = {};
      polO.myEE = polO.getEventsEmInstance();    
        
      //  polO modification
      // path parts separator
      polO.sep = (function(){
        return path.sep === '\\' ? '\\' : '/';
      }());
      /*
      @property {string}polO.fromFile  full path to source json file
       */
      polO.act='';
      polO.fromFile = "";
      polO.pathTo = "";
      polO.pathFrom = "";
      polO.assFileName = "";
      polO.prefixTo = "";
      polO.no6 = false; 
      
      // ----   UTILITIES  ----      
      /**
       * separates json file name from path
       * @param {string}fPath
       * @return {object|boolean=false} false if file is not json-file
       *   @property{string} o.fnm file name
       *   @property{string} o.path file path
       */
      polO.separatePathAndFileName = function(fpath){
        var pth, fnm;
        //RegExp to select file name in full path
        var pattFnm = /\b\w+[.]json$/;
        pth = pattFnm.test(fpath) ?
          fpath.replace(pattFnm,'') : undefined;
        if(pth === undefined){
          return false;
        }
        fnm = fpath.replace(pth,'');
        pth = (pth === '' || pth === '/' || pth ==='\\') ? '.' : pth;
        return {
          fnm: fnm,
          path: pth.replace(/(\/|\\)+$/,'')
        };
      };
      /**
       * On the bases of full file path creates prefixTo path
       * comprising of path to file's host folder and file name without extension
       * which could be used or as pathTo directory during js - files extraction
       * from json file or for new file path at assembling new json file
       * @param {string}fp - full path to json file including file name
       * @return {string} path to subdirectory named as fileName without
       * extension
       */
      polO.fileNameToPath = function (fp){
        var o, prfx;
        var sp = polO.sep;
        o = polO.separatePathAndFileName(fp);
        prfx = o.fnm ? o.fnm.replace(/\.json$/,''):"";
        if(/\//.test(o.path)){
          return prfx? o.path+'/' + prfx : "";
        }else if(/\\/.test(o.path)){
          return prfx? o.path+'\\' + prfx : "";
        }else{
          if(prfx){
            return (o.path)? o.path + sp + prfx :"";
          }
          return "";
        }
      };
      // ----- EVOKE JS - FILES ---------
      /**
       * Sets temporary folder where to place temporary data.
       * 'toFolderReady' event emitter
       * Folder path is determined by adding six random characters 
       * to prefixTo path. It is possible to set fixed path of destination
       * folder on user choice but this should be done by setting property 
       * polO.pathTo DIRECTLY!!.
       * @param {string}label - identifier of project being handled
       * @param {string}fromFile - full path to json file from which sources data
       *   are extracted
       * @param {string}prefixTo - string representing a part of a full path
       *   to which six random characters will be added to form path to new
       *   directory to be created. This path is passed to callback function
       *   of fs.mkdtemp() as second parameter and appropriate directory
       *   will be created.
       * @return {string} path to destination folder
       *   if full path to newly created directory would have been determined
       *   the polO.pathTo will have been set and event 'toFolderReady' will be
       *   fired,  otherwise
       *   polO.pathTo === undefined without appropriate event emitting
       */
      polO.evokeJsFiles = function(label,fromFile,opt_prefixTo,opt_act,opt_mode){
        var act = opt_act || polO.act || 'unknown act';
        var mode = opt_mode||'req';
        // output folders
        console.log('\n\ninside evokeJsFiles begins with parameters:' +
                    '\n  >----------<\n' +
                    'fromFile=\n' +fromFile+ '\n' +
                    'opt_prefixTo=\n' + opt_prefixTo +'\n' +
                    'polO.fromFile= \n' + polO.fromFile + '\n' +
                    'opt_act= ' + opt_act +'\n' +
                    'polO.act= ' + polO.act + '\n' +
                    'label = ' + label +
                    '\n  >----------<\n');

        /**
         * @description
         * - if opt_prefixTo is not set checks polO.prefixTo
         * - if polO.prefixTo is not set, file name of fromFile without
         * extension is used as prefixTo and the directory with name
         * <prefixTo>XXXXXX will be created inside host folder of fromFile and
         * will be assigned as pathTo for js-files being going to be extracted
         * will have been placed there.
         * XXXXXX - 6 random alphanumerical characters
         * - in the case when it's necessary to use some path specified as pathTo
         * parameter without appending six random characters to the name of folder
         * the following rules should be followed by:
         * 1. property polO.no6 should be set true and
         * 2. polO.prefixTo as well as opt_prefixTo should be empty string ''.
         * 3. The value of pathTo is taken from polO.pathTo property
         * 4. if the folder with path pathTo does not exist it will be created.
         *
         */
        var prefixTo = opt_prefixTo ||
            polO.prefixTo ||
            ( !polO.no6 && !polO.pathTo ? polO.fileNameToPath(fromFile)+'_' : '') ;
        polO.prefixTo = prefixTo;

        if(polO.no6){
          if(polO.pathTo){
            var pathTo = polO.pathTo;
            polO.pathTo = '';
            polO.no6 = false; // resets to default value
            if( !fs.existsSync(pathTo) ){
              fs.mkdir(pathTo,function(err){
                if(err){
                  console.log(err+'\n' +
                      'failed to create new directory\n%s',pathTo);
                }
                polO.pathTo = '';
                polO.myEE.emit('toFolderReady', label, fromFile,pathTo,act,mode);
              });
              return;
            }
            polO.pathTo = '';
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
        polO.pathTo=''; // from this point this parameter is not needed
        fs.mkdtemp(prefixTo,function(err,pathTo){
          if(err){
            console.log(
            "Error while creating temporary folder by means of fs.mkdtemp "+
            err);
            polO.pathTo = undefined;
          }
          polO.pathTo = '';
          polO.myEE.emit('toFolderReady', label, fromFile,pathTo,act,mode);
        });
      };
      /**
       * 'toFolderReady' event listener
       * by means of node.js fs module reads input json - file from drive and
       * transforms  it's content into an object then
       * emits custom event 'objReady' to chain next calculation
       * with parameters for callback function: dObj,pathTo
       * @param {string}label identifier of the project being handled
       * @param {string}fromFile absolute path to json - file including name
       * @param {string}pathTo absolute path to folder where to place results
       * @param {string}opt_mode - method's mode:
       *   "req" default - gets json file with Google appScript project codes
       *      and returns appropriate object by means of node require() function
       *   "rf" - gets object by parsing data preliminary read by fs.readFile object
       * @return {Object|void} JSON.parse(json - data)object or void in the case
       *   of js - project scripts
       */
      polO.evokeObjFromFile = function (label, fromFile,pathTo,act, opt_mode){
        var mode = opt_mode || 'req';
        var dObj;
        if( mode === 'rf') {
          fs.readFile(fromFile,function(err,data){
            if(err){
              console.log('Error %s\nhas occurred in evokeObjFromFile listener\n'
              +' while reading file %s'
              +'\nmode=%s:',err,fromFile,mode);
            }else{
              dObj = JSON.parse(data);
            }
          });
        }else if(mode === 'req'){
          dObj = require(fromFile);
        }else{
          console.log('bad mode value');
        }
        polO.myEE.emit('objReady',label,dObj,fromFile,pathTo,act);
      };      
      /**
       * "objReady" event's listener
       * Checks if dObj has property dObj.files if 'yes' -
       * copy files scripts(files[i].source) content into
       * separate files and writes them into pathTo directory
       * evokes scripts from .source properties of dObj.files array
       * elements and writes them in appropriate files within pathTo
       * @param {string}label identifier of project being handled
       * @param {Object}dObj - object got from require(fromFile json-file)
       * @param {string}fromFile absolute path to json - file including name
       * @param {string}pathTo - folder path where to place scripts' js-files
       * @param {string}act - actual value of action parameter
       * @return {void)} creates or rewrites file on drive
       */
      polO.evokeScriptsFromObj = function (label,dObj,fromFile,pathTo,act){
        if(!dObj.hasOwnProperty('files')){
          throw 'object has no property dObj.files';
        }else if(!dObj){
          throw( 'dObj parameter is undefined or null');
        }
        console.log(
            '\n\nInside polO.evokeScriptsFromObj: Temporary folder is ready:' +
            '\n%s\n'+
            'Data object received. String length= %s',
            pathTo,
            JSON.stringify(dObj).length );
        if(!(dObj.hasOwnProperty('files') && Array.isArray(dObj.files))){
          console.log('object has no dObj.files property or this\n' +
                      'property is not an Array!');
          return;
        }

        var sep = polO.sep;
        var files = (dObj.hasOwnProperty('files')) ? dObj.files:[];
        var file,fName,fScripts,fw;
        if(files && Array.isArray(files) && files.length > 0){
          for(var i = 0; i < files.length;i++){
            file = files[i];           // each file is an object
            fName = file.name;
            fScripts = file.source;    // javaScript codes
            fw = pathTo + sep + fName + ".js";
            fs.writeFile(fw,fScripts,function(err){
              if(err){
                console.log(err +
                   "\noccurred while trying to write a file" +
                   " for i=%s and file.name=%s",
                  i,fName);
              }
            });
          }
          var iti=0;
          var ti=setInterval(function(){
            if( fs.readdirSync(pathTo).length === files.length ){
              clearInterval(ti);
              console.log('\n\nin placeScriptsTo: timeInterval cleared at' +
                           ' attempt number(iti) =%s',iti);
              // last file handled
              console.log( 'js-Files Evoked into folder:\n' +  pathTo +'\n');

              // opens Windows files Explorer for folder with js-files written.
              var childProc = cp.execSync(
                  'start explorer.exe ' +
                  '"' +
                  pathTo+
                  '" & exit');

              // writes parameters file into ./params folder (synchronously)
              polO.writeParamsFile(label,fromFile,pathTo,act);
              //return;
            }else{
              iti++;
            }
          },1);
        }else{
          console.log('dObj.files is not set or is empty');
        }
      };
      /**
       * writes params - json file into ./params folder
       * @param {string}label identifier of project being handled
       * @param {string}fromFile - folder with js-files. Should be renamed as pathFrom
       * @param {string}pathTo - directory path
       * @param {string}opt_pathFrom - path of directory from which js-files should
       *     be taken for assembling output json file
       * @param {string}opt_act - actual value of action parameter
       * @param {string}opt_prefixTo - prefix used to create pathTo if any
       * @param {string}opt_assFileName
       * @param {string}opt_outputFile
       * @return {string} params-file path
       */
      polO.writeParamsFile=function(label,fromFile, pathTo, opt_act, opt_pathFrom,
                                        opt_prefixTo, opt_assFileName,
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
        var sep = polO.sep;
        var fnm = path.basename(fromFile,'.json'); // file name without extension
        var fpth = __dirname + sep + 'params' + sep + fnm + '_params.json';
        fpth = polO.checkParamsFileName(
            fpth.replace(/_params\.json/,'_0_params.json'));
        polO.paramsFile = fpth;

        var data = JSON.stringify(o);
        if( act === 'ea'){
          fs.writeFileSync(fpth, data);
          console.log( 'params json file \n%s\n has been written',
                  fpth);
          polO.myEE.emit('endpoint-e',label, fromFile,pathTo,act);
        }else{
          console.log('\n\nin writeParamsFile writes params-file asynchronously\n\n');
          fs.writeFile(fpth, data,'utf-8',function(err){
            if(err){
              console.log('error occured while writitng params-file :\n%s',err);
            }
            console.log('\n\nParamsFile has been written, it\'s path =\n%s',fpth);
            polO.myEE.emit('endpoint-e',label, fromFile,pathTo, act);
          });
        }
        if(0){
          // ToDo: writes using streams objects
        }
        return fpth;
      };
      /**
       * Checks availability of final params file name.
       * If the one being presumed is already  available
       * the digit preceded '_params.json' part will be increased by one
       * @param {string}pathTesting - full path of params-file testing including
       *     file name and extension
       * @return {string} name chosen
       */
      polO.checkParamsFileName = function(pathTesting){
        while( fs.existsSync(pathTesting)){
          pathTesting  = (function (){
            var nm, a, i, iplus;
            nm = pathTesting.replace(/_params\.json/,'');
            a = nm.split('_');
            i = parseInt(a[a.length - 1]);
            iplus = i + 1;
            return nm.replace(/\_\d+$/,'') + "_" + iplus + "_params.json";}());
        }
        return pathTesting;
      };
       /**
        * 'endpoint-e' event listener (evoke)
        * @param{string}label identifier of project being handled
        * @param {string}pathTo path to the directory where js-files have been
        *     located.
        * @param {string}fromFile - original json-file
        * @param {string}act - actual value of act parameter
        */
      polO.eEndpoint = function (label,fromFile,pathTo, act){
        var pathFrom;
        console.log('\n\nEndpoint of Evoke-mode has been reached.'+
                    ' Event \'endopoint-e\'\n'+
                    'label = '+ label +
                    '\npathTo =\n' + pathTo );

        if( act === 'ea'){
          pathFrom =  pathTo;
          polO.pathFrom = pathFrom;
          polO.pathTo = '';
          polO.work(label,'a',fromFile,'',pathFrom);
        }
        console.log('Exit from eEndpoint without chaining for\n' +
           'fromFile=\n%s\n' +
           'label = %s\n'+
           'and act= %s',
           polO.fromFile,
           label,
           act);
      }
      //  -----  ASSEMBLE ---------
      /**
       * 'assembleFileRedy' event emitter
       * Assembles scripts content of js-files modified into json file
       * prepared to uploading it to Google appScript project.
       * @param {string}label identifier of project being handled
       * @param {string}opt_fromFile  (originalJsonFileDownloaded) full file path of
       *    original Google project json file downloaded from GoogleDrive
       * @param {string}opt_pathFrom path to the destination folder for output
       *     json file. This is the same folder where js-files modified,
       *     obtain from original json file, are placed earlier and appropriately
       *     are taken from.
       * @param {string}opt_assFileName output json file name to be written.
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
          label,opt_fromFile, opt_pathFrom, opt_assFileName, opt_outputFile){
        console.log( '\n\nInside assembleProjFile\n'+
            '\n------vvvvvv------\n' +
            'opt_fromFile =\n%s\n'+
            'opt_pathFrom =\n%s\n' +
            'opt_assFileName =\n%s\n'+
            'opt_ouputFile =\n%s\n' +
            'label = %s' +
            '\n------^^^^^^------\n',
            opt_fromFile,
            opt_pathFrom,
            opt_assFileName,
            opt_outputFile,
            label);

        var outputFile = opt_outputFile || polO.outputFile;
        var fromFile =  opt_fromFile || polO.fromFile || "";
        polO.fromFile = fromFile;
        if(!fromFile){
          throw 'assembleProjFile: original json file has not been set';
        }
        polO.assemble = true;

        var oFP, outFileName, outPath,
            sp = polO.sep;
        if( !outputFile){
          oFP = polO.separatePathAndFileName(fromFile);

          outFileName  = opt_assFileName ?
                         opt_assFileName :
                         (
                          polO.assFileName ?
                          polO.assFileName :
                          oFP.fnm.replace(/\.json$/,'')+'_modified.json'
                         );
          outPath = opt_pathFrom ?
                    opt_pathFrom :
                    (polO.pathFrom ? polO.pathFrom : oFP.path);
          outputFile = outPath + sp + outFileName;
        }else{
          outPath = path.dirname(outputFile);
        }
        fs.copyFile(fromFile, outputFile, function(err){
          if(err){
            throw(err);
          }
          // emits assembleFileReady event
          console.log('\n\nBefore assembleFileReady event emit \n' +
              'outPath=\n%s\n'+
              'outputFile=\n%s',
              outPath,
              outputFile);
          polO.myEE.emit('assembleFileReady',label,outputFile,outPath,'req');
        });
      };
      /**
       * 'assembleFileReady' event listener
       * by means of fs module reads input json-file from drive and
       * transforms  it's content into an object then
       * emits custom event 'preUploadAssembleFile' to chain next calculations:
       * the content of dObj.files[i].script properties will be exchanged by scripts
       * of modified js-files locating in pathFrom directory.
       * parameters for callback function: dObj,fromFile,pathFrom
       * @param {string}label identifier of project being handled
       * @param {string}fromFile absolute path to json - file including name
       * @param {string}pathFrom absolute path to where js-files already modified
       *     are stored.
       * @param {string}opt_mode - method's mode:
       *   "req" default - gets json file with Google appScript project codes
       *      and returns appropriate object by means of node require() function
       *   "rf" - gets object by parsing data preliminary read by fs.readFile object
       *
       */
      polO.evokeObjFromAssFile = function (label,fromFile,pathFrom,opt_mode){
        var mode = opt_mode || "req";
        var dObj;
        if( mode === 'rf') {
          fs.readFile(fromFile,function(err,data){
            if(err){
              console.log('Error %s\nhas occurred in evokeObjFromFile\n'
              +' while reading file\n%s\n'
              +'mode=%s:',err,fromFile,mode);
            }else{
              dObj = JSON.parse(data);
              polO.myEE.emit('preUploadAssembleFile',label,dObj,fromFile,pathFrom);
            }
          });
        }else if(mode === 'req'){
          dObj = require(fromFile);
          polO.myEE.emit('preUploadAssembleFile',label,dObj, fromFile, pathFrom);
        }else{
          console.log('bad mode value');
        }
      };
      /**
       * "preUploadAssembleFile" event's listener
       * Checks if dObj has property dObj.files if 'yes' -
       * in the pathFrom folder reads js-file content and writes it
       * into appropriate dObj.files[i].script property of dObj
       * after that writes dObj stringified by JSON.stringify string
       * into a copy of original fromFile modifying it's name
       * collects data from modified js-files and includes it into output assemble
       * object then stringifies object and writes json string into output file.

       * @param {string}label identifier of project being handled with
       * @param {Object}dObj - object got from json data
       * @param {string}fromFile - full path to json file being assembled
       * @param {string}pathFrom - path to folder where to get data js-files from
       * @param {string}opt_outputFile - customer output file path.
       *     Full path including file name with extension.
       *     Optional. If it's not set available fromFile is modified and used
       *     for output writing.
       * @param {boolean}opt_assync - true if asynchronous mode of file handling
       *     should be used. Default is false.

       */
      polO.preUploadFile = function (label, dObj, fromFile, pathFrom,
                             opt_outputFile, opt_assync){

        if(!dObj.hasOwnProperty('files')){
          throw 'data object has no property dObj.files';
        }
        var async = opt_assync || false;
        var sp = polO.sep;

        var outputFile =
            opt_outputFile ||
            polO.checkAssFileName( fromFile.replace(/\.json/,'_0.json'));

        var files = dObj.files;
        if( !Array.isArray(files) || files.length <= 1){
          console.log( 'files property of dObj is not Array or has no elements');
          return;
        }
        polO.assFN = files.length;
        var file, fname, fpath;
        console.log('\n\nBefore cycling over dObj.files[i] properies\n'+
            'pathFrom:\n%s\n',pathFrom);

        for(var i = 0;i < files.length;i++){
          file = files[i];
          fname = file.name;
          fpath = pathFrom + sp + fname+'.js';
          console.log( 'fname=\n%s,\nfpath=\n%s\n',fname,fpath);
          if(fs.existsSync(fpath)){
            polO.log.nFilesToRead++;
            polO.log.filesStatus[fpath]='beforeRead';
            if(async){
              /* NEED TO BE INVENTED !!!! Not works yet!
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
              polO.loop = setInterval( function(){
                if(polO.log.nFilesAlreadyRead === polO.log.nFilesToRead){
                  clearInterval(polO.loop);
                  polO.myEE.emit('readyWriteOutputFile',label,
                                    dObj, outputFile);
                }
              },1000);
            }else{
              console.log( '\n\nBefore \'readyWriteOutputFile\' event emit\n'+
                  'outputFile =\n%s\n',outputFile);
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
       * @param {object}dObj - final json file data as an object
       *     (prepared for serializing )
       * @param {string}outputFile - full path to final json file
       *     including file name with extension.
       */
      polO.writeAssFile = function (label, dObj,outputFile){
        console.log('\n\nInside writeAssFile ');
        var outPth;
        var data = JSON.stringify(dObj);
        fs.writeFile(outputFile,data,function(err){
            if(err){
              console.log(
                err+'\nwhile attempting to write finally assembled json - file');
            }else{
              outPth = polO.separatePathAndFileName(outputFile).path;
              console.log('Assembly has finished\noutput file:\n%s\n' +
              'json-file has been written into folder outPth =\n%s\n',
              outputFile, outPth);
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
       * 'endpoint-a' event listener (assemble)
       * @param {string}pathTo path to the directory where js-files have been
       *     located.
       */
      polO.aEndpoint = function (label,outputFile){
        polO.lastAEndpoint = new Date().getTime();
        console.log('\n\nEndpoint of Assemble-mode has been reached.'+
                    ' Event \'endopoint-a\'\n'+
                    'outputFile =\n%s\n' +
                    'label = %s',
                    outputFile,
                    label);

      };
      /**
       * Checks availability of final assemble file name.
       * If presumed one is already  available
       * last digit of the name string increased by one
       * @param {string}pathTesting
       * @return {string} name chosen
       */
      polO.checkAssFileName = function(pathTesting){
        while( fs.existsSync(pathTesting)){
          pathTesting  = (function (){
            var nm, a, i, iplus;
            nm = pathTesting.replace(/\.json/,'');
            a = nm.split('_');
            i = parseInt(a[a.length - 1]);
            iplus = i + 1;
            return nm.replace(/\_\d+$/,'') + "_" + iplus + ".json";}());
        }
        return pathTesting;
      };
      //  ----  READ ME   -------
      /**
       * writes read me - text into console output
       */
      polO.readme = function(){
        var read = require('./readme.js');
        read.readme();
      };
      /**
       * tests current module
       */
      polO.test = function(){
        var fromFile, mode, path, prefixTo;
        path = "j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codes";
        // output directory prefix
        prefixTo = ""+
          "j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codesRf_";
        // absolute path and filename
        fromFile = path + "\\" + "smsCikPostCallHandle_Scripts.json";
        if(0){
        // -- evoking js files from json testing modes --
        // rf - mode
        mode = 'rf';
        console.log('%s - mode - "read file" - reads googleScript json - file',mode);
        polO.evokeJsFiles(label,fromFile,prefixTo,mode);
        console.log('Thats All with %s testing',mode);
        }
        if(0){
        // req - mode
        mode = 'req';
        console.log('%s - mode ',mode);
        polO.evokeJsFiles(label,fromFile,prefixTo,mode);
        console.log('Thats All with %s testing',mode);
        }
        // assembling tests
        if(1){
          // location of js-files edited
          var pathFromSuffix = "ChxS0s";
          var pathFrom = prefixTo + pathFromSuffix;
          polO.assembleProjFile(label,fromFile,pathFrom);
        }
      };
      /**
       * @description prefixTo setting
       * - if opt_prefixTo is not set checks polO.prefixTo
       * - if polO.prefixTo is not set, file name of fromFile without
       * extension is used as prefixTo and the directory with name
       * <prefixTo>XXXXXX will be created inside host folder of fromFile and
       * will be assigned as pathTo for are going to be extracted js-files.
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
       *     js-files are extracted
       * @param {object}exports - module.exports object
       * @param {string}optPrefixTo - prefixTo parameter set whicj is opt_prefixTo
       *     inside calling function
       * @return {string} prefixTo value string
       */
      polO.getPrefixTo = function(act,fromFile,exports,optPrefixTo){

        var fF, dFF, sep = polO.sep;
        if(act === 'eto'){
          return '';
        }else{
          if(optPrefixTo){
            return  optPrefixTo  ;
          }else if(polO.prefixTo){
            return polO.prefixTo;
          }else if( fromFile || polO.fromFile ){
            fF = fromFile ? fromFile :
                ( polO.fromFile ? polO.fromFile : '' );
            if(fF && !/testProjFile[.]json$/.test(fF)){
              // derives prefixTo from fromFile path and fromFileName
              dFF = !polO.no6 && !polO.pathTo ?
                        polO.fileNameToPath(fF)+'_' :
                        '';
              return  dFF;
            }else{
              // default value of prefix for test
              return __dirname + sep + 'test' + sep +'pathTo_';
            }
          }
        }
      };
      /**
       * !!! if pathTo is predetermined it should be set in advance
       * before polO.work call by assigning polO.pathTo property !!!
       * This case is appropriate to 'eto' action parameter mode for which
       * opt_prefixTo argument contains the value of pathTo parameter
       * @param {string}act action parameter
       * @param {string}optPrefixTo - opt_prefixTo value in calling function
       * @param {object}exports - module.exports object
       * @return {string}  pathTo value
       */
      polO.getPathTo =  function(act,optPrefixTo,exports){
        if(act === 'eto' && opt_prefixTo ){
          polO.no6 = true;
          polO.prefixTo = '';
          return opt_prefixTo;
        }else{
          return polO.pathTo ?
                 polO.pathTo :
                 '';
        }
      };
      /**
       * working engine
       * fulfills or extraction(evoking) of js-files from json-file
       * or assembly of final json-file using js-files already modified
       * depending on the act - parameter value
       * @param {string}label - the label of project being handled
       * @param {string}opt_act - action parameter indicating
       *       working mode: 'e' | 'a' |'ea' | 'eto' | 'ato' ...
       * @param {string}opt_fromFile - source json file
       * @param {string}opt_prefixTo - prefix of pathTo directory name.
       *     Six random alphanumerical characters are appended to prefix
       *     to form pathTo - path of folder where to place js-files extracting.
       *     If action parameter opt_act has value 'eto' prefixTo has
       *     meaning and value of pathTo and no characters appending will be
       *     taken place.
       * @param {string}opt_pathFrom - where to take js file for assembling json-file
       * @param {string}opt_assFileNems - name of json file assembled
       * @param {string}opt_outputFile - full path to user defined assembly file
       *     including file name and extension
       */
      polO.work = function(label,
                              opt_act,
                              opt_fromFile,
                              opt_prefixTo,   // it's pathTo if act= 'eto'
                              opt_pathFrom,
                              opt_assFileName,
                              opt_outputFile
                              ){
        var fromFile, mode, pathTo, prefixTo, pathFrom, outputFile;
        var act = opt_act ||
                  (opt_fromFile || polO.fromFile ?
                   'e' :
                   'ea'     // 'ea' is default for test mode
                  );
        polO.act = act;

        var sep = polO.sep;       //  path separator
        //  absolute path and filename
        fromFile = opt_fromFile ||
                   polO.fromFile ||
                   __dirname + sep + 'test' + sep + 'testProjFile.json';
        prefixTo =  polO.getPrefixTo(act,fromFile,exports,opt_prefixTo);
        polO.prefixTo = prefixTo;

        pathTo = polO.getPathTo(act,opt_prefixTo,exports);
        polO.pathTo = pathTo;

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
                    fromFile
        );

        if(act === 'erf'){
          // rf - mode of evoking object
          mode = 'rf';
          polO.evokeJsFiles(label,fromFile,prefixTo,act,mode);
        }else if(act === 'e' || act === 'ea' ){
          mode = 'req';
          polO.evokeJsFiles(label,fromFile,prefixTo,act,mode);
          console.log('in work: after evokeJsFiles %s evoke test\n'+
              ' polO.pathTo=\n%s',
              mode,polO.pathTo);
        }else if( act === 'eto'){
          polO.no6 = true;
          prefixTo = '';
          polO.pathTo = pathTo;
          polO.evokeJsFiles(label,fromFile,prefixTo,act,mode);
          console.log('Thats All with \'%s\' - evoke testing\n polO.pathTo=\n%s',
              act,polO.pathTo);
        }else if(act === 'a' || act === 'ato'){
          // assembly work
          // location of js-files edited
          pathFrom = opt_pathFrom || polO.pathFrom ;
          polO.outputFile = opt_outputFile || polO.outputFile;
          /**
           * @descrition
           * final assembly json file is located
           * 1. or in the same directory where original fromFile lives
           * and has modified name fromFile_modified_n where n=0,1,...
           * depending on the number of saving files in work-flow.
           * 2. or this file could have fixed user defined NAME
           * determined by opt_assFileName parameter. This does not change
           * the location directory of the file only the name.
           * 3. By user preference it's possible to specify fixed name and
           * location directory assigning full file path( including file name
           * and .json extension) by opt_outputFile parameter. The value of this
           * parameter should be monitored inside polO.assembleProjFile method
           * and is transferred there by polO.outputFile property or
           * as function parameter or (options objects - not yet)
           * To realize last option act parameter value 'ato' is the best.
           */
          if( act === 'a'){
            polO.assFileName = opt_assFileName || polO.assFileName;
          }

          polO.assembleProjFile(
              label,fromFile,pathFrom,opt_assFileName,opt_outputFile);

        }else{
          console.log('not described act value %s',act);
        }
      };
      /**
       * @description
       * Requirements and characteristics of params-json-file
       * - file in which calculating parameters are values of appropriate
       * properties.
       * Criteria:
       * a) last part of json-file name is '_params.json'
       * b) file with such name is located in the folder ./params
       * c) depending on the e or a -mode it's possible
       * to control presence of prefixTo or pathFrom being set additionally
       *
       * Such criteria permit to create params json-file automatically after evoke
       * procedure and to store it in the ./params folder. The name of such file
       * could be (should be) fromFileName_params.json were fromFileName is
       * path.baseName(fromFile,'.json') file name without extension.
       * @param {string}arg3 - params file name without end part '_params.json'
       *     historically it has been introduced for nmp pol command fourth
       *     argument (index 3) of command line command. So it was named arg3
       * @return {boolean} true if a file with initial part of name indicated
       *     does exist and present in the ./params  folder
       */
      polO.hasParamsJson = function(arg3){
        var sep = polO.sep
        var fpth = __dirname + sep + 'params' + sep + arg3 + '_params.json';
        return  fs.existsSync(fpth) ? fpth : '';
      };
      /**
       * exports calculation parameters outside into external scope
       * @param {Object}receiver object
       * @param {Object}options donor object
       */
      polO.setCalcParams = function(receiver,options){
        receiver.act = options.act || '';
        receiver.fromFile = options.fromFile || '';
        receiver.prefixTo = options.prefixTo || '';
        receiver.pathTo = options.pathTo || '';
        receiver.pathFrom = options.pathFrom ||  '';
        receiver.assFileName = options.assFileName || '';
        receiver.outputFile = options.outputFile || '';
      };
      /**
       * prints parameters properties of
       * @param {object} options
       */
      polO.ppp = function(options){
        var prnms = ['act','fromFile','prefixTo','pathTo','pathFrom',
          'assFileName','outputFile','label'];
        var ipr;
        for( var i=0;i<prnms.length;i++){
          ipr = prnms[i];
          //console.log('ipr = '+ipr);
          console.log('options.'+ipr+'='+(function(options){if(options[ipr]){return options[ipr];}else{return 'empty';}}(options))+'\n'+
          'polO.'+ipr+'='+ (function(options){if(options[ipr]){return options[ipr];}else{return 'empty';}}(exports)));
        }
      };
      /**
       * polO.run - method
       * executes evoking or assembly in dependence of the number, the types and
       * the values of method's arguments.
       *
       * Variables used in context and their meaning:
       * act - action type parameter
       * fromFile - full path of json file of appScript project downloaded
       * pathTo - path of the folder wherein js-files extracted form fromFile
       *          will be stored to. (Could be assigned by user manually by
       *          setting polO.pathTo property)
       * prefixTo - part of pathTo path to which six random alphanumerical characters
       *            will be appended to get new pathTo value
       * pathFrom - path of folder being location of extracted files will being taken
       *            for assembly new project's json file modified off-line
       * assFileName - name of resulting project's json file without .json extension
       *               specified by user if any. Optional parameter. If not set the
       *               name of resulting json-file is assigned automatically
       *               following the rule described bellow or in methods' description
       * Arguments options:
       *     No Arguments - all arguments and parameters will have Default values.
       *         is used while testing
       *         call example: polO.run(); // (0)
       *
       * First argument's values vs meaning & functionality (act - action parameter):
       *     'e' - evoke
       *     'a' - assemble
       *     'o' - object properties as managing parameters
       *     'f' - same as 'o' but object will be get from json file locating into
       *           __dirname + sep +'params' folder; where sep is OS paths separator
       *     'ea' - 'e'voke and then 'a'ssemble (default) using in test run and
       *              at chaining processes like auto lint of js-files codes
       *     'eto' - evoking js-files extracted from fromFile and write them into
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
       *       package root directory)
       *       call samples:
       *           polO.run('f',paramsFileNamePart); // (4) or
       *           polO.run('',paramsFileNamePart);  // (5) or
       *           polO.run(paramsFileNamePart);     // (6)
       *
       *        typeof paramsFileNamePart === 'string' &&
       *        !/\.json$/.test(paramsFileNamePart) &&
       *        !/_params\.json$/.test(paramsFileNamePart)
       *        is boolean true,
       *        where paramsFileNamePart is string presenting
       *        file name without '_params.json' of params-json-file located in
       *         __dirname+sep+'params' directory (sep='\\' in the case of Windows)
       *          and containing json string with properties:
       *         paramsJsonFileContent =
       *           {"act": "...","fromFile": "..." ,"prefixTo": "...",
       *           "pathTo": "...","pathFrom": "...","assFileName": "...",
       *           "outputFile: "..."}
       *         Attention remark! - content of json-file json string must not
       *         contain line brakes special characters.
       *
       * 'e'- evokes js-files from fromFile into new prefixToXXXXX -directory
       *      call ex.: polO.run('e',fromFile,prefixTo) (7)
       * 'eto'- evokes js-files from fromFile into user defined pathTo directory
       *        call ex.:
       *            polO.run('eto',fromFile,pathTo);  (8)
       *
       * 'a' - assembling final project's json file
       *       call samples:
       *       polO.run('a',fromFile,pathFrom,opt_assembleFileName); // (9) or
       *
       * 'ato' - assembling final project's json file specified. The final json-file
       *       and it's location are strictly determined by user
       *       call samples:
       *       polO.run('ato',fromFile,pathFrom,outputFile); // (10)
       *       where outputFile is a full path including file name and
       *       extension .json where to write final json assembly file
       *
       * 'erf' - technical evoking mode using algorithm of direct content reading
       *         of json file (only for information. details see in code description)
       *         to get the object whose properties contain js-files data
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
       *     Default value is 'ea' if it's a {string} or it is absent at all.
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
       *      }; *
       * @param {string|Object}opt_fromFile (or_paramsObj or parmsFileNamePart)
       * @param {string}opt_prefixTo (_or_pathTo)
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
        console.log('run-method begins -----------------> \n');
        var label = opt_label || polO.label;
        var params,
            paramsSet = false,
            act,
            options;  //  donor options object
        var sep = polO.sep;

        if( typeof opt_act === 'object' ){
          //  paramsObject case (1)
          options = opt_act;
        }else if(opt_act === 'o'){
          if( typeof opt_fromFile !== 'object'){
            throw 'Something is wrong! Action parameter = \'o\' but\n'+
                'second argument of method pol is not an Object!';
          }
          //  paramsObject case (3)
          options = opt_fromFile;
        }else if(!opt_act){
          if(typeof opt_fromFile === 'object'){
            // paramsObject as second argument case (2)
            options = opt_fromFile;
          }else if( polO.hasParamsJson(opt_fromFile)){
            // correct params-json-file exists (5)
            paramsSet = true;
            params = require( './params/' + opt_fromFile + '_params.json');
            options = params;
          }else{
            // possible all default case or standard case with testing act
            if(!opt_fromFile ){
              // default act and fromFile case (0)
              options = {act: 'ea'};
            }else if( typeof opt_fromFile === 'string' &&
                      /\.json$/.test(opt_fromFile)){
              // conventional fromFile parameter with default action
              act = 'e';
            }else{
              throw 'fromFile is not json file or has bad name:\n'+opt_fromFile;
            }
          }
        }else if(opt_act === 'f'){
          if( polO.hasParamsJson(opt_fromFile)){
            // correct params-json-file exists (4)
            paramsSet = true;
            params = require( './params/' + opt_fromFile + '_params.json');
            options = params;
          }else{
            throw '\'f\' action parameter but absent or incorrect'+
                  ' params-json-file:\n'+ opt_fromFile;
          }
        }else if( polO.hasParamsJson( opt_act)){
          // single first argument as paramsFileName without ending '_params.json'
          // case (6)
          paramsSet = true;
            params = require( './params/' + opt_act + '_params.json');
            options = params;
        }
        console.log( params );
        if( typeof options === 'object'){
          options.label = label;
          polO.setCalcParams ( exports,options);
          polO.work(label, act);
          return;
        }
        polO.act = opt_act;
        act = opt_act;
        if(/\.json$/.test(opt_fromFile)){
          // source json file
          /**
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
           */
          if( !fs.existsSync(opt_fromFile) ){
            throw 'file '+opt_fromFile+' does not exists on PC';
          }else{
            var ob;
            try {
              ob=JSON.parse( fs.readFileSync (opt_fromFile) );
            }catch(e){
              console.log(e);
              console.log( 'Bad json-string in file opt_fromFile =\n%s',opt_fromFile);
              throw 'Bad json-string in file opt_fromFile =\n' + opt_fromFile;
            }
            polO.fromFile = opt_fromFile;
          }
        }else{
          throw 'opt_fromFile is not json-file or has bad name:\n' +
                opt_fromFile + '\n or bad data';
        }

        if(['e','ea','eto','erf','a','ato'].indexOf(opt_act) < 0 &&
            opt_act){
          console.log( 'incorrect value of opt_act parameter!');
          act = 'e';
        }

        options = {
          act: act,
          fromFile: opt_fromFile,
          prefixTo: opt_prefixTo,
          pathTo: polO.pathTo,
          pathFrom: opt_pathFrom,
          assFileName: opt_assFileName,
          ouputFile: opt_outputFile,
          label: label
        }
        polO.setCalcParams ( exports,options);
        polO.work(label,polO.act);
      };
      /**
       * resets renewable (using in calculation) calculating parameters' properties
       * of exports object
       * @param {Object}exp module's exports object
       */
      polO.reset = function(exp){
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
          exp[i]='';
        }
      }
      /**
       * launches pol-methods with different parameters values over
       * specified timeout period to exclude traffic jam
       * @param {string}label - the label or id of project being handled
       * @param {number}opt_t timeout delay in millisecond. Default=10000
       * @param {}opt_first - is used as opt_act parameter in methods of module
       * @param {}opt_second - equivalent to opt_fromFile parameter in module's
       *     methods.
       */
      polO.runLauncher = function(opt_label,opt_t, opt_first, opt_second, opt_third){
        var label = opt_label || polO.label || 'absence of label is bad practice' ;
        if( opt_t &&
            (typeof opt_t !== 'number' )){
          throw 'being set first parameter should be a number of milliseconds';
        }
        var t= ( opt_t || opt_t === 0 )? opt_t : 10000 ;
        var f = opt_first || '';
        var s = opt_second || '';
        var th = opt_third || '';
        setTimeout( function(){
                    polO.reset(exports);
                    polO.label = label;
                    polO.run(label,f,s);
                   },t);
      };
      /**
       * tests polO.run method
       * or presents the prototype of consecutive projects data handling
       * Each project determined by it's label or id. In the example bellow
       * this is a descriptive comment.
       */
      polO.workTest = function(){
        var o, pFN, label;

        if(1){
          //  test (0)
          label = 'TEST all defaults Case (0)';
          console.log(label);
          polO.runLauncher(label,0)

          // oooooooooooooooooooooooooo
          o = {
            act: '',
          };
          //  oooooooooooooooooooooooooo
          // test (1-0)
          label ='TEST all default parameters case (1)';
          console.log(label);
          polO.runLauncher( label,2000,'o',o);

          //  test (2-0)
          label ='TEST all default parameters case (2)';
          console.log(label);
          polO.runLauncher(  label, 3000,'',o);

          // test (3-0)
          label = 'TEST all default parameters case (3)';
          console.log(label);
          polO.runLauncher( label,3000,o); //polO.run(o);
        }
        if(1){
          //  oooooooooooooooooooooooooo
          o = {
            act: 'e',
            fromFile:'j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codes\\'+
                'smsCikPostCallHandle_Scripts.json',
           prefixTo:''
          };
            //  oooooooooooooooooooooooooo

          //  test (1-e) fF - set pxT - default
          label = 'TEST (1-e) fF - set pxT - default';
          console.log(label);
          polO.runLauncher( label,3000,'o',o); //polO.run('o',o);

          // test (2-e) fF - set pxT - default
          label = 'TEST (2-e) fF - set pxT - default';
          console.log(label);
          polO.runLauncher( label,2000,'',o); //polO.run('',o);

          // test (3-e) fF - set pxT - default
          label = 'TEST (3-e) fF - set pxT - default';
          console.log(label);
          polO.runLauncher( label,3000,o); //polO.run(o);
        }
        if(1){
          //  oooooooooooooooooooooooooo
          o = {
            act: 'e',
            fromFile:'j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codes\\'+
                'smsCikPostCallHandle_Scripts.json',
            prefixTo:'j:\\Работа\\Web-design\\Workshop_VU\\vu_PEleCom\\codesRf_'
          };
          //  oooooooooooooooooooooooooo

          //  test (1-e) fF - set pxT - set
          label = 'TEST (1-e) fF - set pxT - set';
          console.log(label);
          polO.runLauncher( label,3000,'o',o);             //polO.run('o',o);

          // test (2-e) fF - set pxT - set
          label = 'TEST (2-e) fF - set pxT - set';
          console.log(label);
          polO.runLauncher( label,3000,'',o);              //polO.run('',o);

          // test (3-e) fF - set pxT - set
          label = 'TEST (3-e) fF - set pxT - set';
          console.log(label);
          polO.runLauncher( label,3000,o);                 // polO.run(o);
        }
      //------------------ f --------------


        if(1){
          // test (4-0 f->e)
          label = 'TEST all default parameters case (4-0 f->e)';
          console.log(label);
          polO.runLauncher( label,3000,'f','allDefaults'); //polO.run('f','allDefaults');

          //  test (5-0 f->e)
          label = 'TEST all default parameters case (5-0 f->e)';
          console.log(label);
          polO.runLauncher( label,3000,'','allDefaults');  //polO.run('','allDefaults');

          // test (6-0 f->e)
          label = 'TEST all default parameters case (6-0 f->e)';
          console.log(label);
          polO.runLauncher( label,3000,'allDefaults');    //polO.run('allDefaults');
        }
        if(1){
          //  test (4-e) fF - set pxT - default
          label = 'TEST fromFile is set and prefixTo - default (4- f->e)';
          console.log(label);
          polO.runLauncher( label,3000,'f','0'); //polO.run('f','0');

          // test (5-e) fF - set pxT - default
          label = 'TEST fromFile is set and prefixTo - default (5- f->e)';
          console.log(label);
          polO.runLauncher( label,3000,'','0'); //polO.run('','0');

          // test (6-e) fF - set pxT - default
          label = 'TEST-> fromFile is set and prefixTo - default (6- f->e)';
          console.log(label);
          polO.runLauncher( label,3000,'0'); //polO.run('0');
        }
        if(1){
          //  test (4-e) fF - set pxT - set
          label = 'TEST fromFile set and prefixTo set case (4- f->e)';
          console.log(label);
          polO.runLauncher( label,3000,'f','1'); //polO.run('f','1');

          // test (5-e) fF - set pxT - set
          label = 'TEST fromFile set and prefixTo set case (5- f->e)';
          console.log(label);
          polO.runLauncher( label,3000,'','1'); //polO.run('','1');

          // test (6-e) fF - set pxT - set
          label = 'TEST fromFile set and prefixTo set case (6- f->e)';
          console.log(label);
          polO.runLauncher( label,3000,'1'); //polO.run('1');
        }
        // finish
        console.log('WorkTest has ended.');
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
        myEE.on('readyWriteOutputFile',polO.writeAssFile);
        myEE.on('endpoint-e',polO.eEndpoint);
        myEE.on('endpoint-a',polO.aEndpoint);
      }(polO.myEE);  //  or polO.setEvents(polO.myEE);
      
        return polO;

  };  
    return polO;
}());

