define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.factory("cordovaAdapter", ['$cordovaCamera', '$cordovaNetwork', '$timeout',
        function ($cordovaCamera, $cordovaNetwork, $timeout) {
            function takePhoto(success, error) {
                var options = {
                    quality: 75,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    destinationType: Camera.DestinationType.FILE_URI,
                    /*allowEdit: false,*/
                    encodingType: Camera.EncodingType.JPEG,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false,
                    targetWidth: screen.width,
                    targetHeight: screen.height
                };
                $cordovaCamera.getPicture(options).then(function (data) {
                    console.log("data = " + data);
                    var doc = _serverURL.substring(0, _serverURL.lastIndexOf("www"));//document文件夹
                    var filelName = doc + "photos/" + new Date().getTime() + ".jpg";
                    var fileTransfer = new FileTransfer();
                    fileTransfer.download(
                        encodeURI(data), filelName, function (entry) {
                            console.log("copy to document: " + entry.toNativeURL());
                        }, function (error) {
                            console.error("An error has occurred: Code = " + error.code);
                            console.error("download error source " + error.source);
                            console.error("download error target " + error.target);
                        }
                    );
                    $timeout(function () {
                        success(filelName);
                    }, 200);

                }, error);
            }

            function signName(fileName, success, error) {
                var options = {
                    signURLType: "file",
                    signImageType: "png",
                    signFileName: new Date().getTime()
                };
                cordova.plugins.SignName.signName(function (data) {
                    var result = eval("(" + data + ")");
                    success(result.signURL);
                }, error, options);
            }

            function readMagnetCard(success, error) {
                com.hxsmart.imate.swipeCard(success, error, {card_type: "0"});
            }

            function readIcCard(success, error) {
                com.hxsmart.imate.swipeCard(success, error, {card_type: "1"});
            }

            function readIdCard(success, error) {
                com.hxsmart.imate.readIdCard(success, error);
            }

            function printer(success, error) {
                com.hxsmart.imate.printer(success, error);
            }

            function pinPad(success, error,obj) {
                com.hxsmart.imate.pinblock(success, error,obj);
            }

            function barcodeScanner(success, error) {
                var argsScanFormat = "AVMetadataObjectTypeCode128Code,AVMetadataObjectTypeQRCode,AVMetadataObjectTypeUPCECode,AVMetadataObjectTypeAztecCode,AVMetadataObjectTypeCode39Code,AVMetadataObjectTypeCode39Mod43Code,AVMetadataObjectTypeCode93Code,AVMetadataObjectTypeEAN13Code,AVMetadataObjectTypeEAN8Code,AVMetadataObjectTypePDF417Code";
                cordova.plugins.barcodeScanner.scan(success, error);
            }

            function openCard(card, success, error) {
                com.hxsmart.imate.openCard(success, error, card);
            }

            return {
                "takePhoto": takePhoto,//照相
                "signName": signName,//签名
                "readMagnetCard": readMagnetCard,//读磁条卡
                "readIcCard": readIcCard,//读IC卡
                "readIdCard": readIdCard,//读身份证
                "printer": printer,//打印机
                "pinPad": pinPad,//密码键盘
                "barcodeScanner": barcodeScanner,//条形码扫描
                "openCard": openCard//制卡
            };

        }
    ]);
});


