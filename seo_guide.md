# In-Depth Guide to How Google Search Works | Google Search Central

# In-depth guide to how Google Search works


Google Search is a fully-automated search engine that uses software known as web crawlers that
explore the web regularly to find pages to add to our index. In fact, the vast majority of
pages listed in our results aren't manually submitted for inclusion, but are found and added
automatically when our web crawlers explore the web. This document explains the stages of how
Search works in the context of your website. Having this base knowledge can help you fix
crawling issues, get your pages indexed, and learn how to optimize how your site appears in
Google Search.

> [!NOTE]
> Looking for something less technical? Check out our [How Search Works site](https://www.google.com/search/howsearchworks/), which explains how Search works from a searcher's perspective.

## A few notes before we get started


Before we get into the details of how Search works, it's important to note that Google doesn't
accept payment to crawl a site more frequently, or rank it higher. If anyone tells you
otherwise, they're wrong.


Google doesn't guarantee that it will crawl, index, or serve your page, even if your page
follows the [Google Search Essentials](https://developers.google.com/search/docs/essentials).

## Introducing the three stages of Google Search

Google Search works in three stages, and not all pages make it through each stage:

1. [**Crawling:**](https://developers.google.com/search/docs/fundamentals/how-search-works#crawling) Google downloads text, images, and videos from pages it found on the internet with automated programs called crawlers.
2. [**Indexing:**](https://developers.google.com/search/docs/fundamentals/how-search-works#indexing) Google analyzes the text, images, and video files on the page, and stores the information in the Google index, which is a large database.
3. [**Serving search results:**](https://developers.google.com/search/docs/fundamentals/how-search-works#serving) When a user searches on Google, Google returns information that's relevant to the user's query.

## Crawling


The first stage is finding out what pages exist on the web. There isn't a central registry of
all web pages, so Google must constantly look for new and updated pages and add them to its
list of known pages. This process is called "URL discovery". Some pages are known because
Google has already visited them. Other pages are discovered when Google extracts a link from a
known page to a new page: for example, a hub page, such as a category page, links to a new
blog post. Still other pages are discovered when you submit a list of pages (a
[sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)) for Google to crawl.
[Video](https://www.youtube.com/watch?v=JuK7NnfyEuc)


Once Google discovers a page's URL, it may visit (or "crawl") the page to find out what's on
it. We use a huge set of computers to crawl billions of pages on the web. The program that
does the fetching is called [Googlebot](https://developers.google.com/search/docs/crawling-indexing/googlebot)
(also known as a crawler, robot, bot, or spider). Googlebot uses an algorithmic process to
determine which sites to crawl, how often, and how many pages to fetch from each site.
[Google's crawlers](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
are also programmed such that they try not to crawl the site too fast to avoid overloading it.
This mechanism is based on the responses of the site (for example,
[HTTP 500 errors mean "slow down"](https://developers.google.com/search/docs/crawling-indexing/http-network-errors#http-status-codes)).


However, Googlebot doesn't crawl all the pages it discovered. Some pages may be
[disallowed for crawling](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt#disallow) by the
site owner, other pages may not be accessible without logging in to the site.


During the crawl, Google renders the page and
[runs any JavaScript it finds](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics#how-googlebot-processes-javascript)
using a recent version of
[Chrome](https://www.google.com/chrome/), similar to how your
browser renders pages you visit. Rendering is important because websites often rely on
JavaScript to bring content to the page, and without rendering Google might not see that
content.


Crawling depends on whether Google's crawlers can access the site. Some common issues with
Googlebot accessing sites include:

- [Problems with the server handling the site](https://developers.google.com/search/docs/crawling-indexing/http-network-errors#http-status-codes)
- [Network issues](https://developers.google.com/crawling/docs/troubleshooting/dns-network-errors)
- [robots.txt rules preventing Googlebot's access to the page](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

## Indexing


After a page is crawled, Google tries to understand what the page is about. This stage is
called indexing and it includes processing and analyzing the textual content and key content
tags and attributes, such as
[`<title>` elements](https://developers.google.com/search/docs/appearance/title-link)
and alt attributes,
[images](https://developers.google.com/search/docs/appearance/google-images),
[videos](https://developers.google.com/search/docs/appearance/video), and
more.
[Video](https://www.youtube.com/watch?v=pe-NSvBTg2o)


During the indexing process, Google determines if a page is a
[duplicate of another page on the internet or canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
The canonical is the page that may be shown in search results. To select the canonical, we
first group together (also known as clustering) the pages that we found on the internet that
have similar content, and then we select the one that's most representative of the group. The
other pages in the group are alternate versions that may be served in different contexts, like
if the user is searching from a mobile device or they're looking for a very specific page from
that cluster.


Google also collects signals about the canonical page and its contents, which may be used in
the next stage, where we serve the page in search results. Some signals include the language
of the page, the country the content is local to, and the usability of the page.


The collected information about the canonical page and its cluster may be stored in the Google
index, a large database hosted on thousands of computers. Indexing isn't guaranteed; not every
page that Google processes will be indexed.


Indexing also depends on the content of the page and its metadata. Some common indexing issues
can include:

- [The quality of the content on page is low](https://developers.google.com/search/docs/essentials)
- [Robots `meta` rules disallow indexing](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [The design of the website might make indexing difficult](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

## Serving search results

> [!NOTE]
> Google doesn't accept payment to rank pages higher, and ranking is done programmatically. [Learn more about ads on Google Search](https://www.google.com/search/howsearchworks/our-approach/ads-on-search/).


When a user enters a query, our machines search the index for matching pages and return the
results we believe are the highest quality and most relevant to the user's query. Relevancy is
determined by hundreds of factors, which could include information such as the user's
location, language, and device (desktop or phone). For example, searching for "bicycle repair
shops" would show different results to a user in Paris than it would to a user in Hong Kong.
[Video](https://www.youtube.com/watch?v=lgQazesEjO4)


Based on the user's query the search features that appear on the search results page also
change. For example, searching for "bicycle repair shops" will likely show local results and
no [image results](https://developers.google.com/search/docs/appearance/visual-elements-gallery#image-result),
however searching for "modern bicycle" is more likely to show image results, but not local
results. You can explore the most common UI elements of Google web search in our
[Visual Element gallery](https://developers.google.com/search/docs/appearance/visual-elements-gallery).


Search Console might tell you that a page is indexed, but you don't see it in search results.
This might be because:

- [The content on the page is irrelevant to users' queries](https://developers.google.com/search/docs/fundamentals/seo-starter-guide#expect-search-terms)
- [The quality of the content is low](https://developers.google.com/search/docs/essentials)
- [Robots `meta` rules prevent serving](https://developers.google.com/search/docs/crawling-indexing/block-indexing)


While this guide explains how Search works, we are always working on improving our algorithms.
You can keep track of these changes by following the
[Google Search Central blog](https://developers.google.com/search/blog).











# In-Depth Guide to How Google Search Works | Google Search Central

# In-depth guide to how Google Search works


Google Search is a fully-automated search engine that uses software known as web crawlers that
explore the web regularly to find pages to add to our index. In fact, the vast majority of
pages listed in our results aren't manually submitted for inclusion, but are found and added
automatically when our web crawlers explore the web. This document explains the stages of how
Search works in the context of your website. Having this base knowledge can help you fix
crawling issues, get your pages indexed, and learn how to optimize how your site appears in
Google Search.

> [!NOTE]
> Looking for something less technical? Check out our [How Search Works site](https://www.google.com/search/howsearchworks/), which explains how Search works from a searcher's perspective.

## A few notes before we get started


Before we get into the details of how Search works, it's important to note that Google doesn't
accept payment to crawl a site more frequently, or rank it higher. If anyone tells you
otherwise, they're wrong.


Google doesn't guarantee that it will crawl, index, or serve your page, even if your page
follows the [Google Search Essentials](https://developers.google.com/search/docs/essentials).

## Introducing the three stages of Google Search

Google Search works in three stages, and not all pages make it through each stage:

1. [**Crawling:**](https://developers.google.com/search/docs/fundamentals/how-search-works#crawling) Google downloads text, images, and videos from pages it found on the internet with automated programs called crawlers.
2. [**Indexing:**](https://developers.google.com/search/docs/fundamentals/how-search-works#indexing) Google analyzes the text, images, and video files on the page, and stores the information in the Google index, which is a large database.
3. [**Serving search results:**](https://developers.google.com/search/docs/fundamentals/how-search-works#serving) When a user searches on Google, Google returns information that's relevant to the user's query.

## Crawling


The first stage is finding out what pages exist on the web. There isn't a central registry of
all web pages, so Google must constantly look for new and updated pages and add them to its
list of known pages. This process is called "URL discovery". Some pages are known because
Google has already visited them. Other pages are discovered when Google extracts a link from a
known page to a new page: for example, a hub page, such as a category page, links to a new
blog post. Still other pages are discovered when you submit a list of pages (a
[sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)) for Google to crawl.
[Video](https://www.youtube.com/watch?v=JuK7NnfyEuc)


Once Google discovers a page's URL, it may visit (or "crawl") the page to find out what's on
it. We use a huge set of computers to crawl billions of pages on the web. The program that
does the fetching is called [Googlebot](https://developers.google.com/search/docs/crawling-indexing/googlebot)
(also known as a crawler, robot, bot, or spider). Googlebot uses an algorithmic process to
determine which sites to crawl, how often, and how many pages to fetch from each site.
[Google's crawlers](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
are also programmed such that they try not to crawl the site too fast to avoid overloading it.
This mechanism is based on the responses of the site (for example,
[HTTP 500 errors mean "slow down"](https://developers.google.com/search/docs/crawling-indexing/http-network-errors#http-status-codes)).


However, Googlebot doesn't crawl all the pages it discovered. Some pages may be
[disallowed for crawling](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt#disallow) by the
site owner, other pages may not be accessible without logging in to the site.


During the crawl, Google renders the page and
[runs any JavaScript it finds](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics#how-googlebot-processes-javascript)
using a recent version of
[Chrome](https://www.google.com/chrome/), similar to how your
browser renders pages you visit. Rendering is important because websites often rely on
JavaScript to bring content to the page, and without rendering Google might not see that
content.


Crawling depends on whether Google's crawlers can access the site. Some common issues with
Googlebot accessing sites include:

- [Problems with the server handling the site](https://developers.google.com/search/docs/crawling-indexing/http-network-errors#http-status-codes)
- [Network issues](https://developers.google.com/crawling/docs/troubleshooting/dns-network-errors)
- [robots.txt rules preventing Googlebot's access to the page](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

## Indexing


After a page is crawled, Google tries to understand what the page is about. This stage is
called indexing and it includes processing and analyzing the textual content and key content
tags and attributes, such as
[`<title>` elements](https://developers.google.com/search/docs/appearance/title-link)
and alt attributes,
[images](https://developers.google.com/search/docs/appearance/google-images),
[videos](https://developers.google.com/search/docs/appearance/video), and
more.
[Video](https://www.youtube.com/watch?v=pe-NSvBTg2o)


During the indexing process, Google determines if a page is a
[duplicate of another page on the internet or canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
The canonical is the page that may be shown in search results. To select the canonical, we
first group together (also known as clustering) the pages that we found on the internet that
have similar content, and then we select the one that's most representative of the group. The
other pages in the group are alternate versions that may be served in different contexts, like
if the user is searching from a mobile device or they're looking for a very specific page from
that cluster.


Google also collects signals about the canonical page and its contents, which may be used in
the next stage, where we serve the page in search results. Some signals include the language
of the page, the country the content is local to, and the usability of the page.


The collected information about the canonical page and its cluster may be stored in the Google
index, a large database hosted on thousands of computers. Indexing isn't guaranteed; not every
page that Google processes will be indexed.


Indexing also depends on the content of the page and its metadata. Some common indexing issues
can include:

- [The quality of the content on page is low](https://developers.google.com/search/docs/essentials)
- [Robots `meta` rules disallow indexing](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [The design of the website might make indexing difficult](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

## Serving search results

> [!NOTE]
> Google doesn't accept payment to rank pages higher, and ranking is done programmatically. [Learn more about ads on Google Search](https://www.google.com/search/howsearchworks/our-approach/ads-on-search/).


When a user enters a query, our machines search the index for matching pages and return the
results we believe are the highest quality and most relevant to the user's query. Relevancy is
determined by hundreds of factors, which could include information such as the user's
location, language, and device (desktop or phone). For example, searching for "bicycle repair
shops" would show different results to a user in Paris than it would to a user in Hong Kong.
[Video](https://www.youtube.com/watch?v=lgQazesEjO4)


Based on the user's query the search features that appear on the search results page also
change. For example, searching for "bicycle repair shops" will likely show local results and
no [image results](https://developers.google.com/search/docs/appearance/visual-elements-gallery#image-result),
however searching for "modern bicycle" is more likely to show image results, but not local
results. You can explore the most common UI elements of Google web search in our
[Visual Element gallery](https://developers.google.com/search/docs/appearance/visual-elements-gallery).


Search Console might tell you that a page is indexed, but you don't see it in search results.
This might be because:

- [The content on the page is irrelevant to users' queries](https://developers.google.com/search/docs/fundamentals/seo-starter-guide#expect-search-terms)
- [The quality of the content is low](https://developers.google.com/search/docs/essentials)
- [Robots `meta` rules prevent serving](https://developers.google.com/search/docs/crawling-indexing/block-indexing)


While this guide explains how Search works, we are always working on improving our algorithms.
You can keep track of these changes by following the
[Google Search Central blog](https://developers.google.com/search/blog).



# How to Get Information on Google | Google Search Central

# Get your website on Google

Google automatically looks for sites to add to our index; you usually don't even need to do
anything except post your site on the web. However, sometimes sites get missed. Check to see if your
site is on Google and learn how to make your content more visible in Google Search.

## Basic checklist for appearing in Google Search results


Here are a few basic questions to ask yourself about your website when you get started. You
can find additional getting started information in the [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

### Is your website showing up on Google?


To see if your pages are already [indexed](https://developers.google.com/search/docs/fundamentals/how-search-works#indexing),
search for your site in Google Search with a query like this. Substitute your own site for "example.com".

```
site:example.com
```

> [!NOTE]
> The `site:` operator doesn't necessarily return all the URLs that are indexed under the prefix specified in the query. [Learn more about the `site:` operator](https://developers.google.com/search/docs/monitor-debug/search-operators/all-search-site).


Although Google crawls billions of pages, it's inevitable that some sites will be missed. When
our crawlers miss a site, it's frequently for one of the following reasons:

- **Your site isn't linked to by other sites on the web.** See if you can get your site linked to by other sites (but please don't pay them to link to you; that could be considered a [violation of Google's spam policies](https://developers.google.com/search/docs/essentials/spam-policies#link-spam)).
- **You've just launched a new site and Google hasn't had time to [crawl](https://developers.google.com/search/docs/fundamentals/how-search-works#crawling) it yet.** It can take a few weeks for Google to notice a new site, or any changes in your existing site.
- **The design of the site makes it difficult for Google to crawl its content effectively.** If your site is built on some other specialized technology, rather than HTML, Google might have trouble crawling it correctly. Remember to use text, not just images or video, on your site.
- **Google received an error when trying to crawl your site.** Most common reasons for this are that you have a login page for your site, or that your site blocks Google for some reason. Make sure that you can access your site in an [incognito window](https://support.google.com/chrome/answer/95464).
- **Google missed it:** Although Google crawls billions of pages, it's inevitable that we'll miss a few sites, especially small ones. Wait a while, and try to get linked from other sites.


  If you're feeling adventurous, you can [add your site to Search Console](https://support.google.com/webmasters/answer/9008080)
  to see if there's an error that might prevent Google from
  understanding your site. You can also [send us your most important URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
  to let us know we should crawl and potentially index them.


Follow the [Google Search Essentials](https://developers.google.com/search/docs/essentials) to make sure that you're fulfilling the site guidelines for appearing on Google.

### Do you serve high-quality content to users?


Your number one priority is ensuring that your users have the best possible experience
on your site. Think about what makes your site unique, valuable, or engaging. To help you evaluate your content,
ask yourself the self-assessment questions in our guide to
[creating content that's helpful, reliable, and people-first](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
To make sure that you're managing your website using Google-friendly
practices, read the [Search Essentials](https://developers.google.com/search/docs/essentials).

### Is your local business showing up on Google?


Your Business Profile lets you manage how your business information appears across Google,
including Search and Maps. Consider [claiming your Business Profile](https://www.google.com/business/).

### Is your content fast and easy to access on all devices?


Most searches are now done from mobile devices; make sure that your content is optimized to
load quickly and display properly on all screen sizes.
You can use tools such as [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) to test if your page is mobile-friendly.

### Is your website secure?


Modern users expect a secure online experience.
[Secure your website's connection with HTTPS](https://web.dev/articles/enable-https).

### Do you need additional help?


SEOs (search engine optimizers) are professionals who can help you improve your website and
increase visibility on search engines. Learn more about [why and how to hire an SEO](https://developers.google.com/search/docs/fundamentals/do-i-need-seo).

### Is your content about a specialized topic?


Depending on what your content is about, there are more ways you can get that content on
Google. The following table contains links to the different avenues Google provides to get
your content related to a business or person on Google.

| Business or person ||
|---|---|
| [**Google for Retail**](https://www.google.com/ads/shopping/index.html) | To promote your products on Google Shopping, Google Offers, and other properties, you can submit your product catalogs digitally to Google Search. |
| [**Google for Small Business**](https://smallbusiness.withgoogle.com) | See what resources Google offers to help your small business thrive. |
| [**Street View**](https://www.google.com/streetview/earn/) | Invite customers on a virtual tour of your business. |
| [**Knowledge panel**](https://support.google.com/knowledgepanel/answer/9163198) | If you want to manage your identity as a person, business, or organization on Google, you can [suggest changes to your knowledge panel entry](https://support.google.com/knowledgepanel/answer/7534842). |


To learn more about getting digital content on Google, check out the following resources:

| Digital content ||
|---|---|
| [**Google Books and eBooks**](https://support.google.com/books/partner/answer/3324395) | Promote your books online and sell your titles through our eBook store. |
| [**Scholar**](https://scholar.google.com/intl/en/scholar/about.html) | Include scholarly works in Google's academic index. |
| [**Google News**](https://support.google.com/news/publisher-center/answer/9607025) | Appear in Google News search results, or provide digital editions for subscription. |


For getting local information on Google, the following resources may be helpful:

| Local information ||
|---|---|
| [**Google Maps Content Partners**](https://contentpartners.maps.google.com/) | If you are an authoritative or official source of regional data, publish it through Google. |
| [**Photo Sphere**](https://www.google.com/maps/about/contribute/photosphere/) | Photograph and share the world with 360° pictures. |
| [**Street View**](https://www.google.com/streetview/contributors/) | Provide a panoramic virtual tour of your property. |
| [**Transit Partner Program**](https://support.google.com/transitpartners/answer/1111481) | Encourage use of public transit by making it easy to locate routes, schedules and fares. |

| Media ||
|---|---|
| [**Google Maps Content Partners**](https://contentpartners.maps.google.com/) | If you are an authoritative or official source of regional data, publish it through Google. |
| [**Video on Google Search**](https://developers.google.com/search/docs/appearance/video) | Make your videos findable and crawlable by Google Search. |
| [**YouTube**](https://www.youtube.com/t/partnerships_faq) | Upload, distribute, and monetize your videos. |





# File Types Indexable by Google | Google Search Central

# File types indexable by Google


Google can index the content of most text-based files and certain encoded document formats. The
file type is determined by the `Content-Type` HTTP header returned when Google
crawls the file, though in some cases Google may use the file extension or re-parse the file using
a different parser if the `Content-Type` header is missing or incorrect.

## Supported flat file types


The following flat file types are supported. These are files where the content is stored in plain,
unencoded text (though they may use markup tags).

- Comma-Separated Values (.csv)
- Google Earth (.kml, .kmz)
- GPS eXchange Format (.gpx)
- HTML (.htm, .html, other file extensions)
- Scalable Vector Graphics (.svg)
- TeX/LaTeX (.tex)
- Text (.txt, .text, other file extensions), including source code in common programming languages, such as:
  - Basic source code (.bas)
  - C/C++ source code (.c, .cc, .cpp, .cxx, .h, .hpp)
  - C# source code (.cs)
  - Java source code (.java)
  - Perl source code (.pl)
  - Python source code (.py)
- Wireless Markup Language (.wml, .wap)
- XML (.xml)

## Supported encoded file types


The following encoded file types are supported. These are binary files or complex containers that
require a specific parser to extract the human-readable text.

- Adobe Portable Document Format (.pdf)
- Adobe PostScript (.ps)
- Electronic Publication (.epub)
- Hancom Hanword (.hwp)
- Microsoft Excel (.xls, .xlsx)
- Microsoft PowerPoint (.ppt, .pptx)
- Microsoft Word (.doc, .docx)
- OpenOffice presentation (.odp)
- OpenOffice spreadsheet (.ods)
- OpenOffice text (.odt)
- Rich Text Format (.rtf)

## Supported media formats


Google can also index the following media formats:

- Image formats: BMP, GIF, JPEG, PNG, WebP, SVG, and AVIF
- Video formats: 3GP, 3G2, ASF, AVI, DivX, M2V, M3U, M3U8, M4V, MKV, MOV, MP4, MPEG, OGV, QVT, RAM, RM, VOB, WebM, WMV, and XAP

## Search by file type


You can use the `filetype:` operator in Google Search to limit results to a
specific file type or file extension. For example,
`https://www.google.com/search?q=filetype:rtf+galway`
will search for RTF files and URLs ending in `.rtf` whose content contains the term
"galway".




# URL Structure Best Practices for Google Search | Google Search Central

# URL structure best practices for Google Search


To make sure Google Search can crawl your site effectively, use a crawlable URL structure that
meets the following requirements. If your URLs don't meet the following criteria, Google Search
will likely crawl your site inefficiently --- including but not limited to extremely high
crawl rates, or not at all.

| ## Requirements for a crawlable URL structure ||
|---|---|
| ### Follow [IETF STD 66](https://datatracker.ietf.org/doc/std66/) | Google Search supports URLs as defined by [IETF STD 66](https://datatracker.ietf.org/doc/std66/). Characters defined by the standard as [reserved](https://www.rfc-editor.org/rfc/rfc3986#section-2.2) must be [percent encoded](https://developer.mozilla.org/docs/Glossary/Percent-encoding). |
| ### Don't use URL fragments to change content | Don't use [fragments](https://wikipedia.org/wiki/URI_fragment) to change the content of a page, as Google Search generally doesn't support URL fragments. Here's an example of a URL fragment: ``` https://example.com/#/potatoes ``` If you're using JavaScript to change content, [use the History API](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics#use-history-api) instead. |
| ### Use a common encoding for URL parameters | When specifying URL parameters, use the following common encoding: an equal sign (`=`) to separate key-value pairs and add additional parameters with an ampersand (`&`). To list multiple values for the same key within a key-value pair, you can use any character that doesn't conflict with [IETF STD 66](https://datatracker.ietf.org/doc/std66/), such as a comma (`,`). | Recommended | Not recommended | |---|---| | Using an equal sign (`=`) to separate key-value pairs and an ampersand (`&`) to add additional parameters: ``` https://example.com/category?category=dresses&sort=low-to-high&sid=789 ``` | Using a colon (`:`) to separate key-value pairs and brackets (`[ ]`) to add additional parameters: ``` https://example.com/category?[category:dresses][sort:price-low-to-high][sid:789] ``` | | Using a comma (`,`) to list multiple values for the same key, an equal sign (`=`) to separate key-value pairs, and an ampersand (`&`) to add additional parameters: ``` https://example.com/category?category=dresses&color=purple,pink,salmon&sort=low-to-high&sid=789 ``` | Using a single comma (`,`) to separate key-value pairs and double commas (`,,`) to add additional parameters: ``` https://example.com/category?category,dresses,,sort,lowtohigh,,sid,789 ``` | |

## Make it easy to understand your URL structure


To help Google Search (and your users) better understand your site, we recommend creating a simple
URL structure, applying the following best practices when possible.

> [!NOTE]
> Consider organizing your content so that URLs are constructed logically and in a manner that is most intelligible to humans. For information on structuring your site as a whole, check out [this section of the SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide#group-topically).

| Best practices ||
|---|---|
| ### Use descriptive URLs | When possible, use readable words rather than long ID numbers in your URLs. | Recommended (simple, descriptive words) | Not recommended (unreadable, long ID numbers) | |---|---| | ``` https://example.com/wiki/Aviation ``` | ``` https://example.com/index.php?topic=42&area=3a5ebc944f41daa6f849f730f1 ``` | |
| ### Use your audience's language | Use words in your audience's language in the URL (and, if applicable, transliterated words). For example, if your audience is searching in German, use German words in the URL: ``` https://example.com/lebensmittel/pfefferminz ``` Or if your audience is searching in Japanese, use Japanese words in the URL: ``` https://example.com/ペパーミント ``` |
| ### Use percent encoding as necessary | When [linking to pages on your site](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), use percent encoding in your links's `href` attributes as necessary. Unreserved ASCII characters may be left in the non-encoded form. Additionally, characters in the non-ASCII range should be percent encoded. For example: | Recommended (percent encoding) | Not recommended (non-ASCII characters) | |---|---| | ``` https://example.com/%D9%86%D8%B9%D9%86%D8%A7%D8%B9/%D8%A8%D9%82%D8%A7%D9%84%D8%A9 ``` | ``` https://example.com/نعناع ``` | | ``` https://example.com/%E6%9D%82%E8%B4%A7/%E8%96%84%E8%8D%B7 ``` | ``` https://example.com/杂货/薄荷 ``` | | ``` https://example.com/gem%C3%BCse ``` | ``` https://example.com/gemüse ``` | | ``` https://example.com/%F0%9F%A6%99%E2%9C%A8 ``` | ``` https://example.com/🦙✨ ``` | |
| ### Use hyphens to separate words | We recommend separating words in your URLs, when possible. Specifically, we recommend using hyphens (`-`) instead of underscores (`_`) to separate words in your URLs, as it helps users and search engines better identify concepts in the URL. For historical reasons, we don't recommend using underscores, as this style is already commonly used for denoting concepts that should be kept together, for example, by various programming languages to name functions (such as `format_date`). | Recommended | Not recommended | |---|---| | Using hyphens (`-`) to separate words: ``` https://example.com/summer-clothing/filter?color-profile=dark-grey ``` | Using underscores (`_`) to separate words: ``` https://example.com/summer_clothing/filter?color_profile=dark_grey ``` Joining words together in the URL: ``` https://example.com/greendress ``` | |
| ### Use as few parameters as you can | Whenever possible, shorten URLs by trimming unnecessary parameters (meaning, parameters that don't change the content). |
| ### Be aware that URLs are case sensitive | Like any other HTTP client following IETF STD 66, Google Search's URL handling is case sensitive (for example, Google treats both `/APPLE` and `/apple` as distinct URLs with their own content). If upper and lower case text in a URL is treated the same by your web server, convert all text to the same case so it's easier for Google to determine that URLs reference the same page. |
| ### For multi-regional sites | If your site is multi-regional, consider using a URL structure that makes it easy to geotarget your site. For more examples of how you can structure your URLs, refer to [using locale-specific URLs](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites#locale-specific-urls). Recommended (using a country-specific domain): ``` https://example.de ``` Recommended (using a country-specific subdirectory with gTLD): ``` https://example.com/de/ ``` |

## Avoid common issues related to URLs


Overly complex URLs, especially those containing multiple parameters, can cause problems for
crawlers by creating unnecessarily high numbers of URLs that point to identical or similar
content on your site. As a result, Googlebot may consume much more bandwidth than necessary, or
Google Search may be unable to completely index all the content on your site.


Unnecessarily high numbers of URLs can be caused by a number of issues. These include:

| Common issues ||
|---|---|
| ### Additive filtering of a set of items | Many sites provide different views of the same set of items or search results, often allowing the user to filter this set using defined criteria (for example: show me hotels on the beach). When filters can be combined in an additive manner (for example: hotels on the beach and with a fitness center), the number of URLs (views of data) in the sites explodes. Creating a large number of slightly different lists of hotels is redundant, as Googlebot only needs to see a small number of lists from which it can reach the page for each hotel. For example: - Hotel properties at "value rates": ``` https://example.com/hotel-search-results.jsp?Ne=292&N=461 ``` - Hotel properties at "value rates" on the beach: ``` https://example.com/hotel-search-results.jsp?Ne=292&N=461+4294967240 ``` - Hotel properties at "value rates" on the beach and with a fitness center: ``` https://example.com/hotel-search-results.jsp?Ne=292&N=461+4294967240+4294967270 ``` |
| ### Irrelevant parameters | Irrelevant parameters in the URL can cause a large number of URLs, such as: - Referral parameters: ``` https://example.com/search/noheaders?click=6EE2BF1AF6A3D705D5561B7C3564D9C2&clickPage=OPD+Product+Page&cat=79 ``` ``` https://example.com/discuss/showthread.php?referrerid=249406&threadid=535913 ``` ``` https://example.com/products/products.asp?N=200063&Ne=500955&ref=foo%2Cbar&Cn=Accessories ``` - Shopping sorting parameters: ``` https://example.com/results?search_type=search_videos&search_query=tpb&search_sort=relevance&search_category=25 ``` - Session IDs: ``` https://example.com/search/noheaders?sessionid=6EE2BF1AF6A3D705D5561B7C3564D9C2 ``` > [!NOTE] > Wherever possible, avoid the use of session IDs in URLs and consider using cookies instead. Consider using a [robots.txt file](https://developers.google.com/search/docs/crawling-indexing/robots/intro) to block Googlebot's access to these problematic URLs. |
| ### Calendar issues | A dynamically generated calendar might generate links to future and previous dates with no restrictions on start or end dates. For example: ``` https://example.com/calendar.php?d=13&m=8&y=2011 ``` If your site has an infinite calendar, add a `https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links#nofollow` attribute to links to dynamically created future calendar pages. |
| ### Broken relative links | Placing a [parent-relative link](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references#parent-directory_relative) on the wrong page may create infinite spaces if your server doesn't respond with the right HTTP status code for nonexistent pages. For example, a parent-relative link such as `<a href="../../category/stuff">...</a>` on `https://example.com/category/community/070413/html/FAQ.htm` may lead to bogus URLs such as `https://example.com/category/community/category/stuff`. To fix, use root-relative URLs in your links (instead of parent-relative). |

## Fixing crawling-related URL structure problems


If you notice that Google Search is crawling these problematic URLs, we recommend the following:

- Consider using a [robots.txt file](https://developers.google.com/search/docs/crawling-indexing/robots/intro) to block Googlebot's access to [problematic URLs](https://developers.google.com/search/docs/crawling-indexing/url-structure#common-issues). Typically, consider blocking dynamic URLs, such as URLs that generate search results, or URLs that can create infinite spaces, such as calendars, and ordering and filtering functions.
- If your site has faceted navigation, learn how to [manage crawling of those faceted navigation URLs](https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation#prevent-crawling-of-faceted-navigation-urls).


# SEO Link Best Practices for Google | Google Search Central

# Link best practices for Google

Google uses links as a signal when determining the relevancy of pages and to find new pages
to crawl. Learn how to make your links crawlable so that Google can find other pages on your
site via the links on your page, and how to improve your anchor text so that it's easier for
people and Google to make sense of your content.

## Make your links crawlable

Generally, Google can only crawl your link if it's an `<a>` HTML element (also
known as *anchor element* )
with an `href` attribute. Most links in other formats won't be parsed and extracted
by Google's crawlers. Google can't reliably extract URLs from `<a>` elements
that don't have an `href` attribute or other tags that perform as links because of
script events. Here are examples of links that Google can and can't parse:

**Recommended (Google can parse)**

```
<a href="https://example.com">
```

```
<a href="/products/category/shoes">
```

```
<a href="./products/category/shoes">
```

```
<a href="/products/category/shoes" onclick="javascript:goTo('shoes')">
```

```
<a href="/products/category/shoes" class="pretty">
```

> [!IMPORTANT]
> Links are also crawlable when you use JavaScript to insert them into a page dynamically as long as it uses the HTML markup shown above.

**Not recommended (but Google may still
attempt to parse this):**

```
<a routerLink="products/category">
```

```
<span href="https://example.com">
```

```
<a onclick="goto('https://example.com')">
```


Make sure that the URL in your `<a>` element resolves into an actual web
address (meaning, it resembles a URI) that Google crawlers can send requests to, for example:

**Recommended (Google can resolve):**

```
<a href="https://example.com/stuff">
```

```
<a href="/products">
```

```
<a href="/products.php?id=123">
```

**Not recommended (but Google may still
attempt to resolve this):**

```
<a href="javascript:goTo('products')">
```

```
<a href="javascript:window.location.href='/products'">
```

## Anchor text placement


*Anchor text* (also known as *link text* ) is the visible text of a link. This
text tells people and Google something about the page you're linking to. Place anchor text
between [`<a>` elements that Google can crawl](https://developers.google.com/search/docs/crawling-indexing/links-crawlable#crawlable-links).

**Good:**
> \<a href="https://example.com/ghost-peppers"\>**ghost peppers** \</a\>

**Bad (empty link text):**
> \<a href="https://example.com"\>\</a\>


As a fallback, Google can use the `title` attribute as anchor text if the
`<a>` element is for some reason empty.
> \<a href="https://example.com/ghost-pepper-recipe" title="**how to pickle ghost peppers** "\>\</a\>


For images as links, Google uses the `alt` attribute of the `img` element
as anchor text, so be sure to [add descriptive alt text to your images](https://developers.google.com/search/docs/appearance/google-images#descriptive-alt-text):

**Good:**
> \<a href="/add-to-cart.html"\>\<img src="enchiladas-in-shopping-cart.jpg" alt="**add enchiladas to your cart** "/\>\</a\>

**Bad (empty alt text and empty link text):**
> \<a href="/add-to-cart.html"\>\<img src="enchiladas-in-shopping-cart.jpg" alt=""/\>\</a\>


If you are using JavaScript to insert anchor text, use the [URL Inspection Tool](https://support.google.com/webmasters/answer/9012289)
to make sure it's present in the rendered HTML.

## Write good anchor text


Good anchor text is descriptive, reasonably concise, and relevant to the page that it's on
and to the page it links to. It provides context for the link, and sets the expectation for your readers.
The better your anchor text, the easier it is for people to
navigate your site and for Google to understand what the page you're linking to is about.

**Bad (too generic):**
> \<a href="https://example.com"\>**Click here** \</a\> to learn more.
> \<a href="https://example.com"\>**Read more** \</a\>.
> Learn more about our cheese on our \<a href="https://example.com"\>**website** \</a\>.
> We have an \<a href="https://example.com"\>**article** \</a\> that provides more background on how the cheese is made.

> [!IMPORTANT]
> **Tip**: Try reading only the anchor text (out of context) and check if it's specific enough to make sense by itself. If you don't know what the page could be about, you need more descriptive anchor text.

**Better (more descriptive):**
> For a full list of cheese available for purchase, see the \<a href="https://example.com"\>**list of cheese types** \</a\>.

**Bad (weirdly long):**
> Starting next Tuesday, the \<a href="https://example.com"\>**Knitted
> Cow invites local residents of Wisconsin to their grand re-opening by also offering
> complimentary cow-shaped ice sculptures** \</a\> to the first 20 customers.

**Better (more concise):**
> Starting next Tuesday, the \<a href="https://example.com"\>**Knitted
> Cow invites local residents of Wisconsin** \</a\> to their grand re-opening by also offering complimentary cow-shaped ice sculptures to the first 20 customers.


Write as naturally as possible, and resist the urge to cram every keyword that's related to
the page that you're linking to (remember, [keyword stuffing](https://developers.google.com/search/docs/essentials/spam-policies#keyword-stuffing)
is a violation of our spam policies). Ask yourself, does the reader need these keywords to
understand the next page? If it feels like you're forcing keywords into the anchor text, then
it's probably too much.


Remember to give context to your links: the words before and after links matter, so pay
attention to the sentence as a whole. Don't chain up links next to each other; it's harder
for your readers to distinguish between links, and you lose surrounding text for each link.

**Bad (too many links next to each other):**
> I've written about cheese \<a href="https://example.com/page1"\>**so** \</a\> \<a href="https://example.com/page2"\>**many** \</a\> \<a href="https://example.com/page3"\>**times** \</a\> \<a href="https://example.com/page4"\>**this** \</a\> \<a href="https://example.com/page5"\>**year** \</a\>.

**Better (links are spaced out with context):**
> I've written about cheese so many times this year: who can forget the \<a href="https://example.com/blue-cheese-vs-gorgonzola"\>**controversy over blue cheese and gorgonzola** \</a\>, the \<a href="https://example.com/worlds-oldest-brie"\>**world's oldest brie** \</a\> piece that won the Cheesiest Research Medal, the epic retelling of \<a href="https://example.com/the-lost-cheese"\>**The Lost Cheese** \</a\>, and my personal favorite, \<a href="https://example.com/boy-and-his-cheese"\>**A Boy and His Cheese: a story of two unlikely friends** \</a\>.

## Internal links: cross-reference your own content

[Video](https://www.youtube.com/watch?v=vc3uGc6TSH0)


You may usually think about linking in terms of pointing to external websites, but paying more attention to the anchor text used for internal links can help both people and Google make sense of your site more easily and find other pages on your site. Every page you care about should have a link from at least one other page on your site. Think about what other resources on your site could help your readers understand a given page on your site, and link to those pages in context.

> [!NOTE]
> There's no magical ideal number of links a given page should contain. However, if you think it's too much, then it probably is.

## External links: link to other sites


Linking to other sites isn't something to be scared of; in fact, using external links can help
establish trustworthiness (for example, citing your sources). Link out to external sites when
it makes sense, and provide context to your readers about what they can expect.


**Good (citing your sources)**:
> According to a recent study from Swiss researchers, Emmental cheese wheels that were exposed to music had a milder flavor when compared to the control cheese wheels (which experienced no such musical treatment), with the full findings available in \<a href="https://example.com"\>**Cheese
> in Surround Sound---a culinary art experiment** \</a\>.


Use [`nofollow`](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links#nofollow)
only when you don't trust the source, and not for every external link on your site. For example,
you're a cheese enthusiast and someone published a story badmouthing your favorite cheese, so
you want to write an article in response; however, you don't want to give the site some of your
reputation from your link. This would be a good time to use `nofollow`.


If you were paid in some way for the link, qualify these links with
[`sponsored`](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links#sponsored)
or `nofollow`. If users can insert links on your site (for example, you have a
forum section or Q\&A site), add [`ugc`](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links#ugc)
or `nofollow` to these links too.


# What Is a Sitemap | Google Search Central

# Learn about sitemaps

[Video](https://www.youtube.com/watch?v=JlamLfyFjTA)


A *sitemap* is a file where you provide information about the pages, videos, and other
files on your site, and the relationships between them. Search engines like Google read this
file to crawl your site more efficiently. A sitemap tells search engines which pages and files you
think are important in your site, and also provides valuable information about these files.
For example, when the page was last updated and any alternate language versions of the page.


You can use a sitemap to provide information about specific types of content on your pages,
including [video](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps),
[image](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps), and
[news](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap) content. For example:

- A sitemap *video entry* can specify the video running time, rating, and age-appropriateness rating.
- A sitemap *image entry* can include the location of the images included in a page.
- A sitemap *news entry* can include the article title and publication date.

> [!NOTE]
> If you're using a CMS such as WordPress, Wix, or Blogger, it's likely that your CMS has already [made a sitemap available to search engines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#cmssitemap) and you don't have to do anything.

## Do I need a sitemap?


If your site's pages are properly linked, Google can usually discover most of your site.
Proper linking means that all pages that you deem important can be reached through some form
of navigation, be that your site's menu or links that you placed on pages. Even so, a sitemap
can improve the crawling of larger or more complex sites, or more specialized files.

> [!NOTE]
> A sitemap helps search engines discover URLs on your site, but it doesn't guarantee that all the items in your sitemap will be crawled and indexed. However, in most cases, your site will benefit from having a sitemap.

**You might need a sitemap if:**

- **Your site is large.** Generally, on large sites it's more difficult to make sure that every page is linked by at least one other page on the site. As a result, it's more likely [Googlebot](https://developers.google.com/search/docs/crawling-indexing/googlebot) might not discover some of your new pages.
- **Your site is new and has few external links to it.** Googlebot and other web crawlers crawl the web by accessing URLs found in previously crawled pages. As a result, Googlebot might not discover your pages if no other sites link to them.
- **Your site has a lot of rich media content (video, images) or is shown in Google News.** Google can take additional information from sitemaps into account for Search.

**You might not need a sitemap if:**

- **Your site is "small".** By small, we mean about 500 pages or fewer on your site. Only pages that you think need to be in search results count toward this total.
- **Your site is comprehensively linked internally.** This means that Googlebot can find all the important pages on your site by following links starting from the home page.
- **You don't have many media files (video, image) or news pages** that you want to show in search results. Sitemaps can help Google find and understand video and image files, or news articles, on your site. If you don't need these results to appear in Search you might not need a sitemap.

## Build a sitemap


If you decided that you need a sitemap,
[learn more about how to create one](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).


# Manage Your Sitemaps With Sitemap Index Files | Google Search Central

# Manage your sitemaps with a sitemap index file


If you have a sitemap that exceeds the
[size limits](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
you'll need to split up your large sitemap into multiple sitemaps such that each new sitemap
is below the size limit. Once you've split up your sitemap, you can use a sitemap index file
as a way to submit many sitemaps at once.

## Sitemap index best practices


The XML format of a sitemap index file is very
similar to the XML format of a sitemap file, and it's defined by the
[Sitemap Protocol](https://www.sitemaps.org/protocol.html#index).
This means that all the sitemap requirements apply to sitemap index files also.


The referenced sitemaps must be hosted on the same site as your sitemap index file. This
requirement is waived if you set up
[cross-site submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#cross-submit).


Sitemaps that are referenced in the sitemap index file must be in the same
directory as the sitemap index file, or lower in the site hierarchy. For example, if the
sitemap index file is at `https://example.com/public/sitemap_index.xml`, it can
only contain sitemaps that are in the same or deeper directory, like
`https://example.com/public/shared/...`.


You can submit up to 500 sitemap index files for each site in your Search Console account.

## Example sitemap index


The following example shows a sitemap index in XML format that lists two sitemaps:

```
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.example.com/sitemap1.xml.gz</loc>
    <lastmod>2024-08-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.example.com/sitemap2.xml.gz</loc>
    <lastmod>2022-06-05</lastmod>
  </sitemap>
</sitemapindex>
```

## Sitemap index reference


The sitemap index tags are defined by the same namespace as generic sitemaps:
[`http://www.sitemaps.org/schemas/sitemap/0.9`](http://www.sitemaps.org/schemas/sitemap/0.9)

To make sure Google can use your sitemap index, you must use the following required tags:

| Required tags ||
|---|---|
| `sitemapindex` | The root tag of the XML tree. It contains all the other tags. |
| `sitemap` | The parent tag for each sitemap listed in the file. It's the only direct child of the `sitemapindex` tag. |
| `loc` | The location (URL) of the sitemap. It's a child of the `sitemap` tag. A sitemap index file may have up to 50,000 `loc` tags. |


Additionally, the following optional tags may help Google schedule your sitemaps for crawling:

| Optional tags ||
|---|---|
| `lastmod` | Identifies the time that the corresponding sitemap file was modified. It can be a child of a `sitemap` tag. The value for the `lastmod` tag must be in [W3C Datetime format](https://www.w3.org/TR/NOTE-datetime). |

## Troubleshooting sitemaps


If you're having trouble with your sitemap, you can investigate the errors with Google Search Console.
See Search Console's
[sitemaps troubleshooting guide](https://support.google.com/webmasters/answer/7451001#errors)
for help.

## Additional resources


Want to learn more? Check out the following resources:

- [Submit your sitemap to Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap)
- [Learn how to combine sitemap extensions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/combine-sitemap-extensions)


# Manage Your Sitemaps With Sitemap Index Files | Google Search Central

# Manage your sitemaps with a sitemap index file


If you have a sitemap that exceeds the
[size limits](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
you'll need to split up your large sitemap into multiple sitemaps such that each new sitemap
is below the size limit. Once you've split up your sitemap, you can use a sitemap index file
as a way to submit many sitemaps at once.

## Sitemap index best practices


The XML format of a sitemap index file is very
similar to the XML format of a sitemap file, and it's defined by the
[Sitemap Protocol](https://www.sitemaps.org/protocol.html#index).
This means that all the sitemap requirements apply to sitemap index files also.


The referenced sitemaps must be hosted on the same site as your sitemap index file. This
requirement is waived if you set up
[cross-site submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#cross-submit).


Sitemaps that are referenced in the sitemap index file must be in the same
directory as the sitemap index file, or lower in the site hierarchy. For example, if the
sitemap index file is at `https://example.com/public/sitemap_index.xml`, it can
only contain sitemaps that are in the same or deeper directory, like
`https://example.com/public/shared/...`.


You can submit up to 500 sitemap index files for each site in your Search Console account.

## Example sitemap index


The following example shows a sitemap index in XML format that lists two sitemaps:

```
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.example.com/sitemap1.xml.gz</loc>
    <lastmod>2024-08-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.example.com/sitemap2.xml.gz</loc>
    <lastmod>2022-06-05</lastmod>
  </sitemap>
</sitemapindex>
```

## Sitemap index reference


The sitemap index tags are defined by the same namespace as generic sitemaps:
[`http://www.sitemaps.org/schemas/sitemap/0.9`](http://www.sitemaps.org/schemas/sitemap/0.9)

To make sure Google can use your sitemap index, you must use the following required tags:

| Required tags ||
|---|---|
| `sitemapindex` | The root tag of the XML tree. It contains all the other tags. |
| `sitemap` | The parent tag for each sitemap listed in the file. It's the only direct child of the `sitemapindex` tag. |
| `loc` | The location (URL) of the sitemap. It's a child of the `sitemap` tag. A sitemap index file may have up to 50,000 `loc` tags. |


Additionally, the following optional tags may help Google schedule your sitemaps for crawling:

| Optional tags ||
|---|---|
| `lastmod` | Identifies the time that the corresponding sitemap file was modified. It can be a child of a `sitemap` tag. The value for the `lastmod` tag must be in [W3C Datetime format](https://www.w3.org/TR/NOTE-datetime). |

## Troubleshooting sitemaps


If you're having trouble with your sitemap, you can investigate the errors with Google Search Console.
See Search Console's
[sitemaps troubleshooting guide](https://support.google.com/webmasters/answer/7451001#errors)
for help.

## Additional resources


Want to learn more? Check out the following resources:

- [Submit your sitemap to Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap)
- [Learn how to combine sitemap extensions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/combine-sitemap-extensions)


# Manage Your Sitemaps With Sitemap Index Files | Google Search Central

# Manage your sitemaps with a sitemap index file


If you have a sitemap that exceeds the
[size limits](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
you'll need to split up your large sitemap into multiple sitemaps such that each new sitemap
is below the size limit. Once you've split up your sitemap, you can use a sitemap index file
as a way to submit many sitemaps at once.

## Sitemap index best practices


The XML format of a sitemap index file is very
similar to the XML format of a sitemap file, and it's defined by the
[Sitemap Protocol](https://www.sitemaps.org/protocol.html#index).
This means that all the sitemap requirements apply to sitemap index files also.


The referenced sitemaps must be hosted on the same site as your sitemap index file. This
requirement is waived if you set up
[cross-site submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#cross-submit).


Sitemaps that are referenced in the sitemap index file must be in the same
directory as the sitemap index file, or lower in the site hierarchy. For example, if the
sitemap index file is at `https://example.com/public/sitemap_index.xml`, it can
only contain sitemaps that are in the same or deeper directory, like
`https://example.com/public/shared/...`.


You can submit up to 500 sitemap index files for each site in your Search Console account.

## Example sitemap index


The following example shows a sitemap index in XML format that lists two sitemaps:

```
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.example.com/sitemap1.xml.gz</loc>
    <lastmod>2024-08-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.example.com/sitemap2.xml.gz</loc>
    <lastmod>2022-06-05</lastmod>
  </sitemap>
</sitemapindex>
```

## Sitemap index reference


The sitemap index tags are defined by the same namespace as generic sitemaps:
[`http://www.sitemaps.org/schemas/sitemap/0.9`](http://www.sitemaps.org/schemas/sitemap/0.9)

To make sure Google can use your sitemap index, you must use the following required tags:

| Required tags ||
|---|---|
| `sitemapindex` | The root tag of the XML tree. It contains all the other tags. |
| `sitemap` | The parent tag for each sitemap listed in the file. It's the only direct child of the `sitemapindex` tag. |
| `loc` | The location (URL) of the sitemap. It's a child of the `sitemap` tag. A sitemap index file may have up to 50,000 `loc` tags. |


Additionally, the following optional tags may help Google schedule your sitemaps for crawling:

| Optional tags ||
|---|---|
| `lastmod` | Identifies the time that the corresponding sitemap file was modified. It can be a child of a `sitemap` tag. The value for the `lastmod` tag must be in [W3C Datetime format](https://www.w3.org/TR/NOTE-datetime). |

## Troubleshooting sitemaps


If you're having trouble with your sitemap, you can investigate the errors with Google Search Console.
See Search Console's
[sitemaps troubleshooting guide](https://support.google.com/webmasters/answer/7451001#errors)
for help.

## Additional resources


Want to learn more? Check out the following resources:

- [Submit your sitemap to Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap)
- [Learn how to combine sitemap extensions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/combine-sitemap-extensions)



# Manage Your Sitemaps With Sitemap Index Files | Google Search Central

# Manage your sitemaps with a sitemap index file


If you have a sitemap that exceeds the
[size limits](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
you'll need to split up your large sitemap into multiple sitemaps such that each new sitemap
is below the size limit. Once you've split up your sitemap, you can use a sitemap index file
as a way to submit many sitemaps at once.

## Sitemap index best practices


The XML format of a sitemap index file is very
similar to the XML format of a sitemap file, and it's defined by the
[Sitemap Protocol](https://www.sitemaps.org/protocol.html#index).
This means that all the sitemap requirements apply to sitemap index files also.


The referenced sitemaps must be hosted on the same site as your sitemap index file. This
requirement is waived if you set up
[cross-site submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#cross-submit).


Sitemaps that are referenced in the sitemap index file must be in the same
directory as the sitemap index file, or lower in the site hierarchy. For example, if the
sitemap index file is at `https://example.com/public/sitemap_index.xml`, it can
only contain sitemaps that are in the same or deeper directory, like
`https://example.com/public/shared/...`.


You can submit up to 500 sitemap index files for each site in your Search Console account.

## Example sitemap index


The following example shows a sitemap index in XML format that lists two sitemaps:

```
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.example.com/sitemap1.xml.gz</loc>
    <lastmod>2024-08-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.example.com/sitemap2.xml.gz</loc>
    <lastmod>2022-06-05</lastmod>
  </sitemap>
</sitemapindex>
```

## Sitemap index reference


The sitemap index tags are defined by the same namespace as generic sitemaps:
[`http://www.sitemaps.org/schemas/sitemap/0.9`](http://www.sitemaps.org/schemas/sitemap/0.9)

To make sure Google can use your sitemap index, you must use the following required tags:

| Required tags ||
|---|---|
| `sitemapindex` | The root tag of the XML tree. It contains all the other tags. |
| `sitemap` | The parent tag for each sitemap listed in the file. It's the only direct child of the `sitemapindex` tag. |
| `loc` | The location (URL) of the sitemap. It's a child of the `sitemap` tag. A sitemap index file may have up to 50,000 `loc` tags. |


Additionally, the following optional tags may help Google schedule your sitemaps for crawling:

| Optional tags ||
|---|---|
| `lastmod` | Identifies the time that the corresponding sitemap file was modified. It can be a child of a `sitemap` tag. The value for the `lastmod` tag must be in [W3C Datetime format](https://www.w3.org/TR/NOTE-datetime). |

## Troubleshooting sitemaps


If you're having trouble with your sitemap, you can investigate the errors with Google Search Console.
See Search Console's
[sitemaps troubleshooting guide](https://support.google.com/webmasters/answer/7451001#errors)
for help.

## Additional resources


Want to learn more? Check out the following resources:

- [Submit your sitemap to Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap)
- [Learn how to combine sitemap extensions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/combine-sitemap-extensions)

# Manage Your Sitemaps With Sitemap Index Files | Google Search Central

# Manage your sitemaps with a sitemap index file


If you have a sitemap that exceeds the
[size limits](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
you'll need to split up your large sitemap into multiple sitemaps such that each new sitemap
is below the size limit. Once you've split up your sitemap, you can use a sitemap index file
as a way to submit many sitemaps at once.

## Sitemap index best practices


The XML format of a sitemap index file is very
similar to the XML format of a sitemap file, and it's defined by the
[Sitemap Protocol](https://www.sitemaps.org/protocol.html#index).
This means that all the sitemap requirements apply to sitemap index files also.


The referenced sitemaps must be hosted on the same site as your sitemap index file. This
requirement is waived if you set up
[cross-site submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#cross-submit).


Sitemaps that are referenced in the sitemap index file must be in the same
directory as the sitemap index file, or lower in the site hierarchy. For example, if the
sitemap index file is at `https://example.com/public/sitemap_index.xml`, it can
only contain sitemaps that are in the same or deeper directory, like
`https://example.com/public/shared/...`.


You can submit up to 500 sitemap index files for each site in your Search Console account.

## Example sitemap index


The following example shows a sitemap index in XML format that lists two sitemaps:

```
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.example.com/sitemap1.xml.gz</loc>
    <lastmod>2024-08-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.example.com/sitemap2.xml.gz</loc>
    <lastmod>2022-06-05</lastmod>
  </sitemap>
</sitemapindex>
```

## Sitemap index reference


The sitemap index tags are defined by the same namespace as generic sitemaps:
[`http://www.sitemaps.org/schemas/sitemap/0.9`](http://www.sitemaps.org/schemas/sitemap/0.9)

To make sure Google can use your sitemap index, you must use the following required tags:

| Required tags ||
|---|---|
| `sitemapindex` | The root tag of the XML tree. It contains all the other tags. |
| `sitemap` | The parent tag for each sitemap listed in the file. It's the only direct child of the `sitemapindex` tag. |
| `loc` | The location (URL) of the sitemap. It's a child of the `sitemap` tag. A sitemap index file may have up to 50,000 `loc` tags. |


Additionally, the following optional tags may help Google schedule your sitemaps for crawling:

| Optional tags ||
|---|---|
| `lastmod` | Identifies the time that the corresponding sitemap file was modified. It can be a child of a `sitemap` tag. The value for the `lastmod` tag must be in [W3C Datetime format](https://www.w3.org/TR/NOTE-datetime). |

## Troubleshooting sitemaps


If you're having trouble with your sitemap, you can investigate the errors with Google Search Console.
See Search Console's
[sitemaps troubleshooting guide](https://support.google.com/webmasters/answer/7451001#errors)
for help.

## Additional resources


Want to learn more? Check out the following resources:

- [Submit your sitemap to Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap)
- [Learn how to combine sitemap extensions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/combine-sitemap-extensions)







#  Ranking and search appearance 

# AI Features and Your Website | Google Search Central

# AI features and your website


This guide covers how AI features like AI Overviews and AI Mode work in Google Search from a site
owner's perspective and how to approach your content's inclusion in these experiences.
The best practices for SEO remain relevant for AI features in Google Search (such as AI Overviews and AI Mode). **There are no additional requirements to appear in AI Overviews or AI Mode,
nor other special optimizations necessary.** That said, it's always good to review the [fundamental SEO best practices](https://developers.google.com/search/docs/essentials).

## How AI features work in Search


As with Search overall, the AI features [AI Overviews](https://support.google.com/websearch/answer/14901683)
and [AI Mode](https://support.google.com/websearch/answer/16011537) surface relevant links to help people find the information they're
looking for quickly and reliably, as well as to help them explore content they may not have
discovered before. These features offer unique opportunities for more types of sites to appear.


**AI Overviews** help people get to the gist of a complicated topic or question more
quickly, and provide a jumping off point to explore links to learn more. They were designed to
show up on queries where they can add additional benefits beyond what people might already get on
Search. With AI Overviews, people have been visiting a greater diversity of websites for help with
more complex questions.


**AI Mode** is particularly helpful for queries where further exploration, reasoning,
or complex comparisons are needed. People can ask nuanced questions that might have previously
taken multiple searches --- from exploring a new concept, to comparing options, and beyond --- and
get a comprehensive AI-powered response with links to supporting websites.
[Video](https://www.youtube.com/watch?v=AnKaUXbwL20)


Both AI Overviews and AI Mode may use a "query fan-out" technique --- issuing multiple related
searches across subtopics and data sources --- to develop a response. While responses are being
generated, our advanced models identify more supporting web pages, allowing us to
**display a wider and more diverse set of helpful links** associated with the
response than with a classic web search, enabling new opportunities for exploration.


AI Mode and AI Overviews may use different models and techniques, so the set of responses and
links they show will vary. AI Overviews are only shown when our systems determine that it is
additive to classic Search, and as such, often don't trigger.

## How to appear in AI features


You can apply the same [foundational SEO best practices](https://developers.google.com/search/docs/essentials) for
AI features as you do for Google Search overall: making sure the page meets the
[technical requirements for Google Search](https://developers.google.com/search/docs/essentials/technical),
following [Search policies](https://support.google.com/websearch/answer/10622781),
and focusing on the [key best practices](https://developers.google.com/search/docs/essentials#key-best-practices),
such as [creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

### Technical requirements for appearing in AI features


To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed
and eligible to be shown in Google Search with a snippet, fulfilling the
[Search technical requirements](https://developers.google.com/search/docs/essentials/technical). There are no
additional technical requirements.
Just because a page meets all requirements, best practices, and complies with the policies, doesn't mean that Google will crawl, index, or serve its content. Indexing and serving isn't guaranteed. Learn more about [How Search Works](https://developers.google.com/search/docs/fundamentals/how-search-works).

### SEO best practices


While specific optimization isn't required for AI Overviews and AI Mode, all existing
[SEO fundamentals](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) continue to be
worthwhile, for example:

- Ensuring that crawling is allowed in robots.txt, and by any CDN or hosting infrastructure
- Making your content easily findable through [internal links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable#internal-links) on your website
- Providing a great [page experience](https://developers.google.com/search/docs/appearance/page-experience) for users
- Making sure that important content is available in textual form
- Supporting your textual content with high-quality [images](https://developers.google.com/search/docs/appearance/google-images) and [videos](https://developers.google.com/search/docs/appearance/video), when applicable
- Making sure your [structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) matches the visible text on the page
- Checking that your [Merchant Center](https://support.google.com/merchants/answer/12159157) and [Business Profile](https://developers.google.com/search/docs/appearance/establish-business-details) information is up-to-date

> [!NOTE]
> You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add.


To discover and diagnose potential technical issues quickly, [verify your site
in Search Console](https://support.google.com/webmasters/answer/9008080).

## Measuring the performance of your site


Just like the rest of the search results page, sites appearing in AI features (such as AI Overviews
and AI Mode) are included in the overall search traffic in
[Search Console](https://search.google.com/search-console/about).
In particular, they're reported on in the [Performance report](https://support.google.com/webmasters/answer/7576553),
within the ["Web" search type](https://support.google.com/webmasters/answer/7576553#by_search_type).
Learn more about how [AI Overviews](https://support.google.com/webmasters/answer/7042828#ai-overviews&zippy=%2Ct%2Cai-overviews)
and [AI Mode](https://support.google.com/webmasters/answer/7042828#ai-mode&zippy=%2Ct%2Cai-mode) are counted
towards the overall data in Search Console, how to
[analyze traffic changes](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops)
overall, and how to [combine Search Console and Analytics data](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console).


In addition to Search Console, you could also track conversions and time spent on your site in
other tools, such as Google Analytics. We've seen that when people click from search results
pages with AI Overviews, these clicks are higher quality (meaning, users are more likely to spend
more time on the site).

## Controlling your content in AI features in Search


AI is built into Search and integral to how Search functions, which is why robots.txt directives
for [Googlebot](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers) is the control
for site owners to manage access to how their sites are crawled for Search. To limit the
information shown from your pages in Search, use [`nosnippet`,
`data-nosnippet`, `max-snippet`](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), or
[`noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing) controls.


To limit AI training and grounding in some of Google's other systems, read more
[about Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended).

### Troubleshooting preview controls


If you implemented [preview controls](https://developers.google.com/search/docs/appearance/snippet#nosnippet) and
you're still seeing your content appear in AI features on Search, try the following steps:

1. Make sure that the preview control is correct and visible to Googlebot. To test if your implementation is correct, use the [URL
   Inspection tool](https://support.google.com/webmasters/answer/9012289) to see the HTML that Googlebot received while crawling the page.
2. Allow time for Google to recrawl and process the change in preview controls. Remember that crawling can take anywhere from several days to several months, depending on how often our systems determine a page needs to be refreshed. If you've made changes, you can [request
   that Google recrawl your pages](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).


If you tried the troubleshooting steps and still find issues, post in the
[Google Search Central Help Community](https://support.google.com/webmasters/thread/227739087).


# AI Features and Your Website | Google Search Central

# AI features and your website


This guide covers how AI features like AI Overviews and AI Mode work in Google Search from a site
owner's perspective and how to approach your content's inclusion in these experiences.
The best practices for SEO remain relevant for AI features in Google Search (such as AI Overviews and AI Mode). **There are no additional requirements to appear in AI Overviews or AI Mode,
nor other special optimizations necessary.** That said, it's always good to review the [fundamental SEO best practices](https://developers.google.com/search/docs/essentials).

## How AI features work in Search


As with Search overall, the AI features [AI Overviews](https://support.google.com/websearch/answer/14901683)
and [AI Mode](https://support.google.com/websearch/answer/16011537) surface relevant links to help people find the information they're
looking for quickly and reliably, as well as to help them explore content they may not have
discovered before. These features offer unique opportunities for more types of sites to appear.


**AI Overviews** help people get to the gist of a complicated topic or question more
quickly, and provide a jumping off point to explore links to learn more. They were designed to
show up on queries where they can add additional benefits beyond what people might already get on
Search. With AI Overviews, people have been visiting a greater diversity of websites for help with
more complex questions.


**AI Mode** is particularly helpful for queries where further exploration, reasoning,
or complex comparisons are needed. People can ask nuanced questions that might have previously
taken multiple searches --- from exploring a new concept, to comparing options, and beyond --- and
get a comprehensive AI-powered response with links to supporting websites.
[Video](https://www.youtube.com/watch?v=AnKaUXbwL20)


Both AI Overviews and AI Mode may use a "query fan-out" technique --- issuing multiple related
searches across subtopics and data sources --- to develop a response. While responses are being
generated, our advanced models identify more supporting web pages, allowing us to
**display a wider and more diverse set of helpful links** associated with the
response than with a classic web search, enabling new opportunities for exploration.


AI Mode and AI Overviews may use different models and techniques, so the set of responses and
links they show will vary. AI Overviews are only shown when our systems determine that it is
additive to classic Search, and as such, often don't trigger.

## How to appear in AI features


You can apply the same [foundational SEO best practices](https://developers.google.com/search/docs/essentials) for
AI features as you do for Google Search overall: making sure the page meets the
[technical requirements for Google Search](https://developers.google.com/search/docs/essentials/technical),
following [Search policies](https://support.google.com/websearch/answer/10622781),
and focusing on the [key best practices](https://developers.google.com/search/docs/essentials#key-best-practices),
such as [creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

### Technical requirements for appearing in AI features


To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed
and eligible to be shown in Google Search with a snippet, fulfilling the
[Search technical requirements](https://developers.google.com/search/docs/essentials/technical). There are no
additional technical requirements.
Just because a page meets all requirements, best practices, and complies with the policies, doesn't mean that Google will crawl, index, or serve its content. Indexing and serving isn't guaranteed. Learn more about [How Search Works](https://developers.google.com/search/docs/fundamentals/how-search-works).

### SEO best practices


While specific optimization isn't required for AI Overviews and AI Mode, all existing
[SEO fundamentals](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) continue to be
worthwhile, for example:

- Ensuring that crawling is allowed in robots.txt, and by any CDN or hosting infrastructure
- Making your content easily findable through [internal links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable#internal-links) on your website
- Providing a great [page experience](https://developers.google.com/search/docs/appearance/page-experience) for users
- Making sure that important content is available in textual form
- Supporting your textual content with high-quality [images](https://developers.google.com/search/docs/appearance/google-images) and [videos](https://developers.google.com/search/docs/appearance/video), when applicable
- Making sure your [structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) matches the visible text on the page
- Checking that your [Merchant Center](https://support.google.com/merchants/answer/12159157) and [Business Profile](https://developers.google.com/search/docs/appearance/establish-business-details) information is up-to-date

> [!NOTE]
> You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add.


To discover and diagnose potential technical issues quickly, [verify your site
in Search Console](https://support.google.com/webmasters/answer/9008080).

## Measuring the performance of your site


Just like the rest of the search results page, sites appearing in AI features (such as AI Overviews
and AI Mode) are included in the overall search traffic in
[Search Console](https://search.google.com/search-console/about).
In particular, they're reported on in the [Performance report](https://support.google.com/webmasters/answer/7576553),
within the ["Web" search type](https://support.google.com/webmasters/answer/7576553#by_search_type).
Learn more about how [AI Overviews](https://support.google.com/webmasters/answer/7042828#ai-overviews&zippy=%2Ct%2Cai-overviews)
and [AI Mode](https://support.google.com/webmasters/answer/7042828#ai-mode&zippy=%2Ct%2Cai-mode) are counted
towards the overall data in Search Console, how to
[analyze traffic changes](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops)
overall, and how to [combine Search Console and Analytics data](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console).


In addition to Search Console, you could also track conversions and time spent on your site in
other tools, such as Google Analytics. We've seen that when people click from search results
pages with AI Overviews, these clicks are higher quality (meaning, users are more likely to spend
more time on the site).

## Controlling your content in AI features in Search


AI is built into Search and integral to how Search functions, which is why robots.txt directives
for [Googlebot](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers) is the control
for site owners to manage access to how their sites are crawled for Search. To limit the
information shown from your pages in Search, use [`nosnippet`,
`data-nosnippet`, `max-snippet`](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), or
[`noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing) controls.


To limit AI training and grounding in some of Google's other systems, read more
[about Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended).

### Troubleshooting preview controls


If you implemented [preview controls](https://developers.google.com/search/docs/appearance/snippet#nosnippet) and
you're still seeing your content appear in AI features on Search, try the following steps:

1. Make sure that the preview control is correct and visible to Googlebot. To test if your implementation is correct, use the [URL
   Inspection tool](https://support.google.com/webmasters/answer/9012289) to see the HTML that Googlebot received while crawling the page.
2. Allow time for Google to recrawl and process the change in preview controls. Remember that crawling can take anywhere from several days to several months, depending on how often our systems determine a page needs to be refreshed. If you've made changes, you can [request
   that Google recrawl your pages](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).


If you tried the troubleshooting steps and still find issues, post in the
[Google Search Central Help Community](https://support.google.com/webmasters/thread/227739087).


# AI Features and Your Website | Google Search Central

# AI features and your website


This guide covers how AI features like AI Overviews and AI Mode work in Google Search from a site
owner's perspective and how to approach your content's inclusion in these experiences.
The best practices for SEO remain relevant for AI features in Google Search (such as AI Overviews and AI Mode). **There are no additional requirements to appear in AI Overviews or AI Mode,
nor other special optimizations necessary.** That said, it's always good to review the [fundamental SEO best practices](https://developers.google.com/search/docs/essentials).

## How AI features work in Search


As with Search overall, the AI features [AI Overviews](https://support.google.com/websearch/answer/14901683)
and [AI Mode](https://support.google.com/websearch/answer/16011537) surface relevant links to help people find the information they're
looking for quickly and reliably, as well as to help them explore content they may not have
discovered before. These features offer unique opportunities for more types of sites to appear.


**AI Overviews** help people get to the gist of a complicated topic or question more
quickly, and provide a jumping off point to explore links to learn more. They were designed to
show up on queries where they can add additional benefits beyond what people might already get on
Search. With AI Overviews, people have been visiting a greater diversity of websites for help with
more complex questions.


**AI Mode** is particularly helpful for queries where further exploration, reasoning,
or complex comparisons are needed. People can ask nuanced questions that might have previously
taken multiple searches --- from exploring a new concept, to comparing options, and beyond --- and
get a comprehensive AI-powered response with links to supporting websites.
[Video](https://www.youtube.com/watch?v=AnKaUXbwL20)


Both AI Overviews and AI Mode may use a "query fan-out" technique --- issuing multiple related
searches across subtopics and data sources --- to develop a response. While responses are being
generated, our advanced models identify more supporting web pages, allowing us to
**display a wider and more diverse set of helpful links** associated with the
response than with a classic web search, enabling new opportunities for exploration.


AI Mode and AI Overviews may use different models and techniques, so the set of responses and
links they show will vary. AI Overviews are only shown when our systems determine that it is
additive to classic Search, and as such, often don't trigger.

## How to appear in AI features


You can apply the same [foundational SEO best practices](https://developers.google.com/search/docs/essentials) for
AI features as you do for Google Search overall: making sure the page meets the
[technical requirements for Google Search](https://developers.google.com/search/docs/essentials/technical),
following [Search policies](https://support.google.com/websearch/answer/10622781),
and focusing on the [key best practices](https://developers.google.com/search/docs/essentials#key-best-practices),
such as [creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

### Technical requirements for appearing in AI features


To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed
and eligible to be shown in Google Search with a snippet, fulfilling the
[Search technical requirements](https://developers.google.com/search/docs/essentials/technical). There are no
additional technical requirements.
Just because a page meets all requirements, best practices, and complies with the policies, doesn't mean that Google will crawl, index, or serve its content. Indexing and serving isn't guaranteed. Learn more about [How Search Works](https://developers.google.com/search/docs/fundamentals/how-search-works).

### SEO best practices


While specific optimization isn't required for AI Overviews and AI Mode, all existing
[SEO fundamentals](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) continue to be
worthwhile, for example:

- Ensuring that crawling is allowed in robots.txt, and by any CDN or hosting infrastructure
- Making your content easily findable through [internal links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable#internal-links) on your website
- Providing a great [page experience](https://developers.google.com/search/docs/appearance/page-experience) for users
- Making sure that important content is available in textual form
- Supporting your textual content with high-quality [images](https://developers.google.com/search/docs/appearance/google-images) and [videos](https://developers.google.com/search/docs/appearance/video), when applicable
- Making sure your [structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) matches the visible text on the page
- Checking that your [Merchant Center](https://support.google.com/merchants/answer/12159157) and [Business Profile](https://developers.google.com/search/docs/appearance/establish-business-details) information is up-to-date

> [!NOTE]
> You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add.


To discover and diagnose potential technical issues quickly, [verify your site
in Search Console](https://support.google.com/webmasters/answer/9008080).

## Measuring the performance of your site


Just like the rest of the search results page, sites appearing in AI features (such as AI Overviews
and AI Mode) are included in the overall search traffic in
[Search Console](https://search.google.com/search-console/about).
In particular, they're reported on in the [Performance report](https://support.google.com/webmasters/answer/7576553),
within the ["Web" search type](https://support.google.com/webmasters/answer/7576553#by_search_type).
Learn more about how [AI Overviews](https://support.google.com/webmasters/answer/7042828#ai-overviews&zippy=%2Ct%2Cai-overviews)
and [AI Mode](https://support.google.com/webmasters/answer/7042828#ai-mode&zippy=%2Ct%2Cai-mode) are counted
towards the overall data in Search Console, how to
[analyze traffic changes](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops)
overall, and how to [combine Search Console and Analytics data](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console).


In addition to Search Console, you could also track conversions and time spent on your site in
other tools, such as Google Analytics. We've seen that when people click from search results
pages with AI Overviews, these clicks are higher quality (meaning, users are more likely to spend
more time on the site).

## Controlling your content in AI features in Search


AI is built into Search and integral to how Search functions, which is why robots.txt directives
for [Googlebot](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers) is the control
for site owners to manage access to how their sites are crawled for Search. To limit the
information shown from your pages in Search, use [`nosnippet`,
`data-nosnippet`, `max-snippet`](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), or
[`noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing) controls.


To limit AI training and grounding in some of Google's other systems, read more
[about Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended).

### Troubleshooting preview controls


If you implemented [preview controls](https://developers.google.com/search/docs/appearance/snippet#nosnippet) and
you're still seeing your content appear in AI features on Search, try the following steps:

1. Make sure that the preview control is correct and visible to Googlebot. To test if your implementation is correct, use the [URL
   Inspection tool](https://support.google.com/webmasters/answer/9012289) to see the HTML that Googlebot received while crawling the page.
2. Allow time for Google to recrawl and process the change in preview controls. Remember that crawling can take anywhere from several days to several months, depending on how often our systems determine a page needs to be refreshed. If you've made changes, you can [request
   that Google recrawl your pages](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).


If you tried the troubleshooting steps and still find issues, post in the
[Google Search Central Help Community](https://support.google.com/webmasters/thread/227739087).


# Featured Snippets and Your Website | Google Search Central

# Featured snippets and your website

Featured snippets are special boxes where the format of a regular search result is reversed, showing
the descriptive [snippet](https://developers.google.com/search/docs/appearance/snippet)
first. They can also appear within a [related questions group](https://developers.google.com/search/docs/appearance/visual-elements-gallery#related-questions-group) (also known as "People Also Ask").
[Read more about how Google's Featured Snippets work.](https://support.google.com/websearch/answer/9351707)
An illustration of a featured snippet in search results 7-10 minutes
[How to make a hard-boiled egg](https://wikipedia.org/wiki/Boiled_egg)

## How can I opt out of featured snippets?

There are two ways that you can opt out of featured snippets:

- [Block both featured and regular search snippets](https://developers.google.com/search/docs/appearance/featured-snippets#block-both)
- [Block featured snippets only](https://developers.google.com/search/docs/appearance/featured-snippets#block-fs)

### Block all snippets

To block all snippets (including featured snippets and regular snippets) from appearing for
a given page, add the [`nosnippet` rule](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nosnippet)
to that page.

- Text marked by the [`data-nosnippet` HTML attribute](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#data-nosnippet-attr) won't appear in featured snippets or regular snippets either.
- If both `nosnippet` and `data-nosnippet` rules appear in a page, `nosnippet` takes priority, and snippets won't be shown for the page.

### Block featured snippets only

If you want to retain snippets in regularly-formatted search results, but you don't want to appear in
featured snippets, experiment with setting the
[`max-snippet` rule](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-snippet)
to lower lengths. Featured snippets will only appear if enough text can be shown to generate a
useful featured snippet.

Keep lowering the value if pages continue to show for featured snippets. In general, the
shorter your `max-snippet` rule setting, the less likely the page
will appear as a featured snippet.

Google does not provide an exact minimum length required to appear as a featured snippet.
This is because the minimum length is variable based on a number of factors, including---but not
limited to---the information in the snippet, the language, and the platform (mobile device, app,
or desktop).
Using a low `max-snippet` setting doesn't guarantee that Google will stop showing featured snippets for your page. If you need a guaranteed solution, use the `nosnippet` rule.

## How can I mark my page as a featured snippet?

You can't. Google systems determine whether a page would make a good featured snippet for a
user's search request, and if so, elevates it.

## What happens when a user clicks a featured snippet?

Clicking a featured snippet takes the user directly to the section of the page that appeared
in the featured snippet. Scrolling to the position that appeared in the snippet happens
automatically, without any additional annotation by the site. If a browser doesn't support the
underlying technology needed, or if our systems can't confidently determine exactly where
within a page to direct a click, clicking a featured snippet will take a user to the top of
the source web page.


# Featured Snippets and Your Website | Google Search Central

# Featured snippets and your website

Featured snippets are special boxes where the format of a regular search result is reversed, showing
the descriptive [snippet](https://developers.google.com/search/docs/appearance/snippet)
first. They can also appear within a [related questions group](https://developers.google.com/search/docs/appearance/visual-elements-gallery#related-questions-group) (also known as "People Also Ask").
[Read more about how Google's Featured Snippets work.](https://support.google.com/websearch/answer/9351707)
An illustration of a featured snippet in search results 7-10 minutes
[How to make a hard-boiled egg](https://wikipedia.org/wiki/Boiled_egg)

## How can I opt out of featured snippets?

There are two ways that you can opt out of featured snippets:

- [Block both featured and regular search snippets](https://developers.google.com/search/docs/appearance/featured-snippets#block-both)
- [Block featured snippets only](https://developers.google.com/search/docs/appearance/featured-snippets#block-fs)

### Block all snippets

To block all snippets (including featured snippets and regular snippets) from appearing for
a given page, add the [`nosnippet` rule](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nosnippet)
to that page.

- Text marked by the [`data-nosnippet` HTML attribute](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#data-nosnippet-attr) won't appear in featured snippets or regular snippets either.
- If both `nosnippet` and `data-nosnippet` rules appear in a page, `nosnippet` takes priority, and snippets won't be shown for the page.

### Block featured snippets only

If you want to retain snippets in regularly-formatted search results, but you don't want to appear in
featured snippets, experiment with setting the
[`max-snippet` rule](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-snippet)
to lower lengths. Featured snippets will only appear if enough text can be shown to generate a
useful featured snippet.

Keep lowering the value if pages continue to show for featured snippets. In general, the
shorter your `max-snippet` rule setting, the less likely the page
will appear as a featured snippet.

Google does not provide an exact minimum length required to appear as a featured snippet.
This is because the minimum length is variable based on a number of factors, including---but not
limited to---the information in the snippet, the language, and the platform (mobile device, app,
or desktop).
Using a low `max-snippet` setting doesn't guarantee that Google will stop showing featured snippets for your page. If you need a guaranteed solution, use the `nosnippet` rule.

## How can I mark my page as a featured snippet?

You can't. Google systems determine whether a page would make a good featured snippet for a
user's search request, and if so, elevates it.

## What happens when a user clicks a featured snippet?

Clicking a featured snippet takes the user directly to the section of the page that appeared
in the featured snippet. Scrolling to the position that appeared in the snippet happens
automatically, without any additional annotation by the site. If a browser doesn't support the
underlying technology needed, or if our systems can't confidently determine exactly where
within a page to direct a click, clicking a featured snippet will take a user to the top of
the source web page.


# Featured Snippets and Your Website | Google Search Central

# Featured snippets and your website

Featured snippets are special boxes where the format of a regular search result is reversed, showing
the descriptive [snippet](https://developers.google.com/search/docs/appearance/snippet)
first. They can also appear within a [related questions group](https://developers.google.com/search/docs/appearance/visual-elements-gallery#related-questions-group) (also known as "People Also Ask").
[Read more about how Google's Featured Snippets work.](https://support.google.com/websearch/answer/9351707)
An illustration of a featured snippet in search results 7-10 minutes
[How to make a hard-boiled egg](https://wikipedia.org/wiki/Boiled_egg)

## How can I opt out of featured snippets?

There are two ways that you can opt out of featured snippets:

- [Block both featured and regular search snippets](https://developers.google.com/search/docs/appearance/featured-snippets#block-both)
- [Block featured snippets only](https://developers.google.com/search/docs/appearance/featured-snippets#block-fs)

### Block all snippets

To block all snippets (including featured snippets and regular snippets) from appearing for
a given page, add the [`nosnippet` rule](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#nosnippet)
to that page.

- Text marked by the [`data-nosnippet` HTML attribute](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#data-nosnippet-attr) won't appear in featured snippets or regular snippets either.
- If both `nosnippet` and `data-nosnippet` rules appear in a page, `nosnippet` takes priority, and snippets won't be shown for the page.

### Block featured snippets only

If you want to retain snippets in regularly-formatted search results, but you don't want to appear in
featured snippets, experiment with setting the
[`max-snippet` rule](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#max-snippet)
to lower lengths. Featured snippets will only appear if enough text can be shown to generate a
useful featured snippet.

Keep lowering the value if pages continue to show for featured snippets. In general, the
shorter your `max-snippet` rule setting, the less likely the page
will appear as a featured snippet.

Google does not provide an exact minimum length required to appear as a featured snippet.
This is because the minimum length is variable based on a number of factors, including---but not
limited to---the information in the snippet, the language, and the platform (mobile device, app,
or desktop).
Using a low `max-snippet` setting doesn't guarantee that Google will stop showing featured snippets for your page. If you need a guaranteed solution, use the `nosnippet` rule.

## How can I mark my page as a featured snippet?

You can't. Google systems determine whether a page would make a good featured snippet for a
user's search request, and if so, elevates it.

## What happens when a user clicks a featured snippet?

Clicking a featured snippet takes the user directly to the section of the page that appeared
in the featured snippet. Scrolling to the position that appeared in the snippet happens
automatically, without any additional annotation by the site. If a browser doesn't support the
underlying technology needed, or if our systems can't confidently determine exactly where
within a page to direct a click, clicking a featured snippet will take a user to the top of
the source web page.


# Image SEO Best Practices | Google Search Central

# Google image SEO best practices


Google provides several Search features and products that help users visually discover information
on the web, such as the
[text result images](https://developers.google.com/search/docs/appearance/visual-elements-gallery#text-result-image),
Google Discover,
and Google Images. While each feature and product looks different, the general recommendations
for getting images to appear in them is the same.
![An illustration that shows images in Google search results, the images tab, and Discover](https://developers.google.com/static/search/docs/images/images-on-google.png)


You can optimize your images to appear in Google's search results by following these best
practices:

1. [Help us discover and index your images](https://developers.google.com/search/docs/appearance/google-images#discover-images)
2. [Optimize the image landing pages](https://developers.google.com/search/docs/appearance/google-images#optimize-landing-page)

## Help us discover and index your images

[Video](https://www.youtube.com/watch?v=SfC27XgelgE)


The [technical requirements](https://developers.google.com/search/docs/essentials/technical) for getting your
content in Google's search results applies to images too. Since images are a substantially
different format compared to HTML, it means there are additional requirements for getting images
indexed; for example, finding the images on your site is different, and the presentation of the
images also influences whether an image is indexed at all, and for the right keywords.

### Use HTML image elements to embed images


Using standard HTML image elements helps crawlers find and process images. Google can find images
in `src` attribute of `<img>` element (even when it's a child of other elements,
such as the `<picture>` element). Google doesn't index CSS images.


**Good:**
> \<img src="puppy.jpg" alt="A golden retriever puppy" /\>


**Bad:**
> \<div style="background-image:url(puppy.jpg)"\>A golden retriever puppy\</div\>

### Use an image sitemap


You can provide the URL of images we might not have otherwise discovered by
[submitting an image sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps).


Unlike regular sitemaps, you can include URLs from other domains in the
`<image:loc>` elements of the image sitemaps. This lets you use CDNs (content
delivery networks) to host images. If you're using a CDN, we encourage you to
[verify ownership](https://support.google.com/webmasters/answer/9008080)
of the CDN's domain name in Search Console so that we can inform you of any crawl errors that we
may find.

### Responsive images


Designing responsive web pages leads to better user experience, since people can access them
across a plethora of device types. Refer to our
[guide to responsive images](https://web.dev/articles/responsive-images)
to learn about the best practices for handling images on your website.


Web pages use the `<picture>` element or the `srcset` attribute of an
`img` element to specify responsive images. However, some browsers and crawlers don't
understand these attributes. We recommend that you always specify a fallback URL using the
`src` attribute.


The `srcset` attribute allows specifying different versions of the same image,
specifically for different screen sizes. For example:

```
<img
  srcset="maine-coon-nap-320w.jpg 320w, maine-coon-nap-480w.jpg 480w, maine-coon-nap-800w.jpg 800w"
  sizes="(max-width: 320px) 280px, (max-width: 480px) 440px, 800px"
  src="maine-coon-nap-800w.jpg"
  alt="A watercolor illustration of a maine coon napping leisurely in front of a fireplace">
```


The `<picture>` element is a container that is used to group different
`<source>` versions of the same image. It offers a fallback approach so the
browser can choose the right image depending on device capabilities, like pixel density and screen
size. The `picture` element also comes in handy for using new image formats with
built-in graceful degradation for clients that may not yet support the new formats.


Per
[section 4.8.1 of the HTML Standard](https://html.spec.whatwg.org/multipage/embedded-content.html#the-picture-element),
make sure that you provide an `img` element as a fallback with a `src`
attribute when using the `picture` element using the following format:

```
<picture>
  <source type="image/svg+xml" srcset="pyramid.svg">
  <source type="image/webp" srcset="pyramid.webp">
  <img src="pyramid.png" alt="An 1800s oil painting of The Great Pyramid">
</picture>
```

### Use supported image formats


Google Search supports images referenced in the `src` attribute of `img` in
the following file formats:
BMP, GIF, JPEG, PNG, WebP, SVG, and AVIF. It's also a good idea to have the
extension of your filename match with the file type.


You can also inline images as Data URIs. Data URIs provide a way to include a file, such as an
image, inline by setting the `src` attribute of an `img` element as a
Base64-encoded string using the following format:

```
<img src="data:image/svg+xml;base64,[*data*]">
```


While inlining images can reduce HTTP requests, carefully judge when to use them since it can
considerably increase the size of the page. For more on this, refer to the
[section on the advantage and disadvantages of inlining images on our web.dev page](https://web.dev/articles/responsive-images#inlining_pros_cons).

### Optimize for speed and quality

[Video](https://www.youtube.com/watch?v=_6Tz_-3_4ok)


High-quality photos appeal to users more than blurry, unclear images. Also, sharp images are more
appealing to users in the result thumbnail and can increase the likelihood of getting traffic from
users. That said, images are often the largest contributor to overall page size, which can make
pages slow and expensive to load. Make sure to apply the
[latest image optimization](https://web.dev/fast#optimize-your-images)
and [responsive image techniques](https://web.dev/learn/design)
to provide a high quality and fast user experience.


Analyze your site speed with
[PageSpeed Insights](https://pagespeed.web.dev/)
and visit our
[Why does speed matter?](https://web.dev/learn/performance/why-speed-matters)
to learn about best practices and techniques to improve website performance.

## Optimize the image landing pages


While not immediately obvious, the content and metadata of the pages where an image is embedded
can have a great influence on how and where the image may appear in Google's search results.

### Specify a preferred image with metadata


Google's selection of an image preview is completely automated and takes into account a number
of different sources to select which image on a given page is shown on Google (for example, a
[text result image](https://developers.google.com/search/docs/appearance/visual-elements-gallery#text-result-image)
or the preview image in Discover).


You can influence which image gets selected by providing your preferred image through one of the
following metadata sources:

- Specify the schema.org [`primaryImageOfPage`](https://schema.org/primaryImageOfPage) property with a `URL` or `ImageObject`.

  ```
  <script type="application/ld+json">{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": "https://example.com/url",
    "primaryImageOfPage": "https://example.com/images/cat.png"
  }</script>
  ```

  Or specify an image `URL` or `ImageObject` property and attach it to the main entity (using the
  schema.org [`mainEntity`](https://schema.org/mainEntity)
  or [`mainEntityOfPage`](https://schema.org/mainEntityOfPage) properties):

  ```
  <script type="application/ld+json">{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": "https://example.com/url",
    "image": "https://example.com/images/cat.png"
  }</script>
  ```
- Specify the [`og:image`](https://ogp.me/) `meta` tag.

  ```
  <meta property="og:image" content="https://example.com/images/cat.png">
  ```


When choosing your preferred image for use in schema.org markup or the
`og:image` `meta` tag, follow these best practices:

- Choose an image that's relevant and representative of the page.
- Avoid using a generic image (for example, your site logo) or an image with text in the schema.org markup or `og:image` `meta` tag.
- Avoid using an image with an extreme aspect ratio (such as images that are too narrow or overly wide).
- Use a high resolution, if possible.

### Check your page title and description


Google Search automatically generates a title link and snippet to best explain each result and
how it relates to the user query. This helps users decide whether or not to click a result.
Here are two examples how the title links and snippet might look like on a Google Search results
page:
![An illustration that shows titles and descriptions in image search results](https://developers.google.com/static/search/docs/images/titles-descriptions-in-image-results.png)


We use a number of different sources for this information, including information in the
`title` and `meta` tags for each page.


You can help us improve the quality of the title link and snippet displayed for your pages by
following Google's [title](https://developers.google.com/search/docs/appearance/title-link) and
[snippet](https://developers.google.com/search/docs/appearance/snippet) guidelines.

### Add structured data


If you include structured data, Google can display your images in certain
[rich results](https://developers.google.com/search/docs/appearance/structured-data/search-gallery), including a
[prominent badge](https://developers.google.com/search/blog/2017/08/badges-on-image-search-help-users-find) in
Google Images, which give users relevant information about your page and can drive better targeted
traffic to your site.


Follow the [general structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
as well as any guidelines specific to your structured data type; otherwise your structured data
might be ineligible for rich result display in Google Images. In each of these structured data
types, the image attribute is a required field to be eligible for a badge and rich result in Google
Images. Here are two examples how rich results might look like on Google Images:
![An illustration that shows how rich results can appear in Google Images](https://developers.google.com/static/search/docs/images/structured-data-in-image-results.png)

### Use descriptive filenames, titles, and alt text


Google extracts information about the subject matter of the image from the content of the
page, including captions and image titles. Wherever possible, make sure images are placed near
relevant text and on pages that are relevant to the image subject matter.


Likewise, the filename can give Google very light clues about the subject matter of the image.
When possible, use filenames that are short, but descriptive. For example,
`my-new-black-kitten.jpg` is better than `IMG00023.JPG`. Avoid using generic
filenames like `image1.jpg`, `pic.gif`, `1.jpg` when possible.
If your site has thousands of images, you might want to consider automating the naming of the
images. If you localize your images, remember to also translate the filenames, keeping in mind the
[URL encoding guidelines](https://developers.google.com/search/docs/crawling-indexing/url-structure) if you're using
non-latin or special characters.
[Video](https://www.youtube.com/watch?v=3NbuDpB_BTc)


The most important attribute when it comes to providing more metadata for an image is the alt text
(text that describes an image), which also improves accessibility for people who can't see images
on web pages, including users who use screen readers or have low-bandwidth connections.


Google uses alt text along with computer vision algorithms and the contents of the page to
understand the subject matter of the image. Also, alt text in images is useful as anchor text if
you decide to use an image as a link.


When writing alt text, focus on creating useful, information-rich content that uses keywords
appropriately and is in context of the content of the page. Avoid filling `alt`
attributes with keywords (also known as
[keyword stuffing](https://developers.google.com/search/docs/essentials/spam-policies#keyword-stuffing))
as it results in a negative user experience and may cause your site to be seen as spam.


**Bad (missing alt text)**:
> \<img src="puppy.jpg"/\>


**Bad (keyword stuffing)**:
> \<img src="puppy.jpg" alt="puppy dog baby dog pup pups puppies doggies pups litter puppies dog retriever labrador wolfhound setter pointer puppy jack russell terrier puppies dog food cheap dogfood puppy food"/\>


**Better**:
> \<img src="puppy.jpg" alt="puppy"/\>


**Best**:
> \<img src="puppy.jpg" alt="Dalmatian puppy playing fetch"/\>


Also consider the accessibility of your alt text, per
[W3 guidelines](https://www.w3.org/WAI/tutorials/images/).
For the `<img>` element, you can add the `alt` attribute of the
element, while for inline `<svg>` elements, you can use the
`<title>` element. For example:

```
<svg aria-labelledby="svgtitle1">
  <title id="svgtitle1">Googlebot wearing an apron and chef hat, struggling to make pancakes on the stovetop</title>
</svg>
```


We recommend testing your content by
[auditing for accessibility](https://developer.chrome.com/docs/devtools/accessibility/reference)
and
[using a slow network connection emulator](https://developer.chrome.com/docs/devtools/network/reference#throttling).


If an image is referenced on multiple pages within a larger website, consider the
[site's overall crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget).
In particular, consistently reference the image with the same URL, so that Google can
cache and reuse the image without needing to request it multiple times.

## Opt out of Google Images inline linking


If you choose, you can prevent the full-sized image from appearing in the Google Images search
results page by opting out of inline linking in Google Images search results.
**To opt out of inline linking:**

1. When your image is requested, examine the [HTTP referrer header](https://en.wikipedia.org/wiki/HTTP_referer) in the request.
2. If the request is coming from a Google domain, reply with a `200` HTTP status code, or a `204` HTTP status code and no content.


Google will still crawl your page and see the image, but will display a thumbnail image generated
at crawl time in search results. This opt-out is possible at any time, and doesn't require
re-processing of a website's images. This behavior isn't considered image
[cloaking](https://developers.google.com/search/docs/essentials/spam-policies#cloaking) and won't result in manual
actions.


Alternatively, you can
[prevent the image from appearing in search results entirely.](https://developers.google.com/search/docs/crawling-indexing/prevent-images-on-your-page)

## Optimize for SafeSearch


SafeSearch is a setting in Google user accounts that specifies whether to show, blur, or block
explicit images, videos, and websites in Google Search results. Make sure Google understands the
nature of your site so that Google can apply SafeSearch filters to your site if appropriate.
[Learn more about labeling pages for SafeSearch](https://developers.google.com/search/docs/crawling-indexing/safesearch).