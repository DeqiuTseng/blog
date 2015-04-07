define([_serverURL + 'modules/home/_module.js', _serverURL + 'modules/home/controllers/initData.js'], function (module, data) {
    module.controller('homeCtrl', ['$scope', '$timeout','database', function ($scope, $timeout,database) {
            var thisCard = 0; //记录当前照片
            var cards = data.cards;//测试期间的硬编码

            $scope._serverURL = _serverURL;
            $scope.slides = data.slides;//初始化促销活动
            $scope.animate = "bounceInRight1";//表面上是切换了动画，实际上只是个副本
            $scope.card = cards[0];

            $scope.toApply = function (obj) {
                location.href = "#/tab/apply";
                $timeout(function () {
                    var applyDom = document.getElementById("apply");
                    var applyScope = angular.element(applyDom).scope();
                    applyScope.$apply(function () {
                        applyScope.chooseProduct(obj);
                    });
                }, 50);

            };
            $scope.nextCard = function () {
                thisCard++;
                if (thisCard >= cards.length) {
                    thisCard = 0;
                }
                $scope.card = cards[thisCard];
                changeClass();
            };
            function changeClass() {
                //不换汤，也不换药
                if ($scope.animate == "bounceInRight1") {
                    $scope.animate = "bounceInRight2";
                } else {
                    $scope.animate = "bounceInRight1";
                }
            }
        }]
    )
});


