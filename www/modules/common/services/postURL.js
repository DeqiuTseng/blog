define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.service("postURL", ["$ionicLoading", "$http", function ($ionicLoading, $http) {
        this.server = {
            'webserverIp': '220.231.153.66',
            'webserverPort': '8033'
        };
        this.PostURL = [
            {"page": "checkLogin", "formId": "loginForm", "postUrl": "LoginOp.ebf"},  //登陆
            {"page": "score", "formId": "score", "postUrl": "GetCreditScoreOp.ebf"},
            //{ "page": "perLetterSel", "formId": "perLetterSelForm", "postUrl": "CreditQueryInfoSubAct.ebf" },
            {"page": "scoreCredit", "formId": "scoreCreditForm", "postUrl": "PersonLevyOp.ebf"}, //个人征信查询
            {"page": "scheduleInquery", "formId": "scheduleInqueryForm", "postUrl": "QueryScheduleOp.ebf"}, //进度查询
            {"page": "openCardSubmit", "formId": "", "postUrl": "SubmitDataOp.ebf"},   //信用卡申请提交
            {"page": "getProList", "formId": "", "postUrl": "GetPoplurProductsOp.ebf"},   //申请信用卡产品查询
            //{ "page": "productIntroduce", "formId": "", "postUrl": "ProductInfoSubAct.ebf" },   //产品介绍
            {"page": "activity", "formId": "", "postUrl": "GetPromotionActivityInfoOp.ebf"}, //促销活动列表
            {"page": "openCard", "formId": "", "postUrl": "ApplyInitOp.ebf"}, //申请信用卡
            {"page": "productList", "formId": "", "postUrl": "ProductSearchOp.ebf"}, //产品搜索
            {"page": "patchQuery", "formId": "", "postUrl": "PatchInitOp.ebf"}, //补件查询初始化
            {"page": "patchQuerySech", "formId": "", "postUrl": "QueryPatchOp.ebf"}, //补件查询
            {"page": "patch", "formId": "", "postUrl": "DownloadPatchImgUrlOp.ebf"}, //补件下载
            {"page": "patchSubmit", "formId": "", "postUrl": "UploadPatchFileOp.ebf"}, //补件提交
            {"page": "MsgCode", "formId": "MsgCode", "postUrl": "RequestAuthCodeOp.ebf"}, // 获取验证码
            {"page": "MsgCheck", "formId": "MsgCheck", "postUrl": "CheckAuthCodeOp.ebf"}, // 检验验证码
            {"page": "idCheck", "formId": "idCheck", "postUrl": "IDCheckOp.ebf"},  // 联网核查
            {"page": "Report", "formId": "Report", "postUrl": "GetSocialSecurityReportOp.ebf"},  // 鹏元社保
            {"page": "logout", "formId": "logout", "postUrl": "LoginAct.ebf"},  //
            {"page": "exit", "formId": "exit", "postUrl": "LogoutOp.ebf"}  // 签退
        ];
        this.getPostUrl = function (page, formId) {
            if (formId == null || formId == "undefined") {
                formId = "";
            }
            if (page) {
                var urlList = this.PostURL;
                for (var i = 0; i < urlList.length; i++) {
                    var obj = urlList[i];
                    if (page == obj.page && formId == obj.formId) {
                        return obj.postUrl;
                    }
                }
            }
        };

        this.postPage = function (pageType, postData, postURL, timeoutDate, postSuc, postFail) {  //timeoutDate超时时间可根据不同接口参数化
            $.ajax({
                async: true,
                url: "http://" + this.server.webserverIp + ":" + this.server.webserverPort + "/WebSite/netBank/zh_CN/Credit_Sub/" + postURL,
                type: "POST",
                timeout: timeoutDate,
                data: postData,
                success: function (data, textStatus, jqXHR) {
                    $ionicLoading.hide();
                    var isErrorPage = jqXHR.getResponseHeader("isErrorPage");
                    if (isErrorPage) {
                        var str = isErrorPage.toLowerCase();
                        if (str.indexOf("true") >= 0) {
                            var errorObj = eval("(" + data + ")");
                            if (errorObj.errorMsg == '登入超时') {
                                location.href = "initSet.html"; //跳转到登录界面
                                //alert("登录超时");
                                return;
                            }
                            postFail(errorObj);
                        }
                    } else {
                        postSuc(data);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    switch (textStatus) {
                        case "timeout":
                        {
                            postFail(textStatus);
                            break;
                        }
                        default:
                        {
                            postFail(textStatus);
                        }
                    }
                }
            });
        };

        //post访问数据
        //var serverUrl = 'http://192.168.160.206:8888/AustraliaShow/emplist.svc/';
        var serverUrl = 'http://220.231.153.66:8080/AustraliaShow1/emplist.svc/';
        this.postData = function (url, sucFun, failFun, postParam) {
            $http({
                method: 'POST',
                url: serverUrl + url,
                headers: {
                    'Content-Type': 'application/json;odata=verbose;charset=UTF-8',
                    'Accept': 'application/json, text/plain, */*',
                    'Access-Control-Allow-Origin': '*'
                },
                data: postParam,
                timeout: 10000 //设置为10s后超时
            }).success(function (data, status) {
                sucFun(data, status);
            }).error(function (data, status) {
                failFun(data, status);
            });
        }

        /*************************************************
         * 增加putData访问数据
         ****/

        this.putData = function (url, sucFun, failFun, postParam) {
            $http({
                method: 'PUT',
                url: serverUrl + url,
                headers: {
                    'Content-Type': 'application/json;odata=verbose;charset=UTF-8'
                },
                data: postParam,
                timeout: 10000 //设置为10s后超时
            }).success(function (data, status) {
                sucFun(data, status);
            }).error(function (data, status) {
                failFun(data, status);
            });
        }


        showError = function (pageType, errorData) {
            var start = errorData.indexOf("{\"errorCode");
            var end = errorData.indexOf("\"}");
            var errorjson = errorData.substring(start, end + 2);
            console.log(errorjson);
            var obj = eval('(' + errorjson + ')');
            // openPopup(obj);
            alert(errorjson);
        };
        var openPopup = function (param) {
            var modalInstance = $modal.open({
                templateUrl: _serverURL + 'modules/apply/templates/showError.html',
                controller: ModalInstanceCtrl1,
                resolve: {
                    //返回给控制器需要的信息
                    popupParam: function () {
                        return param;
                    }
                }
            });

            var ModalInstanceCtrl1 = function ($scope, $modalInstance, popupParam) {
                $scope.errorInfo = popupParam;
                $scope.ok = function (errorType) {
                    //在处理成功之后返回给上一级的信息
                    $modalInstance.close();
                    if (errorType.toLowerCase() == "sessiontimeout") {
                        angular.element(document.getElementById("content")).scope().exit();
                    }
                };
                $scope.cancel = function () {
                    //$modalInstance.dismiss('cancel');
                };
            };
            //取得控制器处理之后的返回信息
            modalInstance.result.then(function (popupParam) {
            }, function () {
            });
        };


        /*************************************************************
         * 最新服务增删改查数据库
         */
        //var newUrl="http://192.168.169.217:8007/PentSmartRS/RS/rsSvc/"
        var newUrl = "http://220.231.153.66:8007/ReviveSmartRS/Revive/RS/";
        //var newUrl = "http://192.168.169.227:8080/ReviveSmartRS/Revive/RS/"

        function operate(postParam, url, sucFun, failFun) {
            $http({
                method: 'POST',
                url: url,
                data: postParam,
                timeout: 10000 //设置为10s后超时
            }).success(function (data, status) {
                sucFun(data, status);
            }).error(function (data, status) {
                failFun(data, status);
            });
        }
        this.addData1 = function (postData, sucFun, failFun) {
            operate(postData, newUrl + "UpBase64File", sucFun, failFun);
        }
        this.addData = function (postData, sucFun, failFun) {
            operate(postData, newUrl + "InsertModel", sucFun, failFun);
        }
        this.deleteData = function (postData, sucFun, failFun) {
            operate(postData, newUrl + "DeleteModel", sucFun, failFun);
        }
        this.updateData = function (postData, sucFun, failFun) {
            operate(postData, newUrl + "UpdateModel", sucFun, failFun);
        }
        this.findDate = function (postData, sucFun, failFun) {
            operate(postData, newUrl + "SelectModel", sucFun, failFun);
        }
//--------------------图片上传---------------------------------------------
        var UsignpicsUrl = ""                //持卡人签字文件照
        var UexpendpicsUrl = ""              //与拓展人合照
        var UidcardpicsUrl = ""              //身份证正反面照
        var UotherpicsUrl = ""               //其他照片

        var _CallbackOption = "";
        var currentId = "";
        var afterUploadAccont = 0;
        var beferUploadAccont = 0;
        var UploadPool = [];
        /**
         *  签名上传参数
         * @param fileName
         */
        var uploadOptions = {
            fileKey: "file",
            fileName: "",
            headers: null,
            httpMethod: null,
            mimeType: "image/jpg",
            params: {
                id: "",
                fileName: "",
                type: ""
            }
        };

        this.ImgUpload = function (item, CallbackOption, id) {
            _CallbackOption = CallbackOption
            currentId = id
            if (item.photoInfo) {
                if (item.photoInfo.scanCodeNub) { //条形码
                    beferUploadAccont += item.photoInfo.scanCodeNub.length;
                }
                if (item.photoInfo.sigPhoto) {    //卡主签字文件
                    beferUploadAccont += item.photoInfo.sigPhoto.length;
                }
                if (item.photoInfo.personPhoto) {   //与拓卡人合照
                    beferUploadAccont += item.photoInfo.personPhoto.length;
                }
                if (item.photoInfo.mainIdCardPhoto) { //卡主身份证
                    beferUploadAccont += item.photoInfo.mainIdCardPhoto.length;
                }
                if (item.photoInfo.othersPhoto) { //其它
                    beferUploadAccont += item.photoInfo.othersPhoto.length;
                }
            }
            PhotoImgUpload(item.photoInfo);
        }
        /**
         * @description 影像资料
         * @param cardId 身份证Id
         * @param imageUrl 图片路径
         */
        function PhotoImgUpload(photos) {
            //条形码
            var scanCode = photos.scanCodeNub;
            ergodicArray(scanCode);
            //签字文件
            var sign = photos.sigPhoto;
            ergodicArray(sign, 'Usignpics');
            //与拓展人合照
            var expander = photos.personPhoto;
            ergodicArray(expander, 'Uexpendpics');
            //卡主身份证照
            var mainIdCard = photos.mainIdCardPhoto;
            ergodicArray(mainIdCard, "Uidcardpics");
            //其它
            var other = photos.othersPhoto;
            ergodicArray(other, "Uotherpics");
        }

        /**
         * 遍历对象数组
         * @param aray
         * @param idcard
         */
        function ergodicArray(array, type) {
            if (array.length > 0) {
                if (array instanceof Array) {
                    for (var i = 0; i < array.length; i++) {
                        array[i].type = type;
                        uploadImg(array[i]);
                    }
                }
            }
        }

        /**
         * 各种图片上传
         * @param imageUrl 本地存储图片Url
         * @param imageName 图片名称
         * @param id 数据库对应记录的id
         */
        function uploadImg(imageObj) {
            if (imageObj != undefined) {
                //设置上传对象的图片名称
                uploadOptions.fileName = imageObj.imgName;
                uploadOptions.params.fileName = imageObj.imgName;
                uploadOptions.params.id = currentId;
                uploadOptions.params.type = imageObj.type;
                var uploadObj = {};
                uploadObj.uploadOptions = uploadOptions;
                uploadObj.imageObj = imageObj;
                uploadObj.type = imageObj.type;
                uploadPush(uploadObj);
            }
        }

        function uploadPush(obj) {
            UploadPool.push(obj);
            if (UploadPool.length == beferUploadAccont) {//池满后就开始上传
                excuteUpload();
            }
        }

        function excuteUpload() {
            var uploadObj = UploadPool.pop();
            if (uploadObj != null && uploadObj != undefined) {
                var ft = new FileTransfer();
                ft.upload(uploadObj.imageObj.imgUrl, "http://220.231.153.66:8007/ReviveSmartRS/Revive/RS/UpLoadFile", uploadCallBackSuccess, uploadCallBackFail, uploadObj.uploadOptions);
            }
            function uploadCallBackSuccess(result) {
                if (result.headers.isErrorPage != undefined) {
                    if (result.headers.isErrorPage == "true") {
                        var message = eval("(" + result.response + ")");
                        console.info("[POST ERROR]errorCode:" + message.errorCode + ",errorMsg:" + message.errorMsg);
                        _CallbackOption(0, "img", message);
                        return;
                    }
                }
                //获取的数据拼接成路径
                switch (uploadObj.type) {
                    case "Usignpics":
                        UsignpicsUrl += "|" + eval('(' + result.response + ')').body.HttpPath
                        break;
                    case "Uexpendpics":
                        UexpendpicsUrl += "|" + eval('(' + result.response + ')').body.HttpPath
                        break;
                    case "Uidcardpics":
                        UidcardpicsUrl += "|" + eval('(' + result.response + ')').body.HttpPath
                        break;
                    case "Uotherpics":
                        UotherpicsUrl += "|" + eval('(' + result.response + ')').body.HttpPath
                        break;
                }
                afterUploadAccont++;
                console.info("已上传第" + afterUploadAccont + "张");
                console.info("beferUploadAccont=" + beferUploadAccont + "  afterUploadAccont=" + afterUploadAccont)
                if (beferUploadAccont == afterUploadAccont) {
                    console.info("图片已全部上传完成");
                    //修改数据库
                    var postImgParam = {
                        "head": {"RSID":"AustraliaBank"},
                        "body": {
                            "note": {"tableName": "BankCard", "pkValue": currentId},
                            "values": {
                                "Usignpics": UsignpicsUrl,
                                "Uexpendpics": UexpendpicsUrl,
                                "Uidcardpics": UidcardpicsUrl,
                                "Uotherpics": UotherpicsUrl
                            }
                        }
                    }
                    operate(postImgParam,newUrl + "UpdateModel",
                        function (data, status) {//修改数据库对应照片路径成功
                            _CallbackOption(1, "img", result);
                        },
                        function (data, status) {//修改数据库对应照片路径失败
                            _CallbackOption(0, "img", result);
                        })


                    //进行记数清零
                    beferUploadAccont = 0;
                    afterUploadAccont = 0;

                } else {
                    excuteUpload();
                }
            }

            function uploadCallBackFail(error) {
                console.info("上传照片失败");
                _CallbackOption(0, "img", error);
            }
        }


    }]);
});