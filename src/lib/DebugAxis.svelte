<script lang="ts">
</script>

<div class="debug-forward"></div>
<div class="debug-forward-side"></div>
<div class="debug-right"></div>
<div class="debug-right-side"></div>
<div class="debug-up"></div>
<div class="debug-up-side"></div>

<style>
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
</style>