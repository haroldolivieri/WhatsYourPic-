'use strict';

/**
 * @ngdoc xfunction
 * @name whatsYourPic.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('MainCtrl', function ($rootScope, $scope, $window,
    smoothScroll, localStorageService, $firebaseObject, $firebaseAuth,
    $moment, $firebaseArray, ngToast, ngProgressFactory, SweetAlert, $q, $http) {

    $scope.progressbar = ngProgressFactory.createInstance();

    var ref = firebase.database().ref();
    var storageRef = firebase.storage().ref();
    var auth = $firebaseAuth();


    var refForms = ref.child("crowdSourcing");
    //sendImagesToClarifai(forms)

    function sendImagesToClarifai() {
        var forms = $firebaseArray(refForms);
        $scope.forms = [];

        auth.$signInAnonymously().then(function (firebaseUser) {
            forms.$loaded().then(function () {
                angular.forEach(forms, function (value, key) {
                    getUrlFromFirebaseImage(value.$id, value.location, value.month, value.year).then(function (response) {
                        return uploadPhotoToClarifai(response.url, response.uid, response.location, response.month, response.year);
                    }).then(function (response) {
                        return updateRow(response.uid, response.clarifaiId);
                    }).then(function () {
                        //GRAVOU NO FIREBASE
                    }).catch(function (error) {
                        console.log(error);
                    });
                });
            });
        }).catch(function (error) {
            console.error(error);
        });
    }

    var updateRow = function (uid, clarifaiId) {
        var deferred = $q.defer();
        
        ref.child("crowdSourcing").child(uid).on('value', function (snap) {
            var data = snap.val();
            data.sentToModel = true;
            data.clarifaiId = clarifaiId;
            ref.child("crowdSourcing").child(uid).update(data);
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    $scope.form = {};
    $rootScope.selectedImage = "empty";
    $rootScope.selectedImageCheck = false;
    $rootScope.navigationHelper = false;
    $scope.canShowFooter = false;
    $scope.showAbout = false;
    $scope.canClick = true;

    $rootScope.facebookUserId = localStorageService.get('fbUserId');
    $rootScope.facebookToken = localStorageService.get('fbToken');

    if ($rootScope.facebookUserId && $rootScope.facebookToken) {
        $rootScope.selectedButtonFacebook = true;
    }

    $(document).on('fbload', function () {
        $rootScope.getFacebookPhotosIds();
    });

    $rootScope.getFacebookPhotosIds = function () {
        FB.api("/" + $rootScope.facebookUserId +
            "/photos?type=uploaded&limit=400&access_token=" +
            $rootScope.facebookToken, function (response) {
                if (!response || response.error) {
                    $rootScope.progressbar.complete();

                    if (response.error.code === 190) {
                        $rootScope.selectedButtonFacebook = false;
                        $rootScope.facebookUserId = "";
                        $rootScope.facebookToken = "";
                        localStorageService.set('fbToken', $rootScope.facebookToken);
                        localStorageService.set('fbUserId', $rootScope.facebookUserId);
                        $rootScope.facebookLogin();
                    }
                } else {
                    $rootScope.selectedButtonFacebook = true;
                    $rootScope.progressbar.set(40);
                    getFacebookPhotosUrl(response);
                }
            });
    };

    $rootScope.checkIfHasImages = function () {
        if (!$rootScope.urlArray) {
            return false;
        }
        return $rootScope.urlArray.length > 0;
    };

    $rootScope.checkIfHasImages = function () {
        if (!$rootScope.photoArray) {
            return false;
        }
        return $rootScope.photoArray.length > 0;
    };

    $scope.scrollToForm = function () {
        var element = document.getElementById('form');
        smoothScroll(element);
        $scope.canShowFooter = false;
    };

    $scope.selectImage = function (index) {
        angular.forEach($rootScope.photoArray, function (value, key) {
            value.selected = false;
            value.onHover = false;
        });

        $rootScope.selectedImage = $rootScope.photoArray[index].url;
        $rootScope.photoArray[index].selected = true;
        $rootScope.navigationHelper = true;
        $scope.canShowFooter = true;
    };

    $scope.$watch('form.date', function () {
        validateFields();
    });

    $scope.$watch("form.location", function () {
        validateFields();
    });

    $rootScope.$watch('selectedImage', function () {
        validateFields();
    });

    var validateFields = function () {
        if ($scope.form.date && $scope.form.location && $rootScope.selectedImage !== "empty") {
            $rootScope.validateSubmit = true;
        } else {
            $rootScope.validateSubmit = false;
        }
    };

    $scope.sendForm = function () {

        if ($scope.canClick === false) {
            return;
        }

        if ($rootScope.selectedImage === "empty") {
            showCustomToast("Selecione uma das fotos");
            return;
        }

        if (!$scope.form.location || $scope.form.location === undefined) {
            showCustomToast("Entre com a localização onde a foto foi tirada");
            document.getElementById("location").focus();
            return;
        }

        if (!$scope.form.date || $scope.form.date === undefined || $moment($scope.form.date).format("MMMM") === "Invalid date") {
            showCustomToast("Preencha com a data aproximada");
            return;
        }

        $scope.canClick = false;
        var forms = $firebaseArray(ref.child("crowdSourcing"));
        $scope.location = getLocation();

        forms.$add({
            location: getLocation(),
            month: $moment($scope.form.date).format("MMMM"),
            year: $moment($scope.form.date).format("YYYY"),
            imageUrl: $rootScope.selectedImage,
            createdAt: ($moment().unix()) * 1000
        }).then(function (ref) {
            $scope.id = ref.path.o[1];
            console.log("added record with id " + $scope.id);
            return downloadImage($rootScope.selectedImage);
        }).then(function (blob) {
            return uploadPhotoToFirebaseStorage(blob, $scope.id);
        }).then(function () {
            return getUrlFromFirebaseImage($scope.id, $scope.location, $moment($scope.form.date).format("MMMM"), $moment($scope.form.date).format("YYYY"));
        }).then(function (response) {
            return uploadPhotoToClarifai(response.url, $scope.id, $scope.location, $moment($scope.form.date).format("MMMM"), $moment($scope.form.date).format("YYYY"));
        }).then(function (response) {
            console.log(response.clarifaiId);
            return updateRow($scope.id, response.clarifaiId);
        }).then(function (response) {
            SweetAlert.swal("Obrigado por participar!", "Informações enviadas " +
                "com sucesso! Fique a vontade para enviar quantas desejar ;)", "success");
        }).catch(function (err) {
            console.log(err);
            SweetAlert.swal("Tivemos um problema :(",
                "Houve um erro ao enviar sua foto, por favor, tente novamente", "error");
        }).finally(function () {
            $scope.canClick = true;
            $scope.location = {};
            $rootScope.selectedImage = "empty";
            $rootScope.selectedImageCheck = false;
            angular.forEach($rootScope.photoArray, function (value, key) {
                value.selected = false;
                value.onHover = false;
            });
            $scope.form = {};
        });
    };

    var downloadImage = function (url) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: url,
            responseType: "arraybuffer"
        }).then(function (res) {
            var blob = new Blob([res.data], { type: 'image/png' });
            deferred.resolve(blob);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var getUrlFromFirebaseImage = function (uid, location, month, year) {
        console.log(uid);
        var deferred = $q.defer();

        auth.$signInAnonymously().then(function (firebaseUser) {
            console.log(uid);
            storageRef.child("images").child(uid + ".png").getDownloadURL().then(function (url) {
                console.log(uid);
                deferred.resolve({url : url, uid: uid, location: location, month : month, year : year});
            }).catch(function (error) {
                deferred.reject(error);
            });
        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var uploadPhotoToClarifai = function (url, uid, location, month, year) {
        var deferred = $q.defer();
        console.log("CLaRIFAI");
        app.inputs.create([{ url: url, id : uid, metadata: {firebaseId: uid, location : location, date : { month : month, year : year }}}]).then(
            function (response) {
                console.log("CLaRIFAI 2");
                deferred.resolve({clarifaiId : response[0].id, uid: uid});
            },
            function (err) {
                console.log("CLaRIFAI 3");
                deferred.reject(err);
            });

        return deferred.promise;
    };

    var uploadPhotoToFirebaseStorage = function (blob, uid) {
        var deferred = $q.defer();
        var fileRef = storageRef.child("images").child(uid + ".png");
        var uploadTask = fileRef.put(blob);

        uploadTask.on('state_changed', function (snapshot) {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            $rootScope.progressbar.set(progress);
        }, function (error) {
            deferred.reject(error.code);
        }, function () {
            deferred.resolve();
        });

        return deferred.promise;
    };

    var showCustomToast = function (message) {
        ngToast.create({
            className: 'info',
            content: '<span class="">' + message + '</span>'
        });
    };

    var getFacebookPhotosUrl = function (imageObjects) {
        $rootScope.photoArray = [];
        var count = imageObjects.data.length;

        var loadedCount = 0;
        angular.forEach(imageObjects.data, function (value, key) {
            FB.api("/" + value.id + "/picture?access_token=" +
                $rootScope.facebookToken, function (response) {
                    if (response) {
                        loadedCount++;
                        $rootScope.progressbar.set(40 + loadedCount * 60 / count);

                        if (loadedCount === count) {
                            $rootScope.progressbar.complete();
                        }

                        var photo = {};
                        photo.url = response.data.url;
                        photo.selected = false;
                        photo.onHover = false;
                        $rootScope.$apply(function () {
                            $rootScope.photoArray.push(photo);
                        });
                    }
                });
        });
    };

    var getLocation = function () {
        var location = undefined;

        if ($scope.form.location.formatted_address) {
            location = {};
            location.name = $scope.form.location.formatted_address;
            location.url = $scope.form.location.url;
            if ($scope.form.location.geometry) {
                location.latitude = $scope.form.location.geometry.location.lat();
                location.longitude = $scope.form.location.geometry.location.lng();
            }
        }

        if (location === undefined) {
            location = {};
            location.name = $scope.form.location;
        }

        return location;
    };
});
