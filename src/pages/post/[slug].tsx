/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';

import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';
import { PostInfo } from '../../components/PostInfo';
import { Comments } from '../../components/Comments';

interface PostContent {
  heading: string;
  body: {
    text: string;
  }[];
  htmlBody?: string;
}

interface Post {
  uid?: string;
  first_publication_date: string | null;
  last_publication_date?: string | null;
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
  nextPost?: Post | null;
  prevPost?: Post | null;
  preview?: boolean;
}

export default function Post({
  post,
  nextPost,
  prevPost,
  preview,
}: PostProps): JSX.Element {
  const router = useRouter();
  const allPostText = post.data.content
    .map(content => {
      return content.body.map(body => body.text).join(' ');
    })
    .join(' ');
  const wordsCount = allPostText.split(' ').length;

  const timeToRead = `${Math.ceil(wordsCount / 200)} min`;

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
      <main className={`${styles.postContent} ${commonStyles.container}`}>
        <h1>{post.data.title}</h1>
        <PostInfo
          publicationDate={post.first_publication_date}
          author={post.data.author}
          timeToRead={timeToRead}
          lastUpdateDate={post.last_publication_date}
        />
        {post.data.content.map(section => {
          const htmlBody = RichText.asHtml(section.body);

          return (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
            </section>
          );
        })}
        <hr />
        <nav>
          {prevPost && (
            <div className={styles.prevPost}>
              <h2>{prevPost.data.title}</h2>
              <Link href={`/post/${prevPost.uid}`}>
                <a>Post anterior</a>
              </Link>
            </div>
          )}

          {nextPost && (
            <div className={styles.nextPost}>
              <h2>{nextPost.data.title}</h2>
              <Link href={`/post/${nextPost.uid}`}>
                <a>Próximo post</a>
              </Link>
            </div>
          )}
        </nav>
        <Comments />
        {preview && (
          <aside className={commonStyles.exitPreview}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
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
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('post', String(params.slug), {
    ref: previewData?.ref ?? null,
  });

  const prevPost =
    (
      await prismic.query([Prismic.predicates.at('document.type', 'post')], {
        fetch: ['post.title'],
        pageSize: 1,
        after: post.id,
        orderings: '[document.first_publication_date]',
      })
    ).results[0] || null;

  const nextPost =
    (
      await prismic.query([Prismic.predicates.at('document.type', 'post')], {
        fetch: ['post.title'],
        pageSize: 1,
        after: post.id,
        orderings: '[document.first_publication_date desc]',
      })
    ).results[0] || null;

  return {
    props: {
      post,
      nextPost,
      prevPost,
      preview,
    },
    revalidate: 60 * 60 * 12, // 12 hours
  };
};
