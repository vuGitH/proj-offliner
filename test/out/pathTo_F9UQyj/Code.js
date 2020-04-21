var modes = ['mail', 'wApp', 'preView', 'short', 'LSL', 'send', 'form'];
var mailBodyHtmlStr1; // html string used as html body in email
// --- URL of Web-app 
// url = "https://script.google.com/macros/s/" +
//       "AKfycbw1iBd-dytnWD2TyY_B6tSblxYz5GFJKdiHk8qNhkVdQ24MHgkN/exec"
var webAppUrl = ScriptApp.getService().getUrl();
var tZone = Session.getScriptTimeZone();
/**
 * Responds to GET request of client
 * @param {object} e - 
 *   https://developers.google.com/apps-script/guides/web#url_parameters
 * @return {HtmlOutput}
 */
function doGet(e) {
  try {
    var mode = (e) ? ((e.parameter.m) ? e.parameter.m : undefined) : undefined;
    Logger.log(mode);
    var html;
    switch (mode) {
      // --- MAIL ---
      case modes[0]: // mode='mail' mail filler and shower
        sendMailToMe(mode);
        break;
        // --- wAPP ---
      case modes[1]: // mode='wApp' control page. To choose what to do
        html = HtmlService.createHtmlOutput(
          "<!DOCTYPE html><html><head></head><body></body></html>");
        html.append(HtmlService.createHtmlOutputFromFile('jsPHeader').getContent());
        html.append(HtmlService.createHtmlOutput('<br><br>').getContent());
        html.append(HtmlService.createHtmlOutputFromFile('jsLib').getContent());
        html.append(HtmlService.createHtmlOutputFromFile('jsMailIn').getContent());
        return html.setSandboxMode(HtmlService.SandboxMode.IFRAME)
          //.setFaviconUrl(favUrl_LS)
          //.addMetaTag("descripiton","preliminary rendering of mail body")
          .setTitle("Test of using html in mailing");
        // --- PREVIEW ---
      case modes[2]: // mode='preView'
        /**
         * send prepared mail to me. Using GmailApp finds it in threads by unic subject
         * and presents it in the window to deside eidt or/and send
         */

        break;
        // --- SHORT ---
      case modes[3]: // mode='short' SMAILYC or SMAILIC or SMSlyc
        try {
          /*
          //folder 'eMailsMarkUp'
          var folder = DriveApp.getFolderById('0B9mOESHtO2LXcHcyNlp4SGdJakE');  
          var menuPanFile = folder.createFile('jsMenuPan.js',
                                HtmlService.createHtmlOutputFromFile('jsMenu')
                                    .getContent()
                                    .replace(/\<[\/]?script.*\>/gi,''),
                                 MimeType.HTML);
          Logger.log( menuPanFile.getUrl());
          return;
          */
          html = HtmlService.createHtmlOutput(
            "<!DOCTYPE html><html><head></head><body>");
          html.append(HtmlService.createHtmlOutputFromFile('jsLib')
            .getContent());
          html.append(HtmlService.createHtmlOutputFromFile('jsShort')
            .getContent());
          html.append(HtmlService.createHtmlOutput('</body></html>')
            .getContent());
          return html
            .setSandboxMode(HtmlService.SandboxMode.IFRAME);
        } catch (er) {
          Logger.log('Error:' + er.message + "  \n" + er.stack);
        }
        break;
        // --- DEFAULT ---
      default:
        // equivalent to mode='preView' preliminary or demonstration show of mail body
        mode = modes[2];
        html = HtmlService.createHtmlOutput('<!DOCTYPE html><html><head><base target="_blank"></head><body></body></html>');
        var header = HtmlService.createHtmlOutputFromFile('jsPHeader').getContent();
        html.append(header);

        var lib = HtmlService.createHtmlOutputFromFile('jsLib').getContent();
        html.append(lib);
        // mail body html string 
        var mBHtmlStr = HtmlService.createTemplateFromFile('mailBody');
        mBHtmlStr.mode = mode;
        mBHtmlStr = mBHtmlStr.evaluate().getContent();
        html.append(mBHtmlStr);

        return html
          .setSandboxMode(HtmlService.SandboxMode.IFRAME)
          .setTitle('mail preView and comparing with html')
        //.addMetaTag("descripiton","preliminary rendering of mail body")
        //.setFaviconUrl(favUrl_LS)
        ;
    }
    Logger.log('That\'s all');
  } catch (er) {
    Logger.log(er.message + '\n' + er.stack);
  } finally {}
}
/**
 * Sends test email to me
 * preliminary preparering html code using template file
 * @param {string} mode - parameter determining mode of processing while message is sending
 *                      and form of mail body for executing 'fromWebApp' or 'fromWebApp_noHtml'
 * @param {string} messageOpt - text of message 
 * @return {string} confirmation of sending contained timeStamp in format:'ddMMYY_HH:mm:ss'
 */
function sendMailToMe(mode, messageOpt, subjectOpt) {
  //-----------------------------------------------
  var message = messageOpt || 'Hi! This is a test to send Html inside e-mails.\nNice to meet you again and thank you for your help' +
    '\nBest regards!\nYuor sincere friend. :-)';
  var subject = subjectOpt || ' I like html in a mail ';

  var htmlMailBody = HtmlService.createTemplateFromFile('mailBody');
  htmlMailBody.mode = mode;
  var htmlMBody = htmlMailBody.evaluate().getContent();

  subject += ' ' + Utilities.formatDate(new Date(), tZone, "ddMMYY_HH:mm:ss");
  var to = "aquapowder@gmail.com";
  var bcc = "";
  var cc = "";
  var body = message;
  var aKLabelBlob = UrlFetchApp.fetch("https://googledrive.com/host/0B9mOESHtO2LXcC12ZnlpR0pQTzA/AquaPowderLable.jpg").getBlob(); //.getAs(MimeType.JPEG);
  var imagesObj = {
    aKLabel: aKLabelBlob
  };
  Logger.log(htmlMBody);

  var options = {
    bcc: bcc,
    cc: cc,
    from: to,
    htmlBody: htmlMBody,
    inlineImages: imagesObj,
    name: 'VUtest',
    noReply: false,
    replyTo: 'vladimir@uralov.com'
  };

  Logger.log('next to sendEmail. mode= %s, messageOpt=%s', mode, messageOpt);
  //mode='send';
  if (mode == 'send') {
    MailApp.sendEmail(to, subject, body, options);
  }
}
/**
 * Google Example of use schemas emailing
 */
function testSchemas() {
  //--------------------
  var htmlBody = HtmlService.createHtmlOutputFromFile('mail_template').getContent();

  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: 'Test Email markup - ' + Utilities.formatDate(new Date(), 'GMT+03:00', 'dd-MMMMM-YYYY_HH:mm:ss'),
    htmlBody: htmlBody
  });
}
/**
 * front entrance to webApp to chose What to do
 * or prepare and send Mail
 * or show preliminaty Layout of future Mail 
 * or something other
 */
function wAppControl() {
  // -------------------- 
}
/**
 * Handles request for menu block html
 * @param {string} mode specifies for wich mode menu was asked
 * @return {string html} html string defining menu block( could be script)
 */
function getMenu(mode) {
  Logger.log('inside getMenu mode=' + mode);
  var htmlCont, htmlContent;
  switch (mode) {
    case 'wApp':
      htmlContent = HtmlService.createTemplateFromFile('jsMenu').evaluate().getContent();
      htmlCont = htmlContent.replace(/<[\/]?script.*>/g, '');
      //  here Write to disc as js-script file and send id or scr link for library
      break;
    case 'short':
      htmlContent = HtmlService.createTemplateFromFile('jsMenu').evaluate().getContent();
      htmlCont = htmlContent.replace(/<[\/]?script.*>/g, '');
      break;
    default:
      htmlContent = HtmlService.createTemplateFromFile('jsMenu').evaluate().getContent();
      htmlCont = htmlContent.replace(/<[\/]?script.*>/g, '');
      //  here Write to disc as js-script file and send id or scr link for library
      break;
  }
  return htmlCont;
}

function testGetMenu() {
  var folder = DriveApp.getFolderById('0B9mOESHtO2LXcHcyNlp4SGdJakE'); //folder 'eMailsMarkUp'
  var f = folder.createFile('menuBl.js', getMenu('wApp'));
  var blob = f.getBlob().setContentType(MimeType.HTML);
  var f1 = folder.createFile(blob);
  var url = f1.getUrl();
  Logger.log(url);
}
/**
 * Receives request from server, gets menu constructor as string from file and sends to client
 * string contained js-codes to fill <script> tag
 * @return {string} code got from file on drive contained script code without <script> - </script> wrapper
 */
function sendJS() {
  Logger.log('request Got');
  var file = DriveApp.getFileById('0B9mOESHtO2LXWGVvYVB4RUxCeU0');
  return file.getAs(MimeType.HTML).getDataAsString();
}
/**
 * Returns user's e-mail
 * @param {string} forWhom - string determined which email is being asked.in case of 'me' means active user
 *                         in other cases it could be some key word to search for email address.
 * @return {strings[] emails} returns email and transfers it to client success handler of communication
 */
function getUserEMail(forWhom) {
  if (forWhom === 'me') {
    var emails = [Session.getActiveUser().getEmail()];
    //emails.push(Session.getActiveUser().getEmail());
    var aliases = GmailApp.getAliases();
    emails = emails.concat(aliases);
    return emails;
  }
}

function testShort() {
  doGet({
    parameter: {
      m: 'short'
    }
  });
}