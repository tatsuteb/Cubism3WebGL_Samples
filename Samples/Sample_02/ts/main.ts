// Framework
import { Live2DCubismFramework } from '../../../Framework/live2dcubismframework';
import CubismFramework = Live2DCubismFramework.CubismFramework;

import { Live2DCubismFramework as icubismmodelsetting } from '../../../Framework/icubismmodelsetting';
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting;

import { Live2DCubismFramework as cubismmodelsettingjson } from '../../../Framework/cubismmodelsettingjson';
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson;

// math
import { Live2DCubismFramework as cubismmatrix44 } from '../../../Framework/math/cubismmatrix44';
import CubismMatrix44 = cubismmatrix44.CubismMatrix44;

// CubismUserModel
import AppCubismUserModel from './class/AppCubismUserModel';

import ISampleResource, { IMotionResource, IExpressionResource } from './interface/ISampleResource';
import SampleResourceLoader from './class/SampleResourceLoader';
import SampleApplication from './class/SampleApplication';
import AppCubismUserModelBuilder from './class/AppCubismUserModelBuilder';


document.addEventListener('DOMContentLoaded', async () => {

    const resourcesDir = '../../Resources/Haru/';


    /**
     * Canvasの初期化
     */

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;


    /**
     * Live2Dを表示
     */
    
    const resource: ISampleResource = await SampleResourceLoader
        .loadFromModel3JsonAsync(`${resourcesDir}Haru.model3.json`);

    const sampleApp: SampleApplication = new SampleApplication(canvas);

    const model: AppCubismUserModel = await new AppCubismUserModelBuilder()
        .setGlContext(sampleApp.gl)
        .fromSampleResourceAsync(resource);

    await sampleApp.setModelAsync(model);

    sampleApp.run();


    /**
     * HTML要素の初期化
     */

     // モーション選択
    const motionSelector = document.getElementById('motionSelector') as HTMLSelectElement;
    if (!!motionSelector) {

        motionSelector.innerHTML = '';
        const optionNoMotion = document.createElement('option');
        optionNoMotion.value = '';
        optionNoMotion.text = '--';
        motionSelector.appendChild(optionNoMotion);

        resource.motions.forEach((motionResource: IMotionResource) => {

            const option = document.createElement('option');
            option.value = motionResource.motionName;
            option.text = motionResource.motionName;

            motionSelector.appendChild(option);

        });

        motionSelector.addEventListener('change', () => {

            model.startMotion(motionSelector.value);

        });

    }


    // 表情の選択
    const expressionSelector = document.getElementById('expressionSelector') as HTMLSelectElement;
    if (!!expressionSelector) {

        expressionSelector.innerHTML = '';
        const optionNoExpression = document.createElement('option');
        optionNoExpression.value = '';
        optionNoExpression.text = '--';
        expressionSelector.appendChild(optionNoExpression);

        resource.expressions.forEach((expressionResource: IExpressionResource) => {

            const option = document.createElement('option');
            option.value = expressionResource.expressionName;
            option.text = expressionResource.expressionName;

            expressionSelector.appendChild(option);

        });

        expressionSelector.addEventListener('change', () => {

            model.startExpression(expressionSelector.value);

        });

    }

});