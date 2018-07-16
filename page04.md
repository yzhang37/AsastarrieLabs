---
layout: page
permalink: /about/
lid: en-US
lname: About
unfinished: true
---
{%- assign str="red lighten-3" -%}

{%- assign array_class = str | split: ' ' -%}
{%- for array_class_ele in array_class -%}
  {%- assign num = array_class_ele | split: '-' | last | size -%}
  {%- if num == 1 -%}
    {%- assign array_class_ele_new = array_class_ele | prepend: "text-" | split: ' ' -%}
  {%- else -%}
    {%- assign array_class_ele_new = array_class_ele | append: "-text"  | split: ' ' -%}
  {%- endif -%}

  {%- assign array_class_every = array_class_every | concat: array_class_ele_new -%}
{%- endfor -%}
{%- assign newstr = array_class_every | join: ' ' -%}