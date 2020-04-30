/**
 * @fileoverview
 * module script <pol> determined in package.json property <scripts>
 * Executes evocation or assembly in dependence of the values
 * of action parameters: 'e' - evoke (default) or 'a' - assemble ;
 * The call of this script module is carried out by npm run commands
 * presuming running command line while in module hosting directory as
 * current working one
 *
 * General command format is:
 *
 *      npm run pol arg2 arg3 arg4 arg5     (*)
 *
 * particular examples:
 *
 *      0 -   npm run pol                                         (0)
 *      1 -   npm run pol e                                       (1)
 *      2 -   npm run pol ea                                      (2)
 *      3 -   npm run pol a                                       (3)
 *      4 -   npm run pol e fromFile prefixTo                     (4)
 *      5 -   npm run pol a fromFile pathFrom                     (5)
 *      6 -   npm run pol a fromFile pathFrom assemblyFileName    (6)
 *      7 -   npm run pol a fromFile pathFrom outputFile          (7)

 *      8 -   npm run pol parsFNm                                 (8) fed by
 *                                                      parameters json-file
 *
 * See explanations of each example type bellow.
 * Arguments are optional and have different meaning depending on arg2
 * action parameter
 * Testing runs with defaults args values.

 *    npm run pol                            (0)    the same as (2)
 *
 *    npm run pol e                          (1)
 *
 * are equivalent to npm run e fromFile prefixTo , where
 *
 *    arg2 = 'e' ;   - action is evoking ( or extracting) js-files from object
 *                     parsed from json-file of previously downloaded
 *                     appScript project's file (.json)
 *
 *    arg3 = fromFile = '.\\test\\testProjFile.json' ;  // paths relative to main
 *                                                      // proj-offliner package directory
 *           fromFile - it is determined in case (4) bellow
 *
 *    arg4 = prefixTo = '.\\test\\out\\pathTo_';
 *
 *
 *    npm run pol ea                         (2)
 *
 * This is default test command for extracting data an then assemble
 * new json file modified immediately, equivalent to command
 * npm run ea fromFile prefixTo pathFrom , where
 *    arg2 = 'ea'
 *    arg5 = pathFrom = '.\\test\\pathFrom'
 *
 *    npm run pol a                           (3)
 *
 * assembly run equivalent to (*) with default arguments values, where
 *    arg2 = 'a'
 *    arg3 =  '.\\test\\testProjFile.json';
 *    arg4 =  '.\\test\\out\\pathFrom'
 *
 *    npm run pol e fromFile prefixTo         (4)
 *
 * where
 * fromFile - original json file handled( possible appScript project file downloaded)
*      in format of string "disk:\\path\\to\\the\\fileName.json"
 * prefixTo -
 *     as string 'disk:\\path\\to\\the\\dirNamePrefix_'
 * as a result of execution data will be extracted and js-files will be saved into
 * the folder 'disk:\\path\\to\\the\\dirNamePrefix_XXXXXX' , where XXXXXX are six
 * random alpha numerical characters.
 *

 *     npm run pol a fromFile pathFrom          (5)
 *
 *     npm run pol a fromFile pathFrom assembleFileName     (6)
 *
 *     npm run pol a fromFile pathFrom outputFile           (7)
 *
 *
 * argvN parameters mentioned above could be read from json parameters
 * file whose name without extension could be indicated in the shell command
 * as parsFNm argument
 *
 *     npm run pol parsFNm                                 (8)
 *
 * The file should reside '.\\params' folder and has json string
 * as content which will be parsed by JSON API into
 *     obj = JSON.parse(fileContentJsonString)
 * with appropriate properties named as parameters' variables
 * obj = {
 *   act:"..",
 *   fromFile:'...',
 *   prefixTo:'...',
 *   pathTo:'...',
 *   pathFrom:'...',
 *   assFileName:'...',
 *   outputFile:'...',
 *   label:'...'
 * };
 * the file name should be terminated by string '_params.json'
 * for example if we have parameters file named 'someParameters_params.json',
 * full path of which is '.\\params\\someParameters_params.json' , the appropriate
 * command is looked like
 *
 * npm run pol someParameters
 *
 *
 * Default value of action parameter is  'e' (evoke)
 */
 /**
 * @description of How to determine fourth argument ( with index 3)
 * fromFile - is params.json file - file in which calculating parameters are
 * values of appropriate properties.
 * Criteria:
 * a) last part of json-file name is _params
 * b) file with such name is contained in the folder ./params
 * c) depending on the e or a -mode it's possible additionally
 * to control presence of prefixTo or pathFrom being set
 *
 * Such criteria permit to create not only input params json-file
 * but output as well automatically after evoke
 * procedure and to store it in the ./params folder. The name of such file
 * could be (should be) fromFileName_N_params.json were fromFileName is
 * path.baseName(fromFile,'json') file name without extension and
 * _N_ is the ordering number of file's version assigned automatically as
 * well.
 */

var path = require('path');
var fs = require('fs');

console.log('Hello! The pol.js is executing.\n' +
            'Run begins\n'+
            'current working directory:%s',process.cwd());

var pol = require('./proj-offliner.js');

var params,
    paramsFile,
    act,
    label;

if( process.argv.length === 3) {
  paramsFile = pol.hasParamsJson( process.argv[2] );
  if( paramsFile ){

    console.log('argv[2] = ' + process.argv[2]);
    console.log( 'arg of require ='+'./params/' + process.argv[2] +
                 '_params.json');
    params = require( './params/' + process.argv[2] + '_params.json');
    console.log( params );
    label = params.label ? params.label :
             'Test run as \'npm run pol ...\' command';
    pol.run( label, process.argv[2]);
    return;
  }else{
    // test depending on act parameter
    act = process.argv[2] || 'ea' ;
    pol.act = act;
    pol.fromFile = __dirname + '\\test\\testProjFile.json';
    if( act === 'e' || act === 'ea'){
      pol.prefixTo = __dirname + '\\test\\out\\pathTo_';
    }else if( act === 'a'){
      pol.pathFrom  = __dirname + '\\test\\out\\pathFrom';
    }else if( act !=='ea' ){
      console.log('argv[2] is not parames file name and not \'ea\'.' +
          ' Error could has place.');
    }else{
      pol.fromFile = __dirname + '\\test\\testProjFile.json';
    }
  }
}else if(process.argv.length === 2){
  act = 'ea' ;
  pol.act = act;
  pol.fromFile = __dirname + '\\test\\testProjFile.json';
  pol.prefixTo = __dirname + '\\test\\out\\pathTo_';
}else{
  // argv.length > 3
  act = process.argv[2] || 'e';
  pol.act = act;
  pol.fromFile = process.argv[3] || __dirname + '\\test\\testProjFile.json';
  if( act === 'e' || act === 'ea' || act === 'erf' ){
    //  evokes
    // output directory prefix
    pol.prefixTo = process.argv[4] || '';
  }else if( act === 'a'){
    //  assembles
      pol.pathFrom = process.argv[4] || __dirname + '\\test\\out\\pathFrom';
      /**
       * @description
       * process.argv[5] could be
       * or a part of file name without '.json' of resulted json file
       * or full path of output file including file name and extension
       */
      if(process.argv[5]){
        if(!/\.json$/.test(process.argv[5])){
          pol.assFileName = process.argv[5];
        }else{
          pol.outputFile = process.argv[5];
        }
      }
  }else{
    console.log('action parameter is not set.  ea  is using.');
    pol.act = 'ea';
    act = 'ea';
    pol.prefixTo = process.argv[4] || __dirname + '\\test\\out\\pathTo_';
  }
}
pol.run('Test run as \'npm run pol ...\' command',
        act,
        pol.fromFile,
        pol.prefixTo,
        pol.pathFrom,
        pol.assFileName,
        pol.outputFile);