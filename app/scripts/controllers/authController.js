'use strict';

/**
 * @ngdoc function
 * @name whatsYourPic.controller:AuthCtrl
 * @description
 * # AuthCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('AuthCtrl', function($window, $rootScope, $scope, $q) {

    $rootScope.selectedImage = "http://2.bp.blogspot.com/-2VgYVSIqRkw/VCF-RvDJkrI/AAAAAAAA4bg/ln6M7MrLy_Y/s1600/paisagens.jpg"
    $scope.facebookLogin = function() {

		if(!$window.FB) {
			return;
		}

		$rootScope.loading = true;
		FB.login(function (response) {
			$rootScope.loading = false;
			if (response.authResponse) {
                $rootScope.accessToken = response.authResponse.accessToken;
                $rootScope.userId = response.authResponse.userID;
                getPhotosIds();
			} else {
				response.customMsg = 'Não foi possível logar com o Facebook.';
			}
		}, {scope: 'user_photos'});
	};

    var getPhotosIds = function() {
        console.log("ids")
        FB.api(
            "/" + $rootScope.userId + "/photos?type=uploaded&limit=100",
            function (response) {
                console.log(response)
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    getPhotosUrl(response);
                }
            }
        );
    };

    var getPhotosUrl = function(imageObjects) {
        console.log("photos")
        var firstId = imageObjects.data[0].id;
        console.log(firstId)
        FB.api(
            "/" + firstId + "/picture",
            function (response) {
                console.log(response)
                if (!response || response.error) {
                    console.log(response.error);
                } else {
                    $rootScope.selectedImage = response.data.url;
                    console.log($rootScope.selectedImage)
                }
            }
        );
    }
});
