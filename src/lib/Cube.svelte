<script lang="ts">
    import blackSide from '../assets/black.png'
    import redSide from '../assets/red.png'
    import blueSide from '../assets/blue.png'
    import whiteSide from '../assets/white.png'
    import yellowSide from '../assets/yellow.png'
    import greenSide from '../assets/green.png'

    function startCubeRotation() {
        console.log("Cube rot!");
    }

    function adjustCubeRotation() {

    }
</script>

<div>
    <div class="container">
        <button class="face front" on:mousedown={startCubeRotation} on:mousemove={adjustCubeRotation} tabindex="-1">
            <img src={blackSide} alt=""/>
        </button>
        <button class="face right" on:mousedown={startCubeRotation} on:mousemove={adjustCubeRotation} tabindex="-2">
            <img src={redSide} alt=""/>
        </button>
        <button class="face left" on:mousedown={startCubeRotation} on:mousemove={adjustCubeRotation} tabindex="-3">
            <img src={blueSide} alt=""/>
        </button>
        <button class="face back" on:mousedown={startCubeRotation} on:mousemove={adjustCubeRotation} tabindex="-4">
            <img src={whiteSide} alt=""/>
        </button>
        <button class="face top" on:mousedown={startCubeRotation} on:mousemove={adjustCubeRotation} tabindex="-5">
            <img src={yellowSide} alt=""/>
        </button>
        <button class="face bottom" on:mousedown={startCubeRotation} on:mousemove={adjustCubeRotation}
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
        perspective: 10000px;
        transform-style: preserve-3d;
        width: var(--size);
        height: var(--size);
        transform-origin: 50% 50%;
        animation: rotate 60s infinite linear;
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
        transform: rotateX(-90deg) translateZ(calc(-1 * var(--size) / 2));
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