var fs = require('fs');
var cp = require('child_process');
var path = require('path');
/**
   * instantiates the object of project off-liner with unique identifier
   * whose role plays label parameter
   * @param {string}label - unique identifier of project off-liner object
   * @return {object} project off-liner object instance
   */
   exports.clone = function(label){
      if(!label){
        throw 'label parameter is used as project off-liner unique' +
              ' identifier, so should obligatorily be determined';        
      }
      
      var polC = {};
      polC.label = label || 'project off-liner label is not set. Attention!!' ;
      /**
       * gets event's emitter object instance
       * @return {object} events emitter instance object
       */
      polC.getEventsEmInstance = function (){
        var Events = require('events');
        class EE extends Events{}
        return new EE;
      };
      /**
       * log object to register procedure steps of files' handling
       * by statuses: 'beforeWrite','written', 'error',...
       * @property {Array.<object>}polC.log.assFile - full path to assembling
       *     json file
       * @property {Array.<object>}export.log.files
       * @property {string} polC.log.files[i].path
       * @property {string} polC.log.files[i].status
       */
      polC.log = {};
      polC.log.nFilesAlreadyRead = 0;
      polC.log.nFilesToRead = 0;
      polC.log.filesStatus = {};
      polC.myEE = polC.getEventsEmInstance();    
        
      //  polC modification
      // path parts separator
      polC.sep = (function(){
        return path.sep === '\\' ? '\\' : '/';
      }());
      /*
      @property {string}polC.fromFile  full path to source json file
       */
      polC.act='';
      polC.fromFile = "";
      polC.pathTo = "";
      polC.pathFrom = "";
      polC.assFileName = "";
      polC.prefixTo = "";
      polC.no6 = false; 
      
      // ----   UTILITIES  ----      
      /**
       * separates json file name from path
       * @param {string}fPath
       * @return {object|boolean=false} false if file is not json-file
       *   @property{string} o.fnm file name
       *   @property{string} o.path file path
       */
      polC.separatePathAndFileName = function(fpath){
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
      polC.fileNameToPath = function (fp){
        var o, prfx;
        var sp = polC.sep;
        o = polC.separatePathAndFileName(fp);
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
       * creates new subdirectory(-ies) if path contains nonexistent ones
       * @param {string}pth of directory (probably nonexistent)
       */
      polC.preparePath = function(pth){
        if( !fs.existsSync(pth) ){
          var sub = pth.split(path.sep);
          sub.forEach( function(el,j,su){
            var dnm = su.slice(0,j+1).join(path.sep);
            if( !fs.existsSync( dnm ) ){
              fs.mkdirSync( dnm );
            }
          });            
        }
      };
      // ----- EVOKE JS - FILES ---------
      /**
       * Sets temporary folder where to place temporary data.
       * 'toFolderReady' event emitter
       * Folder path is determined by adding six random characters 
       * to prefixTo path. It is possible to set fixed path of destination
       * folder on user choice but this should be done by setting property 
       * polC.pathTo DIRECTLY!!.
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
       *   the polC.pathTo will have been set and event 'toFolderReady' will be
       *   fired,  otherwise
       *   polC.pathTo === undefined without appropriate event emitting
       */
      polC.evokeJsFiles = function(label,fromFile,opt_prefixTo,opt_act,opt_mode){
        var act = opt_act || polC.act || 'unknown act';
        var mode = opt_mode||'req';
        // output folders
        console.log('\n\ninside evokeJsFiles begins with parameters:' +
                    '\n  >----------<\n' +
                    'fromFile=\n' +fromFile+ '\n' +
                    'opt_prefixTo=\n' + opt_prefixTo +'\n' +
                    'polC.fromFile= \n' + polC.fromFile + '\n' +
                    'opt_act= ' + opt_act +'\n' +
                    'polC.act= ' + polC.act + '\n' +
                    'label = ' + label +
                    '\n  >----------<\n');

        /**
         * @description
         * - if opt_prefixTo is not set checks polC.prefixTo
         * - if polC.prefixTo is not set, file name of fromFile without
         * extension is used as prefixTo and the directory with name
         * <prefixTo>XXXXXX will be created inside host folder of fromFile and
         * will be assigned as pathTo for js-files being going to be extracted
         * will have been placed there.
         * XXXXXX - 6 random alphanumerical characters
         * - in the case when it's necessary to use some path specified as pathTo
         * parameter without appending six random characters to the name of folder
         * the following rules should be followed by:
         * 1. property polC.no6 should be set true and
         * 2. polC.prefixTo as well as opt_prefixTo should be empty string ''.
         * 3. The value of pathTo is taken from polC.pathTo property
         * 4. if the folder with path pathTo does not exist it will be created.
         *
         */
        var prefixTo = opt_prefixTo ||
            polC.prefixTo ||
            ( !polC.no6 && !polC.pathTo ? polC.fileNameToPath(fromFile)+'_' : '') ;
        polC.prefixTo = prefixTo;

        if(polC.no6){
          if(polC.pathTo){
            var pathTo = polC.pathTo;
            polC.pathTo = '';
            polC.no6 = false; // resets to default value
            if( !fs.existsSync(pathTo) ){
              fs.mkdir(pathTo,function(err){
                if(err){
                  console.log(err+'\n' +
                      'failed to create new directory\n%s',pathTo);
                }
                polC.pathTo = '';
                polC.myEE.emit('toFolderReady', label, fromFile,pathTo,act,mode);
              });
              return;
            }
            polC.pathTo = '';
            polC.myEE.emit('toFolderReady', label, fromFile,pathTo,act,mode);
            return;
          }else{
            throw "Attention! no6 parameter is true but pathTo is not set";
          }
        }
        if( !prefixTo){
          throw 'Logical error. polC.prefixTo should be determined here.';
        }
        // prefixTo is set
        polC.pathTo=''; // from this point this parameter is not needed
        fs.mkdtemp(prefixTo,function(err,pathTo){
          if(err){
            console.log(
            "Error while creating temporary folder by means of fs.mkdtemp "+
            err);
            polC.pathTo = undefined;
          }
          polC.pathTo = '';
          polC.myEE.emit('toFolderReady', label, fromFile,pathTo,act,mode);
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
      polC.evokeObjFromFile = function (label, fromFile,pathTo,act, opt_mode){
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
        polC.myEE.emit('objReady',label,dObj,fromFile,pathTo,act);
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
      polC.evokeScriptsFromObj = function (label,dObj,fromFile,pathTo,act){
        if(!dObj.hasOwnProperty('files')){
          throw 'object has no property dObj.files';
        }else if(!dObj){
          throw( 'dObj parameter is undefined or null');
        }
        console.log(
            '\n\nInside polC.evokeScriptsFromObj: Temporary folder is ready:' +
            '\n%s\n'+
            'Data object received. String length= %s',
            pathTo,
            JSON.stringify(dObj).length );
        if(!(dObj.hasOwnProperty('files') && Array.isArray(dObj.files))){
          console.log('object has no dObj.files property or this\n' +
                      'property is not an Array!');
          return;
        }

        var sep = polC.sep;
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
              polC.writeParamsFile(label,fromFile,pathTo,act);
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
      polC.writeParamsFile=function(label,fromFile, pathTo, opt_act, opt_pathFrom,
                                        opt_prefixTo, opt_assFileName,
                                       opt_outputFile){
        var act = opt_act || polC.act || '';
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
        var sep = polC.sep;
        var fnm = path.basename(fromFile,'.json'); // file name without extension
        var fpth = __dirname + sep + 'params' + sep + fnm + '_params.json';
        fpth = polC.checkParamsFileName(
            fpth.replace(/_params\.json/,'_0_params.json'));
        polC.paramsFile = fpth;

        var data = JSON.stringify(o);
        if( act === 'ea'){
          fs.writeFileSync(fpth, data);
          console.log( 'params json file \n%s\n has been written',
                  fpth);
          polC.myEE.emit('endpoint-e',label, fromFile,pathTo,act);
        }else{
          console.log('\n\nin writeParamsFile writes params-file asynchronously\n\n');
          fs.writeFile(fpth, data,'utf-8',function(err){
            if(err){
              console.log('error occured while writitng params-file :\n%s',err);
            }
            console.log('\n\nParamsFile has been written, it\'s path =\n%s',fpth);
            polC.myEE.emit('endpoint-e',label, fromFile,pathTo, act);
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
      polC.checkParamsFileName = function(pathTesting){
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
      polC.eEndpoint = function (label,fromFile,pathTo, act){
        var pathFrom;
        console.log('\n\nEndpoint of Evoke-mode has been reached.'+
                    ' Event \'endopoint-e\'\n'+
                    'label = '+ label +
                    '\npathTo =\n' + pathTo );

        if( act === 'ea'){
          pathFrom =  pathTo;
          polC.pathFrom = pathFrom;
          polC.pathTo = '';
          polC.work(label,'a',fromFile,'',pathFrom);
        }
        console.log('Exit from eEndpoint without chaining for\n' +
           'fromFile=\n%s\n' +
           'label = %s\n'+
           'and act= %s',
           polC.fromFile,
           label,
           act);
      };
      //  -----  ASSEMBLE ---------
      /**
       * 'assembleFileRedy' event emitter
       * Assembles scripts content of js-files modified into json file
       * prepared to uploading it to Google appScript project.
       * @param {string}label identifier of project being handled
       * @param {string}opt_fromFile  (originalJsonFileDownloaded) full file
       *     path of original Google project json file downloaded from
       *     GoogleDrive
       * @param {string}opt_pathFrom path to the destination folder for output
       *     json file. This is the same folder where js-files modified,
       *     obtain from original json file, are placed earlier and
       *     appropriately are taken from.
       * @param {string}opt_assFileName output json file name to be written.
       *    Optional. By default name is
       *    <originalJsonFileDownloadedWithoutExtention> + "_modified_N.json"
       *    where N after 'modified_' is string number showing the version of
       *    assembled file provided in sequential calculation run. N is
       *    increased each time by one, to guaranty that outputFile's version
       *    do not overwrite one another. and whose destination folder path
       *    is opt_pathFrom (rule for outputFile location and name).
       *
       * @param {string}opt_outputFile - full path of final output json file
       *     including file name and extension (.json)
       * @returns{string} json string being the content of json file prepared
       *      for uploading
       *   and writes new file named 
       *   originalJsonFileDownloaded + "_modified.json" to opt_pathFrom 
       *   directory.
       *   output file name and place:
       *   opt_assFileName if it's set or
       *   originalJsonFileDownloaded + "_modified_N.json" to opt_pathFrom
       *   folder. ( opt_assFileName, opt_pathFrom etc. here are string
       *   variables.)
       */
      polC.assembleProjFile = function(
          label,opt_fromFile, opt_pathFrom, opt_assFileName, opt_outputFile){
        console.log( '\n\nInside assembleProjFile\n'+
            '\n------vvvvvv------\n' +
            'opt_fromFile =\n%s\n'+
            'opt_pathFrom =\n%s\n' +
            'opt_assFileName =\n%s\n'+
            'opt_outputFile =\n%s\n' +
            'label = %s' +
            '\n------^^^^^^------\n',
            opt_fromFile,
            opt_pathFrom,
            opt_assFileName,
            opt_outputFile,
            label);
        // outputFile - user predefined full path of output file
        var outputFile = opt_outputFile || polC.outputFile;
        
        var fromFile =  opt_fromFile || polC.fromFile || "";
        polC.fromFile = fromFile;
        if(!fromFile){
          throw 'assembleProjFile: original json file has not been set';
        }
        polC.assemble = true;

        var oFP, outFileName, outPath, fromFileCopy,
            sp = polC.sep;
        if( !outputFile){
          oFP = polC.separatePathAndFileName(fromFile);

          outFileName  = ( function(){
              if(opt_assFileName){
                if( !/\.json$/.test(opt_assFileName)){
                  return opt_assFileName + '.json';
                }else{
                  return '';
                }
              }else if(polC.assFileName){
                return polC.assFileName + '.json';
              }else{
                return oFP.fnm.replace(/\.json$/,'')+'_modified.json';
              }
          }());
          outPath = opt_pathFrom ?
                    opt_pathFrom :
                    (polC.pathFrom ? polC.pathFrom : oFP.path);
          polC.preparePath(outPath);                    
          fromFileCopy = !outFileName ? 
                       opt_assFileName : outPath + sp + outFileName;
        }else{
          outPath = path.dirname(outputFile);
            polC.preparePath(outPath);
        }
        fs.copyFile(fromFile, fromFileCopy, function(err){
          if(err){
            throw(err);
          }
          // emits assembleFileReady event
          console.log('\n\nBefore assembleFileReady event emit \n' +
              'outPath=\n%s\n'+
              'fromFileCopy=\n%s',
              outPath,
              outputFile);
          polC.myEE.emit('assembleFileReady',label, fromFileCopy,
                         outPath, outputFile,'req');
        });
      };
      /**
       * 'assembleFileReady' event listener
       * by means of fs module reads input json-file from drive and
       * transforms  it's content into an object then
       * emits custom event 'preUploadAssembleFile' to chain next calculations:
       * the content of dObj.files[i].script properties will be exchanged by
       * scripts of modified js-files locating in pathFrom directory.
       * parameters for callback function: dObj,fromFile,pathFrom
       * @param {string}label identifier of project being handled
       * @param {string}fromFile absolute path to json - file including name
       * @param {string}pathFrom absolute path to where js-files already
       *     modified are stored.
       * @param {string}opt_outputFile -
       * @param {string}opt_mode - method's mode:
       *   "req" default - gets json file with Google appScript project codes
       *    and returns appropriate object by means of node require() function
       *   "rf" - gets object by parsing data preliminary read by fs.readFile
       *    object
       */
      polC.evokeObjFromAssFile = function(label,fromFile,
                                          pathFrom,opt_outputFile,opt_mode){
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
              polC.myEE.emit('preUploadAssembleFile',label,dObj,fromFile,
                             pathFrom,opt_outputFile);
            }
          });
        }else if(mode === 'req'){
          dObj = require(fromFile);
          polC.myEE.emit('preUploadAssembleFile',label,dObj, fromFile,
                         pathFrom,opt_outputFile);
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
      polC.preUploadFile = function (label, dObj, fromFile, pathFrom,
                             opt_outputFile, opt_assync){

        if(!dObj.hasOwnProperty('files')){
          throw 'data object has no property dObj.files';
        }
        var async = opt_assync || false;
        var sp = polC.sep;

        var outputFile =
            opt_outputFile ||
            polC.checkAssFileName( fromFile.replace(/\.json/,'_0.json'));

        var files = dObj.files;
        if( !Array.isArray(files) || files.length <= 1){
          console.log( 'files property of dObj is not Array or has no elements');
          return;
        }
        polC.assFN = files.length;
        var file, fname, fpath;
        console.log('\n\nBefore cycling over dObj.files[i] properies\n'+
            'pathFrom:\n%s\n',pathFrom);

        for(var i = 0;i < files.length;i++){
          file = files[i];
          fname = file.name;
          fpath = pathFrom + sp + fname+'.js';
          console.log( 'fname=\n%s,\nfpath=\n%s\n',fname,fpath);
          if(fs.existsSync(fpath)){
            polC.log.nFilesToRead++;
            polC.log.filesStatus[fpath]='beforeRead';
            if(async){
              /* NEED TO BE done !!!! Not works yet!
              fs.readFile(fpath,'utf8',function(err,data){
                if(err){
                  console.log('error %s reading file \n%s ',err.message,fpath);
                  polC.log.filesStatus[fpath]='error';
                }else{
                  //'',dObj.files[i].name);
                  file.source = data;
                  polC.log.filesStatus[fpath]='written';
                }
              });*/
            }else{
              // Synchronous mode working WELL. Tested.
              file.source = fs.readFileSync(fpath,'utf8');
              polC.log.filesStatus[fpath]='written';
            }
            polC.log.nFilesAlreadyRead++;
          }else{
            console.log('\nAttention!! File \n%s\n does not exist.',fpath);
          }
          if(i === files.length - 1){
            if(async){
              // launches read integrity checking procedure
              // the necessity of this is rational only for async - mode
              polC.loop = setInterval( function(){
                if(polC.log.nFilesAlreadyRead === polC.log.nFilesToRead){
                  clearInterval(polC.loop);
                  polC.myEE.emit('readyWriteOutputFile',label,
                                    dObj, outputFile);
                }
              },1000);
            }else{
              console.log( '\n\nBefore \'readyWriteOutputFile\' event emit\n'+
                  'outputFile =\n%s\n' +
                  'label = %s\n',outputFile, label);
              polC.myEE.emit('readyWriteOutputFile',label, dObj, outputFile);
            }
          }
        }
      };
      /**
      * @description of the procedure of all files involvement in assembling
      *   procedure control.
      * 1. At the beginning of assembling
      * polC.assemble = true
      * 2. cycle is realized through dObj.files array elements.
      *   for each i - file the appropriate file named dObj.files[i].name+'.js'
      *   is looking for in the pathFrom folder. It's content is reading and
      *   is used to reassign dObj.files[i].source
      * 3. the reading of file may be successful or not. If file content would
      *   - at the beginning of reading file polC.log.files[i].status is set
      *     to 'readBegan'
      *   - if error would have occurred at reading this parameter would be set
      *      'error'
      *   - at successful read this would be set 'written';
      * 4. Files are read asynchronously. So to check reading integrity while
      *    last files[last] file read has begun the checking loop procedure is
      *    launched monitoring polC.log.nFilesAlreadyRead and
      *    polC.nFilesToRead global parameters. The procedure periodically
      *    checks does the number of files read and written is equal to
      *    files.length. The implementation of procedure uses
      *
      *  polC.loop = setInteval( function(){
      *      if(polC.log.nFilesAlreadyRead === polC.log.nFilesToRead){
      *        clearInterval(polC.loop);
      *        polC.myEE.emit('readyWriteOutputFile',label,...);
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
      polC.writeAssFile = function (label, dObj,outputFile){
        console.log('\n\nInside writeAssFile ');
        var outPth;
        var data = JSON.stringify(dObj);
        fs.writeFile(outputFile,data,function(err){
            if(err){
              console.log(err + 
                  '\nwhile attempting to write finally assembled json - file');
            }else{
              outPth = polC.separatePathAndFileName(outputFile).path;
              console.log('Assembly has finished\noutput file:\n%s\n' +
              'json-file has been written into folder outPth =\n%s\n',
              outputFile, outPth);
              // opens window of file explorer and launches explorer showing
              //  folder where json-file has been written
              var childProc = cp.execSync(
                  'start explorer.exe '+'"' +
                   outPth +'" & exit');
              polC.myEE.emit('endpoint-a',label,outputFile);
            }
        });
      };
      /**
       * 'endpoint-a' event listener (assemble)
       * @param {string}pathTo path to the directory where js-files have been
       *     located.
       */
      polC.aEndpoint = function (label,outputFile){
        polC.lastAEndpoint = new Date().getTime();
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
      polC.checkAssFileName = function(pathTesting){
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
      polC.readme = function(){
        var read = require('./readme.js');
        read.readme();
      };
      /**
       * tests current module
       */
      polC.test = function(){
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
        console.log('%s - mode - "read file" - reads googleScript json - file',
                    mode);
        polC.evokeJsFiles(label,fromFile,prefixTo,mode);
        console.log('Thats All with %s testing',mode);
        }
        if(0){
        // req - mode
        mode = 'req';
        console.log('%s - mode ',mode);
        polC.evokeJsFiles(label,fromFile,prefixTo,mode);
        console.log('Thats All with %s testing',mode);
        }
        // assembling tests
        if(1){
          // location of js-files edited
          var pathFromSuffix = "ChxS0s";
          var pathFrom = prefixTo + pathFromSuffix;
          polC.assembleProjFile(label,fromFile,pathFrom);
        }
      };
      /**
       * @description prefixTo setting
       * - if opt_prefixTo is not set checks polC.prefixTo
       * - if polC.prefixTo is not set, file name of fromFile without
       * extension is used as prefixTo and the directory with name
       * <prefixTo>XXXXXX will be created inside host folder of fromFile and
       * will be assigned as pathTo for are going to be extracted js-files.
       * XXXXXX - 6 random alphanumerical characters
       * - in the case when it's necessary to use some specified path as pathTo
       * parameter without appending six random characters to the name of
       * folder the following rules should be followed by:
       * 1. property polC.no6 should be set true and
       * 2. polC.prefixTo as well as opt_prefixTo should be empty string ''.
       * 3. The value of pathTo is taken from polC.pathTo property
       * 4. if the folder with path pathTo does not exist it will be created.
       * @param {string}act - action parameter
       * @param {string}fromFile - original json file from which scripts of
       *     js-files are extracted
       * @param {object}exp - exporter object of external scope
       * @param {string}optPrefixTo - prefixTo parameter set which is opt_prefixTo
       *     inside calling function
       * @return {string} prefixTo value string
       */
      polC.getPrefixTo = function(act,fromFile,exp,optPrefixTo){

        var fF, dFF, sep = this.sep;
        if(act === 'eto'){
          return '';
        }else{
          if(optPrefixTo){
            return  exp.absPath( optPrefixTo, exp )  ;
          }else if(exp.prefixTo){
            return exp.absPath(exp.prefixTo, exp);
          }else if( fromFile || exp.fromFile ){
            fF = fromFile ? exp.absPath(fromFile, exp) :
                ( exp.fromFile ? exp.absPath(exp.fromFile, exp) : '' );
            if(fF && !/testProjFile[.]json$/.test(fF)){
              // derives prefixTo from fromFile path and fromFileName
              dFF = !exp.no6 && !exp.pathTo ?
                        this.fileNameToPath(fF)+'_' :
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
       * before polC.work call by assigning polC.pathTo property !!!
       * This case is appropriate to 'eto' action parameter mode for which
       * opt_prefixTo argument contains the value of pathTo parameter
       * @param {string}act action parameter
       * @param {string}optPrefixTo - opt_prefixTo value in calling function
       * @param {object}exp - object of external scope (exporter)
       * @return {string}  pathTo value
       */
      polC.getPathTo =  function(act,optPrefixTo,exp){
        if(act === 'eto' && optPrefixTo ){
          exp.no6 = true;
          exp.prefixTo = '';
          
          return exp.absPath(optPrefixTo, exp);
        }else{
          return exp.pathTo ?
                 exp.absPath(exp.pathTo, exp) :
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
       *     to form pathTo - path of folder where to place js-files
       *     extracting.
       *     If action parameter opt_act has value 'eto' prefixTo has
       *     meaning and value of pathTo and no characters appending will be
       *     taken place.
       * @param {string}opt_pathFrom - where to take js file for assembling
       *     json-file
       * @param {string}opt_assFileNems - name of json file assembled
       * @param {string}opt_outputFile - full path to user defined assembly
       *     file including file name and extension
       */
      polC.work = function(label,
                              opt_act,
                              opt_fromFile,
                              opt_prefixTo,   // it's pathTo if act= 'eto'
                                              // and pathTo if  act == 'a' &&
                                              //                !opt_pathFrom
                              opt_pathFrom,
                              opt_assFileName,
                              opt_outputFile
                              ){
        console.log('inside work: \nopt_outputFile = ' + opt_outputFile +
                '\nopt_assFileName = ' + opt_assFileName );
        console.log('polC.outputFile = ' + polC.outputFile +
                '\npolC.assFileName = ' + polC.assFileName );
     
                                
        var fromFile, mode, pathTo, prefixTo, pathFrom, outputFile, assFileName;
        var act = opt_act ||
                  (opt_fromFile || polC.fromFile ?
                   'e' :
                   'ea'     // 'ea' is default for test mode
                  );
        polC.act = act;

        var sep = polC.sep;       //  path separator
        //  absolute path and filename
        fromFile = polC.absPath(opt_fromFile, polC) ||
            polC.absPath(polC.fromFile, polC) ||
            __dirname + sep + 'test' + sep + 'testProjFile.json';
        prefixTo =  polC.getPrefixTo(act,fromFile,polC,opt_prefixTo);
        polC.prefixTo = prefixTo;

        pathTo = polC.getPathTo(act,opt_prefixTo,polC);
        polC.pathTo = pathTo;

        console.log('\n\nInside work:\n  >-------vvvvv-------<\n'+
                    'polC.pathTo=\n%s\n' +
                    'polC.pathFrom=\n%s\n' +
                    'act=%s\n' +
                    'pathTo = \n%s\n'+
                    '__dirname = \n%s\n' +
                    'prefixTo = \n%s\n' +
                    'fromFile = \n%s' +
                    '\n  >------^^^^^^--------<\n',
                    polC.pathTo,
                    polC.pathFrom,act,
                    pathTo,
                    __dirname,
                    prefixTo,
                    fromFile
        );

        if(act === 'erf'){
          // rf - mode of evoking object
          mode = 'rf';
          polC.evokeJsFiles(label,fromFile,prefixTo,act,mode);
        }else if(act === 'e' || act === 'ea' ){
          mode = 'req';
          polC.evokeJsFiles(label,fromFile,prefixTo,act,mode);
          console.log('in work: after evokeJsFiles %s evoke test\n'+
              ' polC.pathTo=\n%s',
              mode,polC.pathTo);
        }else if( act === 'eto'){
          polC.no6 = true;
          prefixTo = '';
          polC.pathTo = pathTo;
          polC.evokeJsFiles(label,fromFile,prefixTo,act,mode);
          console.log('Thats All with \'%s\' - evoke testing\n polC.pathTo=\n%s',
              act,polC.pathTo);
        }else if(act === 'a' || act === 'ato'){
          // assembly work
          // location of js-files edited
          // while act === 'a' prefixTo is useless, so to shorten the length
          // of argument in polC.run call it's worthwhile to use it's place for
          // pathFrom parameter. When parameters are returned from params file or
          // from object options the probability exists that pathTo === pathFrom 
          // and prefixTo is set and yet RegExp(prefixTo).test( pathTo ) === true
          // at this case at pol.run call is rational to assign pathFrom value to
          // prefixTo method's argument (pathFrom occupies the sit of prefixTo).

          pathFrom = opt_pathFrom || opt_prefixTo || polC.pathFrom ;
          polC.outputFile = opt_outputFile || polC.outputFile;
          outputFile = polC.outputFile;
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
           * parameter should be monitored inside polC.assembleProjFile method
           * and is transferred there by polC.outputFile property or
           * as function parameter or (options objects - not yet)
           * To realize last option act parameter value 'ato' is the best.
           */
          if( act === 'a'){
            polC.assFileName = opt_assFileName || polC.assFileName;
            assFileName = polC.assFileName
          }
          console.log('inside work before polC.assemblProjFile: \noutputFile = ' + outputFile +
                '\nassFileName = ' + assFileName );
          polC.assembleProjFile(
              label, fromFile, pathFrom, assFileName, outputFile);

        }else{
          console.log('not described act value %s',act);
        }
      };
      /**
       * @description
       * Requirements and characteristics of params-json-file
       * - file in which calculating parameters are values of appropriate
       * object's properties.
       * Criteria:
       * a) last part of json-file name is '_params.json'
       * b) file with such name is located in the folder ./params
       * c) depending on the e or a -mode it's possible
       * to control presence of prefixTo or pathFrom being set additionally
       *
       * Such criteria permit to create params json-file automatically after
       * evoke procedure and to store it in the ./params folder. The name of
       * such file could be (should be) fromFileName_params.json were
       * fromFileName is path.baseName(fromFile,'.json') file name without
       * extension.
       * @param {string}arg2 - params file name without end part '_params.json'
       *     historically it has been introduced for nmp pol command fourth
       *     argument (index 3) of command line command. So it was named arg2
       * @return {boolean} true if a file with initial part of name indicated
       *     does exist and present in the ./params  folder
       */
      polC.hasParamsJson = function(arg2){
        var sep = polC.sep
        var fpth = __dirname + sep + 'params' + sep + arg2 + '_params.json';
        return  fs.existsSync(fpth) ? fpth : '';
      };
      /**
       * exporter's calculation parameters outside into external scope
       * through options object
       * @param {Object}receiver object
       * @param {Object}options donor object
       */
      polC.setCalcParams = function(receiver,options){
        receiver.act = options.act ? options.act.toString() : '';
        receiver.fromFile = options.fromFile ? 
                            options.fromFile.toString() : '';
        receiver.prefixTo = options.prefixTo ? 
                            options.prefixTo.toString() : '';
        receiver.pathTo = options.pathTo ? options.pathTo.toString() : '';
        receiver.pathFrom = options.pathFrom ?
                            options.pathFrom.toString() :  '';
        receiver.assFileName = options.assFileName ? 
                               options.assFileName.toString() : '';
        receiver.outputFile = options.outputFile ? 
                              options.outputFile.toString() : '';
        receiver.label = options.label ? options.label.toString() : '';
      };
      /**
       * prints parameters properties of
       * @param {object} options
       */
      polC.ppp = function(options){
        var prnms = ['act','fromFile','prefixTo','pathTo','pathFrom',
          'assFileName','outputFile','label'];
        var ipr;
        for( var i=0;i<prnms.length;i++){
          ipr = prnms[i];
          //console.log('ipr = '+ipr);
          console.log('options.' + ipr + '=' +
              (function(options){
                if(options[ipr]){
                  return options[ipr];
                }else{
                  return 'empty';
                }}(options))+'\n'+
          'polC.' + ipr + '=' + 
              (function(options){
                if(options[ipr]){
                  return options[ipr];
                }else{
                  return 'empty';
                }
              }(polC)));
        }
      };
      /**
       * polC.run - method
       * executes evoking or assembly in dependence of the number, the types
       * and the values of method's arguments.
       *
       * Variables used in context and their meaning:
       * act - action type parameter
       * fromFile - full path of json file of appScript project downloaded
       * pathTo - path of the folder wherein js-files extracted form fromFile
       *          will be stored to. (Could be assigned by user manually by
       *          setting polC.pathTo property)
       * prefixTo - part of pathTo path to which six random alphanumerical
       *            characters will be appended to get new pathTo value
       * pathFrom - path of folder being location of extracted files will being
       *            taken for assembly new project's json file modified
                    off-line
       * assFileName - name of resulting project's json file without .json
       *            extension specified by user if any. Optional parameter.
       *            If not set the name of resulting json-file is assigned 
       *            automatically following the rule described bellow or in
       *            methods' description
       * Arguments options:
       *     No Arguments - all arguments and parameters will have Default
       *         values. is used while testing
       *         call example: polC.run(); // (0)
       *
       * First argument's values vs meaning & functionality 
       * (act - action parameter):
       *     'e' - evoke
       *     'a' - assemble
       *     'o' - object properties as managing parameters
       *     'f' - same as 'o' but object will be get from json file locating into
       *           __dirname + sep +'params' folder; where sep is OS paths separator
       *     'ea' - 'e'voke and then 'a'ssemble (default) using in test run and
       *              at chaining processes like auto lint of js-files codes
       *     'eto' - evoking js-files extracted from fromFile and write them into
       *           pathTo path of folder specified by user
       *     'ato' - assembles project's data into specified json file
       *
       * Calling examples:
       * 'o' -
       *      call ex.: polC.run('o',options); // (1) or
       *                polC.run('',options);  // (2) or
       *                polC.run(options);     // (3)
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
       *           polC.run('f',paramsFileNamePart); // (4) or
       *           polC.run('',paramsFileNamePart);  // (5) or
       *           polC.run(paramsFileNamePart);     // (6)
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
       *      call ex.: polC.run('e',fromFile,prefixTo) (7)
       * 'eto'- evokes js-files from fromFile into user defined pathTo directory
       *        call ex.:
       *            polC.run('eto',fromFile,pathTo);  (8)
       *
       * 'a' - assembling final project's json file
       *       call samples:
       *       polC.run('a',fromFile,pathFrom,opt_assembleFileName); // (9) or
       *
       * 'ato' - assembling final project's json file specified. The final json-file
       *       and it's location are strictly determined by user
       *       call samples:
       *       polC.run('ato',fromFile,pathFrom,outputFile); // (10)
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
       * @param {string}opt_label - the label of project being handled
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
       * @param {string}opt_prefixTo (could have meaning of pathTo or pathFrom)
       * @param {string}opt_pathFrom
       * @param {string}opt_assFileName
       * @param {string}opt_outputFile

       */
      polC.run = function(opt_label,
                          opt_act,
                          opt_fromFile,
                          opt_prefixTo,
                          opt_pathFrom,
                          opt_assFileName,
                          opt_outputFile){
        console.log('run-method begins -----------------> \n');
        console.log('typeof opt_label =%s',typeof opt_label );
        var label = opt_label || polC.label;
        console.log('label has been assigned to %s',label) 
        var act,
            fromFile,
            options;  //  donor options object
        var sep = polC.sep;

        
        if(typeof label === 'object'){
          console.log('label has been identified as an object');
          options = label;  
        }else if( polC.hasParamsJson(label)){
          // single first argument as paramsFileName without 
          // ending '_params.json'
          // case (6)
          console.log('Data from params json file %s run Case identified',
              './params/' + label + '_params.json');
          options = require( './params/' + label + '_params.json');
          delete require.cache[
              require.resolve( './params/' + label + '_params.json')];   
        }else if( typeof opt_act === 'object' ){
          //  paramsObject case (1)
          options = opt_act;
        
        }else if( polC.hasParamsJson(opt_act)){
           var missActs=['e','ea','a'];
          if( opt_fromFile && !(missActs.indexOf(opt_act) < 0) ){
            // miss object setting
          }else{
            console.log('Data from params json file  run Case identified');
            options = require( './params/' + opt_act + '_params.json');
            delete require.cache[
                require.resolve( './params/' + opt_act + '_params.json')];
            console.log('oprions.label from file = '+ options.label);
            if(opt_fromFile){
              if(/\.json$/.test(opt_fromFile)){
                options.fromFile =  polO.absPath( opt_fromFile, polO );
              }
            }
          }
        }else if( label === 'o'){
          if( typeof opt_act === 'object'){
            options = opt_act;
            if(!options.label){
              console.log( 'label is not set inside options while action is \'o\'');
            }
          }else{
            throw 'options object is not set while act === \'o\'';
          }
        }else if( label === 'f'){
          if( polC.hasParamsJson(opt_act)){
              options = require( './params/' + opt_act + '_params.json');
              delete require.cache[
                  require.resolve( './params/' + opt_act + '_params.json')];
              if(!options.label){
                console.log('label parameter is not set inside params' +
                'file while \'f\' is at label sit');
              }
          }else{
            throw 'params file does not exist while there is \'f\' at label sit';
          }  
        }else if( !opt_act){
          if(typeof opt_fromFile === 'object'){
            // paramsObject as second argument case (2)
            options = opt_fromFile;
            if(label){
              options.label = options.label ? label + '_' + options.label : label;
            }
          }else if( polC.hasParamsJson(opt_fromFile)){
            // correct params-json-file exists (5)        
            options = require( './params/' + opt_fromFile + '_params.json');
            delete require.cache[
              require.resolve( './params/' + opt_fromFile + '_params.json')];
            if(label){
              options.label = options.label ? label + '_' + options.label : label;
            }
          }else{
            // possible scenarios 
            // - pass parameters though pol object's properties
            // - all default case or
            // - standard case with testing act
                   
            if( polC.fromFile ){
             /** calculating parameters are passed to run call through polC object
              *    pol.act, pol.fromFile, ...
              * The verification that this is the case presumes that
              * before any call of pol.run method
              * polC's parameters properties should have been reset by
              * polC.reset(polC) - method. After that reset user may wish to use
              * polC.run() call without parameters passing necessary
              * parameters through pol object preliminarily.
              * Different action parameter values demand different parameters sets:
              * act, label and fromFile - are set obligatorily for any nonDefault
              * runs.  label may be omitted but this is not recommended.
              * act may have default value 'e'/
              * So the presence of not empty pol.fromFile indicates 
              * that 'pol object is used to pass parameters to run method' Case.
              * Critical parameters for determined action:
              * act='e' : fromFile, prefixTo, pathTo. 
              * others could have default values
              * act = 'eto' : fromFile, pathTo
              * act = 'a' : fromFile, pathFrom, assFileName, outputFile
              * act = 'ato' : fromFile, pathFrom, assFileName, outputFile
              */
              if(label){
                polC.label = polC.label ? label + '_' + polC.label : label;
              }
              polC.work(polC.label,polC.act);          
              return;               
            }else if( !opt_fromFile ){
              // default act and fromFile case (0)
              options = {
                label: 'allDefaults',
                act: 'ea'
              };
            }else if( typeof opt_fromFile === 'string' &&
                      /\.json$/.test(opt_fromFile)){
              // conventional fromFile parameter with default action
              act = 'e';
            }else{
              throw 'fromFile is not json file or has bad name:\n' + 
                    opt_fromFile;
            }
          }
        }else if(opt_act === 'o'){
          if( typeof opt_fromFile !== 'object'){
            throw 'Something is wrong! Action parameter = \'o\' but\n'+
                'second argument of method pol is not an Object!';
          }
          //  paramsObject case (3)
          options = opt_fromFile;    
        }else if(opt_act === 'f'){
          if( polC.hasParamsJson(opt_fromFile)){
            // correct params-json-file exists (4)        
            options = require( './params/' + opt_fromFile + '_params.json');
            delete require.cache[
              require.resolve( './params/' + opt_fromFile + '_params.json')];
          }else{
            throw '\'f\' action parameter but absent or incorrect'+
                  ' params-json-file:\n'+ opt_fromFile;
          }
        }    
        if( typeof options === 'object'){
          console.log( 'options is an object');
          if(typeof(label) === 'string' && !polC.hasParamsJson(label)){
            console.log('init: options.label = %s label = %s',
                        options.label,label)
            options.label = options.label ? 
                ( label ? label + '_' + options.label : options.label ) : 
                label;
                
            label=options.label;            
            console.log('final: options.label = %s label = %s',
                options.label,label)
          }else{
            label = options.label;            
          }
          act = options.act;
          polC.setCalcParams ( polC,options);
          polC.work(label, act);
          return;
        }
        
        polC.act = opt_act;
        act = opt_act;
        fromFile = polC.absPath(opt_fromFile, polC)
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
          if( !fs.existsSync(fromFile) ){
            throw 'file '+fromFile+' does not exists on PC';
          }else{
            var ob;
            try {
              ob=JSON.parse( fs.readFileSync (fromFile) );
            }catch(e){
              console.log(e);
              console.log('Bad json-string in file fromFile =\n%s',
                          fromFile);
              throw 'Bad json-string in file fromFile =\n' + fromFile;
            }
            polC.fromFile = fromFile;
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
          fromFile: fromFile,
          prefixTo: (act === 'a' || act=== 'ato') ? 
                    '' :
                    (act === 'eto' ? '' : polC.absPath(opt_prefixTo, polC)),
          pathTo: (act === 'eto') ? 
                  polC.absPath(opt_prefixTo, polC) : 
                  polC.absPath(polC.pathTo, polC),
          pathFrom: (act === 'a' || act === 'ato' ) ?
                    polC.absPath(opt_prefixTo, polC) : 
                    polC.absPath(opt_pathFrom, polC),
          assFileName: opt_assFileName,
          outputFile: polC.absPath(opt_outputFile, polC),
          label: label
        };
        polC.setCalcParams ( polC,options);
        console.log('before work call \n' +
            'options object properties and equivalents polC.params:\n%s \n',
            (function(){
              var str='';
              for( var i in options){
                str+= 'opts.'+i +'='+options[i]+'\npolC.'+i+'='+ polC[i]+'\n';
              }
              return str;
            }()));
        polC.work(label,polC.act);
      };
      /**
       * resets renewable (using in calculation) calculating parameters' 
       * properties
       * of exporter object
       * @param {Object}exp exporter object
       */
      polC.reset = function(exp){
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
      };
      /**
       * launches pol-methods with different parameters values over
       * specified timeout period to exclude traffic jam
       * @param {string}label - the label or id of project being handled
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
      polC.runLauncher = function(opt_label,opt_t, opt_first, opt_second,    
          opt_third, opt_fourth, opt_fifth, opt_sixth, opt_seventh){
        var label = opt_label || 'absence of label is bad practice' ;
        if( opt_t &&
            (typeof opt_t !== 'number' )){
          throw 'being set first parameter should be a number of milliseconds';
        }
        var t= ( opt_t || opt_t === 0 )? opt_t : 10000 ;
        var a1 = opt_first || '';
        var a2 = opt_second || '';
        var a3 = opt_third || '';
        var a4 = opt_fourth || '';
        var a5 = opt_fifth || '';
        var a6 = opt_sixth || '';    
        var a7 = opt_seventh || '';    
        setTimeout( function(){
                    polC.reset(polC);
                    polC.label = label;
                    polC.run(label,a1,a2,a3,a4,a5,a6,a7);
                   },t);
      };
      /**
       * tests polC.run method
       * or presents the prototype of consecutive projects data handling
       * Each project determined by it's label or id. In the example bellow
       * this is a descriptive comment.
       */
      polC.workTest = function(){
        var o, pFN, label,
        tau = 2500;

        if(1){
          //  test (0)
          label = 'TEST all defaults Case (0)';
          console.log(label);
          polC.runLauncher(label,0)
        }
        if(1){
          // oooooooooooooooooooooooooo
          o = {
            act: '',
          };
          //  oooooooooooooooooooooooooo
          // test (1-0)
          label ='TEST all default parameters case (1)';
          console.log(label);
          polC.runLauncher( label,tau,'o',o);

          //  test (2-0)
          label ='TEST all default parameters case (2)';
          console.log(label);
          polC.runLauncher(  label, tau,'',o);

          // test (3-0)
          label = 'TEST all default parameters case (3)';
          console.log(label);
          polC.runLauncher( label,tau,o); //polC.run(o);
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
          polC.runLauncher( label,tau,'o',o); //polC.run('o',o);

          // test (2-e) fF - set pxT - default
          label = 'TEST (2-e) fF - set pxT - default';
          console.log(label);
          polC.runLauncher( label,tau,'',o); //polC.run('',o);

          // test (3-e) fF - set pxT - default
          label = 'TEST (3-e) fF - set pxT - default';
          console.log(label);
          polC.runLauncher( label,tau,o); //polC.run(o);
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
          polC.runLauncher( label,tau,'o',o);             //polC.run('o',o);

          // test (2-e) fF - set pxT - set
          label = 'TEST (2-e) fF - set pxT - set';
          console.log(label);
          polC.runLauncher( label,tau,'',o);              //polC.run('',o);

          // test (3-e) fF - set pxT - set
          label = 'TEST (3-e) fF - set pxT - set';
          console.log(label);
          polC.runLauncher( label,tau,o);                 // polC.run(o);
        }
      //------------------ f --------------


        if(1){
          // test (4-0 f->e)
          label = 'TEST all default parameters case (4-0 f->e)';
          console.log(label);
          polC.runLauncher( label,tau,'f','allDefaults'); //polC.run('f','allDefaults');

          //  test (5-0 f->e)
          label = 'TEST all default parameters case (5-0 f->e)';
          console.log(label);
          polC.runLauncher( label,tau,'','allDefaults');  //polC.run('','allDefaults');

          // test (6-0 f->e)
          label = 'TEST all default parameters case (6-0 f->e)';
          console.log(label);
          polC.runLauncher( label,tau,'allDefaults');    //polC.run('allDefaults');
        }
        if(1){
          //  test (4-e) fF - set pxT - default
          label = 'TEST fromFile is set and prefixTo - default (4- f->e)';
          console.log(label);
          polC.runLauncher( label,tau,'f','0'); //polC.run('f','0');

          // test (5-e) fF - set pxT - default
          label = 'TEST fromFile is set and prefixTo - default (5- f->e)';
          console.log(label);
          polC.runLauncher( label,tau,'','0'); //polC.run('','0');

          // test (6-e) fF - set pxT - default
          label = 'TEST-> fromFile is set and prefixTo - default (6- f->e)';
          console.log(label);
          polC.runLauncher( label,tau,'0'); //polC.run('0');
        }
        if(1){
          //  test (4-e) fF - set pxT - set
          label = 'TEST fromFile set and prefixTo set case (4- f->e)';
          console.log(label);
          polC.runLauncher( label,tau,'f','1'); //polC.run('f','1');

          // test (5-e) fF - set pxT - set
          label = 'TEST fromFile set and prefixTo set case (5- f->e)';
          console.log(label);
          polC.runLauncher( label,tau,'','1'); //polC.run('','1');

          // test (6-e) fF - set pxT - set
          label = 'TEST fromFile set and prefixTo set case (6- f->e)';
          console.log(label);
          polC.runLauncher( label,tau,'1'); //polC.run('1');
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
      polC.setEvents = function(myEE){
        myEE.on('toFolderReady',polC.evokeObjFromFile);
        myEE.on('assembleFileReady',polC.evokeObjFromAssFile);
        myEE.on('objReady',polC.evokeScriptsFromObj);
        myEE.on('preUploadAssembleFile',polC.preUploadFile);
        myEE.on('readyWriteOutputFile',polC.writeAssFile);
        myEE.on('endpoint-e',polC.eEndpoint);
        myEE.on('endpoint-a',polC.aEndpoint);
      }(polC.myEE);  //  or polC.setEvents(polC.myEE);
      
      /**
       * instantiates proj-offliner object
       * @param {string}label unique identifier of project run
       * @return {object} instance of porj-offliner object
       */
      polC.clone = function(label){
         return require('./polOClone.js').clone(label);
       };
      /** @property {string} __dirname */
      polC.dirname = __dirname;
      /** @property {string} __filename*/
      polC.filename = __filename;
      /**
   * makes path absolute if it's not yet
   * @param {string}pth - some path value
   * @param {object}pol - module's returning object
   * @return {string} absolute value of input path 
   */
  polC.absPath = function(pth,pol){
    if (!pth){return '';}
    return  path.isAbsolute(pth) ?
            pth : 
            path.join(pol.dirname,pth);
  };  
      return polC;
      
  };  