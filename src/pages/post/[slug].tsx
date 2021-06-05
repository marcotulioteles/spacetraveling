import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';
import Prismic from "@prismicio/client"

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { formatDate } from '..';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const words_amount = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);

    words.map(word =>  (total += word))

    return total
  }, 0)
  
  const readTime = Math.ceil(words_amount / 200);

  const router = useRouter();

  if(post == undefined || router.isFallback) {
    return <>
      <div className={styles.container}>
        <h1>Carregando...</h1>
      </div>
    </>
  }

  return (
    <>
      <Head>
        <title>{`${post.data.title} | spacetraveling`}</title>
      </Head>

      <img
        src={post.data.banner.url}
        alt="banner"
        className={styles.banner}
      />

      <main className={styles.container}>
        <div className={styles.titles}>
          <h1>{post.data.title}</h1>
          <div className={styles.titles_data}>
            <div><FiCalendar /><span>{formatDate(post.first_publication_date)}</span></div>
            <div><FiUser /><span>{post.data.author}</span></div>
            <div><FiClock /><span>{`${readTime} min`}</span></div>
          </div>
        </div>
        {post.data.content.map(content => {
          return (
            <article key={content.heading}>
              <div className={styles.articleContent}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
                />
              </div>
            </article>
          )
        })}
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at("document.type", "posts"),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID("posts", String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body]
        }
      })
    },
  };

  return {
    props: {
      post
    }
  };
};
