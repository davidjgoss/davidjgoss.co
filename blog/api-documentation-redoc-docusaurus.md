---
date: 2020-11-23
title: Richer API documentation with Redoc and Docusaurus
summary:
  I’ve been focusing a lot on APIs this year, and it's been a lot of fun. With documentation being really important for an audience of developers, I've been using Redoc to document the API itself and building a full site around it with Docusaurus.
latest:
  richer API documentation
---

I’ve been focusing a lot on APIs this year. It’s been fun in lots of ways, but the aspect I’ve found most interesting compared to UI work is the different target audience - developers rather than end users - and the consequent shift in what defines a good experience. Unlike with end users, where we want everything to be natural and intuitive, documentation is really important for an audience of developers.

If you’re working on a REST API, chances are it’s somehow expressed as an [OpenAPI](https://www.openapis.org/) spec (whether you write it as one and generate code, or vice versa, is a good topic for another day). If you’ve put some effort into the descriptions, you can produce a pretty good API reference for not much effort.

The best-known tool for this is [Swagger UI](https://github.com/swagger-api/swagger-ui). But lately I’ve switched to using [Redoc](https://github.com/Redocly/redoc), and to me it feels like a real step up. On a practical level, it’s responsive and makes smart use of the space in a wider viewport. It also has a clearer presentation of schema objects, particularly with `oneOf` (where a field can be one of several different shapes). It’s aesthetically just a bit nicer too.

(image?)

That’s only half the story though. For an API reference to be useful to a developer, they probably need to know what to look for and why. What are the principles and conventions in play here? What do all these terms mean? What sequence of requests will I need to get this thing done? Where is this platform headed? If the answers to these questions are there, you could avoid a lot of repetitive support.

Whilst the OpenAPI specification format does have some affordance for high-level descriptive content - and it can be Markdown - I don’t think it’s enough for the kind of structured, in-depth documentation that’s needed for a good developer experience. In other words, we don’t just want a page, we want a site.

## Docusaurus
One of the neat things about Redoc (and Swagger UI for that matter) is that it’s built as a [React](https://reactjs.org/) component. If you just use it to generate a standalone page, you wouldn’t need to know or care about that. But if you want to make your API reference part of something bigger, React opens a lot of doors.

Currently, there are a lot of site frameworks built on top of React. I mean, [really a lot](https://jamstack.org/generators/). Of the popular ones, I’ve experimented quite a bit with [Gatsby](https://www.gatsbyjs.com/) and [Next.js](https://nextjs.org/) - both are impressively powerful, and it feels like you could use them to build just about anything for the web.

[Docusaurus](https://v2.docusaurus.io) (from Facebook) is a bit different, in that it’s much more focused on content in general, and - as the name suggests - documentation in particular. I’ve been using Docusaurus 2 on [some projects](https://liquibase-linter.dev) recently, and whilst it’s officially still in Alpha, it seems pretty stable to me (although that might be because I’m not doing versioning or internationalisation just yet).

Docusaurus has the usual kind of theme and plugin architecture so that, if you want, you can fully control all aspects of the output. But the “classic” preset provides really good typographic and layout styles that make the content look clean and highly readable, via the [Infima CSS framework](https://facebookincubator.github.io/infima/). Every Docusaurus site I’ve seen so far has kept and built on the classic styling, which I think is a sign that they’ve got the balance right.

The content itself is of course written in Markdown, bolstered with [documentation-focused extras](https://v2.docusaurus.io/docs/markdown-features) like callouts, syntax highlighting, and MDX. If you’re new to [MDX](https://mdxjs.com), it’s basically Markdown but with support for inline JSX (and therefore React components). My first reaction on seeing it was something like “we have now reached peak JavaScript”, but it’s great for things like this because you can mix rich interactive components (e.g. flowcharts, live code samples) into your content without throwing out the simplicity of Markdown and alienating content authors who don’t happen to be JavaScript developers.

I’ve put up a [simple example repo](https://github.com/davidjgoss/docusaurus-redoc-example) showing Redoc in action on a Docusaurus site. You can work through the individual commits to get a good step-by-step of what’s needed, but essentially it’s this:

1. Initialise a Docusaurus project
2. Make your OpenAPI spec available to your project
3. Add it as a custom field in your `docusaurus.config.js`
4. Install Redoc and its peer dependencies
5. Add a new page (with a navbar link) and include the `RedocStandalone` component

The React code for your page could look something like:

```jsx
import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {RedocStandalone} from 'redoc';

export default function ApiReference() {
    const {siteConfig} = useDocusaurusContext();
    const options = {
        scrollYOffset: '.navbar', // makes the fixed sidebar and scrolling play nicey with docusaurus navbar
        theme: {
            sidebar: {
                width: '300px' // about the same as the sidebar in the docs area, for consistency
            }
        }
    };
    return (
        <Layout>
            <main>
                <RedocStandalone spec={siteConfig.customFields.apiSpec} options={options}/>
            </main>
        </Layout>
    );
}
```

### Theming

The `theme` option supports a lot of customisation of typography and other styling. Since Infima [uses CSS custom properties](https://v2.docusaurus.io/docs/styling-layout#styling-your-site-with-infima) to drive its own customisation, you can reuse many of those properties to theme Redoc as well, like this (some other stuff is omitted for brevity):

```jsx
const options = {
    theme: {
        typography: {
            fontSize: 'var(--ifm-font-size-base)',
            lineHeight: 'var(--ifm-line-height-base)',
            fontFamily: 'var(--ifm-font-family-base)',
            headings: {
                fontFamily: 'var(--ifm-font-family-base)',
                fontWeight: 'var(--ifm-heading-font-weight)'
            },
            code: {
                lineHeight: 'var(--ifm-pre-line-height)',
                fontFamily: 'var(--ifm-font-family-monospace)'
            }
        }
    }
};
<RedocStandalone options={options}/>
```

Unfortunately if you try to do that with most of the supported properties under `colors` you’ll hit an error, since Redoc does some processing to generate light/dark variants etc and expects the values you give it to be parseable as HEX or RGB. I think this could be addressed though.

### Links

Since Redoc supports hash links for operations and tags, you can link straight to relevant bits of your API reference from their context in your documentation content:

```markdown
See the docs for [creating a quote](/api-reference#operation/create-quote).
```

You could potentially add a `<LinkToOperation>` React component to abstract this, if you want.

### Distribution

Docusaurus builds your site as a set of static HTML, CSS and JavaScript files which you can then deploy with Netlify, GitHub pages or whatever your thing is.

It’s worth noting that Redoc has [a neat CLI](https://github.com/Redocly/redoc/tree/master/cli) that allows you to generate zero-dependency HTML file from your API spec. This portability could be useful if your API isn’t public and circulation of your documentation is controlled. However, once you start building a site around it, this sadly isn’t an option any more. Besides the fact you now have multiple pages, most site frameworks (including Docusaurus) are pretty opinionated in expecting your site to be served from a web server, at a [known path](https://github.com/gatsbyjs/gatsby/discussions/14161). That’s today, anyway; the new [Web Bundles API](https://web.dev/web-bundles/) looks like it might solve this problem eventually.
