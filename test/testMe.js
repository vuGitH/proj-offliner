/**
 * Tests project Off-Liner (abbreviation - pol)
 */
console.log('Test begins\n'+
            'current working directory:%s',process.cwd());
var pol = require('../proj-offliner.js');
var act = process.argv[2];
console.log('action parameter value = %s\n'+
            '__dirname= %s',act,__dirname);
// source json file
pol.fromFile = process.argv[3] || __dirname + '\\testProjFile.json';
pol.act = act;
if(act === 'e' || act === 'ea' || act === 'erf'){
  //  evokes
  // output directory prefix
  pol.prefixTo = process.argv[4] || __dirname + '\\out\\pathTo_'; 
}else if(act === 'a'){
  //  assembles
  pol.pathFrom = process.argv[4] || __dirname + '\\pathFrom';
  pol.assFileName = process.argv[5] || '';
}else if(act === 'ato'){
  pol.outputFile = process.argv[5];  
}else{
  console.log('action parameter is not set.  ea  is using.');
  pol.act = 'ea';
  pol.prefixTo = process.argv[4] || __dirname + '\\out\\pathTo_'; 
  act = 'ea';  
}

pol.run('Test run as \'npm test\' command',pol.act,pol.fromFile);