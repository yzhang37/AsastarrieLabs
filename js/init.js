---

---
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
  }); // end of document ready  
})(jQuery); // end of jQuery name space