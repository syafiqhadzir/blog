---
layout: page
title: Glossary
permalink: /glossary/
---

<!-- markdownlint-disable-file MD033 -->

<div class="glossary-list">
  {% for entry in site.data.glossary %}
    <dl id="{{ entry.term | slugify }}">
      <dt>{{ entry.term }}</dt>
      <dd>{{ entry.definition }}</dd>
    </dl>
  {% endfor %}
</div>

<style>
.glossary-list dl {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.glossary-list dt {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--accent-color);
    margin-bottom: 0.5rem;
}

.glossary-list dd {
    margin-left: 0;
    line-height: 1.7;
}
</style>
