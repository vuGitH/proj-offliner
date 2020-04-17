/**
 * Includes html content from file
 * @param {String}fileName - name of file (without extention) written and attached to this project with html coldes,
 * @return {String} html content string
 */
function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
/**
 * creates string with html codes from template file attached to this project
 * @param {string} filename - name of html template file written and attached to this project
 */
function includeTempl(filename) {
  var templ=HtmlService.createTemplateFromFile(filename);
  // transfered properties
  templ.webAppUrl=ScriptApp.getService().getUrl();
  return templ.evaluate().getContent();
}
/**
 * Gets html output content and writes it as html file into 
 * directory were this execution file is located
 * @param{string}htmlStr - html output content
 * @param{string}htmlFileName - file names
 * @param{string}folderId - id of folder where is to be saved file
 */
function writeHtmlCodes(htmlStr,htmlFileName,folderIdOpt){
  var time=new Date();
  var tMark=Utilities.formatDate(time, tZone,'_ddMMYY_HHmmss');
  var scriptUrl=ScriptApp.getService().getUrl();
  var scriptName='LS_emailSample';
  var scriptFiles=DriveApp.getFilesByName(scriptName);
  var scriptF=scriptFiles.next();
  var folderId=folderIdOpt||scriptF.getParents().next().getId();
  
  var folder=DriveApp.getFolderById(folderId);
  var nameParts=htmlFileName.split('.');
  var ext=nameParts[nameParts.length-1];
  for( var i=0;i<nameParts.length;i++){
  Logger.log(nameParts[i]);
  }
  var re=new RegExp('[.]'+ext);
  var newFileName=htmlFileName.replace(new RegExp('[.]'+ext),'')+tMark+'.'+ext;
  var file=folder.createFile(newFileName, htmlStr,MimeType.HTML);
  var fileUrl=file.getUrl();
  
}