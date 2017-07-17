// Calculator plugin
(function ($) {

	"use strict"

	$.fn.calc = function() {

		// Setup
		var Calculator = function() {
			this.eqArr = [];
		}

		Calculator.prototype = {
			
			// Add a new value to our sets
			addValue : function(value) {

				// First value must be int
				if (!this.eqArr.length) {
					if (value.type == 'int') {
						this.eqArr.push(value.val);
						this.updateValue();
						return;
					} else {
						var error = {
							type: 'Invalid Operation',
							message: 'First value must be a number',
						}
						this.error(error);
						return;
					}
				}

				// Prep for operations
				var last = this.eqArr.length - 1;
				var old = this.eqArr[last];

				// Handle int type
				if (value.type == 'int') {
					if (!this.isOperator(old)) {
						this.eqArr[last] = old + value.val;
						this.updateValue();
						return;
					} else {
						this.eqArr.push(value.val);
						this.updateValue();
						return;
					}
				}
				
				// Handle dec type
				if (value.type == 'dec') {
					if (this.isOperator(old)) {
						var error = {
							type: 'Invalid operation',
							message: 'Decimal can\'t follow an operator',
						}
						this.error(error);
						return;
					} else if (old.includes('.')) {
						var error = {
							type: 'Invalid operation',
							message: 'Cannot have multiple decimals',
							
						}
						this.error(error);
						return;
					} else {
						this.eqArr[last] = old + value.val;
						this.updateValue();
						return;
					}
					
				}

				// Handle Operator Type
				if (value.type == 'op') {
					if (this.isOperator(old)) {
						var error = {
							type: 'Invalid Operation',
							message: 'Two successive operators',
						}
						this.error(error);
						return;
					} else {
						this.eqArr.push(value.val)
						this.updateValue();
						return;
					}
				}
			},

			// Update Display values
			updateValue : function() {
				var c = this;
				$(equation).empty();
				this.eqArr.forEach(function(e, i) {
					var elem = $('<span>');
					if (c.isOperator(e)) {
						elem.addClass('operator');
					}
					elem.text(e).appendTo($(equation));
				});
				this.error(false);
			},

			// Calculate the result
			calculate : function() {
				var c = this;
				var a = this.eqArr.slice();
				// Bail if nothing to do
				if (!a.length) {
					var error = {
						type: 'Invalid operation',
						message: 'No equation specified',
					}
					this.error(error);
					return;
				}
				// Check operator is not last value
				if (this.isOperator(a[a.length-1])) {
					var error = {
						type: 'Invalid operation',
						message: 'Equation can\'t end with operator',
					}
					c.error(error);
					return;
				}
				// The Math
				theMath();
				function theMath() {
					//Exit if our array is exhausted.
					if (!a.length) {return}
					// Reduce our array of sets by performing operations, storing and splicing.
					reduce();
					function reduce() {
						displayResult();
						// Exit Conditions
						if (a.length < 3) {return};
						if (a[2] != undefined && a[1] == '/') {
							if (a[2].substr(0,1) == '0' && !a[2].includes('.')) {
								var error = {
									type: 'Invalid Calculation',
									message: 'Cannot divide by Zero',
								}
								c.error(error);
								$(result).text('Nonsense');
								return;
							}
						}
						// Operator Logic
						if (a[1] == '*' || a[1] == '/' || a[1] == '%') { // First operator is m/d
							operateAndClean(0, 2, 1); 
							return;
						} else if (a[1] == '+' || a[1] == '-') { // First operator is a/s
							if (a[3] != '*' && a[3] != '/' && a[3] != '%') { // Second operator is not m/d, perform at first operator
								operateAndClean(0, 2, 1); 
								return;
							} else if (a[3] == '*' || a[3] == '/' || a[3] == '%') { // Second operator is m/d, perform at second operator
								operateAndClean(2, 4, 3);
								return;
							}
						}
					}
					// Perform our operation, update lefthand with result, splice righthand and operator
					function operateAndClean(l, r, o) {
						a[l] = operation(a[l], a[r], a[o]);
						a.splice(o, 2);
						reduce();
					}
					// Select the action to perform based on val of 0
					function operation(l, r, o) {
						var l = parseFloat(l);
						var r = parseFloat(r);
						if (o == '*') {return l*r}
						if (o == '/') {return l/r}
						if (o == '-') {return l-r}
						if (o == '+') {return l+r}
						if (o == '%') {return l%r}
						console.error('could not make number');
					}
					// Display the result
					function displayResult() {
						$(result).text(a.toString());
					};
				}
			},

			// Reset the display
			reset : function() {
				this.eqArr = [];
				$(equation).text('-');
				$(result).text('-');
				this.error(false);
			},

			// Delete the last value
			delete : function() {
				if (!this.eqArr.length) {
					var error = {
						type: 'Invalid Operation',
						message: 'Nothing to delete',
					}
					this.error(error);
					return;
				} 
				var last = this.eqArr.length
				if (!this.isOperator(this.eqArr[last-1]) && this.eqArr[last-1].length > 1) {
					var oldv = this.eqArr[last-1];
					var newv = oldv.substr(0, oldv.length-1);
					this.eqArr[last-1] = newv;
					this.updateValue();
					return;
				} else if (last == 1) {
					this.reset();
					return;
				}
				this.eqArr.splice(last - 1);
				this.updateValue();
			},
			
			// Handle displayed errors
			error : function(err) {
				if (err == false) {
					$(error).removeClass('on');
					return;
				}
				$(error).addClass('on');
				$(error).text(err.type + ": " + err.message);
			},

			// Check value si an operator
			isOperator : function(val) {
				if (val == '*' ||
					val == '/' ||
					val == '+' ||
					val == '%' ||
					val == '-') {
					return true;
				}
				return false;
			}

		}

		return this.each(function () {
			var calc = new Calculator();
			events();
			function events() {
				$('.int .inner').on('click', function(){
					var value = {
						type: 'int',
						val : $(this).parent().attr('data-value'),
					}
					calc.addValue(value);
				});
				$('.operator .inner').on('click', function(){
					var value = {
						type: 'op',
						val : $(this).parent().attr('data-value'),
					}
					calc.addValue(value);
				});
				$('.dec .inner').on('click', function(){
					var value = {
						type: 'dec',
						val : $(this).parent().attr('data-value'),
					}
					calc.addValue(value);
				});
				$('.btn#reset .inner').on('click', function(){
					calc.reset();
				});
				$('.btn#delete .inner').on('click', function(){
					calc.delete();
				});
				$('.btn#equals .inner').on('click', function(){
					calc.calculate();
				});
			}
		 });	
	}

})(jQuery);

$(document).ready(function(){
	$('#calculator').calc();
});