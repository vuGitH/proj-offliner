
# calc flow structure

Abreviation used:
*__Class__*  - class or part of project
**methodName()**  - method or function
_eventName_ - event's name
+_eventName-notDeterminedYet_+ - event not realized yet.

connec


|   Class/method         | listens event        |    emits event       |
|:---                    |  :---------:         |  :---------:         |
|                        |                      |                      |
| *__PARSE__*            | +_push_+             |                      |
|                        |                      |                      |
| **runLanch()**>        | +_push_+             |  +_parse_+           |
| **run()**>             | +_parse_+            |                      |
|                        |                      |                      |
|                        |                      |                      |
| **workWith**>          |                      |  +_args-ready_+      |
| **work**>              | +_args-ready_+         | _evoke_            |
|   _-"-_                |                      | _assemble_           |
|                        |                      |                      |
| *__EVOKE__*            |_evoke_               |                      |
|                        |                      |                      |
| **evokeAspFiles** ->   |_toFolderReady_       |                      |
| **evokeObjFromFile**   |_toFolderReady_       | _objectReady_        |
|**evokeScriptsFromObj**>|_objectReady_         |                      |
| **writeParamsFile**    |                      |  _endpoint-e_        |
|    &#11015; &#11014;   |                      |                      |
|**checkParamsFileName** |                      |                      |
|    &#11015; &#11014;   |                      |                      |
| **checkFileName**      |                      |                      |
|    &#11015; &#11014;   |                      |                      |
| **increaseDigitInPath**|                      |                      |
|                        |                      |                      |
| **eEndPoint**          | _endpoint-e_         |                      |

&#10024;

|  Class/method         |    listens            |    emits event        |
| :-------------        |   :---------:         |  :----------:         |
|                       |                       |                       |
|   *__ASSEBMLE__*      | ?assemble?            |                       |
|                       |                       |                       |
|**assembleProjFile**   |                       |_assembleFileReady_    |
|**evokeObjFromAssFile**|_assembleFileReady_    |_preUploadAssembleFile_|
| **preUploadFile**     |_preUploadAssembleFile_|_readyWriteOutputFile_ |
|  **writeAssFile**     |                       | _endpoint-a_          |
| **aEndpoint**         | _endpoint-a_          |                       |

&#10024; test 

|  Class/method         |    listens            |    emits event        |
| :-------------        |   :---------:         |  :----------:         |
|                       |                       |                       |
|   *__TEST__*          | _test_                |                       |
|**test()**             |                       |                       |
|                       |                       |                       |
|**assembleProjFile**   |                       |                       |
|**evokeAspFiles        |                       |                       |
|**workTest()**         |                       |                       |
|**runLauncher**        |                       |                       |

## another representation of flow

&#10024; parse step

|            |           |     |           |       |
|:---        |:---       |:--- |:---       |:---   |
|Listens:    | _push_          |     |           |       |
|*__PARSE__*:| runLaunch>| run>| workWith >| work >|
|Emits:      | _args-ready_          |     |           |       |
|refs:       |           |     |           |       |

&#10024; evoke step

|            |          |     |          |      |               |                  |                    |                 |            |
|:---        |:---:     |:---:|:-:       |---   |---            |---               |---                 | ---             |---         |
|Listens:    |          |     |          |      |_toFolderReady_|                  |  _objectReady_     |                 |_endpoint-e_|
|*__EVOKE__*:|runLaunch>| run>| workWith>| work>| evokeAspFiles>| evokeObjFromFile>|evokeScriptsFromObj>| writeParamsFile>|eEndPoint   |
|Emits:      |          |     |          |      |               | _objectReady_    |                    | _endpoint-e_    |            |
|refs:       |          |     |          |      |               |                  |                    |     (1)         |            |

|REFS        |                    |      |                    |
|-           |-                   |     -|                   -|
|*__(1)__*:  | checkParamsFileName|**->**| increaseDigitInPath|
|            |       ...          |**<-** |     :             |

&#10024; assemble step

|               |           |     |||||||
|-              |:-         |-    |-         |-     |:-:               |-                    |-              |-            |
|Listens:       |           |     |          |      |                  |                     |               |             |
|*__ASSEBMLE__*:| runLaunch>| run>| workWith>| work>| assembleProjFile>| evokeObjFromAssFile>| preUploadFile>| writeAssFile|
|Emits:         |           |     |          |      |                  |                     |               |             |
|refs:          |           |     |          |      |  (2); (3)        |                     |               |             |


|REFS||||
|:-|-:|:-:|:-|
|*__(2)__*:|  assfile        |**->**|separatePathAndFileName|
|          |    -"-          |**<-**|        :              |
|          |                 |      |                       |
|*__(3)__*:| checkAssFileName|**<-**| checkFileName         |
|          |    -"-          |**<-**|    :                  |
arguments

```js
/**
 * @description
 * of input parameters procedure steps:
 *
 * 1. polO.reset();
 *
 * 2.1                  set manually if any --------->  polO.properties
 *                            or                          :
 * 2.2   options <----------- set manually if any         :
 *         |                  or                          :
 * 2.3     |                  write file PARAMS.json      :
 * 3.      v                                  |           :
 *  run(arguments*)                           |           :
 *         |        .......................   |           :
 *         |        :                     :   V           :
 * 4.      |        ...options <-------from PARAMS-file   :
 *         v        :     |                               :
 *       PARSE------^     |                               :
 *    (arguments*)        |                               :
 * 5.      |              v                               :
 *         |  +-workWith(options)                         :
 *         |  |                                           :
 * 6.      v  v                                           :
 * work(arguments)                                        :
 *         |                                              :
 *         + <------------------------ polO.properties..../
 *         v
 *       workout
*/
```
