'use strict';

/**
 * @ngdoc xfunction
 * @name whatsYourPic.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('MainCtrl', function($rootScope, $scope, $q, $window,
    smoothScroll, localStorageService) {
    console.log('main')

    $rootScope.selectedImage = "empty"
    $scope.locationInput = ""

    $rootScope.selectedImageCheck = false
    $rootScope.facebookUserId = localStorageService.get('fbUserId')
    $rootScope.facebookToken = localStorageService.get('fbToken')

    $(document).on('fbload', function(){
        $rootScope.getFacebookPhotosIds()
    });

    $rootScope.getFacebookPhotosIds = function() {
        FB.api("/" + $rootScope.facebookUserId +
        "/photos?type=uploaded&limit=400&access_token=" +
        $rootScope.facebookToken, function (response) {
            if (!response || response.error) {
                console.log(response.error);
            } else {
                getFacebookPhotosUrl(response);
            }
        });
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
            result
            .push(sourceArray[Math.floor(Math.random()*sourceArray.length)]);
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
        $rootScope.photoArray = [];

        angular.forEach(imageObjects.data, function(value, key){
            FB.api("/" + value.id + "/picture?access_token=" +
            $rootScope.facebookToken, function (response) {
                if (response) {
                    var photo = {}
                    photo.url = response.data.url
                    photo.selected = false
                    photo.onHover = false
                    $rootScope.$apply(function () {
                        $rootScope.photoArray.push(photo);
                    });
                }
            });
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
        if (!$rootScope.photoArray) {
            return false;
        }
        return $rootScope.photoArray.length > 0
    }

    $scope.selectImage = function(index) {
        angular.forEach($rootScope.photoArray, function(value, key){
            value.selected = false
            value.onHover = false
        });

        $rootScope.selectedImage = $rootScope.photoArray[index].url
        $rootScope.photoArray[index].selected = true

        var element = document.getElementById('form');
        smoothScroll(element);
    }

    $scope.onMouseHover = function(index) {
        clearHoverPropertyFromAll()
        if ($rootScope.photoArray[index].selected) {
            return;
        }
        $rootScope.photoArray[index].onHover = true

        var imageElement = document.getElementById('image-' + index);
        var popupElement = document.getElementById('popup-' + index);
    };

    $scope.onMouseLeave = function(index) {
        clearHoverPropertyFromAll()
    };

    var clearHoverPropertyFromAll = function() {
        angular.forEach($rootScope.photoArray, function(value, key){
            value.onHover = false
        });
    }

});
