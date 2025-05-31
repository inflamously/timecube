import {quat, vec3} from "gl-matrix";
import {calculateSideFromWorldVector} from "./axis.utils";

function calculateSignedVector(a: number, offset: number) {
    return Math.sign(a > offset ? a : a < -offset ? a : 0)
}

function calculateLocalAxisVectorFromWorldVector(axis: vec3, normalizedRotationQuat: quat) {
    const signOffsetValue = 0.001
    let rotationAppliedAxisVector = vec3.create()
    vec3.transformQuat(rotationAppliedAxisVector, axis, normalizedRotationQuat)
    return [
        calculateSignedVector(rotationAppliedAxisVector[0], signOffsetValue),
        calculateSignedVector(rotationAppliedAxisVector[1], signOffsetValue),
        calculateSignedVector(rotationAppliedAxisVector[2], signOffsetValue)
    ]
}

export function calculateLocalForwardAndUpVector(rotationQuat: quat) {
    const normalizedRotationQuat = quat.create()
    quat.normalize(normalizedRotationQuat, rotationQuat);
    const signedUpVec = calculateLocalAxisVectorFromWorldVector([0, -1, 0], normalizedRotationQuat)
    const signedForwardVec = calculateLocalAxisVectorFromWorldVector([0, 0, 1], normalizedRotationQuat)
    return [calculateSideFromWorldVector([signedUpVec[0], signedUpVec[1], signedUpVec[2]]), calculateSideFromWorldVector([signedForwardVec[0], signedForwardVec[1], signedForwardVec[2]])]
}