var HXiMateDeviceSDK = {
    swipeCard: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "swipeCard",
            [resultType]);
    },
    openCard: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "openCard",
            [resultType]);
    },
    readIdCard: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "readIdCard",
            [resultType]);
    },
    printer: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "printer",
            [resultType]);
    },
    downloadMasterKey: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "downloadMasterKey",
            [resultType]);
    },
    downloadworkingKey: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "downloadWorkingKey",
            [resultType]);
    },
    pinblock: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "pinblock",
            [resultType]);
    },
    encrpty: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "encrpty",
            [resultType]);
    },
    mac: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "mac",
            [resultType]);
    },
    version: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "version",
            [resultType]);
    },
    reset: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "reset",
            [resultType]);
    },
    connectHost: function (success, fail, resultType) {
        console.log("connectHost");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "connectHost",
            [resultType]);
    },
    clientSendData: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "clientSendData",
            [resultType]);
    },
    clientReadData: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "clientReadData",
            [resultType]);
    },
    disHostConnect: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "disHostConnect",
            [resultType]);
    },
    serverListen: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "serverListen",
            [resultType]);
    },
    serverAcceptConnect: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "serverAcceptConnect",
            [resultType]);
    },
    serverReadData: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "serverReadData",
            [resultType]);
    },
    serverSendData: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "serverSendData",
            [resultType]);
    },
    disServerListen: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "disServerListen",
            [resultType]);
    },
    signName: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "signName",
            [resultType]);
    },
    ftpUploadFile: function (successCallback, failCallback, args) {
        /* var args = {};
         if(address)
         args.address = address;
         if(username)
         args.username = username;
         if(password)
         args.password = password;
         if(filepath)
         args.filepath = filepath;
         if(remotename)
         args.remotename = remotename;*/

        return Cordova.exec(successCallback, failCallback, "FtpUpload", "sendFile", [args]);
    },
    createDir: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "FtpUpload",
            "createDir",
            [resultType]);
    },
    vtmTeller: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "vtmTeller",
            [resultType]);
    },
    vtmTerminal: function (success, fail, resultType) {
        //alert("readIdCard");
        return Cordova.exec(success, fail,
            "HXiMateDeviceSDK",
            "vtmTerminal",
            [resultType]);
    },
    zxing: function (success, fail, resultType) {
        return Cordova.exec(success, fail,
            "HXBarcodeScanner",
            "scan",
            [resultType]);
    }


};





