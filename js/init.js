---

---

(function ($) {
  $.getUrlParam = function (name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURI(r[2]); return null;
  }
})(jQuery);

(function($){
  $(function(){
    //define functions
    function ShowBottom(speed) {
      $('.page-content').each(function() {
        if ($(this).height() > $(window).height()) {
          $(this).next().show(speed);
        } else {
          $(this).next().hide(speed);
        }
      });
    }

    $('.button-collapse').sideNav();
    $('.carousel').carousel();
    $('.avcard').hover(
      function() {
        btn = $(this).find(".avcard-goto");
        btn.addClass("pulse")
      }, function() {
        btn = $(this).find(".avcard-goto");
        btn.removeClass("pulse")
      });
    ShowBottom();



    //events
    $('.av-panel').each(function() {
      $av_cnt = $(this).find(".avcard").length;
      if ($av_cnt > {{ site.limits.av.single_tag_max }}) {
        ;
      }
    });
    $(window).resize(function() {
      ShowBottom('medium');
    });

        // if there exists a platform link, show it.
    var platformParam = $.getUrlParam("platform");
    if (platformParam != null ) {
      var plat_btn = $('.dropdown-button[platform="' + platformParam + '"]');
      plat_btn.dropdown('open');
    }
  }); // end of document ready  
})(jQuery); // end of jQuery name space