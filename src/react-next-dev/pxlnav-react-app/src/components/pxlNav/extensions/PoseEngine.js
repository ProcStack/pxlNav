
import { ExtensionBase } from './ExtensionBase.js';
import { MediaPipePoseEngine } from './PoseEngine/MediaPipe.js';

const pxlPoseEngineList = [
  'MediaPipe'
  /*
  'PoseNet',
  'FaceEngine',
  'FaceMesh',
  'FaceNet',
  'HandEngine',
  'HandPose',
  'HandNet',
  'HandMesh'
  */
];

export default class PoseEngine extends ExtensionBase {
  constructor(modelName) {
    super();
    this.active = false;
    this.verbose = false;


    switch (modelName) {
      case 'MediaPipe':
        this.model = new MediaPipePoseEngine(); // Google's model
        break;
      default:
        throw new Error("Unknown pose estimation '"+modelName+"' model");
    }
  }

  async estimatePose(input) {
    return await this.model.estimate(input);
  }
}