import styles from './index.module.scss'

interface LoadProps{
    nextPage: ()=> void
}


export function LoadPost({nextPage}:LoadProps){
return(
    <button className={styles.loadpost} onClick={nextPage}>Carregar mais posts</button>
)
    
}