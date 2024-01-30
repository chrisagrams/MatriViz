import styles from '../assets/badge.module.css';

const Badge = ({ gene, handleBadgeClick, removeGene, isHighlighted}) => {
    return (
      <div key={gene} className={`${styles.geneBadge} ${isHighlighted ? styles.highlighted : ''}`}>
        <span onClick={() => handleBadgeClick(gene)}>{gene}</span>
        <button onClick={() => removeGene(gene)}>X</button>
      </div>
    );
  };
  
  export default Badge;