import { GetStaticProps } from 'next';
import Head from 'next/head'
import { LoadPost } from '../components/LoadPost';
import { FiCalendar,FiUser } from "react-icons/fi";

import Link from 'next/link'


import { format} from 'date-fns'
import Prismic from '@prismicio/client';


import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import Header from '../components/Header';



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

interface NextPageProps{
  next_page:string;
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}:HomeProps) {

  const [Posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPagePost,setNextPagePost] = useState(postsPagination.next_page)

  async function nextPage(){

    const posts = [...Posts]

    const result = await fetch(`${nextPagePost}`).then(post => post.json())

    result.results.map(post => {
      return posts.push({
        uid:post.uid,
        first_publication_date: post.first_publication_date,
        data:{
          subtitle:post.data.subtitle,
          author:post.data.author,
          title:post.data.title
        }
      })
    })

    setPosts(posts)  
    setNextPagePost(result.next_page)

  }

  return(
    <>
      <Head>
        <title>Home</title> 
      </Head>
      <Header/>

      <main className={styles.content}>
        {Posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <div className={styles.post}>
                <h1 className={styles.header_title}>{post.data.title}</h1>
                <p className={styles.header_subtitle}>{post.data.subtitle}</p>
                <div className={styles.post_details}>
                  <span className={styles.details_date}><FiCalendar/> {format(new Date(post.first_publication_date), "dd MMM yyyy", { locale:ptBR})}</span>
                  <span className={styles.details_user}><FiUser/> {post.data.author}</span>
                </div>

              </div>
            </a>
          </Link>
        ))}
        {nextPagePost && <LoadPost nextPage={nextPage}/>}
      </main>
    </>
    
  )
}


export const getStaticProps:GetStaticProps = async () => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {fetch:['post.title', 'post.subtitle','post.author'], pageSize:2, page:1 },
  );

  const results = postsResponse.results.map(post => {
    return {
      uid:post.uid,
      first_publication_date: post.first_publication_date,
      data:{
        subtitle:post.data.subtitle,
        author:post.data.author,
        title:post.data.title
      }
    }
  })

  const next_page = postsResponse.next_page

  return {
   props:{
    postsPagination:{
      results,
       next_page
      }
    },
    revalidate:60 * 60 
  }
};
