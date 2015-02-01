require.config({
    paths: {
        'jQuery': 'vendor/jquery-1.11.2.min',
        'underscore': 'vendor/underscore',
        'slidr': 'vendor/slidr',
        'scrollto': 'vendor/scrollto.min'
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
    $('.nav-menu, .js-menu').on('click',function (e) {
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
            timing: { 'linear': '1.5s ease-in' },
            touch: true,
            transition: 'linear',
            controls: 'none'
        }).add('h', ['one', 'two', 'three', 'four', 'one'])
          .auto(5000);
});




