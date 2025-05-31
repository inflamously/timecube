<script lang="ts">
    import type {AxisTypes, UpAxisTypes} from "./Axis.types";
    import type {Snippet} from "svelte";

    type CombinedAxis = `${AxisTypes}${UpAxisTypes}`
    type SlotRenderMap = Record<CombinedAxis, () => any>

    function slotRender(frontAxis: AxisTypes, upAxis: UpAxisTypes, slots: Partial<SlotRenderMap>): Snippet | null {
        const key = `${frontAxis}${upAxis}`
        console.log(key);
        return slots?.[key as keyof typeof slots] ?? null
    }

    const props: {
        localAxisForwardSide: AxisTypes,
        localAxisUpSide: AxisTypes,
    } & Partial<SlotRenderMap> = $props()

    const upAxisTypes = props.localAxisUpSide as UpAxisTypes;
    let slotToRender = $state<Snippet | null>(null);

    $effect(() => {
        slotToRender = slotRender(props.localAxisForwardSide, upAxisTypes, props);
    })
</script>

<div class="face-text face-text-{props.localAxisForwardSide}-{props.localAxisUpSide}">
    {@render slotToRender?.()}
</div>

<style>
    .face-text {
        position: absolute;
        z-index: 999;
        user-select: none;
    }

    .face-text-front-top {
        transform: translateZ(calc(var(--size) / 2));
    }

    .face-text-front-bottom {
        transform: translateZ(calc(var(--size) / 2)) rotateZ(180deg);
    }

    .face-text-front-left {
        transform: translateZ(calc(var(--size) / 2)) rotateZ(90deg);
    }

    .face-text-front-right {
        transform: translateZ(calc(var(--size) / 2)) rotateZ(-90deg);
    }
</style>