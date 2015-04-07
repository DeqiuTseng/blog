define([
    'ionic',
    'ngCordova',
    _serverURL + 'modules/common/namespace.js',
    _serverURL + 'modules/home/namespace.js',
    _serverURL + 'modules/apply/namespace.js',
    _serverURL + 'modules/upload/namespace.js',
    _serverURL + 'modules/setting/namespace.js'
], function () {
    'use strict';
    return angular.module('app', ['ionic', 'ngCordova', 'app.common', 'app.home', 'app.apply', 'app.upload', 'app.setting'], function ($compileProvider, $sceProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|cdvfile|data):/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|cdvfile|data):/);
        $sceProvider.enabled(false);
    })
        /*    .run(['$ionicPlatform', function ($ionicPlatform) {
         $ionicPlatform.ready(function () {
         if (window.cordova && window.cordova.plugins.Keyboard) {
         cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
         }
         if (window.StatusBar) {
         StatusBar.styleDefault();
         }
         });
         }])*/
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {//配置路由
            //系统参数初使化

            $stateProvider
                .state('tab', {
                    url: "/tab",
                    abstract: true,
                    templateUrl: _serverURL + "modules/tabs.html"
                })
                .state('tab.home', {
                    url: '/home',
                    views: {
                        'tab-home': {
                            templateUrl: _serverURL + 'modules/home/home.html',
                            controller: 'homeCtrl'
                        }
                    }
                })
                .state('tab.apply', {
                    url: '/apply',
                    views: {
                        'tab-apply': {
                            templateUrl: _serverURL + 'modules/apply/apply.html',
                            controller: 'applyCtrl'
                        }
                    }
                })
                .state('tab.upload', {
                    url: '/upload',
                    views: {
                        'tab-upload': {
                            templateUrl: _serverURL + 'modules/upload/upload.html',
                            controller: 'uploadCtrl'
                        }
                    }
                }).state('tab.setting', {
                    url: '/setting',
                    views: {
                        'tab-setting': {
                            templateUrl: _serverURL + 'modules/setting/setting.html',
                            controller: 'settingCtrl'
                        }
                    }
                });
            $urlRouterProvider.otherwise('/tab/home');
        }]);
});
