/**
 * handle Object
 */
PEleCom.handle={};
var handle=PEleCom.handle;
/**
* determins if object has no properties and methods
* @param {Object}o object testing
* @return {Boolean} true if object has no properties and methods; 
*   false otherwise
*/
handle.objIsEmpty=function(o){for(var i in o){return false;}return true;};
/**
* checks if object containes specified property
* @param {Object}o - object testing
* @param {string}pNm property name as string
* @return {Boolean} true when such property name is available among object properties
*/
handle.hasPropName=function(o,pNm){
  for(var pr in o){
    if(pr===pNm){
      return true;
    }
  }
  return false;
};