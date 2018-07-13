---
layout: failure
type: under_const
---
<div class="divider"></div>
<div style="margin-top:40px; margin-bottom:40px;">
  <h3 class="center grey-text">抱歉啦</h3>
  <h4 class="center grey-text">这里还未完成哦</h4>
</div>
<div class="divider"></div>
<div style="margin-top:20px; margin-bottom:60px;">
  <h5 class="center grey-text">可以看看别的内容哦</h5>
  <div class="center-align">
    <a class=" pink-text text-lighten-3" href="/">
      {%- assign lr = site.lres.res_home_title -%}
      {%- assign lr = lr | where:"lid", site.lang_id | default: lr | first -%}
      {{- lr.res -}}
    <div class="btn-floating pink lighten-3"><i class="material-icons">arrow_forward</i></div></a>
  </div>
</div>