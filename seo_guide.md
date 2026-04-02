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