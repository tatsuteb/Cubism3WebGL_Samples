import { Live2DCubismFramework as cubismusermodel} from '../../../../Framework/model/cubismusermodel';
import CubismUserModel = cubismusermodel.CubismUserModel;

// motion
import { Live2DCubismFramework as cubismmotion } from '../../../../Framework/motion/cubismmotion';
import CubismMotion = cubismmotion.CubismMotion;

import { Live2DCubismFramework as cubismexpressionmotion } from '../../../../Framework/motion/cubismexpressionmotion';
import CubismExpressionMotion = cubismexpressionmotion.CubismExpressionMotion;

// id
import { Live2DCubismFramework as cubismid } from '../../../../Framework/id/cubismid';
import CubismIdHandle = cubismid.CubismIdHandle;

// type
import { Live2DCubismFramework as csmvector } from '../../../../Framework/type/csmvector';
import csmVector = csmvector.csmVector;

import IMotionResource from '../interface/IMotionResource';
import { IExpressionResource } from '../interface/ISampleResource';


export default class AppCubismUserModel extends CubismUserModel {

    private readonly motions: Map<string, CubismMotion>;
    private readonly expressions: Map<string, CubismExpressionMotion>;

    private lastUpdateTime: number;


    constructor() {
        
        super();

        this.motions = new Map<string, CubismMotion>();
        this.expressions = new Map<string, CubismExpressionMotion>();
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


    public addExpression(expressionResource: IExpressionResource) {

        const expression: CubismExpressionMotion = this.loadExpression(
            expressionResource.buffer,
            expressionResource.buffer.byteLength,
            expressionResource.expressionName) as CubismExpressionMotion;

        if (this.expressions.has(expressionResource.expressionName)) {
            this.expressions.delete(expressionResource.expressionName);
        }

        this.expressions.set(expressionResource.expressionName, expression);
        
    }


    public startMotion(motionName: string) {

        const motion = this.motions.get(motionName);
        
        if (motion === null || motion === undefined) {

            this._motionManager.stopAllMotions();
            return;

        }

        motion.setIsLoop(true);
        
        this._motionManager.startMotionPriority(motion, false, 2);

    }


    public updateMotion(deltaTimeSeconds: number) {

        if (this._motionManager.isFinished()) return;

        this._motionManager.updateMotion(this.getModel(), deltaTimeSeconds);

    }


    public startExpression(expressionName: string) {

        const expression = this.expressions.get(expressionName);

        if (expression === null || expression === undefined) {

            this._expressionManager.stopAllMotions();
            return;

        }

        this._expressionManager.startMotionPriority(expression, false, 2);

    }


    public updateExpression(deltaTimeSeconds: number) {

        if (this._expressionManager.isFinished()) return;

        this._expressionManager.updateMotion(this.getModel(), deltaTimeSeconds);

    }


    public update() {

        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;

        // モーション
        this.updateMotion(deltaTime);

        // 表情
        this.updateExpression(deltaTime);

        // ポーズ
        if (this._pose !== null)
            this._pose.updateParameters(this._model, deltaTime);
            
        this._model.update();

    }

}