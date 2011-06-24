/*
 * jQuery One Page Menu Plugin
 * http://github.com/jdeiviz/JQuery-One-Page-Menu-Plugin
 *
 * Copyright (c) 2011 David Pemán Ruiz (@jdeiviz)
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * @version 1.0
 *
 * Contributor Jorge Rigabert (@jrigabert www.jorgerigabert.com)
 *
 * Example usage:
 * 
 * Menu:
 * 
 * <nav> 
 *    <ul> 
 *      <li><a href="#hello">Hello</a></li> 
 *      <li><a href="#works">Works</a></li> 
 *      <li><a href="#about-me">About me</a></li> 
 *      <li><a href="#contact">Contact</a></li> 
 *    </ul>
 * </nav>
 *
 * Sections:
 *
 * <section id="hello">
 *     ...
 * </section> 
 *
 * Plugin:
 *
 * $('nav').onePageMenu({
 *   findSameAnchors: true,
 *   thresholdInViewport: 400
 * });
 */
;(function($) {
	
	$.fn.onePageMenu = function(options) {
		
		//options

		this.defaults = {
			menuItemSel: 'li',
			sectionSel: 'section',
			selectorId: 'selector',
			activeClass: 'active',
			hoverClass: 'on',
			jsHover: true,
			animateScroll: true,
			animateSelect: true,
			hash: false,
			findSameAnchors: false,
			selectorAnimationDuration: null,
			selectorAnimationEasing: 'swing',
			thresholdInViewport: 0,
			beforeHoverOn: function() {},
			afterHoverOn: function() {},
			beforeHoverOff: function() {},
			afterHoverOff: function() {},
			beforeClick: function() {},
			afterClick: function() {},
			beforeActive: function() {},
			afterActive: function() {},
			scrollToDefaults: {
				duration: null,
				easing: 'swing',
				onAfter: function() {}
			}
		}
		
		var opts = $.extend({}, this.defaults, options);
		
		// private methods
		
		function hoverOn($menu, $menuItem, e) {
			$menuItem.trigger('onePageMenu.beforeHoverOn'); opts.beforeHoverOn.call($menuItem);
			if(!$menuItem.hasClass(opts.hoverClass))
				$menuItem.addClass(opts.hoverClass);
			$menuItem.trigger('onePageMenu.afterHoverOn'); opts.afterHoverOn.call($menuItem);
		}
		
		function hoverOff($menu, $menuItem, e) {
			$menuItem.trigger('onePageMenu.beforeHoverOff'); opts.beforeHoverOff.call($menuItem);
			$menuItem.removeClass(opts.hoverClass);
			$menuItem.trigger('onePageMenu.afterHoverOff'); opts.afterHoverOff.call($menuItem);
		}
		
		function active($menu, $menuItem, e, callback) {
			if($menuItem.hasClass(opts.activeClass))
				return;
			
			$menuItem.trigger('onePageMenu.beforeActive'); opts.beforeActive.call($menuItem);
			$menu.find(opts.menuItemSel).removeClass(opts.activeClass);
			$menuItem.addClass(opts.activeClass);
			if(opts.animateSelect)
				animateSelector($menu, $menuItem, e);
			if(callback)
				callback.call($menuItem);
			$menuItem.trigger('onePageMenu.afterActive'); opts.afterActive.call($menuItem);
		}
		
		function click($menu, $menuItem, e) {
			$menuItem.trigger('onePageMenu.beforeClick'); opts.beforeClick.call($menuItem);
			if(!$menuItem.hasClass(opts.activeClass)) {
				active($menu, $menuItem, e);
				if(opts.animateScroll)
					animateScroll($menu, $menuItem, e);
			} else {
				if(!opts.hash && e)
					e.preventDefault();
			}
			$menuItem.trigger('onePageMenu.afterClick'); opts.afterClick.call($menuItem);	
		}
		
		function animateScroll($menu, $menuItem, e) {
			var id = $menuItem.find('a').prop('hash');
			var $section = $(id);
			
			if(!$section.length)
				return;
				
			if(!opts.hash && e)
				e.preventDefault();
				
			var optsScrollTo = opts.scrollToDefaults;
			$(window)._scrollable().stop();	
			$(window).scrollTo($section, optsScrollTo);		
		}
		
		function animateSelector($menu, $menuItem, e) {
			var $selector = $('#' + opts.selectorId);
			$selector.removeClass().addClass('selector-' + $menuItem.find('a').prop('hash').slice(1));
			$selector.stop().animate({
				top: $menuItem.position().top + parseInt($menuItem.css("margin-top").replace("px", ""))
			}, opts.selectorAnimationDuration, opts.selectorAnimationEasing);
		}
		
		
		function activeInviewPort($menu, $menuItems, e) {
			if(opts.animateScroll 
				&& $(window)._scrollable().is(':animated'))
				return;
			
			var $inview = getSectionInviewPort();
			var hash = '#' + $inview.prop('id');
			var $menuItemScrolled = $menuItems.has('a[hash='+ hash + ']');
			if($menuItemScrolled.length) {
				active($menu, $menuItemScrolled, e, function() {
					if(opts.hash)
						if(history.pushState)
							history.pushState(null, null, hash);
						else
							window.location.hash = hash;
				});
			}
		}
		
		function activeOnInit($menu, $menuItems, e) {
			var $inview = getSectionInviewPort();
			var $menuItemSelected = $menuItems.has('a[hash=#'+ $inview.prop('id') + ']');
			
			$menuItemSelected.trigger('onePageMenu.beforeActive'); opts.beforeActive.call($menuItemSelected);
			$menuItemSelected.addClass(opts.activeClass);
			if(opts.animateSelect) {
				$('<div></div>', {
					id: opts.selectorId,
					'class':  'selector-' + $inview.prop('id'),
					css: {
						top: $menuItemSelected.position().top + parseInt($menuItemSelected.css("margin-top").replace("px", ""))
					}
				}).appendTo($menu);
			}
			$menuItemSelected.trigger('onePageMenu.afterActive'); opts.afterActive.call($menuItemSelected);
		}
		
		function getSectionInviewPort() {
			return $(opts.sectionSel).filter(function() {
				var $section = $(this);
				return $.inviewport($section, {threshold : opts.thresholdInViewport});
			}).first();
		}
		
		// public methods
		
		this.select = function(menuItem) {
			var $menuItem = $(menuItem);
			var $menu = this.has($menuItem);
			
			if($menu.length && !$menuItem.hasClass(opts.activeClass)) {
				active($menu, $menuItem);
				if(opts.animateScroll)
					animateScroll($menu, $menuItem);
			}
			return this;
		}
		
		// init
		
		return this.each(function() {	
			var $menu = $(this);
			var $menuItems = $menu.find(opts.menuItemSel);
			$(window).scroll(function(e) { activeInviewPort($menu, $menuItems, e) });
			activeOnInit($menu, $menuItems);
			
			$menuItems.each(function() {	
				var $menuItem = $(this);
				if(opts.jsHover) {
					$menuItem.bind('mouseenter', function(e) { hoverOn($menu, $menuItem, e) });
					$menuItem.bind('mouseleave', function(e) { hoverOff($menu, $menuItem, e) });
				}
				$menuItem.bind('click', function(e) { click($menu, $menuItem, e) });	
				
				if(opts.findSameAnchors) {
					$('a').not($menuItems.find('a')).each(function() {
						var $anchor = $(this);
						if($anchor.prop('hash') == $menuItem.find('a').prop('hash'))
							$anchor.bind('click', function(e) { click($menu, $menuItem, e) });
					});
				}
			});
		});
	}
	
})(jQuery);


