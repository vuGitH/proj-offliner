# proj-offliner package

    +----------+    +-----------+    +------------+    +--------------+
    | extracts |    | writes    |    | modifies   |    | assembles    |
    | js-files |    | them      |    | them       |    | new json file|
    | form     | -> | into      | -> | manually   | -> | using        |
    | json file|    | directory |    | or         |    | js-files     |
    | specified|    | specified |    | on the fly |    | modified     |
    +----------+    +-----------+    +------------+    +--------------+
                          |                                  |
                          v                                  v
                    +-----------+                      +-------------+
                    |   show    |                      |    show     |
                    |  results  |                      |   results   |
                    +-----------+                      +-------------+

## Why

It's necessary and/or convenient to edit or modify Google AppScript
project files off-line sometime . While downloaded project file is a json file
containing full info regarding project's files substructure, their names and
sources' contents.

This `proj-offliner` module permits to convert json-file downloaded into
separate JavaScript-files (js-files) with '.js' extensions having appropriate
names got from json file data ( obj.files[i].name , where obj - is an object
got after parsing by JSON.parse json-file string; files - is property array,
each element of which devoted to an appropriate project's content file.

Module creates temporary folder and populates it by newly extracted js-files
or could extract those files into specified directory.

After appropriate edition completed the package assembles js-files modified
into new json project file ready for uploading.

## Installation

To install `proj-offliner` globally:

    npm install -g proj-offliner

To install in specified project go inside it's root directory and execute
command

    npm install --save-prod proj-offliner

## Usage

### <a name='inComPrompt'></a>  In command line

*(for usage inside your modules scripts go to the
 [usage inside modules](#inModuleUse))*

For usage in command prompt commands make proj-offliner main directory being
the current working directory.

```cmd
    cd proj-offlinerMainDirectory
```

Module's main directory is that containing package.json file. And use one of
commands described bellow following the examples with arguments depending of
 your task:

Module's **pol** script determined in package.json **scripts** object is
called by

    npm run pol

command with arguments and executes
or evocation of js-files into temporary directory

    npm run pol e fromFile ...

or

assembly of new modified json-file created from js-files content modified
taken from temporary folder where they(js-files) were stored -

    npm run pol a fromFile pathFrom ...

in dependence on the value of action parameter passed to the script as
third argument and on the values of other arguments passed (if any)
to the module as arguments, for ex. 'e' - evokes or 'a' - assembles ;
The call of this script module is carried out by

     npm run ...

command calling from command prompt presumes that module host directory
is the current working directory

General command format is:

    npm run pol arg2 arg3 arg4 arg5     (*)

particular examples:

      0.    npm run pol                                         (0)
      1.    npm run pol e                                       (1)
      2.    npm run pol ea                                      (2)
      3.    npm run pol a                                       (3)
      4.    npm run pol e fromFile prefixTo                     (4)
      5.    npm run pol a fromFile pathFrom                     (5)
      6.    npm run pol a fromFile pathFrom assemblyFileName    (6)
      7.    npm run pol a fromFile pathFrom outputFile          (7)
      8.    npm run pol parsFNm                                 (8) fed by
                                                                    parameters'
                                                                    json-file
Explanations of each example follow bellow.

Variables and object properties' names using bellow in the context:

    act - action type parameter ('e' - evoke, 'a' - assemble, 'ea' - evoke
        and then assemble, ...)

    fromFile - full path of initial json file handling (initially is presumed
        being appScript project file downloaded. )
    pathTo - path of the folder wherein js-files extracted form fromFile
        will be stored in. (Could be assigned by user manually or will be
        generated from prefixTo path string appending 6 random characters
        for each run.
    prefixTo - part of pathTo path to which six random alphanumerical
        characters will be appended to get new pathTo value
        (if not set it's derived from fromFile, using fromFileName without
        extension trailed by underscore as prefix for resulted folder name)
    pathFrom - path of folder being location of extracted files will being
        taken for assembly of new project's json file modified off-line or
        on the fly
    assFileName - (assembly file name) name of resulting project's json file
        without .json extension specified by user if any. Optional.
        If not set the name of resulting json-file is assigned
        automatically as fromFileName+'_modified_N' where N-is number of
        result file version. Each assembly run produces new version.
    outputFile - full path including file name and extension of resulted
        json file being modified version of fileFrom after
        handling, ready to be uploaded if necessary. Set by user if any
    label - unique identifier for project off-liner run (could be
        descriptive comment)
    parsFNm - parameters file name argument determining json-file name
        with managing paramters data.

Parts of the command

    npm run pol e ...

after `npm` separated by whitespace are npm command's arguments.

I-th argument could be returned inside codes by `process.argv` - array
as `process.argv[i]`, where `process` is node.js standard module.

So `run` - is argv[0], `pol` - argv[1], ...etc.

Arguments are optional and have different meaning depending on arg2 (argv[2])
action parameter

**Testing runs with defaults args values.**

    npm run pol                            (0)    the same as (2)

    npm run pol e                          (1)

are equivalent to **npm run e fromFile prefixTo** , where

    arg2 = 'e' ;   - action parameter value that indicates that the action is
        evoking ( or extracting) js-files from object parsed from original
        json-file fromFile of previously downloaded appScript project's file
        (.json)

    arg3 = fromFile = '.\\test\\testProjFile.json' ; (paths relative to the main
                                                      proj-offliner package
                                                      directory)

    arg4 = prefixTo = '.\\test\\out\\pathTo_';

_

    npm run pol ea                         (2)

This is default test command for extracting data an then assemble
new json file modified immediately, equivalent to command
**npm run ea fromFile prefixTo pathFrom** , where

    arg2 = 'ea'; arg3 and arg4 similar to example (1)

    arg5 = pathFrom = '.\\test\\pathFrom'
_

    npm run pol a                           (3)

assembly run equivalent to (*) with default arguments values, where

    arg2 = 'a';

    arg3 =  '.\\test\\testProjFile.json';

    arg4 =  '.\\test\\out\\pathFrom'

The resuled json-file of this test will be stored into

    '.\\test\\out\\pathFrom'  directory

        and full path of output json-file will be
    '.\\test\\out\\pathFrom\\testProjFile_modified_N.json' ,

        where N - is consecutive number of file version increasing by on
        with each run.
_

    npm run pol e fromFile prefixTo         (4)

In expample (4) -

    fromFile - original json file handling ( possible appScript
        project file) written in the format of string
        'disk:\\path\\to\\the\\fileName.json'

    prefixTo - as string 'disk:\\path\\to\\the\\dirNamePrefix_'
        as a result of execution data will be extracted and
        js-files will be saved into the temporary folder  
        'disk:\\path\\to\\the\\dirNamePrefix_XXXXXX' ,
        where XXXXXX are six random alpha numerical characters.
_

    npm run pol a fromFile pathFrom          (5)

After execution of command (5) the resulting new json file assembled will be
placed into `pathFrom` directory and will have the name derived from
`fromFile` file name: the string being fromFile's name,  
for ex. using node.js standard module `path`

```js
var fromFileName = path.basename(fromFile,'.json');`
```

could be used to form new output file name as string
`fromFileName + '_modified_N.json'`

and full path of outputFile being

```js
outputFile = path.dirname(fromFile) + fromFileName + '_modified_N.json'`
```

where in the part of string '_N' N  means version number.
Each new run provides new version number.

Example:

 if  `fromFile = ' disk:\\some\\dir\\fromFileName.json';`

 and
    `parthFrom = 'somedisk:\\path\\From\\directory';`

 n-th version (result of n-th run) of outputFile full path will be:
 `'somedisk:\\path\\From\\directory\\fromFileName_modified_n.json'`

    npm run pol a fromFile pathFrom assemblyFileName     (6)

Case (6) instead of use automatic outputFile name creation, like in
the case (5), uses the one set by assemblyFileName argument which is the file
name without extension '.json'. So taking values used in example for case (5)
resulted json file will have full path:

     outputFile = 'somedisk:\\path\\From\\directory\\' +
        assemblyFileName + '_modified_n.json' `

The outputFile full path including file name could be set directly by user in the command:

    npm run pol a fromFile pathFrom outputFile           (7)

All parameters mentioned above could be read from special json file and
the file name of that parameters' file itself may be an argument of
npm run pol command :

    npm run pol parsFNm                                 (8)

                (parsFNm - abbreviation of " parameters File Name")

That file containing parameters' data (naming here as params-json-file) should
conform the following requirements:

A. json-file name is terminated by string '_params.json'.
The initial part of params-json-file name is passed as an argument in (8)
command prompt command, where parsFNm - is file name without '_param.json'
terminating string.

B. file with such name resides in the folder '.\\params' being sub-folder
`params` of module's main directory

For example if we have parameters file named 'someParameters_params.json',
relative path of which is `'.\\params\\someParameters_params.json'` , the
appropriate command is looked like

    npm run pol someParameters

C. The parameters file residing in `'.\\params'` folder should has content
being json string which will be parsed by JSON API into

```js
var obj = JSON.parse(jsonStringOfParametersFileContent);
```

with appropriate properties named as parameters' variables above

```js
    obj = {
      label: '...',
      act: "..",
      fromFile: '...',
      prefixTo: '...',
      pathTo: '...',
      pathFrom: '...',
      assFileName: '...',
      outputFile: '...'
    };
```

D. depending on the 'e' or 'a' - value of action parameter  it's possible
additionally to control presence of prefixTo or pathFrom being set

Such criteria permit to create not only input params json-file
but output as well automatically after evoking
procedure and to store it in the ./params folder. The name of such file
will be fromFileName_N_params.json were fromFileName is
path.baseName (fromFile,'.json') file name without extension and
_N_ is the ordering number of file's version assigned automatically.

Default value of action parameter is  'ea' for tests but  if fromFile
argument is set by user default action parameter is equal to str 'e'.

### <a name='inModuleUse'></a>Usage Inside Module Codes

While proj-offliner module has been installed locally or is set as
property of **dependencies** or **devDependencies** objects of your module's
package.json, to invoke proj-offliner object from your scripts is standard
require api invocation:

```js
var pol = require('./') ||
          require('./proj-offliner.js');
```

proj-offliner object (later - pol) has flexible method `pol.run` supplying
full functionality similar to that has been described for __npm run pol ...__
command prompt commands above.

Keeping meaning of notations mentioned in [command prompt usage](#inComPrompt)
paragraph the generic call of run method is looked like

```js
pol.run(opt_label, opt_act, opt_fromFile, opt_prefixTo, opt_pathFrom,
    opt_assFileName, opt_outputFile);  // 'opt_' prefixes mean - optional
```

the meaning of arguments are similar to the command prompt usage but will
be described bellow as well.
The pol object has properties storing parameters' values mentioning among
arguments in pol.run( ...) call above.
So if you would have set them before pol.run call
(all or just only part of them depending on act parameter value)

```js
    pol.label = 'identifier of proj-offliner run';
    pol.act = 'someAct';
    pol.fromFile = 'some full path of initial json file handling';
    pol.prefixTo = 'some template path to form path of temporary folder';
    pol.pathTo = 'exact folder path where to reside extracting js-files';
    pol.pathFrom = 'some path of folder where to take js-files modified';
    pol.assFileName = 'assembly file name in pathFrom without' +
      ' extension .json to be used';
    pol.outputFile = 'full path of assembly file to be used';
```

the call of run method would be compact, just like:

```js
    pol.run();
```

On the other hand all or some necessary parameters could be specified in
special object `options` passing to run method as argument

```js
    var options = {
      label: 'someLabel',
      act: 'someActionMode',
      fromFile: 'someFromFileFullPath',
      prefixTo: 'somePrefixTo',
      pathTo: 'somePathTo',
      pathFrom: 'somePathFrom',
      assFileName: 'someAssemblyFileNameSpecified',
      outputFile: 'someOutputFileFullPathSpecified'
    };
```

the call of pol.run method could be like this:

```js
    pol.run(options); // typeof options === 'object' should be true
```

Another calling option is, instead of `options` object, to pass to pol.run
method the name of json parameters' file located inside '.\\params' folder
whose json string content would being parsed into analogous parameters object
by JSON.parse(fileContent). Such pol.run call will be looked like:

```js
    pol.run ( pramsJsonFileNameWithoutExtention );  // argument type is {string}
```

If you need few consecutive call of pol.run method the `pol.reset(pol)` method
should precede `pol.run(...)` call to exclude overlapping of values for
different run, for ex.:

    pol.reset(pol);
    pol('runLabel,'e',fromFile);  // call using default prefixTo

Another probably useful method in the situation of consecutive proj-offliner runs
is  `pol.clone(someLabel);` which instantiates pol object permitting to separate
namespaces of consecutive proj-offliner run and run-methods calls.

```js
    var polNext = pol.clone('lableOfPolNext');
    var polNext1 = pol.clone('lableOfPolNext');
    //...
```

memory spaces of polNex.. objects are not intercepted.
(see codes descriptions for details).

The functionality provided by by `pol.run` - method (executes evoking or
assembly etc.) depends on the number, the types and the values of method's
arguments.

    {string} Variables used in context and their meaning:
    act - action type parameter
    fromFile - full path of json file of appScript project downloaded
            (including file name with extension)
    pathTo - path of the folder wherein js-files extracted from fromFile
            will be stored into. (Could be assigned by user manually by
            setting pol.pathTo property)
    prefixTo - part of pathTo path to which six random alphanumerical
            characters will be appended to get new pathTo value
            or in details
            {string}  prefix of the path to temporary directory wherein you are
            going to store js-files extracting. Six random character will be
            added to this prefix to determine full directory name. This
            parameter is Optional. If prefixTo is not set the module uses path
            to downloaded fromFile and fromFileName+'_' as prefix.
            As an example the default value of prefixTo will be determined
            by scripts-let
            if act parameter === 'eto' prefixTo contains pathTo value of path
            string

```js
    var path = require( 'path' );  // node path API
    prefixTo = path.dirname( fileFrom) + path.sep +
               path.baseName( fileFrom, '.json')+'_';
```

           resulted directory path will be stored in the property
           `pol.pathTo` of object `pol`.


    pathFrom - path of folder being location of extracted files will being
                taken for assembly new project's json file modified off-line
    assFileName - name of resulting project's json file without .json
                extension specified by user if any. Optional parameter.
                If not set the name of resulting json-file is assigned
                automatically following the rule described bellow or in
                methods' description
    outputFile - full path including file name and extension of resulted
                json file being modified version of fileFrom after
                handling, ready to be uploaded if necessary.
    label - unique identifier for project off-liner run (could be
            descriptive comment)

Arguments options:

No Arguments - all arguments and parameters will have Default values.
is used while testing (excepting the case when parameters properties
of pol object are set in advance, how it has demonstrated above)

        call example: pol.run(); // (0)

First argument's values vs meaning & functionality (act - action parameter):

    'e' - evoke
    'a' - assemble
    'o' - object properties as managing parameters
    'f' - same as 'o' but object will be get from json file locating into
          __dirname + sep +'params' folder; where sep is OS paths separator
    'ea' - 'e'voke and then 'a'ssemble (default) using in test run and
             at chaining processes like auto lint of js-files codes
    'eto' - evoking js-files extracted from fromFile and write them into
          pathTo path of folder specified by user
    'ato' - assembles project's data into specified json file

Calling examples:

        'o' - call ex.:

```js
            pol.run('o',options); // (1) or
            pol.run('',options);  // (2) or
            pol.run(options);     // (3)
```

            where typeof options === 'object' is boolean true
            label parameter should be determined inside options object.

```js
            options = {
            label: '...',
            act: '...',
            fromFile: '...',
            prefixTo: '...',
            pathTo: '...',
            pathFrom: '...',
            assFileName: '...',
            outputFile: '...'
            };
```

        'f' - is used with second parameter(method's argument) as

            params-json-fileName  without ending string '_params.json'
            (see example bellow). Params-json-file itself should be located in the
            folder with path: __dirname + sep +'params' ('./params' relative to
            package root directory)

            call samples:
                pol.run('f',paramsFileNamePart); // (4) or
                pol.run('',paramsFileNamePart);  // (5) or
                pol.run(paramsFileNamePart);     // (6)


            typeof paramsFileNamePart === 'string' &&
            !/\.json$/.test(paramsFileNamePart) &&
            !/_params\.json$/.test(paramsFileNamePart)
            is boolean true,
            where paramsFileNamePart is string presenting
            file name without '_params.json' of params-json-file located in
                __dirname+sep+'params' directory (sep='\\' in the case of Windows)
                and containing json string with properties:
                paramsJsonFileContent =
                {"label": "...","act": "...","fromFile": "..." ,"prefixTo": "...",
                "pathTo": "...","pathFrom": "...","assFileName": "...",
                "outputFile: "..."}
                label parameter should be determined inside options object.
                Attention remark! - content of json-file json string must not
                contain line brakes special characters.

        'e'- evokes js-files from fromFile into new prefixToXXXXX -directory<br>
            call ex.: pol.run('e',fromFile,prefixTo) (7)<br>
        'eto'- evokes js-files from fromFile into user defined pathTo directory<br>
            call ex.:<br>
                pol.run('eto',fromFile,pathTo);  (8)

        'a' - assembling final project's json file
            call samples:
            pol.run('a',fromFile,pathFrom,opt_assembleFileName); // (9) or

        'ato' - assembling final project's json file specified. The final json-file
            and it's location are strictly determined by user
            call samples:
            pol.run('ato',fromFile,pathFrom,outputFile); // (10)
            where outputFile is a full path including file name and
            extension .json where to write final json assembly file

        'erf' - technical evoking mode using algorithm of direct content
                reading of json file (only for information. details see in
                code description) to get the object whose properties contain
                js-files data

Defaults:

For NON TESTING RUNS Default act = 'e'
if fromFile is not set the default value of
act = 'ea'   (when non 'o' and non 'f' cases is run) testing evoking
               and then assembling results

```js
fromFile = __dirname + '\\test\\testProjFile.json';
prefixTo = __dirname + '\\test\\out\\pathTo_';
pathFrom = __dirname + '\\test\\pathFrom';
```

### Evoking js-files

To extract separate js-files of your project from appScript project
json file downloaded you need to invoke proj-offliner package installed
locally inside your module using modeling calls for action parameter
'e' or 'eto' presenting here. The pol.run method is wrapper of engine
for evocation

```js
pol.evokeJsFiles(label,fromFile,opt_prefixTo,opt_act,opt_mode);
```

### Remark regarding specified folder for extracted js-files

In the case of when you would prefer to place js-files extracted in specified
directory on your choice ( for ex. whose name doesn't contain 6 random
characters at the end) the usage is as follows:

```js
    var pol = require('./') || require('./proj-offliner.js');
    pol.act='eto';
    pol.fromFile= fromFile; // {string}
    pol.pathTo= pathToSpecifiedByYou;     // {string}
    pol.no6 = true;                       // {Boolean} set automatically
    pol.run();
```

### Assemble results

After possible edition and/or modification of js-files, extracted previously
from project json-file, you could prefer to assemble resulting appScript
project json-file for uploading it into your Google project on Google Drive
later . The pol.run metho is the wrapper of the method `assembeleProjFile`
who is used for that purpose:

```js
    polO.assembleProjFile(label,opt_fromFile, opt_pathFrom,
                          opt_assFileName, opt_outputFile);
```

It returns json string being the content of json file prepared for uploading
and writes new file naming it as
or `opt_assFileName`, if it's set

or as

`originalJsonFileDownloadedNameWithoutExtention~ + "_modified_N.json"`

where N after 'modified_' is string number = 0,1,2,... showing the version of
assembled file provided in sequential calculation run. N is increased
each time by one, to guaranty that outputFile's version do not overwrite
one another.
into the directory determined by path `opt_pathFrom`

### Thank you

Comments and remarks welcome!
v.url.node@gamil.com
