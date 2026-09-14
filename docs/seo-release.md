# SEO release handoff

The application emits canonical URLs for `https://crimsontide.ai`. At deployment, configure the host and DNS so this is the single public origin.

1. Point the apex `crimsontide.ai` domain to the Next.js application.
2. Configure `www.crimsontide.ai/*` to return a permanent redirect to `https://crimsontide.ai/*`, preserving both the path and query string.
3. Retire the legacy WordPress hostname at cutover, or permanently redirect every legacy path to its equivalent canonical route. Verify neither hostname continues to serve legacy HTML with `200 OK`.
4. Submit `https://crimsontide.ai/sitemap.xml` in Google Search Console and Bing Webmaster Tools after DNS and redirects are live.
5. Validate a representative canonical page in the Meta Sharing Debugger, LinkedIn Post Inspector, and X Card Validator after the card has been fetched from production.

The sitemap intentionally contains only the six public HTML pages. `robots.txt` permits normal crawling, excludes `/api/`, and advertises that sitemap.
