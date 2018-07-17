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
      $('.dropdown-button').dropdown('close');
    });
    $('.sidenav-close').click(function() {
      $('.button-collapse').sideNav('hide');
    });

    // if there exists a platform link, show it.

    function ToggleShadow(ctl) {
      if (ctl.hasClass("shadow")) {
        var sw_color = ctl.attr("shadow-color");
        sw_color = sw_color.replace('rgb', 'rgba');
        if (ctl.hasClass("shadow-on")) {
          ctl.removeClass("shadow-on");
          ctl.addClass("shadow-off");
          var shadow_str = "0px 16px 24px 2px " + sw_color.replace(')', ', 0.14)') + ", 0px 6px 30px 5px " + sw_color.replace(')', ', 0.12)') + ", 0px 8px 10px -5px " + sw_color.replace(')', ', 0.13)');
          ctl.css("box-shadow", shadow_str);
          setTimeout(function() {ToggleShadow(ctl);}, 1000);
        } else if (ctl.hasClass("shadow-off")) {
          ctl.removeClass("shadow-off");
          ctl.addClass("shadow-on");
          var shadow_str = "0px 2px 2px 0px " + sw_color.replace(')', ', 0.14)') + ", 0px 1px 5px 0px " + sw_color.replace(')', ', 0.12)') + ", 0px 3px 1px -2px " + sw_color.replace(')', ', 0.13)');
          ctl.css("box-shadow", shadow_str);
          setTimeout(function() {ToggleShadow(ctl);}, 1000);
        }
      } else {
        ctl.css("box-shadow", "");
        ctl.removeClass("shadow-on");
        ctl.removeClass("shadow-off");
      }
    };

    function RemoveShadow(ctl) {
      if (ctl.hasClass("shadow")) {
        ctl.removeClass("shadow");
        ToggleShadow(ctl);
      }
    }

    var platformParam = $.getUrlParam("platform");
    if (platformParam != null ) {
      var plat_btn = $('.dropdown-button[platform="' + platformParam + '"]');
      setTimeout(function () {
        plat_btn.dropdown('open');
        var bg_color = plat_btn.css('background-color');
        var data_act_str = plat_btn.attr('data-activates');
        var data_act_ctl = $('#' + data_act_str);
        data_act_ctl.attr("shadow-color", bg_color);
        data_act_ctl.addClass("shadow");
        data_act_ctl.addClass("shadow-on");
        ToggleShadow(data_act_ctl);
        data_act_ctl.mousemove(function() {RemoveShadow(data_act_ctl);});
      }, 800);
    }
  }); // end of document ready  
})(jQuery); // end of jQuery name space