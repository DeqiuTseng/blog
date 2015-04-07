/**
 * Created by lenovo on 2015/2/28.
 * description:业务流程步骤进行单一的封装，之后就不用再第一个控制器写入相同的代码
 * Author:zengqq
 */
define([_serverURL + 'modules/common/_module.js'], function (module) {
    module.service("flowStep", ["$ionicLoading", "$http", function ($ionicLoading, $http) {
        console.info("flowStep file loaded.");
        this.currentStep=0;
        this.nextStep=function(step,includeContentHtml,stepHtmls, stepList){//修改时间0214/6/26
            this.currentStep=step;
            if (step < stepList.length + 1) {
                this.stepClick(step, stepList);
            }
            if (step >= 0 && step < stepHtmls.length + 1) {
                return stepHtmls[step];
            } else {
               //$scope.applyData.includeContent = _serverURL + "modules/apply/templates/proDuct/product.html";
            }
        }

        this.stepClick=function(step, stepArray) {
            if (step != 0) {
                if (!stepArray[step - 1].stepVisible)return;//不为步骤1 且 上一步未激活
            }
            //当前步骤置激活状态
            for (var i = 0; i < step; i++) {
                stepObj = stepArray[i];
                stepObj.stepImg = "stepImg finishedImg";
            }

            var stepObj = stepArray[step];
            stepObj.stepTextStyle = "stepText acStepText";
            stepObj.stepImgStyle = "stepImgStyle acStepImgbg";
            stepObj.stepImg = "stepImg acImage";
            stepObj.stepVisible = true;

            for (var j = step + 1; j < stepArray.length; j++) {  //将后续步骤置未激活状态
                stepObj = stepArray[j];
                stepObj.stepTextStyle = "stepText unacText";
                stepObj.stepImgStyle = "stepImgStyle unacStepImgbg";
                stepObj.stepImg = "stepImg unacImage";
                stepObj.stepVisible = false;
            }
        }

        this.stepInfo=function(stepText, stepTextStyle, stepImgStyle, stepImg, stepVisible) {
            this.stepText = stepText == null ? "" : stepText;  //步骤描述
            this.stepTextStyle = stepTextStyle == null ? "stepText unacText" : stepTextStyle; //步骤文字样式
            this.stepImgStyle = stepImgStyle == null ? "stepImgStyle unacStepImgbg" : stepImgStyle; //步骤图片样式
            this.stepImg = stepImg == null ? "stepImg unacImage" : stepImg; //步骤图片样式
            this.stepVisible = stepVisible == null ? false : stepVisible;//是否已激活
        }
    }]);
});