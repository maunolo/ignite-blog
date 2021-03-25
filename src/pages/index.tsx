import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import styles from './home.module.scss';
import { getPrismicClient } from '../services/prismic';
import { Loader } from '../components/Loader';

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
        <img src="/logo.svg" alt="spacetraveling" />
      </header>
      <main className={styles.posts}>
        {posts?.map(post => (
          <a key={post.uid} href={`/posts/${post.uid}`}>
            <h1>{post.data.title}</h1>
            <p>{post.data.subtitle}</p>
            <div className={styles.postInfo}>
              <FiCalendar />
              <time>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
          </a>
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
