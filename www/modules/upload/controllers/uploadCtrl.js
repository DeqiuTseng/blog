define([_serverURL + 'modules/upload/_module.js',
    _serverURL + 'modules/upload/controllers/initData.js',
    _serverURL + 'modules/common/services/SelectData.js'], function (module, data, selectData) {
    module.controller('uploadCtrl',
        ['$scope', '$timeout', '$ionicActionSheet', 'database', 'uploadApplyData', 'postURL', 'cordovaAdapter', 'flowStep', 'entity', '$ionicLoading',
            function ($scope, $timeout, $ionicActionSheet, database, uploadApplyData, postURL, cordovaAdapter, flowStep, entity, $ionicLoading) {

                //console.info("获取Entity值 Befor：" + entity.personalEntity.name);
                //entity.personalEntity.name = "Test"
                //console.info("获取Entity值 After：" + entity.personalEntity.name);

                Date.prototype.Format = function (fmt) {
                    var o = {
                        "M+": this.getMonth() + 1, //月份
                        "d+": this.getDate(), //日
                        "h+": this.getHours(), //小时
                        "m+": this.getMinutes(), //分
                        "s+": this.getSeconds(), //秒
                        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                        "S": this.getMilliseconds() //毫秒
                    };
                    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                    for (var k in o)
                        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    return fmt;
                }
                $scope.unApproveItems = [];
                $scope.unPassapproveItems = [];
                $scope.approveItems = [];
                $scope.chose = 0;//默认是显示等待审批的
                $scope.num = {};
                $scope.num.unApprove = 0;//本地有多少未审批的数据
                $scope.num.approve = 0;//本地有多少条通过审批的数据
                $scope.num.unPassApprove = 0;//本地有多少条未审批通过的数据
                $scope.approve = "";
                $scope.badges.clientItems = 0;
                $scope.uploadContent = _serverURL + "modules/upload/templates/uploadList.html";
                $scope.preview = {};
                $scope.item = {};
                $scope.selectData = selectData;
                $scope.currentItem = null;
                $scope.cardInfo = {};
                $scope.cardInfo.barcode = "123456789";//信封条形码
                $scope.cardInfo.cardStatus = "";//卡状态
                $scope.cardInfo.handleStatus = "";//审批状态
                $scope.cardInfo.handleTime = new Date().Format("yyyy-MM-dd hh:mm")
                $scope.cardInfo.handler = "";//卡审批人
                $scope.cardInfo.Cpwd = "";//卡密码
                $scope.defaultPhotoData = _serverURL + "img/default_head.png";
                $scope.cordovaAdapter = cordovaAdapter;
                $scope.setCardStep = function (item) {
                    $scope.currentItem = item;
                    $scope.uploadContent = _serverURL + "modules/upload/templates/stepBegin.html";
                };

                $scope.openCardHtml = _serverURL + "modules/apply/templates/checkMailer.html";//合约及章程
                $scope.openCardHtmls = [
                    _serverURL + "modules/apply/templates/checkMailer.html",//核对信封
                    _serverURL + "modules/apply/templates/chipPersonal.html",//芯片个人化
                    _serverURL + "modules/apply/templates/changePassword.html",//修改密码
                    _serverURL + "modules/apply/templates/applySuccess.html"//申请成功
                ];//所有步骤的页面

                $scope.openCardSteps = [
                    new flowStep.stepInfo("核对信封", "stepText acStepText", "stepImgStyle acStepImgbg", "stepImg acImage", true),
                    new flowStep.stepInfo("芯片个人化"),
                    new flowStep.stepInfo("修改密码"),
                    new flowStep.stepInfo("申请成功")
                ];//步骤的名称

                /**
                 *@description:net_step 方法抽象出来放入到 flowStep文件，通过以下方式调用
                 * @param step
                 * Author:zengqiuqiu
                 */
                $scope.next_step = function (step) {
                    $scope.openCardHtml = flowStep.nextStep(step, $scope.openCardHtml, $scope.openCardHtmls, $scope.openCardSteps);
                }

                $scope.showSelectTextInfo = function (value, selectArr) {
                    var selText = "";
                    if (selectArr != null && selectArr.length > 0) {
                        for (var i = 0; i < selectArr.length; i++) {
                            if (value == selectArr[i].id) {
                                selText = selectArr[i].text;
                                if (selText == "请选择") {
                                    selText = "";
                                }
                                break;
                            }
                        }
                    }
                    return selText;
                };

                $scope.changeContent = function (item) {
                    $scope.openCardInfo = item;
                    $scope.applyCardInfo = item;
                    $scope.photoInfo = item.photoInfo;
                    if ($scope.photoInfo) {
                        $scope.scanCodeNub = $scope.photoInfo.scanCodeNub;
                        $scope.sigNameImg = $scope.photoInfo.sigPhoto;
                        $scope.perPhotoImg = $scope.photoInfo.personPhoto;
                        $scope.mainIdCardImg = $scope.photoInfo.mainIdCardPhoto;
                        $scope.othersImg = $scope.photoInfo.othersPhoto;
                    } else {
                        $scope.scanCodeNub = null;
                        $scope.sigNameImg = null;
                        $scope.perPhotoImg = null;
                        $scope.mainIdCardImg = null;
                        $scope.othersImg = null;
                    }

                    if (item.appSignNameFile) {
                        $scope.signs = item.appSignNameFile[1];
                    } else {
                        $scope.signs = null;
                    }
                    $scope.uploadContent = _serverURL + "modules/upload/templates/upload-detail.html";
                };

                $scope.backContent = function () {
                    $scope.uploadContent = _serverURL + "modules/upload/templates/uploadList.html";
                };

                /*审批里面“返回”按钮函数*/
                $scope.goBack = function () {
                    switch (flowStep.currentStep) {
                        case 0:
                            $scope.backContent();
                            break;
                        default:
                            $scope.next_step(flowStep.currentStep - 1);
                    }
                };

                $scope.showAction = function () {
                    $ionicActionSheet.show({
                        buttons: [
                            {text: '<b>一键上传</b>'}
                        ],
                        destructiveText: '全部删除',
                        titleText: '选择批量操作',
                        cancelText: '取消',
                        cancel: function () {
                            // add cancel code..
                        },
                        buttonClicked: function (index) {
                            return true;
                        }
                    });
                };
                //删除已经制好卡的本地用户数据
                $scope.deletePersonInfo = function () {
                    database.deletePersonInfo($scope.currentItem.CapplyTime,
                        function () {
                            console.log("删除本地用户数据成功！")
                        },
                        function () {
                            console.log("删除本地用户数据失败！")

                        });
                }
                $scope.initData = function () {
                    database.queryAllPersonInfo(function (result) {
                        console.log("CapplyTime   " + result[0].CapplyTime)
                        //通知commonCtrl数据已经查到，
                        console.info(result.length)
                        $scope.approve = new Array(result.length)


                        $scope.$emit("allPersonInfo", result);
                        $scope.$apply(function () {
                            //false为审批不通过，true为审批通过
                            for (var i = 0; i < result.length; i++) {
                                if (typeof(result[i].approveStatus) == 'undefined') {
                                    result[i].approveStatus = false
                                    $scope.approve[i] = false;
                                }
                            }
                            $scope.items = filterData(result);
                            //$scope.items = result;
                            $scope.data.isRefreshing = false;
                        });
                    }, function () {
                        console.error("无法查询到数据");
                    });
                };

                /*$scope.initData = function () {
                 database.queryAllPersonInfo(function (result) {
                 console.log("CapplyTime   "+result[0].CapplyTime)

                 }, function () {
                 console.error("无法查询到数据");
                 });
                 // $scope.$apply(function () {
                 // $scope.items = filterData(result);
                 //$scope.items = result;
                 $scope.items = [
                 {
                 CapplyTime: "2015-02-06 14:00",
                 Cbarcode: "",
                 CcardStatus: "",
                 ChandleStatus: "",
                 ChandleTime: "",
                 Chandler: "",
                 Cnumber: "",
                 Cpwd: "",
                 Uaddress: null,
                 Ubirthday: null,
                 Ueducation: "其它",
                 Uemail: "1432734303@qq.com",
                 UhomeAdd: "深圳",
                 UhomeAddStatus: "其它",
                 UidCard: null,
                 Umarriage: "其它",
                 Unumber: "admin",
                 Uphone: "18926243471",
                 Usex: null,
                 Uspell: null,
                 UzhName: null},
                 {
                 CapplyTime: "2015-02-06 14:00",
                 Cbarcode: "",
                 CcardStatus: "",
                 ChandleStatus: "",
                 ChandleTime: "",
                 Chandler: "",
                 Cnumber: "",
                 Cpwd: "",
                 Uaddress: null,
                 Ubirthday: null,
                 Ueducation: "其它",
                 Uemail: "1432734303@qq.com",
                 UhomeAdd: "深圳",
                 UhomeAddStatus: "其它",
                 UidCard: null,
                 Umarriage: "其它",
                 Unumber: "admin",
                 Uphone: "18926243471",
                 Usex: null,
                 Uspell: null,
                 UzhName: null}
                 ];
                 $scope.data.isRefreshing = false;
                 // });
                 };*/
                //本地数据库跟新后通知此处再次查询本地数据库一次
                $scope.$on('updatePersonInfo', function () {
                    console.info("即将要再次查询数据库一次并更新页面数据");
                    database.queryAllPersonInfo(function (data) {
                        filterData(data)
                        $scope.$emit("allPersonInfo", data);
                    }, function () {
                        console.info("查询失败！")
                    })
                    
                })
                function filterData(data) {
                    //每个客户经理管理自己的数据，别人的不准看
                    var clientItems = 0;//找个临时变量来缓冲一下
                    var results = [];
                    $scope.unApproveItems=[];
                    $scope.unPassapproveItems=[];
                    $scope.approveItems=[];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].SysUserName == $scope.commonData.sysUserName) {
                            clientItems++;
                            results.push(data[i]);
                            switch (data[i].ChandleStatus) {
                                case "未审批":
                                    $scope.unApproveItems.push(data[i]);
                                    break;
                                case "未通过":
                                    $scope.unPassapproveItems.push(data[i]);
                                    break;

                                case "已审批":
                                    $scope.approveItems.push(data[i])
                                   break;
                            }
                        } else {
                            console.log("木有权限访问");
                        }
                    }
                    $scope.num.unApprove=$scope.unApproveItems.length;//未审批数
                    $scope.num.approve = $scope.approveItems.length;//审批通过数
                    $scope.num.unPassApprove = $scope.unPassapproveItems.length;//审批未通过数
                    //$scope.badges.clientItems = clientItems;
                    $scope.badges.clientItems=$scope.num.approve+$scope.num.unPassApprove
                    return results;
                }

                $scope.data = {
                    showDelete: false,
                    isRefreshing: true
                };
                $scope.remove = function (item) {
                    var tips = 0;
                    if (!item.wordInfo || !item.wordInfo.personalInfo) {
                        tips = item.CapplyTime;
                    } else {
                        tips = item.wordInfo.personalInfo.chinaName;
                    }
                    navigator.notification.confirm(
                        '确定删除 ' + tips + ' 的信息？',
                        function (button) {
                            if (button == 1) {
                                database.remove(item.CapplyTime, function () {
                                    console.info("删除成功!");
                                }, function () {
                                    console.error("删除失败!");
                                });

                                $scope.$apply(function () {
                                    $scope.items.splice($scope.items.indexOf(item), 1);
                                    $scope.badges.clientItems--;
                                });
                            }
                        },
                        '系统提示',
                        ['是', '否']
                    );
                };
                $scope.upload = function (item) {
                    $scope.currentItem = item;
                    $ionicLoading.show({
                        template: '正在提交资料...<i class="icon ion-loading-a"></i>'
                    });
                    //将对象的照片信息以及数据状态去掉，然后用再post到数据库
                    var personDate = {};
                    angular.copy(item, personDate);
                    //delete  personDate.Uphotodata;       //头像
                    //delete personDate.photoInfo;       //照片信息
                    delete personDate.submitStatus;
                    delete  personDate.approveStatus;
                    delete  personDate.SysUserName;
                    //先查询看是否文字信息是否已经上传成功
                    //文字信息未上传成功
                    if(item.submitStatus=="0"||item.submitStatus=="-1"){
                       /* var postDataParam = {
                            "head": {"RSID":"AustraliaBank"},
                            "body": {
                                "note": {
                                    "tableName": "BankCard"  //表名
                                },
                                "values": personDate
                            }
                        }*/
                        var postParam3 = {};
                        angular.copy(personDate, postParam3);
                        delete postParam3.Uphotodata;
                        var postDataParam = {
                            "head": {"RSID": "AustraliaBank", "handle": "insertmodel"},
                            "body": {
                                "note":{"tableName": "BankCard"},
                                "values": postParam3,
                                "base64": {"Uphotodata": personDate.Uphotodata}
                            }

                        }
                        postURL.addData1(postDataParam, postSuccess, postFailed);
                    }
                    //图片信息未上传成功
                    if(item.submitStatus=="2"){
                        var postData={
                            "head": {"RSID":"AustraliaBank"},
                            "body":
                            {
                                "note":{"tableName":"BankCard"},
                                "values":{"sql":"CapplyTime='"+item.CapplyTime+"'"}
                            }

                        }

                        postURL.findDate(postData, function (data,status) {
                            console.log("获取上传图片对应申请记录的id成功")
                            //上传图片
                            postImage(personDate,data.body.BankCard[0].id);

                        }, function (data,status) {
                            console.log("获取上传图片对应申请记录的id失败！")
                            $ionicLoading.hide();
                            return ;
                        })
                    }
                    function postSuccess() {
                        var postData={
                            "head": {"RSID":"AustraliaBank"},
                            "body":
                            {
                                "note":{"tableName":"BankCard"},
                                "values":{"sql":"CapplyTime='"+item.CapplyTime+"'"}
                            }

                        }

                        postURL.findDate(postData, function (data,status) {
                            console.log("获取上传图片对应申请记录的id成功")
                            //上传图片
                            postImage(personDate,data.body.BankCard[0].id);

                        }, function (data,status) {
                            console.log("获取上传图片对应申请记录的id失败！")
                            $ionicLoading.hide();
                            return ;
                        })


                    }
                    function postFailed() {
                        $ionicLoading.hide();
                        alert("上传失败！请重试！")
                    }
                    //图片上传
                    function postImage(item,id){
                        postURL.ImgUpload(item,CallbackOption,id);
                        function CallbackOption(status,step, result){
                            if(status==1){
                                console.info("上传成功！")
                                $scope.submitStatus=1;
                                item.submitStatus = 1;
                                database.updatePersonInfo(item,
                                    function () {
                                        console.log("跟新个人信息记录成功！");

                                    },
                                    function () {
                                        console.log("跟新个人信息记录失败！");
                                    })
                                $ionicLoading.hide();
                            }
                            if(status==0){
                                item.submitStatus = 2;
                                database.updatePersonInfo(item,
                                    function () {
                                        console.log("跟新个人信息记录成功！");
                                    },
                                    function () {
                                        console.log("跟新个人信息记录失败！");
                                    })
                                console.info("上传失败！")
                                $ionicLoading.hide();
                            }
                        }
                    }
                    //uploadApplyData.mainUpload(item, callbackOption);
                };
                function callbackOption(item, status, step, error) {
                    console.info("id:" + item.CapplyTime + ",status:" + status + "step:" + step + ",error:");
                    console.info(error);

                    //当成功并且状态不为"中断"(-1)时才进行状态的更新
                    if (status == 1) {
                        console.info("status---1");
                        $scope.$apply(function () {
                            if (item.submitStatus != -1 || item.submitStatus != "-1") {
                                item.submitStatus = status;
                            }
                        });
                    } else if (status == 0) {
                        console.info("status---0");
                        if (step == "img") {
                            console.info("step---img");
                            if (error.code != undefined) {
                                if (error.code == 3) {
                                    console.info("code----3");
                                    console.info("上传失败原因:code=" + error.errorCode + ",msg=" + error.errorMsg);
                                    alert("上传失败:由于网络状况不佳,请求超时.");
                                } else if (error.code == 1) {
                                    console.info("code----1");
                                    console.info("上传失败原因:code=" + error.errorCode + ",msg=" + error.errorMsg);
                                    alert("上传失败:无法获取本地文件.");
                                } else {
                                    console.info("code----");
                                    alert("上传失败");
                                }
                            } else {
                                alert("上传失败:" + error.errorMsg);
                            }
                        } else if (step == "submit") {
                            console.info("step---submit");
                            console.info("上传失败原因:code=" + error.errorCode + ",msg=" + error.errorMsg);
                            alert("上传失败原因:" + error.errorMsg);
                        } else {
                            console.info("step---");
                        }
                    } else {
                        console.info("status---");
                    }
                    hideProgress(item, status);
                    console.info("上传步骤被回调");
                }

                function hideProgress(item, status) {
                    $scope.$apply(function () {
                        if (status == 1)
                            item.submitStatus = 1;//更新状态
                    });
                    /*  database.update(item);//更新数据*/
                    document.getElementById(item.CapplyTime).style.background = "none";//关闭渐变背景，设置为透明
                }

                /*function setProgress(item, value) {
                 var progress = document.getElementById(item.serialId);
                 progress.style.backgroundImage = "-webkit-gradient(linear,0% 0%, " + value + "% 0%, from(#1aacc3), to(#fff))";
                 }*/

                $scope.onItemDelete = function (item) {
                    $scope.items.splice($scope.items.indexOf(item), 1);
                };

                //信封核对checkMail.html js begin**********************************************
                $scope.barCode = '';
                /*条形码扫描成功回调*/
                var codeScanSucc = function (result) {
                    if (result.text == undefined || result.text == null || result.text == "")return;
                    if (isNaN(Number(result.text))) {
                        navigator.notification.alert(
                            '条码格式不识别，请重新扫描', // message
                            null,            // callback to invoke with index of button pressed
                            '系统提示',// title
                            '确定'     // buttonLabels
                        );
                    }
                    else {
                        $scope.$apply(function () {
                            $scope.cardInfo.barcode = result.text;
                        })
                    }
                };
                /*条形码扫描失败回调*/
                var codeScanErr = function () {
                    //confirm("扫描有误，请重新扫描!");
                    navigator.notification.alert(
                        '扫描有误，请重新扫描', // message
                        null,            // callback to invoke with index of button pressed
                        '系统提示',// title
                        '确定'     // buttonLabels
                    );
                };
                /*条形码扫描函数*/
                $scope.barCodeScan = function () {
                    cordovaAdapter.barcodeScanner(codeScanSucc, codeScanErr);
                };


                //信封核对checkMailcheckMail.html js end****************************************

                /*
                 刷IC卡
                 * */
                $scope.readIcCard = function () {
                    $scope.cordovaAdapter.readIcCard(
                        //成功回调
                        function (data) {
                            $scope.$apply(function () {
                                $scope.dataiC = eval("(" + data + ")");
                                $scope.cardICId = "";
                                $scope.cardICId = $scope.dataiC.cardid;
                            })
                        }, function (error) {
                            console.error("刷IC卡失败:" + error);
                        })
                }

                /**
                 * @description 芯片个人化
                 * @constructor
                 * @Author:zengqq
                 */
                $scope.IcCardPersonal = function () {
                    console.info($scope.currentItem);
                    var obj = {
                        "id_name": $scope.currentItem.Uspell,
                        "id_num": $scope.currentItem.UidCard, "ic_card_num": $scope.cardICId
                    };//$scope.currentItem.cardICId};
                    $scope.cordovaAdapter.openCard(obj, openCardSuccssHandle, openCardFialHandle);
                }

                function openCardSuccssHandle(result) {
                    $scope.$apply(function () {
                        $scope.icSuc = "[成功]";
                    });
                    console.log("个人化成功")
                }

                function openCardFialHandle(error) {
                    $scope.$apply(function () {
                        $scope.icSuc = "[失败]";
                    });
                    alert(error);
                }

                /******************修改密码begin********************/
                var pinInputObj = "";
                $scope.IcCard = {
                    cardPw: "",
                    cardNewPw: "",
                    cardAgainPw: ""
                }
                $scope.pinBlock = function (inputObj) {
                    pinInputObj = inputObj;
                    var obj = {
                        is3Des: "1",
                        isAuisAutoReturn: "0",
                        masterIndex: "1",
                        workingIndex: "1",
                        cardNo: "8888806128568586",
                        pinLength: "6",
                        timeout: "20"
                    };
                    cordovaAdapter.pinPad(pinBlockSucc, pinBoclkFail, obj);
                }

                function pinBlockSucc(result) {
                    //                    alert(pinInputObj);
                    if (pinInputObj == "cardAgainPw") {
                        $("#btnPwd").attr("disabled", false);
                    }
                    var obj = eval('(' + result + ')');
                    $timeout(function () {
                        $scope.$apply(function () {
                            $scope.IcCard[pinInputObj] = obj.pinblock;
                        });
                    });
                }

                function pinBoclkFail(error) {
                    console.error("ERROR:" + error);
                    alert("The password is incorrect, please try again!");
                }
                /******************修改密码end********************/
                /************************************************************************************
                 *
                 * 申请成功更改卡状态
                 *
                 *****/
                $scope.CcardStatus = "启用";
                $scope.updateCcardId = "54";
                $scope.updateCcard = 'BankCards(' + $scope.updateCcardId + ')' + '?format=json';
                $scope.successSubmit = function () {
                    var postParam = {

                        CcardStatus: $scope.CcardStatus

                    };

                    function onSuccess(data) {
                        console.log('ok');
                    }

                    function onFailed(data) {
                        console.info("fail");
                    }

                    // console.info(angular.toJson(postParam));
                    //postURL.postData('BankCards?format=json', onSuccess, onFailed,postParam);
                    postURL.putData($scope.updateCcard, onSuccess, onFailed, postParam);
                }
            }]
    );
});

