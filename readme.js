// Versions evolution
/**  
 * v1.3.1 vs v1.3.0 hanged made in reamdme.md file and common 
 * beautification of other files using VS Code
 * v1.3.0 vs. v1.2.0
 * v1.3.0 new features and modifications in comparison with v1.2.0
 * 1. new directory structure is used:
 * To simplify deletion of files at debugging two directory for 
 * output data( directories and files ) has been introduced
 * __dirname + '\\test\\data'  - directory where newly created 
 *     by module calculation procedure pathTo folders will be stored
 * and
 * __dirname + '\\params\\out - directory where new  params
 *     json files created by procedure will be stored
 * 2. 'e+a' mode mark has been exchanged by 'ea'
 * 3. for console commands npm run pol the algorithm of reading params file
 *     name has been changed. Now params file name part without '_params.json' 
 *    is served by third argument process.argv[2] but not by process.argv[3]
 *    as it took place in previous versions.
 *    This change makes consistent with <npm run pol e>, or <npm run pol a>,
 *    or <npm run pol ea> command by presence of appropriate params files in
 *    ./prams folder: e_params.json , ea_params.jso, a_params.json
 * 4. Excluding mixing of output folders( like pathTo) with existing content
 *    of folder ./test special output data folder '.\\test\\out' is created: 
 *    Therefore default or test prefixTo value will be '.\\test\\out\\pathTo_'.
 *    Assembly test with default data will create new json file modified into 
 *    .\\test\\out\\pathFrom folder naming it as testProjFile_modified.json,
 *    i.e. the appropriate outputFile parameter for assembly test run will be
 *    pol.outputFile = '.\\test\\out\\pathFrom\\testProjFile_modified_N.json
 *    wehere _N is files version number.
 *
 */

/**  
 * v1.2.0 vs. v1.1.0
 * v1.2.0 new features and modifications in comparison with v1.1.0
 * 1. label parameter as unique parameter of project handled is introduced
 * and use as first separate parameter of pol-method and other methods.
 * In previous versions an attempt has been maid to transfer this parameter
 * as a property of exports object, but here such transfer is fulfilled 
 * through appropriate methods' argument
 *
 */
/** v1.1.0 new features and modifications in comparison with v1.0.3
 * 1.Package script 'test' and 'pol' have been done and registered in
 * package.json scripts property
 * who may be run by means of commands:
 * npm test [<e/a/ea>] [<fromFile>] [<prefixTo/pathFrom>] [<assFileName>]
 * npm run pol [<e/a>] [<fromFile>] [<prefixTo/pathFrom>] [<assFileName>]
 * 2. additional content added to readme.md and readme.js
 * 3. Argument opt_back has been excluded in some function and another
 * algorithm of exports.sep property calculation chosen. Taking into account
 * that back parameter was intermediary and wasn't used in valuable
 * this change may not be considered like something which destroys consistency
 * between package versions the major version number has not changed.
 * 4. readme part has been separated in separate module readme.js
 * and could be imported using require('./readme.js') now
 *
 */

/** v1.0.3 modification in comparison with v1.0.2
 * 1. 'endpoint-e' and 'endpoint-a' events have been inserted for
 * e-mode (evoke mode) and a-mode  (assemble mode)
 * 2. separate functions have been included in exports object as methods
 * excluding those being events listeners.
 * 3. package scripts 'test' 
 * 4. additional content added to readme.md and readme.js
 */

/** v1.0.2 modification from version 1.0.1 are
 * 1. description of usage added
 * 2. added separateFileNameFromPath utility
 * 3. adds functionality for different usage optional
 * 4. prefixOTo is now optional. If it is not set
 *   downloadedJsonFile path is used and inside host directory of this file
 *   new folder is created using jsonFileName_ as prefix in front of last
 *   six random character adding.
 * 5. assembleProjFile has been created - the option to assemble edited
 *   js files into new json file ready for uploading into assScript project.
 */

/** modification in version 1.0.0
 * 1. tries to use 'local' global variables fs
 */
/**
 * 2. inserts methods and properties to input and store input parameters
 */

/**
 * 3. separates procedure on two steps
 *   prepare object ( presuming options:
 *	- or json - object request and respond
 * - or manual setting exports.fromFile )
 */
//  -----  READ ME ------ 
/**
 * Why?
 * Sometime it's necessary or convenient  to edit or modify Google appScript
 * project files off - line. While downloaded project file is a json file
 * containing full info regarding project's files substructure their names
 * and sources contents.
 * This module permits to get jsonFileDownloaded and to convert them in
 * separate js-files named file[i].name with '.js' extensions.
 * Module creates temporary folder and populates it by newly extracted
 * js-files.
 * Usage:
 * to install proj-offliner globally:
 * npm install  - g proj-offliner
 *
 * to install for specified project go in project root directory and
 * npm install - - save proj-offliner
 *
 * to invoke package inside script:
 * and to extract appScript project's js files from downloaded json - file
 * use :
 * Option 1.
 * @expamle
 * var pol = require('proj-offliner') ||
 *             require('./proj-offliner.js');
 *
 * pol.evokeJsFiles(fromFile,opt_pathToPrefix, opt_mode);
 *
 *
 * where parameters are
 * {string}fromFile - full path to downloaded json-file including
 *     file name
 * {string}pathToPrefix - prefix of path to temporary directory where to
 *     store js-files. Six random character will be added to this prefix to
 *     set full directory name. Optional. If this prefix is not set the
 *     module use path to downloaded file and fileName+'_files' as prefix
 * {string}mode - parameter specifying extraction procedure details. Don't
 *     use it.
 *
 * Option 2.
 * @example
 *
 * var pol = require('proj-offliner');
 * pol.fromFile= fromFile;
 * pol.prefixTo = opt_pathToPrefix;  //optional
 *
 * pol.evokeJsFiles();
 *
 * Option 3.
 * In the case you prefer to place js-files in specified directory
 * ( whose name doesn't contain 6 random characters at the end) the
 * usage is as follows:
 * @example
 *
 * const pol = require('proj-offliner');
 * pol.fromFile = fromFile; // {string}
 * pol.pathTo= pathToSpecified;  // {string}
 * pol.no6 = true;
 *
 * pol.evokeJsFiles();
 *
 */
/** 
 * @property {string} exports.readMe content of description
 */
exports.readMe = "\n\n" +
  '\n\'nproj-offliner\' - Package.\n\n' +
  'Why?\n' +
  '\n' +
  'Sometime It\'s necessary or convenient  to edit or modify Google \n' +
  'appScript project files off - line. While downloaded project file is a \n' +
  'json file containing full info regarding project\'s files substructure \n' +
  ', their names and sources contents.\n' +
  'This `proj-offliner` module permits to get jsonFileDownloaded and to\n' +
  'convert it into separate js-files named file[i].name with \'.js\'\n' +
  'extensions. Where file[i] means i-th file in a set of files forming\n' +
  'appScript\'s project.\n' +
  '\n' +
  'Module creates temporary folder and populates it by newly extracted\n' +
  'js-files or could extract resulted files into specified directory.\n' +
  '\n' +
  'Usage:\n' +
  'To install `proj-offliner` globally:\n' +
  '\n' +
  'npm install  - g proj-offliner\n' +
  '\n' +
  'To install for specified project go in project root directory and\n' +
  'execute command:\n' +
  'npm install --save-Prod proj-offliner\n' +
  '\n' +
  'To invoke package inside your module and to extract appScript project\'s\n' +
  'files as js files from downloaded json - file use :\n' +
  'Option 1.\n' +
  '\n' +
  '    var pol = require("proj-offliner") || \n' +
  '    require("./proj-offliner.js");\n' +
  '    pol.evokeJsFiles(fromFile,opt_pathToPrefix, opt_mode);\n' +
  '\n' +
  'where parameters are\n' +
  '{string} fromFile  -  full path to json file downloaded\n' +
  '    (including file name)\n' +
  '{st1ring} pathToPrefix - prefix of path to temporary directory where to\n' +
  '    store js-files. Six random character will be added \n' +
  '    to this prefix to set full directory name. \n' +
  '    Optional. If this prefix is not set the module use path to downloaded\n' +
  '    file and fileName + "_files" as prefix\n' +
  '{string} mode - parameter specifying extraction procedure details. Don\'t\n' + '    use it.\n' +
  '\n' +
  'Option 2.\n' +
  '\n' +
  '    var pol = require("proj-offliner");\n' +
  '    pol.fromFile= fromFile;\n' +
  '    pol.prefixTo = opt_pathToPrefix;  //optional\n' +
  '    pol.evokeJsFiles();\n' +
  '\n' +
  'Option 3.\n' +
  'In the case you prefer to place js-files in specified directory\n' +
  '( whose name doesn\'t contain 6 random characters at the end) the\n' +
  'usage is as follows:\n' +
  '\n' +
  '\n' +
  '    const pol = require("proj-offliner");\n' +
  '    pol.fromFile = fromFile; // {string}\n' +
  '    pol.pathTo= pathToSpecified;  // {string}\n' +
  '    pol.no6 = true;\n' +
  '    pol.evokeJsFiles();\n' +
  ' \n' +
  '\n' +
  'While edited and modified finally you could prefer to assemble resulting\n' +
  ' appScript project file for uploading it to your project.\n' +
  '\n' +
  'Assemble results\n' +
  'Assemble files modified into json file for uploading it to your\n' +
  ' Google project.\n' +
  '\n' +
  '\n' +
  '    pol.assembleProjFile(\n' +
  '        originalJsonFileDownloaded,opt_pathFrom,opt_assFileName);\n' +
  '\n' +
  'Returns json string being the content of json file prepared for\n' +
  'uploading and writes new file named\n' +
  ' originalJsonFileDownloaded + "_modified.json" to opt_pathFrom\n' +
  'directory.\n' +
  'and writes new file naming it as\n' +
  'opt_assFileName if it\'s set or as\n' +
  'originalJsonFileDownloaded + "_modified.json" to opt_pathFrom\n' +
  'directory. ( opt_assFileName, opt_pathFrom etc. here are presumed\n' +
  'as stringvariable.)\n\n' +
  'Parameters of method .assembleProjFile could be set "externally"\n' +
  '    pol.fromFile = originalJsonFileDownloaded;\n' +
  '    pol.pathFrom = opt_pathFrom;\n' +
  '    pol.assFileName = opt_assFileName;\n' +
  '    pol.assembleProjFile();\n' +
  '';
exports.readme = function () {
  console.log(exports.readMe);
  return exports.readMe;
};