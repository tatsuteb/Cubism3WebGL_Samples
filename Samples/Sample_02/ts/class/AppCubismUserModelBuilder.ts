import AppCubismUserModel from './AppCubismUserModel';
import ISampleResource, { IExpressionResource } from '../interface/ISampleResource';
import IMotionResource from '../interface/IMotionResource';


export default class AppCubismUserModelBuilder {

    private gl: WebGLRenderingContext;


    constructor() {

        this.gl = null;

    }


    public setGlContext(gl: WebGLRenderingContext): AppCubismUserModelBuilder {

        this.gl = gl;

        return this;

    }


    /**
     * ISampleResourceをもとにAppCubismUserModelのインスタンスを作成する
     * @param resource 
     */
    public async fromSampleResourceAsync(resource: ISampleResource): Promise<AppCubismUserModel> {

        const model = new AppCubismUserModel();

        // モデルデータをロード
        model.loadModel(resource.moc3ArrayBuffer);

        // モーションデータをロード
        resource.motions.forEach((motionResource: IMotionResource) =>
            model.addMotion(motionResource));

        // 表情のデータをロード
        if (!!resource.expressions)
            resource.expressions.forEach((expressionResource: IExpressionResource) =>
                model.addExpression(expressionResource));
            
        // 物理演算のデータをロード
        if (!!resource.physics3ArrayBuffer)
            model.loadPhysics(resource.physics3ArrayBuffer, resource.physics3ArrayBuffer.byteLength);

        // ポーズデータをロード
        if (resource.pose3ArrayBuffer !== null)
            model.loadPose(resource.pose3ArrayBuffer, resource.pose3ArrayBuffer.byteLength);

        // テクスチャを設定
        await this.setUpTextureAsync(model, resource.texturePaths);

        return model;

    }


    /**
     * テクスチャを作成して、レンダラに設定する
     * @param model 
     * @param paths 
     */
    private async setUpTextureAsync(model: AppCubismUserModel, paths: string[]): Promise<void> {

        if (this.gl === null) return;

        // テクスチャ
        const textures: WebGLTexture[] = [];
        for (const path of paths) {

            textures.push(await this.createAndBindTexture(path, this.gl));

        }

        // レンダラの作成（bindTextureより先にやっておく）
        model.createRenderer();

        // テクスチャをレンダラに設定
        textures.forEach((texture: WebGLTexture, index: number) => {
            model.getRenderer()
                .bindTexture(index, texture);
        });

        // そのほかレンダラの設定
        model.getRenderer().setIsPremultipliedAlpha(false);
        model.getRenderer().startUp(this.gl);

    }


    /**
     * WebGLTextureを作成して、バインドする
     * @param path 
     * @param gl 
     */
    private async createAndBindTexture(path: string, gl: WebGLRenderingContext): Promise<WebGLTexture> {

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
    
                // 乗算済みアルファ方式を使用する
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

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