/**
 * 最外层的控制器
 */
define([_serverURL + 'modules/common/_module.js','socketio'], function (module,socketio) {
    module.controller('commonCtrl', ['$scope', 'postURL', '$timeout', '$filter', 'database',function ($scope, postURL, $timeout, $filter,database) {
            $scope._serverURL = _serverURL;
            var list="";
            $scope.badges = {//任何一个自控制器都可以更新这个对象
                clientItems: 0,
                promotionItems: 0
            };
            $scope.userInfoMessage={
                info:list
            }
            var personInfo=""
            //获取从数据库中获取的所有申请信用卡的用户信息
            $scope.$on("allPersonInfo",function(result){
                personInfo=result;
            });

            $scope.select = function (param) {
                if (isApplying) {
                    navigator.notification.confirm(
                        '离开将导致申请信息丢失，是否确认退出？',
                        function (button) {
                            if (button == 1) {
                                location.href = "#/tab/" + param;
                                isApplying = false;
                                $scope.commonData.currentModule = param;
                            }
                        },
                        '系统提示',
                        ['是', '否']
                    );
                } else {
                    if ($scope.commonData.currentModule != param) {
                        //跳转到其他模块
                        location.href = "#/tab/" + param;
                        $scope.commonData.currentModule = param;
                    } else {
                        //既然都是自己模块了，就神马也不做
                    }

                }
            };


            $scope.SysUserName = window.localStorage.getItem("sysUserName");
            $scope.SysUserPass = window.localStorage.getItem("sysUserPass");
            $scope.exit = function () {
                var data = "loginId=" + $scope.SysUserName + "&password=" + $scope.SysUserPass;
                var url = postURL.getPostUrl("exit", "exit");
                var timeoutDate = 1000;
                postURL.postPage("", data, url, timeoutDate, exitSuc, exitFail);
                if(window.networkStatus==-1) {
                    //没网络状态，直接跳出来
                        $scope.SysUserName = "";
                        $scope.SysUserPass = "";
                        location.href = "initSet.html";
                }
            };
            function exitSuc(result) {
                $timeout(function () {
                    $scope.$apply(function () {
                        $scope.SysUserName = "";
                        $scope.SysUserPass = "";
                        location.href = "initSet.html";
                    });
                });
            }

            function exitFail(result) {
            }


            //公共数据
            $scope.commonData = {
                "lastLoginTime": "2014-01-02 03:04",//最后登录时间
                "lastUpdateTime": "2014-05-06 07:08",//最后更新时间
                "sysUserName": localStorage.getItem("sysUserName") ? localStorage.getItem("sysUserName") : "hxsmart",//用户名
                "sysUserPass": localStorage.getItem("sysUserPass") ? localStorage.getItem("sysUserPass") : "82737550",//密码
                "sysVersion": "12.23 Build1.04",//系统版本
                "currentModule": "home",//当前模块
                "socket":{}
            };

            //判断当前为否为脱机模式
            window.isSysOffline=$scope.isSysOffline=function(){
                if($scope.commonData.sysUserName=="hxsmart" && $scope.commonData.sysUserPass=="82737550" && window.networkStatus==-1) {
                        return true;
                }else{
                        return false;
                }
            };

            $scope.commonData.lastLoginTime = $filter('date')(new Date(), "yyyy-MM-dd hh:mm");
            $scope.commonData.serverURL = "http://" + localStorage._serverIp + ":" + localStorage._serverPort;
            window.localStorage.setItem("lastLoginTime", $scope.commonData.lastLoginTime);



            //socket.io例子
                $timeout(function () {
                    console.log("准备连接...");
                    $scope.commonData.socket = socketio.connect("http://220.231.153.66:8880");//1、连接
                    //$scope.commonData.socket = socketio.connect("http://192.168.160.248:8880");//1、连接
                    //$scope.commonData.socket = socketio.connect("http://192.168.169.217:8880");//1、连接
                }, 2000);
                $timeout(function () {
                    $scope.badges.clientItems=0;
                    $scope.commonData.socket.emit("login", {
                        "group": "clients",
                        "id": $scope.commonData.sysUserName//"admin"
                    });//2、PAD登录
                    $scope.commonData.socket.on("message", function (message) {
                        list=[];
                        console.log(message);
                        if (message.group  == "clients"){
                            //console.info("收到消息："+ angular.toJson(message.data.UzhName))
                            if(personInfo.targetScope){
                                for(var i=0;i<personInfo.targetScope.items.length;i++){
                                    //console.info("+++++++++++++"+personInfo.targetScope.items[i].UhomeAdd)
                                    //判断中文名字，省份证id，还是申请时间是否都是相同的
                                    if(personInfo.targetScope.items[i].UzhName==message.data.UzhName&&personInfo.targetScope.items[i].UidCard==message.data.UidCard&&personInfo.targetScope.items[i].CapplyTime==message.data.CapplyTime){
                                        //审批状态发生改变并且域本地数据库的审批状态不一致时才更新本地数据库
                                        if(/*message.data.ChandleStatus!="未审批"&&*/message.data.ChandleStatus!=personInfo.targetScope.items[i].ChandleStatus){
                                            personInfo.targetScope.items[i].approveStatus=true;
                                            personInfo.targetScope.items[i].ChandleStatus=message.data.ChandleStatus //更改本地数据库中的审批状态
                                            database.updatePersonInfo(personInfo.targetScope.items[i],
                                                function () {
                                                    console.log("跟新个人信息本地审批状态记录成功！");
                                                    $scope.$broadcast('updatePersonInfo','')
                                                },
                                                function () {
                                                    console.log("跟新个人信息本地审批状态记录失败！");
                                                })
                                            //false为审批不通过，true为审批通过
                                            $scope.$apply(function () {
                                                personInfo.targetScope.items[i].approveStatus=true;
                                                personInfo.targetScope.approve[i]=true;
                                            })
                                        }

                                        /*//false为审批不通过，true为审批通过
                                         $scope.$apply(function () {
                                         personInfo.targetScope.items[i].approveStatus=true;
                                         personInfo.targetScope.approve[i]=true;
                                         })*/
                                    }
                                }
                            }

                            //$scope.badges.clientItems+=1

                        }

                    });//3、监听
                    //此外，还有send：发送、emit('exit')：注销，或者自定义其它事件
                }, 5000);
        }]
    )
});


