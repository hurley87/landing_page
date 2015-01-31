require.config({
    paths: {
        'jQuery': 'vendor/jquery-1.11.2.min',
        'underscore': 'vendor/underscore',
        'slidr': 'vendor/slidr'
    },
    shim: {
        'jQuery': {
            exports: '$'
        },
        'underscore': {
            exports: '_'
        }
    }
});


require(['jQuery'], function ($) {
   $(document).ready(function(){
    $('.nav-menu, .js-menu').on('click touchstart',function (e) {
      $('.js-menu').toggleClass('is-visible');
      e.preventDefault();
      
    });
    
  });
});

require(['slidr'], function (slidr) {
    slidr.create('slidr-div', {
            direction: 'vertical',
            overflow: true,
            pause: false,
            timing: { 'cube': '1.5s ease-in' },
            touch: true,
            transition: 'cube',
            controls: 'none'
        }).add('h', ['one', 'two', 'three', 'four', 'one'])
          .auto(10000);
});

require(['hello'], function() {
  
});



