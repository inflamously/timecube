<script lang="ts">
    import {type AxisType, calculateRotationTowardsWorldUp} from "./axis.utils";
    import type {Snippet} from "svelte";
    import {fade} from 'svelte/transition'

    type SlotRenderMap = Record<AxisType, () => any>

    function slotRender(forwardAxis: AxisType, slots: Partial<SlotRenderMap>): Snippet | null {
        const key = `${forwardAxis}`
        return slots?.[key as keyof typeof slots] ?? null
    }

    function calculateTextTransform(forwardAxis: AxisType, upAxis: AxisType, rightAxis: AxisType): string {
        if (forwardAxis === "front") {
            return `transform: translateZ(calc(var(--size) / 2)) ${calculateRotationTowardsWorldUp(upAxis)}`;
        }
        if (forwardAxis === "back") {
            return `transform: scale(-1, 1) translateZ(calc(-1 * var(--size) / 2)) ${calculateRotationTowardsWorldUp(upAxis)}`
        }
        if (upAxis === "front") {
            return `transform: rotateX(90deg) translateZ(calc(var(--size) / 2)) ${calculateRotationTowardsWorldUp(forwardAxis, true)};`
        }
        if (upAxis === "back") {
            return `transform: rotateX(-90deg) translateZ(calc((var(--size) + .5rem) / 2)) ${calculateRotationTowardsWorldUp(forwardAxis)};`
        }
        if (rightAxis === 'front') {
            return `transform: rotateY(90deg) translateZ(calc((var(--size) + .5rem) / 2)) ${calculateRotationTowardsWorldUp(upAxis)};`
        }
        if (rightAxis === 'back') {
            return `transform: rotateY(-90deg) translateZ(calc((var(--size) + .5rem) / 2)) ${calculateRotationTowardsWorldUp(upAxis)};`
        }

        return ""
    }

    const props: {
        localAxisForwardSide: AxisType,
        localAxisUpSide: AxisType,
        localAxisRightSide: AxisType,
    } & Partial<SlotRenderMap> = $props()

    let transformStyle = $derived(calculateTextTransform(props.localAxisForwardSide, props.localAxisUpSide, props.localAxisRightSide));
    let slotToRender = $derived<Snippet | null>(slotRender(props.localAxisForwardSide, props));
    let animTransitionConfig = $state({duration: 250})
</script>

<div class="face-text" style={transformStyle}>
    {#if slotToRender}
        <div in:fade={animTransitionConfig}
             out:fade={animTransitionConfig}>
            {@render slotToRender()}
        </div>
    {/if}
</div>

<style>
    .face-text {
        position: absolute;
        z-index: 999;
        user-select: none;
    }
</style>