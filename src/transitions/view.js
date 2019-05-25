import React, { useState, useEffect } from 'react'
import { useStateContext } from './state'
import { useSpring, animated } from 'react-spring'

const TransitionView = ({
  view, mode, action, enter, leave, usual, y, isKeep, skipEnterAnimation, skipLeaveAnimation
}) => {
  const [, dispatch] = useStateContext()
  const [styles, setStyles] = useState(() => {
    if (mode === 'immediate') {
      return {
        position: 'fixed',
        transform: `translate3d(0,-${y}px,0)`
      }
    }
    if (isKeep) {
      return { opacity: 0 }
    }
    return {}
  })
  const [props, set] = useSpring(() => {
    return skipEnterAnimation
      ? usual
      : enter
  })
  useEffect(() => {
    switch (action) {
      case 'enter':
        set({
          ...usual,
          config: enter.config,
          onStart: () => {
            if (mode === 'successive' || isKeep) {
              window.scrollTo(0, y)
            }
            if (typeof usual.onStart === 'function') usual.onStart(props)
            if (typeof enter.onStart === 'function') enter.onStart(props)
          },
          onFrame: (props) => {
            if (typeof usual.onFrame === 'function') usual.onFrame(props)
            if (typeof enter.onFrame === 'function') enter.onFrame(props)
          },
          onRest: (props) => {
            if (isKeep) {
              dispatch({ type: 'REMOVE_KEEP' })
              setStyles({ opacity: 1 })
            }
            if (mode === 'immediate') {
              setStyles({
                position: 'relative',
                transform: 'translate3d(0, 0px, 0)',
                willChange: ''
              })
              window.scrollTo(0, y)
            }
            if (typeof usual.onRest === 'function') usual.onRest(props)
            if (typeof enter.onRest === 'function') enter.onRest(props)
            dispatch({ type: 'HAS_ENTERED' })
          }
        })
        break

      case 'leave':
        if (skipLeaveAnimation) {
          dispatch({ type: 'REMOVE_VIEW', locationKey: view.props.location.key })
          if (mode === 'successive') {
            window.scrollTo(0, 0)
            dispatch({ type: 'ADD_VIEW_FROM_QUEUE' })
          }
          return
        }
        set({
          ...leave,
          onStart: (props) => {
            if (typeof leave.onStart === 'function') leave.onStart(props)
          },
          onFrame: (props) => {
            if (typeof leave.onFrame === 'function') leave.onFrame(props)
          },
          onRest: (props) => {
            dispatch({ type: 'REMOVE_VIEW', locationKey: view.props.location.key })
            if (mode === 'successive') {
              window.scrollTo(0, 0)
              dispatch({ type: 'ADD_VIEW_FROM_QUEUE' })
            }
            if (typeof leave.onRest === 'function') leave.onRest(props)
          }
        })
        break
    }
  }, [action])

  return (
    <div
      className='view-container'
      style={{
        width: '100%',
        gridArea: 'View',
        willChange: mode === 'immediate' && 'transform',
        gridTemplateAreas: 'View',
        top: 0,
        ...styles
      }}
    >
      <animated.div
        style={{
          width: '100%',
          willChange: `opacity${enter.transform || usual.transform ? ', transform' : ''}`,
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
