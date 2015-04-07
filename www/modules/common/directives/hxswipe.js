define([_serverURL+'modules/common/_module.js'], function(dirmodule) {
    'use strict';
    // 定义hxSwipeWrapper指令
    dirmodule.directive('hxSwipeWrapper', ['$timeout', '$document',
        function($timeout, $document) {
            return {
                restrict: "A",
                scope: {
                    centerfun: "&centerfun"
                },
                controller: function($scope, $element, $attrs) {
                    // 定义数组保存子元素slide
                    var slides = $scope.slides = [];
                    var indexs = [];
                    // 父容器的中心x方向坐标
                    var centerX = $element.parent().prop('offsetWidth') / 2;

                    var centerfunction = function(index) {
                    };

                    if ($scope.centerfun == undefined) {
                        alert("scope.centerfun == undefined");
                        $scope.centerfun = centerfunction;
                    }

                    // 一些变量保存配置信息
                    $scope.cur = 0;
                    $scope.limit = 3;
                    $scope.swheight = 360;
                    $scope.left = 0;
                    $scope.use3d = false;
                    $scope.cSpeed = 16;

                    // 从属性中获取配置信息
                    if ($attrs.limit != undefined) {
                        $scope.limit = parseInt($attrs.limit);
                    }
                    if ($attrs.swheight != undefined) {
                        $scope.swheight = parseInt($attrs.swheight);
                    }
                    if ($attrs.use3d != undefined) {
                        $scope.use3d = true;
                    }
                    if ($attrs.cspeed != undefined) {
                        $scope.cSpeed = parseInt($attrs.cspeed);
                    }

                    // 根据子元素的多少初始化自己的宽度，并将中间位置点的元素居中显示
                    $scope.initSlides = function() {
                        // console.log("------initSlides");
                        var w = 0;
                        for (var i = 0; i < slides.length; i++) {
                            w += slides[i].prop('offsetWidth');
                        };
                        $element.css({
                            width: w + 'px',
                            height: $scope.swheight + 'px'
                        });

                        if ($scope.use3d) {
                            $scope.cur = parseInt(slides.length / 2);
                        }
                        $scope.left = centerX - (slides[$scope.cur].prop('offsetLeft') + slides[$scope.cur].prop('offsetWidth') / 2);

                        $scope.SetTransform();
                        $scope.centerfun({index: indexs[$scope.cur]});
                    }

                    // 根据滑动的位移移动自己的位置
                    $scope.moveSlides = function(deltaX) {
                        var x;
                        var limit = 10;
                        $scope.left += deltaX;

                        // 下面的代码实现循环滑动
                        x = $scope.left + slides[$scope.cur].prop('offsetLeft') + slides[$scope.cur].prop('offsetWidth') / 2;
                        if (deltaX > 0) {
                            if (x > (centerX+limit) && $scope.cur > 0) {
                                $scope.cur--;
                                if ($scope.use3d && $scope.cur < $scope.limit) {
                                    $scope.left -= $scope.ChangeSlide(false);
                                    $scope.cur++;
                                }
                            }
                        } else {
                            if (x < (centerX-limit) && $scope.cur < (slides.length-1)) {
                                $scope.cur++;
                                if ($scope.use3d && $scope.cur > (slides.length-$scope.limit)) {
                                    $scope.left += $scope.ChangeSlide(true);
                                    $scope.cur--;
                                }
                            }
                        }

                        $scope.SetTransform();
                    }

                    // 判断自己的位置是否居中了，定时循环移动直到位置居中
                    $scope.centerSlides = function() {
                        var x, offset;
                        var limit = $scope.cSpeed;
                        x = $scope.left + slides[$scope.cur].prop('offsetLeft') + slides[$scope.cur].prop('offsetWidth') / 2;
                        if (x == centerX) {
                            $scope.centerfun({index: indexs[$scope.cur]});
                            return;
                        }
                        if (x > centerX) {
                            if (x > (centerX + limit)) {
                                offset = -limit;
                                $timeout($scope.centerSlides, 10);
                            } else {
                                offset = centerX - x;
                                $scope.centerfun({index: indexs[$scope.cur]});
                            }
                        } else {
                            if (x < (centerX - limit)) {
                                offset = limit;
                                $timeout($scope.centerSlides, 10);
                            } else {
                                offset = centerX - x;
                                $scope.centerfun({index: indexs[$scope.cur]});
                            }
                        }
                        $scope.left += offset;
                        $scope.SetTransform();
                    }

                    // 将第一个dom元素放在尾部或者把尾部dom元素放在头部
                    $scope.ChangeSlide = function(append) {
                        var child, index;
                        if (append) {
                            child = slides.shift();
                            index = indexs.shift();
                            $element.append(child);
                            slides.push(child);
                            indexs.push(index);
                        } else {
                            child = slides.pop();
                            index = indexs.pop();
                            $element.prepend(child);
                            slides.unshift(child);
                            indexs.unshift(index);
                        }
                        return child.prop('offsetWidth');
                    }

                    // 通过样式设置当前位置
                    $scope.SetTransform = function() {
                        $element.css({
                            left: $scope.left + 'px'
                        });

                        if (!$scope.use3d) {
                            return;
                        }

                        // 下面的代码对每一个子元素设置3D样式，主要是z轴景深
                        var translateX, translateZ, rotateY, zIndex;
                        var x, offset;
                        var slide;

                        for (var i = 0; i < slides.length; i++) {
                            if (Math.abs($scope.cur - i) > $scope.limit) {
                                continue;
                            }

                            slide = slides[i];

                            x = $scope.left + slide.prop('offsetLeft') + slide.prop('offsetWidth') / 2;
                            offset = centerX - x;
                            translateX = 0;
                            translateZ = -Math.abs(offset);
                            rotateY = parseInt(offset / 50);
                            zIndex = 2 - Math.abs($scope.cur - i);

                            slide.css({
                                'transform': 'translate3d(' + translateX + 'px,' + 0 + 'px,' + translateZ + 'px) rotateY(' + rotateY + 'deg)',
                                '-webkit-transform': 'translate3d(' + translateX + 'px,' + 0 + 'px,' + translateZ + 'px) rotateY(' + rotateY + 'deg)',
                                'z-index': zIndex
                            });
                        }
                    }

                    // 提供子元素注册的方法
                    this.addSlide = function(slide, index) {
                        slides.push(slide);
                        indexs.push(index);
                    };
                },
                link: function(scope, element, attrs) {
                    // 获取点击的坐标
                    function getCoordinates(event) {
                        var touches = event.touches && event.touches.length ? event.touches : [event];
                        var e = (event.changedTouches && event.changedTouches[0]) ||
                            (event.originalEvent && event.originalEvent.changedTouches &&
                                event.originalEvent.changedTouches[0]) ||
                            touches[0].originalEvent || touches[0];

                        return {
                          x: e.clientX,
                          y: e.clientY
                        };
                    }

                    // 子元素加载完成后，执行初始化
                    scope.$watch('slides.length', function(count) {
                        if (0 == count)
                            return;
                        scope.initSlides();
                    });

                    // 下面的代码响应触摸消息
                    var startX = 0,
                        startY = 0;
                    var moved = false;
                    var msgDown = 'touchstart', msgMove = 'touchmove', msgUp = 'touchend';
                    var isBrower = navigator.userAgent.toLowerCase().indexOf("windows") > 0 ? true : false;
                    if (isBrower) {
                        msgDown = 'mousedown';
                        msgMove = 'mousemove';
                        msgUp = 'mouseup';
                    }
                    var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > 0 ? true : false;

                    element.on(msgDown, mousedown);

                    function mousedown(event) {
                        var touch = getCoordinates(event);
                        startX = touch.x;
                        startY = touch.y;
                        moved = false;

                        $document.on(msgMove, mousemove);
                        $document.on(msgUp, mouseup);
                        
                        //event.touches.length == 1
                        if (isBrower && scope.use3d) {
                            event.preventDefault();
                        }
                    }

                    function mousemove(event) {
                    	var touch = getCoordinates(event);
                        var deltaY = touch.y - startY;
                        var deltaX = touch.x - startX;
                        startX = touch.x;
                        startY = touch.y;
                        if (deltaX < 2 && deltaX > -2) {
                        } else {
                            moved = true;
                            scope.moveSlides(deltaX);
                        }

                        if (isAndroid) {
                            event.preventDefault();
                        }
                    }

                    function mouseup(event) {
                        $document.off(msgMove, mousemove);
                        $document.off(msgUp, mouseup);

                        if (moved) {
                            scope.centerSlides();
                        }
                    }
                }
            };
        }
    ]);

    // 定义hxSwipeSlide指令
    dirmodule.directive('hxSwipeSlide', [
        function() {
            return {
                require: '^hxSwipeWrapper',
                restrict: "A",
                link: function(scope, element, attrs, wrapCtrl) {
                    // 调用父指令的控制器实例方法，添加自己
                    var index = 0;
                    if (attrs.index != undefined) {
                        index = scope.$eval(attrs.index);
                    }
                    wrapCtrl.addSlide(element, index);
                }
            };
        }
    ]);
});