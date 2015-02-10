require.config({
    paths: {
        'jQuery': 'lib/jquery-1.11.2.min',
        'underscore': 'lib/underscore',
        'slidr': 'lib/slidr',
        'scrollto': 'lib/scrollto.min',
        'modal': 'lib/modal',
        'parallax': 'lib/parallax',
        'slick': 'lib/slick'
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
            $('.captain').find('.fa-times').on('click', function() {
              $(this).parent().parent().hide();
              $('.navigation').animate({'top': 0});
              $('.carosel').animate({'top': '53px'});
              $('#logo').animate({'padding-top':'150px !important'});
            });
        });
    });
    require(['modal'], function() {
        
    });
    // require(['nslider'], function() {
        
    // });
    require(['parallax'], function (){
        parallaxInit();
    });
});

// require(['slidr'], function (slidr) {
//     slidr.create('slidr-div', {
//         direction: 'vertical',
//         overflow: true,
//         pause: false,
//         timing: { 'linear': '1.5s ease-in' },
//         touch: true,
//         transition: 'linear',
//         controls: 'none'
//     }).add('h', ['one', 'two', 'three', 'four', 'one'])
//       .auto(5000);
//     slidr.create('slidr-div2', {
//         direction: 'vertical',
//         overflow: true,
//         pause: false,
//         timing: { 'cube': '1.5s ease-in' },
//         touch: true,
//         transition: 'cube',
//         controls: 'none'
//     }).add('h', ['one', 'two', 'three', 'four', 'one'])
//       .auto(5000);  
// });








