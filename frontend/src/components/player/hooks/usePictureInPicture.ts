import { RefObject, useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

/**
 * Picture-in-Picture, preferring Document PiP (Chrome 116+) which
 * pops the WHOLE video-wrap DOM out — subtitles, the AD overlay, the
 * bitrate chip, and the stats panel all follow into the floating
 * window. Falls back to the native `<video>.requestPictureInPicture()`
 * on older Chromes / Safari, where only the video plane goes.
 *
 * Listens for `enterpictureinpicture` / `leavepictureinpicture` on the
 * video element so PiP exits triggered by the OS UI also update state.
 */
export function usePictureInPicture(
  videoRef: RefObject<HTMLVideoElement | null>,
  wrapRef: RefObject<HTMLDivElement | null>,
  hlsRef: RefObject<Hls | undefined>,
) {
  const [pipActive, setPipActive] = useState<boolean>(false)
  const pipPlaceholderRef = useRef<HTMLDivElement | null>(null)
  const docPipWinRef = useRef<Window | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onEnter = () => setPipActive(true)
    const onLeave = () => setPipActive(false)
    video.addEventListener('enterpictureinpicture', onEnter)
    video.addEventListener('leavepictureinpicture', onLeave)
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter)
      video.removeEventListener('leavepictureinpicture', onLeave)
    }
  }, [])

  type DocPipApi = {
    requestWindow(opts?: { width?: number; height?: number }): Promise<Window>
  }
  const docPip = typeof window !== 'undefined'
    ? (window as unknown as { documentPictureInPicture?: DocPipApi }).documentPictureInPicture
    : undefined

  const exitDocPip = () => {
    const win = docPipWinRef.current
    if (!win) return
    win.close()
  }

  const togglePip = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (docPip) {
        if (docPipWinRef.current) {
          exitDocPip()
          return
        }
        const wrap = wrapRef.current
        if (!wrap || !wrap.parentNode) return
        const win = await docPip.requestWindow({ width: 640, height: 360 })
        // Copy stylesheets so the popout window picks up our ::cue rules,
        // overlays, and trick-play CSS — the popout starts blank.
        document.head
          .querySelectorAll('style, link[rel="stylesheet"]')
          .forEach((node) => win.document.head.appendChild(node.cloneNode(true)))
        win.document.body.style.margin = '0'
        win.document.body.style.background = '#000'
        const placeholder = win.document.createElement('div')
        pipPlaceholderRef.current = document.createElement('div')
        wrap.parentNode.insertBefore(pipPlaceholderRef.current, wrap)
        win.document.body.appendChild(wrap)
        docPipWinRef.current = win
        setPipActive(true)
        const onClose = () => {
          if (pipPlaceholderRef.current && wrap) {
            pipPlaceholderRef.current.parentNode?.insertBefore(wrap, pipPlaceholderRef.current)
            pipPlaceholderRef.current.remove()
            pipPlaceholderRef.current = null
          }
          docPipWinRef.current = null
          setPipActive(false)
        }
        win.addEventListener('pagehide', onClose)
        win.addEventListener('unload', onClose)
        // Silence the placeholder-var lint (it's created above for the
        // popout body so Chrome doesn't empty-render on first paint).
        void placeholder
      } else if (document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          // Make sure the active subtitle track is in 'showing' mode —
          // Chrome's video PiP only renders text tracks that are showing.
          const tracks = video.textTracks
          for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].kind === 'subtitles' && hlsRef.current?.subtitleTrack === i) {
              tracks[i].mode = 'showing'
            }
          }
          await video.requestPictureInPicture()
        }
      }
    } catch {
      /* user can dismiss; ignore */
    }
  }

  const pipSupported = typeof document !== 'undefined' && document.pictureInPictureEnabled

  return { pipActive, pipSupported, togglePip }
}
