PEleCom.Menues={};
var Menues=PEleCom.Menues;
Menues.number=0;
Menues.sprSheetsObjs=[];
Menues.sprSheetsIds=[];
Menues.menuObjs=[];
/**
* Adds menu object for spredsheet ss
* @param{objects Spreadsheet}ss - spreadsheet object
* @param{Array menuEntries[{}]menuEntriesOpt - optional. Default=[].
* Array specifying objects for each menu item [{itemName:'',functionName:''}]
* @return{Object UIInstance} - UI instanse menu object
*/
Menues.addMenu=function(ss,menuName,menuEntriesOpt){
  var menuEntries=menuEntriesOpt||[];
  Menues.number++;
  Menues.sprSheetsObjs.push(ss);
  Menues.sprSheetsIds.push( ss.getId() );
  Menues[ss.getName()]={};
  var menuObj=Menues[ss.getName()];
  Menues.menuObjs.push( menuObj );
  
  var ssMenuUI=SpreadsheetApp.getUi()
  .createMenu(menuName);
  if (menuEntries.length>0){
    for(var im=0;im<menuEntries.length;im++){
      ssMenuUI.addItem(menuEntries.itemName,menuEntries.functionName);
    }
  }
  menuObj.ssMenuUI=ssMenuUI;
  menuObj.name=menuName;
  menuObj.items=menuEntries;
  return menuObj;
};
/**
 * @param{integer}ind - index of ss object in Menus.sprSheetsObjs array
 * @return{Object menu}
 */
Menues.getMenuByInd=function(ind){
  return Menues.menuObjs[ind];
};
/**
 * @param{integer}ind - index of ss object in Menus.sprSheetsObjs array
 * @return{Object menu}
 */
Menues.getMenuBySsId=function(ssId){
  var ind=Menues.sprShhtsIds.indexOf(ssId);
  return Menues.menuObjs[ind];
};
/**
 * Example of onOpen function for spreadsheets
 */
function onOpen___(){
  var menuName='Глоссарий';
  var menuEntries=[{name:'Сверить Заголовки',functionName:'varifyColumnsNames'}];
  //var ss=SpreadsheetApp.getActive().addMenu(menuName,menuEntries);
  SpreadsheetApp.getUi().createMenu(menuName).addItem(menuEntries[0].name,menuEntries[0].functionName).addToUi();
}