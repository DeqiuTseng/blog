define([_serverURL+'modules/common/_module.js'], function(module) {
    'use strict';
    module.directive("myLogin",function($timeout){
            return {
                restrict :"E",
                templateUrl :"loginTemplate.html",
                scope:{
                    loginClick:"&loginclick",
                    loginread:"&loginread",
                    loginInit:"&init"

                },
                link:function(scope,element,attris){
                    //获得焦点事件
                    scope.loginNumisFoucs = function(){
                        document.getElementById('readId').style.visibility="visible";
                    }
                    //失去焦点事件
                    scope.loginNumisBlur=function(){
                        $timeout(function(){
                            document.getElementById('readId').style.visibility="hidden";
                        },100)
                    }
                    scope.checkLog = function(){
                        var loginForm = document.getElementById("loginForm");
                        scope.loginClick(loginForm);
                    }
                }
            }
        })

});




