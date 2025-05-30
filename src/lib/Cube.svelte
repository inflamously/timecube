<script lang="ts">
    import blackSide from '../assets/black.png'
    import redSide from '../assets/red.png'
    import blueSide from '../assets/blue.png'
    import whiteSide from '../assets/white.png'
    import yellowSide from '../assets/yellow.png'
    import greenSide from '../assets/green.png'
    import {glMatrix, mat4, quat, vec3} from 'gl-matrix'

    type Vector2D = {
        x: number;
        y: number;
    }

    let drag = $state(false);
    let startPosition: Vector2D = $state({x: 0, y: 0});
    let cubeForward = $state<vec3>([0, 0, 1]);
    let rotationMatrix = $state(mat4.create())
    let rotationQuat = $state(quat.create());
    let transformPosition: string = $state(applyRotation(() => rotationMatrix))
    let timer = $state('00:00')
    let upAxisSide = $state<string | null>('top')
    let forwardAxisSide = $state<string | null>('front')
    let debug = $state(true);

    $inspect(upAxisSide)
    $inspect(forwardAxisSide)

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

        // TODO: Refactor to function
        const normalizeRotationQuat = quat.create()
        quat.normalize(normalizeRotationQuat, rotationQuat);
        const signOffsetValue = 0.001
        const signOffset = (a: number, offset: number) => Math.sign(a > offset ? a : a < -offset ? a : 0)
        const calculateSide = ([x, y, z]: [number, number, number]): string | null => {
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
        let forwardVec = vec3.create()
        let upVec = vec3.create()
        vec3.transformQuat(upVec, [0, -1, 0], normalizeRotationQuat)
        vec3.transformQuat(forwardVec, [0, 0, 1], normalizeRotationQuat)
        const signedUpVec = [signOffset(upVec[0], signOffsetValue), signOffset(upVec[1], signOffsetValue), signOffset(upVec[2], signOffsetValue)]
        const signedForwardVec = [signOffset(forwardVec[0], signOffsetValue), signOffset(forwardVec[1], signOffsetValue), signOffset(forwardVec[2], signOffsetValue)]
        upAxisSide = calculateSide([signedUpVec[0], signedUpVec[1], signedUpVec[2]])
        forwardAxisSide = calculateSide([signedForwardVec[0], signedForwardVec[1], signedForwardVec[2]])
    }

    function applyRotation(rotMatrix: () => mat4): string {
        const perspective = 10000;
        return `perspective(${perspective}px) matrix3d(${rotMatrix().join(",")})`
    }
</script>

<div>
    <button aria-label="interactor"
            class="interactor no-button"
            onmousedown={startCubeRotationProcess}
            onmouseup={applyCubeRotationProcess}
            onmouseleave={applyCubeRotationProcess}></button>
    <div class="container"
         style:--transform={transformPosition}>
        {#if debug}
            <div class="debug-forward"></div>
            <div class="debug-forward-side"></div>
            <div class="debug-right"></div>
            <div class="debug-right-side"></div>
            <div class="debug-up"></div>
            <div class="debug-up-side"></div>
        {/if}
        <div class="text text-front-bottom"
             class:text-visible={upAxisSide === 'top' && forwardAxisSide === 'front'}>{timer}</div>
        <div class="text text-front-top"
             class:text-visible={upAxisSide === 'bottom'  && forwardAxisSide === 'front'}>{timer}</div>
        <div class="text text-front-right"
             class:text-visible={upAxisSide === 'right'  && forwardAxisSide === 'front'}>{timer}</div>
        <div class="text text-front-left"
             class:text-visible={upAxisSide === 'left'  && forwardAxisSide === 'front'}>{timer}</div>
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
        --font-size: calc(1rem + 1.5vw);
        --text-to-line: calc(var(--size) / 2.25)
    }

    .debug-forward, .debug-forward-side, .debug-up, .debug-up-side, .debug-right, .debug-right-side {
        position: absolute;
        width: 48px;
        height: 48px;
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);

        user-select: none;
        z-index: 1001;
    }

    .debug-forward {
        transform: translateZ(var(--size));
        background: red;
    }

    .debug-forward-side {
        transform: translateZ(var(--size)) rotateY(90deg);
        background: red;
    }

    .debug-up {
        transform: translateY(calc(-1 * var(--size)));
        background: green;
    }

    .debug-up-side {
        transform: translateY(calc(-1 * var(--size))) rotateY(-90deg);
        background: green;
    }

    .debug-right {
        transform: translateX(var(--size));
        background: blue;
    }

    .debug-right-side {
        transform: translateX(var(--size)) rotateY(-90deg);
        background: blue;
    }

    .interactor {
        position: absolute;
        z-index: 1000;
        cursor: crosshair;
        width: var(--size);
        height: var(--size);
    }

    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        transform-style: preserve-3d;
        width: var(--size);
        height: var(--size);
        transform-origin: 50% 50%;
        transform: var(--transform);
        transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .text {
        position: absolute;
        color: white;
        font-weight: 1000;
        font-size: var(--font-size);
        z-index: 1001;
        user-select: none;
        visibility: hidden;
    }

    .text-visible {
        visibility: visible;
    }

    .text-front-top {
        transform: translateZ(calc(var(--size) / 2)) translateY(calc(-1 * var(--text-to-line))) rotateZ(180deg);
    }

    .text-front-bottom {
        transform: translateZ(calc(var(--size) / 2)) translateY(var(--text-to-line));
    }

    .text-front-left {
        transform: translateZ(calc(var(--size) / 2)) translateX(calc(-1 * var(--text-to-line))) rotateZ(90deg);
    }

    .text-front-right {
        transform: translateZ(calc(var(--size) / 2)) translateX(var(--text-to-line)) rotateZ(-90deg);
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