<script lang="ts">
    const {children} = $props()
</script>

<div class="layout">
    {@render children()}
</div>

<style>
    .layout {
        display: flex;
        width: 100dvw;
        height: 100dvh;
        background: #ED9C9E;
    }
</style>