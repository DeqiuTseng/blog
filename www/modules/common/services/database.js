define([_serverURL + 'modules/common/_module.js', _serverURL + 'modules/common/services/postURL.js'], function (module) {
    module.factory("database", ['$http', 'postURL',
        function ($http, postURL) {
            /*********************定义数据库*****************************/
            var initDatabase = false;
            if (typeof window.indexedDB == "undefined") {
                alert("Your system does not support webSQL and indexdDB!")
            } else {
                var request, db;

                if (!window.indexedDB) {
                    window.indexedDB = window.shimIndexedDB;
                }

                if (window.indexedDB) {
                    request = window.indexedDB.open("abc", 5);
                } else {
                    request = window.shimIndexedDB.open("abc", 5);//修复ios8.1.1的bug (indexedDB被置为null，且权限为只读，这种搞法太恶心了)
                }
                request.onsuccess = function (event) {
                    db = event.target.result;
                    console.debug("open the database successfully");
                    initDatabase = true;
                };
                request.onerror = function () {
                    console.error("unable open the database");
                };
                request.onupgradeneeded = function (event) {
                    db = event.target.result;
                    console.debug("the database is upgradeneeded");
                    initDatabase = true;
                    db.createObjectStore("Client", {keyPath: "serialId"}).createIndex("cardId", "cardId", {unique: false});//身份证号码索引
                    //  $scope.applyCardInfo.personalInfo.idNum
                    db.createObjectStore("Promotion", {keyPath: "index"});//促销活动，无索引
                    db.createObjectStore("Product", {keyPath: "index"});//人气产品
                    db.createObjectStore("PopularProduct", {keyPath: "index"});//人气产品
                    db.createObjectStore("personalInformation", {keyPath: "CapplyTime"});//用户个人信息

                };
            }


            /*********************私有方法*****************************/
            function save(type, Store, success, error) {
                var transaction = db.transaction([type], "readwrite");
                transaction.objectStore(type).add(Store);
                transaction.oncomplete = function () {
                    console.log("save success!");
                    if (typeof success != "undefined") {
                        success();
                    }
                };
                transaction.onerror = function () {
                    console.log("save error!");
                    if (typeof error != "undefined") {
                        error();
                    }
                };
            }

            function remove(type, key, success, error) {
                var transaction = db.transaction([type], "readwrite");
                transaction.oncomplete = function () {
                    console.log("remove success!");
                    if (typeof success != "undefined") {
                        success();
                    }
                };
                transaction.onerror = function () {
                    console.log("remove error!");
                    if (typeof error != "undefined") {
                        error();
                    }
                };
                transaction.objectStore(type).delete(key);
            }

            function update(type, Store, success, error) {
                var transaction = db.transaction([type], "readwrite");
                transaction.oncomplete = function () {
                    console.log("update success!");
                    if (typeof success != "undefined") {
                        success();
                    }
                };
                transaction.onerror = function () {
                    console.log("update error!");
                    if (typeof error != "undefined") {
                        error();
                    }
                };
                transaction.objectStore(type).put(Store);
            }

            function query(type, key, success, error) {
                var transaction = db.transaction([type], "readonly");
                var stores = transaction.objectStore(type).get(key);
                transaction.oncomplete = function () {
                    console.log("query success!");
                    if (typeof success != "undefined") {
                        success(stores.result);
                    }
                };
                transaction.onerror = function () {
                    console.log("query error!");
                    if (typeof error != "undefined") {
                        error();
                    }
                };
            }

            function queryAll(type, success, error) {
                var results = [];
                var objectStore = db.transaction([type], "readonly").objectStore(type);
                objectStore.openCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        success(results);
                    }

                };
                objectStore.openCursor().onerror = function () {
                    if (typeof error != "undefined") {
                        error();
                    }
                }
            }

            function isReady() {
                if (initDatabase == true) {
                    console.info("the database is ready");
                    return true;
                } else {
                    console.info("database is not ready");
                    return false;
                }

            }

            /*********************对外公开*****************************/
            function savePersonInfo(PersonInfo, success, error){
                save("personalInformation", PersonInfo, success, error);
            }
            function queryPersonInfo(key,success,error){
                query("personalInformation", key, success, error);
            }
            function queryAllPersonInfo(success, error){
                queryAll("personalInformation", success, error);
            }
            function updateAllPersonInfo(PersonInfo,success,error){
                update("personalInformation",PersonInfo,success,error);
            }
            function deletePersonInfo(key, success, error) {
                remove("personalInformation", key, success, error);
            }
            function saveClient(Client, success, error) {
                save("Client", Client, success, error);
            }

            function removeClient(key, success, error) {
                remove("Client", key, success, error);
            }

            function updateClient(Client, success, error) {
                update("Client", Client, success, error);
            }

            function queryClient(key, success, error) {
                query("Client", key, success, error);
            }

            function queryAllClient(success, error) {
                queryAll("Client", success, error);
            }

            function queryAllPromotion(success, error) {
                queryAll("Promotion", success, error);
            }

            function queryAllProduct(success, error) {
                queryAll("Product", success, error);
            }

            function queryAllPopularProduct(success, error) {
                queryAll("PopularProduct", success, error);
            }


            /* var options = {
             "ProductCurrency": "4",
             "ProductBrand": "000",
             "ProductType": "0003",
             "ProductRank": "0003",
             "ProductMedium": "0003",
             "ProductName": "You惠生活卡普卡"
             };*/

            function compare(obj, opts) {
                //如果条件为空或者两者相等，则返回真，否则返回假
                return (opts == undefined) || (opts == "") || (parseInt(opts) == parseInt(obj));
            }

            function compareName(obj, opts) {
                return (opts == undefined) || (opts == "") || (obj.ProductName.indexOf(opts) > 0);//比较名字采用模糊匹配
            }

            function queryProductByOptions(options, success, error) {
                //此接口暂无测试
                queryAll("Product", function (results) {
                    var newResults = [];
                    for (var i = 0; i < results.length; i++) {
                        //先判断条件
                        if (compare(results[i].ProductCurrency, options.ProductCurrency)
                            && (compare(results[i].ProductBrand, options.ProductBrand))
                            && (compare(results[i].ProductType, options.ProductType))
                            && (compare(results[i].ProductRank, options.ProductRank))
                            && (compare(results[i].ProductMedium, options.ProductMedium))
                            && (compareName(results[i].ProductName, options.ProductName))
                        ) {
                            newResults.push(results[i]);
                        }
                    }
                    success(newResults);
                }, function () {
                    error();
                });
            }

            function updateAll() {
                var data = "CardScope=0001&CardBrand=&CardCurrency=&CardRank=&CardMedium=&CardType=00&ProductName=";
                saveAll("Product", "productList", data);
                saveAll("Promotion", "activity", "");
                saveAll("PopularProduct", "getProList", "");
            }

            function transferUrl(serverURL, path) {
                //_serverURL = "cdvfile://localhost/persistent/www/"; (ios平台)
                var doc = _serverURL.substring(0, _serverURL.lastIndexOf("www"));//document文件夹
                var suffix = serverURL.substring(serverURL.lastIndexOf("/"));//取文件名
                return doc + path + suffix;
            }

            function downLoad(serverURL, path) {
                var fileTransfer = new FileTransfer();
                var nativeFile = transferUrl(serverURL, path);
                fileTransfer.download(
                    encodeURI(serverURL), nativeFile, function (entry) {
                        console.log("download complete: " + entry.toNativeURL());
                    }, function (error) {
                        console.error("An error has occurred: Code = " + error.code);
                        console.error("download error source " + error.source);
                        console.error("download error target " + error.target);
                    }
                );
            }

            function saveAll(type, serverUrl, params) {
                var transaction = db.transaction([type], "readwrite");
                var timeoutDate = 30000;
                var url = postURL.getPostUrl(serverUrl);
                postURL.postPage(serverUrl, params, url, timeoutDate, function (data) {
                    data = eval('(' + data + ')');
                    if (data.errorMsg) {
                        alert(data.errorMsg);
                    }
                    console.log("find " + type + " --- " + data.length);
                    for (var i = 0; i < data.length; i++) {
                        switch (type) {
                            case "Promotion":
                                downLoad(data[i].SalesCampaignThumbnailImg, "Promotion");//下载缩略图
                                downLoad(data[i].SalesCampaignImg, "/Promotion");//下载大图
                                data[i].SalesCampaignThumbnailImg = transferUrl(data[i].SalesCampaignThumbnailImg, "Promotion");//更改路径后保存促销活动
                                data[i].SalesCampaignImg = transferUrl(data[i].SalesCampaignImg, "Promotion");
                                break;
                            case "Product":
                                downLoad(data[i].imgUrl, "/Product");//下载人气产品
                                data[i].imgUrl = transferUrl(data[i].imgUrl, "Product");//更改路径后保存人气产品
                                break;
                            case "PopularProduct":
                                data[i].imgUrl = transferUrl(data[i].imgUrl, "Product");
                                break;
                            default :
                                console.error("undefined type!");
                        }
                        transaction.objectStore(type).put(data[i]);
                    }
                    console.info("更新成功" + type + "成功，共计" + data.length + "条");
                }, function () {
                    console.error("更新失败");
                });

                transaction.oncomplete = function () {
                    console.log("save all success!");
                };
                transaction.onerror = function () {
                    console.log("save all error!");
                };

            }

            function clearType(type) {
                var transaction = db.transaction([type], "readwrite");
                transaction.objectStore(type).clear();
                transaction.oncomplete = function () {
                    console.log("成功删除类型为" + type + "数据")
                };
                transaction.onerror = function () {
                    console.error("无法删除类型为" + type + "数据")
                };
            }


            return {
                "deletePersonInfo":deletePersonInfo,
                "updatePersonInfo":updateAllPersonInfo,//更新用户的信息
                "savePersonInfo":savePersonInfo,//保存填写的用户个人信息
                "save": saveClient,//保存客户信息
                "remove": removeClient,//移除客户信息
                "update": updateClient,//更新客户信息
                "isReady": isReady,//检测是否初始化完成
                "query": queryClient,//查找客户信息
                "queryPersonInfo":queryPersonInfo,//查找填写的用户个人信息
                "queryAllPersonInfo":queryAllPersonInfo,//查询所有填写的用户个人信息
                "queryAllClient": queryAllClient,//查找所有客户信息
                "queryAllPromotion": queryAllPromotion,//查询所有促销活动
                "queryAllProduct": queryAllProduct,//查询所有产品
                "queryAllPopularProduct": queryAllPopularProduct,//查询所有产品
                "queryProductByOptions": queryProductByOptions,//多条件查找产品
                "clearType": clearType, //清空一种数据类型
                "updateAll": updateAll//更新本地数据库，目前包括促销活动(Promotion)、产品(Product)、人气产品(PopularProduct)
            };

        }
    ]);
});


