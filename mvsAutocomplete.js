/*global angular */

/*
 jQuery UI Autocomplete directive wrapper
 */

angular.module('mvsAutocomplete', [])
  .directive('mvsAutocomplete', ['$parse', function($parse) {
    // Transform source array to jQuery UI autocomplete source or return original source
    var getSource = function (source, valueGetter, labelGetter) {
      if (angular.isArray(source) && valueGetter) {
        var result = [];

        // Very often value and label are same
        if (valueGetter && !labelGetter) {
          labelGetter = valueGetter;
        }

        for (var i = 0; i < source.length; i++) {
          result.push({
            value: valueGetter(source[i]),
            label: labelGetter(source[i]),
            __obj: source[i]
          });
        }

        return result;
      }

      return source;
    }

    return {
      restrict: 'EA',
      scope: false,
      require: '?ngModel',
      replace: true,
      template: '<input type="text">',
      link: function(scope, element, attrs, ngModel) {
        if(!ngModel) return;

        var valueGetter = attrs.valuePath && $parse(attrs.valuePath),
            labelGetter = attrs.labelPath && $parse(attrs.labelPath),
            modelGetter = (valueGetter && $parse('__obj')) || angular.identity,
            options = { // jQuery UI autocomplete options
              minLength: 0,
              source: getSource(scope.$eval(attrs.source), valueGetter, labelGetter) || []
            };

        ngModel.$render = function () {
          element.val(ngModel.$viewValue);
        };

        ngModel.$formatters.push(function (value) {
          if (value) {
            return valueGetter(value);
          }
        });

        // jQuery UI Autocomplete
        element.autocomplete(options);

        element.on('autocompleteselect', function (e, ui) {
          scope.$apply(function () {
            ngModel.$setViewValue(modelGetter(ui.item));
          });
        });

        element.bind('keyup', function () {
          // set model to null when input is empty
          if (!element.val().length) {
            scope.$apply(function () {
              ngModel.$setViewValue(null);
            });
          }
        });

        scope.$watch(attrs.source, function (source) {
          // watch source changes
          element.autocomplete(
            'option', 'source', getSource(source, valueGetter, labelGetter)
          );
        }, true);
      }
    };
  }]);
