'use strict';

/**
 * @ngdoc function
 * @name whatsYourPic.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('MainCtrl', function($rootScope, $scope, $q, $window, smoothScroll) {

    $rootScope.selectedImage = ""
    $rootScope.selectedImageCheck = false

    $rootScope.getFacebookPhotosIds = function() {
        console.log("ids")
        FB.api("/" + $rootScope.userId + "/photos?type=uploaded&limit=250",
            function (response) {
                console.log(response)
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    getFacebookPhotosUrl(response);
                }
            }
        );
    };

    var getFacebookPhotosUrl = function(imageObjects) {
        console.log("photos");
        $rootScope.urlArray = [];

        angular.forEach(imageObjects.data, function(value, key){
            FB.api("/" + value.id + "/picture", function (response) {
                console.log(response)
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    $rootScope.$apply(function () {
                        $rootScope.urlArray.push(response.data.url);
                    });
                }
            });
            console.log($rootScope.urlArray)
        });
    }

    var getRandomElements = function(sourceArray, neededElements) {
        var result = [];
        for (var i = 0; i < neededElements; i++) {
            result.push(sourceArray[Math.floor(Math.random()*sourceArray.length)]);
        }
        return result;
    }

    $rootScope.checkIfHasImages = function() {
        if (!$rootScope.urlArray) {
            return false;
        }
        return $rootScope.urlArray.length > 0
    }

    $rootScope.selectImage = function(url) {
        $rootScope.selectedImage = url
        if ($rootScope.selectedImageCheck == false) {
            $rootScope.selectedImageCheck = true
        } else {
            $rootScope.selectedImageCheck = false
        }
        var element = document.getElementById('top');
        smoothScroll(element);
    }
});
