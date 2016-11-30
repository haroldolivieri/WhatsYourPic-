whatsYourPic.directive('myDatepicker', function () {
    return {
        restrict: 'E',
        replace: true,
        controller: DatePickerController,
        controllerAs: 'vm',
        scope: {
            dt: '=',
            datestyle: '@',
            datepickermode: '@',
            minmode: '@',
            mindate: '=',
            maxdate: '='
        },
        link: function (scope, $scope, $element) {},
        templateUrl: 'views/datepicker.html'
    };
}).controller('DatePickerController', DatePickerController);

DatePickerController.$inject = ['$scope'];

function DatePickerController($scope) {

    var vm = this;
    if ($scope.datepickermode) {
        vm.DatepickerMode = $scope.datepickermode;
    } else {
        vm.DatepickerMode = 'day';
    }

    if ($scope.minmode) {
        vm.MinMode = $scope.minmode;
    } else {
        vm.MinMode = 'day';
    }

    if ($scope.mindate) {
        vm.MinDate = new Date($scope.mindate).toLocaleDateString("pt-BR");
    } else {
        vm.MinDate = new Date('1000/01/01').toLocaleDateString("pt-BR");
    }

    if ($scope.maxdate) {
        vm.MaxDate = new Date($scope.maxdate).toLocaleDateString("pt-BR");
    } else {
        vm.MaxDate = new Date('9999/12/31').toLocaleDateString("pt-BR");
    }

    vm.dateOptions = {
        datepickerMode: vm.DatepickerMode,
        minMode: vm.MinMode,
        minDate: vm.MinDate,
        maxDate: vm.MaxDate
    };

    vm.openCalendar = function () {
        if (!$scope.dt) {
            $scope.dt = new Date(Date.now()).toLocaleDateString("pt-BR");
        }
        vm.dateOptions = {
            datepickerMode: vm.DatepickerMode,
            minMode: vm.MinMode,
            minDate: vm.MinDate,
            maxDate: vm.MaxDate,
            language: 'pt-BR'
        };
        vm.popupCalendar.opened = true;
    };

    vm.popupCalendar = {
        opened: false
    };

    vm.changeValue = function () {
        vm.popupCalendar.opened = true;
    };

    vm.prev = function () {
        refreshDate(-1);
    };

    vm.next = function () {
        refreshDate(1);
    };

    function refreshDate(cnt) {
        var buf = new Date($scope.dt).toLocaleDateString("pt-BR");
        var bufDate = buf.getDate();
        var bufMonth = buf.getMonth();
        var bufYear = buf.getFullYear();
        var changeDate;

        switch (vm.MinMode) {
            case 'day':
                bufDate = bufDate + cnt;
                changeDate = new Date(bufYear, bufMonth, bufDate);
                break;
            case 'month':
                bufMonth = bufMonth + cnt;
                changeDate = new Date(bufYear, bufMonth, '01');
                break;
            case 'year':
                bufYear = bufYear + cnt;
                changeDate = new Date(bufYear, 0, 1);
                break;
        }
        if (changeDate >= vm.MinDate && changeDate <= vm.MaxDate) {
            $scope.dt = changeDate;
        }
    }
}
