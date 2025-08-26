<template>
  <div class="system-management-container">
    <el-row :gutter="10">
      <!-- User Management Table -->
      <el-col :span="14">
        <DataPanel title="用户管理">
          <el-table :data="users" class="dark-table" height="calc(100vh - 125px)" stripe>
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="realName" label="真实姓名" />
            <el-table-column prop="department" label="所属部门" />
            <el-table-column prop="role" label="角色" />
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column label="操作">
              <el-button size="small">编辑</el-button>
              <el-button size="small" type="danger">删除</el-button>
            </el-table-column>
          </el-table>
        </DataPanel>
      </el-col>

      <!-- Role Permissions -->
      <el-col :span="10">
        <DataPanel title="角色权限设置">
          <div class="role-permission-content">
            <el-menu :default-active="activeRole" @select="handleRoleSelect" class="dark-menu">
              <el-menu-item v-for="role in Object.keys(roles)" :key="role" :index="role">
                <span>{{ role }}</span>
              </el-menu-item>
            </el-menu>
            <div class="tree-container">
              <el-tree
                ref="treeRef"
                :data="permissions"
                show-checkbox
                node-key="id"
                :default-checked-keys="checkedKeys"
                class="dark-tree"
              />
            </div>
          </div>
        </DataPanel>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { userList, permissionTree, rolePermissions } from '@/mock/system.js';
import DataPanel from '@/components/DataPanel.vue';

const users = ref(userList);
const activeRole = ref('管理员');
const roles = ref(rolePermissions);
const permissions = ref(permissionTree);
const treeRef = ref(null);
const checkedKeys = ref(roles.value[activeRole.value]);

const handleRoleSelect = async (role) => {
  activeRole.value = role;
  checkedKeys.value = roles.value[role];
  await nextTick();
  if (treeRef.value) {
    treeRef.value.setCheckedKeys(checkedKeys.value, false);
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/theme.scss' as theme;

.system-management-container {
  padding: 10px;
  height: 100%;
  .el-row {
    height: 100%;
  }
}

.role-permission-content {
  display: flex;
  height: 100%;
}

.tree-container {
  flex-grow: 1;
  overflow: auto;
  padding-left: 10px;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
</style> 