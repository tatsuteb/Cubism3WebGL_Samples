import { Live2DCubismFramework as cubismusermodel} from '../../../../Framework/model/cubismusermodel';
import CubismUserModel = cubismusermodel.CubismUserModel;

// motion
import { Live2DCubismFramework as cubismmotion } from '../../../../Framework/motion/cubismmotion';
import CubismMotion = cubismmotion.CubismMotion;

import IMotionResource from '../interface/IMotionResource';


export default class AppCubismUserModel extends CubismUserModel {

    private readonly motions: Map<string, CubismMotion>;


    constructor() {
        
        super();

        this.motions = new Map<string, CubismMotion>();

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

        // 重複があったら削除
        if (this.motions.has(motionResource.motionName)) {
            this.motions.delete(motionResource.motionName);
        }
        
        this.motions.set(motionResource.motionName, motion);

    }


    public update() {

        // ポーズ
        if (this._pose !== null)
            this._pose.updateParameters(this._model, 0);
            
        this._model.update();

    }

}