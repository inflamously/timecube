<script lang="ts">
    import blackSide from '../assets/black.png'
    import redSide from '../assets/red.png'
    import blueSide from '../assets/blue.png'
    import whiteSide from '../assets/white.png'
    import yellowSide from '../assets/yellow.png'
    import greenSide from '../assets/green.png'
    import {glMatrix, mat4, quat, vec3} from 'gl-matrix'

    type CubeSides = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

    type Vector2D = {
        x: number;
        y: number;
    }

    let drag = $state(false);
    let startPosition: Vector2D = $state({x: 0, y: 0});
    let side: CubeSides = $state('front');
    let yaw = $state(0);
    let roll = $state(0);
    let rotationMatrix = $state(mat4.create())
    let rotationQuat = $state(quat.create());
    let transformPosition: string = $state(applyRotation(() => rotationMatrix))

    $effect(() => {
        transformPosition = applyRotation(() => rotationMatrix);
    })

    function startCubeRotationProcess(ev: MouseEvent) {
        console.log("drag start");
        drag = true;
        startPosition = {
            x: ev.clientX, y: ev.clientY
        }
    }

    function applyCubeRotationProcess(ev: MouseEvent) {
        console.log("drag finished");
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

        let swipeDirectionX = 0;
        if (Math.abs(deltaPosition.x) > deltaOffset) {
            swipeDirectionX = Math.sign(deltaPosition.x)
        }
        let swipeDirectionY = 0;
        if (Math.abs(deltaPosition.y) > deltaOffset) {
            swipeDirectionY = Math.sign(deltaPosition.y)
        }

        const incrementX = quat.create();
        const incrementY = quat.create();
        console.log(swipeDirectionX, swipeDirectionY);

        if (swipeDirectionX !== 0) {
            const angle = swipeDirectionX * 90; // +90 for right, -90 for left
            quat.setAxisAngle(incrementX, [0, 1, 0], glMatrix.toRadian(angle));
        }

        // Apply Y-axis rotation (swipe up/down)
        if (swipeDirectionY !== 0) {
            const angle = -swipeDirectionY * 90; // +90 for up, -90 for down
            quat.setAxisAngle(incrementY, [1, 0, 0], glMatrix.toRadian(angle));
        }

        // Combine rotations: rotation = rotation * newRotation
        quat.multiply(rotationQuat, incrementX, rotationQuat); // Apply X-rotation
        quat.multiply(rotationQuat, incrementY, rotationQuat); // Apply Y-rotation

        rotationMatrix = mat4.fromQuat(mat4.create(), rotationQuat);
    }

    function applyRotation(rotMatrix: () => mat4): string {
        const perspective = 10000;
        console.log(rotMatrix());
        return `perspective(${perspective}px) matrix3d(${rotMatrix().join(",")})`//rotateX(${rotationQuat[0]}rad) rotateY(${rotationQuat[1]}rad) rotateZ(${rotationQuat[2]}rad)`//matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)`
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
        <div class="face front">
            <img src={blackSide} alt=""/>
        </div>
        <div class="face right">
            <img src={redSide} alt=""/>
        </div>
        <div class="face left"
        >
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
        --size: 25vw;
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
        transform: translateZ(calc(-1 * var(--size) / 2));
    }

    .face.right {
        transform: rotateY(90deg) translateZ(calc(-1 * var(--size) / 2));
    }

    .face.left {
        transform: rotateY(90deg) translateZ(calc(var(--size) / 2));
    }

    .face.top {
        transform: rotateX(-90deg) rotateZ(180deg) scaleX(-1) translateZ(calc(-1 * var(--size) / 2));
    }

    .face.bottom {
        transform: rotateX(-90deg) translateZ(calc(var(--size) / 2));
    }

    img {
        -webkit-user-drag: none;
        -ms-user-drag: none;
        -moz-user-drag: none;
        user-drag: none;
        width: 25vw;
        height: 25vw;
    }
</style>