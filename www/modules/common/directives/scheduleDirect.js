define([_serverURL+'modules/common/_module.js'], function(module) {
    'use strict';
module.directive("goNextStep",function(){
        return {
            restrict : 'E',
            templateUrl : _serverURL + 'modules/common/directives/scheduleTemplate.html',
            scope : {
                steplist : '=dataobj',
                myclick : '&click'
            }

        };
    }
)
});


