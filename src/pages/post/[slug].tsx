import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { v5 as uuidv5 } from 'uuid';

import Prismic from '@prismicio/client';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import styles from './post.module.scss';
import { PostInfo } from '../../components/PostInfo';

interface PostContent {
  heading: string;
  body: {
    text: string;
  }[];
  htmlBody?: string;
}
interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: PostContent[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  const timeToRead = '4 min';

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Ignite Blog</title>
      </Head>
      <Header />
      <div className={styles.postBanner}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>
      <main className={styles.postContent}>
        <h1>{post.data.title}</h1>
        <PostInfo
          date={post.first_publication_date}
          author={post.data.author}
          timeToRead={timeToRead}
        />
        {post.data.content.map(section => {
          return (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {/* <div dangerouslySetInnerHTML={{ __html: section.htmlBody }} /> */}
              {section.body.map(paragraph => (
                <p key={`${uuidv5(paragraph.text, uuidv5.URL)}`}>
                  {paragraph.text}
                </p>
              ))}
            </section>
          );
        })}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const reponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 20,
    }
  );

  return {
    paths: reponse.results.map(post => ({ params: { slug: post.uid } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'post',
    String(context.params.slug),
    {}
  );

  const post = {
    ...response,
    data: {
      ...response.data,
      content: response.data.content.map((section: PostContent) => ({
        ...section,
        // htmlBody: RichText.asHtml(section.body),
      })),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 12, // 12 hours
  };
};
