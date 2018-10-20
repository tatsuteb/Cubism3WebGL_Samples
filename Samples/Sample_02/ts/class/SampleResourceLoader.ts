import { Live2DCubismFramework as icubismmodelsetting } from '../../../../Framework/icubismmodelsetting';
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting;

import { Live2DCubismFramework as cubismmodelsettingjson } from '../../../../Framework/cubismmodelsettingjson';
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson;

import ISampleResource from "../interface/ISampleResource";
import IMotionResource from '../interface/IMotionResource';


export default class SampleResourceLoader {

    public static async loadFromModel3JsonAsync(path: string): Promise<ISampleResource> {

        const resource: ISampleResource = {
            moc3ArrayBuffer: null,
            texturePaths: []
        };

        // ディレクトリのパス
        const dir = path.split(/[\w]*.model3.json$/)[0];

        // モデル設定
        const modelSetting = await this.createCubismModelSettingJsonAsync(path);
        if (modelSetting === null) return null;
        resource.cubismModelSetting = modelSetting;

        // モデル
        const moc3ArrayBuffer = await this.loadMoc3ArrayBufferFromModelSettingAsync(modelSetting, dir);
        if (moc3ArrayBuffer === null) return null;
        resource.moc3ArrayBuffer = moc3ArrayBuffer;

        // テクスチャのパス
        const texturePaths = this.getTexturePathsFromModelSetting(modelSetting, dir);
        if (texturePaths.length === 0) return null;
        resource.texturePaths = texturePaths;

        // モーション
        const motions = await this.loadMotionsFromModelSettingAsync(modelSetting, dir);
        resource.motions = motions;

        // 表情

        // 物理演算

        // ポーズ
        const pose3ArrayBuffer = await this.loadPose3ArrayBufferFromModelSettingAsync(modelSetting, dir);
        resource.pose3ArrayBuffer = pose3ArrayBuffer;

        return resource;
        
    }


    /**
     * CubismModelSettingJsonオブジェクトを作成
     * @param path 
     */
    private static async createCubismModelSettingJsonAsync(path: string): Promise<ICubismModelSetting> {

        const model3JsonArrayBuffer = await this.loadAsArrayBufferAsync(path)
            .catch(error => {
                console.log(error);
                return null;
            }) as ArrayBuffer;

        if (model3JsonArrayBuffer === null) return;

        const modelSetting = new CubismModelSettingJson(model3JsonArrayBuffer, model3JsonArrayBuffer.byteLength) as ICubismModelSetting;
        
        return modelSetting;

    }


    /**
     * モデルデータをArrayBufferとして返す
     * @param setting 
     * @param dir 
     */
    private static async loadMoc3ArrayBufferFromModelSettingAsync(setting: ICubismModelSetting, dir: string = "./"): Promise<ArrayBuffer> {

        const moc3FilePath = `${dir}${setting.getModelFileName()}`;
        const moc3ArrayBuffer = await this.loadAsArrayBufferAsync(`${moc3FilePath}`)
            .catch(error => {
                console.log(error);
                return null;
            }) as ArrayBuffer;
    
        if (moc3ArrayBuffer === null) return;

        return moc3ArrayBuffer;

    }


    /**
     * テクスチャのパスを配列にして返す
     * @param setting 
     * @param dir 
     */
    private static getTexturePathsFromModelSetting(setting: ICubismModelSetting, dir: string = "./"): string[] {

        const texturePaths: string[] = [];

        const textureCount = setting.getTextureCount();
        for (let i = 0; i < textureCount; i++) {
            
            texturePaths.push(`${dir}${setting.getTextureFileName(i)}`);

        }

        return texturePaths;

    }


    /**
     * モーションのデータをIMotionResourceの配列にして返す
     * @param setting
     * @param dir 
     */
    private static async loadMotionsFromModelSettingAsync(setting: ICubismModelSetting, dir: string = "./"): Promise<IMotionResource[]> {

        const motionResources: IMotionResource[] = [];

        const motionGroupCount = setting.getMotionGroupCount();
        for (let i = 0; i < motionGroupCount; i++) {

            const groupName = setting.getMotionGroupName(i);
            const motionCount = setting.getMotionCount(groupName);

            for (let j = 0; j < motionCount; j++) {

                const motionFilePath = `${dir}${setting.getMotionFileName(groupName, j)}`;
                const buffer = await this.loadAsArrayBufferAsync(motionFilePath)
                    .catch(error => {
                        console.log(error);
                        return null;
                    }) as ArrayBuffer;
                const fadeInTime = setting.getMotionFadeInTimeValue(groupName, j);
                const fadeOutTime = setting.getMotionFadeOutTimeValue(groupName, j);

                motionResources.push({
                    motionName: motionFilePath,
                    buffer: buffer,
                    fadeInTime: fadeInTime,
                    fadeOutTime: fadeOutTime
                });

            }

        }

        return motionResources;

    }


    /**
     * ポーズデータをArrayBufferとして返す
     * @param setting 
     * @param dir 
     */
    private static async loadPose3ArrayBufferFromModelSettingAsync(setting: ICubismModelSetting, dir: string = "./"): Promise<ArrayBuffer> {

        const pose3FilePath = `${dir}${setting.getPoseFileName()}`;
        const pose3ArrayBuffer = await this.loadAsArrayBufferAsync(`${pose3FilePath}`)
            .catch(error => {
                console.log(error);
                return null;
            }) as ArrayBuffer;

        return pose3ArrayBuffer;

    }


    /**
     * ファイルを読み込んで、ArrayBufferとして返す
     * @param path 
     */
    private static async loadAsArrayBufferAsync(path: string): Promise<ArrayBuffer> {

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

}