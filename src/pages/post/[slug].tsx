import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import { FiCalendar,FiClock,FiUser } from "react-icons/fi";

import { useRouter } from 'next/router'

import Prismic from '@prismicio/client';
import {RichText} from 'prismic-dom'
import { format} from 'date-fns'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { ptBR } from 'date-fns/locale';
import Header from '../../components/Header';
import React from 'react';
import Head from 'next/head'


interface Post {
  first_publication_date: string | null;
  uid:string;
  data: {
    subtitle:string;
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

export default function Post({post}:PostProps) {

  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }
 
  const timeRead = post.data.content.reduce((acc,index) =>{
    acc += index.heading.split(/\s/g).length
    acc += RichText.asText(index.body).split(/\s/g).length
    
    return acc
  }, 0)
  const timeToRead = Math.ceil(Number(timeRead)/200)


  return (
    <>
      <Head>
        <title>{post.data.title}</title> 
      </Head>
      <Header/>

      {router.isFallback ? <div>Carregando...</div> : 
      <>
        <img className={styles.post_image} src={post.data.banner.url} />
        <div className={styles.content}>
          <h1 className={styles.post_title}>{post.data.title}</h1>
          <div className={styles.post_info}>
            <span><FiCalendar/> {format(new Date(post.first_publication_date),'dd MMM yyyy', {locale:ptBR})} </span>
            <span><FiUser/> {post.data.author} </span> 
            <span><FiClock/> {`${timeToRead} min`}</span>
          </div>

          {post.data.content.map(newPost => (
            <div key={newPost.heading}>
              <h2 className={styles.post_subtitle}>{newPost.heading}</h2>
              <div className={styles.dangerous_html} dangerouslySetInnerHTML={{__html:RichText.asHtml(newPost.body)}}></div>
            </div>
          ))}
        </div>
      </>
      }
    </>

  )
}

export const getStaticPaths:GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([Prismic.Predicates.at("document.type", 'post')]);

  const paths = posts.results.map(post => {
    return { params: {slug:post.uid}}
  })

  return { paths, fallback: true }
};

export const getStaticProps:GetStaticProps = async ({params}) => {

  const { slug} = params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug),{});

  const post = {
    first_publication_date:response.first_publication_date,
    uid:response.uid,
    data: {
      subtitle:response.data.subtitle,
      title: response.data.title,
      author:response.data.author,
      banner: {url:response.data.banner.url},
      content:response.data.content
    }
  }
  return {
    props:{
      post
    }
  }


};
