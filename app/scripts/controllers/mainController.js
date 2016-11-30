'use strict';

/**
 * @ngdoc xfunction
 * @name whatsYourPic.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('MainCtrl', function($rootScope, $scope, $q, $window,
    smoothScroll, localStorageService, $firebaseObject, $firebaseAuth,
    $moment, $firebaseArray, ngToast) {
    console.log('main')

    var ref = firebase.database().ref();
    var auth = $firebaseAuth();

    auth.$signInAnonymously().then(function(firebaseUser) {
        $scope.firebaseUser = firebaseUser;
    }).catch(function(error) {
        console.log(error);
    });

    $scope.locationInput = ""
    $scope.date = ""
    $rootScope.selectedImage = "empty"
    $rootScope.selectedImageCheck = false
    $rootScope.selectedButtonFacebook = false;
    $rootScope.facebookUserId = localStorageService.get('fbUserId');
    $rootScope.facebookToken = localStorageService.get('fbToken');

    $(document).on('fbload', function(){
        $rootScope.getFacebookPhotosIds()
    });

    $rootScope.getFacebookPhotosIds = function() {
        FB.api("/" + $rootScope.facebookUserId +
        "/photos?type=uploaded&limit=400&access_token=" +
        $rootScope.facebookToken, function (response) {
            if (!response || response.error) {
                console.log(response.error);
                if (response.error.code == 190) {
                    $rootScope.facebookLogin()
                }
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

    $scope.$watch('date', function() {
        validateFields()
    });

    $scope.$watch('locationInput', function() {
        validateFields()
    });

    $rootScope.$watch('selectedImage', function() {
        validateFields()
    });

    var validateFields = function() {
        if ($scope.date && $scope.locationInput && $rootScope.selectedImage) {
            console.log('validateButton')
        } else {
            console.log('invalidateButton')
        }
    }

    $scope.sendForm = function() {
        getLocation();

        if ($rootScope.selectedImage == "empty") {
            showCustomToast("Selecione uma das fotos");
            return;
        }

        if (!$scope.locationInput) {
            showCustomToast("Entre com a localização onde a foto foi tirada");
            document.getElementById("location").focus();
            return;
        }

        if (!$scope.date) {
            showCustomToast("Preencha com a data aproximada");
            document.getElementById("date").focus();
            return;
        }

        var refForms = ref.child("crowdSourcing")
        var forms = $firebaseArray(refForms)
        var createdAt = ($moment().unix())*1000

        forms.$add({
            location : $scope.location,
            month : $moment($scope.date).format("MMMM"),
            year: $moment($scope.date).format("YYYY"),
            imageUrl: $rootScope.selectedImage,
            createdAt : createdAt
        }).then(function(ref) {
            console.log("added record with id " + ref.path.o[1])
        });
    }

    var showCustomToast = function(message) {
        ngToast.create({
            className: 'info',
            content: '<span class="">' + message + '</span>'
        });
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
                        $rootScope.selectedButtonFacebook = true;
                    });
                }
            });
        });
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
});
