import { Live2DCubismFramework as icubismmodelsetting } from '../../../../Framework/icubismmodelsetting';
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting;

import IMotionResource from './IMotionResource';


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