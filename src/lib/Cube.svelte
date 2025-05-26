<script lang="ts">
    import blackSide from '../assets/black.png'
    import redSide from '../assets/red.png'
    import blueSide from '../assets/blue.png'
    import whiteSide from '../assets/white.png'
    import yellowSide from '../assets/yellow.png'
    import greenSide from '../assets/green.png'

    type CubeSides = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

    type Vector2D = {
        x: number;
        y: number;
    }

    let drag = $state(false);
    let startPosition: Vector2D = $state({x: 0, y: 0});
    let side: CubeSides = $state('front');
    let transformPosition: string = $state(getCubeRotationSideStyle(() => side))

    $effect(() => {
        transformPosition = getCubeRotationSideStyle(() => side);
    })

    function calcNextDirection(currentDirection: () => CubeSides, swipeDirections: Vector2D): CubeSides {
        console.log(currentDirection, swipeDirections);
        switch (currentDirection()) {
            case "front":
                // Bottom
                if (swipeDirections.y < 0) {
                    return 'top'
                }
                // Top
                if (swipeDirections.y > 0) {
                    return 'bottom'
                }
                break;
            case "top":
                // Bottom
                if (swipeDirections.y < 0) {
                    return 'back'
                }
                // Top
                if (swipeDirections.y > 0) {
                    return 'front'
                }
        }

        return currentDirection()
    }

    function startCubeRotation(ev: MouseEvent) {
        drag = true;
        startPosition = {
            x: ev.clientX, y: ev.clientY
        }
    }

    function adjustCubeRotation(ev: MouseEvent) {
        if (!drag) {
            return;
        }
    }

    function stopCubeRotation(ev: MouseEvent) {
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

        side = calcNextDirection(() => side, {
            x: swipeDirectionX,
            y: swipeDirectionY
        })
    }

    function getCubeRotationSideStyle(side: () => CubeSides): string {
        const perspective = 10000;
        const result = `perspective(${perspective}px)`

        switch (side()) {
            case "front":
                return ''
            case "back":
                return `${result} rotateX(180deg) rotateZ(180deg) scaleX(-1)`
            case 'left':
                return `${result} rotateY(-90deg) scaleX(-1)`;
            case 'right':
                return `${result} rotateY(-90deg)`;
            case 'top':
                return `${result} rotateX(90deg)`
            case 'bottom':
                return `${result} rotateX(-90deg)`
            default:
                return ''
        }
    }
</script>

<div>
    <div class="container" style:--transform={transformPosition}>
        <button class="face front"
                onmousedown={startCubeRotation}
                onmousemove={adjustCubeRotation}
                onmouseup={stopCubeRotation}
                onmouseleave={stopCubeRotation}
                tabindex="-1">
            <img src={blackSide} alt=""/>
        </button>
        <button class="face right"
                onmousedown={startCubeRotation}
                onmousemove={adjustCubeRotation}
                onmouseup={stopCubeRotation}
                onmouseleave={stopCubeRotation}
                tabindex="-2">
            <img src={redSide} alt=""/>
        </button>
        <button class="face left"
                onmousedown={startCubeRotation}
                onmousemove={adjustCubeRotation}
                onmouseup={stopCubeRotation}
                onmouseleave={stopCubeRotation}
                tabindex="-3">
            <img src={blueSide} alt=""/>
        </button>
        <button class="face back"
                onmousedown={startCubeRotation}
                onmousemove={adjustCubeRotation}
                onmouseup={stopCubeRotation}
                onmouseleave={stopCubeRotation}
                tabindex="-4">
            <img src={whiteSide} alt=""/>
        </button>
        <button class="face top"
                onmousedown={startCubeRotation}
                onmousemove={adjustCubeRotation}
                onmouseup={stopCubeRotation}
                onmouseleave={stopCubeRotation}
                tabindex="-5">
            <img src={yellowSide} alt=""/>
        </button>
        <button class="face bottom"
                onmousedown={startCubeRotation}
                onmousemove={adjustCubeRotation}
                onmouseup={stopCubeRotation}
                onmouseleave={stopCubeRotation}
                tabindex="-6">
            <img src={greenSide} alt=""/>
        </button>
    </div>
</div>

<style>
    :root {
        --size: 25vw;
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

    .face {
        background: unset;
        border: unset;
        padding: unset;
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