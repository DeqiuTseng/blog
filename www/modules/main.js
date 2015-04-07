var _serverURL = localStorage.getItem("_serverURL");//判断是否测试环境
/**
 * 使用cordova 重写Alert
 * @param message
 */
window.alert = function (message) {
    navigator.notification.alert(
        message,  // message
        null,// callback
        '系统提示',// title
        '确定'// buttonName
    );
};
console.info("===================================2");
if (_serverURL == null) {
    _serverURL = "/www/";
    require.config({
        paths: {// 配置模块以及对应路径
            //注意：更新为半脱机版之后，路径名霿Ɓ从Localstorage获取，动态配罿
            'ionic': '../lib/ionic/js/ionic.bundle',//已经引入了angular
            'ngCordova': '../lib/ngCordova/dist/ng-cordova',
            'indexeddb': '../lib/IndexedDBShim/dist/IndexedDBShim',//解决indexdDB数据库的平台兼容问题
            'jquery': "../lib/jquery/jquery-1.11.1.min",
            'socketio':"../lib/socketio/socket.io"
        },
        shim: {//配置依赖关系
            'ionic': {
                deps: ['jquery']
            },
            'ngCordova': {
                deps: ['ionic']
            },
            'remoteApp': {
                deps: ['ionic']
            }
        },
        waitSeconds: 0
    });
}

var isApplying = false;//判断是否正在开卡

var styles = ["css/common/hxswipe.css",
    "css/common/common.css",
    "css/common/instruct.css",
    "css/apply/proDuct/productDetail.css",
    "css/apply/proDuct/productShow.css",
    "css/apply/apply.css",
    "css/apply/checkMailer.css",
    "css/home.css",
    "css/recommend.css",
    "css/promotion.css",
    "css/query.css",
    "css/upload.css",
    "css/setting.css",
    "css/apply/chipPersonal.css",
    //"css/apply/takePhoto.css",
    "css/apply/changePwd.css",
    "css/apply/readIdCard.css",
    "css/apply/contract.css",
    "css/apply/video.css"
];
function addStyle(path) {
    if (!path || path.length === 0) {
        throw new Error('argument "path" is required !');
    }
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.href = path;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
}
function addAllStyle() {
    for (var i = 0; i < styles.length; i++) {
        addStyle(_serverURL + styles[i]);
    }
}
addAllStyle();


require([_serverURL + 'modules/app.js'], function () {
    'use strict';
    console.info("loading remote app js file....");
    /*
     var $injector = angular.injector(['ng']);
     $injector.invoke(function ($rootScope, $compile, $document) {
     $rootScope._serverURL = window.localStorage.getItem("_serverURL");
     });*/

    angular.bootstrap(document, ['app']);//所有模块加载完毕，再手动启动


});