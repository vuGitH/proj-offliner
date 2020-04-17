var o={

};
function testFileType(){

var url='https://drive.google.com/open?id=0B9mOESHtO2LXdy1yS3FIbFY4LXM';
var id=url.split('id=')[1];
var file=DriveApp.getFileById(id);
var mimeT=file.getMimeType();
var blob=file.getBlob();
var content=blob.getDataAsString();
var f=DriveApp.createFile('menuPan.js', content,MimeType.PLAIN_TEXT);
Logger.log(f.getUrl());
Logger.log(content);

Logger.log(mimeT);

}
var test={};
test.url=ScriptApp.getService().getUrl();
test.url="http://www.grani.ru";
test.url="http://www.ej.ru";
/**
 * Tests different manner of reading current file
 * a) UrlFetchUp
 * b) DriveApp.getFileByName
 * c) DriveApp.getFilesByType(mimeType)
 * write back into Drive as plain text to watch;
 */
 function t(){
 var folder=DriveApp.getFolderById('0B9mOESHtO2LXcHcyNlp4SGdJakE');   //My Drive/Work/Aquapowder/eMailsMarkUp
 var response=UrlFetchApp.fetch(test.url);
 var txtRep='';
 var headers=response.getAllHeaders();
 var time=new Date();
 Logger.log('Response Headers:');
 txtRep+='response Headers:\n';
 for(var key in headers){
   txtRep+=key+'  :  '+headers[key]+'\n';
   Logger.log(key+'  :  '+headers[key]);
 }
 var domain=test.url;
 var response=UrlFetchApp.fetch(domain).getContentText('windows-1251');
response.replace(/href\=\"\//gi,'href="'+domain+'/').replace(/src\=\"\//gi,'src="'+domain+'/');
 
 txtRep+='\n'+response+'\n';
 //txtRep+='\n'+response.getContentText('windows-1251')+'\n';
 var rep=folder.createFile("testReport_"+Utilities.formatDate(time,tZone,'ddMMYY_HH:mm:ss'), txtRep, MimeType.PLAIN_TEXT);
 }
 