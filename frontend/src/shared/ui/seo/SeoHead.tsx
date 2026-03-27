import React from 'react';
import { Helmet } from 'react-helmet-async';
import { seoConfig } from '@/shared/config/seo.config';

export interface SeoHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  canonicalPath?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
  article?: {
    publishedTime: string;
    modifiedTime: string;
    author: string;
    tags?: string[];
  };
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  ogImage,
  ogType = 'website',
  canonicalPath,
  noindex = false,
  jsonLd,
  article,
}) => {
  const fullTitle =
    title && title.trim() !== ''
      ? `${title} | ${seoConfig.siteName}`
      : seoConfig.defaultTitle;
  const metaDescription = description ?? seoConfig.defaultDescription;
  const ogImageUrl = ogImage ?? seoConfig.defaultOgImage;
  const canonicalUrl = canonicalPath
    ? `${seoConfig.siteUrl}${canonicalPath}`
    : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:author" content={article.author} />
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {jsonLd != null && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
