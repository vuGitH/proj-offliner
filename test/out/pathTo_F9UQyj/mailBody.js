<?
var htmlTop = (mode === undefined || mode === ""|| mode==='mail') ? 
              "<!DOCTYPE html><html><head></head><body>" : "";

var siteUrl = 'https://sites.google.com/site/aquapowdersatinskin/application';
var mailBodyHtmlStr = "<div id='imgPan'>" +
                      "<a href='" + siteUrl + "' target='_blank'>";

var imgLableForPage = "<img src='" +
                      "https://googledrive.com/host/" +
                      "0B9mOESHtO2LXcC12ZnlpR0pQTzA/AquaPowderLable.jpg'" +
                      "" height='30' />";
var imgLableForMail="<img src='cid:aKLabel' style='max-height:30px;' />";

if( mode=='mail'){
  mailBodyHtmlStr+=imgLableForMail;
}else{
  mailBodyHtmlStr+=imgLableForPage;    
}
var styleStrDivPost = "width:300px;height:100px;background-color:#EA8D2C;" +
    "margin:30px auto;padding:10px;" +
    "text-align:center;font-size:26px;color:#fff;font-family:Open Sans;" +
    "line-height: 82px;border-radius:17px;box-shadow:0px 4px 20px #888;";

mailBodyHtmlStr+="</a></div>"
          +"<div id='header' class='header' style='" +
            "margin-left:54px;color:hsl(182,48%,43%);" +
            "font-family:fantasy;font-size:25px;font-weight:normal;" +
            "'>MAILING WITH HTML</div>"
          +"<div id='post' style='" + styleStrDivPost + 
          "'>I am Html Text in Div</div><br>";
 var htmlScript = "" +
          "<script>" +
            "var c=document.createElement('DIV');" +
            "c.id='info';c.setAttribute('style','" + styleStrDivPost+"');" +
            "var post=document.getElementById('post');" +
            "var next = (post.nextElementSibling) ? " +
            "post.nextElementSibling : undefined;" +
            "if( next ){" +
              "document.body.insertBefore(c,next);" +
            "}else{" +
            "  post.getParentElement.appendChild(c);" +
            "}" +
           "c.innerHTML='I am Html in Div from script';" +
           "</script>";
 var htmlBottom="</body></html>";
 var style_MainPan = "" +
     "width:70%;margin:5px auto;margin-bottom:40px;padding-left:40px;" +
     "padding-right:40px;padding-top:0px;padding-bottom:20px;" +
     "border:solid 4px hsl(182,35%,62%);border-radius:30px;" +
     "box-shadow:0px 6px 30px 3px hsl(0,0%,80%);max-width:670px;",
     style_span = "" +
     "display:block;width:50px;margin-right:50px;float:right;font-size:25;" +
     "font-family:'Roboto',Open Sans,Arial,sans-serif;" +
     "color:#888;position:relative;top:20px;",
     style_mLablePad = "position:relative;margin-left:20px;margin-top:20px;" +
                       "margin-bottom:30px";

 
 var li1 = "Волосы растут из головы. Точнее,- из кожи головы. " +
           "</b>Все процессы образования волос их питания и т.д. происходят " +
           "в клетках кожи (волосяных фолликулах, сальных железах и т.п.)",

     li2 = "Поэтому процедуры с АК </b>(Аквапудра '"'Атласная Кожа'"')<b> " +
            "направлены на кожу головы </b>и, соответственно, наносится " +
            "препарат <u>на кожу</u>.&nbsp;",

     prg1 = "от \"одного края\" в сторону \"другого\" (слева на право) " +
            "с каким-то шагом в предварительно смоченных волосах делаются " +
            "( например, как при покраске корней волос) продольные &nbsp;" +
            "\"проборы\"&nbsp;",

     prg2 = "[продольные в том смысле, что если направление \"слева-направо\"" +
            " - <u>попереченое</u>(от одного уха до другого), то направление " +
            "\"спереди-назад\" (от носа или лба к затылку) - <u>продольное</u> ]",

     prg3 = "и в межрядье волос на кожу наносится кашица смоченной водой " +
            "аквапудры, приминается и с небольшим нажатием растирается " +
            "вокруг нанесенного места. Так вдоль всего пробора &nbsp;и " +
            "один пробор за другим.",
     prg4 = "здесь - описание препарата и применения, которые можно " +
            "прочитать, скачать и распечатать:",
     
     prg5 = "[&nbsp;Но, никакого фанатизма, если есть сомнения или что-то " +
            "не нравится, можно и бросить. В любом случае, память и " +
            "состояние волос в дальнейшем подскажут и покажут, " +
            "есть ли эффект и было ли полезное действие.]",

     prg6 = "",
     
     li3 = "<b>Все косметические препараты индивидуальны</b>" +
          "( да и лекарства)<b>, т.е. надо пробовать и смотреть " +
          "на результат, слушать себя, свой организм.</b>",
     
     li4 = "Чтобы не показалось<b>, вред при использовании АК " +
           "исключен. Проверено временем, "на людях".</b>",
     
     li5 = "<b>Первые несколько процедур уже позволят почувствовать, " +
           "есть ли какое-то действие.</b>С учетом предыдущего пункта," +
           "<b> \"курс\" </b>(10 процедур)<b>, </b>если речь идет о том, " +
           "что хочется что-то \"сдвинуть\", изменить в состоянии волос," +
           "<b> надо выдержать до конца</b>&nbsp;&nbsp;",
     li6 = "Всякая внешняя процедура - подспорье для восстановления " +
           "нарушенного равновесия. Глобальные факторы - сон, питание, " +
           "свежий воздух и физическая активность.",
           
     href1 = "https://goo.gl/2zeSEP",
     href2 = "https://goo.gl/1FOIZn",
     href3 = "https://sites.google.com/site/aquapowdersatinskin/application",
     myEmail = "aquapowder@gmail.com",
     href4 = "mailto:" + myEmail;


?>
<?if (mode === 'mail'){
     Logger.log(' inside mailBody mode = mail');
     var html = htmlTop + mailBodyHtmlStr + htmlBottom;?>
   <?!=html?>
<?}else if( mode === "wApp"){ 
      // wApp control panel mode
      Logger.log(' inside mailBody mode=wApp');
                                ?>
   <?!=htmlTop + html1?>
<?}else{
      Logger.log(' inside mailBody mode= '+mode);
       var ht = mailBodyHtmlStr+htmlScript;?>
   <?!=ht?>
<div id='preMenuPan'></div>
<div id='beep'></div>

<div id='mailPan' style=<?!=style_mainPan?>>
  <br><span style = <?!=style_span?> >Пример:</span><br>
  
  <div id='mLablePad' style = <?!=style_mLablePad?> >
    <?!=imgLableForPage?>
  </div>
  
  <div id='mBodyPan' style='font-family:Roboto,Arial,sans-serif'>
    <div dir="ltr">Катя привет!<br>
      <div>На всякий случай несколько замечаний:</div>
      <br>
      <div class="heu180" style="color:#0d9c9c">
        <ul>
          <li><b><?!=li1?></li>
          <li><b><?!=li2?></li>
        </ul>
        <div class="heu330" style="color:#d0257a">
          <div>Технически это может выглядеть так:</div>
          <div><!=prg1?><br></div>
          <blockquote style="margin:0px 0px 0px 40px;border:none;padding:0px">
            <blockquote style="margin:0px 0px 0px 40px;border:none;padding:0px">
              <div>
                <div><?!=prg2?></div>
              </div>
            </blockquote>
          </blockquote>
          <div>
            <br>
            <div><?!=prg3?></div>
          </div>
          <br>
          <br>
          <div><?!=prg4?></div>
          <blockquote style="margin:0 0 0 40px;border:none;padding:0px">
            <blockquote style="margin:0 0 0 40px;border:none;padding:0px">
              <div>
                <div><a href=<?!=href1?> target="_blank"><?!=href1?></a> &nbsp;цв.</div>
              </div>
            </blockquote>
            <blockquote style="margin:0 0 0 40px;border:none;padding:0px">
              <div>
                <div><a href=<?!=href2?> target="_blank">
                  <?!=href2?></a> &nbsp;ч/б</div>
              </div>
            </blockquote>
          </blockquote>
          <br>
          <div>здесь - &nbsp;можно прочитать 
            <a href=<?!=href3?> target="_blank" target="_blank">online</a>:</div>
          <blockquote style="margin:0 0 0 40px;border:none;padding:0px">
            <blockquote style="margin:0 0 0 40px;border:none;padding:0px">
             <div><a href=<?!=href3?> target="_blank" target="_blank">
               <?!=href3?></a></div>
            </blockquote>
          </blockquote>
        </div>
        <br>
        <div>
          <ul>
            <li><?!=li3?></li>
          </ul>
          <div>но</div>
        </div>
        <div>
          <ul>
            <li style="color: #0D9C9C;"><?!=li4?></li>
            <li style="color: #0D9C9C;"><?!=li5?></li>
          </ul>
        </div>
        <blockquote style="margin:0px 0px 0px 40px;border:none;padding:0px">
          <blockquote style="margin:0px 0px 0px 40px;border:none;padding:0px">
            <div><?!=prg5?></div>
          </blockquote>
        </blockquote>
        <ul>
          <li style="color: #0D9C9C;"><?!=li6?></li>
        </ul>
        <blockquote style="margin:0px 0px 0px 40px;border:none;padding:0px">
          <blockquote style="margin:0px 0px 0px 40px;border:none;padding:0px">
            <div>Остальное по инструкции. Вопросы - <a href=<?!=href4?> target="_blank">
              <?!=myEmail?></a></div>
            <br>
          </blockquote>
        </blockquote>
      </div>
      <div>Успехов!<br>В.У.<br><br></div>
    </div>
  </div>
</div>  
<div id="sFrameDiv" class="sFrame_AK">
    <iframe id='sFrame_AK' name='sFrame_AK' src='' class='sFrame_AK'>iframe does not supported</iframe>
</div>
<?!=include('jsMailBody');?>
<?!=include('cssMail');?>
<?!=htmlBottom?>
<?Logger.log('in the bottom htmlBottom='+htmlBottom);
}?>