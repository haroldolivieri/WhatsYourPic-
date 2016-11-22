'use strict';

/**
 * @ngdoc function
 * @name whatsYourPic.controller:AuthCtrl
 * @description
 * # AuthCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('AuthCtrl', function($window, $rootScope, $scope, $q) {

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
                $rootScope.getFacebookPhotosIds();
			} else {
				response.customMsg = 'Não foi possível logar com o Facebook.';
			}
		}, {scope: 'user_photos'});
	};

});
