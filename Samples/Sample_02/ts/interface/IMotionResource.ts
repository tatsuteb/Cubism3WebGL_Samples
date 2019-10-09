// モーションに関する情報をまとめる
export default interface IMotionResource {
    motionName: string;
    buffer: ArrayBuffer;
    fadeInTime?: number;
    fadeOutTime?: number;
}