# TODO for **pol - proj-offliner - project**

1. [x] Supply - To take into account files' tipes when source content (codes'
lines) is evoked from project's object got from downloaded AppsScript project
json file. Each i-th file's object is `file = projObj.files[i]`. It's conten
is keeped in property `file.source` as string. File's type - `file.type'`.
Actual file types known are: `('server_js'|'html'|'json')`
Appropriate files' extentions are `('.js'|'.html'|'.json')`

   Each file's of source - property
files[i].type has value
or 'server_js' or 'html' or 'json' ...
Dependent on the value of type the resulted file extension should be
determined while sources files are saved into folder on local PC.

2. [x] To write part of .gitignore file for ignoring all files inside
`proj-offliner/x.y.z/params` folder but those need for default runs

        params/*
        !params/a_params.json   /* default params for action mode "a" */
        !params/e_params.json   /* default  for action mode "e" */
        !params/ea_params.json
        !params/allDefaults_params.json

3. [x] the same as 1. but for proj-offliner/x.y.z/test and proj-offliner/x.y.z/test/out

        test/*
        !test/pathFrom
        test/out/
        !test/out/pathFrom
        !test/testMe.js
        !test/testProjFile.json

4. [x] the same as 1 but for files

    ```git
    .eslintrc.json
    .markdownlint.json
    .vscode/
    ```

5. [x] edit `proj-offliner.js` method `polO.preUploadFile` to insert

        var fExt;
        // ...
        fExt = file.type ? polO.setFileExtention(file.type) : 'unknown';
        // ...
        fpath = pathFrom + sp + fname + '.' + fExt';

6. [x] Exclude all unnecessary stuff from main branch and version's directory
   - At first I need to commit everything including actual .gitignore
      git commit -m "before cleancing all unnecessary stuff excluding
      only file really need for version usage and publishing

         git commit -m "keep all for a chance to need in the future"
         git add .gitignore
         git commit -m '.actual .gitignore'

         git rm -r --cached .

## new .gitignore file

.gitignore

```git
# ignore spedified files and directories
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
```

add necessary files for next commit

```git
git add .

git commit -m "new version's files selected"
```

commiting when .gitignore has been already prepared (see previous itemes)
