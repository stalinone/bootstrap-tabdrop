/* =========================================================
 * bootstrap-tabdrop.js 
 * http://www.eyecon.ro/bootstrap-tabdrop
 * =========================================================
 * Copyright 2012 Stefan Petre
 * Copyright 2014 Jose Ant. Aranda
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */
 
!function( $ ) {

	var WinResizer = (function(){
		var registered = [];
		var inited = false;
		var timer;
		var resize = function(ev) {
			clearTimeout(timer);
			timer = setTimeout(notify, 100);
		};
		var notify = function() {
			for(var i=0, cnt=registered.length; i<cnt; i++) {
				registered[i].apply();
			}
		};
		return {
			register: function(fn) {
				registered.push(fn);
				if (inited === false) {
					$(window).bind('resize', resize);
					inited = true;
				}
			},
			unregister: function(fn) {
				for(var i=0, cnt=registered.length; i<cnt; i++) {
					if (registered[i] == fn) {
						delete registered[i];
						break;
					}
				}
			}
		}
	}());

	var TabDrop = function(element, options) {
		this.element = $(element);
		this.options = options;
        this.dropdown = $('<div class="btn-group hide tabdrop"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">'+options.text+'\n<span class="caret"></span></button><ul class="dropdown-menu"></ul></div>').appendTo(this.element);
        this.setMirror();
		WinResizer.register($.proxy(this.layout, this));
		this.layout();
	};

	TabDrop.prototype = {
		constructor: TabDrop,
        
        setMirror: function() {
            this.element.find('>.btn-group').not('.tabdrop').each(function(){
                var $group = $(this);
                var mirrorStr = '';
                
                $group.children().each(function(){
                    var groupElem = this;
                    var $groupElem = $(this);
                    var tag = groupElem.tagName;
                    var str = '';
                    switch (tag) {
                        case 'A':
                            //a entry
                            str = '<li><a href="' + groupElem.getAttribute('href') + '">' + $groupElem.text() + '</a></li>';
                            break;
                        case 'BUTTON':
                            //a header
                            var txt = $groupElem.text().trim();
                            if (txt != '') {
                                str = '<li class="dropdown-header">' + txt + '</li>';
                            }
                            break;
                        case 'UL':
                            if ($groupElem.hasClass('dropdown-menu')) {
                                //all childs add in
                                $groupElem.find('>li>a').each(function(){
                                    str += '<li><a href="' + this.getAttribute('href') + '">' + this.text + '</a></li>';
                                });
                            }
                            break;
                        default:
                            break;
                    }
                    mirrorStr += str;
                });
                
                //append as data
                $group.data('dropElem', $(mirrorStr));
            })
        },

		layout: function() {
			var options = this.options;
			var dropdown = this.dropdown;
            var dpMenu = dropdown.find(".dropdown-menu");
            var groups = this.element.find('>.btn-group').not('.tabdrop');

            var sendToDropdown = function (group, method) {
                var send = function (elem) {
                    switch (method) {
                        case 'prepend':
                            dpMenu.prepend(elem);
                            break;
                        case 'append':
                        default:
                            dpMenu.append(elem);
                            break;
                    }
                }

                group.addClass('hide');
                //add mirror to dropdown
                if (!dpMenu.is(':empty')) {
                    var divid = $('<li class="divider">');
                    send(divid);
                }
                var dropElem = group.data('dropElem');
                send(dropElem);
            }

			/* reset toolbar */
            dropdown.removeClass('hide');
            dpMenu.empty();
            groups.removeClass('hide');

            /* overflown to placeholder */
            groups.each(function(){
                if (this.offsetTop > options.offsetTop) {
                    sendToDropdown($(this), 'append');
                }
            });
            /* hide drop if no element */
            /* if has element, check moredrop offset */
            if (dpMenu.is(':empty')) {
                dropdown.addClass('hide');
            } else {
                while (dropdown.get(0).offsetTop > options.offsetTop) {
                    var lastGroup = groups.not('.hide').last();
                    sendToDropdown(lastGroup, 'prepend');
                }
            }
		}
	}

	$.fn.tabdrop = function ( option ) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('tabdrop'),
				options = typeof option === 'object' && option;
			if (!data)  {
				$this.data('tabdrop', (data = new TabDrop(this, $.extend({}, $.fn.tabdrop.defaults,options))));
			}
			if (typeof option == 'string') {
				data[option]();
			}
		})
	};

	$.fn.tabdrop.defaults = {
		text: 'More...',
		offsetTop: 0
	};

	$.fn.tabdrop.Constructor = TabDrop;

}( window.jQuery );
