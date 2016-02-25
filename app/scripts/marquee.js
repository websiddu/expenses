/* --- App --- */
var app = {
  isAnimated: false,
  sizes: {},
  plugins: {},
  router: {},
  state: {},
  loader: {},
  device: {},
  dom: {},
  menu: {},
  pages: {},
  works: {},
  utils: {},
  config: {
    duration: 350,
    faster: 175,
    moveTime: 800,
    renderDelay: 1000/60,
    noVideo: (window.location.hash.indexOf('no-video')>=0)
  }
};


/* --- DOM --- */
app.dom = {
  $root: $('#root'),
  $html: $('html'),
  $body: $('body'),
  $document: $(document),
  $window: $(window)
};
app.dom.$wrapper = app.dom.$root.find('.root__wrapper');
app.dom.$frame = app.dom.$wrapper.find('.root__frame');
app.dom.$content = app.dom.$frame.find('.root__frame__content');
app.dom.$menu = app.dom.$root.find('.menu');
app.dom.ui = {
  $menu: app.dom.$root.find('.ui-menu'),
  $logo: app.dom.$root.find('.ui-logo')
};


/* --- Version --- */
app.version = app.dom.$root.data('version');


/* --- Prefixed styles --- */
var prefixed = {
  'transform': Modernizr.prefixed('transform'),
  'transform-origin': Modernizr.prefixed('transformOrigin')
};


$.fn.bg = function(){

  this.each(function(){

    var $block = $(this),
        $video = $block.find('.bg__video');
        // $mobileBG = $block.find('.bg__image_mobile');

    // if ($mobileBG.length && app.device.isMobile) {
    //  $block.find('.bg__image').not('.bg__image_mobile, .bg__image_phone').remove();
    // } else {
    //  $mobileBG.remove();
    // }
    // $mobileBG = null;

    if (app.device.isMobile || app.config.noVideo) {

      $video.remove();

    } else if ($video.length) {

      var src = $video.attr('src'),
          isEnabled = true;

      $video.attr('poster', '/build/images/blank.gif');

      var $screen = $block.closest('.screen'),
          $canvas = $('<canvas class="bg__canvas" />').appendTo($block),
          canvas = $canvas[0],
          ctx = canvas.getContext('2d'),
          played = false,
          ratio = $video.data('ratio') || 16/9,
          isEnded = false,
          isLoop = $video.attr('loop'),
          isStarted = false;

      var resize = function(){
        var screenRatio = app.sizes.width / app.sizes.height;
        var position = (screenRatio>ratio) ? {
          left: 0,
          top: -(app.sizes.width / ratio - app.sizes.height)/2,
          width: app.sizes.width,
          height: app.sizes.width / ratio
        } : {
          left: -(app.sizes.height * ratio - app.sizes.width)/2,
          top: 0,
          width: app.sizes.height * ratio,
          height: app.sizes.height
        };
        $video.add($canvas).css(position);
        canvas.width = position.width;
        canvas.height = position.height;
        position = null;
      };

      if (!isLoop) $video.on('ended', function(){
        isEnded = true;
      });

      var delay;

      var play = function(){
        if (played || isEnded) return false;
        played = true;
        if (!isEnabled) {
          isEnabled = true;
          $video[0].src = src;
          $video[0].load();
        }
        $video.addClass('bg__video_enabled');
        $canvas.removeClass('bg__canvas_enabled');
        if ($video.data('delay')) {
          delay = setTimeout(function(){
            $video[0].play();
          }, 750);
        } else {
          $video[0].play();
        }
      };

      $video.one('playing', function(){
        isStarted = true;
      });

      $screen.on('leave', function(){
        pause();
        if (isStarted) {
          $canvas.addClass('bg__canvas_enabled');
          ctx.drawImage($video[0], 0, 0, canvas.width, canvas.height);
        }
      });

      // $screen.on('unleave', function(){
      //  play();
      // });

      var pause = function(){
        clearTimeout(delay);
        if (!played || isEnded) return false;
        played = false;
        $video[0].pause();
      };

      app.dom.$window.on('resize', resize);
      resize();

      $screen.on('show fullShow return', play);

      $screen.on('fullHide', function(){
        pause();
        if (isEnabled && !isEnded) {
          $video.removeClass('bg__video_enabled');
          $canvas.removeClass('bg__canvas_enabled');
          isEnabled = false;
          $video[0].src = '';
          if ($video[0].currentTime) $video[0].currentTime = 0;
          $video[0].load();
        }
      });

    }

  });

};
$.fn.clock = function() {
  var $page = $(this);

  $page.find('[data-clock]').each(function() {

    var $clock = $(this)
      , time = $clock.data('clock')
      , diff = new Date(time) - Date.now()
      , $sArrow = $clock.find('[data-clock-arrow="s"]')
      , $mArrow = $clock.find('[data-clock-arrow="m"]')
      , $hArrow = $clock.find('[data-clock-arrow="h"]')
      , setRotate = function($block, degree) {
          $block.css({
            '-webkit-transform': 'rotate(' + degree + 'deg)',
            '-moz-transform': 'rotate(' + degree + 'deg)',
            '-ms-transform': 'rotate(' + degree + 'deg)',
            '-o-transform': 'rotate(' + degree + 'deg)',
            'transform': 'rotate(' + degree + 'deg)'
          });
        }
      , rotate = function($block, d, value) {
          if (d==24) {
            if (value>=12) value = value-12;
            d = 12;
          }
          var angle = ((value / d) * 360) - 90;
          if (value === (d - 1)) {
            setRotate($block, angle);
            setTimeout(function() {
              $block.addClass('i-no-transition');
              setTimeout(function() {
                setRotate($block, angle - 360);
              }, 20);
            }, 120);
          } else if ($block.hasClass('i-no-transition')) {
            $block.removeClass('i-no-transition');
            setTimeout(function() {
              setRotate($block, angle);
            }, 20);
          } else {
            setRotate($block, angle);
          }
        }
      , tick = function() {
          var now = new Date(Date.now() + diff);
          rotate($sArrow, 60, now.getSeconds());
          rotate($mArrow, 60, now.getMinutes());
          rotate($hArrow, 24, now.getHours() + now.getMinutes()/60);
        }
      ;
    tick();
    setInterval(tick, 1000);
  });
};

$.fn.loadBG = function(){

  return this.find('.bg__image[src], .bg__image[data-src]').each(function(){
    var block = this,
        src = this.getAttribute('src') || this.getAttribute('data-src');
    block.outerHTML = '<div class="'+block.className+'" style="background-image:url('+src+')" ></div>';
    src = null;
  });

  return false;

};
(function(dom){

  // light effect
  var effect = {
    show: function($block, position, size, ratio, offset){
      // $block[0].style.opacity = 1;
      $block[0].style[prefixed.transform] = 'translateY(' + Math.round( (offset || 0) + size-position*size) + 'px) translateZ(0)';
      // if (position==0) $block[0].style[prefixed.transform] = 'translateY(110%)';
    },
    hide: function($block, position, size, ratio, offset){
      // $block[0].style.opacity = (1-position*0.4).toFixed(3);
      $block[0].style[prefixed.transform] = 'translateY(' + Math.round( (offset || 0) + -(ratio-1)*size - (position*size)) + 'px) translateZ(0)';
      // if (position==1) $block[0].style[prefixed.transform] = 'translateY(-110%)';
      // if (position==0) $block[0].style[prefixed.transform] = 'translateY(' + Math.round(-(ratio-1)*size) + 'px) translateZ(0)';
    },
    move: function($block, position, size){
      // $block[0].style.opacity = 1;
      $block[0].style[prefixed.transform] = 'translateY(' + Math.round(-position*size) + 'px) translateZ(0)';
    }
  };
  app.effect = effect;

  $.fn.marquee = function(options){

    var settings = {
      index: 0,
      vertical: true,
      screens: '.screen',
      mousewheel: true,
      nextClass: 'screen_next',
      duration: 550,
      prev: false,
      next: false
    };
    $.extend(settings, options);

    var $frame = this,
        $screens = $frame.find(settings.screens),
        screens = [],
        overlayed = false,
        name = $frame.data('name');

    // marquee
    var marquee = {
      $block: $frame,
      index: 0,
      prevIndex: 0,
      progress: 0,
      size: 0,
      scrolling: false,
      enabled: true,
      duration: settings.duration
    };

    // screens
    $screens.each(function(i){
      var $block = $(this);
      // api
      var api = $block.api('screen');
      api.state = {
        isVisible: false,
        isEndShow: false,
        isStartShow: false,
        isFullShow: false,
        isFullHide: (settings.index==i) ? false : true
      };
      // screen
      var screen = {
        index: i,
        $block: $block,
        api: api,
        ratio: 1
      };
      // save screen
      screens.push(screen);
      // decor
      if (i && settings.nextClass) $block.addClass(settings.nextClass);
    });

    // {fn} resize fake
    var resize = function(){
      var offset = 0;
      marquee.size = settings.vertical ? $frame.height() : app.sizes.width;
      $.each(screens, function(i, screen){
        if (settings.vertical){
          screen.$block.removeClass('screen_long').height(marquee.size);
          var $frame = screen.$block.find('.screen__frame'),
              height = $frame.length ? Math.max(marquee.size, $frame.length ? $frame.outerHeight() : 0) : 0;
          if (height>marquee.size) {
            screen.$block.addClass('screen_long');
            screen.size = height;
            screen.$block.height(height);
          } else {
            screen.$block.removeClass('screen_long');
            screen.size = marquee.size;
          }
        } else {
          screen.size = app.sizes.width;
        }
        screen.offset = offset;
        screen.ratio = screen.size/marquee.size;
        offset += screen.size;
      });
    };
    dom.$root.addClass('root_resize');
    resize();

    // scroll
    var scroll = new IScroll($frame[0], {
      disableMouse: true,
      mouseWheel: settings.mousewheel,
      invertWheelDirection: true,
      scrollX: !settings.vertical,
      scrollY: settings.vertical,
      bounce: true,
      snap: '.screen',
      eventPassthrough: settings.vertical ? 'horizontal' : true,
      probeType: 3,
      tap: false,
      click: false,
      snapSpeed: 350,
      // bounceEasing: 'circOut',
      preventDefault: true,
      scrollbars: settings.vertical ? 'custom' : false,
      interactiveScrollbars: settings.vertical && !app.device.support.touch,
      // fake: true,
      prevTrigger: settings.prev,
      nextTrigger: settings.next
    });
    scroll.disable();
    dom.$root.removeClass('root_resize');

    // update state
    marquee.updateState = function(){
      if (scroll.scrollerHeight > scroll.wrapperHeight) {
        marquee.enable();
      } else {
        marquee.disable();
      }
    };

    // {fn} set limits
    marquee.setLimits = function(index){
      index = Math.min(Math.max(0, index), screens.length-1);
      var isLast = index >= screens.length-1,
          isFirst = index==0;
      // min limit
      scroll[settings.vertical ? 'minScrollY' : 'minScrollX'] = -screens[index].offset + (isFirst ? 0 : screens[index-1].size);
      // max limit
      scroll[settings.vertical ? 'maxScrollY' : 'maxScrollX'] = -screens[index].offset - (isLast ? screens[index].size-marquee.size : screens[index].size);
      // set current page
      scroll.currentPage = { x:0, y:0, pageX:0, pageY:0 };
      scroll.currentPage[settings.vertical ? 'y' : 'x'] = -screens[index].offset;
      scroll.currentPage[settings.vertical ? 'pageY' : 'pageX'] = index;
    };

    // {fn} update params
    marquee.update = function(){
      var position = -Math.round(scroll[settings.vertical ? 'y' : 'x']),
          index = 0;
      // get screen index
      for (var i=0; i<screens.length; i++) {
        if (position >= screens[i].offset) index = i;
      };
      // position
      marquee.position = (position-screens[index].offset) / screens[index].size;
      // progress
      marquee.progress = index+marquee.position;
      // indexes
      if (marquee.index!=index) {
        marquee.prevIndex = marquee.index;
        marquee.index = index;
      };
    };

    // {fn} hide invisibles
    marquee.hideInvisibles = function(){
      // for (var i=0; i<screens.length; i++) {
      //  if (i!=marquee.index && i!=marquee.index+1) {
      //    if (i>marquee.index+1) effect.show(screens[i].$block, 0, marquee.size, screens[i].ratio);
      //    if (i<marquee.index) effect.hide(screens[i].$block, 1, marquee.size, screens[i].ratio);
      //    screens[i].$block[0].style.display = 'none';
      //  }
      // };
    };

    // {fn} hide invisibles
    marquee.callScreensAPI = function(){
      var isLast = marquee.index>=screens.length-1,
          ratio = 1 / screens[marquee.index].ratio,
          position = { top:0, bottom:0 };
      // position
      position.top = marquee.position / ratio;
      position.bottom = marquee.position*screens[marquee.index].ratio - (screens[marquee.index].ratio - 1);
      if (app.device.isMobile) {
        // show and hide
        if (position.bottom>0.6) {
          if (screens[marquee.index].api.state.isVisible) {
            screens[marquee.index].api.state.isVisible = false;
            screens[marquee.index].$block.triggerHandler('hide');
          }
          if (!isLast && !screens[marquee.index+1].api.state.isVisible) {
            screens[marquee.index+1].api.state.isVisible = true;
            screens[marquee.index+1].$block.triggerHandler('show');
          }
        } else if (position.top>0.4) {
          if (screens[marquee.index] && !screens[marquee.index].api.state.isVisible) {
            screens[marquee.index].api.state.isVisible = true;
            screens[marquee.index].$block.triggerHandler('show');
          }
          if (!isLast && screens[marquee.index+1].api.state.isVisible) {
            screens[marquee.index+1].api.state.isVisible = false;
            screens[marquee.index+1].$block.triggerHandler('hide');
          }
        }
        // show start and end of next screen
        if (!isLast) {
          if (position.bottom>0.1 && !screens[marquee.index+1].api.state.isStartShow) {
            screens[marquee.index+1].api.state.isStartShow = true;
            screens[marquee.index+1].$block.triggerHandler('startShow');
          } else if (position.bottom<0.1 && screens[marquee.index+1].api.state.isStartShow) {
            screens[marquee.index+1].api.state.isStartShow = false;
          }
          if (position.bottom>0.9 && !screens[marquee.index+1].api.state.isEndShow) {
            screens[marquee.index+1].api.state.isEndShow = true;
            screens[marquee.index+1].$block.triggerHandler('endShow');
          } else if (position.bottom<0.9 && screens[marquee.index+1].api.state.isEndShow) {
            screens[marquee.index+1].api.state.isEndShow = false;
          }
        }
        // show start and end of current screen
        if (screens[marquee.index] && position.bottom<0.9 && !screens[marquee.index].api.state.isEndShow) {
          screens[marquee.index].api.state.isEndShow = true;
          screens[marquee.index].$block.triggerHandler('endShow');
        } else if (screens[marquee.index] && position.bottom>0.9 && screens[marquee.index].api.state.isEndShow) {
          screens[marquee.index].api.state.isEndShow = false;
        }
        if (screens[marquee.index] && position.bottom<0.1 && !screens[marquee.index].api.state.isStartShow) {
          screens[marquee.index].api.state.isStartShow = true;
          screens[marquee.index].$block.triggerHandler('startShow');
        } else if (screens[marquee.index] && position.bottom>0.1 && screens[marquee.index].api.state.isStartShow) {
          screens[marquee.index].api.state.isStartShow = false;
        }
      }
      // full show
      if (screens[marquee.index] && position.top>=0 && position.bottom<=0) {
        if (!screens[marquee.index].api.state.isFullShow) {
          screens[marquee.index].api.state.isFullShow = true;
          if (!app.device.isMobile) screens[marquee.index].$block.triggerHandler('show');
          screens[marquee.index].$block.triggerHandler('fullShow');
        };
        for (var i=0; i<screens.length; i++) {
          if (i!=marquee.index && screens[i].api.state.isFullShow) screens[i].api.state.isFullShow = false;
        };
      } else {
        for (var i=0; i<screens.length; i++) {
          if (screens[i].api.state.isFullShow) {
            screens[i].api.state.isFullShow = false;
          }
        };
      };
      var visible = [Math.floor(marquee.progress), Math.ceil(marquee.progress)];
      // full hide
      if (marquee.animated) return false;
      for (var i=0; i<screens.length; i++) {
        if (i==visible[0] || i==visible[1]) {
          screens[i].api.state.isFullHide = false;
          // screens[i].$block[0].style.display = 'block';
        } else if (!screens[i].api.state.isFullHide) {
          // screens[i].$block[0].style.display = 'none';
          if (!app.device.isMobile) screens[marquee.index].$block.triggerHandler('hide');
          screens[i].$block.triggerHandler('fullHide');
          screens[i].api.state.isFullHide = true;
        }
      }
    };

    // mark nav
    marquee.markNav = function(){
      if (settings.navPrev) settings.navPrev[marquee.progress<=0.5 ? 'addClass' : 'removeClass']('i-disabled');
      if (settings.navNext) settings.navNext[marquee.progress>=screens.length-1.5 ? 'addClass' : 'removeClass']('i-disabled');
    };

    // redraw
    marquee.draw = function(){
      if (marquee.animated) return false;
      if (!effect.move || screens[marquee.index].ratio*marquee.position >= screens[marquee.index].ratio-1) {
        var position = 1-Math.abs(screens[marquee.index].ratio*marquee.position-screens[marquee.index].ratio);
        if (marquee.index>=0) effect.hide(screens[marquee.index].$block, position, marquee.size, screens[marquee.index].ratio);
        if (marquee.index<screens.length-1) effect.show(screens[marquee.index+1].$block, position, marquee.size, screens[marquee.index+1].ratio);
      } else {
        if (marquee.index>=0) effect.move(screens[marquee.index].$block, screens[marquee.index].ratio*marquee.position, marquee.size, screens[marquee.index].ratio);
        if (marquee.index<screens.length-1) effect.show(screens[marquee.index+1].$block, 0, marquee.size, screens[marquee.index+1].ratio);
      }
      // hide invisibles
      marquee.hideInvisibles();
      // mark nav buttons
      marquee.markNav();
    };

    // {fn} on scroll start
    marquee.onScrollStart = function(){
      marquee.scrolling = true;
    };

    // var triggerScrollEvent = function(){
    //  $frame.triggerHandler('scroll', {
    //    index: marquee.index,
    //    position: marquee.position,
    //    progress: marquee.progress,
    //    size: marquee.size,
    //    y: scroll.y
    //  });
    // };

    // {fn} on scroll
    marquee.onScroll = function(){
      index = 0;
      marquee.update();
      // marquee.draw();
      if (app.device.isMobile) marquee.callScreensAPI();
      if (scroll.moved) {
        var position = scroll[settings.vertical ? 'y' : 'x'] - scroll[settings.vertical ? 'pointY' : 'pointX'];
        for (var i=0; i<screens.length; i++) {
          if (position <= -screens[i].offset && position >= -screens[i].offset-screens[i].size) index = i;
        };
        marquee.setLimits(index);
      } else if (scroll.indicators && scroll.indicators[0].moved) {
        for (var i=0; i<screens.length; i++) {
          if (scroll[settings.vertical ? 'y' : 'x']-marquee.size/2 <= -screens[i].offset && scroll[settings.vertical ? 'y' : 'x']+marquee.size/2 >= -screens[i].offset-screens[i].size) index = i;
        };
        marquee.setLimits(index);
      };
      // triggerScrollEvent();
    };

    // interactive
    marquee.grabTimer = false;
    var interactiveStart = function(){
      clearTimeout(marquee.grabTimer);
      if (!marquee.scrolling) {
        $frame.addClass('i-drag');
        marquee.scrolling = true;
      }
    };
    var interactiveEnd = function(){
      if (marquee) clearTimeout(marquee.grabTimer);
      if (marquee && marquee.scrolling) {
        $frame.removeClass('i-drag');
        marquee.scrolling = false;
      }
    };

    // {event} before wheel snap
    scroll.on('beforeWheelSnap', function(){
      index = 0;
      for (var i=0; i<screens.length; i++) {
        if (scroll[settings.vertical ? 'y' : 'x']-marquee.size/2 <= -screens[i].offset && scroll[settings.vertical ? 'y' : 'x']+marquee.size/2 >= -screens[i].offset-screens[i].size) index = i;
      };
      scroll.absStartX = settings.vertical ? 0 : -screens[index].offset;
      scroll.absStartY = -settings.vertical ? -screens[index].offset : 0;
      marquee.setLimits(index);
    });

    // {fn} on scroll end
    marquee.onScrollEnd = function(){
      // marquee.refresh();
      marquee.onScroll();
      app.utils.raf(marquee.refresh);
      // triggerScrollEvent();
    };

    // {fn} refresh
    marquee.refresh = function(){
      marquee.update();
      // marquee.draw();
      marquee.callScreensAPI();
      marquee.setLimits(marquee.index);
    };

    // {fn} resize
    marquee.resize = function(){
      if (!marquee) return false;
      dom.$root.addClass('root_resize');
      resize();
      if (marquee.enabled) screens[marquee.index].$block.triggerHandler('endShow');
      scroll.refresh();
      marquee.refresh();
      marquee.updateState();
      dom.$root.removeClass('root_resize');
    };

    // {fn} enable
    marquee.enable = function(){
      $frame.addClass('marquee_enabled');
      marquee.enabled = true;
      scroll.enable();
      marquee.enableKeyboard();
      $frame.on('dragstart.marquee', function(){
        return false;
      });
    };

    // {fn} disable
    marquee.disable = function(){
      $frame.removeClass('marquee_enabled');
      marquee.enabled = false;
      scroll.disable();
      marquee.disableKeyboard();
      $frame.off('dragstart.marquee');
    };

    // {event} scroll start
    scroll.on('scrollStart', function(){
      if (!marquee) return false;
      marquee.onScrollStart();
    });

    // {event} scroll move
    scroll.on('scroll', function(){
      if (!marquee) return false;
      marquee.onScroll();
      if (scroll.moved) interactiveStart();
    });

    // {event} scroll end
    scroll.on('scrollEnd', function(){
      if (!marquee) return false;
      marquee.onScrollEnd();
      interactiveEnd();
    });

    // {event} grab
    scroll.on('grab', function(){
      if (!marquee) return false;
      // interavtive
      interactiveStart();
      marquee.grabTimer = setTimeout(function(){
        if (scroll) scroll.reset();
        interactiveEnd();
      }, 500);
      // update
      var index = 0,
          position = scroll[settings.vertical ? 'y' : 'x'] - scroll[settings.vertical ? 'pointY' : 'pointX'];
      for (var i=0; i<screens.length; i++) {
        if (position <= -screens[i].offset && position >= -screens[i].offset-screens[i].size) index = i;
      };
      marquee.setLimits(index);
    });

    // {event} scroll end
    scroll.on('animate', function(){
      screens[marquee.index].$block.triggerHandler('leave');
    });

    // {event} window resize
    dom.$window.on('resize', marquee.resize);

    // set limits on first screen
    marquee.setLimits(0);

    // {fn} scroll to
    marquee.scrollTo = function(index, duration){
      duration = duration===undefined ? settings.duration : duration;
      scroll.goToPage(!settings.vertical ? index : 0, settings.vertical ? index : 0, duration, IScroll.utils.ease.cubicOut);
      if (duration==0) marquee.refresh();
    };

    // {fn} prev
    marquee.prev = function(duration){
      if (marquee.scrolling) return false;
      duration = duration===undefined ? settings.duration : duration;
      var remaining = (-scroll.y - screens[marquee.index].offset);
      if (settings.vertical && remaining) {
        scroll.scrollBy(0, Math.min(remaining, marquee.size), duration, IScroll.utils.ease.cubicOut);
      } else if (settings.vertical && scroll.y<=-marquee.size) {
        scroll.scrollBy(0, marquee.size, duration, IScroll.utils.ease.cubicOut);
      } else if (marquee.index>0) {
        scroll.prev(duration, IScroll.utils.ease.cubicOut);
      }
    };

    // {fn} next
    marquee.next = function(duration){
      if (marquee.scrolling) return false;
      duration = duration===undefined ? settings.duration : duration;
      var remaining = (screens[marquee.index].offset + screens[marquee.index].size) - (-scroll.y + marquee.size)
      if (remaining>marquee.size*0.1 && settings.vertical) {
        scroll.scrollBy(0, -Math.min(remaining, marquee.size), duration, IScroll.utils.ease.cubicOut);
      } else if (marquee.index<screens.length-1) {
        scroll.next(duration, IScroll.utils.ease.cubicOut);
      }
    };

    // {fn} get marquee param
    marquee.get = function(parameter){
      return marquee[parameter];
    };

    // {fn} destroy marquee
    marquee.destroy = function(){
      marquee.disable();
      screens[marquee.index].$block.triggerHandler('fullHide');
      $frame.removeData('marquee');
      scroll.destroy();
      $frame = null;
      scroll = null;
      marquee = null;
    };

    // scroll
    if (settings.vertical) {
      var $scroll = $frame.find('.iScrollVerticalScrollbar');
      $scroll.addClass('ui-scroll').prepend('<div class="ui-scroll__bar" />');
      $scroll.find('.iScrollIndicator').addClass('ui-scroll__handle').prepend('<div class="ui-scroll__handle__inner" />');
    };

    // {event} click on prev
    if (settings.navPrev) settings.navPrev.on('click', function(){
      marquee.prev();
    });

    // {event} click on next
    if (settings.navNext) settings.navNext.on('click', function(){
      marquee.next();
    });

    // {event} enable keyboard
    var keyboardEventName = 'keydown.marquee-' + (name ? name : '') + (settings.vertical ? 'v' : 'h');
    marquee.enableKeyboard = function(){
      if (!app.device.support.touch) dom.$document.on(keyboardEventName, function(e){
        if (!$(e.target).is('input,textarea,select')) {
          if (e.which==(settings.vertical ? 38 : 37)) marquee.prev();
          if (e.which==(settings.vertical ? 40 : 39)) marquee.next();
        }
      });
    };

    // {event} disable keyboard
    marquee.disableKeyboard = function(){
      if (!app.device.support.touch) dom.$document.off(keyboardEventName);
    };

    marquee.activate = function(){
      var $screen = screens[marquee.index].$block;
      $frame.triggerHandler('init', { marquee: marquee });
      $screen.triggerHandler('show');
      $screen.triggerHandler('fullShow');
      marquee.updateState();
      if (settings.index) {
        marquee.scrollTo(settings.index=='last' ? screens.length-1 : settings.index, 0);
        scroll._execEvent('scrollEnd');
        settings.index = false;
      }
    };

    // api
    marquee.scroll = scroll;
    marquee.screens = screens;
    $frame.data('marquee', {
      screens: screens,
      scrollTo: marquee.scrollTo,
      get: marquee.get,
      scroll: scroll,
      updateState: marquee.updateState,
      update: marquee.onScroll,
      resize: marquee.resize,
      activate: marquee.activate,
      enable: marquee.enable,
      disable: marquee.disable,
      destroy: marquee.destroy,
      enableKeyboard: marquee.enableKeyboard,
      disableKeyboard: marquee.disableKeyboard
    });

    return marquee;

  };

})(app.dom);


$.fn.mouseScreen = function(){

  if (app.device.isMobile) return this;

  this.each(function(){

    var $screen = $(this),
        $mouse = $screen.find('.mouse'),
        isRemoved = false,
        isAnimated = false;

    var remove = function(){
      if (isRemoved) return false;
      isRemoved = true;
      $mouse.remove();
      $mouse = null;
      $screen = null;
    };

    $screen.one('show', function(){
      if (isAnimated || isRemoved) return false;
      var isAnimated = true;
      TweenMax.to($mouse[0], 0.5, {
        opacity: 0,
        delay: 4,
        ease: Cubic.easeIn,
        onComplete: remove
      });
    });

    $screen.on('fullHide', function(){
      if (isAnimated || isRemoved) return false;
      remove();
    });

  });

}
/* --- Prepare : plugin --- */
$.fn.prepare = function(){

  var $block = this;

  // Backgrounds
  $block.find('.bg').bg();

  // JS Links
  $block.find('.js-link').on('click.js-link', function(){
    if (app.isAnimated) return false;
    var href = $(this).attr('href') || $(this).data('href'),
        currentState = app.router.parse(app.router.get()),
        targetState = app.router.parse(href);
    if (currentState.mode!=targetState.mode || currentState.item!=targetState.item) {
      app.router.forceTo = app.router.parse(href);
      app.router.moveTo(href);
    } else if (app.menu.isOpened) {
      app.menu.close();
    }
    return false;
  });

  // Fast click
    // FastClick.attach($block[0]);

};
$.fn.rotatorScreen = function(){

  var delay = 4000,
      activeClass = 'rotator__item_active';

  this.each(function(){

    var $screen = $(this),
        $rotator = $screen.find('.rotator'),
        $items = $rotator.find('.rotator__item'),
        count = $items.length,
        index = 0,
        played = false,
        interval;

    var activate = function(i){
      $items.eq(index).removeClass(activeClass);
      $items.eq(i).addClass(activeClass);
      index = i;
    };
    activate(0);

    var play = function(){
      if (played) return false;
      played = true;
      clearInterval(interval);
      interval = setInterval(function(){
        activate((index+1>=count) ? 0 : index+1);
      }, delay);
    };

    var pause = function(){
      if (!played) return false;
      played = false;
      clearInterval(interval);
    };

    $screen.on('show fullShow return', play);
    $screen.on('hide fullHide leave', pause);

  });

};
$.fn.screen = function(settings){

  var isWork = !settings.$logo.hasClass('ui-logo');
  settings.index = settings.index || 0;

  // each screens
  this.each(function(index){

    // vars
    var $screen = $(this),
        logoTheme = ($screen.data('logo-theme') || $screen.data('ui-theme')) || 'normal',
        menuTheme = ($screen.data('menu-theme') || $screen.data('ui-theme')) || 'normal',
        phoneLogoTheme = ($screen.data('phone-logo-theme') || $screen.data('phone-ui-theme')) || logoTheme,
        phoneMenuTheme = ($screen.data('phone-menu-theme') || $screen.data('phone-ui-theme')) || menuTheme;

    var $frame = $screen.find('.screen__frame').wrapInner('<div class="screen__frame__inner-wrap"><div class="screen__frame__inner" />'),
        $phonePicture = $screen.find('.screen__phone-picture').prependTo($frame).wrap('<div class="screen__phone-picture-wrap" />');

    // {event} on show end of  screen
    $screen.on('show return beforeShow', function(e){
      if (isWork && app.device.isWorkPanelVisible) {
        settings.$logo.toggleClass(
          'work__logo_light',
          app.device.isPhone ? phoneLogoTheme == 'light' : logoTheme=='light'
        );
        settings.$logo.toggleClass(
          'work__logo_secondary',
          app.device.isPhone ? phoneLogoTheme == 'secondary' : logoTheme=='secondary'
        );
      } else {
        app.dom.ui.$logo.toggleClass(
          'ui-logo_light',
          (app.device.isPhone || !app.device.isWorkPanelVisible) ? phoneLogoTheme == 'light' : logoTheme=='light'
        );
      };
      app.dom.ui.$menu.toggleClass(
        'ui-menu_light',
        app.device.isPhone ? phoneMenuTheme == 'light' : menuTheme=='light'
      );
    });

    if (settings.index!==index) $screen.addClass('screen_inactive');

    var $next = $screen.next('.screen'),
        $afterNext = $next.next('.screen'),
        $prev = $screen.prev('.screen'),
        $links = $screen.find('.js-link');
    $screen.one('fullShow', function(){
      $screen.add($next).add($afterNext).add($prev).removeClass('screen_inactive').loadBG();
      $next = null;
      $prev = null;
    });

    $screen.one('fullShow', function(){
      $links.each(function(){
        var state = app.router.parse( $(this).attr('href') );
        if (state.mode=='work') app.works.preload( state.item );
        state = null;
      });
      $links = null;
    });

    // {fn} check visibibily
    // var isVisible = function(){
    //  return $work.data('work') && $work.data('work').state.active;
    // }

    // {event} on show screen
    // $screen.on('show', function(){
    //  if (!isVisible()) return;
    //  if ($work.data('work') && $work.data('work').setScrollColor) $work.data('work').setScrollColor($screen.data('color'));
    //  site.ui.fill('nav', $screen.data('color'));
    // });

    // {event} on show start of  screen
    // $screen.on('startShow', function(){
    //  if (!isVisible()) return;
    //  site.ui.fill('like', $screen.data('color'));
    //  site.ui.fill('lang', $screen.data('color'));
    //  site.ui.fill('works', $screen.data('color'));
    //  $work.data('color', $screen.data('color'));
    // });

    // mode classes
    $screen.find('.screen__content').addClass('screen__content_in-' + settings.mode)
        .find('.screen__content__data').addClass('screen__content__data_in-' + settings.mode);
    $screen.find('.screen__title').addClass('screen__title_in-' + settings.mode)
      .toggleClass('screen__title_titled', $frame.hasClass('screen__frame_titled'))
      .toggleClass('screen__title_titled_with-phone-picture', !!$phonePicture.length);
    $frame.find('.screen__frame__inner').addClass('screen__frame__inner_in-' + settings.mode)
      .toggleClass('screen__frame__inner_titled', $frame.hasClass('screen__frame_titled'))
      .toggleClass('screen__frame__inner_titled_beta', $frame.hasClass('screen__frame_titled_beta'))
      .toggleClass('screen__frame__inner_titled_massive', $frame.hasClass('screen__frame_titled_massive'))
      .toggleClass('screen__frame__inner_phone-bottom', $frame.hasClass('screen__frame_phone-bottom'))
      .toggleClass('screen__frame__inner_with-phone-picture', !!$phonePicture.length);

  });

  return this;

};
(function(utils, dom, works){


  $.fn.workCover = function($work, workName){

    this.find('.screen__frame__inner').addClass('work__cover__inner');

    var videoURL = 'http://chulakov-fantasy.s3.amazonaws.com/cases/#name#.mp4';
    var videoURL2 = 'http://fantasy.co/data/#name#.mp4';

    this.each(function(){

      if (!app.works.items[workName].video) return false;

      var $cover = $(this),
          src = (app.works.items[workName].videoAlternate ? videoURL2 : videoURL).replace('#name#', workName);

      // if (app.device.isIOS) {
      //  $('<a class="work__cover__play" />').attr('href', src).appendTo($cover);
      //  return false;
      // };

      var $play = $('<i class="work__cover__play" />').appendTo($cover),
          $videoWrap = $('<div class="work__cover__video" />').appendTo($cover),
          $video = $([]);

      var video = {
        timer: null,
        loaded: false,
        visible: false,
        playing: false,
        toggle: function(){
          if (video.visible && video.playing) {
            video.pause();
          } else if (video.visible && !video.playing) {
            video.play();
          } else if (!video.visible) {
            video.show();
          }
        },
        play: function(){
          if (!video.loaded) video.load();
          video.playing = true;
          $video[0].play();
          $play.addClass('work__cover__play_pause');
        },
        pause: function(){
          video.playing = false;
          $video[0].pause();
          $play.removeClass('work__cover__play_pause');
        },
        show: function(){
          if (video.visible) return false;
          video.visible = true;
          $videoWrap.addClass('work__cover__video_visible');
          video.play();
          app.dom.$root.addClass('root_work_video root_work_video_force');
          app.utils.delayRender(function(){
            app.dom.$root.removeClass('root_work_video_force');
            $videoWrap.addClass('work__cover__video_visible_animated');
            ui.hide();
          });
          app.utils.delayDuration(function(){
            app.dom.$root.on('mousemove.work-cover', function(){
              ui.show();
              ui.waitToHide();
            });
            $play.add($video).on('click.work-cover', function(){
              ui.show();
              ui.waitToHide();
            });
          });
        },
        hide: function(){
          if (!video.visible) return false;
          video.visible = false;
          video.pause();
          $play.removeClass('work__cover__play_pause');
          $videoWrap.removeClass('work__cover__video_visible_animated');
          app.dom.$root.addClass('root_work_video_force').removeClass('root_work_video');
          app.utils.delayRender(function(){
            app.dom.$root.removeClass('root_work_video_force');
          });
          app.utils.delayDuration(function(){
            $videoWrap.removeClass('work__cover__video_visible');
          });
          app.dom.$root.off('mousemove.work-cover');
          $play.add($video).off('click.work-cover');
        },
        load: function(){
          clearTimeout(video.timer);
          if (video.loaded) return false;
          video.loaded = true;
          if (!$video.length) {
            $video = $('<video class="work__cover__video__player" preload="none" />').appendTo($videoWrap).on('click', video.toggle);
          }
          $video[0].src = src;
          if (!app.device.isMobile) $video[0].load();
        },
        unload: function(){
          clearTimeout(video.timer);
          if (!video.loaded) return false;
          video.loaded = false;
          if (!app.device.isMobile) {
            $video[0].src = '';
            if ($video[0].currentTime) $video[0].currentTime = 0;
            $video[0].load();
          }
        }
      };

      $video.on('ended', video.pause);

      var ui = {
        timer: null,
        visible: true,
        show: function(){
          if (ui.visible) return false;
          ui.visible = true;
          clearTimeout(ui.timer);
          app.dom.$root.removeClass('root_work_no-ui');
        },
        hide: function(){
          if (!ui.visible) return false;
          ui.visible = false;
          clearTimeout(ui.timer);
          app.dom.$root.addClass('root_work_no-ui');
        },
        waitToHide: function(){
          clearTimeout(ui.timer);
          ui.timer = setTimeout(ui.hide, 1500);
        }
      };

      $work.on('close', function(){
        clearTimeout(ui.timer);
        ui.show();
        video.hide();
        video.unload();
      });

      $cover.on('fullShow', function(){
        video.timer = setTimeout(video.load, 1000);
      });

      $cover.on('fullHide', function(){
        clearTimeout(ui.timer);
        clearTimeout(video.timer);
        ui.show();
        video.hide();
        video.unload();
      });

      $work.find('.work__case__marquee').on('scroll', function(e, data){
        if (video.visible && data.progress!=0) {
          ui.show();
        } else if (video.visible && data.progress==0) {
          ui.waitToHide();
        }
      });

      $play.on('click', video.toggle);

    });

  };

})(app.utils, app.dom, app.works);
(function(device, dom, sizes){

  /* --- Mobile --- */
  device.support = Modernizr;

  /* --- Mobile --- */
  device.isMobile = device.support.touch;
  dom.$html.addClass(device.isMobile ? 'd-mobile' : 'd-no-mobile');

  /* --- Check --- */
  device.check = function(){
    device.isTablet = (sizes.width<1024);
    device.isPhone = (sizes.width<768);
    device.isWorkPanelVisible = (sizes.width>887);
    dom.$html.addClass(device.isPhone ? 'd-phone' : 'd-no-phone');
    dom.$html.removeClass(device.isPhone ? 'd-no-phone' : 'd-phone');
    return device.isPhone;
  };
  app.dom.$window.on('resize.check', device.check);

  /* --- Retina --- */
  device.isRetina = (window.devicePixelRatio && window.devicePixelRatio>1);

  /* --- iOS --- */
  if (navigator.userAgent.match(/iPad/i)) {
    dom.$html.addClass('d-ipad');
    device.isIPad = true;
  };
  if (navigator.userAgent.match(/(iPhone|iPod touch)/i)) {
    dom.$html.addClass('d-iphone');
    device.isIPhone = true;
  };
  if (navigator.userAgent.match(/(iPad|iPhone|iPod touch)/i)) {
    dom.$html.addClass('d-ios');
    device.isIOS = true;
  };
  if (navigator.userAgent.match(/.*CPU.*OS 7_\d/i)) {
    dom.$html.addClass('d-ios7');
    device.isIOS7 = true;
  };

  /* --- iPad (for fix wrong window height) --- */
  if (dom.$html.hasClass('d-ipad d-ios7')) {
    dom.$window.on('resize orientationchange focusout', function(){
      window.scrollTo(0,0);
    });
  };

})(app.device, app.dom, app.sizes);
(function(loader){
  // history
  loader.history = [];
  // {fn} load resources
  loader.resources = function(resources, complete, callback){
    // check callbacks
    complete = complete || $.noop;
    callback = callback || $.noop;
    // unchached resources
    var unchached = [];
    for (var i=0; i<resources.length; i++) {
      if (loader.history.indexOf(resources[i])<0) unchached.push(resources[i]);
    };
    // if resources is empty
    if (!unchached.length) return complete();
    // load
    Modernizr.load({
      load: unchached,
      callback: function(url){
        loader.history.push(url);
        callback();
      },
      complete: complete
    });
  };
  // {fn} load images
  loader.images = function($block, complete, callback){
    var loaded = 0;
    // check callbacks
    complete = complete || $.noop;
    callback = callback || $.noop;
    // init plugin
    $block.imagesLoaded().always(complete).progress(function(instance, i){
      loaded++;
      console.log(i.img.src)
      callback(loaded, instance.images.length)
    });
  }
  // {fn} load data
  loader.data = function(url, complete, data){
    return $.ajax({
      url: url,
      method: 'post',
      success: complete,
      data: data || {}
    });
  };
})(app.loader);
(function(menu, dom, utils, pages, works){

  menu.isOpened = false;
  dom.$root.addClass('root_menu_closed');

  var $overlay = $('<i class="menu__overlay" />').insertBefore(dom.ui.$menu);

  // show timeline
  // var showTimeline = new TimelineLite({
  //   paused: true,
  //   onComplete: function(){
  //     menu.isFreeze = false;
  //   }
  // });
  // showTimeline
  //   .fromTo(app.dom.$menu[0], 0.33333, { x: '0%', opacity: 1, display: 'none' }, { x: '-100%', opacity: 1, display: 'block', ease: Cubic.easeOut }, 0)
  //   .fromTo($overlay[0], app.config.duration/1000, { opacity: 0, display: 'none' }, { opacity: 0.8, display: 'block', ease: Cubic.easeOut }, 0);

  // // show timeline
  // var hideTimeline = new TimelineLite({
  //   paused: true,
  //   onComplete: function(){
  //     menu.isFreeze = false;
  //     if (pages.name && !works.name) pages.activate(pages.name);
  //   }
  // });

  // hideTimeline
  //   .fromTo(app.dom.$menu[0], 0.2, { opacity: 1, display: 'block' }, { opacity: 0, ease: Cubic.easeOut, display:'none' }, 0)
  //   .to($overlay[0], 0.2, { opacity: 0, display:'none', ease: Cubic.easeOut }, 0);

  menu.open = function(){
    if (menu.isFreeze || menu.isOpened) return false;
    menu.isFreeze = true;
    menu.isOpened = true;
    if (pages.name && !works.name) pages.deactivate(pages.name);
    // showTimeline.restart();
    dom.$root.addClass('root_menu_opened').removeClass('root_menu_closed');
    // app.marquee.disable();
  };

  menu.close = function(force){
    if (menu.isFreeze || !menu.isOpened) return false;
    menu.isOpened = false;
    if (force) {
      app.dom.$menu.add($overlay).css('display', 'none');
      // if (pages.name && !works.name) pages.activate(pages.name);
    } else {
      menu.isFreeze = true;
      hideTimeline.restart();
    }
    dom.$root.removeClass('root_menu_opened').addClass('root_menu_closed');
    // app.marquee.enable();
  };

  menu.toggle = function(){
    menu.isOpened ? menu.close() : menu.open();
  };

  dom.ui.$menu.on('click', menu.toggle);

  $overlay.on('click', function(){
    menu.close();
  });

})(app.menu, app.dom, app.utils, app.pages, app.works);
(function(works, dom, utils, loader, pages, router, menu){

  var $pages = dom.$root.find('.pages');

  pages.open = function(name, screenName, callback, toWork){
    if (works.name) {
      menu.close();
      works.close();
    };
    // names
    if (pages.name==name || app.isAnimated) return false;
    var prevName = pages.name;
    app.utils.beforeAnimation();
    pages.name = name;
    // vars
    var page = pages.items[name];
    router.set(name=='home' ? '' : name, page.title);
    var templateName = (page.hasPhoneTemplate && app.device.isPhone) ? 'page-' + name + '-phone-template' : 'page-' + name + '-template',
        html = document.getElementById(templateName).innerHTML;
    if (app.device.isMobile) html = html.replace(/<video([ a-zA-Z0-9\-\_\.\:\/\"\=]*)><\/video>/g, '');
    page.$block = $(html);
    pages.show(name, prevName, screenName, callback, toWork);
    templateName = null;
    html = null;
  };

  pages.show = function(name, prevName, screenName, callback, toWork){
    var page = pages.items[name];
    dom.$root.addClass('root_page_' + name);
    // render page
    var $screens = page.$block.find('.screen'),
        screenNameIndex = screenName ? $screens.index($screens.filter('[data-name="'+screenName+'"]')) : 0;
    $screens.screen({
      'mode': 'page',
      '$logo': dom.ui.$logo,
      'index': screenNameIndex
    }).first().loadBG();
    page.$block.appendTo($pages).show().prepare();
    // page plugin
    if (page.plugins) page.plugins.forEach(function(pluginName){
      page.$block[pluginName](page);
    });
    // marquee
    utils.delayRender(function(){
      page.marquee = page.$block.marquee({
        index: screenNameIndex
      });
    });
    // {fn} activate page
    var activate = function(){
      if (!prevName) page.$block.addClass('page_active_force');
      page.$block.addClass('page_active page_opening');
      if (!!prevName) pages.close(prevName);
      var $overlay = $('<div class="page__overlay" />').insertBefore(page.$block);
      if (menu.isOpened) menu.close(true);
      page.marquee.screens[page.marquee.index].$block.triggerHandler('beforeShow');
      TweenMax.to(page.$block[0], app.config.moveTime/1000, {
        opacity: 1,
        ease: Cubic.easeOut,
        onComplete: function(){
          $overlay.remove();
          if (page.$block) page.$block.removeClass('page_opening');
          if (page.marquee) page.marquee.activate();
          app.utils.afterAnimation();
        }
      });
      if (callback) callback();
      $screens = null;
    };
    // page state
    if (works.name) {
      // menu.close();
      works.close();
      utils.delayDuration(activate);
    // } else if (menu.isOpened) {
      // menu.close();
      // utils.delayRender(activate);
    } else {
      utils.delayRender(activate);
    }
  };

  pages.activate = function(name){
    var page = pages.items[name];
    router.set(name=='home' ? '' : name, page.title);
    page.marquee.updateState();
    page.marquee.screens[page.marquee.index].$block.triggerHandler('return');
  };

  pages.deactivate = function(name){
    var page = pages.items[name];
    if (!page.marquee.enabled) return false;
    page.marquee.disable();
    page.marquee.screens[page.marquee.index].$block.triggerHandler('leave');
  };

  pages.close = function(name, force){
    dom.$root.removeClass('root_page_' + name);
    var page = pages.items[name];
    page.$block.triggerHandler('close');
    page.marquee.screens[page.marquee.index].$block.triggerHandler('fullHide');
    page.marquee.disable();
    page.$block.remove();
    var remove = function(){
      page.marquee.destroy();
      page.$block.remove();
      page.$block = null;
    };
    if (force) {
      remove();
    } else {
      utils.delayDuration(remove);
    }
  };

})(app.works, app.dom, app.utils, app.loader, app.pages, app.router, app.menu);


(function(sizes){
  // {fn} update sizes
  var update = function(){
    sizes.width = app.dom.$window.width();
    sizes.height = parseInt(window.innerHeight,10);
  };
  // {event} window resize
  app.dom.$window.on('resize.app', update);
  // init
  update();
  app.device.check();
})(app.sizes);
(function(utils, config){

  utils.delayRender = function(callback){
    return setTimeout(callback, config.renderDelay);
  };

  utils.delayDuration = function(callback){
    return setTimeout(callback, config.duration);
  };

  utils.delayMove = function(callback){
    return setTimeout(callback, config.moveTime);
  };

  utils.delayFaster = function(callback){
    return setTimeout(callback, config.faster);
  };

  utils.raf = function(callback){
    var func = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame;
    if (func) {
      return func(callback);
    } else {
      return window.setTimeout(callback, 1000 / 60);
    }
  };

  utils.caf = function(frame){
    var func = window.cancelAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.mozCancelRequestAnimationFrame ||
      window.oCancelRequestAnimationFrame ||
      window.msCancelRequestAnimationFrame ||
      clearTimeout;
    func(frame);
    frame = null;
  }

  utils.beforeAnimation = function(){
    app.isAnimated = true;
  };

  utils.afterAnimation = function(){
    app.isAnimated = false;
    app.router.check();
  };

  // utils.prepareTemplate = function(string){
  //  console.time('tmp')
  //  return string.replace(/\<img ([a-zA-Z0-9\/\"\'\=\-\.\:_ ]{1,})(bg__image)/g, '<i $1$2');
  //  console.timeEnd('tmp')
  // }

})(app.utils, app.config);
(function(works, dom, utils, loader, pages){

  var $works = dom.$root.find('.works'),
      $back = dom.$root.find('.works__back'),
      $overlay = dom.$root.find('.works__overlay');

  works.open = function(name, theme, toPrev){
    if (!works.items[name] || works.items[name].disabled || works.name==name || app.isAnimated) return false;
    var prevName = !toPrev ? (works.name || false) : false,
        $prevWork = prevName ? works.$work : false;
    works.name = name;
    app.utils.beforeAnimation();
    // disable page
    pages.deactivate(pages.name);
    // vars
    var settings = works.items[name];
        // loaded = { resources:false, html:false, images:false };
    // url
    app.router.set('work/'+name, settings.title, prevName || toPrev);
    // load css
    // loader.resources(settings.css, function(){
    //  loaded.resources = true;
    //  if (loaded.resources && loaded.html && loaded.images) works.show(name, prevName, $prevWork, theme);
    // });
    // load html
    // loader.data('/works/build.php', function(html){
    works.$work = $(document.getElementById('work-' + name + '-template').innerHTML);
    //  loaded.html = true;
    // works.$work = $(html);
    loader.images(works.$work, function(){
      // loaded.images = true;
      works.show(name, prevName, $prevWork, theme, toPrev);
    });
    // }, { name: name });
  };

  works.show = function(name, prevName, $prevWork, theme, toPrev){
    // check work is still active
    if (works.name!=name) return false;
    // render work
    if (toPrev) {
      works.$work.addClass('work_active');
      app.utils.afterAnimation();
    } else if (prevName) {
      works.$work.addClass('work_next');
      setTimeout(function(){
        $prevWork.remove();
        $prevWork = null;
      }, app.config.moveTime)
    } else {
      $overlay.addClass('works__overlay_show');
      $back.addClass('works__back_show');
    }
    var $logo =  works.$work.find('.work__logo_primary');
    if (theme) $logo.addClass('work__logo_' + theme);
    works.$work.find('.screen').screen({
      'mode': 'work',
      '$logo': $logo
    }).first().loadBG();
    works.$work.appendTo($works).show().prepare();
    works.$work.find('.work__cover').workCover(works.$work, name);
    // plugins
    var work = works.items[name];
    if (work.plugins) work.plugins.forEach(function(pluginName){
      works.$work[pluginName]();
    });
    // next
    if (works.items[name].next || (works.items[name].prev && works.items[name].isNext)) {
      var next = function(){
        if (nextTriggered || works.isChanging || app.isAnimated) return false;
        nextTriggered = true;
        works.isChanging = true;
        var marquee = works.marquee;
        clearTimeout(delay);
        works.items[works.items[name].next].isNext = true;
        var theme = works.items[works.items[name].next]['next-theme'];
        if (marquee) marquee.disable();
        works.$prev = works.$work;
        works.$prev.addClass('work_prev');
        $footer.addClass('work__next_active').off('click');
        app.dom.ui.$menu.toggleClass('ui-menu_' + theme);
        marquee.screens.forEach(function(screen, i){
          if (i<marquee.screens.length-1) {
            screen.$block.remove();
          } else {
            screen.$block.css('top', screen.offset);
          }
        });
        app.utils.delayDuration(function(){
          if (marquee) marquee.destroy();
          marquee = null;
          works.open(works.items[name].next, theme);
          works.isChanging = false;
        });
      };
      var prev = function(){
        if (prevTriggered || works.isChanging || app.isAnimated) return false;
        prevTriggered = true;
        works.isChanging = true;
        if (works.marquee) {
          works.marquee.screens.forEach(function(screen, i){
            if (i>0) screen.$block.remove();
          });
          works.marquee.destroy();
          works.marquee = null;
        }
        works.$prev = works.$work;
        works.open(works.items[name].prev, 'normal', function(){
          works.$prev.addClass('work_hide-next')
          TweenMax.fromTo(works.$prev[0], app.config.duration/1000, {
            y: 0
          }, {
            y: app.sizes.height,
            ease: Cubic.easeIn,
            onComplete: function(){
              works.isChanging = false;
              works.$prev.remove();
              works.$prev = null;
              works.isChanging = false;
            }
          });
        });
      };
      works.marquee = works.$work.find('.marquee').marquee({
        index: toPrev ? 'last' : 0,
        prev: works.items[name].prev && works.items[name].isNext ? prev : false,
        next: works.items[name].next ? function(){
          clearTimeout(delay);
          footerVisible ? next() : showFooter();
        } : false
      });
      if (toPrev) toPrev();
      var $getInTouch = works.marquee.screens[works.marquee.screens.length-1].$block,
          $footer = $getInTouch.find('.work__next'),
          nextTriggered = false,
          prevTriggered = false,
          footerVisible = false,
          delay;
      var showFooter = function(){
        footerVisible = true;
        clearTimeout(delay);
        $footer.addClass('work__next_show');
      };
      $footer.on('click', next);
      $getInTouch.on('fullShow', function(){
        delay = setTimeout(showFooter, app.config.moveTime);
      });
      if (app.device.isMobile) {
        works.marquee.scroll.on('scrollReset', function(){
          showFooter();
          if (app.isAnimated || nextTriggered || prevTriggered) return false;
          if (works.items[name].next && -works.marquee.scroll.y - 20 > works.marquee.scroll.scrollerHeight-works.marquee.scroll.wrapperHeight) {
            next();
          } else if (works.items[name].prev && works.items[name].isNext && works.marquee.scroll.y > 20) {
            prev();
          }
        });
      }
    } else {
      works.marquee = works.$work.find('.marquee').marquee();
    }
    var onComplete = function(){
      dom.$root.addClass('root_work_opened');
      works.$work.removeClass('work_opening');
      works.$work.addClass('work_active');
      app.utils.afterAnimation();
    };
    works.marquee.activate();
    if (!toPrev) {
      works.$work.addClass('work_active work_opening');
      if (!prevName) {
        $back.addClass('works__back_active');
        $overlay.addClass('works__overlay_active');
        dom.$root.addClass('root_work');
        TweenMax.fromTo(works.$work[0], app.config.moveTime/1000, {
          x: app.sizes.width - (app.device.isWorkPanelVisible ? $back.width() : 0)
        }, {
          x: 0,
          ease: Expo.easeInOut,
          onComplete: onComplete
        });
      } else {
        TweenMax.fromTo(works.$work[0], app.config.duration/1000, {
          opacity: 0
        }, {
          opacity: 1,
          onComplete: function(){
            onComplete();
            if (works.$prev) {
              works.$prev.remove();
              works.$prev = null;
            }
          }
        });
      }
    };
  };

  works.close = function(){
    if (!works.name || !works.$work || app.isAnimated) return false;
    works.name = false;
    app.utils.beforeAnimation();
    works.$work.triggerHandler('close');
    dom.$root.removeClass('root_work_opened');
    app.dom.$root.removeClass('root_works-back-hover').addClass('root_work_close');
    $back.removeClass('works__back_active');
    $overlay.removeClass('works__overlay_active');
    works.$work.removeClass('work_active');
    if (works.marquee) works.marquee.disable();
    utils.delayRender(function(){
      dom.$root.removeClass('root_work');
    });
    TweenMax.fromTo(works.$work[0], 0.8, {
      x: 0
    }, {
      x: app.sizes.width - (app.device.isWorkPanelVisible ? $back.width() : 0),
      ease: Expo.easeInOut,
      onComplete: function(){
        pages.activate(pages.name);
        if (works.marquee) works.marquee.destroy();
        works.marquee = null;
        dom.$root.removeClass('root_work_close');
        $overlay.removeClass('works__overlay_show');
        $back.removeClass('works__back_show');
        works.$work.remove();
        works.$work = null;
        app.utils.afterAnimation();
      }
    });
    for (name in works.items) {
      works.items[name].isNext = false;
    };
  };

  works.preload = function(name){
    if (works.items[name].preload) {
      works.items[name].preload.forEach(function(url){
        var image = new Image();
        image.src = url.replace('~', '/works/'+name+'/images/');
      });
    }
  };

  $overlay.add($back).on('click', function(){
    app.router.moveTo({ mode:'pages', item:app.pages.name }, true);
  });

  $back.hover(function(){
    if (works.name) app.dom.$root.addClass('root_works-back-hover');
  }, function(){
    app.dom.$root.removeClass('root_works-back-hover');
  })

})(app.works, app.dom, app.utils, app.loader, app.pages);


$.fn.healthcareCase = function(){

  this.find('.healthcare__details__list').each(function(){

    var $list = $(this).wrap('<div class="healthcare__details__slider" />'),
        $slider = $list.parent(),
        inited = false;

    var sly = new Sly($slider[0], {
      itemNav: 'basic',
      horizontal: true,
      // easing: 'easeOutExpo',
      smart: true,
      mouseDragging: false,
      touchDragging: true,
      releaseSwing: true,
      scrollBy: 0,
      speed: 600,
      elasticBounds: true
    });

    var check = function(){
      if (app.device.isPhone && !inited) {
        inited = true;
        sly.init();
      } else if (app.device.isPhone && inited) {
        sly.reload();
      } else {
        inited = false;
        sly.destroy();
        $list.removeAttr('style');
      }
    };
    check();

    $slider.closest('.screen').on('show', check);

    app.dom.$window.on('resize.healthcare', check);

  });

};

