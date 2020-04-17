#proj-offliner package.#

+----------+    +-----------+      +------------+     +--------------+ 
| extracts |.   | writes    |      | modifies   |     | assembles    |
| js-files |    | them      |      | them       |     | new json file|
| form     | -> | into      |  ->  | manually   |  -> | using        |
| json file|    | directory |      | or         |     | files        |
| specified|    | specified |      | on the fly |     | modified     |
+----------+    +-----------+      +------------+     +--------------+
                                                    


##Why? ##

It's necessary and/or convenient  to edit or modify Google appScript 
project files off-line sometime . While downloaded project file is a json file
containing full info regarding project's files substructure, their names and sources' contents.
This `proj-offliner` module permits to convert json-file downloaded into
separate javascript-files (js-files) with '.js' extensions havingh appropriate names
got from json file data ( obj.files[i].name , where obj - is object formed after
JSON.parse json-file, files - is property array, each of element of who devoted to
and project's content file

Module creates temporary folder and populates it by newly extracted js-files
or could extract resulted files into specified directory.
After appropriate edition completed the package assembles js-files modified
into new json file.

##Installation##
To install `proj-offliner` globally:

**npm install -g proj-offliner**

To install in specified project go inside it's root directory and execute command

**npm install --save-prod proj-offliner**

##Usage:##

###inside some your module codes*)### 
( *) the possibility of console commands doing the same thins will be considered bellow )

To extract separate js-files of you project from downloaded appScript project
json file downloaded you need to invoke proj-offliner package installed locally inside your module using options codes as follows :

####Option 1.####

    var pol = require('./') || 
              require('./proj-offliner.js');
    pol.evokeJsFiles(fromFile, opt_prefixTo, opt_mode);

where method's parameters are

fromFile - {string} full path to appScript project json file downloaded
           (including file name)
prefixTo - {string}  prefix of the path to temporary directory where to you are
           going to store js-files extracting. Six random character will be 
           added to this prefix to determine full directory name. This 
           parameter is Optional. If prefixTo is not set the module uses path 
           to downloaded fromFile and fileName+'_files' as prefix. 
           Or by other words the default value of prefixTo will be determined by 
           script let
```
    var path = require( 'path' );  // node path API
    prefixTo = path.dirname( fileFrom) + path.sel +
               path.baseName( fileFrom, '.json')+'_files';
```
           resulted directory path will be stored in the property
           `pol.pathTo` of object `pol`.
opt_mode - {string} parameter specifying extraction procedure details.
           Don't use it.

           
####Option 2.####

    var pol = require('./') || require('./proj-offliner.js');
    pol.fromFile =  fromFile;      // full path of json-file downloaded
    pol.prefixTo =  prefixTo;      // see above. Optional
    pol.evokeJsFiles();

####Option 3.####
In the case of when you would prefer to place js-files extracted in specified 
directory on your choice ( for ex. whose name doesn't contain 6 random 
characters at the end) the usage is as follows:

```
    var pol = require('./') || require('./proj-offliner.js');
    pol.fromFile= fromFile; // {string}
    pol.pathTo= pathToSpecifiedByYou;     // {string}
    pol.no6 = true;                       // {Boolean}
    pol.evokeJsFiles();
``` 

###Assemble results###

After possible edition and/or modification of js-files, extracted previously from project json-file, you could prefer to assemble resulting appScript project json-file for uploading it into your Google project on Google-Drive later .
The method assembeleProjFile is used for that purpose:

```
    pol.assembleProjFile(originalJsonFileDownloaded,
                         opt_pathFrom,
                         opt_assFileName
    );
```
It returns json string being the content of json file prepared for uploading
and writes new file naming it as
or `opt_assFileName`, if it's set 
or as
<originalJsonFileDownloadedNameWithoutExtention> + "_modified_N.json"
where N after 'modified_' is string number = 0,1,2,... showing the version of
assembled file provided in sequential calculation run. N is increased 
each time by one, to guaranty that outputFile's version do not overwrite
one another.
into the directory determined by path `opt_pathFrom`
(rule for outputFile location and name).

( opt_assFileName, opt_pathFrom etc. here are presumed being string variable.)

The method `assembleProjFile` could be used without parameters if they would be set in advance "externally" :
```
    pol.fromFile = originalJsonFileDownloadedFullPath;
    pol.pathFrom = opt_pathFrom || pol.pathTo ;   
    pol.assFileName = opt_assFileName ||
                      path.dirName(fromFile) + path.sel + 
                          path.basename(fromFile,'.json') + '_modified.json';
    
    pol.assembleProjFile();
```

###Console commands###

When `proj-offliner` package installed locally, go to the package root directory (the directory containing package.json file and proj-offliner.js)
```
    >cd to/package/root/directory
```    
##to invoke js files from appScript project json fromFile##
The meaning of strings values `fromFile` and `prefixTo` are the same as described above in options of usage inside module's codes
```
    >npm run pol e <fromFile> <prefixTo>
```
where
`pol` - is the name of package script defined inside package.json file
`e` - should be typed like it is 'e' without quotes. Means "evoke" mode.
<fromFile> - is full path to json file uploaded without quotes.
             for ex. i:\folder1\folder2\fromFile.json (for Windows)  
<prefixTo> - prefix to the path where js-files extracting will be written.
             Six random alphanumerical characters will be appended to this
             prefix to form pathTo directory path. For ex. : 
             if prefixTo is c:\fld1\fld2\somePrefix_    
             So final pathTo Destination directory path 
             will look something like this: 
             c:\fld1\fld2\somePrefix_XXXXX,
             where XXXXXX - are positions for six different random characters

To exclude typing long paths on the console  or for some future purpose these
parameters could be stored in the json file located in the `packageRoot/params` 
folder - sub-folder of package root directory. in the form of json-string:

```
    {"fromFile":"<fromFile>","prefixTo":"<prefixTo>"}
```
and appropriate console command will be
```
    >npm run pol e paramsFileName    
```
Naming rules for paramsFileName :
1. paramsFile should populate `packageRoot/params` directory
2. it has extension .json
3. file name should be terminated by '_params' string

example: If a file with name 'f1_params.json' is a params-json-file located in `packageRoot/params` - directory then the npm command will be:
```
    npm run pol e f1
```
(f1 without quotes)
To assemble final json file with modified or edited content of project js-files
the following npm command could be ran from console:

```
    npm pol a <fileFrom> <pathFrom> <opt_assFileName>
````
or 
```
    npm pol a f2
```
where
`pol` - is the name of package's script defined inside package.json file`
`a` - should be typed like it is - 'a' without quotes. Means "assemble" mode.
<fromFile> - is full path to json file uploaded without quotes.
             for ex. i:\folder1\folder2\fromFile.json (for Windows)  
<pathFrom> - path to the directory from which js-files will be taken for
             assembling final json file
<opt_assFileName> - is optional name of final json file without .json extension
                  in the case of you would prefer your own new json file name
f2 - is name without extension of params-json-file (like f1 for 'evoke' - 
     mode)located in `packageRoot/params` folder ( f2_params.json)
     and contained json string determining parameters mentioned above.
     Something like this:
````
    {"fromFile":"<fromFile>","pathFrom":"<pathFrom>","assFileName":"<assFileName>"}
```

Thank you!
Comments and remarks welcome!
