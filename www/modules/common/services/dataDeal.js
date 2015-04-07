define([_serverURL + 'modules/common/services/pinyin.js'],
    function(){
        var obj = {};
        //取得二维数组信息 @dataArray 一维数组
        function proArray(dataArray){
            var rows = new Array();
            var cols = new Array();
            var num = 0; //总数据条数
            var len = 0; //二维数组长度
            var rowNum = 0;
            if(dataArray){
                len = dataArray.length; //总数据条数
                for(var i=0;i<len;i++){
                    var obj = dataArray[i];
                    cols[num] = obj;
                    num++;
                    if(num==2||i==(len-1)){
                        rows[rowNum] = cols;
                        cols = new Array();
                        num=0;
                        rowNum++;
                    }
                }
            }
            return rows;
        }
        //获取年龄 @birth 出生日期eg:19870806
        /*function Age(birth){
            if(birth.length < 8)return 0;
            var bstr = birth;
            var _now = new Date();
            var _bir = new Date(bstr.substring(0,4),bstr.substring(4,6),bstr.substring(6,8));
            var _agen = _now-_bir;
            var _age = Math.floor(_agen/(365*24*60*60*1000));
            return _age;
        }*/

        function Age(birth){
            if(birth.length < 8)return 0;
            var year = parseInt(birth.substring(0,4));
            var month = parseInt(birth.substring(4,6));
            var day = parseInt(birth.substring(6,8));
            var _now = new Date();
            var virtualAge = _now.getFullYear() - year;
            if(_now.getMonth() + 1 - month < 0){
                return virtualAge - 1;
            }else{
                if(_now.getMonth() + 1 - month == 0 &&  _now.getDay() - day < 0){
                    return virtualAge - 1;
                }
            }
            return virtualAge;
        }

        //中文名转拼音 @chinaName 中文名
       function convertPinYin(chinaName){
            var obj ={"firstName":"","lastName":""};
            var firstName="";
            var lastName= "";
            var length = chinaName.length;
            var pinyinName = CC2PY(chinaName).toLocaleUpperCase();
            var nameArray = pinyinName.split(" ");
            if(length <= 3){
                obj.lastName = nameArray[0];
                for(var i=1;i<nameArray.length-1;i++){
                    firstName += nameArray[i];
                }
                obj.firstName = firstName;;
            }else{
                for(var i=0 ;i<2;i++){
                    lastName += nameArray[i];
                }
                obj.lastName = lastName;
                for(var i=2 ;i<nameArray.length-1;i++){
                    firstName += nameArray[i];
                }
                obj.firstName = firstName;
            }
            return obj;
        }
        //设置属性初值
        function setPropertiesInitValue(obj,propertyArray){
            if(propertyArray != null && propertyArray.length >0){
                for(var i = 0;i < propertyArray.length; i++){
                    obj[propertyArray[i]] = "";
                }
            }
        }
        //验证身份证与证件号码是否保持一致
        function checkBirthday(idNum,birthDay,checkWho){
            var validResult = true;
            var errorMsg = "请输入出生年月eg：1900-08-08";
            if(idNum != null && idNum != ""){
                if(birthDay != null && birthDay != ""){
                    var birth = birthDay.replace(new RegExp(/(-)/g),'');
                    if(!same(idNum,birth)){
                        errorMsg = "生日和身份证生日不同";
                        validResult = false;
                    }
                }
            }
            if(birthDay != null && birthDay != ""){
                if(validResult){
                    var birth = birthDay.replace(new RegExp(/(-)/g),'');
                    switch(checkWho){
                        case "personal":{ //基本信息出生年月校验
                            if(Age(birth)<18){
                                errorMsg = "年龄不能小于18";
                                validResult = false;
                            }
                            break;
                        }case "supp":{ //附属卡信息 出生年月校验
                        // errorMsg = "请输入身份证号";
                        if(Age(birth)<14){
                            errorMsg = "年龄不能小于14";
                            validResult = false;
                        }
                        break;
                    }
                    }
                }
            }
            else{
                errorMsg = "出生年月不能为空";
                validResult= false;
            }
            return {"validateRes":validResult,"errorMsg":errorMsg};
        }

        function same(idcardNum,birth){
            if(idcardNum == null || idcardNum == "" || birth == null || birth =="")return false;
            var idstr = idcardNum.substring(6,14);
            return idstr == birth;
        }
        //年限
        function checkYear(birthDate,years,checkWho){
            var validResult = true;
            var errorMsg = "";
            if(birthDate ==null || birthDate==""){
                errorMsg = "请先输入出生年月";
                validResult = false;
            }else{
                var bstr = birthDate.replace(new RegExp(/(-)/g),'');
                if(checkWho){
                    switch(checkWho){  //验证居住年限还是工作年限
                        case "liveYear":{  //居住年限
                            errorMsg = "输入正整数，年限不得大于申请人年龄";
                            if(years>Age(bstr)){
                                errorMsg ="居住年限应小于申请人年龄！";
                                validResult = false;
                            }
                            break;
                        }case "workYear":{  //工作年限
                        errorMsg = "输入正整数，年限不得大于申请人年龄";
                        if(years!=null && years!=""){
                            if(years>Age(bstr)-16){  //算实岁  +1
                                errorMsg = "年限应小于或等于申请人年龄减16周岁";
                                validResult = false;
                            }
                        }
                        break;
                    }
                    }
                }
            }
            return {"validateRes":validResult,"errorMsg":errorMsg};
        }
        //验证性别
        function checkSex(idNum,sex){
            var validResult = true;
            var errorMsg = "";
            if(idNum == null || idNum == "")
            {
                errorMsg = "证件号码不能为空";
                validResult= false;
            }else{
                if(idNum.charAt(16)%2 == 0){
                    if(sex=='M'){
                        errorMsg = "与身份证性别不符";
                        validResult = false;
                    }
                }else{
                    if(sex == 'F'){
                        errorMsg = "与身份证性别不符";
                        validResult = false;
                    }
                }
            }
            return {"validateRes":validResult,"errorMsg":errorMsg};
        }
        /**
         * 去掉前后空格
         * @param param
         * @returns {*}
         */
        function trimBlank(param) {
            if (param) {
                return param.replace(/(^\s*)|(\s*$)/g, "");
            } else {
                return "";
            }
        }
        obj.proArray = proArray;
        obj.age = Age;
        obj.convertPinYin = convertPinYin;
        obj.setPropertiesInitValue = setPropertiesInitValue;
        obj.checkBirthday = checkBirthday;
        obj.checkYear = checkYear;
        obj.checkSex = checkSex;
        obj.trimBlank = trimBlank;
        return  obj;
});