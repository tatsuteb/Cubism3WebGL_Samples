import { Live2DCubismFramework as cubismusermodel} from '../../../../Framework/model/cubismusermodel';
import CubismUserModel = cubismusermodel.CubismUserModel;

// motion
import { Live2DCubismFramework as cubismmotion } from '../../../../Framework/motion/cubismmotion';
import CubismMotion = cubismmotion.CubismMotion;

// id
import { Live2DCubismFramework as cubismid } from '../../../../Framework/id/cubismid';
import CubismIdHandle = cubismid.CubismIdHandle;

// type
import { Live2DCubismFramework as csmvector } from '../../../../Framework/type/csmvector';
import csmVector = csmvector.csmVector;

import IMotionResource from '../interface/IMotionResource';
import ISampleResource from '../interface/ISampleResource';


export default class AppCubismUserModel extends CubismUserModel {

    private texturePaths: string[];
    private readonly motions: Map<string, CubismMotion>;
    private lastUpdateTime: number;


    constructor() {
        
        super();

        this.motions = new Map<string, CubismMotion>();
        this.lastUpdateTime = 0;

    }


    public static fromSampleResource(resource: ISampleResource): AppCubismUserModel {

        const model = new AppCubismUserModel();

        // モデルデータをロード
        model.loadModel(resource.moc3ArrayBuffer);

        // モーションデータをロード
        resource.motions.forEach((motionResource: IMotionResource) =>
            model.addMotion(motionResource));

        // ポーズデータをロード
        if (resource.pose3ArrayBuffer !== null)
            model.loadPose(resource.pose3ArrayBuffer, resource.pose3ArrayBuffer.byteLength);

        // テクスチャのパスを保持
        model.texturePaths = resource.texturePaths;

        return model;

    }


    /**
     * テクスチャを作成して、レンダラに設定する
     * @param gl 
     */
    public async setUpTextureAsync(gl: WebGLRenderingContext): Promise<void> {

        if (gl === null) return;

        // テクスチャ
        const textures: WebGLTexture[] = [];
        for (const path of this.texturePaths) {

            textures.push(await this.createTexture(path, gl));

        }

        // レンダラの作成（bindTextureより先にやっておく）
        this.createRenderer();

        // テクスチャをレンダラに設定
        textures.forEach((texture: WebGLTexture, index: number) => {
            this.getRenderer()
                .bindTexture(index, texture);
        });

        // そのほかレンダラの設定
        this.getRenderer().setIsPremultipliedAlpha(false);
        this.getRenderer().startUp(gl);

    }


    public addMotion(motionResource: IMotionResource) {

        const motion: CubismMotion = this.loadMotion(
            motionResource.buffer, 
            motionResource.buffer.byteLength, 
            motionResource.motionName) as CubismMotion;

        if (!!motionResource.fadeInTime)
            motion.setFadeInTime(motionResource.fadeInTime);
        
        if (!!motionResource.fadeOutTime)
            motion.setFadeOutTime(motionResource.fadeOutTime);

        motion._eyeBlinkParameterIds = new csmVector<CubismIdHandle>();
        motion._lipSyncParameterIds = new csmVector<CubismIdHandle>();

        // 重複があったら削除
        if (this.motions.has(motionResource.motionName)) {
            this.motions.delete(motionResource.motionName);
        }
        
        this.motions.set(motionResource.motionName, motion);

    }


    public startMotion(motionName: string) {

        const motion = this.motions.get(motionName);
        
        if (motion === null) {

            this._motionManager.stopAllMotions();
            return;

        }

        motion.setIsLoop(true);
        
        this._motionManager.startMotionPriority(motion, false, 2);

    }


    public updateMotion(deltaTimeSeconds: number) {

        this._motionManager.updateMotion(this.getModel(), deltaTimeSeconds);

    }


    public update() {

        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;

        // モーション
        if (!this._motionManager.isFinished())
            this._motionManager.updateMotion(this.getModel(), deltaTime);

        // ポーズ
        if (this._pose !== null)
            this._pose.updateParameters(this._model, 0);
            
        this._model.update();

    }


    private async createTexture(path: string, gl: WebGLRenderingContext): Promise<WebGLTexture> {

        return new Promise((resolve: (texture: WebGLTexture) => void, reject: (e: string) => void) => {
    
            // データのオンロードをトリガーにする
            const img: HTMLImageElement = new Image();
            img.onload = () => {
    
                // テクスチャオブジェクトの作成
                const tex: WebGLTexture = gl.createTexture();
    
                // テクスチャを選択
                gl.bindTexture(gl.TEXTURE_2D, tex);
    
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
                // テクスチャにピクセルを書き込む
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    
                // ミップマップを生成
                gl.generateMipmap(gl.TEXTURE_2D);
    
                return resolve(tex);
    
            };
    
            img.onerror = error => console.log(`${error}`);
    
            img.src = path;
    
        });
    
    }

}