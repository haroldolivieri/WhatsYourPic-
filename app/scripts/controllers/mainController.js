'use strict';

/**
 * @ngdoc xfunction
 * @name whatsYourPic.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('MainCtrl', function($rootScope, $scope, $window,
    smoothScroll, localStorageService, $firebaseObject, $firebaseAuth,
    $moment, $firebaseArray, ngToast, ngProgressFactory, SweetAlert, $q, $http) {

    $scope.progressbar = ngProgressFactory.createInstance();

    var ref = firebase.database().ref();
    var storageRef = firebase.storage().ref();
    var auth = $firebaseAuth();

    auth.$signInAnonymously().then(function(firebaseUser) {
        $scope.firebaseUser = firebaseUser;
    }).catch(function(error) {
        console.log(error);
    });

    //Save all facebook url photos in firebase storage
    //var refForms = ref.child("crowdSourcing")
    //var forms = $firebaseArray(refForms)
    //getImages(forms)
    // function getImages(forms){
    //     $scope.forms = []
    //     forms.$loaded().then(function() {
    //         angular.forEach(forms, function(value, key) {
    //             downloadImage(value.imageUrl).then(function(blob) {
    //                 console.log(blob)
    //                 console.log(value.$id)
    //                 return uploadPhoto(blob, value.$id);
    //             }).then(function(url) {
    //                 console.log("saved! url:" + url)
    //             }).catch(function(error) {
    //                 console.log(error)
    //             })
    //         });
    //     });
    // }

    $scope.form = {}
    $rootScope.selectedImage = "empty"
    $rootScope.selectedImageCheck = false
    $rootScope.navigationHelper = false
    $scope.canShowFooter = false;
    $scope.canClick = true;

    $rootScope.facebookUserId = localStorageService.get('fbUserId');
    $rootScope.facebookToken = localStorageService.get('fbToken');

    if ($rootScope.facebookUserId && $rootScope.facebookToken) {
        $rootScope.selectedButtonFacebook = true;
    }

    $(document).on('fbload', function(){
        $rootScope.getFacebookPhotosIds()
    });

    $rootScope.getFacebookPhotosIds = function() {
        FB.api("/" + $rootScope.facebookUserId +
        "/photos?type=uploaded&limit=400&access_token=" +
        $rootScope.facebookToken, function (response) {
            if (!response || response.error) {
                $rootScope.progressbar.complete();

                if (response.error.code == 190) {
                    $rootScope.selectedButtonFacebook = false;
                    $rootScope.facebookUserId = "";
                    $rootScope.facebookToken = "";
                    localStorageService.set('fbToken', $rootScope.facebookToken)
                    localStorageService.set('fbUserId', $rootScope.facebookUserId)
                    $rootScope.facebookLogin()
                }
            } else {
                $rootScope.selectedButtonFacebook = true;
                $rootScope.progressbar.set(40);
                getFacebookPhotosUrl(response);
            }
        });
    };

    $rootScope.checkIfHasImages = function() {
        if (!$rootScope.urlArray) {
            return false;
        }
        return $rootScope.urlArray.length > 0;
    }

    $rootScope.checkIfHasImages = function() {
        if (!$rootScope.photoArray) {
            return false;
        }
        return $rootScope.photoArray.length > 0;
    }

    $scope.scrollToForm = function() {
        var element = document.getElementById('form');
        smoothScroll(element);
        $scope.canShowFooter = false;
    }

    $scope.selectImage = function(index) {
        angular.forEach($rootScope.photoArray, function(value, key){
            value.selected = false;
            value.onHover = false;
        });

        $rootScope.selectedImage = $rootScope.photoArray[index].url;
        $rootScope.photoArray[index].selected = true;
        $rootScope.navigationHelper = true;
        $scope.canShowFooter = true;
    }

    $scope.$watch('form.date', function() {
        validateFields()
    });

    $scope.$watch("form.location",function() {
        validateFields()
    });

    $rootScope.$watch('selectedImage', function() {
        validateFields()
    });

    var validateFields = function() {
        if ($scope.form.date && $scope.form.location && $rootScope.selectedImage != "empty") {
            $rootScope.validateSubmit = true;
        } else {
            $rootScope.validateSubmit = false;
        }
    }

    $scope.sendForm = function() {

        if ($scope.canClick == false) {
            return;
        }

        if ($rootScope.selectedImage == "empty") {
            showCustomToast("Selecione uma das fotos");
            return;
        }

        if (!$scope.form.location || $scope.form.location == undefined) {
            showCustomToast("Entre com a localização onde a foto foi tirada");
            document.getElementById("location").focus();
            return;
        }

        if (!$scope.form.date || $scope.form.date == undefined) {
            showCustomToast("Preencha com a data aproximada");
            return;
        }

        $scope.canClick = false
        var forms = $firebaseArray(ref.child("crowdSourcing"))

        forms.$add({
            location : getLocation(),
            month : $moment($scope.form.date).format("MMMM"),
            year: $moment($scope.form.date).format("YYYY"),
            imageUrl: $rootScope.selectedImage,
            createdAt : ($moment().unix())*1000
        }).then(function(ref) {
            $scope.id = ref.path.o[1]
            console.log("added record with id " + $scope.id);
            return downloadImage($rootScope.selectedImage);
        }).then(function(blob) {
            return uploadPhoto(blob, $scope.id);
        }).then(function() {
            SweetAlert.swal("Obrigado por participar!", "Informações enviadas " +
            "com sucesso! Fique a vontade para enviar quantas desejar ;)", "success");
        }).catch(function() {
            SweetAlert.swal("Erro ao enviar sua foto, por favor, tente novamente", "error");
        }).finally(function(){
            $scope.canClick = true

            $rootScope.selectedImage = "empty";
            $rootScope.selectedImageCheck = false;
            angular.forEach($rootScope.photoArray, function(value, key){
                value.selected = false;
                value.onHover = false;
            });
            $scope.form = {};
        });
    }

    var downloadImage = function(url){
        var deferred = $q.defer();
        $http.get(url, {responseType: "arraybuffer"}).success(function(data){
            var arrayBufferView = new Uint8Array(data);
            var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
            deferred.resolve(blob);
        }).error(function(err, status){
            deferred.reject(err);
        })
        return deferred.promise;
    }

    var uploadPhoto = function upload(file, uid) {
        var deferred = $q.defer();
        var fileRef = storageRef.child("images").child(uid);
        var uploadTask = fileRef.put(file);

        uploadTask.on('state_changed', function(snapshot){
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            $rootScope.progressbar.set(progress);
        }, function(error) {
            deferred.reject(error.code);
        }, function() {
            deferred.resolve(uploadTask.snapshot.downloadURL);
        });

        return deferred.promise;
    }

    var showCustomToast = function(message) {
        ngToast.create({
            className: 'info',
            content: '<span class="">' + message + '</span>'
        });
    }

    var getFacebookPhotosUrl = function(imageObjects) {
        $rootScope.photoArray = [];
        var count = imageObjects.data.length;

        var loadedCount = 0
        angular.forEach(imageObjects.data, function(value, key){
            FB.api("/" + value.id + "/picture?access_token=" +
            $rootScope.facebookToken, function (response) {
                if (response) {
                    loadedCount ++;
                    $rootScope.progressbar.set(40 + loadedCount*60/count);

                    if (loadedCount == count) {
                        $rootScope.progressbar.complete()
                    }

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

    var getLocation = function() {
        var location = undefined

        if ($scope.form.location.formatted_address) {
            var location = {}
            location.name = $scope.form.location.formatted_address
            location.url = $scope.form.location.url
            if ($scope.form.location.geometry) {
                location.latitude = $scope.form.location.geometry.location.lat()
                location.longitude = $scope.form.location.geometry.location.lng()
            }
        }

        if (location == undefined) {
            var location = {}
            location.name = $scope.form.location
        }

        return location;
    }
});
