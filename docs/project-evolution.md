# Project evolution remarks

(the last update go first)

## update 03.06.2020

The run has been refactored. Proj-offliner.js script has been devided
into logical block. Now not as separate class but only methods' location
in lines stream along the file body.
Parts: LOG, UTILITIES, PARSE, EVOKE, ASSEMBLE, TEST, RUN

## update: temporal topic branch **run-threds**

The reason to create topic branch __run-threds__

- split polO.run into blocks,  
- incert polO.workWith

task:

1. to make polO.run method more compact.
2. provide possibility to represent arguments of `polO.work(...args)`  
as single object ~options~  
For this purpouse special topic branch 'run-threds' has been created

for step 1 the following sub-methods are incerted into the flow of lines  of

    polO.run { 
    ...
    polO.runArg_0_1_obj_or_file(label, opt_act)
    polO.runArg_1_2_obj_or_file(label, opt_act, opt_fromFile)
    polO.runArg_2_obj_or_file (label,opt_act, opt_fromFile)
    polO.runArg_2_fromFile_gear(label,opt_act, opt_fromFile)
    polO.isFileGoodJson(abs,rel)  // abs-olute and rel-ative pathes of a file
    ...

see explanations in scripts

Meaning of names : each sub-method handle something related with
    `.run` - method arguments. Indises are used but not ordering numbers, that is - 0,1,2,...
    For ex. `runArg_0_1_...` means Arguments number 0 and 1 of .run methods

for step 2 new method polO.workWith(options) has been created
equivalent calls:
`polO.workWith( {arg0Name:arg0Value, arg1Name: arg1Value, ...})` or  
`polO.work(arg0Name, arg1Name, ...)`  
see code sources for details

## update: exclude unnecessary stuff

Exclude all unnecessary stuff from main branch and version's directory

- At first I need to commit everything including actual .gitignore
git commit -m "before cleancing all unnecessary stuff excluding
only file really need for version usage and publishing

      git commit -m "keep all for a chance to need in the future"
      git add .gitignore
      git commit -m '.actual .gitignore'

      git rm -r --cached .

## update: new .gitignore file

```git
# ignore specified files and directories

.markdownlint.json
.eslintrc.json
.vscode/
.gitignore
.npmignore
testMy.js
docs/doc_version-tag-version_folder.txt

# ignore all files in params/ directory
# (the path relative to .gitignore host directory)

params/*

# excluding
!params/a_params.json
!params/e_params.json
!params/ea_params.json
!params/allDefaults_params.json

# ignore all files in test/ directory
test/*

# excluding
!test/pathFrom
!test/testMe.js
!test/testProjFile.json

test/out/*
!test/out/
!test/out/pathFrom

# versions' folders
1.*/
v1.*/
clone-test/
node_modules/
```

add necessary files for next commit

```cmd
git add .
git commit -m "new version's files selected"
```

commiting when .gitignore has been already prepared (see previous itemes)

## update: evoked files' types

Types of Files' evoked from AppsScript project json file downloaded are determined on the bases of the follows:  
The content of each i-th file's object is `file = projObj.files[i]` is kept in property `file.source` as string.  
File's type - `file.type'`.  
Actual file types known are: `('server_js'|'html'|'json')`
Appropriate files' extentions of files evoked are `('.js'|'.html'|'.json')`  
Depending on the value of file type the extention of file evoked
is determined while sources files are saved into folder on local PC.
`proj-offliner.js` method `polO.preUploadFile` to insert

        var fExt;
        // ...
        fExt = file.type ? polO.setFileExtention(file.type) : 'unknown';
        // ...
        fpath = pathFrom + sp + fname + '.' + fExt';
