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


export default class AppCubismUserModel extends CubismUserModel {

    private readonly motions: Map<string, CubismMotion>;

    private texturePaths: string[];
    private lastUpdateTime: number;


    constructor() {
        
        super();

        this.motions = new Map<string, CubismMotion>();
        this.lastUpdateTime = 0;

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

}