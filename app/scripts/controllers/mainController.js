'use strict';

/**
 * @ngdoc xfunction
 * @name whatsYourPic.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('MainCtrl', function($rootScope, $scope, $q, $window, smoothScroll) {

    $rootScope.selectedImage = ""
    $scope.locationInput = ""


    $scope.formData = {};
    $scope.formData.date = "";
    $scope.opened = false;

    //Datepicker
    $scope.dateOptions = {
        'year-format': "'yy'",
        'show-weeks' : false
    };

    $scope.open = function () {
    $scope.opened = true;
    };

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

    $rootScope.checkIfHasImages = function() {
        if (!$rootScope.urlArray) {
            return false;
        }
        return $rootScope.urlArray.length > 0
    }

    $scope.selectImage = function(url) {
        $rootScope.selectedImage = url
        var element = document.getElementById('top');
        smoothScroll(element);
    }

    $scope.sendForm = function() {
        getLocation();
    }

    function toggleStart($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $timeout(function () {
            vm.isStartOpen = !vm.isStartOpen;
        });
    }

    var getRandomElements = function(sourceArray, neededElements) {
        var result = [];
        for (var i = 0; i < neededElements; i++) {
            result.push(sourceArray[Math.floor(Math.random()*sourceArray.length)]);
        }
        return result;
    }

    var getLocation = function() {
        var location = {}
        location.name = $scope.locationInput

        if ($scope.locationInput.formatted_address) {
            location.name = $scope.locationInput.formatted_address
            location.url = $scope.locationInput.url
            if ($scope.locationInput.geometry) {
                location.latitude = $scope.locationInput.geometry.location.lat()
                location.longitude = $scope.locationInput.geometry.location.lng()
            }
        }
    }

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
});
