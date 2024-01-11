import styles from '../assets/badge.module.css';

const Badge = ({ gene, handleBadgeClick, removeGene }) => {
    return (
      <div key={gene} className={styles.geneBadge} data-key={gene}>
        <span onClick={() => handleBadgeClick(gene)}>{gene}</span>
        <button onClick={() => removeGene(gene)}>X</button>
      </div>
    );
  };
  
  export default Badge;