<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <div class="header-logo-title">
        <img src="/logo.png" alt="Logo" class="logo">
        <div class="header-title">深渡智慧农业平台</div>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="header-menu"
        mode="horizontal"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- Normal Menu Item -->
          <el-menu-item v-if="!route.children || route.path === 'intelligent-analysis'" :index="'/' + route.path" @click="navigateTo('/' + route.path)">
            <el-dropdown v-if="route.path === 'intelligent-analysis'" @command="handleAnalysisCommand">
              <span class="el-dropdown-link" :class="{ 'is-active': isAnalysisActive }">
                {{ route.meta.title }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="subRoute in route.children" :key="subRoute.path" :command="subRoute.path">
                    {{ subRoute.meta.title }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <span v-else>{{ route.meta.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
      
      <!-- Right side of header -->
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleNotificationClick">
          <el-badge :value="5" class="notification-badge">
            <el-icon class="header-icon"><Bell /></el-icon>
          </el-badge>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in notifications" :key="item.id" :command="item.path">
                {{ item.message }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click">
          <div class="user-info">
            <el-avatar :size="32" src="/path/to/default-avatar.png" class="user-avatar" />
            <span class="user-name">管理员</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowDown, Bell } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// Mock notifications data
const notifications = ref([
  { id: 1, message: '【预警】高新区-创新大道88号-墒情过低', path: '/intelligent-analysis/moisture' },
  { id: 2, message: '【预警】城关镇-幸福路12号-作物长势异常', path: '/intelligent-analysis/crop-growth' },
  { id: 3, message: '【预警】开发区-工业一路101号-耕地退化风险', path: '/intelligent-analysis/land-degredation' },
]);

const menuRoutes = computed(() => {
  return router.options.routes.find(r => r.path === '/').children
})

const activeMenu = computed(() => {
  const pathParts = route.path.split('/');
  if (pathParts.length > 2) {
    return `/${pathParts[1]}`;
  }
  return route.path;
})

const isAnalysisActive = computed(() => route.path.startsWith('/intelligent-analysis'));

const navigateTo = (path) => {
  if (path === '/intelligent-analysis') return; // Let the dropdown handle navigation
  router.push(path);
}

const handleAnalysisCommand = (command) => {
  router.push(`/intelligent-analysis/${command}`);
}

const handleNotificationClick = (path) => {
  router.push(path);
}
</script>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as theme;

.app-layout {
  height: 100vh;
}

.app-header {
  background-color: theme.$left-menu-bg;
  border-bottom: 1px solid theme.$border-color;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.header-logo-title {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  width: auto;
  margin-right: 15px;
}

.header-title {
  color: theme.$title-color;
  font-size: 24px;
  font-weight: bold;
}

.header-menu {
  background-color: transparent;
  border-bottom: none;
  height: 100%;
  flex-grow: 1; // Allow menu to take up available space
  margin-left: 50px; // Add space between title and menu

  .el-menu-item {
    color: theme.$left-menu-text-color;
    font-size: 16px;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: theme.$left-menu-active-bg;
      color: #fff;
    }
    &.is-active {
      color: theme.$left-menu-active-text-color;
      border-bottom-color: theme.$primary-accent-color;
      background-color: transparent;
    }
  }
  .el-menu-item > span, .el-dropdown {
    padding: 0 20px;
    display: inline-block;
    height: 100%;
    line-height: 60px; // Match header height
  }
}

.el-dropdown-link {
  color: theme.$left-menu-text-color;
  font-size: 16px;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  outline: none; // Remove focus outline
}

.header-right {
  display: flex;
  align-items: center;
  gap: 25px;
}

.header-icon {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
}

.notification-badge {
  margin-top: 5px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
}

.user-avatar {
  background-color: #fff; /* Fallback for broken image */
}

.user-name {
  color: #fff;
}

.el-dropdown-link.is-active,
.el-dropdown-link:hover {
  color: theme.$primary-accent-color;
}
</style> 