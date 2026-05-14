'use client';

import styles from './StepContainer.module.css';

export default function StepContainer({ title, description, children, onNext, nextLabel = 'Próximo', isLast = false, hideNext = false, titleColor = 'white' }) {
  return (
    <div className={`${styles.container} glass animate-fade`}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: titleColor }}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      
      <div className={styles.content}>
        {children}
      </div>

      {!hideNext && (
        <div className={styles.footer}>
          <button 
            className="btn-primary" 
            onClick={onNext}
          >
            {isLast ? 'Finalizar' : nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}
