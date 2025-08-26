<template>
  <div class="farmer-management-container">
    <DataPanel>
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="filters.name" placeholder="输入农户姓名/电话" class="filter-input" clearable />
          <el-select v-model="filters.status" placeholder="合作状态" clearable>
            <el-option label="合作中" value="cooperating"></el-option>
            <el-option label="已结束" value="ended"></el-option>
          </el-select>
          <el-button type="primary" :icon="Search">搜索</el-button>
        </div>
        <div>
          <el-button type="primary" @click="handleAdd">新增农户</el-button>
          <el-button type="success" @click="handleImport">导入数据</el-button>
        </div>
      </div>

      <el-table :data="filteredData" class="dark-table" stripe>
        <el-table-column prop="id" label="ID" width="120"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="cooperationStatus" label="合作状态" width="120">
           <template #default="{ row }">
            <el-tag :type="row.cooperationStatus === '合作中' ? 'success' : 'info'">
              {{ row.cooperationStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="加入日期" width="150"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </DataPanel>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
      <el-form :model="form" label-width="100px" class="dark-form">
        <el-form-item label="姓名">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="合作状态">
          <el-radio-group v-model="form.cooperationStatus">
            <el-radio label="合作中"></el-radio>
            <el-radio label="已结束"></el-radio>
          </el-radio-group>
        </el-form-item>
         <el-form-item label="加入日期">
          <el-date-picker
            v-model="form.joinDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import DataPanel from '@/components/DataPanel.vue';
import { Search } from '@element-plus/icons-vue';
import { farmerList } from '@/mock/farmer.js';

const allData = ref(farmerList);
const dialogVisible = ref(false);
const isEdit = ref(false);
const dialogTitle = computed(() => (isEdit.value ? '编辑农户' : '新增农户'));

const form = ref({
  id: null,
  name: '',
  phone: '',
  address: '',
  cooperationStatus: '合作中',
  joinDate: '',
});

const filters = ref({
  name: '',
  status: '',
});

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const nameMatch = filters.value.name ? item.name.includes(filters.value.name) || item.phone.includes(filters.value.name) : true;
    const statusMatch = filters.value.status ? (item.cooperationStatus === (filters.value.status === 'cooperating' ? '合作中' : '已结束')) : true;
    return nameMatch && statusMatch;
  });
});


const handleAdd = () => {
  isEdit.value = false;
  form.value = {
    id: null,
    name: '',
    phone: '',
    address: '',
    cooperationStatus: '合作中',
    joinDate: new Date().toISOString().slice(0, 10),
  };
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEdit.value = true;
  form.value = { ...row };
  dialogVisible.value = true;
};

const handleSubmit = () => {
  if (isEdit.value) {
    const index = allData.value.findIndex(item => item.id === form.value.id);
    if (index !== -1) {
      allData.value[index] = { ...form.value };
    }
  } else {
    const newId = Math.max(...allData.value.map(i => i.id)) + 1;
    allData.value.unshift({ ...form.value, id: newId });
  }
  dialogVisible.value = false;
  ElMessage.success(isEdit.value ? '更新成功' : '新增成功');
};

const handleDelete = (row) => {
   ElMessageBox.confirm(
    `确定要删除农户 "${row.name}" 吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    allData.value = allData.value.filter(item => item.id !== row.id);
    ElMessage.success('删除成功');
  }).catch(() => {
    // a
  });
};

const handleImport = () => {
  ElMessage.info('模拟导入操作，实际应调用上传接口。');
};

</script>

<style scoped>
.farmer-management-container {
  padding: 10px;
  height: 100%;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-input {
  width: 200px;
}
</style> 