/*global angular */

/*
 jQuery UI Autocomplete directive wrapper
 */

angular.module('mvsAutocomplete', [])
  .directive('mvsAutocomplete', function($parse){
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
      scope: {
        model: '=',
        source: '='
      },
      link: function(scope, element, attrs) {
        var valueGetter = attrs.valuePath && $parse(attrs.valuePath),
            labelGetter = attrs.labelPath && $parse(attrs.labelPath),
            modelGetter = (valueGetter && $parse('__obj')) || angular.identity,
            options = { // jQuery UI autocomplete options
              minLength: 0,
              source: getSource(scope.source, valueGetter, labelGetter) || []
            };

        element.autocomplete(options);

        element.on('autocompleteselect', function (e, ui) {
          // set model on select
          scope.$apply(function() {
            scope.model = modelGetter(ui.item);
          });
        });

        element.bind('keyup', function () {
          // set model to null when input is empty
          if (!element.val().length) {
            scope.$apply(function() {
              scope.model = null;
            });
          }
        });

        scope.$watch('source', function (source) {
          // watch source changes
          element.autocomplete(
            'option', 'source', getSource(source, valueGetter, labelGetter)
          );
        }, true);
      }
    };
  });
