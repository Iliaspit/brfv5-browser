import { log, error }           from '../utils/utils__logging.js'

import { ScaleMode }            from '../utils/utils__resize.js'
import { doResize }             from '../utils/utils__resize.js'
import { SystemUtils }          from '../utils/utils__system.js'

import { create3DScene }        from '../threejs/threejs_setup.js'
import { update3DLayout }       from '../threejs/threejs_setup.js'

import { updateByFace as update3D } from '../threejs/threejs_brfv5_mapping.js'

let __brfv5__threejs_overlay    = null // This is the node to mount to.
const __brfv5__threejs_canvas   = document.createElement('canvas')

const _name                     = 'BRFv5ThreejsOverlay'

let _scaleMode                  = ScaleMode.PROPORTIONAL_OUTSIDE

let _width                      = 0
let _height                     = 0

export const mountThreejsOverlay = (node, scaleMode) => {

  log(_name + ': mountThreejsOverlay')

  if(node && node.appendChild) {

    _scaleMode                        = scaleMode
    __brfv5__threejs_overlay          = node
    __brfv5__threejs_canvas.className = 'bg-t abs vh c'

    __brfv5__threejs_overlay.appendChild(__brfv5__threejs_canvas)

    if(create3DScene(__brfv5__threejs_canvas)) {

      window.addEventListener("resize", onResize)

    } else {

      error('ThreeJS scene could not be created: SystemUtils.isWebGLSupported: ', SystemUtils.isWebGLSupported)
    }
  }
}

export const setThreejsOverlaySize = (width, height) => {

  log(_name + ': setThreejsOverlaySize:', width, height)

  _width  = width
  _height = height

  __brfv5__threejs_canvas.width  = _width
  __brfv5__threejs_canvas.height = _height

  update3DLayout(_width, _height)

  onResize()
}

export const hideThreejsOverlay = () => {

  log(_name + ': hideThreejsOverlay')

  __brfv5__threejs_canvas.classList.add('vh')
}

export const updateByFace = (cameraCtx, face, index, show) => {

  if(index < 0 && index >= _textures.length) {

    return
  }

  if(show) {

    update3D(face, index, show)

    __brfv5__threejs_canvas.classList.remove('vh')

  } else {

    __brfv5__threejs_canvas.classList.add('vh')
  }
}

const onResize = () => {

  doResize(__brfv5__threejs_canvas, _width, _height, _scaleMode)
}

export default {
  mountThreejsOverlay,
  hideThreejsOverlay,
  setThreejsOverlaySize,
  updateByFace
}