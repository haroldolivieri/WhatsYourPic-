'use strict';

/**
 * @ngdoc function
 * @name whatsYourPic.controller:AuthCtrl
 * @description
 * # AuthCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('AuthCtrl', function($window, $rootScope, $scope, $q,
localStorageService) {
	console.log('auth');

	$scope.storageType = 'Local storage'

	if (localStorageService.getStorageType().indexOf('session') >= 0) {
		$scope.storageType = 'Session storage'
	}

	if (!localStorageService.isSupported) {
		$scope.storageType = 'Cookie'
	}

    $scope.facebookLogin = function() {
		if(!$window.FB) {
			return;
		}

		$rootScope.loading = true;
		FB.login(function (response) {
			$rootScope.loading = false;
			if (response.authResponse) {
                $rootScope.facebookToken = response.authResponse.accessToken;
                $rootScope.facebookUserId = response.authResponse.userID;

                localStorageService.set('fbToken', $rootScope.facebookToken)
                localStorageService.set('fbUserId', $rootScope.facebookUserId)

                $rootScope.getFacebookPhotosIds();
			} else {
				response.customMsg = 'Não foi possível logar com o Facebook.';
			}
		}, {scope: 'user_photos'});
	};

});
