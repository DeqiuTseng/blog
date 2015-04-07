define([_serverURL + 'modules/upload/_module.js'], function (module) {
    module.controller('uploadDetailCtrl', ['$scope', '$timeout', 'database', 'cordovaAdapter', function ($scope, $timeout, database, cordovaAdapter) {

            $scope.tabStyleArray = ['button-calm', null];//tab按键样式
            $scope.curPage = true;//tab当前页显示标志

            $scope.tab = function (index) {
                for (i in $scope.tabStyleArray) {
                    $scope.tabStyleArray[i] = null;
                }
                $scope.tabStyleArray[index] = 'button-calm';
                $scope.curPage = !index;
            };

            $scope.signPic = true;

        }]
    );
});


