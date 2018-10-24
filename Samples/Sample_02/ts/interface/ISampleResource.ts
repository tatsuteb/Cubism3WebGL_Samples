import { Live2DCubismFramework as icubismmodelsetting } from '../../../../Framework/icubismmodelsetting';
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting;

// import IMotionResource from './IMotionResource';

// モーションに関する情報をまとめる
export interface IMotionResource {
    motionName: string;
    buffer: ArrayBuffer;
    fadeInTime?: number;
    fadeOutTime?: number;
}


// 表情に関する情報をまとめる
export interface IExpressionResource {
    expressionName: string;
    buffer: ArrayBuffer;
}


export default interface ISampleResource {
    
    moc3ArrayBuffer: ArrayBuffer;
    texturePaths: string[];

    cubismModelSetting?: ICubismModelSetting;
    motions?: IMotionResource[];
    pose3ArrayBuffer?: ArrayBuffer;
    expressions?: {
        expressionName: string;
        buffer: ArrayBuffer;
    }[];
    physics3ArrayBuffer?: ArrayBuffer;

}