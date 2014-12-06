/**
 * -prefix-free deconstructed.
 * 
 * Code based on the work of Lea Verou.
 * The -prefix-free project is licensed under MIT license.
 * 
 * @author Julien Sobczak
 */

(function() {

	var self = window.StyleFix = {
			
		link: function(link) {
			var url = link.href;
			
			// We use JQuery by convenience to avoid working with XMLHttpRequest object.
			$.get(link.href, function(css) {
				css = self.fix(css, true, link);
				
				var style = document.createElement('style');
				style.textContent = css;
				style.media = link.media;
				
				var parent = link.parentNode;
				parent.insertBefore(style, link);
				parent.removeChild(link);
			});
		},
			
		styleElement : function(style) {
			style.textContent = self.fix(style.textContent, true, style);
		},

		styleAttribute: function(element) {
			var css = element.getAttribute('style');

			alert(element + css);
			css = self.fix(css, false, element);
			
			element.setAttribute('style', css);
		},
		
		process : function() {
			// Linked stylesheets
			[].forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), StyleFix.link);
			
			// Inline stylesheets
			[].forEach.call(document.querySelectorAll('style'), StyleFix.styleElement);

			// Inline styles
			[].forEach.call(document.querySelectorAll('[style]'), StyleFix.styleAttribute);
		},

		register : function(fixer) {
			(self.fixers = self.fixers || []).push(fixer);
		},

		fix : function(css, raw, element) {
			for (var i = 0; i < self.fixers.length; i++) {
				css = self.fixers[i](css, raw, element);
			}

			return css;
		}

	};

	document.addEventListener('DOMContentLoaded', StyleFix.process, false);

})();

(function(root) {

	function camelCase(str) {
		return str.replace(/-([a-z])/g, function($0, $1) {
			return $1.toUpperCase();
		}).replace('-', '');
	}

	function deCamelCase(str) {
		return str.replace(/[A-Z]/g, function($0) {
			return '-' + $0.toLowerCase()
		});
	}
	
	var self = window.PrefixFree = {
		prefixCSS : function(css, raw, element) {
			var prefix = self.prefix;

			for (var i = 0; i < self.properties.length; i++) {
				var regex = RegExp(self.properties[i], 'gi');
				css = css.replace(regex, prefix + self.properties[i]);
			}

			return css;
		}

	};

	(function() {
		var prefix = undefined, 
		 	properties = [], 
		 	dummy = document.createElement('div').style;

		supported = function(property) {
			return camelCase(property) in dummy;
		}

		for ( var property in dummy) {
			property = deCamelCase(property);
			
			if (property.charAt(0) === '-') {
				properties.push(property);

				prefix = prefix || property.split('-')[1];
			}
		}
		
		self.prefix = '-' + prefix + '-';

		self.properties = [];

		// Get properties ONLY supported with a prefix
		for (var i = 0; i < properties.length; i++) {
			var property = properties[i];
			var unprefixed = property.slice(self.prefix.length);

			if (!supported(unprefixed)) {
				self.properties.push(unprefixed);
			}
		}

	})();

	StyleFix.register(self.prefixCSS);

})(document.documentElement);



