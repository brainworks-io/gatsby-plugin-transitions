import React, { useState, useEffect } from 'react'
import { useStateContext } from './state'
import { useSpring, animated } from 'react-spring'

const TransitionView = ({ view, action }) => {
  const [{ prevLocation, mode, enter, usual, leave }, dispatch] = useStateContext()
  const [styles, setStyles] = useState({
    position: 'fixed',
    transform: `translate3d(0,-${prevLocation && prevLocation.y[1]}px,0)`
  })
  const [props, set] = useSpring(() => ({
    ...enter
  }))
  useEffect(() => {
    if (action === 'enter') {
      set({
        ...usual,
        onRest: (props) => {
          if (mode === 'immediate') {
            window.scrollTo(0, 0)
          }
          setStyles({
            position: 'relative',
            transform: 'translate3d(0, 0px, 0)'
          })
          if (typeof usual.onRest === 'function') usual.onRest(props)
          else if (typeof enter.onRest === 'function') enter.onRest(props)
        }
      })
    } else {
      set({
        ...leave,
        onRest: (props) => {
          dispatch({ type: 'REMOVE_VIEW', pathname: view.key })
          if (mode === 'successive') {
            window.scrollTo(0, 0)
            dispatch({ type: 'ADD_VIEW' })
          }
          if (typeof leave.onRest === 'function') leave.onRest(props)
        }
      })
    }
  }, [action])
  return (
    <div
      className='view-container'
      style={{
        width: '100%',
        gridArea: 'View',
        willChange: 'transform',
        ...styles,
        top: 0
      }}
    >
      <animated.div
        style={{
          width: '100%',
          willChange: 'opacity, transform',
          opacity: props.opacity,
          transform: props.transform
        }}
        className='view'>
        {view}
      </animated.div>
    </div>
  )
}

export default TransitionView
