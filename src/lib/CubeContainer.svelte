<script lang="ts">
    const {children} = $props()
</script>

<div class="container">
    {@render children()}
</div>

<style>
    .container {
        margin: auto;
    }
</style>