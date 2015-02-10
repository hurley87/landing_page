/*
Copyright (c) 2015, Christian Natis
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following 
conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer 
in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived 
from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT 
NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) 
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

"use strict";

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.nSlider = factory();
    }
}(this, function () {
	function nSlider(element, options) {
		/* 
			Internal Variables
		*/
		var self = this;
		this.debugLevel = 5;
		this.stageWidth = 0;
		this.itemWidth = 0;
		this.marginRight = 0;
		this.marginLeft = 0;
		this.rootElement = element;
		this.items = new Array();
		this.currentItem = -1;
		this.hasTween = false;
		this.hasJQuery = false;
		this.hasCSS3 = false;
		this.animating = false;
		this.playing = true;
		this.paused = false;
		this.supportsTransitions = false;
		var transitionTimeout = null;
		var lastX = null;

		/* Perform Logging If Enabled */
		/* Debug Levels
		   1 = Everything
		   5 = Functions & Callbacks
		   10 = Settings
		*/
		this.log = function(message, level) {
			if(this.debug) {
				if(this.debugLevel <= level) {
					console.log("nSlider: " + message);
				}
			}
		}

		/* Function To Set Options */
		this.setOption = function(option, alt) {
			if(typeof(options) != "undefined") {
				if(typeof(options[option]) != "undefined") {
					this[option] = option
				} else {
					this[option] = alt;
				}
			} else {
				this[option] = alt;
			}
			this.log(option + ": " + this[option], 10);
		}
		
		/* Function To Call Callbacks */
		this.callback = function(callback) {
			this.log("Callback " + callback, 5);
			if(typeof(options) != "undefined") {
				if(typeof(options[callback]) != "undefined") {
					options[callback].call(self);
				}
			}
			clearTimeout(transitionTimeout);
		}

		/* Setup Responsive Update */
		this.setupResponsiveUpdate = function() {
			/* Add Event Listeners */
			if(typeof(self.nextElement.addEventListener) !== "undefined") {
				/* Resize */
				window.addEventListener("resize", self.responsiveUpdate);
			} else {
				/* Resize */
				window.attachEvent("onresize", self.responsiveUpdate);
			}
		}

		/* Responsive Update */
		this.responsiveUpdate = function(e) {
			var visibleItems = self.visibleItems;
			if(self.visibleItems * self.itemWidth > self.wrapperElement.clientWidth) {
				self.setupStage();
			} else {
				while(visibleItems * self.itemWidth < self.wrapperElement.clientWidth) {
					visibleItems++;
				}
				if(visibleItems > self.visibleItems) {
					self.setupStage();
				}
			}
		}

		/* Checks For Animation Support */
		this.setupAnimation = function() {
			/* Transition Support */
			self.supportsTransitions = 'transition' in self.rootElement.style ||
		                               'WebkitTransition' in self.rootElement.style ||
		                               'MozTransition' in self.rootElement.style ||
		                               'msTransition' in self.rootElement.style ||
		                               'OTransition' in self.rootElement.style;

			/* Check If We Have TweenLite */
			if(typeof(TweenLite) != "undefined") {
				self.hasTween = true;
			}
			/* Check If We Have jQuery */
			if(typeof(jQuery) != "undefined") {
				self.hasJQuery = true;
			}
			/* Check If We Have CSSTransforms */
			if(document.getElementsByTagName("html")[0].classList.contains("csstransforms3d")) {
				self.hasCSS3 = true;
			}
		}

		/* Build Wrapper and Stage */
		this.buildStage = function() {
			/* Build Wrapper */
			self.wrapperElement = document.createElement("div");
			self.rootElement.appendChild(self.wrapperElement);
			self.wrapperElement.classList.add(self.wrapperClass);
			self.wrapperElement.style.paddingLeft = self.stagePadding + "px";
			self.wrapperElement.style.paddingRight = self.stagePadding + "px";
			/* Build Stage */
			self.stageElement = document.createElement("div");
			self.wrapperElement.appendChild(self.stageElement);
			self.stageElement.classList.add(self.stageClass);

			/* Move Items Into Stage Element */
			for(var i = 0; i < self.rootElement.childNodes.length - 1; i++) {
				var curItem = self.rootElement.childNodes[i];
				if(typeof(curItem.hasAttribute) != "undefined") {
					self.stageElement.appendChild(curItem);
				}
			}
		}

		/* Sets Up Stage Size, Items and Margins */
		// Needs work for stage padding
		this.setupStage = function() {
			self.stageWidth = 0;
			self.items = new Array();
			self.visibleItems = 0;
			/* Calculate Stage Size, Item Width and Number of Visible Items */
			for(var i = 0; i < self.stageElement.childNodes.length; i++) {
				var curItem = self.stageElement.childNodes[i];
				if(typeof(curItem.hasAttribute) != "undefined") {
					self.items.push(curItem);
					curItem.classList.add(self.itemClass);
					self.stageWidth += curItem.offsetWidth;
					self.itemWidth = curItem.offsetWidth;
					if(self.stageWidth <= (self.wrapperElement.clientWidth - (self.stagePadding * 2))) {
						self.visibleItems = i + 1;
					}
				}
			}

			/* Calculate Margin For Items */
			var margin = (((self.visibleItems * self.itemWidth) - self.wrapperElement.clientWidth - self.stagePadding * 2) / 2) / self.visibleItems;
			self.marginRight = margin;
			self.marginLeft = margin;
			self.stageWidth += -((margin * 2) * self.items.length);
			self.itemWidth += -margin * 2;

			for(var i = 0; i < self.items.length; i++) {
				self.items[i].style.marginRight = -self.marginRight + "px";
				self.items[i].style.marginLeft = -self.marginLeft + "px";
			}

			/* Set Stage Size */
			self.stageElement.style.width = self.stageWidth + "px";

			self.currentItem = self.startItem;

			/* Set Stage to Current Item */
			if(self.currentItem >= 0) {
				self.animateStage(-(self.currentItem * self.itemWidth) + "px", 0);
			} else {
				self.stageElement.style.left = "0px";
			}
		}

		/* Build Navigation Elements */
		this.setupNavigation = function() {
			if(self.showNavigation) {
				self.nextElement = document.createElement("div");
				self.nextElement.classList.add(self.navClass);
				self.nextElement.id = self.nextId;
				self.nextElement.innerHTML = "<i class='fa fa-arrow-right fa-2x'></i>";
				self.prevElement = document.createElement("div");
				self.prevElement.classList.add(self.navClass);
				self.prevElement.id = self.prevId;
				self.prevElement.innerHTML = "<i class='fa fa-arrow-left fa-2x'></i>";
				self.rootElement.appendChild(self.nextElement);
				self.rootElement.appendChild(self.prevElement);
				/* Add Event Listeners */
				if(typeof(self.nextElement.addEventListener) !== "undefined") {
					/* Click */
					self.nextElement.addEventListener("click", self.nextItem);
					self.prevElement.addEventListener("click", self.prevItem);
					/* Drag Navigation */
					self.rootElement.addEventListener("mousedown", self.dragNavigation);
					self.rootElement.addEventListener("mouseup", self.dragNavigation);
					self.rootElement.addEventListener("mousemove", self.dragNavigation);
					self.rootElement.addEventListener("touchstart", self.dragNavigation);
					self.rootElement.addEventListener("touchend", self.dragNavigation);
					self.rootElement.addEventListener("touchmove", self.dragNavigation);
				} else {
					/* Click */
					self.nextElement.attachEvent("onclick", self.nextItem);
					self.prevElement.attachEvent("onclick", self.prevItem);
					/* Drag Navigation */
					self.rootElement.attachEvent("onmousedown", self.dragNavigation);
					self.rootElement.attachEvent("onmouseup", self.dragNavigation);
					self.rootElement.attachEvent("onmousemove", self.dragNavigation);
					self.rootElement.attachEvent("touchstart", self.dragNavigation);
					self.rootElement.attachEvent("touchend", self.dragNavigation);
					self.rootElement.attachEvent("touchmove", self.dragNavigation);
				}
			}
		}

		/* Sets Transition Speed */
		this.setTransitionSpeed = function(speed) {
			self.log("Transition speed: " + speed);
			if(self.supportsTransitions && !self.useTween) {
				self.stageElement.style.transition = "all " + speed + "s " + self.transitionEasing;
			}
		}

		/* Animates The Stage to leftVal */
		this.animateStage = function(leftVal, transitionSpeed) {
			self.log("Animate Stage", 5);
			self.log("leftVal: " + leftVal, 5);
			self.log("transitionSpeed: " + transitionSpeed, 5);
			/* Before Animation Callback */
			self.callback("beforeAnimation");
			if(self.useTween && self.hasTween) {
				self.animating = true;
				TweenLite.to(self.stageElement, transitionSpeed, {left: leftVal, ease: self.transitionEasing, onComplete: function() {
						self.animating = false;
						/* After Animation Callback */
						self.callback("afterAnimation");
					}
				});
			} else if(self.useJQuery && self.hasJQuery) {
				jQuery(self.stageElement).animate({left: leftVal}, transitionSpeed, self.transitionEasing, function() {
						self.animating = false;
						/* After Animation Callback */
						self.callback("afterAnimation");
				});
			} else if(self.useCSS3 && self.hasCSS3) {
				self.setTransitionSpeed(transitionSpeed);
				self.stageElement.style.transform="translate3d(" + leftVal + ", 0, 0)";
				var transitionTimeout = setTimeout(function() {
					/* After Animation Callback */
					self.callback("afterAnimation");
				}, transitionSpeed);
			} else {
				self.setTransitionSpeed(transitionSpeed);
				self.stageElement.style.left = leftVal;
				var transitionTimeout = setTimeout(function() {
					/* After Animation Callback */
					self.callback("afterAnimation");
				}, transitionSpeed);
			}
		}

		/*
			NEEDS WORK!!!
		*/
		/* Drag Navigation */
		this.dragNavigation = function(e) {
			switch(e.type) {
				case "mousedown": 
				case "touchstart":
					self.dragging = true;
					break;
				case "mouseup":
				case "touchend":
					if(self.dragging) {
						var currentX = parseInt(self.stageElement.style.left);
						var curWidth = 0;
						for(var i = 0; i < self.items.length; i++) {
							// NEEDS WORK!
							if((curWidth >= -currentX - (self.itemWidth / 2))) {
								if(self.currentItem + self.visibleItems < self.items.length) {
									self.currentItem = i;
								} else {
									self.currentItem = self.items.length - self.visibleItems;
								}
								var transitionSpeed = (self.transitionSpeed / self.itemWidth) * (-currentX - (self.itemWidth * self.currentItem));
								if(transitionSpeed < 0) {
									transitionSpeed = transitionSpeed * -1;
								}
								self.animateStage(-(self.currentItem * self.itemWidth) + "px", transitionSpeed);
								break;
							}
							curWidth += self.items[i].offsetWidth;
						}
					}
					self.dragging = false;
					break;
				case "mousemove":
				case "touchmove":
					if(self.dragging) {
						var cX = 0;
						if(typeof(e.clientX) !== "undefined") {
							cX = e.clientX;
						} else {
							cX = e.changedTouches[0].clientX;
						}
						var currentX = parseInt(self.stageElement.style.left);
						var newX = currentX;
						var changedX = cX - lastX;
						var rootWidth = self.rootElement.clientWidth;
						newX += changedX;
						if((-newX >= -self.maxDrag) && (-newX <= (self.stageWidth - self.visibleItems * self.itemWidth) + self.maxDrag)) {
							self.animateStage(newX + "px", 0);
						}
					}
					lastX = cX;
					break;
			}
		}

		/* Navigation Functions */
		this.nextItem = function() {
			self.log("Next Item", 5);
			self.log("currentItem: " + self.currentItem, 5);
			self.log("items.length: " + self.items.length, 5);
			self.log("visibleItems: " + self.visibleItems, 5);
			self.log("animating: " + self.animating, 5);
			self.log("paginate: " + self.paginate, 5);
			if((self.currentItem + 2 < self.items.length) && !self.animating) {
				var leftVal = null;
				var transitionSpeed = 0;
				if(self.paginate) {
					var itemsToMove = 0;
					if(self.currentItem + (self.visibleItems * 2) >= self.items.length) {
						itemsToMove = self.items.length - (self.currentItem + self.visibleItems);
					} else {
						itemsToMove = self.visibleItems;
					}
					if(self.useCSS3 && self.hasCSS3) {
						var end = self.stageElement.style.transform.toString().indexOf(",");
						if(end > 0) {
							leftVal = parseInt(self.stageElement.style.transform.substring(12, end)) - (self.itemWidth * itemsToMove) + "px";
						} else {
							leftVal = -(self.itemWidth * itemsToMove) + "px";
						}
					} else {
						leftVal = parseInt(self.stageElement.style.left) - (self.itemWidth * itemsToMove) + "px";
					}
					transitionSpeed = self.transitionSpeed * itemsToMove;
					self.log("itemsToMove: " + itemsToMove, 5);
					self.currentItem += itemsToMove;
				} else {
					if(self.useCSS3 && self.hasCSS3) {
						var end = self.stageElement.style.transform.toString().indexOf(",");
						if(end > 0) {
							leftVal = parseInt(self.stageElement.style.transform.substring(12, end)) - self.itemWidth + "px";
						} else {
							leftVal = -self.itemWidth + "px";
						}
					} else {
						leftVal = parseInt(self.stageElement.style.left) - self.itemWidth + "px";
					}
					transitionSpeed = self.transitionSpeed;
					self.currentItem++;
				}
				self.animateStage(leftVal, transitionSpeed);
			}
		}

		this.prevItem = function() {
			if(self.currentItem > 0 && !self.animating) {
				if(self.paginate) {
					var itemsToMove = 0;
					if(self.currentItem >= self.visibleItems - 1) {
						itemsToMove = self.visibleItems;
					} else {
						itemsToMove = self.currentItem;
					}
					if(self.useCSS3 && self.hasCSS3) {
						var end = self.stageElement.style.transform.toString().indexOf(",");
						if(end > 0) {
							var leftVal = parseInt(self.stageElement.style.transform.substring(12, end)) + (self.itemWidth * itemsToMove) + "px";
						} else {
							var leftVal = (self.itemWidth * itemsToMove) + "px";
						}
					} else {
						var leftVal = parseInt(self.stageElement.style.left) + (self.itemWidth * itemsToMove) + "px";
					}
					var transitionSpeed = self.transitionSpeed * itemsToMove;
					self.currentItem -= itemsToMove;
				} else {
					if(self.useCSS3 && self.hasCSS3) {
						var end = self.stageElement.style.transform.toString().indexOf(",");
						if(end > 0) {
							var leftVal = parseInt(self.stageElement.style.transform.substring(12, end)) + self.itemWidth + "px";;
						} else {
							var leftVal = self.itemWidth + "px";
						}
					} else {
						var leftVal = parseInt(self.stageElement.style.left) + self.itemWidth + "px";
					}
					var transitionSpeed = self.transitionSpeed;
					self.currentItem--;
				}
				self.animateStage(leftVal, transitionSpeed);
			} else {
				self.log("Reached first item", 5);
			}
		}

		this.goTo = function(index) {
			if(index >= 0) {
				if(index > self.currentItem) {

				} else {

				}
				var transitionSpeed = self.transitionSpeed * (self.currentItem - index);
				if(transitionSpeed < 0) {
					transitionSpeed = transitionSpeed * -1;
				}
				var leftVal = self.itemWidth * index + "px";
				
				self.currentItem = index;
				self.animateStage(leftVal, transitionSpeed);
			}
		}

		this.skipTo = function(index) {
			if(index >= 0) {
				self.stageElement.style.left = self.itemWidth * index + "px";
			}
		}

		/* Slide Management Commands */
		this.add = function(slide) {
			/* Before Add Slide Callback */
			self.callback("beforeAddSlide");
			var slideElement = slide;
			if(typeof(slide) == "string") {
				var div = document.createElement('div');
				div.innerHTML = slide;
				slideElement = div.childNodes[0];
			} else if(typeof(jQuery) != "undefined") {
				if(slide instanceof jQuery) {
					slideElement = slide[0];
				}
			}
			self.stageElement.appendChild(slideElement);
			self.setupStage();
			/* After Add Slide Callback */
			self.callback("afterAddSlide");
		}

		this.remove = function(index) {
			/* Before Remove Slide Callback */
			self.callback("beforeRemoveSlide");
			if(index < self.items.length) {
				self.stageElement.removeChild(self.items[index]);
				self.setupStage();
			}
			/* After Remove Slide Callback */
			self.callback("afterRemoveSlide");
		}

		/* Autoplay Commands */
		this.resume = function() {
			self.paused = false;
			self.setupAutoPlay();
			/* Resume Callback */
			self.callback("onResume");
		}

		this.pause = function() {
			self.paused = true;
			/* Pause Callback */
			self.callback("onPause");
		}

		this.stop = function() {
			self.playing = false;
			/* Stop Callback */
			self.callback("onStop");
		}

		/* Autoplay Functionality */
		this.setupAutoPlay = function() {
			if(self.autoPlay) {
				var autoPlayInterval = setInterval(function() {
					if(self.paused || !self.playing) {
						clearInterval(autoPlayInterval);
					} else {
						self.nextItem();
					}
				}, self.playSpeed * 1000);
			}
		}

		/* Slider Commands */
		this.destroy = function() {
			/* Before Destroy Callback */
			self.callback("beforeDestroy");

			/* Remove Navigation Elements */
			if(self.showNavigation) {
				self.rootElement.removeChild(self.nextElement);
				self.rootElement.removeChild(self.prevElement);
			}

			/* Move Items Back Into Root Element */
			for(var i = 0; i < self.items.length; i++) {
				var curItem = self.items[i];
				if(typeof(curItem.hasAttribute) != "undefined") {
					curItem.classList.remove(self.itemClass);
					if(typeof(curItem.style.removeProperty) != "undefined") {
						curItem.style.removeProperty("margin-right");
						curItem.style.removeProperty("margin-left");
					} else {
						curItem.style.removeAttribute("margin-right");
						curItem.style.removeAttribute("margin-left");
					}
					self.rootElement.appendChild(curItem);
				}
			}

			/* Remove Stage and Wrapper Elements */
			self.wrapperElement.removeChild(self.stageElement);
			self.rootElement.removeChild(self.wrapperElement);

			/* Zero Out Variables */
			self.stageWidth = 0;
			self.items = new Array();
			self.visibleItems = 0;
			self.itemWidth = 0;
			self.marginRight = 0;
			self.marginLeft = 0;
			self.currentItem = -1;

			/* After Destroy Callback */
			self.callback("afterDestroy");
		}

		this.reinit = function(options) {
			/* ReInit Callback */
			self.destroy();
			self.init(self.rootElement, options);
			self.callback("onReInit");
		}

		/* Setup Options Function */
		this.setupOptions = function(options) {
			self.itemClass = "slider-item" || options.itemClass;
			self.wrapperClass = "slider-wrapper" || options.wrapperClass;
			self.stageClass = "slider-stage" || options.stageClass;
			self.nextId = "next-button" || options.nextId;
			self.prevId = "prev-button" || options.prevId;
			self.navClass = "slider-nav" || options.navClass;
			self.setOption("transitionSpeed", 0.350);
			self.setOption("transitionEasing", "ease-in-out");
			self.setOption("showNavigation", true);
			self.setOption("paginate", true);
			self.setOption("autoPlay", false);
			self.setOption("playSpeed", 5);
			self.setOption("allowWrap", true);
			self.setOption("useTween", false);
			self.setOption("useJQuery", false);
			self.setOption("useCSS3", false);
			self.setOption("maxDrag", 100);
			self.setOption("stagePadding", 0);
			self.setOption("startItem", 0);
			self.setOption("debug", true);
		}

		/* Init Function */
	   	this.init = function(element, options) {
	   		if(typeof(element) === "undefined") {
	   			/*
					Get data attributes and init slider
	   			*/
	   			var elements = Array();
	   			var optionsArray = Array();

	   			if(typeof(document.querySelectorAll) != "undefined") {
	   				elements = document.querySelectorAll("[data-nslider]");
	   			} else {
	   				var matchingElements = [];
				    var allElements = document.getElementsByTagName('*');
				    for (var i = 0; i < allElements.length; i++) {
					    if (allElements[i].getAttribute("data-nslider") != "undefined") {
					    	var elementOptions = {}; 
					    	if(allElements[i].getAttribute("data-nslider-transition-speed-speed") != "undefined") {
					    		elementOptions.transitionSpeed = allElements[i].getAttribute("data-nslider-transition-speed");
					    	}
					    	if(allElements[i].getAttribute("data-nslider-transition-easing") != "undefined") {
					    		elementOptions.transitionEasing = allElements[i].getAttribute("data-nslider-transition-easing");
					    	}
					    	if(allElements[i].getAttribute("data-nslider-show-navigation") != "undefined") {
					    		elementOptions.showNavigation = allElements[i].getAttribute("data-nslider-show-navigation");
					    	}
					    	if(allElements[i].getAttribute("data-nslider-paginate") != "undefined") {
					    		elementOptions.paginate = allElements[i].getAttribute("data-nslider-paginate");
					    	}
					    	if(allElements[i].getAttribute("data-nslider-autoplay") != "undefined") {
					    		elementOptions.autoPlay = allElements[i].getAttribute("data-nslider-autoplay");
					    	}
					    	if(allElements[i].getAttribute("data-nslider-play-speed") != "undefined") {
					    		elementOptions.playSpeed = allElements[i].getAttribute("data-nslider-play-speed");
					    	}
					    	if(allElements[i].getAttribute("data-nslider-start-item") != "undefined") {
					    		elementOptions.startItem = allElements[i].getAttribute("data-nslider-start-item");
					    	}
					    	if(allElements[i].getAttribute("data-nslider-stage-padding") != "undefined") {
					    		elementOptions.stagePadding = allElements[i].getAttribute("data-nslider-stage-padding");
					    	}
					    	optionsArray.push(elementOptions);
					    	elements.push(allElements[i]);
					    }
				    }
	   			}
				element = elements[0];
				options = optionsArray[0];
	   		}

	   		/* Before Init Callback */
			self.callback("beforeInit");

	   		/* Configuration */
			self.setupOptions(options);

			/* Get Root Element */
			if(typeof(jQuery) != "undefined") {
				if(element instanceof jQuery) {
					self.rootElement = element[0];
				}
			} else {
				self.rootElement = element;
			}

			/* Setup Amimation Options */
			self.setupAnimation();

		    /* Build Stage */
		    self.buildStage();

			/* Setup Stage */
			self.setupStage();

			/* Setup Navigation */
			self.setupNavigation();

			/* Setup Autoplay */
			self.setupAutoPlay();

			/* Setup Responsive Update */
			self.setupResponsiveUpdate();

			/* After Init Callback */
			self.callback("afterInit");
		}

		this.init(element, options);
	}
	return nSlider;
}));