<script lang="ts">
    import type {AxisType, UpAxisTypes} from "./axis.utils";
    import type {Snippet} from "svelte";
    import {fade} from 'svelte/transition'

    type SlotRenderMap = Record<AxisType, () => any>

    function slotRender(frontAxis: AxisType, slots: Partial<SlotRenderMap>): Snippet | null {
        const key = `${frontAxis}`
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

    function calculateTextTransform(frontAxis: AxisType, upAxis: UpAxisTypes): string {
        switch (`${frontAxis}`) {
            case "front":
                return `transform: translateZ(calc(var(--size) / 2)) ${calculateTextRotation(upAxis)}`;
            case "back":
                return `transform: scale(-1, 1) translateZ(calc(-1 * var(--size) / 2)) ${calculateTextRotation(upAxis)}`
            case "bottom":
                return `transform: ;`
            case "top":
                return `transform: ;`
            case "left":
                return `transform: ;`
            case "right":
                return `transform: ;`
            default:
                return ""
        }
    }

    const props: {
        localAxisForwardSide: AxisType,
        localAxisUpSide: AxisType,
    } & Partial<SlotRenderMap> = $props()

    let transformStyle = $derived(calculateTextTransform(props.localAxisForwardSide, props.localAxisUpSide as UpAxisTypes));
    let slotToRender = $derived<Snippet | null>(slotRender(props.localAxisForwardSide, props));
    let animTransitionConfig = $state({duration: 250})
</script>

<div class="face-text" style={transformStyle}>
    {#if slotToRender}
        <div in:fade={animTransitionConfig}>
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