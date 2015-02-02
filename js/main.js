require.config({
    paths: {
        'jQuery': 'lib/jquery-1.11.2.min',
        'underscore': 'lib/underscore',
        'slidr': 'lib/slidr',
        'scrollto': 'lib/scrollto.min',
        'modal': 'lib/modal'
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
            e.preventDefault();
            $('.js-menu').toggleClass('is-visible');
        });
    });
    require(['scrollto'], function (scrollTo) {
        require(['jQuery'], function ($) {
            $('.scroll-link').click(function(){
                $('.js-menu').toggleClass('is-visible');
                $.scrollTo( $(this).attr("href"), {
                    duration: 1000          
                });
                return false;
            });
        });
    });
    require(['modal']);
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








