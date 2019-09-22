<template>
  <div id="wrapper">
    <!-- Sidebar -->
    <Sidebar />

    <div id="content">
      <!-- Page Content -->
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from './Sidebar'

export default {
  name: 'AppLayout',
  components: { Sidebar }
}
</script>
