define([_serverURL + 'modules/setting/_module.js'], function (module) {
    module.controller('settingCtrl', ['$scope', '$timeout', '$ionicLoading', 'database', function ($scope, $timeout, $ionicLoading, database) {


            $scope.clearData = function () {
                function onPrompt(results) {
                    if (results.buttonIndex == 1) {
                        if (results.input1 == $scope.commonData.sysUserPass) {
                            $ionicLoading.show({
                                template: '正在清空数据...'
                            });
                            /*
                            if (window.indexedDB) {
                             window.indexedDB.deleteDatabase("abc");//清空中国农业银行数据库
                             } else {
                             window.shimIndexedDB.deleteDatabase("abc");//ios8.1的漏洞
                             }*/
                            //暂时把客户信息保留吧！

                            database.clearType("Promotion");
                            database.clearType("Product");
                            database.clearType("PopularProduct");
                            localStorage.removeItem("isInit");
                            localStorage.removeItem("initUpload");
                            $timeout(function () {
                                $ionicLoading.hide();
                                location.href = "initSet.html"; //不必退出系统，跳转到主页即可
                            }, 2000);
                        } else {
                            navigator.notification.alert(
                                '密码错误',  // message
                                null,         // callback
                                "系统提示",            // title
                                '好'                  // buttonName
                            );
                        }

                    } else {
                        console.log("神马也不做");
                    }

                }

                navigator.notification.prompt(
                    '请输入登录密码',  // message
                    onPrompt,                  // callback to invoke
                    '系统提示',            // title
                    ['确定', '取消'],             // buttonLabels
                    ''                 // defaultText
                );
            };
        }]
    );
});


