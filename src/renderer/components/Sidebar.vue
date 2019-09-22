<template>
  <nav id="sidebar">
    <div class="sidebar-header">
      <h3>easy-mt</h3>
    </div>

    <ul class="list-unstyled components">
      <li>
        <router-link
          :to="{name: 'home'}"
          exact
        >
          <i class="material-icons">home</i>
          {{ $t('sidebarLinkHome') }}
        </router-link>
      </li>
      <li>
        <router-link
          :to="{name: 'setup'}"
          exact
        >
          <i class="material-icons">settings</i>
          {{ $t('sidebarLinkSetup') }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>
