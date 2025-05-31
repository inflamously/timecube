<script lang="ts">
    import {fade} from 'svelte/transition'
    import blackSide from '../assets/black.png'
    import redSide from '../assets/red.png'
    import blueSide from '../assets/blue.png'
    import whiteSide from '../assets/white.png'
    import yellowSide from '../assets/yellow.png'
    import greenSide from '../assets/green.png'
    import {glMatrix, mat4, quat, vec3} from 'gl-matrix'
    import DebugAxis from "./DebugAxis.svelte";

    type Vector2D = {
        x: number;
        y: number;
    }

    let drag = $state(false);
    let startPosition: Vector2D = $state({x: 0, y: 0});
    let rotationMatrix = $state(mat4.create())
    let rotationQuat = $state(quat.create());
    let transformPosition: string = $state(applyRotation(() => rotationMatrix))
    let localUpAxisSide = $state<string | null>('top')
    let localForwardAxisSide = $state<string | null>('front')

    let timer = $state('00:00')
    let debug = $state(true);

    $inspect(localUpAxisSide);
    $inspect(localForwardAxisSide);

    $effect(() => {
        transformPosition = applyRotation(() => rotationMatrix);
    })

    function startCubeRotationProcess(ev: MouseEvent) {
        drag = true;
        startPosition = {
            x: ev.clientX, y: ev.clientY
        }
    }

    function calculateSwipeDirectionsFromMouseDelta(deltaPosition: { x: number, y: number }, deltaOffset: number) {
        let swipeDirectionX = 0;
        if (Math.abs(deltaPosition.x) > deltaOffset) {
            swipeDirectionX = Math.sign(deltaPosition.x)
        }
        let swipeDirectionY = 0;
        if (Math.abs(deltaPosition.y) > deltaOffset) {
            swipeDirectionY = Math.sign(deltaPosition.y)
        }

        return [swipeDirectionX, swipeDirectionY]
    }

    function applySwipeRotationToQuaternion(swipeDirectionX: number, swipeDirectionY: number) {
        const incrementX = quat.create();
        const incrementY = quat.create();

        if (swipeDirectionX !== 0) {
            const angle = swipeDirectionX * 90; // +90 for right, -90 for left
            quat.setAxisAngle(incrementX, [0, 1, 0], glMatrix.toRadian(angle));
        }

        if (swipeDirectionY !== 0) {
            const angle = -swipeDirectionY * 90; // +90 for up, -90 for down
            quat.setAxisAngle(incrementY, [1, 0, 0], glMatrix.toRadian(angle));
        }

        quat.multiply(rotationQuat, incrementX, rotationQuat);
        quat.multiply(rotationQuat, incrementY, rotationQuat);
        rotationMatrix = mat4.fromQuat(mat4.create(), rotationQuat);
    }

    function applyCubeRotationProcess(ev: MouseEvent) {
        if (!drag) {
            return;
        }

        drag = false;

        const actualPosition: Vector2D = {
            x: ev.clientX,
            y: ev.clientY
        }

        const deltaOffset = 50;
        const deltaPosition: Vector2D = {
            x: actualPosition.x - startPosition.x,
            y: actualPosition.y - startPosition.y
        }

        if (Math.abs(deltaPosition.x) < deltaOffset && Math.abs(deltaPosition.y) < deltaOffset) {
            return;
        }

        const [swipeDirectionX, swipeDirectionY] = calculateSwipeDirectionsFromMouseDelta(deltaPosition, deltaOffset)
        applySwipeRotationToQuaternion(swipeDirectionX, swipeDirectionY);
        calculateLocalForwardAndUpVector();
    }

    function calculateLocalForwardAndUpVector() {
        const normalizedRotationQuat = quat.create()
        quat.normalize(normalizedRotationQuat, rotationQuat);
        const signedUpVec = calculateLocalAxisVectorFromWorldVector([0, -1, 0], normalizedRotationQuat)
        const signedForwardVec = calculateLocalAxisVectorFromWorldVector([0, 0, 1], normalizedRotationQuat)
        localUpAxisSide = calculateSideFromWorldVector([signedUpVec[0], signedUpVec[1], signedUpVec[2]])
        localForwardAxisSide = calculateSideFromWorldVector([signedForwardVec[0], signedForwardVec[1], signedForwardVec[2]])
    }

    function calculateSideFromWorldVector([x, y, z]: [number, number, number]): string | null {
        if (x === 1) {
            return "right"
        }
        if (x === -1) {
            return "left"
        }
        if (y === -1) {
            return "top"
        }
        if (y === 1) {
            return "bottom"
        }
        if (z === -1) {
            return "back"
        }
        if (z === 1) {
            return "front"
        }
        return null
    }

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

    function applyRotation(rotMatrix: () => mat4): string {
        const perspective = 10000;
        return `perspective(${perspective}px) matrix3d(${rotMatrix().join(",")})`
    }
</script>

<div class="interaction-container">
    <button aria-label="interactor"
            class="interactor no-button"
            onmousedown={startCubeRotationProcess}
            onmouseup={applyCubeRotationProcess}
            onmouseleave={applyCubeRotationProcess}></button>
    <div class="container"
         style:--transform={transformPosition}>
        {#if debug}
            <DebugAxis/>
        {/if}
        {#if localUpAxisSide === 'top' && localForwardAxisSide === 'front'}
            <div class="text text-front-bottom" in:fade={{ duration: 250 }} out:fade={{ duration: 250 }}>{timer}</div>
        {/if}
        {#if localUpAxisSide === 'bottom' && localForwardAxisSide === 'front'}
            <div class="text text-front-top" in:fade={{ duration: 250 }} out:fade={{ duration: 250 }}>{timer}</div>
        {/if}
        {#if localUpAxisSide === 'right' && localForwardAxisSide === 'front'}
            <div class="text text-front-right" in:fade={{ duration: 250 }} out:fade={{ duration: 250 }}>{timer}</div>
        {/if}
        {#if localUpAxisSide === 'left' && localForwardAxisSide === 'front'}
            <div class="text text-front-left" in:fade={{ duration: 250 }} out:fade={{ duration: 250 }}>{timer}</div>
        {/if}
        <div class="face front">
            <img src={blackSide} alt=""/>
        </div>
        <div class="face right">
            <img src={redSide} alt=""/>
        </div>
        <div class="face left">
            <img src={blueSide} alt=""/>
        </div>
        <div class="face back">
            <img src={whiteSide} alt=""/>
        </div>
        <div class="face top">
            <img src={yellowSide} alt=""/>
        </div>
        <div class="face bottom">
            <img src={greenSide} alt=""/>
        </div>
    </div>
</div>

<style>
    :root {
        --size: calc(10rem + 15vw);
        --font-size: calc(4rem + 2vw);
        --text-to-line: calc(var(--size) / 2.25)
    }

    .interactor {
        position: absolute;
        z-index: 1000;
        cursor: crosshair;
        width: var(--size);
        height: var(--size);
    }

    .interaction-container {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        transform-style: preserve-3d;
        width: var(--size);
        height: var(--size);
        transform: var(--transform);
        transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .text {
        position: absolute;
        color: white;
        font-weight: 1000;
        font-size: var(--font-size);
        z-index: 999;
        user-select: none;
    }

    .text-front-top {
        transform: translateZ(calc(var(--size) / 2)) rotateZ(180deg);
    }

    .text-front-bottom {
        transform: translateZ(calc(var(--size) / 2));
    }

    .text-front-left {
        transform: translateZ(calc(var(--size) / 2)) rotateZ(90deg);
    }

    .text-front-right {
        transform: translateZ(calc(var(--size) / 2)) rotateZ(-90deg);
    }

    .no-button {
        background: unset;
        border: unset;
        padding: unset;
    }

    .face {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0.7;
        overflow: hidden;
    }

    .face.front {
        transform: translateZ(calc(var(--size) / 2));
    }

    .face.back {
        transform: translateZ(calc(-1 * var(--size) / 2)) scale(-1, 1);
    }

    .face.right {
        transform: rotateY(90deg) scaleX(-1) translateZ(calc(-1 * var(--size) / 2));
    }

    .face.left {
        transform: rotateY(90deg) translateZ(calc(var(--size) / 2));
    }

    .face.top {
        transform: rotateX(-90deg) scaleX(-1) rotateZ(180deg) translateZ(calc(-1 * var(--size) / 2));
    }

    .face.bottom {
        transform: rotateX(-90deg) translateZ(calc(var(--size) / 2));
    }

    img {
        -webkit-user-drag: none;
        -ms-user-drag: none;
        -moz-user-drag: none;
        user-drag: none;
        width: var(--size);
        height: var(--size);
    }
</style>