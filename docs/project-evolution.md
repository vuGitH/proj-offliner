# Project evolution remarks

## temporal topic branch **run-threds**

The reason to create topic branch __run-threds__
 - split polO.run into blocks,  
 - incert polO.workWith

task:

1. to make polO.run method more compact.
2. provide possibility to represent arguments of `polO.work(...args)`  as single object ~options~  
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

## update 31.05.2020

