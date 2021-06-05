import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from "@prismicio/client";
import Link from "next/link"
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Head from "next/head";
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export function formatDate(date) {
  const newDate = format(new Date(date), "dd MMM yyyy", { locale: ptBR })
  
  return newDate
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: formatDate(post.first_publication_date),
    }
  })
  
  const [posts, setPosts] = useState<Post[]>(formattedPost)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [currentPage, setCurrentPage] = useState(1)

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null ) {
      return;
    }

    const postsResults = await fetch(`${nextPage}`).then(response => response.json())

    setNextPage(postsResults.next_page)
    setCurrentPage(postsResults.page)

    const newPosts = postsResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: formatDate(post.first_publication_date),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })
    setPosts([...posts, ...newPosts])
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.contentContainer}>
        <section>
          {posts.map(post =>(
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <div className={styles.postPaginationContainer}>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.postDateAndAuthor}>
                    <div><FiCalendar /><span>{post.first_publication_date}</span></div>
                    <div><FiUser /><span>{post.data.author}</span></div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </section>
        {nextPage && (
          <div className={styles.buttonContainer}>
            <button type="button" onClick={handleNextPage}>Carregar mais posts</button>
          </div>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination,
    }
  }

};
