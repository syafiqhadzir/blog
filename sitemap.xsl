<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>XML Sitemap | Syafiq Hadzir</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          :root {
            --bg-color: #ffffff;
            --text-color: #1a202c;
            --link-color: #2563eb;
            --border-color: #e2e8f0;
            --hover-bg: #f7fafc;
            --header-bg: #f8fafc;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-color: #0f172a;
              --text-color: #e2e8f0;
              --link-color: #60a5fa;
              --border-color: #334155;
              --hover-bg: #1e293b;
              --header-bg: #1e293b;
            }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: var(--text-color);
            background: var(--bg-color);
            margin: 0;
            padding: 2rem;
            line-height: 1.5;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
          p.desc {
            color: #64748b;
            margin-bottom: 2rem;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          th {
            background: var(--header-bg);
            text-align: left;
            padding: 1rem;
            border-bottom: 2px solid var(--border-color);
            font-weight: 600;
          }
          td {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
          }
          tr:hover {
            background-color: var(--hover-bg);
          }
          a {
            color: var(--link-color);
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .priority {
            font-family: monospace;
          }
          .image-count {
             background: #eff6ff;
             color: #1e40af;
             padding: 0.1rem 0.4rem;
             border-radius: 4px;
             font-size: 0.8rem;
          }
          @media (prefers-color-scheme: dark) {
            .image-count {
                background: #1e3a8a;
                color: #dbeafe;
            }
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p class="desc">
          This is a machine-readable XML sitemap for <a href="/">blog.syafiqhadzir.dev</a>.
          It helps search engines discover content.
          <br/>
          Contains <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs.
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Priority</th>
              <th>Change Freq</th>
              <th>Last Modified</th>
              <th>Images</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <xsl:sort select="sitemap:priority" order="descending"/>
              <tr>
                <td>
                  <a href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                </td>
                <td class="priority">
                  <xsl:value-of select="sitemap:priority"/>
                </td>
                <td>
                  <xsl:value-of select="sitemap:changefreq"/>
                </td>
                <td>
                  <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                </td>
                <td>
                  <xsl:if test="count(image:image) > 0">
                    <span class="image-count">
                      <xsl:value-of select="count(image:image)"/> img
                    </span>
                  </xsl:if>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
