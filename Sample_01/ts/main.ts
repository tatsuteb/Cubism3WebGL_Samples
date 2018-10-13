import { Live2DCubismFramework } from '../../Framework/live2dcubismframework';
import CubismFramework = Live2DCubismFramework.CubismFramework;

import { Live2DCubismFramework as icubismmodelsetting } from '../../Framework/icubismmodelsetting';
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting;

import { Live2DCubismFramework as cubismmodelsettingjson } from '../../Framework/cubismmodelsettingjson';
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson;

import AppCubismUserModel from './class/AppCubismUserModel';


document.addEventListener('DOMContentLoaded', async () => {

    const assetDir = './asset/Haru/';

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
     * .model3.jsonファイルを読み込む
     */

    const model3JsonArrayBuffer = await loadAsArrayBufferAsync(`${assetDir}Haru.model3.json`)
        .catch(error => {
            console.log(error);
            return null;
        }) as ArrayBuffer;

    if (model3JsonArrayBuffer === null) return;

    /**
     * ModelSettingオブジェクトを作成
     */

    const modelSetting = new CubismModelSettingJson(model3JsonArrayBuffer, model3JsonArrayBuffer.byteLength) as ICubismModelSetting;

    /**
     * Live2Dモデルの表示に必要なファイルを読み込む
     */

    // .moc3
    const moc3FilePath = `${assetDir}${modelSetting.getModelFileName()}`;
    const moc3ArrayBuffer = await loadAsArrayBufferAsync(`${moc3FilePath}`)
        .catch(error => {
            console.log(error);
            return null;
        }) as ArrayBuffer;

    if (moc3ArrayBuffer === null) return;

    // テクスチャ
    const textures: WebGLTexture[] = [];
    const textureCount = modelSetting.getTextureCount();
    for (let i = 0; i < textureCount; i++) {
        const textureFilePath = `${assetDir}${modelSetting.getTextureFileName(i)}`;
        textures.push(await createTexture(textureFilePath, gl));
    }


    /**
     * そのほかのファイルを読む
     */

    // .pose3.json
    const pose3FilePath = `${assetDir}${modelSetting.getPoseFileName()}`;
    const pose3ArrayBuffer = await loadAsArrayBufferAsync(`${pose3FilePath}`)
        .catch(error => {
            console.log(error);
            return null;
        }) as ArrayBuffer;


    /**
     * Live2Dモデルの作成と設定
     */

    const model = new AppCubismUserModel();
    // モデルデータをロード
    model.loadModel(moc3ArrayBuffer);
    // ポーズデータをロード
    if (pose3ArrayBuffer !== null)
        model.loadPose(pose3ArrayBuffer, pose3ArrayBuffer.byteLength);

    // レンダラの作成（bindTextureより先にやっておく）
    model.createRenderer();
    // テクスチャをレンダラに設定
    textures.forEach((texture: WebGLTexture, index: number) => {
        model.getRenderer()
            .bindTexture(index, texture);
    });
    // そのほかレンダラの設定
    model.getRenderer().setIsPremultipliedAlpha(false);
    model.getRenderer().startUp(gl);

    
    /**
     * Live2Dモデルの描画
     */

    //  頂点の更新
    model.update();

    // モデルの描画
    model.getRenderer().drawModel();


    //   const resource: AppCubismUserModelResource = 
    //     await AppCubismUserModelResource.Loader
    //         .loadFromModel3Json('path to the *.model3.json');

    /**
     * Live2Dモデルの初期化
     */

    //   const model: AppCubismUserModel = new AppCubismUserModelBuilder()
    //     .setResource(resource)
    //     .build();

});


async function loadAsArrayBufferAsync(path: string): Promise<ArrayBuffer> {

    const response = await fetch(path)
        .catch((error) => {
            throw new Error(`Network error: ${error}`);
        });

    if (!response.ok) {
        throw new Error(`Failed to get "${path}".`);
    }

    const buffer = await response.arrayBuffer()
        .catch(() => {
            throw new Error(`Failed to load "${path}" as ArrayBuffer.`);
        });

    return buffer;

}


async function createTexture(path: string, gl: WebGLRenderingContext): Promise<WebGLTexture> {

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