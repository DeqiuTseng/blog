/**
 * Created by zengqq on 2014/11/24.
 * @description 把本地数据库数据（申请人信息）上传到服务器
 * 数据上传流程：申请卡种信息提交(将会产生一个appId) --->影像资料提交 ----> 数据录入信息提交(最后一步提交)
 * 所对应的进度：-------------->----------------5%------->-------90%---------->-----------5%---->100%
 * 数据录入信息(personData)填写必须填完才能提交，假如没有影像资料信息将跳过此步骤继续进行最后的资料提交(postSubmit)
 */
define([_serverURL + 'modules/upload/_module.js', _serverURL + 'modules/upload/model/uploadParameter.js'], function (module) {
    module.factory('uploadApplyData', ['database', 'postURL', function (database, postURL) {
        var clientInfo;
        var encodeVal;
        var beferUploadAccont = 0;
        var afterUploadAccont = 0;
        var progressNumber = 0;
        var _callbackOption;
        var uploadPool = [];
        /**
         *  签名上传参数
         * @param fileName
         */
        var uploadOptions = {
            fileKey: "file",
            fileName: null,
            headers: null,
            httpMethod: null,
            mimeType: "image/jpeg",
            params: {
                appId: "",
                fileName: "",
                id: "",
                op: "OpenCard",
                passWord: "",
                remotepath: "",
                serverip: "",
                serverPort: "",
                type: "sync",
                username: ""
            }
        };

        /**
         * @description 控制器调用入口,进行单用户或批量用户资料上传
         * @param carId 客户身份证
         */
        function mainUpload(item, callbackOption) {
            if(window.networkType=="noNetwork"||window.networkStatus==-1){
                alert("请检查设备网络是否已连接");
                return;
            }
            _callbackOption = callbackOption;//上传回调
            clientInfo = item;

            if (clientInfo.photoInfo != undefined) {
                if (clientInfo.appSignNameFile != undefined) {
                    if (clientInfo.appSignNameFile.length > 0)
                        beferUploadAccont += clientInfo.appSignNameFile.length;
                }

                if (clientInfo.photoInfo.personPhoto != undefined) {
                    if (clientInfo.photoInfo.personPhoto.length > 0)
                        beferUploadAccont += parseInt(clientInfo.photoInfo.personPhoto.length);
                }

                if (clientInfo.photoInfo.mainIdCardPhoto != undefined) {
                    if (clientInfo.photoInfo.mainIdCardPhoto.length > 0)
                        beferUploadAccont += parseInt(clientInfo.photoInfo.mainIdCardPhoto.length);
                }

                if (clientInfo.photoInfo.othersPhoto != undefined) {
                    if (clientInfo.photoInfo.othersPhoto.length > 0)
                        beferUploadAccont += parseInt(clientInfo.photoInfo.othersPhoto.length);
                }

                if (clientInfo.photoInfo.sigPhoto != undefined) {
                    if (clientInfo.photoInfo.sigPhoto.length > 0)
                        beferUploadAccont += parseInt(clientInfo.photoInfo.sigPhoto.length);
                }
            }
            //产品申请
            if(item.submitStatus!=-1||item.submitStatus!="-1"){
                opCardApply(item.opCardApply);
            }else{
                alert("此客户在申请信用卡办理过程中出现中断,资料不完整.");
            }
        }

        //申请提交
        function opCardApply(opCardData) {
            postURL.postPage("openCard", opCardData.data, opCardData.url, 20000, openCardSuc, openCardFail);
        }

        function openCardFail(erro) {
            console.info(erro);
        }

        function openCardSuc(data) {
            progressShow("apply", 5);
            var postRes = eval("(" + data + ")");
            // "uploadFtpUrl": "8033|220.231.153.66|ftpName|ftpPass|CreditImage/mcFileName/|"
            var paramArray = postRes.uploadFtpUrl.split("|");
            uploadOptions.params.serverPort = trimBlank(paramArray[0]);
            uploadOptions.params.serverip = trimBlank(paramArray[1]);
            uploadOptions.params.username = trimBlank(paramArray[2]);
            uploadOptions.params.passWord = trimBlank(paramArray[3]);
            uploadOptions.params.remotepath = trimBlank(paramArray[4]);
            encodeVal = uploadOptions.params.serverip + ":" + uploadOptions.params.serverPort;
            /*uploadOptions.params.id = trimBlank(paramArray[6]);
             uploadOptions.params.op = trimBlank(paramArray[7]);
             uploadOptions.params.appID =  trimBlank(paramArray[8]);
             uploadOptions.params.postType =  trimBlank(paramArray[9]);*/

            if(beferUploadAccont!=0){
                //签名文件
                var sigNameImgArray = clientInfo.appSignNameFile;
                signNameImg(sigNameImgArray);

                //影像资料
                var photos = clientInfo.photoInfo;
                photoImgUpload(photos);
            }else{//如果没有签字文件，影像资料信息
                alert("此客户无影像资料上传");
            }
        }

        /**
         * 合约章程，个人信息签名图片
         * @param sigNameImgArray
         * @param carId
         */
        function signNameImg(sigNameImgArray) {
            ergodicArray(sigNameImgArray);
        }

        /**
         * @description 签名照影像资料
         * @param cardId 身份证Id
         * @param imageUrl 图片路径
         */
        function photoImgUpload(photos) {
            //签名照片
            var signNameFileArray = photos.sigPhoto;
            ergodicArray(signNameFileArray);

            //与拓展人合照
            var personPhotoArray = photos.personPhoto;
            ergodicArray(personPhotoArray);

            //身份证照
            var idCardPhotoArray = photos.mainIdCardPhoto;
            ergodicArray(idCardPhotoArray);

            //其它
            var othersPhotoArray = photos.othersPhoto;
            ergodicArray(othersPhotoArray);
        }

        /**
         *
         * @param result
         *
         */
        function wordinfoData(printSubmit) {
            //上传方式与影像资料不同
            console.info("数据录入信息:");
            console.info(printSubmit);
            //var url = postURL("openCardSubmit", null);
            //console.info(JSON.toString(printSubmit));
            postURL.postPage("openCardSubmit", printSubmit.data, printSubmit.url, 20000, openCardSubmitSuc, openCardSubmitFail);
            //windowInfo存在问题，先不做数据录入操作
            //openCardSubmitSuc();
        }

        function openCardSubmitSuc(result) {
            progressShow("submit", 5);
            if (result != undefined && result != null) {
                var _result = eval("(" + result + ")");
                console.info(result);
                if (_result.status == "0") {
                    //alert("上传成功");
                    //标识当前此条记录提交的状态: -1 表示"进行"，0 表示"未提交"，1 表示"已提交"
                    clientInfo.submitStatus = 1;
                    database.update(clientInfo, function () {
                        _callbackOption(clientInfo, 1, "submit");
                    }, function () {
                        _callbackOption(clientInfo, 0, "submit");
                    });
                } else {
                    _callbackOption(clientInfo, 0, "submit");
                }
            }
        }

        function openCardSubmitFail(error) {
            //error=eval("("+error+")");
            console.info("上传失败原因:code=" + error.errorCode + ",msg=" + error.errorMsg);
            _callbackOption(clientInfo, 0, "submit", error);
        }

        /**
         * 遍历对象数组
         * @param aray
         * @param idcard
         */
        function ergodicArray(array) {
            if(array.length>0){
                if (array instanceof Array) {
                    for (var i = 0; i < array.length; i++) {
                        uploadImg(array[i]);
                    }
                }
            }
        }

        /**
         * 签名，影像资料上传
         * @param imageUrl 本地存储图片Url
         * @param imageName 图片名称
         * @param imageUploadName 上传图片名称
         * @param idCard 身份证号
         */
        function uploadImg(imageObj) {
            if (imageObj != undefined) {
                //设置上传对象的图片名称
                uploadOptions.params.fileName = imageObj.imgName;
                uploadOptions.params.id = clientInfo.wordInfo.personalInfo.cardId;
                var uploadObj = {};
                uploadObj.uploadOptions = uploadOptions;
                uploadObj.imageObj = imageObj;
                uploadPush(uploadObj);
            }
        }

        function uploadPush(obj) {
            uploadPool.push(obj);
            //2 表示签名数组,签名没有写成数组的形试，无法遍历,clientInfo.sigPhoto.length
            if (uploadPool.length == beferUploadAccont) {//池满后就开始上传
                excuteUpload();
            }
        }

        function excuteUpload() {
            var uploadObj = uploadPool.pop();
            if (uploadObj != null && uploadObj != undefined) {
                var ft = new FileTransfer();
                var beforeLoad = 0;
                ft.onprogress = function (progressEvent) {
                    if (progressEvent.lengthComputable) {
                        //console.info("进度:" + progressEvent.loaded / progressEvent.total);
                        var afterLoad = (90 / beferUploadAccont) * (progressEvent.loaded / progressEvent.total);
                        var poorProgress = afterLoad - beforeLoad;//每回进度回调得到前一次进度的相差值，再进行累加
                        //console.info("相差值:" + poorProgress);
                        progressShow("img", poorProgress);
                    }
                };
                ft.upload(uploadObj.imageObj.imgUrl, encodeURI("http://" + encodeVal + "/WebSite/UploadFileAct.ebf"), uploadCallBackSuccess, uploadCallBackFail, uploadObj.uploadOptions);
            }
        }

        /**
         * @description 上传图片
         * @param imageURI 图片路径
         * @param option
         */
        function uploadCallBackSuccess(result) {
            console.info("=======uploadCallBackSuccess result:"+angular.toJson(result));
            if(result.headers!=undefined){
                if (result.headers.isErrorPage != undefined) {
                    if (result.headers.isErrorPage == "true") {
                        var message = eval("(" + result.response + ")");
                        console.info("[POST ERROR]errorCode:" + message.errorCode + ",errorMsg:" + message.errorMsg);
                        _callbackOption(clientInfo, 0, "img", message);
                        return;
                    }
                }
            }

            afterUploadAccont++;
            setProgress(clientInfo.serialId, progressNumber);
            console.info("已上传第" + afterUploadAccont + "张");
            if (beferUploadAccont == afterUploadAccont) {
                console.info("图片已部上传完成");
                //进行记数清零
                beferUploadAccont = 0;
                afterUploadAccont = 0;
                progressNumber = 0;
                var printSubmit = clientInfo.printSubmit;
                console.info(printSubmit);
                wordinfoData(printSubmit);
            } else {
                excuteUpload();
            }
        }

        function uploadCallBackFail(error) {
            _callbackOption(clientInfo, 0, "img", error);
        }

        /**
         * 去掉前后空格
         * @param param
         * @returns {*}
         */
        function trimBlank(param) {
            if (param) {
                return param.replace(/(^\s*)|(\s*$)/g, "");
            } else {
                return "";
            }
        }

        function setProgress(serialId, value) {
            //serialId 流水号
            //value 当前进度条百分比
            var progress = document.getElementById(serialId);
            progress.style.backgroundImage = "-webkit-gradient(linear,0% 0%, " + value + "% 0%, from(#1aacc3), to(#fff))";
            //console.info("value:"+value+"%");
        }

        function progressShow(type, number) {
            switch (type) {
                case"apply":
                    dynamicProgress(number);
                    break;
                case "img":
                    dynamicProgress(number);
                    break;
                case "submit":
                    dynamicProgress(number);
                    break;
                default:
                    break
            }
        }

        function dynamicProgress(number) {
            progressNumber += number;
            setProgress(clientInfo.serialId, progressNumber);
        }

        return{
            mainUpload: mainUpload//入口函数
        };
    }]);
});