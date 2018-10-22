// Framework
import { Live2DCubismFramework } from '../../../../Framework/live2dcubismframework';
import CubismFramework = Live2DCubismFramework.CubismFramework;

// math
import { Live2DCubismFramework as cubismmatrix44 } from '../../../../Framework/math/cubismmatrix44';
import CubismMatrix44 = cubismmatrix44.CubismMatrix44;

import AppCubismUserModel from "./AppCubismUserModel";


export default class SampleApplication {

    private readonly _canvas: HTMLCanvasElement;
    private _gl: WebGLRenderingContext;
    private model: AppCubismUserModel;
    private requestId: number;

    constructor(canvas?: HTMLCanvasElement) {

        if (canvas === null) {

            this._canvas = document.createElement('canvas');

        } else {
            
            this._canvas = canvas;

        }

        this.model = null;
        this._gl = null;
        this.requestId = 0;


        this.initGlContext();
        this.initCubismFramework();

    }


    get canvas(): HTMLCanvasElement {

        return this._canvas;

    }


    get gl(): WebGLRenderingContext {

        return this._gl;

    }


    public async setModelAsync(model: AppCubismUserModel): Promise<SampleApplication> {

        // NOTE: modelMatrixは、モデルのユニット単位での幅と高さが1×1に収まるように縮めようとしている？
        const modelMatrix = model.getModelMatrix();
        const projectionMatrix = new CubismMatrix44();
        const scale = 4;
        // NOTE:
        // 1×1にしたモデルを、キャンバスの縦横比になるように引き延ばそうとする
        // 高さを調整してモデルを正しく表示するには、高さを canvas.width/canvas.height 倍する
        // 幅を調整してモデルを正しく表示するには、幅を canvas.height / canvas.width 倍する
        projectionMatrix.scale(1, this.canvas.width / this.canvas.height);

        // モデルが良い感じの大きさになるように拡大・縮小
        projectionMatrix.scaleRelative(scale, scale);

        projectionMatrix.multiplyByMatrix(modelMatrix);
        model.getRenderer().setMvpMatrix(projectionMatrix);


        this.model = model;
        
        return this;

    }


    public run() {

        const draw = () => {

            if (this.model === null) return;

            //  頂点の更新
            this.model.update();
        
            // モデルの描画
            this.model.getRenderer().drawModel();
   
            this.requestId = requestAnimationFrame(draw);
   
        }
        this.requestId = requestAnimationFrame(draw);

    }


    /**
     * GLコンテキストの初期化
     */
    private initGlContext() {

        // WebGLコンテキストの初期化
        this._gl = this.canvas.getContext('webgl') ||
            this.canvas.getContext("experimental-webgl");

        if (this._gl === null) {
            alert("WebGL未対応のブラウザです。");
            return;
        }

        this._gl.enable(this._gl.BLEND);
        this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
        this._gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.depthFunc(this._gl.LEQUAL);

    }


    /**
     * CubismFramework
     */
    private initCubismFramework() {
        
        CubismFramework.startUp();
        CubismFramework.initialize();

    }

}