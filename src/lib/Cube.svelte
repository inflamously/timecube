<script lang="ts">
    import blackSide from '../assets/black.png'
    import redSide from '../assets/red.png'
    import blueSide from '../assets/blue.png'
    import whiteSide from '../assets/white.png'
    import yellowSide from '../assets/yellow.png'
    import greenSide from '../assets/green.png'
    import {glMatrix, mat4, quat} from 'gl-matrix'

    type CubeSides = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

    type Vector2D = {
        x: number;
        y: number;
    }

    let drag = $state(false);
    let startPosition: Vector2D = $state({x: 0, y: 0});
    let side: CubeSides = $state('front');
    let relativeRotationX = $state(0)
    let relativeRotationY = $state(0)
    let rotationMatrix = $state(mat4.create())
    let rotationQuat = $state(quat.create());
    let transformPosition: string = $state(getCubeRotationSideStyle(() => side, () => relativeRotationX, () => relativeRotationY, () => rotationMatrix))

    $effect(() => {
        transformPosition = getCubeRotationSideStyle(() => side, () => relativeRotationX, () => relativeRotationY, () => rotationMatrix);
        console.log("new side", relativeRotationX, relativeRotationY);
    })

    function calcNextDirection(currentDirection: () => CubeSides, swipeDirections: Vector2D): CubeSides {
        console.log(currentDirection, swipeDirections);
        switch (currentDirection()) {
            case "front":
                if (swipeDirections.y < 0) {
                    return 'bottom'
                }
                if (swipeDirections.y > 0) {
                    return 'top'
                }
                if (swipeDirections.x < 0) {
                    return 'right'
                }
                if (swipeDirections.x > 0) {
                    return 'left'
                }
                break;
            case "top":
                if (swipeDirections.y < 0) {
                    return 'front'
                }
                if (swipeDirections.y > 0) {
                    return 'back'
                }
                break
            case "back":
                if (swipeDirections.y < 0) {
                    return 'top'
                }
                if (swipeDirections.y > 0) {
                    return 'bottom'
                }
                break;
            case "bottom":
                if (swipeDirections.y < 0) {
                    return 'back'
                }
                if (swipeDirections.y > 0) {
                    return 'front'
                }
                break;
            case "right":
                if (swipeDirections.x < 0) {
                    return 'back'
                }
                if (swipeDirections.x > 0) {
                    return 'front'
                }
                break;
            case "left":
                if (swipeDirections.x < 0) {
                    return 'right'
                }
                if (swipeDirections.x > 0) {
                    return 'left'
                }
                break
        }

        return currentDirection()
    }

    function startCubeRotation(ev: MouseEvent) {
        drag = true;
        startPosition = {
            x: ev.clientX, y: ev.clientY
        }
    }

    function stopCubeRotation(ev: MouseEvent) {
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

        if (swipeDirectionY > 0) {
            relativeRotationY += -90;
            rotationQuat = quat.rotateX(quat.create(), rotationQuat, glMatrix.toRadian(90))
        }
        if (swipeDirectionY < 0) {
            relativeRotationY += 90;
            rotationQuat = quat.rotateX(quat.create(), rotationQuat, glMatrix.toRadian(-90))
        }

        if (swipeDirectionX > 0) {
            relativeRotationX += 90;
            rotationQuat = quat.rotateY(quat.create(), rotationQuat, glMatrix.toRadian(-90))
        }
        if (swipeDirectionX < 0) {
            relativeRotationX += -90;
            rotationQuat = quat.rotateY(quat.create(), rotationQuat, glMatrix.toRadian(90))
        }


        rotationMatrix = mat4.fromQuat(rotationMatrix, rotationQuat);
        // console.log(quat.str(rotationQuat), rotationQuat * 180 / Math.PI, glMatrix.toRadian(90))
    }

    function getCubeRotationSideStyle(side: () => CubeSides, rotX: () => number, rotY: () => number, rotationVector: () => mat4): string {
        const perspective = 10000;

        // console.log(rotX(), Math.abs(rotX()) % 180 ? 'B' : 'A')
        //
        // const rotA = rotX() % 180

        const x = 0
        const y = 0
        const z = 0
        const angle = 0

        // return `perspective(${perspective}px) rotate3d(${x}, ${y}, ${z}, ${angle}deg)`
        return `perspective(${perspective}px) matrix3d(${rotationMatrix.join(",")})`//rotateX(${rotationQuat[0]}rad) rotateY(${rotationQuat[1]}rad) rotateZ(${rotationQuat[2]}rad)`//matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)`

        // switch (side()) {
        //     case "front":
        //         return ''
        //     case "back":
        //         return `${result} rotateX(180deg) rotateZ(180deg) scaleX(-1)`
        //     case 'left':
        //         return `${result} rotateY(-90deg) scaleX(-1)`;
        //     case 'right':
        //         return `${result} rotateY(-90deg)`;
        //     case 'top':
        //         return `${result} rotateX(-90deg)`
        //     case 'bottom':
        //         return `${result} rotateX(90deg)`
        //     default:
        //         return ''
        // }
    }
</script>

<div>
    <button aria-label="interactor"
            class="interactor no-button"
            onmousedown={startCubeRotation}
            onmouseup={stopCubeRotation}
            onmouseleave={stopCubeRotation}></button>
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