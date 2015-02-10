salix = (typeof salix === 'undefined') ? {} : salix;
salix.validation = (function ($) {

    return {

        /********************
        * PRIVATE VARIABLES *
        ********************/

        _opts: {},

        /*******************
        * PUBLIC FUNCTIONS *
        *******************/
        init: function (options) {
            if(!$.validator) {
                return;
            }

            if (options && options.standardElements) {
                var newStandardElements = options.standardElements;
                delete options.standardElements;
                this.addStandardElements(newStandardElements);
            }

            if (options && options.standardForms) {
                var newStandardForms = options.standardForms;
                delete options.standardForms;
                this.addStandardForms(newStandardForms);
            }

            if (options && options.keyCodes) {
                var newKeyCodes = options.keyCodes;
                delete options.keyCodes;
                this.addKeyCodes(newKeyCodes);
            }

            if (options && options.customValidationRules) {
                var newCustomValidationRules = options.customValidationRules;
                delete options.customValidationRules;
                this.addValidationRules(newCustomValidationRules);
            }

            if (options && options.keypressRestrictions) {
                var newKeypressRestrictions = options.keypressRestrictions;
                delete options.keypressRestrictions;
                this.addKeypressRestrictions(newKeypressRestrictions);
            }

            this._opts = $.extend({}, this._opts, options);

            (typeof $('input, textarea').placeholder !== "undefined") ? $('input, textarea').placeholder() : '';

            this._disableInputPaste();

            this.initialiseForms();

            this.addBindings();
        },

        /**
		 *	Builds the standard elements object for validation
		 */
        addStandardElements: function(elements) {
            if(!$.validator) {
                return;
            }
            
            this._opts.standardElements = $.extend({}, this._opts.standardElements, elements);
        },

        /**
		 *	Builds the standard forms object for validation
		 */
        addStandardForms: function(forms) {
            if(!$.validator) {
                return;
            }
            
            this._opts.standardForms = $.extend({}, this._opts.standardForms, forms);
        },

        /**
		 *	Adds keycode functions that help translate key codes into readable english
		 *	The keycode functions are used to validate input on form elements
		 */
        addKeyCodes: function(keyCodes) {
            this._opts.keyCodes = $.extend({}, this._opts.keyCodes, keyCodes);
        },

        /**
         *  Adds keypress functions that help translate restrict keypress's.
         *  The keypress functions are used to validate input on form elements.
         */
        addKeypressRestrictions: function(keypressRestrictions) {
            this._opts.keypressRestrictions = $.extend({}, this._opts.keypressRestrictions, keypressRestrictions);
        },

        /**
		 *	Parses the custom validation rules and adds them to jQuery validate to be used for 
		 *	form validation.
		 */
        addValidationRules: function(rules) {
            if(!$.validator) {
                return;
            }
            
            this._opts.customValidationRules = $.extend({}, this._opts.customValidationRules, rules);
        	$.each(this._opts.customValidationRules, function(name, rule){
        		if(typeof(rule) === "function") {
        			$.validator.addMethod(name, rule);
        		} else { 
					$.validator.addMethod(name, function (value, element) {
					    return this.optional(element) || rule.test(value);
					}, "");
				}
        	});
        },

        initialiseForms: function() {
            if(!$.validator) {
                return;
            }
            
            self = this;
            $.each(this._opts.standardForms, function(form, value){
                var rules_obj = self._getFormRules(form);
                var messages_obj = self._getFormMessages(form);
                $(form).validate({
                    ignore: '.no-validate',
                    errorPlacement: function (err, e) {
                        if (e.prop("tagName") == "INPUT" && e.attr("type") == "checkbox") {
                            err.insertAfter(e.siblings('div'));
                        } else {
                            err.appendTo(e.parent());
                        }
                    },
                    onfocusout: function (element) {
                        $(element).valid();
                    }
                });
                $.each(rules_obj, function(key, val){
                    val['messages'] = messages_obj[key];
                    $( form + " #" + key ).rules("add", val);
                });
            });
        },

		/**
		 *	Adds bindings to form elements to be validated
		 */
        addBindings: function() {
            if(!$.validator) {
                return;
            }

            self = this;

            $.each(this._opts.standardForms, function(form, value){
                $(form).on('submit', function (e) {
                    if ($(this).valid() == true) {
                        e.preventDefault();
                        var dataSet = $(this).serialize();
                        var statusCode = false;
                        var formMethod = $(this).attr("method");
                        var submissionUrl = $(this).data("process-url");
                        var thankyouUrl = $(this).data("success-url");

                        $.ajax({
                            type: formMethod,
                            url: submissionUrl,
                            data: dataSet,
                            dataType: 'json'
                        }).done(function (data) {
                            statusCode = data[0];
                            var msg = '';
                            if (statusCode == 'true') {
                                window.location = thankyouUrl;
                            } else {
                                msg = 'Sorry, your request could not be submitted. Please try again later.';
                                $("#FormProcessError").text(msg);
                            }
                        }).error(function (e) {
                            msg = 'Sorry, your request could not be submitted. Please try again later.';
                            $("#FormProcessError").text(msg);
                        });
                    }
                    return false;
                });
            });

			$('[data-keypress]').on('keypress', function(event) {
                if (!self._opts.keypressRestrictions[$(event.currentTarget).data('keypress')](event)) {
                    event.preventDefault();
                }
			});
        },

        /********************
        * PRIVATE FUNCTIONS *
        ********************/

        _disableInputPaste: function() {
        	$.each(this._opts.standardForms, function(form, value){
	            $(form + ' input').bind("paste", function (e) {
		            e.preventDefault();
		        });
        	});
        },

        _getFormRules: function(form) {
            self = this;
            var rules = {};
            $.each(self._opts.standardForms[form], function(name, rule){
                var new_rule = {};
                $.each(self._opts.standardElements[rule], function(key, val){
                    new_rule[key] = val.value;
                });
                rules[rule] = new_rule;
            });
            return rules;
        },

        _getFormMessages: function(form) {
            self = this;
            var messages = {};
            $.each(self._opts.standardForms[form], function(name, rule){
                var new_message = {};
                $.each(self._opts.standardElements[rule], function(key, val){
                    new_message[key] = val.message;
                });
                messages[rule] = new_message;
            });
            return messages;
        },
    };

})(jQuery);

/**
 *	Custom validation rules are used to validate form fields that require 
 * 	additional validation not provided by jQuery.
 * 	Rules can either be a regular expression or function.
 */
customValidationRules = {
	nameField: /^[a-z]([a-z ,'.-]+)?[a-z]$/i,
	credentialsField: /^[a-z\-\,']+$/i,
	zipcodeUS: /\d{5}-\d{4}$|^\d{5}$/,
	phoneUS: function(phone_number, element) {
		phone_number = phone_number.replace(/\s+/g, "");
		return this.optional(element) || phone_number.length > 9 &&
			phone_number.match(/^(\+?1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
	},
	maxWords: function(value, element, params) {
		return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length <= params;
	},
	minWords: function(value, element, params) {
		return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length >= params;
	},
	rangeWords: function(value, element, params) { 
		var valueStripped = stripHtml(value);
		var regex = /\b\w+\b/g;
		return this.optional(element) || valueStripped.match(regex).length >= params[0] && valueStripped.match(regex).length <= params[1]; 
	},
	vinUS: function(v) {
		if (v.length != 17) {
			return false;
		}
		var i, n, d, f, cd, cdv;
		var LL = ["A","B","C","D","E","F","G","H","J","K","L","M","N","P","R","S","T","U","V","W","X","Y","Z"];
		var VL = [1,2,3,4,5,6,7,8,1,2,3,4,5,7,9,2,3,4,5,6,7,8,9];
		var FL = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
		var rs = 0;
		for(i = 0; i < 17; i++){
			f = FL[i];
			d = v.slice(i,i+1);
			if (i == 8) {
				cdv = d;
			}
			if (!isNaN(d)) {
				d *= f;
			} else {
				for (n = 0; n < LL.length; n++) {
					if (d.toUpperCase() === LL[n]) {
						d = VL[n];
						d *= f;
						if (isNaN(cdv) && n == 8) {
							cdv = LL[n];
						}
						break;
					}
				}
			}
			rs += d;
		}
		cd = rs % 11;
		if (cd == 10) {
			cd = "X";
		}
		if (cd == cdv) {
			return true;
		}
		return false;
	},
	dateITA: function(value, element) {
		var check = false;
		var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
		if( re.test(value)){
			var adata = value.split('/');
			var gg = parseInt(adata[0],10);
			var mm = parseInt(adata[1],10);
			var aaaa = parseInt(adata[2],10);
			var xdata = new Date(aaaa,mm-1,gg);
			if ( ( xdata.getFullYear() == aaaa ) && ( xdata.getMonth () == mm - 1 ) && ( xdata.getDate() == gg ) )
				check = true;
			else
				check = false;
		} else
			check = false;
		return this.optional(element) || check;
	},
	time: /^([0-1]\d|2[0-3]):([0-5]\d)$/,
	time12hr: /^((0?[1-9]|1[012])(:[0-5]\d){0,2}(\ [AP]M))$/i,
	phoneUK: function(phone_number, element) {
		phone_number = phone_number.replace(/\(|\)|\s+|-/g,'');
		return this.optional(element) || phone_number.length > 9 &&
			phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?)|(?:\(?0))(?:(?:\d{5}\)?\s?\d{4,5})|(?:\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3}))|(?:\d{3}\)?\s?\d{3}\s?\d{3,4})|(?:\d{2}\)?\s?\d{4}\s?\d{4}))$/);
	},
	mobileUK: function(phone_number, element) {
		phone_number = phone_number.replace(/\s+|-/g,'');
		return this.optional(element) || phone_number.length > 9 &&
			phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?|0)7(?:[45789]\d{2}|624)\s?\d{3}\s?\d{3})$/);
	},
	phonesUK: function(phone_number, element) {
		phone_number = phone_number.replace(/\s+|-/g,'');
		return this.optional(element) || phone_number.length > 9 &&
			phone_number.match(/^(?:(?:(?:00\s?|\+)44\s?|0)(?:1\d{8,9}|[23]\d{9}|7(?:[45789]\d{8}|624\d{6})))$/);
	},
	postCodeUK: function(postcode, element) {
		postcode = (postcode.toUpperCase()).replace(/\s+/g,'');
		return this.optional(element) || postcode.match(/^([^QZ][^IJZ]{0,1}\d{1,2})(\d[^CIKMOV]{2})$/) || postcode.match(/^([^QV]\d[ABCDEFGHJKSTUW])(\d[^CIKMOV]{2})$/) || postcode.match(/^([^QV][^IJZ]\d[ABEHMNPRVWXY])(\d[^CIKMOV]{2})$/) || postcode.match(/^(GIR)(0AA)$/) || postcode.match(/^(BFPO)(\d{1,4})$/) || postcode.match(/^(BFPO)(C\/O\d{1,3})$/);
	},
	email2: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
	url2: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
	ipv4: /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i,
	ipv6: /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i,
};

salix.validation.addValidationRules(customValidationRules);

/**
 *	Standard elements are commonly used elements in standard forms
 *	The standard elements have default validation applied automatically
 */
standardElements = {};

$.extend(standardElements, {
	FirstName: {
	    required: {
	    	value: true,
	    	message: "First name is required."
	    },
        minlength: {
	    	value: 2,
	    	message: "Your first name must have at least 2 letters."
	    },
        maxlength: {
	    	value: 25,
	    	message: "Your first name cannot exceed 25 letters."
	    },
        nameField: {
	    	value: true,
	    	message: "Your first name cannot include numbers or special characters."
	    }
	},
	LastName: {
	    required: {
	    	value: true,
	    	message: "Last name is required."
	   	},
        minlength: {
        	value: 2,
        	message: "Your last name must have at least 2 letters."
       	},
        maxlength: {
        	value: 50,
        	message: "Your last name cannot exceed 50 letters."
       	},
        nameField: {
        	value: true,
        	message: "Your last name cannot include numbers or special characters."
       	}
	},
	Email: {
        required: {
        	value: true,
        	message: "Enter a valid email address."
		},    	
        email: {
        	value: true,
        	message: "Enter a valid email address."
		},    	
        minlength: {
        	value: 6,
        	message: "Please enter at least 6 characters."
		},    	
        maxlength: {
        	value: 200,
        	message: "Your email address cannot exceed 200 characters."
		}
    },
    EmailConfirmation: {
        required: {
        	value: true,
        	message: "Enter a valid email address."
        },
        email: {
        	value: true,
        	message: "Enter a valid email address."
        },
        equalTo: {
        	value: '#Email',
        	message: "Email does not match previous entry."
        },
        minlength: {
        	value: 6,
        	message: "Please enter at least 6 characters."
        },
        maxlength: {
        	value: 200,
        	message: "Your email address cannot exceed 200 characters."
        }
    },
    PhysicianFirstName: {
        required: {
        	value: true,
        	message: ""
        },
        minlength: {
        	value: 2,
        	message: ""
        },
        maxlength: {
        	value: 25,
        	message: ""
        },
        nameField: {
        	value: true,
        	message: ""
        }
    },
    PhysicianLastName: {
        required: {
        	value: true,
        	message: ""
        },
        minlength: {
        	value: 2,
        	message: ""
        },
        maxlength: {
        	value: 50,
        	message: ""
        },
        nameField: {
        	value: true,
        	message: ""
        }
    },
    PhysicianCity: {
        required: {
        	value: true,
        	message: ""
        },
        minlength: {
        	value: 4,
        	message: ""
        }
    },
    PhysicianState: {
        required: {
        	value: true,
        	message: ""
        }
    },
    PhysicianZip: {
        required: {
        	value: true,
        	message: ""
        },
        minlength: {
        	value: 2,
        	message: ""
        }
    },
    PhysicianPhone: {
        required: {
        	value: false,
        	message: ""
        },
        phoneUS: {
        	value: true,
        	message: ""
        },
        minlength: {
        	value: 10,
        	message: ""
        }
    },
    Address: {
        required: {
        	value: true,
        	message: "This field is required."
        },
        minlength: {
        	value: 4,
        	message: "Your address must have at least 4 alpha characters."
        },
        maxlength: {
        	value: 100,
        	message: "Your address cannot exceed 100 characters."
        }
    },
    Address2: {
        required: {
        	value: false,
        	message: "This field is required."
        },
        maxlength: {
        	value: 100,
        	message: "Address 2 cannot exceed 100 characters."
        }
    },
    City: {
        required: {
        	value: true,
        	message: "This field is required."
        },
        minlength: {
        	value: 4,
        	message: "Your city must have at least 4 letters."
        },
        maxlength: {
        	value: 100,
        	message: "City name cannot exceed 100 letters."
        },
        nameField: {
        	value: true,
        	message: "City cannot include numbers or special characters."
        }
    },
    State: {
        required: {
        	value: true,
        	message: "This field is required."
        }
    },
    Zip: {
        zipcodeUS: {
        	value: true,
        	message: "Enter a valid Zip code."
        },
        required: {
        	value: true,
        	message: "This field is required."
        }
    },
    Phone: {
        required: {
        	value: true,
        	message: "This field is required."
        },
        phoneUS: {
        	value: true,
        	message: ""
        },
        minlength: {
        	value: 10,
        	message: ""
        },
        maxlength: {
        	value: 12,
        	message: ""
        }
    },
    Iama: {
        required: {
        	value: true,
        	message: "Select an option from the menu."
        }
    },
    Profession: {
        required: {
        	value: true,
        	message: "Select an option from the menu."
        }
    },
    Credentials: {
        required: {
        	value: false,
        	message: "This field is required."
        },
        maxlength: {
        	value: 50,
        	message: "Your credentials cannot exceed 50 characters."
        },
        credentialsField: {
        	value: true,
        	message: "Your credentials cannot include numbers or special characters."
        }
    },
    Institution: {
        required: {
        	value: true,
        	message: "This field is required."
        },
        minlength: {
        	value: 2,
        	message: "Your institution / practice must have at least 2 characters."
        },
        maxlength: {
        	value: 50,
        	message: "Your institution / practice cannot exceed 50 characters."
        }
    },
    Over18: {
        required: {
        	value: true,
        	message: "You must be at least 18 years of age and a US resident to receive email updates."
        }
    },
    ParentGuardian: {
        required: {
        	value: true,
        	message: ""
        }
    }
    // more rules...
});

salix.validation.addStandardElements(standardElements);


/**
 *	Standard forms are common forms built with standard elements
 */
standardForms = {}

$.extend(standardForms, {
	".patient #FormSignUp": [
	    "FirstName",
        "LastName",
        "Email",
        "EmailConfirmation",
        "Zip",
        "Phone",
	]
});

salix.validation.addStandardForms(standardForms);

/**
 *	Key Codes are used to calculate allowable input into form fields
 *	These functions convert key code numbers into understandable english
 */
keyCodes = {}

$.extend(keyCodes, {
    isSpace: function (keypress) {
        return (keypress.keyCode == 32) ? true : false;
    },
    isSingleQuote: function (keypress) {
        return (keypress.keyCode == 39) ? true : false;
    },
    isComma: function (keypress) {
        return (keypress.keyCode == 44) ? true : false;
    },
    isHyphen: function (keypress) {
        return (keypress.keyCode == 45) ? true : false;
    },
    isPeriod: function (keypress) {
        return (keypress.keyCode == 46) ? true : false;
    },
    isNumeric: function (keypress) {
        return (
            keypress.keyCode >= 48 && 
            keypress.keyCode <= 57
        ) ? true : false;
    },
    isUpperCase: function (keypress) {
        return (
            keypress.keyCode >= 65 && 
            keypress.keyCode <= 90
        ) ? true : false;
    },
    isLowerCase: function (keypress) {
        return (
            keypress.keyCode >= 97 && 
            keypress.keyCode <= 122
        ) ? true : false;
    },
    isAlpha: function (keypress) {
        return (
            (keypress.keyCode >= 65 && keypress.keyCode <= 90) || 
            (keypress.keyCode >= 97 && keypress.keyCode <= 122)
        ) ? true : false;
    },
    isAlphanumeric: function (keypress) {
        return (
            (keypress.keyCode >= 48 && keypress.keyCode <= 57) || 
            (keypress.keyCode >= 65 && keypress.keyCode <= 90) || 
            (keypress.keyCode >= 97 && keypress.keyCode <= 122)
        ) ? true : false;
    },
});

salix.validation.addKeyCodes(keyCodes);

/**
 *  Key press validation functions used to validate input on form fields
 *  These are internal functions called by bindings on input keypress events
 */
keypressRestrictions = {};
keyCode = salix.validation._opts.keyCodes;

$.extend(keypressRestrictions, {
    isAlpha: function (keypress) {
        return (
            keyCode.isAlpha(keypress)
        ) ? true : false;
    },

    isAlphaHyphenSpaceSingleQuoteOrPeriod: function (keypress) {
        return (
            keyCode.isAlpha(keypress) || 
            keyCode.isHyphen(keypress) || 
            keyCode.isSpace(keypress) || 
            keyCode.isSingleQuote(keypress) || 
            keyCode.isPeriod(keypress)
        ) ? true : false;
    },

    isAlphaHyphenCommaOrSingleQuote: function (keypress) {
        return (
            keyCode.isAlpha(keypress) || 
            keyCode.isHyphen(keypress) || 
            keyCode.isComma(keypress) || 
            keyCode.isSingleQuote(keypress)
        ) ? true : false;
    },

    isAlphaHyphenCommaSingleQuoteOrSpace: function (keypress) {
        return (
            keyCode.isAlpha(keypress) || 
            keyCode.isHyphen(keypress) || 
            keyCode.isComma(keypress) || 
            keyCode.isSingleQuote(keypress) ||
            keyCode.isSpace(keypress)
        ) ? true : false;
    },

    isNumericOrHyphen: function (keypress) {
        return (
            keyCode.isNumeric(keypress) || 
            keyCode.isHyphen(keypress)
        ) ? true : false;
    }
});

salix.validation.addKeypressRestrictions(keypressRestrictions);
