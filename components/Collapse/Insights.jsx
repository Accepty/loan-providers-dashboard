import { useState } from 'react'
import { Text, useTheme } from '@geist-ui/core'
import ChevronRightIcon from '@geist-ui/icons/chevronRight'
 
const CollapseInsights = (props) => {
  const theme = useTheme()
  const [visible, setVisible] = useState(false)
  const clickHandler = (event) => {
    event.stopPropagation()
    event.preventDefault()
    setVisible(!visible)
  }

  return (
    <>
      <details open={visible}>
        <summary onClick={clickHandler}>
          <div className="summary-safari">
            <div className="action">
              <span className="arrow">
                <ChevronRightIcon />
              </span>
              <Text span b style={{ color: '#fff' }}>Insights</Text>
            </div>
          </div>
        </summary>
        <div className="area">
          {props.children}
        </div>
      </details>
      <style jsx>{`
        details {
          transition: all 0.2s ease;
          overflow: hidden;
        }
        details summary::-webkit-details-marker {
          display: none;
        }
        summary {
          box-sizing: border-box;
          border-top: 1px solid ${theme.palette.accents_2};
          border-bottom: 1px solid ${theme.palette.accents_2};
          color: ${theme.palette.accents_5};
          width: 100%;
          list-style: none;
          user-select: none;
          outline: none;
        }
        .summary-safari {
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 2.875rem;
          padding: 0 ${theme.layout.unit};
        }
        summary :global(svg) {
          cursor: pointer;
        }
        .action {
          width: auto;
          display: flex;
          align-items: center;
        }
        .area {
          background-color: ${theme.palette.background};
          border-bottom: 1px solid ${theme.palette.accents_2};
          padding: ${theme.layout.unit};
        }
        .arrow {
          transition: all 0.2s ease;
          transform: rotate(${visible ? 90 : 0}deg);
          display: inline-flex;
          align-items: center;
          width: 1rem;
          height: 1rem;
          margin-right: 0.5rem;
        }
      `}</style>
    </>
  )
}

export default CollapseInsights
