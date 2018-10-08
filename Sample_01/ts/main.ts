import { Live2DCubismFramework } from '../../Framework/live2dcubismframework';
import CubismFramework = Live2DCubismFramework.CubismFramework;

import AppCubismUserModel from './class/AppCubismUserModel';


document.addEventListener('DOMContentLoaded', () => {

    /**
     * Canvasの初期化
     */

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = 512;
    canvas.height = 512;

    /**
     * WebGLコンテキストの初期化
     */

    const gl = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");

    if (gl === null) return alert("WebGL未対応のブラウザです。");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    /**
     * Frameworkの初期化
     */

     CubismFramework.startUp();
     CubismFramework.initialize();

     /**
      * Live2Dモデルの初期化
      */

      const model = new AppCubismUserModel();
    //   const model = new ModelBuilder()
    //     .SetupModel(moc)
    //     .SetupTexture(texture[])
    //     .build();

});