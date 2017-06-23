'use strict';

/**
 * @ngdoc function
 * @name whatsYourPic.controller:AuthCtrl
 * @description
 * # AuthCtrl
 * Controller of the whatsYourPic
 */
whatsYourPic.controller('AuthCtrl', function($window, $rootScope, $scope,
localStorageService, ngProgressFactory) {
	console.log('auth');

	$rootScope.progressbar = ngProgressFactory.createInstance();
	$rootScope.progressbar.setColor("#000");

	$scope.storageType = 'Local storage';

	if (localStorageService.getStorageType().indexOf('session') >= 0) {
		$scope.storageType = 'Session storage';
	}

	if (!localStorageService.isSupported) {
		$scope.storageType = 'Cookie';
	}

    $rootScope.facebookLogin = function() {

		if ($rootScope.facebookToken && $rootScope.facebookUserId) {
			return;
		}

		if(!$window.FB) {
			return;
		}

		$rootScope.progressbar.start();
		$rootScope.progressbar.setColor("#000");
		FB.login(function (response) {
			if (response.authResponse) {
				$rootScope.progressbar.set(10);

                $rootScope.facebookToken = response.authResponse.accessToken;
                $rootScope.facebookUserId = response.authResponse.userID;

                localStorageService.set('fbToken', $rootScope.facebookToken);
                localStorageService.set('fbUserId', $rootScope.facebookUserId);

                $rootScope.getFacebookPhotosIds();
			} else {
				$rootScope.progressbar.complete();
				response.customMsg = 'Não foi possível logar com o Facebook.';
			}
		}, {scope: 'user_photos'});
	};

});
