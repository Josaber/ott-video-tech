import { RefObject, useEffect, useState } from 'react'
import { DEFAULT_SUB_STYLE, SubStyle } from '../SubtitleStyleMenu'

/**
 * Subtitle ::cue style persisted in localStorage, mirrored into a
 * single `<style id="hls-player-cue-style-tag">` tag so it applies to
 * both hls.js-parsed cues and any native <track> element.
 */
export function useSubtitleStyle() {
  const [subStyle, setSubStyle] = useState<SubStyle>(() => {
    try {
      const raw = localStorage.getItem('hls-player-cue-style')
      if (raw) return JSON.parse(raw)
    } catch { /* fall through */ }
    return DEFAULT_SUB_STYLE
  })

  useEffect(() => {
    try { localStorage.setItem('hls-player-cue-style', JSON.stringify(subStyle)) } catch { /* swallow */ }
    const STYLE_ID = 'hls-player-cue-style-tag'
    let tag = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!tag) {
      tag = document.createElement('style')
      tag.id = STYLE_ID
      document.head.appendChild(tag)
    }
    const bg = `rgba(0, 0, 0, ${subStyle.bgOpacity.toFixed(2)})`
    tag.textContent = `
      video::cue {
        font-size: ${subStyle.fontSize}px;
        color: ${subStyle.color};
        background: ${bg};
        line-height: 1.3;
        text-shadow: 0 1px 2px rgba(0,0,0,0.85);
      }
    `
  }, [subStyle])

  return [subStyle, setSubStyle] as const
}

/**
 * Remember the last volume + muted state across page loads. Browser
 * default is full-volume + unmuted; a single explicit user adjustment
 * should stick for every subsequent asset.
 */
export function useVolumeMemory(videoRef: RefObject<HTMLVideoElement | null>, src: string) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const raw = localStorage.getItem('hls-player-volume')
    if (raw) {
      try {
        const { v, m } = JSON.parse(raw)
        if (typeof v === 'number') video.volume = Math.max(0, Math.min(1, v))
        if (typeof m === 'boolean') video.muted = m
      } catch { /* ignore */ }
    }
    const onVol = () => {
      localStorage.setItem('hls-player-volume', JSON.stringify({
        v: video.volume, m: video.muted,
      }))
    }
    video.addEventListener('volumechange', onVol)
    return () => video.removeEventListener('volumechange', onVol)
  }, [src])
}

/** Audio-sync offset persisted as a single number (ms). */
export function useAudioSyncMs() {
  return useState<number>(() => {
    const raw = localStorage.getItem('hls-player-audio-sync-ms')
    return raw ? parseFloat(raw) : 0
  })
}
