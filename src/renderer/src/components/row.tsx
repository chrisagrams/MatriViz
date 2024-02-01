import styles from '../assets/row.module.css'

const Row = ({ score, color, index }) => {
  return (
    <div className={styles.selectedPoint}>
      <span>{index}</span>
      <div>
        <span>{score}</span>
        <div className={styles.colorCircle} style={{ backgroundColor: color || 'white' }}></div>
      </div>
    </div>
  )
}

export default Row
