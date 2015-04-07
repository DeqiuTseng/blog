define([_serverURL + 'modules/apply/_module.js',
        _serverURL + 'modules/apply/services/initData.js',
        _serverURL + 'modules/common/services/dataDeal.js',
        _serverURL + 'modules/common/services/postURL.js'],
    function (module, debitData, dataDeal) {
        module.controller('applyCtrl', ['$scope', '$timeout', 'database', '$filter', '$sce', 'cordovaAdapter', 'postURL', '$ionicLoading', 'flowStep', 'entity',
            function ($scope, $timeout, database, $filter, $sce, cordovaAdapter, postURL, $ionicLoading, flowStep, entity) {
                var postParam;
                var postParam2 = {};//要存入数据库中的用户个人信息
                //console.info("获取Entity值 Befor：" + entity.personalEntity.name);
                //entity.personalEntity.name = "SetValue"
                //console.info("获取Entity值 After：" + entity.personalEntity.name);

                $scope._serverURL = _serverURL;//绝对路径，用于显示图片
                $scope.openCardInfo = {};  //借记卡信息，需要传送到后台
                $scope.productShowDatas = debitData.debitCards;//3D滑动的所有借记卡
                $scope.applyData = {
                    "titleContent": "选择借记卡",
                    "includeContent": _serverURL + "modules/apply/templates/proDuct/product.html"
                };//需要与子控制器共享的数据

                $scope.infoHouseHoleInfo = {regAddrProv: "", regAddrCity: ""};
                $scope.infoDataStatus = {
                    isLocation: "0",
                    submitName: "下一步",
                    personStatus: 0,
                    careerOtherCareer: false,
                    careerWorkYear: true,
                    proHouMonLoan: false,
                    proHouMonLoanClass: "",
                    hukouProv: "",
                    hukouCity: "",
                    otherEmail: false,
                    emailClass: "",
                    repayCard: false,
                    cardClass: "",
                    cardTypeHasCar: false,
                    suppCardPer: false,
                    initStatus: 0
                };
                $scope.btStatus = {"nextStep": true, "confirm": false};//控制资料录入的按钮显示与隐藏
                $scope.applyInfoFromEbf = {};
                $scope.sign = {agree: false, zcNextStep: false};  //章程签名对象
                $scope.signs = {signPic: false};//预览签名对象
                $scope.titleBool = {isA: true};
                $scope.SignProduct = {imgId: "", ProductAbb: ""};
                $scope.proTitles = ["产品展示", "卡片列表", "产品功能介绍"];
                $scope.productHtmls = [
                    _serverURL + "modules/apply/templates/proDuct/product.html",
                    _serverURL + "modules/apply/templates/proDuct/productList.html",
                    _serverURL + "modules/apply/templates/proDuct/productDetail.html",
                    _serverURL + "modules/apply/templates/proDuct/stepBegin.html"
                ];
                $scope.data = {"proDuctHtml": $scope.productHtmls[0]};
                $scope.data.titleContent = "产品展示";

                $scope.openCardHtml = _serverURL + "modules/apply/templates/contract.html";//申请第一个步骤为章程
                $scope.openCardHtmls = [
                    _serverURL + "modules/apply/templates/contract.html",//章程
                    _serverURL + "modules/apply/templates/regulations.html",//合约
                    _serverURL + "modules/apply/templates/readIdCard.html",//身份证核查
                    _serverURL + "modules/apply/templates/personDataInfo.html",//填写资料
                    _serverURL + "modules/apply/templates/photoData.html",//,影像资料
                    _serverURL + "modules/apply/templates/video.html"//视频通讯
                ];//所有步骤的页面
                $scope.openCardSteps = [
                    new flowStep.stepInfo("章程", "stepText acStepText", "stepImgStyle acStepImgbg", "stepImg acImage", true),
                    new flowStep.stepInfo("合约"),
                    new flowStep.stepInfo("身份证核查"),
                    new flowStep.stepInfo("填写资料"),
                    new flowStep.stepInfo("影像资料"),
                    new flowStep.stepInfo("视频通讯")
                ];

                var nowProPageNum = 0;
                $scope.preProPageNum = 0;
                $scope.proInfoChose = function (proPageNum) {
                    if (proPageNum > 0) {
                        if (proPageNum == 2) {
                            $scope.data.proDuctHtml = $scope.productHtmls[proPageNum - 2];
                            $scope.data.titleContent = $scope.proTitles[proPageNum - 2];
                        } else {
                            $scope.data.proDuctHtml = $scope.productHtmls[proPageNum - 1];
                            $scope.data.titleContent = $scope.proTitles[proPageNum - 1];
                        }
                    }
                    else {
                        location.href = "#"
                    }
                    if (proPageNum == 3) {
                        $scope.preProPageNum = 2;
                    }
                    else {
                        $scope.preProPageNum = nowProPageNum;
                    }
                }

                /**
                 *@description:net_step 方法抽象出来放入到 flowStep文件，通过以下方式调用
                 * @param step
                 * Author:zengqiuqiu
                 */
                $scope.next_step = function (step) {
                    $scope.openCardHtml = flowStep.nextStep(step, $scope.openCardHtml, $scope.openCardHtmls, $scope.openCardSteps);
                }

                $scope.chooseProduct = function (obj) {
                    $scope.applyData.SignProduct = obj;
                    $scope.applyData.SignProduct.ProductIntroduce = $sce.trustAsHtml(obj.ProductIntroduce);//解除安全机制
                    $scope.applyData.titleContent = "借记卡简介";
                    $scope.applyData.includeContent = _serverURL + "modules/apply/templates/proDuct/productDetail.html";
                };

                $scope.onSwipe = function (index) {
                    //每次3D滑动，调用此方法
                    $scope.nowProduct = $scope.productShowDatas[index];
                };

                $scope.productBusDeal = function () {
                    $scope.applyData.includeContent = _serverURL + "modules/apply/templates/proDuct/stepBegin.html";
                };

                Date.prototype.Format = function (fmt) { //author: meizz
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
                //最终将数据提交到服务器中
                $scope.saveAndPostData = function () {
                    window.location.href = '#/tab/upload';
                }

                function saveClientToDB(postParam2) {
                    database.savePersonInfo(postParam2,
                        function () {
                            console.log("存储个人信息记录成功！");

                        },
                        function () {
                            console.log("存储个人信息记录失败！");
                            //window.location.href = '#/tab/upload';
                        });
                }

                // 填写资料页面使用的数据,临时使用--begin
                $scope.personDataPost = function (bValid) {
                    //1)校验
                    if (!bValid) {
                        // alert("格式不正确");
                        return;
                    }
                    //2)提交数据
                    postParam = {
                        "CapplyTime": new Date().Format("yyyy-MM-dd hh:mm"),
                        "Cbarcode": "",
                        "CcardStatus": "",
                        "ChandleStatus": "未审批",//默认为“未审批”，通讯服务socket也是也是根据 “未审批”来做判断。
                        "ChandleTime": "",
                        "Chandler": "",
                        "Cnumber": "",
                        "Cpwd": "",
                        "Uaddress": $scope.personalInfo.address,
                        "Ubirthday": $scope.personalInfo.birthDate,
                        "Ueducation": $scope.personDataInfo.education.sel,
                        "Uemail": $scope.personDataInfo.email,
                        "UhomeAdd": $scope.personDataInfo.address,
                        "UhomeAddStatus": $scope.personDataInfo.building.sel,
                        "UidCard": $scope.personalInfo.idNum,
                        "Umarriage": $scope.personDataInfo.marry.sel,
                        "Unumber": $scope.commonData.sysUserName,//"admin",
                        "Uphone": $scope.personDataInfo.tel.toString(),
                        "Usex": $scope.personalInfo.sex,
                        "Uspell": $scope.personDataInfo.nameSpell,
                        "UzhName": $scope.personalInfo.chinaName,
                        "Uphotodata": $scope.personalInfo.photoData,
                        "Uauthorities": $scope.personalInfo.issuing,                //发证机关
                        "Uvalidate": $scope.personalInfo.validDate               //有效期限
                    };

                    //var postParam={"CapplyTime":"2015-02-11 14:35","Cbarcode":"","CcardStatus":"","ChandleStatus":"","ChandleTime":"","Chandler":"","Cnumber":"","Cpwd":"","Uaddress":"湖南省耒阳市南京乡马安村3组","Ubirthday":"1990年05月16日","Ueducation":"其它","Uemail":"fhgfhh@fhgg.hh","UhomeAdd":"Fgtr","UhomeAddStatus":"其它","UidCard":"430481199005165877","Umarriage":"其它","Unumber":"admin","Uphone":"13876767667","Usex":"男","Uspell":"ZENGQIUQIU","UzhName":"曾求求"}
                    //将信息存入本地数据库

                    angular.copy(postParam, postParam2);
                    postParam2.SysUserName = $scope.commonData.sysUserName;
                    //postParam2.photoData = $scope.personalInfo.photoData;
                    /* postParam2.photoInfo=$scope.photoInfo;
                     database.savePersonInfo(postParam2,
                     function () {
                     console.log("存储个人信息记录成功！")
                     },
                     function () {
                     console.log("存储个人信息记录失败！")
                     });*/
                    /*
                     function onSuccess(data) {
                     $ionicLoading.hide();
                     postParam2.submitStatus = 1;//提交成功，将状态设置成已经提交
                     // console.log(data);
                     //window.location.href = '#/tab/home';
                     $scope.next_step(4);
                     }

                     function onFailed(data) {
                     $ionicLoading.hide();
                     // console.log(data);
                     alert("提交资料失败!");
                     }

                     // console.info(angular.toJson(postParam));
                     $ionicLoading.show({
                     template: '正在提交资料...<i class="icon ion-loading-a"></i>'
                     });
                     console.info(angular.toJson(postParam));
                     postURL.postData('BankCards?format=json', onSuccess, onFailed, postParam);*/


                    $scope.next_step(4);
                }
                $scope.initPersonDataInfo = function () {
                    var dataInfo = {};
                    //婚姻状况
                    dataInfo.marry = {
                        sel: '其它',
                        array: ['已婚', '未婚', '其它']
                    };
                    //教育程度
                    dataInfo.education = {
                        sel: '其它',
                        array: ['大专及以下', '本科', '硕士', '博士及以上', '其它']
                    };
                    //住宅状况
                    dataInfo.building = {
                        sel: '其它',
                        array: ['自购无贷款房', '自购有贷款房', '与父母同住', '租用', '其它']
                    };
                    $scope.personDataInfo = dataInfo;
                }
                $scope.initPersonDataInfo();
                // 填写资料页面使用的数据--end

                /***********************************************************************************************
                 * 依赖：cordovaAdapter;
                 * 功能：读身份证信息并将身份信息更新到页面
                 * 参数：无
                 * 返回：无
                 * */

                $scope.personalInfo = {};//申请人资料初始化
                $scope.cardInfo = {};
                $scope.cardInfo.barcode = "";//信封条形码
                $scope.cardInfo.cardStatus = "";//卡状态
                $scope.cardInfo.handleStatus = "";//审批状态
                $scope.cardInfo.handleTime = new Date().Format("yyyy-MM-dd hh:mm")
                $scope.cardInfo.handler = "";//卡审批人
                $scope.cardInfo.Cpwd = "";//卡密码

                $scope.birthPosition = false;
                $scope.personalInfo.photoData = _serverURL + "img/default_head.png";
                $scope.cordovaAdapter = cordovaAdapter;
                $scope.onlineDis = true;
                $scope.successDis = true;

                $scope.readIdCard = function () {
                    $scope.cordovaAdapter.readIdCard(
                        //成功回调
                        function (data) {
                            $scope.$apply(function () {
                                $scope.birthPosition = true;
                                $scope.dataTemp = eval("(" + data + ")");
                                $scope.personalInfo.idType = "I";//证件类型
                                $scope.personalInfo.idNum = $scope.dataTemp.idnumber;//身份证号码
                                $scope.personalInfo.country = $scope.dataTemp.nation; //民族
                                $scope.personalInfo.chinaName = $scope.dataTemp.name;//姓名
                                $scope.personalInfo.sex = $scope.dataTemp.sex;//性别
                                $scope.personalInfo.issuing = $scope.dataTemp.issuing;//发证机构
                                $scope.personalInfo.validDate = $scope.dataTemp.validdate;//有效日期
                                $scope.personalInfo.birthDate = $scope.dataTemp.birthday_year + '年' + $scope.dataTemp.birthday_month + '月' + $scope.dataTemp.birthday_day + '日';//出生日期
                                $scope.personalInfo.birthDate2 = $scope.dataTemp.birthday_year + $scope.dataTemp.birthday_month + $scope.dataTemp.birthday_day;
                                $scope.personalInfo.birthYear = $scope.dataTemp.birthday_year;//出生年
                                $scope.personalInfo.birthMonth = $scope.dataTemp.birthday_month;//出生月
                                $scope.personalInfo.birthDay = $scope.dataTemp.birthday_day;//出生日
                                $scope.personalInfo.address = $scope.dataTemp.address;//地址
                                $scope.personalInfo.nation = "中国";//国籍
                                $scope.personalInfo.nation2 = "CHN";//国籍
                                $scope.personalInfo.photoData = "data:image/bmp;base64," + $scope.dataTemp.photodata;//照片
                                $scope.personalInfo.cardId = $scope.personalInfo.idNum;//用于创建本地存储数据

                                //根据中文姓名转换拼音
                                var namePing = dataDeal.convertPinYin($scope.personalInfo.chinaName);
                                $scope.personDataInfo.nameSpell = namePing.lastName + namePing.firstName;

                                /*if ($scope.personalInfo.cardId == $scope.PerInfoCheckRes.idNum) {
                                 return;
                                 } else {
                                 //$scope.applyCardInfo.PerInfoCheckRes=new model.perInfoCheckRes();
                                 $scope.onlineDis = false;
                                 $scope.successDis = true;
                                 }*/
                            })
                            $scope.openCardInfo.wordInfo = {};
                            $scope.openCardInfo.wordInfo.personalInfo = $scope.personalInfo;
                            $scope.openCardInfo.cardId == $scope.personalInfo.idNum;
                            database.update($scope.openCardInfo,
                                function () {
                                    console.log("身份证信息记录成功！")
                                },
                                function () {
                                    console.log("身份证信息记录失败！")
                                });
                        },
                        //失败回调
                        function () {
                            navigator.notification.alert(
                                '读取身份证信息失败', // message
                                null,            // callback to invoke with index of button pressed
                                '系统提示',           // title
                                '确定'     // buttonLabels
                            );
                        }
                    )
                };


                /*---------------------------------影像资料*/
                $scope.sigNameImg = [];
                $scope.othersImg = [];
                $scope.perPhotoImg = [];
                $scope.mainIdCardImg = [];
                $scope.stepStatus = -1;
                $scope.scanCodeNub = {val: ""};
                $scope.photoInfo = {
                    scanCodeNub: $scope.scanCodeNub.val,
                    sigPhoto: $scope.sigNameImg,
                    mainIdCardPhoto: $scope.mainIdCardImg,
                    personPhoto: $scope.perPhotoImg,
                    othersPhoto: $scope.othersImg,
                    status: $scope.stepStatus
                };

                $scope.scanCodeNubVal = "";

                $scope.status = {
                    "signShow": true, "personShow": true,
                    "othersShow": true, "mainCardShow": true
                }; //判断状态

                //标示资料是否需要采集的图标
                //icon ion-minus-circled assertive 未采集
                //ion ion-checkmark-circled balanced 已采集
                $scope.classFlag = {
                    "scanCodeClass": "icon ion-minus-circled assertive",
                    "signClass": "icon ion-minus-circled assertive",
                    "personClass": "icon ion-minus-circled assertive",
                    "mainIdCardClass": "icon ion-minus-circled assertive"
                };


                $scope.initPhotoImg = function () {
                    if ($scope.openCardInfo.photoInfo != undefined) {

                        $scope.photoInfo = $scope.openCardInfo.photoInfo;
                        //拿到拍照的数据
                        $scope.scanCodeNub.val = $scope.openCardInfo.photoInfo.scanCodeNub;
                        $scope.scanCodeNubVal = '*' + $scope.scanCodeNub.val + '*';
                        $scope.classFlag.scanCodeClass = "ion ion-checkmark-circled balanced";

                        if ($scope.openCardInfo.photoInfo.sigPhoto.length == 1) {
                            $scope.sigNameImg = $scope.openCardInfo.photoInfo.sigPhoto;
                            $scope.status.signShow = false;
                            $scope.classFlag.signClass = "ion ion-checkmark-circled balanced";
                        }

                        if ($scope.openCardInfo.photoInfo.personPhoto.length == 1) {
                            $scope.perPhotoImg = $scope.openCardInfo.photoInfo.personPhoto;
                            $scope.status.personShow = false;
                            $scope.classFlag.personClass = "ion ion-checkmark-circled balanced";
                        }

                        if ($scope.openCardInfo.photoInfo.mainIdCardPhoto.length == 2) {
                            $scope.mainIdCardImg = $scope.openCardInfo.photoInfo.mainIdCardPhoto;
                            $scope.status.mainCardShow = false;
                            $scope.classFlag.mainIdCardClass = "ion ion-checkmark-circled balanced";
                        }
                        if ($scope.openCardInfo.photoInfo.othersPhoto.length < 3) {
                            $scope.othersImg = $scope.openCardInfo.photoInfo.othersPhoto;
                        } else {
                            $scope.othersImg = $scope.openCardInfo.photoInfo.othersPhoto;
                            $scope.status.othersShow = false;
                        }
                    }
                }

                //拍主卡签名照
                $scope.takeSignPhoto = function () {
                    cordovaAdapter.takePhoto(function (img) {
                            var obj = {
                                imgUrl: "",
                                imgName: ""
                            };
                            obj.imgUrl = img;
                            obj.imgName = "_zk_a.jpg";//固定字符串，跟接口对接，不能随意更改

                            $scope.sigNameImg.push(obj);
                            $scope.status.signShow = false;
                            $scope.classFlag.signClass = "ion ion-checkmark-circled balanced";
                        },
                        function () {
                            // alert('主卡签字文件照拍照失败');
                            navigator.notification.alert(
                                '主卡签字文件照拍照失败',
                                // message
                                null,            // callback to invoke with index of button pressed
                                '系统提示',         // title
                                '确定'     // buttonLabels
                            );
                        });
                }

                $scope.removeSignPhoto = function (imgName) {
                    $scope.sigNameImg.splice(0, 1);
                    $scope.status.signShow = true;
                    $scope.classFlag.signClass = "icon ion-minus-circled assertive";
                }

                //主卡与拓展人合照
                $scope.takePersonPhoto = function () {
                    cordovaAdapter.takePhoto(function (img) {
                            var obj = {
                                imgUrl: "",
                                imgName: ""
                            };
                            obj.imgUrl = img;
                            obj.imgName = "_zk_b.jpg";//固定字符串，跟接口对接，不能随意更改

                            $scope.perPhotoImg.push(obj);
                            $scope.status.personShow = false;
                            $scope.classFlag.personClass = "ion ion-checkmark-circled balanced";
                        },
                        function () {
                            // alert('主卡与拓展人合照拍照失败');
                            navigator.notification.alert(
                                '主卡与拓展人合照拍照失败', // message
                                null,            // callback to invoke with index of button pressed
                                // title
                                '系统提示',
                                '确定'     // buttonLabels
                            );
                        });
                }

                $scope.removePersonPhoto = function (imgName) {
                    $scope.perPhotoImg.splice(0, 1);
                    $scope.status.personShow = true;
                    $scope.classFlag.personClass = "icon ion-minus-circled assertive";
                }


                //主卡身份证  命名图片，跟后台接口对接，不能随意更改
                var MainCardPhoto1 = "_zk_501.jpg";
                var MainCardPhoto2 = "_zk_502.jpg";
                $scope.takeMainCardPhoto = function () {

                    cordovaAdapter.takePhoto(function (img) {
                            var obj = {
                                imgUrl: "",
                                imgName: ""
                            };
                            obj.imgUrl = img;
                            if ($scope.mainIdCardImg.length == 1) {
                                if ($scope.mainIdCardImg[0].imgName == MainCardPhoto1) {
                                    obj.imgName = MainCardPhoto2;
                                } else {
                                    obj.imgName = MainCardPhoto1;
                                }

                            } else {
                                obj.imgName = MainCardPhoto1;
                            }
                            $scope.mainIdCardImg.push(obj);
                            if ($scope.mainIdCardImg.length >= 2) {

                                $scope.status.mainCardShow = false;
                                $scope.classFlag.mainIdCardClass = "ion ion-checkmark-circled balanced";
                            }
                        },
                        function () {
                            //alert('主卡身份证拍照失败');
                            navigator.notification.alert(
                                '主卡身份证拍照失败',
                                // message
                                null,            // callback to invoke with index of button pressed
                                '系统提示',     // title
                                '确定'     // buttonLabels
                            );
                        });
                }

                $scope.removeMainCardPhoto = function (imgName) {
                    for (var i = 0; i < $scope.mainIdCardImg.length; i++) {
                        var obj = $scope.mainIdCardImg[i];

                        if (imgName == obj.imgName) {
                            $scope.mainIdCardImg.splice(i, 1);
                            break;
                        }
                    }

                    $scope.status.mainCardShow = true;
                    $scope.classFlag.mainIdCardClass = "icon ion-minus-circled assertive";
                }

                //其他照片
                var othersNub = 101;
                $scope.takeOtherPhoto = function () {

                    cordovaAdapter.takePhoto(function (img) {
                            var obj = {
                                imgUrl: "",
                                imgName: ""
                            };
                            obj.imgUrl = img;
                            obj.imgName = "_other_" + othersNub + ".jpg";
                            $scope.othersImg.push(obj);

                            if ($scope.othersImg.length >= 3) {
//                            $scope.photoInfo.othersPhoto = $scope.othersImg;
                                $scope.status.othersShow = false;
                            }
                            othersNub++;
                        },
                        function () {
                            //alert('其他拍照失败');
                            navigator.notification.alert(
                                '其他拍照失败',
                                // message
                                null,            // callback to invoke with index of button pressed
                                '系统提示',    // title
                                '确定'     // buttonLabels
                            );
                        });

                }

                $scope.removeOthersPhoto = function (imgName) {
                    for (var i = 0; i < $scope.othersImg.length; i++) {
                        var obj = $scope.othersImg[i];

                        if (imgName == obj.imgName) {
                            $scope.othersImg.splice(i, 1)
                            break;
                        }
                    }
                    $scope.status.othersShow = true;
                }

                var reg = new RegExp("^\d{12,15}$");
                //扫描条码
                $scope.scanCode = function () {
                    /*$scope.photoInfo.scanCodeNub = $scope.scanCodeNub.val;*/
                    cordovaAdapter.barcodeScanner(codeScanSucc, codeScanErr);
                }
                function codeScanSucc(result) {
                    if (result.text == undefined || result.text == null || result.text == "")return;
//                    alert(Number(result.text)+"------"+reg.test(Number(result.text)));
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
                            $scope.scanCodeNub.val = "";
                            $scope.scanCodeNub.val = result.text;
                            $scope.scanCodeNubVal = '*' + $scope.scanCodeNub.val + '*';
                            $scope.classFlag.scanCodeClass = "ion ion-checkmark-circled balanced";
                        })
                    }
                }

                function codeScanErr() {
                    //confirm("扫描有误，请重新扫描!");
                    navigator.notification.alert(
                        '扫描有误，请重新扫描', // message
                        null,            // callback to invoke with index of button pressed
                        '系统提示',// title
                        '确定'     // buttonLabels
                    );
                }

                $scope.scanCodeBlur = function () {
                    if ($scope.scanCodeNub.val != "") {
                        $scope.classFlag.scanCodeClass = "ion ion-checkmark-circled balanced";
                    } else {
                        $scope.classFlag.scanCodeClass = "icon ion-minus-circled assertive";
                    }

                }

                //保存本步骤的数据
                $scope.savePhotoData = function () {
                    if ($scope.sigNameImg.length > 0 && $scope.perPhotoImg.length > 0
                        && $scope.mainIdCardImg.length > 1 /*&& $scope.scanCodeNub.val != ""*/) {
                        $scope.photoInfo.scanCodeNub = $scope.scanCodeNub.val;
                        $scope.photoInfo.sigPhoto = $scope.sigNameImg;
                        $scope.photoInfo.personPhoto = $scope.perPhotoImg;
                        $scope.photoInfo.othersPhoto = $scope.othersImg;
                        $scope.photoInfo.mainIdCardPhoto = $scope.mainIdCardImg;

                        $scope.openCardInfo.photoInfo = $scope.photoInfo;
                        postParam2.photoInfo = $scope.photoInfo;

                        // console.info(angular.toJson(postParam));
                        $ionicLoading.show({
                            template: '正在提交资料...<i class="icon ion-loading-a"></i>'
                        });
                        //console.info(angular.toJson(postParam));
                        //postURL.postData('BankCards?format=json', onSuccess, onFailed, postParam);
                        var postParam3 = {};
                        angular.copy(postParam, postParam3);
                        delete postParam3.Uphotodata;
                        var postDataParam = {
                            "head": {"RSID": "AustraliaBank", "handle": "insertmodel"},
                            "body": {
                                "note":{"tableName": "BankCard"},
                                "values": postParam3,
                                "base64": {"Uphotodata": postParam.Uphotodata}


                            }
                        }
                        if (isSysOffline()) {
                            postParam2.approveStatus = true;
                            postParam2.submitStatus = 1;
                            saveClientToDB(postParam2);
                            $timeout(function () {
                                $ionicLoading.hide();
                            }, 2000)

                            return;
                        }


                        postURL.addData1(postDataParam, onSuccess, onFailed);

                        //上传并保存本地数据
                        //post
                        function onSuccess(data) {
                            saveClientToDB(postParam2);
                            var postData = {
                                "head": {"RSID": "AustraliaBank"},
                                "body": {
                                    "note": {"tableName": "BankCard"},
                                    "values": {"sql": "CapplyTime='" + postParam.CapplyTime + "'"}
                                }

                            }

                            postURL.findDate(postData, function (data, status) {
                                console.log("获取上传图片对应申请记录的id成功")
                                //上传图片
                                postImage(postParam2, data.body.BankCard[0].id);

                            }, function (data, status) {
                                console.log("获取上传图片对应申请记录的id失败！")
                                $ionicLoading.hide();
                                return;
                            })


                            //$ionicLoading.hide();
                            //postParam2.submitStatus = 1;//提交成功，将状态设置成已经提交

                            // console.log(data);
                            //window.location.href = '#/tab/home';
                            //success
                        }

                        function onFailed(data) {
                            $ionicLoading.hide();
                            postParam2.submitStatus = 0;//提交中断
                            saveClientToDB(postParam2);
                            alert("提交资料失败!");
                        }

                        function postImage(item, id) {
                            postURL.ImgUpload(item, CallbackOption, id);
                            function CallbackOption(status, step, result) {
                                if (status == 1) {
                                    console.info("上传成功！")
                                    //item.approveStatus = true;
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
                                if (status == 0) {

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
                        $scope.openCardInfo.updateTime = new Date().Format("yyyy-MM-dd HH:mm");// $scope.$filter('date')(new Date().getTime(), "yyyy-MM-dd HH:mm");//不管操作成功或失败，记录操作时间
                        database.update($scope.openCardInfo,
                            function () {
                                $scope.stepStatus = 1;
                            },
                            function () {
                                $scope.stepStatus = 0;
                            });

                    } else {
                        $scope.stepStatus = -1
                        //alert("资料未采集完全!");
                        navigator.notification.alert(
                            '资料未采集完全!',
                            // message
                            null,            // callback to invoke with index of button pressed
                            '系统提示', // title
                            '确定'     // buttonLabels
                        );
                    }

                    if ($scope.stepStatus == 1) {
                        $scope.next_step(7);
                        console.info("跳到第七步")
                        $scope.btStatus.nextStep = true;
                        $scope.btStatus.confirm = false//控制资料录入的按钮显示与隐藏
                    } else if ($scope.stepStatus == 0) {
                        navigator.notification.alert(
                            '保存失败', // message
                            null,            // callback to invoke with index of button pressed
                            '系统提示',// title
                            '确定'     // buttonLabels
                        );
                    }

                }

                //删除本步骤的数据
                $scope.removePhotoData = function () {
                    database.remove($scope.openCardInfo.cardId, function () {
                            alert("remove success");
                        },
                        function () {
                            alert("remove failed");
                        })
                }
                /*****弹出遮罩窗口开始******************************************************************************/
                    //弹出遮罩窗口
                $scope.barCode = {one: '', two: ''};
                $scope.codeSame = {val: false};
                $scope.popInput = function () {
                    $scope.barCode.one = $scope.barCode.two = $scope.scanCodeNub.val;
                    $ionicModal.fromTemplateUrl('barCode-pop.html', function (modal) {
                        $scope.modal = modal;
                        $scope.modal.show();
                    }, {
                        scope: $scope,
                        animation: 'slide-in-up'//'slide-right-left'
                    });
                };
                //验证两次输入是否一致
                $scope.validTwoCode = function () {
                    $scope.codeSame.val = ($scope.barCode.one != $scope.barCode.two);
                    if (!$scope.codeSame.val) {
                        $scope.scanCodeNub.val = $scope.barCode.two;
                        $scope.scanCodeNubVal = '*' + $scope.scanCodeNub.val + '*';
                        $scope.classFlag.scanCodeClass = "ion ion-checkmark-circled balanced";
                        $scope.modal.hide();
                    }
                };


                /*借记卡申请部分“返回”按钮函数,apply.html调用*/
                $scope.geBack = function () {

                    if ($scope.applyData.includeContent.indexOf("productDetail") > 0) {
                        location.href = "#/tab/home";
                        return;
                    }
                    if ($scope.applyData.includeContent.indexOf("stepBegin") > 0 && flowStep.currentStep == 0) {
                        location.href = "#/tab/home";
                        return;
                    }

                    $scope.next_step(flowStep.currentStep - 1);
                    console.log($scope.openCardHtml);
                };

                $scope.abnormal = true;
                $timeout(function () {
                    $scope.abnormal = false;
                }, 5000);

                $scope.backChoseBus = function () {
                    window.location.href = '#/tab/home';
                }
            }]);
    });


