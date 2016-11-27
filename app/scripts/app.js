'use strict';

/**
 * @ngdoc overview
 * @name whatsYourPic
 * @description
 * # whatsYourPic
 *
 * Main module of the application.
 */
 var whatsYourPic = angular.module('whatsYourPic', [
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'LocalStorageModule',
    'smoothScroll',
    'google.places',
    'ui.bootstrap',
    'jtt_instagram'
]);

whatsYourPic.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
});

whatsYourPic.run(['$rootScope', '$window', function($rootScope, $window) {
    $window.fbAsyncInit = function() {
        FB.init({
            appId: 1826204104292904,
            cookie: true,
            xfbml: true,
            version: 'v2.4'
        });

        $(document).trigger('fbload');
    };

    //Carrega API do facebook assincronamente
    (function addFacebookSDK(d){

        var js,
        id = 'facebook-jssdk',
        ref = d.getElementsByTagName('script')[0];

        if (d.getElementById(id)) {
          return;
        }

        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "https://connect.facebook.net/en_US/sdk.js";

        ref.parentNode.insertBefore(js, ref);

    }(document));
}]);
