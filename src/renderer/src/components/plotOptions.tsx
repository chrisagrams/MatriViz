import styles from '../assets/plotOptions.module.css'

const PlotOptions = ({ 
    minColor, maxColor, pointSize, toggleLabels, toggleGridlines, minScore, autoMinScore, maxScore, autoMaxScore,
    setMinColor, setMaxColor, setPointSize, setToggleLabels, setToggleGridlines, setMinScore, setAutoMinScore, setMaxScore, setAutoMaxScore
}: {
    minColor: string,
    maxColor: string,
    pointSize: number,
    toggleLabels: boolean,
    toggleGridlines: boolean,
    minScore: number,
    autoMinScore: boolean,
    maxScore: number,
    autoMaxScore: boolean,
    setMinColor: (color: string) => void
    setMaxColor: (color: string) => void
    setPointSize: (size: number) => void
    setToggleLabels: (toggle: boolean) => void
    setToggleGridlines: (toggle: boolean) => void
    setMinScore: (score: number) => void
    setAutoMinScore: (toggle: boolean) => void
    setMaxScore: (score: number) => void
    setAutoMaxScore: (toggle: boolean) => void
}): JSX.Element =>{

    return (
        <div className={styles.container}>
            <p className={styles.title}>Plot Options</p>
            <div className={styles.section}>
                <p className={styles.subtitle}>Minimum</p>
                <div className={styles.subsection}>
                <p className={styles.label}>Color:</p>
                <input
                    type="color"
                    value={minColor}
                    onChange={(event) => setMinColor(event.target.value)}
                />
                </div>  
                <div className={styles.subsection}>
                    <p className={styles.label}>Score:</p>
                    <input
                        type="number"
                        step={0.1}
                        value={minScore}
                        disabled={autoMinScore}
                        onChange={(event) => setMinScore(Number(event.target.value))}
                    />
                    <p>Auto</p>
                    <input
                        type="checkbox"
                        checked={autoMinScore}
                        onChange={(event) => setAutoMinScore(event.target.checked)}
                    />
                </div>
            </div>
            <div className={styles.section}>
                <p className={styles.subtitle}>Maximum</p>
                <div className={styles.subsection}>
                <p className={styles.label}>Color:</p>
                <input
                    type="color"
                    value={maxColor}
                    onChange={(event) => setMaxColor(event.target.value)}
                />
                </div>  
                <div className={styles.subsection}>
                    <p className={styles.label}>Score:</p>
                    <input
                        type="number"
                        step={0.1}
                        value={maxScore}
                        disabled={autoMaxScore}
                        onChange={(event) => setMaxScore(Number(event.target.value))}
                    />
                    <p>Auto</p>
                    <input
                        type="checkbox"
                        checked={autoMaxScore}
                        onChange={(event) => setAutoMaxScore(event.target.checked)}
                    />
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.subsection}>
                    <div className={styles.subsection}>
                        <p className={styles.label}>Point size:</p>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            step={0.1}
                            value={pointSize}
                            onChange={(event) => setPointSize(Number(event.target.value))}
                        />
                    </div>
                    <div className={styles.subsection}>
                        <p className={styles.label}>Labels:</p>
                        <input
                            type="checkbox"
                            checked={toggleLabels}
                            onChange={(event) => setToggleLabels(event.target.checked)}
                        />
                    </div>
                    <div className={styles.subsection}>
                        <p className={styles.label}>Gridlines:</p>
                        <input
                            type="checkbox"
                            checked={toggleGridlines}
                            onChange={(event) => setToggleGridlines(event.target.checked)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default PlotOptions;