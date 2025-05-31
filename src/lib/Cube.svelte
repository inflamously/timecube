<script lang="ts">
    import blackSide from '../assets/black.png'
    import redSide from '../assets/red.png'
    import blueSide from '../assets/blue.png'
    import whiteSide from '../assets/white.png'
    import yellowSide from '../assets/yellow.png'
    import greenSide from '../assets/green.png'
    import {glMatrix, mat4, quat, vec3} from 'gl-matrix'
    import DebugAxis from "./DebugAxis.svelte";
    import {type AxisType} from "./axis.utils";
    import {calculateLocalForwardAndUpVector} from "./vector.utils";
    import CubeFaceContentRender from "./CubeFaceContentRender.svelte";

    type Vector2D = {
        x: number;
        y: number;
    }

    let drag = $state(false);
    let startPosition: Vector2D = $state({x: 0, y: 0});
    let rotationMatrix = $state(mat4.create())
    let rotationQuat = $state(quat.create());
    let transformPosition: string = $derived(applyRotation(() => rotationMatrix))
    let localUpAxisSide = $state<AxisType | null>('top')
    let localForwardAxisSide = $state<AxisType | null>('front')
    let localRightAxisSide = $state<AxisType | null>('right')

    let timer = $state('12:00')
    let debug = $state(true);

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
        const [upVec, forwardVec, rightVec] = calculateLocalForwardAndUpVector(rotationQuat);
        localUpAxisSide = upVec
        localForwardAxisSide = forwardVec
        localRightAxisSide = rightVec
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
        {#if localForwardAxisSide && localUpAxisSide && localRightAxisSide}
            <CubeFaceContentRender
                    localAxisForwardSide={localForwardAxisSide}
                    localAxisUpSide={localUpAxisSide}
                    localAxisRightSide={localRightAxisSide}>
                {#snippet front()}
                    <div class="text text-white">{timer}</div>
                {/snippet}
                {#snippet back()}
                    <div class="text">XYZ</div>
                {/snippet}
                {#snippet top()}
                    <div class="text">XYZ</div>
                {/snippet}
                {#snippet bottom()}
                    <div class="text">XYZ</div>
                {/snippet}
                {#snippet right()}
                    <div class="text">XYZ</div>
                {/snippet}
                {#snippet left()}
                    <div class="text">XYZ</div>
                {/snippet}
            </CubeFaceContentRender>
        {/if}
        <div class="face front">
            <img src={blackSide} alt=""/>
        </div>
        <div class="face left">
            <img src={redSide} alt=""/>
        </div>
        <div class="face right">
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
        color: white;
        font-weight: 1000;
        font-size: var(--font-size);
    }

    .text-white {
        color: white;
    }

    .text-black {
        color: black;
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

    .face.left {
        transform: rotateY(90deg) scaleX(-1) translateZ(calc(-1 * var(--size) / 2));
    }

    .face.right {
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