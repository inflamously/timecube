<script lang="ts">
    import type {AxisTypes, UpAxisTypes} from "./Axis.types";
    import type {Snippet} from "svelte";
    import {fade, crossfade} from 'svelte/transition'

    type CombinedAxis = `${AxisTypes}${UpAxisTypes}`
    type SlotRenderMap = Record<CombinedAxis, () => any>

    function slotRender(frontAxis: AxisTypes, upAxis: UpAxisTypes, slots: Partial<SlotRenderMap>): Snippet | null {
        const key = `${frontAxis}${upAxis}`
        console.log(key);
        return slots?.[key as keyof typeof slots] ?? null
    }

    function calculateTextRotation(upAxis: UpAxisTypes) {
        switch (upAxis) {
            case "top":
                return ""
            case "bottom":
                return "rotateZ(180deg)"
            case "left":
                return "rotateZ(90deg)"
            case "right":
                return "rotateZ(-90deg)"
            default:
                return ""
        }
    }

    function calculateTextTransform(frontAxis: AxisTypes, upAxis: UpAxisTypes) {
        switch (`${frontAxis}`) {
            case "front":
                return `transform: translateZ(calc(var(--size) / 2)) ${calculateTextRotation(upAxis)}`;
            case "back":
                return `transform: scale(-1, 1) translateZ(calc(-1 * var(--size) / 2)) ${calculateTextRotation(upAxis)}`
            default:
                return ""
        }
    }

    const props: {
        localAxisForwardSide: AxisTypes,
        localAxisUpSide: AxisTypes,
    } & Partial<SlotRenderMap> = $props()

    let transformStyle = $derived(calculateTextTransform(props.localAxisForwardSide, props.localAxisUpSide as UpAxisTypes));
    let slotToRender = $derived<Snippet | null>(slotRender(props.localAxisForwardSide, props.localAxisUpSide as UpAxisTypes, props));
    let animTransitionConfig = $state({duration: 250})
</script>

<div class="face-text" style={transformStyle}>
    <span>{props.localAxisForwardSide + props.localAxisUpSide}</span>
    {#key props.localAxisForwardSide + props.localAxisUpSide}
        {#if slotToRender}
            <div in:fade={animTransitionConfig}
                 out:fade={animTransitionConfig}>
                {@render slotToRender?.()}
            </div>
        {/if}
    {/key}
</div>

<style>
    .face-text {
        position: absolute;
        z-index: 999;
        user-select: none;
    }
</style>