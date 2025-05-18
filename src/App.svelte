<script lang="ts">
import Layout from "./lib/Layout.svelte";
import Cube from "./lib/Cube.svelte";
import CubeContainer from "./lib/CubeContainer.svelte";
</script>

<main>
  <Layout>
    <CubeContainer slot="children">
      <Cube slot="children"></Cube>
    </CubeContainer>
  </Layout>
</main>

<style>

</style>
