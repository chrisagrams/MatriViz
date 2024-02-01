import { PlotState } from '@renderer/types'
import styles from '../assets/plotOptions.module.css'

const PlotOptions = ({
  plotState,
  setPlotState
}: {
  plotState: PlotState
  setPlotState: (plotState: PlotState) => void
}): JSX.Element => {
  return (
    <div className={styles.container}>
      <p className={styles.title}>Plot Options</p>
      <div className={styles.section}>
        <p className={styles.subtitle}>Minimum</p>
        <div className={styles.subsection}>
          <p className={styles.label}>Color:</p>
          <input
            type="color"
            value={plotState.minColor}
            onChange={(event) => setPlotState({ ...plotState, minColor: event.target.value })}
          />
        </div>
        <div className={styles.subsection}>
          <p className={styles.label}>Score:</p>
          <input
            type="number"
            step={0.1}
            value={plotState.minScore}
            disabled={plotState.autoMinScore}
            onChange={(event) =>
              setPlotState({ ...plotState, minScore: Number(event.target.value) })
            }
          />
          <p>Auto</p>
          <input
            type="checkbox"
            checked={plotState.autoMinScore}
            onChange={(event) => setPlotState({ ...plotState, autoMinScore: event.target.checked })}
          />
        </div>
      </div>
      <div className={styles.section}>
        <p className={styles.subtitle}>Maximum</p>
        <div className={styles.subsection}>
          <p className={styles.label}>Color:</p>
          <input
            type="color"
            value={plotState.maxColor}
            onChange={(event) => setPlotState({ ...plotState, maxColor: event.target.value })}
          />
        </div>
        <div className={styles.subsection}>
          <p className={styles.label}>Score:</p>
          <input
            type="number"
            step={0.1}
            value={plotState.maxScore}
            disabled={plotState.autoMaxScore}
            onChange={(event) =>
              setPlotState({ ...plotState, maxScore: Number(event.target.value) })
            }
          />
          <p>Auto</p>
          <input
            type="checkbox"
            checked={plotState.autoMaxScore}
            onChange={(event) => setPlotState({ ...plotState, autoMaxScore: event.target.checked })}
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
              value={plotState.pointSize}
              onChange={(event) =>
                setPlotState({ ...plotState, pointSize: Number(event.target.value) })
              }
            />
          </div>
          <div className={styles.subsection}>
            <p className={styles.label}>Labels:</p>
            <input
              type="checkbox"
              checked={plotState.toggleLabels}
              onChange={(event) =>
                setPlotState({ ...plotState, toggleLabels: event.target.checked })
              }
            />
          </div>
          <div className={styles.subsection}>
            <p className={styles.label}>Gridlines:</p>
            <input
              type="checkbox"
              checked={plotState.toggleGridlines}
              onChange={(event) =>
                setPlotState({ ...plotState, toggleGridlines: event.target.checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlotOptions
