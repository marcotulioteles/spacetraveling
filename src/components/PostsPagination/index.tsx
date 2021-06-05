import styles from "./postspagination.module.scss"
import { RiCalendarLine, RiUser3Line } from "react-icons/ri"

export default function PostsPagination() {
  return (
    <div className={styles.postPaginationContainer}>
      <h1>Como utilizar Hooks</h1>
      <p>Pensando em sincronização em vez de ciclos de vida.</p>
      <div className={styles.postDateAndAuthor}>
        <div><RiCalendarLine/><span>15 Mar 2021</span></div>
        <div><RiUser3Line/><span>Joseph Oliveira</span></div>
      </div>
    </div>
  )
}