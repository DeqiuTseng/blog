/**
 * Created by lenovo on 2015/2/28.
 * @description:创建一个实体service,在两个Ctrl同时使用同一个对象进行数据同步，
 * 例如在applyCtrl设置service对象的值,在uploadCtrl获取此对象值
 * @Author:zengqq
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.service("entity", ["$ionicLoading", "$http", function ($ionicLoading, $http) {
        /**
         * 通过window.isSysOffline 或者 $scope.isSysOffline判断当前是否处于脱机模式
         * 如果处于脱机模式，则不需要调用接用接口
         * 直接从以下Json对象offlineData获取数据
         */
        this.offlineData={productAplay://接口名
                "postPage成功回调数据"//调用联机接口反回过来的数据
        };
    }
    ]);
});
