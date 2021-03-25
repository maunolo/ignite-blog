import { GetStaticProps } from 'next';

import Link from 'next/link';

import Prismic from '@prismicio/client';

import { useState } from 'react';
import styles from './home.module.scss';
import { getPrismicClient } from '../services/prismic';
import { Loader } from '../components/Loader';
import { PostInfo } from '../components/PostInfo';

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
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [next_page, setNextPage] = useState<string>(postsPagination.next_page);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function loadMorePosts(): Promise<void> {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    fetch(next_page)
      .then(response => response.json())
      .then(data => {
        setPosts([...posts, ...data.results]);
        setNextPage(data.next_page);
        setIsLoading(false);
      });
  }

  return (
    <div className={styles.container}>
      <header className={styles.heading}>
        <img src="/logo.svg" alt="logo" />
      </header>
      <main className={styles.posts}>
        {posts?.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <PostInfo
                date={post.first_publication_date}
                author={post.data.author}
              />
            </a>
          </Link>
        ))}
      </main>
      {next_page && (
        <div className={styles.loadMorePosts}>
          <button type="button" onClick={loadMorePosts}>
            Carregar mais posts
          </button>
          <Loader isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 20,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
    },
    revalidate: 60 * 60 * 12, // 12 hours
  };
};
