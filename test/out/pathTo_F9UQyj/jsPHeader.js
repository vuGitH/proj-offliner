<script id="body_scrpt0">

var d=window.document;
var b=d.body;

/** 
 * assembles page header consisted of
 * logo image + h2 + search form
 * @return {obect DOM element} div element 
 */
function getHeader(){
  // specific style
  var hStl=d.createElement('STYLE');
  var head=d.head;
      head.appendChild(hStl);
      hStl.id='head_Stl'+parseInt( d.getElementsByTagName('STYLE').length-1);
  var hStlStr=".bold{font-weight:bold;}.red{color:#339cff;text-shadow:4px 4px 4px #ccc;}";
  var thStl=d.createTextNode(hStlStr);
      hStl.appendChild(thStl);
      
  var hPan=d.createElement('DIV');
      hPan.id='hPan';
      hPan.setAttribute('class','hPan');
      hPan.style.width="100%";
      
      var hAHead=d.createElement('A');
          hAHead.id="hAHead";
          hAHead.setAttribute('href','https://sites.google.com/site/aquapowdersatinskin/');   // link to site
          hAHead.style.textDecoration="none";

              var hDivImg=d.createElement('DIV');
              hDivImg.id='hDivImg';
              hDivImg.setAttribute('class','hDivImg');
                var imgSrc="https://googledrive.com/host/0B9mOESHtO2LXcC12ZnlpR0pQTzA/AquaPowderLifletEmail_v1.jpg"; // large picture with explanation
                var lblSrc="https://googledrive.com/host/0B9mOESHtO2LXcC12ZnlpR0pQTzA/AquaPowderLable.jpg";          // lable
                var lblSrcForEmail="cid:aKLabel";
                lblSrcForEmail=lblSrc;
              hDivImg.style.backgroundImage='url("'+lblSrc+'")';
              hDivImg.style.height="38px";
              hDivImg.style.width="250px";
              hDivImg.style.margin="5px";
              hDivImg.style.backgroundSize="100% ";
              hDivImg.style.backgroundRepeat='no-repeat';
              hDivImg.style.display="inline-block";

              // !!! --- link to input in background-image or anywhere
              //  look http://stackoverflow.com/questions/10311092/displaying-files-e-g-images-stored-in-google-drive-on-a-website
              //  https://googledrive.com/host/<folderID>/<filename>  in public folder

              var hPName=d.createElement('DIV');
              hPName.id='hPName';
              hPName.setAttribute('class','hPName');
              hPName.innerHTML='Использование HTML разметки в e-mail сообщениях.';
              hPName.setAttribute('style','margin-top:12px;width:99.5%;height:auto;background-color:#008888;'
                                         +'box-shadow:0px 2px 8px #666,0px 3px 8px #2A403D;border-radius:25px;'
                                         +'color:#fff;text-align:center;padding-top:3px;padding-bottom:3px;padding-left:7px;'
                                         +'font-size:24px;font-weight:700;text-shadow:0px 2px 2px #52241B,-6px 2px 21px #E6E5E5;'
                                         +'line-height:50px;margin-bottom:20px;');
              hPName.style.fontFamily="'Roboto',sans-serif";
              var br=d.createElement('BR');
      
      var hDivSrch=d.createElement('DIV');
          hDivSrch.id='search';
          hDivSrch.setAttribute('class','search');
          hDivSrch.setAttribute('style','display:inline-block;float:right;position:relative;top:21px');
            
            var hFSearch=d.createElement('FORM');
                hFSearch.id='hFSrch';
                hFSearch.setAttribute('name','hFSrch');
                hFSearch.setAttribute('action','https://www.google.com/search');
            
                var hSpan=d.createElement('SPAN');
                    hSpan.id='spSrch';
                    hSpan.setAttribute('class','spSrch');
                
                var inpSrch=d.createElement('INPUT');
                    inpSrch.id="inpSrch";
                    inpSrch.setAttribute('name','q');
                    inpSrch.setAttribute('class','inpSrch');
                    inpSrch.setAttribute('size','25');
                    inpSrch.setAttribute('maxlength','255');
                    inpSrch.setAttribute('value','');
                    inpSrch.setAttribute('type','text');
                    inpSrch.setAttribute('placeHolder','поиск');
                    inpSrch.setAttribute('form','hFSrch');
                    inpSrch.setAttribute('style','color:#008888;border:solid 1px #00a0a0;border-radius:2px;padding-left:4px;');
                
                var srchBut=d.createElement('INPUT');
                    srchBut.setAttribute('type','submit');
                    srchBut.setAttribute('title','поиск Google');
                    srchBut.id='srchBut';
                    srchBut.setAttribute('class','srchBut');
                    srchBut.setAttribute('value','Найти');
                    srchBut.setAttribute('form','hFSrch');
                    srchBut.setAttribute('style','margin-left:4px;color:#fff;border:solid 1px #bb9cb3;cursor:pointer;border-radius:2px;'
                                        +'position:relative;background-color:#68b7bb;');
            hFSearch.appendChild(inpSrch);
            hFSearch.appendChild(srchBut);
            hFSearch.appendChild(hSpan);

            hDivSrch.appendChild(hFSearch);

      hAHead.appendChild(hDivImg);

  hPan.appendChild(hStl);
  hPan.appendChild(hAHead);
  hPan.appendChild(hDivSrch);
  hPan.appendChild(hPName);
  return hPan;}
var hPan=getHeader();
b.appendChild(hPan);
</script>