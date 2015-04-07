/**
 * socket.io通讯服务
 * 安装方法：npm install
 * 运行方法：node socket-server.js
 * @肖大叔
 */

/**************************************配置各种参数**************************************/
var svc = 'http://192.168.169.217:8080/AustraliaShow/emplist.svc';//OData服务地址
var freshPassedTime = 3000;//刷新已审核通过的间隔时间
var freshUnPassedTime = 5000;//刷新未审核通过的间隔时间


/**************************************定义Map对象，存储登录信息**************************************/
function Map() {
    this.elements =[];

    //获取MAP元素个数
    this.size = function () {
        return this.elements.length;
    };

    //判断MAP是否为空
    this.isEmpty = function () {
        return (this.elements.length < 1);
    };

    //删除MAP所有元素
    this.clear = function () {
        this.elements = [];
    };

    //向MAP中增加元素（key, value)
    this.put = function (_key, _value) {
        this.elements.push({
            key: _key,
            value: _value
        });
    };

    //删除指定KEY的元素，成功返回True，失败返回False
    this.removeByKey = function (_key) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    this.elements.splice(i, 1);
                    return true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //获取指定KEY的元素值VALUE，失败返回NULL
    this.get = function (_key) {
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    return this.elements[i].value;
                }
            }
        } catch (e) {
            return false;
        }
        return false;
    };

    //获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
    this.element = function (_index) {
        if (_index < 0 || _index >= this.elements.length) {
            return null;
        }
        return this.elements[_index];
    };

    //判断MAP中是否含有指定KEY的元素
    this.containsKey = function (_key) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };

    //判断MAP中是否含有指定VALUE的元素
    this.containsValue = function (_value) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].value == _value) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    };


    //获取MAP中所有VALUE的数组（ARRAY）
    this.values = function () {
        var arr = [];
        for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].value);
        }
        return arr;
    };

    //获取MAP中所有KEY的数组（ARRAY）
    this.keys = function () {
        var arr = [];
        for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].key);
        }
        return arr;
    };
}

/**************************************开启一个端口，作为socket的容器**************************************/
var http = require('http');
var request = require('request');

var server = http.createServer(function (req, res) {
    // 服务器不理会任何请求，专心致志做自己的通讯

});
var port = 8880;
server.listen(port);
console.log("通讯服务已经启动，你的端口是：" + port);


/**************************************澳洲联邦银行的业务**************************************/
var map = new Map();
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    console.log(socket.id + "即将进入");
    socket.on('login', function (message) {
        console.log(message.group + "-" + message.id + " 登录成功");
        if (map.containsKey(message.id)) {
            map.removeByKey(message.id);//如果用户已经登录了，就把它挤下线
        }
        map.put(message.id, socket);//登录之后，把socket保存在map里面，必要时进行单播
    });

    socket.on('message', function (message) {
        //只有我向别人发送数据，不会有别人向我打招呼的！
    });

    socket.on('disconnect', function () {
        console.log(socket.id + "已经离开");
    });

    socket.on("exit", function (message) {
        map.removeByKey(message.id);
        console.log(message.group + "-" + message.id + "注销成功");
    })

});

function sendMessage(message) {
    //定义发送数据的方法
    if (message.id == undefined || message.group == undefined) {
        console.log("系统错误!信息不合法！！");
        return false;
    }

    switch (message.group) {
        case "examiners" :
            console.log("正在发送广播信息");
            io.send(message);//io即所有正在连接的socket
            break;
        case "clients":
            if ((map.get(message.id)) == false) {
                console.log("用户未登录！");
            } else {
                console.log("正在向客户" + message.id + "发送消息");
                map.get(message.id).send(message);
            }
            break;
        default :
            console.log("未知目标");
            return false;
    }
}

/**************************************定时查询，并发送数据**************************************/
function checkUnPass() {
    //console.log("正在扫描未审核的数据");
    var options = {
        url: encodeURI(svc + "/BankCards/?$filter=ChandleStatus eq '未审批'"),
        headers: {
            'Content-Type': 'application/json;odata=verbose;charset=UTF-8',
            'Accept': 'application/json'
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var message = {
                "group": "examiners",
                "id": "rick",
                "data": info.d.results
            };
            if (info.d.results.length >= 0) {
                console.log("查询到" + info.d.results.length + "条未审批记录");
                sendMessage(message);
            }
        } else {
            console.log("ERROR:" + error);
        }
    }

    request(options, callback);
}
function checkPassed() {
    //console.log("正在扫描已通过审核的数据");
    var options = {
        url: encodeURI(svc + "/BankCards/?$filter=ChandleStatus eq '已审批'"),
        headers: {
            'Content-Type': 'application/json;odata=verbose;charset=UTF-8',
            'Accept': 'application/json'
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var message = {
                "group": "clients",
                "id": {},
                "data": {}
            };
            if (info.d.results.length > 0) {
                console.log("查询到" + info.d.results.length + "条已审批记录");
            }
            for (var i = 0; i < info.d.results.length; i++) {
                message.id = info.d.results[i].Unumber;
                message.data = info.d.results[i];
                sendMessage(message);//逐一发送消息
            }
        } else {
            console.log("ERROR:" + error);
        }
    }

    request(options, callback);
}


var freshPassedCount = 0;//记录查询次数，方便开发时调试
var freshUnPassedCount = 0;

setInterval(function () {
    console.log("第" + (++freshPassedCount) + "次查询已审批记录... ...");
    checkPassed();
}, freshPassedTime);
setInterval(function () {
    console.log("第" + (++freshUnPassedCount) + "次查询未审批记录... ...");
    checkUnPass();
}, freshUnPassedTime);
